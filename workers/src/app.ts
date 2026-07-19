import { Hono } from 'hono';
import { createSearchEngine, runSearch, type SearchDocument } from './search';
import { createGithubIssue, validateSubmit } from './submit';
import fallbackIndex from '../data/search-index.json';

export type Env = {
  SEARCH_INDEX: KVNamespace;
  GITHUB_TOKEN?: string;
  GITHUB_REPO?: string;
};

export const app = new Hono<{ Bindings: Env }>();

let cachedEngine: ReturnType<typeof createSearchEngine> | null = null;
let cachedRaw = '';

async function getEngine(env: Env) {
  const fromKv = env.SEARCH_INDEX ? await env.SEARCH_INDEX.get('search:v1') : null;
  const raw = fromKv ?? JSON.stringify(fallbackIndex);
  if (raw !== cachedRaw || !cachedEngine) {
    cachedEngine = createSearchEngine(JSON.parse(raw) as SearchDocument[]);
    cachedRaw = raw;
  }
  return cachedEngine;
}

app.get('/api/search', async (c) => {
  const q = c.req.query('q') ?? '';
  const tag = c.req.query('tag') ?? undefined;
  const engine = await getEngine(c.env);
  return c.json({ results: runSearch(engine, q, tag) });
});

app.post('/api/submit', async (c) => {
  const ip = c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? 'unknown';
  const rlKey = `rl:${ip}`;
  if (c.env.SEARCH_INDEX) {
    const count = Number((await c.env.SEARCH_INDEX.get(rlKey)) ?? '0');
    if (count >= 5) return c.json({ ok: false, error: 'rate limited' }, 429);
    await c.env.SEARCH_INDEX.put(rlKey, String(count + 1), { expirationTtl: 3600 });
  }

  let payload: unknown;
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ ok: false, error: 'invalid json' }, 400);
  }

  const parsed = validateSubmit(payload as Parameters<typeof validateSubmit>[0]);
  if (!parsed.ok) return c.json({ ok: false, error: parsed.error }, 400);

  if (!c.env.GITHUB_TOKEN || !c.env.GITHUB_REPO) {
    return c.json({ ok: false, error: 'submit not configured' }, 503);
  }

  try {
    const { issueUrl } = await createGithubIssue(
      { GITHUB_TOKEN: c.env.GITHUB_TOKEN, GITHUB_REPO: c.env.GITHUB_REPO },
      parsed.value,
    );
    return c.json({ ok: true, issueUrl });
  } catch {
    return c.json({ ok: false, error: 'upstream failed' }, 502);
  }
});

app.get('/api/health', (c) => c.json({ ok: true }));
