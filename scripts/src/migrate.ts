import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ensureUniqueSlug, slugifyTitle } from './slug.js';
import type { Mix, Release, Song, Stage } from './schema.js';

export type MigrateReport = {
  songs: number;
  mixes: number;
  stages: number;
  releases: number;
  imagesCopied: number;
  imagesMissing: string[];
};

export type MigrateOpts = {
  legacyDir: string;
  contentDir: string;
  imagesSrc: string;
  imagesDest: string;
};

function rewriteImageHref(href: string): string | null {
  const normalized = href.replace(/\\/g, '/');
  const markers = ['call_image/', 'docs/call_image/'];
  for (const marker of markers) {
    const idx = normalized.lastIndexOf(marker);
    if (idx >= 0) {
      const rel = normalized.slice(idx + marker.length);
      return path.posix.join('assets/call-images', rel);
    }
  }
  if (normalized.startsWith('../../../../call_image/')) {
    return path.posix.join(
      'assets/call-images',
      normalized.slice('../../../../call_image/'.length),
    );
  }
  return null;
}

async function pathExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

export async function migrateAll(opts: MigrateOpts): Promise<MigrateReport> {
  const report: MigrateReport = {
    songs: 0,
    mixes: 0,
    stages: 0,
    releases: 0,
    imagesCopied: 0,
    imagesMissing: [],
  };

  await fs.mkdir(opts.contentDir, { recursive: true });
  await fs.mkdir(opts.imagesDest, { recursive: true });
  await fs.mkdir(path.join(opts.contentDir, 'callbooks'), { recursive: true });

  const musicCall = JSON.parse(
    await fs.readFile(path.join(opts.legacyDir, 'music_call.json'), 'utf8'),
  ) as Array<{
    title: string;
    version_list: Array<{
      title: string;
      simple_text?: Record<string, string[]>;
      pic_list?: Array<{ description: string; href: string }>;
    }>;
  }>;

  const songIds = new Set<string>();
  const songs: Song[] = [];

  for (const song of musicCall) {
    const songTitle = song.title?.trim() ? song.title : 'untitled';
    const id = ensureUniqueSlug(slugifyTitle(songTitle) || 'song', songIds);
    const versionIds = new Set<string>();
    const versions = [];

    for (const version of song.version_list ?? []) {
      const versionTitle = version.title?.trim() ? version.title : 'version';
      const vid = ensureUniqueSlug(slugifyTitle(versionTitle) || 'version', versionIds);
      const callbooks = [];

      for (const pic of version.pic_list ?? []) {
        const src = rewriteImageHref(pic.href);
        if (!src) {
          report.imagesMissing.push(pic.href);
          continue;
        }
        const absSrc = path.join(
          opts.imagesSrc,
          src.replace(/^assets\/call-images\//, '').replace(/\//g, path.sep),
        );
        const absDest = path.join(opts.contentDir, src.replace(/\//g, path.sep));
        await fs.mkdir(path.dirname(absDest), { recursive: true });
        if (await pathExists(absSrc)) {
          await fs.copyFile(absSrc, absDest);
          report.imagesCopied += 1;
          callbooks.push({
            format: 'image' as const,
            description: pic.description ?? '',
            src,
          });
        } else {
          report.imagesMissing.push(pic.href);
        }
      }

      versions.push({
        id: vid,
        title: versionTitle,
        ...(version.simple_text ? { summary: version.simple_text } : {}),
        callbooks,
      });
    }

    songs.push({ id, title: songTitle, versions });
  }
  report.songs = songs.length;

  const mixList = JSON.parse(
    await fs.readFile(path.join(opts.legacyDir, 'mix_list.json'), 'utf8'),
  ) as Array<{
    title: string;
    mix_tag_list?: string[];
    text_list?: Array<{ lang: string; text: string; notes?: string }>;
    text_list_size?: number;
    notes?: string;
    link_list?: Array<{ title: string; url: string }>;
  }>;

  const mixIds = new Set<string>();
  const mixes: Mix[] = mixList.map((mix) => {
    const id = ensureUniqueSlug(slugifyTitle(mix.title), mixIds);
    const text_list = (mix.text_list ?? []).map((t) => ({
      lang: t.lang,
      text: t.text,
      notes: t.notes ?? '',
    }));
    return {
      id,
      title: mix.title,
      mix_tag_list: mix.mix_tag_list ?? [],
      text_list,
      text_list_size: mix.text_list_size ?? text_list.length,
      notes: mix.notes ?? '',
      link_list: mix.link_list ?? [],
    };
  });
  report.mixes = mixes.length;

  const stageList = JSON.parse(
    await fs.readFile(path.join(opts.legacyDir, 'stage_list.json'), 'utf8'),
  ) as Array<{
    title: string;
    type: string;
    date: string;
    team: string;
    notes?: string;
    song_title_list?: string[];
  }>;

  const stageIds = new Set<string>();
  const stages: Stage[] = stageList.map((stage) => ({
    id: ensureUniqueSlug(slugifyTitle(stage.title), stageIds),
    title: stage.title,
    type: stage.type,
    date: stage.date,
    team: stage.team,
    notes: stage.notes ?? '',
    song_title_list: stage.song_title_list ?? [],
  }));
  report.stages = stages.length;

  const epList = JSON.parse(
    await fs.readFile(path.join(opts.legacyDir, 'EP_and_album_list.json'), 'utf8'),
  ) as Array<{
    title: string;
    date?: string;
    description?: string[];
    song_title_list?: string[];
  }>;
  const singleList = JSON.parse(
    await fs.readFile(path.join(opts.legacyDir, 'single_list.json'), 'utf8'),
  ) as Array<{
    title: string;
    song_title_list?: string[];
  }>;

  const releaseIds = new Set<string>();
  const releases: Release[] = [
    ...epList.map((ep) => ({
      id: ensureUniqueSlug(slugifyTitle(ep.title), releaseIds),
      title: ep.title,
      kind: 'ep' as const,
      date: ep.date ?? '',
      description: ep.description ?? [],
      song_title_list: ep.song_title_list ?? [],
    })),
    ...singleList.map((s) => ({
      id: ensureUniqueSlug(slugifyTitle(s.title), releaseIds),
      title: s.title,
      kind: 'single-artist' as const,
      date: '',
      description: [],
      song_title_list: s.song_title_list ?? [],
    })),
  ];
  report.releases = releases.length;

  await fs.writeFile(
    path.join(opts.contentDir, 'songs.json'),
    `${JSON.stringify(songs, null, 2)}\n`,
    'utf8',
  );
  await fs.writeFile(
    path.join(opts.contentDir, 'mixes.json'),
    `${JSON.stringify(mixes, null, 2)}\n`,
    'utf8',
  );
  await fs.writeFile(
    path.join(opts.contentDir, 'stages.json'),
    `${JSON.stringify(stages, null, 2)}\n`,
    'utf8',
  );
  await fs.writeFile(
    path.join(opts.contentDir, 'releases.json'),
    `${JSON.stringify(releases, null, 2)}\n`,
    'utf8',
  );
  await fs.writeFile(
    path.join(opts.contentDir, '.migrate-report.json'),
    `${JSON.stringify(report, null, 2)}\n`,
    'utf8',
  );

  return report;
}

async function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const legacyImages = path.join(root, 'docs', 'call_image');
  const contentImages = path.join(root, 'content', 'assets', 'call-images');
  const imagesSrc = (await pathExists(legacyImages)) ? legacyImages : contentImages;
  const report = await migrateAll({
    legacyDir: path.join(root, 'json_files'),
    contentDir: path.join(root, 'content'),
    imagesSrc,
    imagesDest: contentImages,
  });
  console.log(JSON.stringify(report, null, 2));
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain || process.argv[1]?.endsWith('migrate.ts')) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
