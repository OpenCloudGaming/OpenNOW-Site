export type HitKind =
  | 'page'
  | 'heading'
  | 'table row'
  | 'list item'
  | 'card'
  | 'step'
  | 'callout'
  | 'accordion'
  | 'tab'
  | 'code'
  | 'paragraph';

interface OutlineLine {
  anchor: string;
  text: string;
  kind: HitKind;
}

export interface PageOutline {
  headings: Record<string, string>;
  lines: OutlineLine[];
}

const COMPONENT_KIND: Record<string, HitKind> = {
  Card: 'card',
  Step: 'step',
  Callout: 'callout',
  Accordion: 'accordion',
  Tab: 'tab',
};

export function plainText(markdown: string): string {
  return markdown
    .replace(/<\/?mark>/g, '')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\*\*|`/g, '')
    .replace(/\\([\\`*_{}[\]()#+\-.!|<>~&])/g, '$1')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&(amp|lt|gt|quot);/g, (_, name: 'amp' | 'lt' | 'gt' | 'quot') => ({ amp: '&', lt: '<', gt: '>', quot: '"' })[name])
    .replace(/\s+/g, ' ')
    .trim();
}

function normalize(markdown: string): string {
  return plainText(markdown).replace(/\|/g, ' ').replace(/\s+/g, ' ').toLowerCase();
}

function lineKind(line: string, inFence: boolean, openTags: string[]): HitKind {
  if (inFence) return 'code';
  if (line.startsWith('|')) return 'table row';
  if (/^#{1,6}\s/.test(line)) return 'heading';
  if (/^([-*+]|\d+[.)])\s/.test(line)) return 'list item';
  if (line.startsWith('<Card')) return 'card';
  for (let i = openTags.length - 1; i >= 0; i--) {
    const kind = COMPONENT_KIND[openTags[i]];
    if (kind) return kind;
  }
  return 'paragraph';
}

export function parseOutline(markdown: string): PageOutline {
  const headings: Record<string, string> = {};
  const lines: OutlineLine[] = [];
  const openTags: string[] = [];
  let anchor = '';
  let inFence = false;

  for (const raw of markdown.split('\n')) {
    const line = raw.trim();
    if (line.startsWith('```')) {
      inFence = !inFence;
      continue;
    }
    if (!inFence) {
      const heading = /^#{2,6}\s+(.*?)\s*\[#([^\]]+)\]\s*$/.exec(line);
      if (heading) {
        anchor = heading[2];
        headings[anchor] = plainText(heading[1]);
      }
    }
    const tagsOnLine = inFence ? [] : [...line.matchAll(/<(\/?)([A-Z]\w*)\b[^>]*?(\/?)>/g)];
    for (const [, closing, name, selfClosing] of tagsOnLine) {
      if (!closing && !selfClosing) openTags.push(name);
    }
    if (line && !/^\|[\s:|-]+\|$/.test(line)) {
      lines.push({ anchor, text: normalize(line), kind: lineKind(line, inFence, openTags) });
    }
    for (const [, closing, name] of tagsOnLine) {
      if (!closing) continue;
      const index = openTags.lastIndexOf(name);
      if (index !== -1) openTags.splice(index, 1);
    }
  }

  return { headings, lines };
}

export function locateKind(outline: PageOutline, anchor: string, markdown: string): HitKind | undefined {
  const text = normalize(markdown);
  if (!text) return undefined;
  const sameSection = outline.lines.filter((line) => line.anchor === anchor);
  for (const probe of [text.slice(0, 48), text.slice(0, 20)]) {
    for (const pool of [sameSection, outline.lines]) {
      const line = pool.find((candidate) => candidate.text.includes(probe));
      if (line) return line.kind;
    }
  }
  return undefined;
}

const outlines = new Map<string, Promise<PageOutline | null>>();

export function loadOutline(pageUrl: string): Promise<PageOutline | null> {
  let pending = outlines.get(pageUrl);
  if (!pending) {
    const markdownUrl = pageUrl === '/docs' ? '/docs/index.md' : `${pageUrl}.md`;
    pending = fetch(markdownUrl)
      .then((res) => (res.ok ? res.text() : Promise.reject(new Error(`${res.status} ${markdownUrl}`))))
      .then(parseOutline)
      .catch(() => {
        outlines.delete(pageUrl);
        return null;
      });
    outlines.set(pageUrl, pending);
  }
  return pending;
}
