import { describe, it, expect } from 'vitest';
import { ensureUniqueSlug, slugifyTitle } from '../src/slug';

describe('slugifyTitle', () => {
  it('keeps readable chinese and strips odd spaces', () => {
    expect(slugifyTitle('石中花-战')).toBe('石中花-战');
    expect(slugifyTitle('X GIRL!')).toBe('x-girl');
  });

  it('normalizes ascii titles', () => {
    expect(slugifyTitle('  Twinkle   Twinkle ')).toBe('twinkle-twinkle');
  });
});

describe('ensureUniqueSlug', () => {
  it('disambiguates collisions', () => {
    const used = new Set<string>();
    expect(ensureUniqueSlug('a', used)).toBe('a');
    expect(ensureUniqueSlug('a', used)).toBe('a-2');
  });
});
