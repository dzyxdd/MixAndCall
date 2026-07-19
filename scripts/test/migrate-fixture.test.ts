import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { migrateAll } from '../src/migrate';
import { validateContent } from '../src/validate';

const here = path.dirname(fileURLToPath(import.meta.url));
const fixtureLegacy = path.join(here, 'fixtures', 'legacy-mini');
const repoRoot = path.resolve(here, '../..');
const realImages = path.join(repoRoot, 'content', 'assets', 'call-images');

describe('migrateAll fixture', () => {
  let tmp: string;

  beforeAll(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'mac-migrate-'));
  });

  afterAll(async () => {
    await fs.rm(tmp, { recursive: true, force: true });
  });

  it('produces slug ids, rewritten image paths, and validates', async () => {
    const contentDir = path.join(tmp, 'content');
    const report = await migrateAll({
      legacyDir: fixtureLegacy,
      contentDir,
      imagesSrc: realImages,
      imagesDest: path.join(contentDir, 'assets', 'call-images'),
    });

    const songs = JSON.parse(
      await fs.readFile(path.join(contentDir, 'songs.json'), 'utf8'),
    ) as Array<{ id: string; versions: Array<{ callbooks: Array<{ src?: string }> }> }>;

    expect(songs.map((s) => s.id)).toContain('石中花-战');
    expect(songs.map((s) => s.id)).toContain('x-girl');
    for (const s of songs) {
      expect(s.id).not.toMatch(/^[a-f0-9]{64}$/);
      for (const v of s.versions) {
        for (const b of v.callbooks) {
          if (b.src) expect(b.src.startsWith('assets/call-images/')).toBe(true);
        }
      }
    }

    expect(report.imagesCopied).toBeGreaterThan(0);
    const result = await validateContent(contentDir);
    expect(result.ok).toBe(true);
  });
});
