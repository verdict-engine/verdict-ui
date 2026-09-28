import { endpoints, type Field } from "./api-spec";
import { DOC_SECTIONS } from "./doc-sections";
import { DOC_PASSAGES, SYNONYMS } from "./search-corpus";
import { withBase } from "./site";

export interface SearchResult {
  kind: string; // "Docs" or an HTTP method
  title: string;
  snippet: string;
  section?: string; // breadcrumb (docs section title)
  href: string;
}

interface Entry {
  kind: string;
  title: string;
  href: string;
  section?: string;
  titleLc: string;
  hay: string; // full lowercased searchable text (title + body + synonyms)
  sentences: string[]; // for snippet extraction
  fallbackSnippet: string;
}

const SECTION_TITLE = new Map(DOC_SECTIONS);

const STOP = new Set([
  "the", "a", "an", "of", "to", "in", "is", "it", "how", "do", "does", "for", "and", "on", "with", "my",
  "our", "can", "we", "you", "get", "set", "use", "using", "that", "this", "what", "when", "where", "which",
  "are", "be", "or", "if", "as", "at", "by", "from", "about",
]);

const tokenize = (s: string): string[] =>
  s.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length >= 2 && !STOP.has(t));

const stem = (t: string): string => (t.length > 3 && t.endsWith("s") ? t.slice(0, -1) : t);

const splitSentences = (s: string): string[] => s.split(/(?<=[.!?])\s+/).filter((x) => x.trim().length > 0);

// token -> its synonym group, for query expansion.
const SYN = new Map<string, string[]>();
for (const group of SYNONYMS) for (const w of group) SYN.set(w, group);

const fieldNames = (fields?: Field[]): string => (fields ?? []).map((f) => f.name).join(" ");

/** The meaningful, deduped, stemmed words of a query — used to highlight matches on the landing page. */
export function highlightTerms(query: string): string[] {
  return [...new Set(tokenize(query).map(stem))].filter((t) => t.length >= 2);
}

let INDEX: Entry[] | null = null;

/** Build the merged index once: doc passages + every API endpoint. */
function buildIndex(): Entry[] {
  if (INDEX) return INDEX;
  const docs: Entry[] = DOC_PASSAGES.map((p) => ({
    kind: "Docs",
    title: p.title,
    href: withBase(`/docs#${p.section}`),
    section: SECTION_TITLE.get(p.section),
    titleLc: p.title.toLowerCase(),
    hay: `${p.title} ${p.body} ${p.terms ?? ""}`.toLowerCase(),
    sentences: splitSentences(p.body),
    fallbackSnippet: splitSentences(p.body)[0] ?? p.body,
  }));
  const api: Entry[] = endpoints.map((e) => {
    const names = `${fieldNames(e.body)} ${fieldNames(e.query)} ${fieldNames(e.headers)} ${fieldNames(e.responseFields)}`;
    const desc = e.description ?? "";
    return {
      kind: e.method,
      title: e.path,
      href: withBase(`/api-reference#${e.id}`),
      section: e.group,
      titleLc: `${e.method} ${e.path} ${e.summary}`.toLowerCase(),
      hay: `${e.method} ${e.path} ${e.summary} ${desc} ${e.group} ${names}`.toLowerCase(),
      sentences: splitSentences(desc || e.summary),
      fallbackSnippet: e.summary,
    };
  });
  INDEX = [...docs, ...api];
  return INDEX;
}

interface Expanded {
  primary: Set<string>; // the user's own (stemmed) tokens — weighted higher
  all: Set<string>; // primary + synonyms
}

function expand(query: string): Expanded {
  const primary = new Set<string>();
  const all = new Set<string>();
  for (const raw of tokenize(query)) {
    const s = stem(raw);
    primary.add(s);
    all.add(s);
    const group = SYN.get(raw) ?? SYN.get(s);
    if (group) for (const w of group) all.add(stem(w));
  }
  return { primary, all };
}

function scoreEntry(entry: Entry, ex: Expanded, rawQuery: string): number {
  let s = 0;
  if (rawQuery.length >= 3) {
    if (entry.titleLc.includes(rawQuery)) s += 12;
    else if (entry.hay.includes(rawQuery)) s += 6;
  }
  for (const term of ex.all) {
    const primary = ex.primary.has(term);
    if (entry.titleLc.includes(term)) s += primary ? 6 : 3;
    else if (entry.hay.includes(term)) s += primary ? 3 : 1.5;
  }
  // Coverage: reward matching more of what the user actually typed.
  if (ex.primary.size > 0) {
    let hit = 0;
    for (const p of ex.primary) if (entry.hay.includes(p)) hit += 1;
    s += (hit / ex.primary.size) * 4;
    if (hit === 0) return 0; // none of the user's own words matched → not a result
  }
  return s;
}

function snippetFor(entry: Entry, ex: Expanded): string {
  for (const sentence of entry.sentences) {
    const lc = sentence.toLowerCase();
    for (const p of ex.primary) if (lc.includes(p)) return sentence;
  }
  return entry.fallbackSnippet;
}

/** Semantic-ish search over the docs prose and the API. Ranks by term + synonym overlap with snippet. */
export function search(query: string, limit = 10): SearchResult[] {
  const index = buildIndex();
  const q = query.trim().toLowerCase();
  if (!q) {
    // No query: a helpful default — a few docs entries then some endpoints.
    return index
      .slice(0, 6)
      .map((e) => ({ kind: e.kind, title: e.title, snippet: e.fallbackSnippet, section: e.section, href: e.href }));
  }
  const ex = expand(q);
  return index
    .map((entry) => ({ entry, score: scoreEntry(entry, ex, q) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ entry }) => ({
      kind: entry.kind,
      title: entry.title,
      snippet: snippetFor(entry, ex),
      section: entry.section,
      href: entry.href,
    }));
}
