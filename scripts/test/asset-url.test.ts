import { describe, it, expect } from 'vitest';
import { assetUrl, previewAssetUrl } from '../src/asset-url';

describe('assetUrl', () => {
  it('encodes CJK path segments', () => {
    expect(assetUrl('assets/call-images/Tokiho/CKG专属派对/专属派对.jpg')).toBe(
      '/assets/call-images/Tokiho/CKG%E4%B8%93%E5%B1%9E%E6%B4%BE%E5%AF%B9/%E4%B8%93%E5%B1%9E%E6%B4%BE%E5%AF%B9.jpg',
    );
  });

  it('encodes spaces in filenames (! stays per encodeURIComponent)', () => {
    expect(assetUrl('assets/call-images/Tokiho/CKG专属派对/Shake it!Shake it!.jpg')).toContain(
      'Shake%20it!Shake%20it!.jpg',
    );
  });

  it('strips leading slashes', () => {
    expect(assetUrl('/assets/x.png')).toBe('/assets/x.png');
  });
});

describe('previewAssetUrl', () => {
  it('maps call-images jpg to call-previews webp', () => {
    expect(previewAssetUrl('assets/call-images/Tokiho/CKG专属派对/专属派对.jpg')).toBe(
      '/assets/call-previews/Tokiho/CKG%E4%B8%93%E5%B1%9E%E6%B4%BE%E5%AF%B9/%E4%B8%93%E5%B1%9E%E6%B4%BE%E5%AF%B9.webp',
    );
  });

  it('maps png to webp', () => {
    expect(previewAssetUrl('assets/call-images/a/b.PNG')).toBe('/assets/call-previews/a/b.webp');
  });
});
