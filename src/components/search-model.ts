import type { SortedResult } from 'fumadocs-core/search';
import { plainText } from './search-outline';

export type ScopeId = 'guides' | 'reference' | 'historical';
export type FilterId = 'all' | ScopeId;

/** First matching scope wins; `/*` matches every page below that path. */
const SCOPE_PAGES: [ScopeId, string[]][] = [
  ['historical', ['/docs/reference/webrtc']],
  ['reference', ['/docs/reference/*', '/docs/architecture/*', '/docs/advanced/*']],
  ['guides', ['/docs', '/docs/guides/*', '/docs/development']],
];

export const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'guides', label: 'Guides' },
  { id: 'reference', label: 'Reference' },
  { id: 'historical', label: 'Historical' },
];

function scopeOf(pageUrl: string): ScopeId | undefined {
  return SCOPE_PAGES.find(([, patterns]) =>
    patterns.some((pattern) =>
      pattern.endsWith('/*') ? pageUrl.startsWith(pattern.slice(0, -1)) : pageUrl === pattern,
    ),
  )?.[0];
}

export function inFilter(group: PageGroup, filter: FilterId): boolean {
  return filter === 'all' || group.scope === filter;
}

export interface Hit {
  id: string;
  url: string;
  type: SortedResult['type'];
  /** Markdown as returned by the index, `<mark>` included. */
  content: string;
  text: string;
  anchor: string;
  partial: boolean;
}

export interface PageGroup {
  url: string;
  title: string;
  breadcrumbs: string[];
  scope: ScopeId | undefined;
  hits: Hit[];
}

export function queryTerms(query: string): string[] {
  return Array.from(new Set(query.trim().toLowerCase().split(/\s+/).filter(Boolean)));
}

function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hasWholeWord(text: string, term: string): boolean {
  return new RegExp(`(?<![\\p{L}\\p{N}_])${escapeRegExp(term)}(?![\\p{L}\\p{N}_])`, 'iu').test(text);
}

function containsTerm(text: string, terms: string[]): boolean {
  const lower = text.toLowerCase();
  return terms.some((term) => lower.includes(term));
}

export function groupResults(results: SortedResult[], query: string): PageGroup[] {
  const terms = queryTerms(query);
  const groups = new Map<string, PageGroup>();

  for (const result of results) {
    const [pageUrl, anchor = ''] = result.url.split('#');
    const text = plainText(result.content);
    let group = groups.get(pageUrl);
    if (!group) {
      group = { url: pageUrl, title: text, breadcrumbs: [], scope: scopeOf(pageUrl), hits: [] };
      groups.set(pageUrl, group);
    }
    if (result.type === 'page') {
      group.title = text;
      group.breadcrumbs = result.breadcrumbs ?? [];
      if (!containsTerm(text, terms)) continue;
    }
    group.hits.push({
      id: result.id,
      url: result.url,
      type: result.type,
      content: result.content,
      text,
      anchor,
      partial: !terms.some((term) => hasWholeWord(text, term)),
    });
  }

  return [...groups.values()].filter((group) => group.hits.length > 0);
}

/** Query terms that only matched as the start of a longer word in partial hits. */
export function prefixTerms(hits: Hit[], query: string): string[] {
  return queryTerms(query).filter((term) => hits.some((hit) => hit.text.toLowerCase().includes(term)));
}

export interface Segment {
  text: string;
  match: boolean;
}

/** Splits text into highlighted segments, trimming a long lead-in so the first match stays visible. */
export function highlight(text: string, query: string, leadIn = 40): Segment[] {
  const terms = queryTerms(query);
  if (terms.length === 0) return [{ text, match: false }];
  const term = `(?:${terms.map(escapeRegExp).join('|')})`;
  const pattern = new RegExp(`(${term}(?:[\\s-]+${term})*)`, 'gi');
  let source = text;
  const first = source.search(pattern);
  if (first > leadIn + 8) {
    const cut = source.indexOf(' ', first - leadIn);
    source = `…${source.slice(cut >= 0 && cut < first ? cut + 1 : first)}`;
  }
  return source
    .split(pattern)
    .map((part, i) => ({ text: part, match: i % 2 === 1 }))
    .filter((segment) => segment.text);
}
