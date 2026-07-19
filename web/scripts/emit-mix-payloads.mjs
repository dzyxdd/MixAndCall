import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const mixesPath = path.join(root, 'content', 'mixes.json');
const destRoot = path.join(root, 'web', 'public', 'data', 'mixes');

function main() {
  if (!fs.existsSync(mixesPath)) {
    console.log(`emit-mix-payloads: missing ${mixesPath}`);
    return;
  }

  /** @type {Array<{ id: string; text_list: unknown }>} */
  const mixes = JSON.parse(fs.readFileSync(mixesPath, 'utf8'));
  fs.mkdirSync(destRoot, { recursive: true });

  // Clear previous payloads so deleted mixes do not linger.
  for (const name of fs.readdirSync(destRoot)) {
    if (name.endsWith('.json')) fs.unlinkSync(path.join(destRoot, name));
  }

  let written = 0;
  for (const mix of mixes) {
    if (!mix?.id) continue;
    const payload = { id: mix.id, text_list: mix.text_list ?? [] };
    const out = path.join(destRoot, `${mix.id}.json`);
    fs.writeFileSync(out, JSON.stringify(payload), 'utf8');
    written++;
  }

  console.log(`emit-mix-payloads: wrote ${written} files → ${destRoot}`);
}

main();
