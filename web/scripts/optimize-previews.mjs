import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const srcRoot = path.join(root, 'content', 'assets', 'call-images');
const destRoot = path.join(root, 'web', 'public', 'assets', 'call-previews');

const MAX_EDGE = 1280;
const WEBP_QUALITY = 80;
const EXT_RE = /\.(jpe?g|png)$/i;

/** @param {string} dir */
function* walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile() && EXT_RE.test(entry.name)) yield full;
  }
}

function relativePreviewPath(absSrc) {
  const rel = path.relative(srcRoot, absSrc);
  const parsed = path.parse(rel);
  return path.join(parsed.dir, `${parsed.name}.webp`);
}

async function optimizeOne(absSrc) {
  const relOut = relativePreviewPath(absSrc);
  const absOut = path.join(destRoot, relOut);
  const srcStat = fs.statSync(absSrc);

  if (fs.existsSync(absOut)) {
    const outStat = fs.statSync(absOut);
    if (outStat.mtimeMs >= srcStat.mtimeMs) return 'skip';
  }

  fs.mkdirSync(path.dirname(absOut), { recursive: true });
  await sharp(absSrc)
    .rotate()
    .resize({
      width: MAX_EDGE,
      height: MAX_EDGE,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY })
    .toFile(absOut);
  return 'write';
}

async function main() {
  if (!fs.existsSync(srcRoot)) {
    console.log(`optimize-previews: no source at ${srcRoot}`);
    return;
  }

  fs.mkdirSync(destRoot, { recursive: true });

  let written = 0;
  let skipped = 0;
  let failed = 0;

  const files = [...walk(srcRoot)];
  const concurrency = 4;
  let i = 0;

  async function worker() {
    while (i < files.length) {
      const idx = i++;
      const file = files[idx];
      try {
        const result = await optimizeOne(file);
        if (result === 'skip') skipped++;
        else written++;
      } catch (err) {
        failed++;
        console.warn(`optimize-previews: failed ${path.relative(srcRoot, file)}:`, err.message);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  console.log(
    `optimize-previews: ${files.length} images → ${destRoot} (wrote ${written}, skipped ${skipped}, failed ${failed})`,
  );
  if (failed > 0) process.exitCode = 1;
}

main();
