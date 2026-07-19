import MiniSearch from 'minisearch';

export type SearchDocument = {
  type: 'song' | 'stage' | 'mix';
  id: string;
  title: string;
  aliases: string[];
  tags: string[];
  body: string;
  href: string;
};

export type SearchHit = {
  type: SearchDocument['type'];
  id: string;
  title: string;
  href: string;
  snippet: string;
};

export function tokenize(text: string): string[] {
  const tokens: string[] = [];
  const ascii = text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  tokens.push(...ascii);
  const cjk = text.match(/[\u3040-\u30ff\u3400-\u9fff]/g) ?? [];
  tokens.push(...cjk);
  for (let i = 0; i < cjk.length - 1; i += 1) {
    tokens.push(cjk[i] + cjk[i + 1]);
  }
  return tokens;
}

type Indexed = SearchDocument & { key: string };

export function createSearchEngine(docs: SearchDocument[]) {
  const mini = new MiniSearch<Indexed>({
    fields: ['title', 'aliases', 'tags', 'body'],
    storeFields: ['type', 'id', 'title', 'href', 'body', 'tags'],
    idField: 'key',
    tokenize: (text) => tokenize(String(text)),
    processTerm: (term) => term.toLowerCase(),
  });
  mini.addAll(docs.map((d) => ({ ...d, key: `${d.type}:${d.id}` })));
  return mini;
}

export function runSearch(
  mini: MiniSearch<Indexed>,
  q: string,
  tag?: string,
): SearchHit[] {
  const query = q.trim();
  if (!query && !tag) return [];

  const results = query
    ? mini.search(query, { prefix: true, fuzzy: 0.2 })
    : [];

  let hits: SearchHit[] = results.map((r) => ({
    type: r.type as SearchDocument['type'],
    id: r.id as string,
    title: r.title as string,
    href: r.href as string,
    snippet: String((r.body as string) || (r.tags as string[] | undefined)?.join(' · ') || '').slice(
      0,
      120,
    ),
  }));

  if (tag) {
    hits = hits.filter((_, i) => {
      const tags = (results[i]?.tags as string[] | undefined) ?? [];
      return tags.includes(tag);
    });
  }

  return hits.slice(0, 30);
}
