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

export async function createGithubIssue(
  env: { GITHUB_TOKEN: string; GITHUB_REPO: string },
  payload: { kind: string; title: string; body: string; contact: string },
): Promise<{ issueUrl: string }> {
  const [owner, repo] = env.GITHUB_REPO.split('/');
  const body = [
    payload.body,
    '',
    `<!-- kind: ${payload.kind} -->`,
    payload.contact ? `联系：${payload.contact}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'mixandcall-submit',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: `[${payload.kind}] ${payload.title}`,
      body,
      labels: ['submission', `kind/${payload.kind}`],
    }),
  });

  if (!res.ok) throw new Error(`github ${res.status}`);
  const data = (await res.json()) as { html_url: string };
  return { issueUrl: data.html_url };
}
