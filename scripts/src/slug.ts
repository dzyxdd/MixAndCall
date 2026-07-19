/** Human-readable slugs; never SHA256 (legacy Utils.process_string). */

export function slugifyTitle(title: string | null | undefined): string {
  const normalized = String(title ?? '')
    .normalize('NFKC')
    .trim();
  const collapsed = normalized.replace(/\s+/g, ' ');
  const hasCjk = /[\u3040-\u30ff\u3400-\u9fff]/.test(collapsed);

  if (hasCjk) {
    return collapsed
      .replace(/[\/\\?#%*:|"<>\[\]{}&=+]/g, '-')
      .replace(/\s+/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  return collapsed
    .toLowerCase()
    .replace(/[!?.,'"()[\]{}#%&=+]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function ensureUniqueSlug(base: string, used: Set<string>): string {
  let candidate = base || 'item';
  if (!used.has(candidate)) {
    used.add(candidate);
    return candidate;
  }
  let n = 2;
  while (used.has(`${candidate}-${n}`)) n += 1;
  const unique = `${candidate}-${n}`;
  used.add(unique);
  return unique;
}
