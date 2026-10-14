import { isValidElement, type ReactNode } from 'react';
import type * as PageTree from 'fumadocs-core/page-tree';
import {
  BookMarked,
  CircleHelp,
  Clapperboard,
  Compass,
  Cpu,
  Download,
  FileText,
  FlaskConical,
  Gamepad2,
  KeyRound,
  Keyboard,
  Layers,
  MonitorPlay,
  Network,
  Radio,
  SlidersHorizontal,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

/** Rail and page-header icons, per Design B. Chrome only; page content is untouched. */
const PAGE_ICONS: Record<string, LucideIcon> = {
  '/docs': MonitorPlay,
  '/docs/guides/getting-started': Download,
  '/docs/guides/ports-and-team': Users,
  '/docs/guides/troubleshooting': CircleHelp,
  '/docs/guides/nintendo-switch': Gamepad2,
  '/docs/development': Wrench,
  '/docs/architecture/overview': Network,
  '/docs/reference/authentication': KeyRound,
  '/docs/reference/webrtc': Radio,
  '/docs/reference/native-streamer': Cpu,
  '/docs/reference/media': Clapperboard,
  '/docs/reference/input': Keyboard,
  '/docs/reference/configuration': SlidersHorizontal,
  '/docs/advanced/streamer-investigation': Layers,
};

const SECTION_ICONS: Record<string, LucideIcon> = {
  Guides: Compass,
  Architecture: Network,
  Reference: BookMarked,
  Advanced: FlaskConical,
};

export const pageIcon = (url: string): LucideIcon => PAGE_ICONS[url] ?? FileText;
export const sectionIcon = (section: string): LucideIcon => SECTION_ICONS[section] ?? FileText;

export interface NavPage {
  url: string;
  title: string;
  /** Title without a trailing parenthetical, which becomes `subtitle` ("Protocol notes" / "historical WebRTC"). */
  label: string;
  subtitle?: string;
  description?: string;
  /** Folder the page lives in, or null for root pages. */
  section: string | null;
  /** 1-based position in the page tree. */
  index: number;
}

export interface NavGroup {
  section: string | null;
  pages: NavPage[];
}

export interface DocsNav {
  groups: NavGroup[];
  pages: NavPage[];
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", apos: "'" };
function decodeHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&(amp|lt|gt|quot|#39|apos);/g, (_, name: string) => ENTITIES[name]);
}

/** Plain text of a page-tree name (the client loader deserializes names into React nodes). */
export function nodeText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join('');
  if (isValidElement<{ children?: ReactNode; dangerouslySetInnerHTML?: { __html: string } }>(node)) {
    const html = node.props.dangerouslySetInnerHTML?.__html;
    if (html !== undefined) return decodeHtml(html);
    return nodeText(node.props.children);
  }
  return '';
}

function splitTitle(title: string): { label: string; subtitle?: string } {
  const match = /^(.+?)\s+\(([^)]+)\)$/.exec(title);
  return match ? { label: match[1], subtitle: match[2] } : { label: title };
}

/**
 * Flattens the page tree in meta.json order. Root pages that follow a folder stay in that
 * folder's visual group (Development Guide sits under Guides in the rail) but keep `section: null`.
 */
export function buildDocsNav(tree: PageTree.Root): DocsNav {
  const groups: NavGroup[] = [];
  const pages: NavPage[] = [];

  const add = (node: PageTree.Item, section: string | null, group: NavGroup) => {
    const title = nodeText(node.name);
    const page: NavPage = {
      url: node.url,
      title,
      ...splitTitle(title),
      description: nodeText(node.description) || undefined,
      section,
      index: pages.length + 1,
    };
    pages.push(page);
    group.pages.push(page);
  };

  for (const node of tree.children) {
    if (node.type === 'folder') {
      const section = nodeText(node.name);
      const group: NavGroup = { section, pages: [] };
      groups.push(group);
      if (node.index) add(node.index, section, group);
      for (const child of node.children) if (child.type === 'page') add(child, section, group);
    } else if (node.type === 'page') {
      const group = groups.at(-1) ?? (groups.push({ section: null, pages: [] }), groups[0]);
      add(node, null, group);
    }
  }

  return { groups, pages };
}

export function normalizePath(path: string): string {
  return path.length > 1 ? path.replace(/\/$/, '') : path;
}
