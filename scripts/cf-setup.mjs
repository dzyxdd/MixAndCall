/**
 * Cloudflare bootstrap after `npx wrangler login`.
 *
 * Usage:
 *   node scripts/cf-setup.mjs
 *   node scripts/cf-setup.mjs --deploy
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const wranglerToml = path.join(root, 'workers', 'wrangler.toml');
const indexPath = path.join(root, 'workers', 'data', 'search-index.json');
const workersDir = path.join(root, 'workers');
const doDeploy = process.argv.includes('--deploy');

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, {
    cwd: opts.cwd ?? root,
    encoding: 'utf8',
    shell: process.platform === 'win32',
    stdio: opts.stdio ?? 'pipe',
  });
  const out = `${res.stdout || ''}${res.stderr || ''}`;
  if (res.status !== 0) {
    const err = new Error(`${cmd} ${args.join(' ')} failed:\n${out.trim()}`);
    err.out = out;
    throw err;
  }
  return out;
}

function extractJsonArray(text) {
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start < 0 || end < start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

function readTomlKvId() {
  const text = fs.readFileSync(wranglerToml, 'utf8');
  const m = text.match(/binding = "SEARCH_INDEX"[\s\S]*?^id = "([^"]+)"/m);
  return m?.[1] && m[1] !== 'REPLACE_AFTER_CREATE' ? m[1] : null;
}

function listKv() {
  const out = run('npx', ['wrangler', 'kv', 'namespace', 'list'], { cwd: workersDir });
  return extractJsonArray(out) ?? [];
}

function ensureIndex() {
  if (!fs.existsSync(indexPath)) {
    console.log('building search index…');
    run('npm', ['run', 'build:index']);
  }
}

function createOrFindKv() {
  const fromToml = readTomlKvId();
  if (fromToml) {
    console.log(`using KV id from wrangler.toml: ${fromToml}`);
    return fromToml;
  }

  console.log('listing KV namespaces…');
  const namespaces = listKv();
  const hit = namespaces.find((n) => n.title === 'SEARCH_INDEX');
  if (hit?.id) {
    console.log(`reusing KV namespace ${hit.id}`);
    return hit.id;
  }

  console.log('creating KV namespace SEARCH_INDEX…');
  try {
    const created = run(
      'npx',
      ['wrangler', 'kv', 'namespace', 'create', 'SEARCH_INDEX'],
      { cwd: workersDir },
    );
    console.log(created);
    const match = created.match(/id\s*=\s*"([^"]+)"/i) || created.match(/"id":\s*"([^"]+)"/);
    if (!match) throw new Error('could not parse KV id from create output');
    return match[1];
  } catch (e) {
    if (/already exists/i.test(e.out || e.message || '')) {
      const again = listKv().find((n) => n.title === 'SEARCH_INDEX');
      if (again?.id) return again.id;
    }
    throw e;
  }
}

function patchToml(kvId) {
  let text = fs.readFileSync(wranglerToml, 'utf8');
  if (text.includes(`id = "${kvId}"`)) {
    console.log('wrangler.toml already has KV id');
    return;
  }
  if (!text.includes('REPLACE_AFTER_CREATE')) {
    text = text.replace(
      /(binding = "SEARCH_INDEX"\s*\n)id = "[^"]+"/,
      `$1id = "${kvId}"`,
    );
  } else {
    text = text.replace(/id = "REPLACE_AFTER_CREATE"/, `id = "${kvId}"`);
  }
  fs.writeFileSync(wranglerToml, text);
  console.log(`patched workers/wrangler.toml with KV id ${kvId}`);
}

function uploadIndex() {
  ensureIndex();
  console.log('uploading search:v1 to KV…');
  run(
    'npx',
    [
      'wrangler',
      'kv',
      'key',
      'put',
      'search:v1',
      '--binding=SEARCH_INDEX',
      `--path=${indexPath}`,
      '--remote',
    ],
    { cwd: workersDir },
  );
  console.log('KV upload done');
}

function ensurePagesProject() {
  console.log('ensuring Pages project mixandcall…');
  try {
    run('npx', [
      'wrangler',
      'pages',
      'project',
      'create',
      'mixandcall',
      '--production-branch=master',
    ]);
  } catch (e) {
    console.log(`pages project create skipped: ${(e.message || '').split('\n')[0]}`);
  }
}

function deployAll() {
  console.log('building web…');
  run('npm', ['run', 'build:web'], { stdio: 'inherit' });
  // API runs as Pages Functions at /api/* (no workers.dev subdomain needed)
  console.log('deploying Pages (+ /api Functions)…');
  run(
    'npx',
    ['wrangler', 'pages', 'deploy', 'dist', '--project-name=mixandcall'],
    { cwd: path.join(root, 'web'), stdio: 'inherit' },
  );
}

function main() {
  console.log('checking Cloudflare auth…');
  const who = run('npx', ['wrangler', 'whoami'], { cwd: workersDir });
  if (/not authenticated/i.test(who)) {
    console.error('Not logged in. Run: npm run cf:login');
    process.exit(1);
  }
  console.log(who.trim());

  const kvId = createOrFindKv();
  patchToml(kvId);
  ensurePagesProject();
  uploadIndex();

  if (doDeploy) {
    deployAll();
    console.log('\nDeploy finished.');
    console.log('API base: https://mixandcall.pages.dev/api/health');
    console.log('Set submit secret once (if not already):');
    console.log('  npx wrangler pages secret put GITHUB_TOKEN --project-name=mixandcall');
    console.log('Bind domain in Cloudflare Pages → Custom domains.');
  } else {
    console.log('\nKV ready. Deploy with:');
    console.log('  npm run cf:deploy');
  }
}

main();
