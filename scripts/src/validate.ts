import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  MixesFileSchema,
  ReleasesFileSchema,
  SongsFileSchema,
  StagesFileSchema,
  type Song,
  type Stage,
  type Release,
} from './schema.js';

export type ValidationResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

async function exists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

export async function validateContent(contentDir: string): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  const readJson = async (name: string) =>
    JSON.parse(await fs.readFile(path.join(contentDir, name), 'utf8'));

  let songs: Song[] = [];
  try {
    songs = SongsFileSchema.parse(await readJson('songs.json'));
  } catch (e) {
    errors.push(`songs.json: ${e instanceof Error ? e.message : String(e)}`);
  }

  try {
    MixesFileSchema.parse(await readJson('mixes.json'));
  } catch (e) {
    errors.push(`mixes.json: ${e instanceof Error ? e.message : String(e)}`);
  }

  let stages: Stage[] = [];
  try {
    stages = StagesFileSchema.parse(await readJson('stages.json'));
  } catch (e) {
    errors.push(`stages.json: ${e instanceof Error ? e.message : String(e)}`);
  }

  let releases: Release[] = [];
  try {
    releases = ReleasesFileSchema.parse(await readJson('releases.json'));
  } catch (e) {
    errors.push(`releases.json: ${e instanceof Error ? e.message : String(e)}`);
  }

  for (const song of songs) {
    for (const version of song.versions) {
      for (const book of version.callbooks) {
        if (book.format === 'image') {
          const abs = path.join(contentDir, book.src);
          if (!(await exists(abs))) {
            errors.push(`missing image: ${book.src} (song ${song.id})`);
          }
        } else {
          const abs = path.join(contentDir, book.path);
          if (!(await exists(abs))) {
            errors.push(`missing callbook: ${book.path} (song ${song.id})`);
          }
        }
      }
    }
  }

  const titles = new Set(songs.map((s) => s.title));
  for (const stage of stages) {
    for (const t of stage.song_title_list) {
      if (!titles.has(t)) {
        warnings.push(`stage "${stage.title}" references unknown song title "${t}"`);
      }
    }
  }
  for (const release of releases) {
    for (const t of release.song_title_list) {
      if (!titles.has(t)) {
        warnings.push(`release "${release.title}" references unknown song title "${t}"`);
      }
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}

async function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const result = await validateContent(path.join(root, 'content'));
  if (result.warnings.length) {
    console.warn(`warnings: ${result.warnings.length}`);
    for (const w of result.warnings.slice(0, 20)) console.warn(`- ${w}`);
    if (result.warnings.length > 20) console.warn(`... +${result.warnings.length - 20} more`);
  }
  if (!result.ok) {
    console.error(`errors: ${result.errors.length}`);
    for (const e of result.errors) console.error(`- ${e}`);
    process.exit(1);
  }
  console.log('validate ok');
}

const entry = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (entry.endsWith('validate.ts') || entry.endsWith('validate.js')) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
