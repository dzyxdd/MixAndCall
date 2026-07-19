/** Encode each path segment for reliable static asset URLs (CJK, spaces, !). */
export function assetUrl(src: string): string {
  const clean = src.replace(/^\/+/, '');
  return `/${clean.split('/').map(encodeURIComponent).join('/')}`;
}

/**
 * Map a call-images src to the build-time WebP preview path.
 * `assets/call-images/a/b.jpg` → `/assets/call-previews/a/b.webp`
 */
export function previewAssetUrl(src: string): string {
  const clean = src.replace(/^\/+/, '');
  const preview = clean
    .replace(/^assets\/call-images\//, 'assets/call-previews/')
    .replace(/\.(jpe?g|png)$/i, '.webp');
  return assetUrl(preview);
}
