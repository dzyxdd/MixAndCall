import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export type CallBookRef =
  | { format: 'image'; description: string; src: string }
  | { format: 'table'; description: string; path: string }
  | { format: 'flow'; description: string; path: string };

export type Song = {
  id: string;
  title: string;
  versions: Array<{
    id: string;
    title: string;
    summary?: Record<string, string[]>;
    callbooks: CallBookRef[];
  }>;
};

export type Mix = {
  id: string;
  title: string;
  mix_tag_list: string[];
  text_list: Array<{ lang: string; text: string; notes?: string }>;
  text_list_size: number;
  notes: string;
  link_list: Array<{ title: string; url: string }>;
};

export type Stage = {
  id: string;
  title: string;
  type: string;
  date: string;
  team: string;
  notes: string;
  song_title_list: string[];
};

export type Release = {
  id: string;
  title: string;
  kind: 'ep' | 'album' | 'single-artist';
  date: string;
  description: string[];
  song_title_list: string[];
};

const contentDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../content',
);

function readJson<T>(name: string): T {
  return JSON.parse(fs.readFileSync(path.join(contentDir, name), 'utf8')) as T;
}

let songsCache: Song[] | null = null;
let mixesCache: Mix[] | null = null;
let stagesCache: Stage[] | null = null;
let releasesCache: Release[] | null = null;

export function getSongs(): Song[] {
  songsCache ??= readJson<Song[]>('songs.json');
  return songsCache;
}

export function getSong(id: string): Song | undefined {
  return getSongs().find((s) => s.id === id);
}

export function getSongByTitle(title: string): Song | undefined {
  return getSongs().find((s) => s.title === title);
}

export function getMixes(): Mix[] {
  mixesCache ??= readJson<Mix[]>('mixes.json');
  return mixesCache;
}

export function getMix(id: string): Mix | undefined {
  return getMixes().find((m) => m.id === id);
}

export function getStages(): Stage[] {
  stagesCache ??= readJson<Stage[]>('stages.json');
  return stagesCache;
}

export function getStage(id: string): Stage | undefined {
  return getStages().find((s) => s.id === id);
}

export function getReleases(): Release[] {
  releasesCache ??= readJson<Release[]>('releases.json');
  return releasesCache;
}

export function contentPath(...parts: string[]): string {
  return path.join(contentDir, ...parts);
}
