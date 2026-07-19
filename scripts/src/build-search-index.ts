import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Mix, Song, Stage } from './schema.js';

export type SearchDocument = {
  type: 'song' | 'stage' | 'mix';
  id: string;
  title: string;
  aliases: string[];
  tags: string[];
  body: string;
  href: string;
};

export function extractAliases(title: string): string[] {
  const aliases: string[] = [];
  const re = /\[\s*([^\]]+?)\s*\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(title))) aliases.push(m[1]);
  return aliases;
}

export function buildSearchIndex(contentDir: string): SearchDocument[] {
  const songs = JSON.parse(
    fs.readFileSync(path.join(contentDir, 'songs.json'), 'utf8'),
  ) as Song[];
  const mixes = JSON.parse(
    fs.readFileSync(path.join(contentDir, 'mixes.json'), 'utf8'),
  ) as Mix[];
  const stages = JSON.parse(
    fs.readFileSync(path.join(contentDir, 'stages.json'), 'utf8'),
  ) as Stage[];

  const docs: SearchDocument[] = [];

  for (const song of songs) {
    docs.push({
      type: 'song',
      id: song.id,
      title: song.title,
      aliases: extractAliases(song.title),
      tags: [],
      body: '',
      href: `/songs/${encodeURI(song.id)}/`,
    });
  }

  for (const stage of stages) {
    docs.push({
      type: 'stage',
      id: stage.id,
      title: stage.title,
      aliases: extractAliases(stage.title),
      tags: [stage.team, stage.type].filter(Boolean),
      body: '',
      href: `/songs/#stage-${encodeURI(stage.id)}`,
    });
  }

  for (const mix of mixes) {
    docs.push({
      type: 'mix',
      id: mix.id,
      title: mix.title,
      aliases: extractAliases(mix.title),
      tags: mix.mix_tag_list ?? [],
      body: (mix.text_list ?? []).map((t) => t.text).join('\n'),
      href: `/mixes/${encodeURI(mix.id)}/`,
    });
  }

  return docs;
}

async function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const contentDir = path.join(root, 'content');
  const docs = buildSearchIndex(contentDir);
  const outDir = path.join(root, 'workers', 'data');
  await fsp.mkdir(outDir, { recursive: true });
  const outFile = path.join(outDir, 'search-index.json');
  await fsp.writeFile(outFile, `${JSON.stringify(docs)}\n`, 'utf8');
  const webData = path.join(root, 'web', 'public', 'search-index.json');
  await fsp.mkdir(path.dirname(webData), { recursive: true });
  await fsp.copyFile(outFile, webData);
  console.log(`wrote ${docs.length} docs -> ${outFile}`);
}

const entry = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (entry.endsWith('build-search-index.ts') || entry.endsWith('build-search-index.js')) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
