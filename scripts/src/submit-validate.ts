export type SubmitPayload = {
  kind: string;
  title: string;
  body: string;
  contact?: string;
  website?: string;
};

export type SubmitValidation =
  | { ok: true; value: { kind: string; title: string; body: string; contact: string } }
  | { ok: false; error: string };

const KINDS = new Set(['mix', 'callbook', 'fix', 'other']);

export function validateSubmit(input: SubmitPayload): SubmitValidation {
  if (input.website) return { ok: false, error: 'rejected' };
  if (!KINDS.has(input.kind)) return { ok: false, error: 'invalid kind' };
  const title = (input.title ?? '').trim();
  const body = (input.body ?? '').trim();
  if (title.length < 2 || title.length > 120) return { ok: false, error: 'invalid title' };
  if (body.length < 10 || body.length > 8000) return { ok: false, error: 'invalid body' };
  return {
    ok: true,
    value: { kind: input.kind, title, body, contact: (input.contact ?? '').trim() },
  };
}
