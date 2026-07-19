import { describe, it, expect } from 'vitest';
import { validateSubmit } from '../src/submit-validate';

describe('validateSubmit', () => {
  it('accepts a normal mix submission', () => {
    const r = validateSubmit({
      kind: 'mix',
      title: '测试mix',
      body: '这是一段足够长的正文内容。',
    });
    expect(r.ok).toBe(true);
  });

  it('rejects honeypot', () => {
    const r = validateSubmit({
      kind: 'mix',
      title: '测试mix',
      body: '这是一段足够长的正文内容。',
      website: 'http://spam',
    });
    expect(r.ok).toBe(false);
  });

  it('rejects short body', () => {
    const r = validateSubmit({ kind: 'fix', title: '纠错', body: '太短' });
    expect(r.ok).toBe(false);
  });
});
