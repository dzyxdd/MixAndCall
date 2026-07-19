import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import { buildSearchIndex, extractAliases } from '../src/build-search-index';

const contentDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../content');

describe('buildSearchIndex', () => {
  it('indexes mix body and tags', () => {
    const docs = buildSearchIndex(contentDir);
    const mix = docs.find((d) => d.type === 'mix' && d.title.includes('英语mix'));
    expect(mix).toBeTruthy();
    expect(mix!.body).toMatch(/Taiga|taiga|タイガー|虎/i);
    expect(mix!.tags).toContain('言语mix');
  });

  it('keeps song body empty', () => {
    const docs = buildSearchIndex(contentDir);
    const song = docs.find((d) => d.type === 'song');
    expect(song?.body).toBe('');
  });

  it('extracts aliases from brackets', () => {
    expect(extractAliases('英语mix [ スタンダードmix ] [ 英語mix ]')).toEqual([
      'スタンダードmix',
      '英語mix',
    ]);
  });
});
