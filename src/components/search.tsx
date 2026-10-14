'use client';
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogOverlay,
  useSearch,
  type SharedProps,
} from 'fumadocs-ui/components/dialog/search';
import { useDocsSearch } from 'fumadocs-core/search/client';
import type { SortedResult } from 'fumadocs-core/search';
import { create } from '@orama/orama';
import { useI18n } from 'fumadocs-ui/contexts/i18n';
import {
  AlignLeft,
  ChevronRight,
  ChevronsUpDown,
  CircleHelp,
  Clapperboard,
  Code,
  Cpu,
  Download,
  FileText,
  Gamepad2,
  Hash,
  Info,
  KeyRound,
  Keyboard,
  Layers,
  List,
  ListOrdered,
  MonitorPlay,
  Network,
  PanelTop,
  Radio,
  Search,
  SlidersHorizontal,
  Table2,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import {
  Fragment,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { track } from '@/lib/analytics';
import {
  FILTERS,
  groupResults,
  highlight,
  inFilter,
  prefixTerms,
  type FilterId,
  type Hit,
  type PageGroup,
} from './search-model';
import { loadOutline, locateKind, type HitKind, type PageOutline } from './search-outline';

function initOrama() {
  return create({
    schema: { _: 'string' },
    // https://docs.orama.com/docs/orama-js/supported-languages
    language: 'english',
  });
}

const PAGE_ICON: Record<string, LucideIcon> = {
  '/docs': MonitorPlay,
  '/docs/guides/getting-started': Download,
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

const KIND_ICON: Record<HitKind, LucideIcon> = {
  page: FileText,
  heading: Hash,
  'table row': Table2,
  'list item': List,
  card: Layers,
  step: ListOrdered,
  callout: Info,
  accordion: ChevronsUpDown,
  tab: PanelTop,
  code: Code,
  paragraph: AlignLeft,
};

interface Row {
  hit: Hit;
  group: PageGroup;
  section: string;
  kind: HitKind | undefined;
}

export default function DefaultSearchDialog(props: SharedProps) {
  const { locale } = useI18n(); // (optional) for i18n
  const { search, setSearch, query } = useDocsSearch({
    type: 'static',
    initOrama,
    locale,
  });

  // Flag executed searches once results settle. Debounced by waiting for the
  // query to finish loading, and de-duplicated per (term, result-count) pair so
  // a single search produces a single event rather than one per keystroke.
  const lastTrackedRef = useRef<string>('');
  useEffect(() => {
    const term = search.trim();
    if (!term || query.isLoading) return;
    const resultsCount = query.data && query.data !== 'empty' ? query.data.length : 0;
    const signature = `${term}::${resultsCount}`;
    if (lastTrackedRef.current === signature) return;
    lastTrackedRef.current = signature;
    track('docs_search_performed', { query: term, results_count: resultsCount });
  }, [search, query.isLoading, query.data]);

  return (
    <SearchDialog search={search} onSearchChange={setSearch} isLoading={query.isLoading} {...props}>
      <SearchDialogOverlay className="bg-[rgb(4_6_12/74%)] backdrop-blur-none" />
      <SearchDialogContent className="top-2 flex w-[calc(100%-16px)] max-w-none flex-col rounded-2xl border-seam bg-palette text-ink shadow-[0_30px_90px_rgba(0,0,0,0.65),0_0_0_1px_rgba(0,0,0,0.4)] max-sm:max-h-[calc(100dvh-16px)] sm:top-[88px] sm:max-h-[min(760px,calc(100dvh-120px))] sm:w-[min(760px,calc(100%-32px))] md:top-[88px]">
        <Palette results={query.data === 'empty' ? undefined : query.data} />
      </SearchDialogContent>
    </SearchDialog>
  );
}

function Palette({ results }: { results: SortedResult[] | undefined }) {
  const { search, onSearchChange, onSelect, isLoading } = useSearch();
  const [filter, setFilter] = useState<FilterId>('all');
  const [active, setActive] = useState(0);
  const listboxId = useId();
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const groups = useMemo(() => (results ? groupResults(results, search) : []), [results, search]);
  const outlines = useOutlines(groups.map((group) => group.url));

  const scoped = groups.filter((group) => inFilter(group, filter));
  const rows = scoped.flatMap((group) =>
    group.hits.map((hit): Row => {
      const outline = outlines[group.url];
      return { hit, group, section: sectionOf(hit, group, outline), kind: kindOf(hit, outline) };
    }),
  );
  const best = rows.filter((row) => !row.hit.partial);
  const partial = rows.filter((row) => row.hit.partial);
  const ordered = [...best, ...partial];
  const activeIndex = Math.min(active, Math.max(ordered.length - 1, 0));
  const optionId = (index: number) => `${listboxId}-option-${index}`;
  const hasQuery = search.trim().length > 0;

  useEffect(() => setActive(0), [results, filter]);

  function open(row: Row, newTab: boolean) {
    if (newTab) {
      window.open(row.hit.url, '_blank', 'noopener');
      return;
    }
    onSelect({ id: row.hit.id, type: row.hit.type, url: row.hit.url, content: row.hit.content });
  }

  function cycleFilter(step: number, focusChip = false) {
    const index = FILTERS.findIndex((item) => item.id === filter);
    const next = (index + step + FILTERS.length) % FILTERS.length;
    setFilter(FILTERS[next].id);
    if (focusChip) chipRefs.current[next]?.focus();
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'Tab' && hasQuery) {
      event.preventDefault();
      event.stopPropagation();
      cycleFilter(event.shiftKey ? -1 : 1);
      return;
    }
    if (ordered.length === 0) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActive((activeIndex + step + ordered.length) % ordered.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      open(ordered[activeIndex], event.ctrlKey || event.metaKey);
    }
  }

  function onChipKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      cycleFilter(1, true);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      cycleFilter(-1, true);
    }
  }

  const rowProps = (row: Row, index: number) => ({
    row,
    id: optionId(index),
    active: index === activeIndex,
    query: search,
    onHover: () => setActive(index),
    onOpen: open,
  });

  let body: ReactNode;
  if (!hasQuery) {
    body = <Notice>Type to search pages, sections and table rows</Notice>;
  } else if (!results) {
    body = <Notice>Searching…</Notice>;
  } else if (ordered.length === 0) {
    body = (
      <Notice>
        No {filter === 'all' ? '' : `${FILTERS.find((item) => item.id === filter)?.label.toLowerCase()} `}results for “
        {search.trim()}”
      </Notice>
    );
  } else {
    const prefixes = prefixTerms(
      partial.map((row) => row.hit),
      search,
    );
    body = (
      <>
        {best.length > 0 && (
          <div className="px-5 pt-3.5 font-mono text-[11px] leading-[14px] font-semibold tracking-[0.08em] text-mint uppercase">
            Best matches
          </div>
        )}
        {scoped.map((group) => {
          const groupRows = best.filter((row) => row.group === group);
          if (groupRows.length === 0) return null;
          return (
            <BestGroup key={group.url} group={group} count={groupRows.length} labelId={`${listboxId}-${group.url}`}>
              {groupRows.map((row) => (
                <BestRow key={row.hit.id} {...rowProps(row, ordered.indexOf(row))} />
              ))}
            </BestGroup>
          );
        })}
        {partial.length > 0 && (
          <div role="group" aria-labelledby={`${listboxId}-partial`} className="pb-1.5">
            <div className="flex items-center gap-2.5 px-3.5 pt-3.5 pb-1 font-mono text-[11px] leading-[14px]">
              <span id={`${listboxId}-partial`} className="font-semibold tracking-[0.08em] text-muted uppercase">
                Partial matches
              </span>
              {prefixes.length > 0 && (
                <span className="truncate text-muted">{prefixes.map((term) => `“${term}”`).join(', ')} prefix</span>
              )}
              <span aria-hidden className="h-px min-w-4 flex-1 bg-seam-soft" />
              <span className="text-muted">{partial.length}</span>
            </div>
            <div className="flex flex-col px-1.5">
              {partial.map((row, i) => (
                <PartialRow key={row.hit.id} {...rowProps(row, best.length + i)} />
              ))}
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-16 shrink-0 items-center gap-3.5 border-b border-seam px-[18px]">
        <Search
          aria-hidden
          strokeWidth={2}
          className={`size-5 shrink-0 text-mint ${isLoading ? 'animate-pulse' : ''}`}
        />
        <input
          role="combobox"
          aria-expanded={hasQuery && ordered.length > 0}
          aria-controls={listboxId}
          aria-activedescendant={hasQuery && ordered.length > 0 ? optionId(activeIndex) : undefined}
          aria-autocomplete="list"
          aria-label="Search docs"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          onKeyDown={onInputKeyDown}
          placeholder="Search docs…"
          className="h-full min-w-0 flex-1 bg-transparent font-sans text-[20px] leading-[26px] font-bold text-ink caret-sky placeholder:font-semibold placeholder:text-muted focus-visible:outline-none!"
        />
        {hasQuery && results && (
          <span className="hidden shrink-0 font-mono text-xs leading-4 whitespace-nowrap text-muted sm:inline">
            {ordered.length} {ordered.length === 1 ? 'result' : 'results'} · {scoped.length}{' '}
            {scoped.length === 1 ? 'page' : 'pages'}
          </span>
        )}
        <SearchDialogClose className="h-[22px] min-w-[22px] shrink-0 rounded-[5px] border border-seam-soft bg-raised px-1.5 font-mono text-[11px] leading-[14px] font-medium text-ink hover:bg-white/12 hover:text-ink">
          Esc
        </SearchDialogClose>
      </div>

      <div className="flex shrink-0 items-center gap-2 border-b border-seam-soft px-[18px] py-3 max-sm:px-3">
        <div
          role="radiogroup"
          aria-label="Filter results"
          className="-m-0.5 flex min-w-0 gap-2 overflow-x-auto p-0.5 [scrollbar-width:none]"
        >
          {FILTERS.map((item, i) => {
            const checked = item.id === filter;
            const count = hasQuery
              ? groups.filter((group) => inFilter(group, item.id)).reduce((sum, group) => sum + group.hits.length, 0)
              : undefined;
            return (
              <button
                key={item.id}
                ref={(element) => {
                  chipRefs.current[i] = element;
                }}
                type="button"
                role="radio"
                aria-checked={checked}
                tabIndex={checked ? 0 : -1}
                onClick={() => setFilter(item.id)}
                onKeyDown={onChipKeyDown}
                className={`inline-flex h-[30px] shrink-0 items-center gap-[7px] rounded-lg border px-[11px] font-sans text-[13px] leading-[18px] transition-colors focus-visible:outline-offset-0! ${
                  checked
                    ? 'border-mint/35 bg-mint/12 font-extrabold text-mint'
                    : 'border-seam-soft bg-white/4 font-bold text-body hover:bg-white/7'
                }`}
              >
                {item.label}
                {count !== undefined && (
                  <span className={`font-mono text-[11px] leading-[14px] font-semibold ${checked ? 'text-mint' : 'text-muted'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="ml-auto hidden shrink-0 items-center gap-2 sm:flex">
          <Kbd>Tab</Kbd>
          <span className="font-mono text-[11px] leading-[14px] text-muted">switch filter</span>
        </div>
      </div>

      <div
        id={listboxId}
        role="listbox"
        aria-label="Search results"
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-1.5 [scrollbar-color:rgb(255_255_255/14%)_transparent] [scrollbar-width:thin]"
      >
        {body}
      </div>

      <div className="flex h-[46px] shrink-0 items-center gap-[18px] border-t border-seam bg-white/2 px-[18px] font-mono text-[11px] leading-[14px] text-muted">
        <KeyHint keys={['↑', '↓']} label="Navigate" className="max-sm:hidden" />
        <KeyHint keys={['↵']} label="Jump to section" className="max-md:hidden" />
        <KeyHint keys={['Ctrl', '↵']} label="Open in new tab" className="max-md:hidden" />
        <KeyHint keys={['Esc']} label="Close" />
        <div className="ml-auto flex items-center gap-[7px] text-muted">
          <img src="/brand/opennow-mark.png" alt="" className="h-2.5 w-auto" />
          OpenNOW Docs
        </div>
      </div>
    </div>
  );
}

function useOutlines(pageUrls: string[]): Record<string, PageOutline> {
  const [outlines, setOutlines] = useState<Record<string, PageOutline>>({});
  const key = pageUrls.join('\n');
  useEffect(() => {
    let live = true;
    for (const url of key ? key.split('\n') : []) {
      void loadOutline(url).then((outline) => {
        if (live && outline) setOutlines((current) => (current[url] ? current : { ...current, [url]: outline }));
      });
    }
    return () => {
      live = false;
    };
  }, [key]);
  return outlines;
}

function sectionOf(hit: Hit, group: PageGroup, outline: PageOutline | undefined): string {
  if (hit.type === 'page') return group.breadcrumbs.join(' / ');
  if (hit.type === 'heading') return `#${hit.anchor}`;
  if (!hit.anchor) return 'Introduction';
  return (
    outline?.headings[hit.anchor] ??
    group.hits.find((other) => other.type === 'heading' && other.anchor === hit.anchor)?.text ??
    `#${hit.anchor}`
  );
}

function kindOf(hit: Hit, outline: PageOutline | undefined): HitKind | undefined {
  if (hit.type === 'page') return 'page';
  if (hit.type === 'heading') return 'heading';
  return outline && locateKind(outline, hit.anchor, hit.content);
}

interface RowProps {
  row: Row;
  id: string;
  active: boolean;
  query: string;
  onHover: () => void;
  onOpen: (row: Row, newTab: boolean) => void;
}

function useOptionHandlers({ row, active, onHover, onOpen }: RowProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (active) ref.current?.scrollIntoView({ block: 'nearest' });
  }, [active]);
  return {
    ref,
    onPointerMove: () => {
      if (!active) onHover();
    },
    onMouseDown: (event: MouseEvent) => event.preventDefault(),
    onClick: (event: MouseEvent) => onOpen(row, event.ctrlKey || event.metaKey),
    onAuxClick: (event: MouseEvent) => {
      if (event.button === 1) onOpen(row, true);
    },
  };
}

function BestGroup({
  group,
  count,
  labelId,
  children,
}: {
  group: PageGroup;
  count: number;
  labelId: string;
  children: ReactNode;
}) {
  const Icon = PAGE_ICON[group.url] ?? FileText;
  return (
    <div role="group" aria-labelledby={labelId}>
      <div className="flex min-w-0 items-center gap-[9px] px-3.5 pt-3.5 pb-1.5">
        <Icon aria-hidden className="size-3.5 shrink-0 text-mint" />
        <span id={labelId} className="truncate font-sans text-[13px] leading-[18px] font-extrabold text-ink">
          {group.title}
        </span>
        {group.breadcrumbs.length > 0 && (
          <span className="truncate font-mono text-[11px] leading-[14px] text-muted max-sm:hidden">
            {group.breadcrumbs.join(' / ')}
          </span>
        )}
        {group.scope === 'historical' && (
          <span className="shrink-0 rounded-[5px] bg-amber/12 px-1.5 py-0.5 font-mono text-[10px] leading-3 font-semibold tracking-[0.08em] text-amber">
            HISTORICAL
          </span>
        )}
        <span className="ml-auto shrink-0 pl-2 font-mono text-[11px] leading-[14px] text-muted">
          {count} {count === 1 ? 'match' : 'matches'}
        </span>
      </div>
      <div className="flex flex-col gap-0.5 px-1.5">{children}</div>
    </div>
  );
}

function BestRow(props: RowProps) {
  const { row, id, active, query } = props;
  const Icon = row.kind ? KIND_ICON[row.kind] : AlignLeft;
  return (
    <div
      id={id}
      role="option"
      aria-selected={active}
      {...useOptionHandlers(props)}
      className={`flex cursor-pointer items-center gap-3 rounded-[10px] border px-3 py-[9px] ${
        active ? 'border-sky/50 bg-sky/7' : 'border-transparent'
      }`}
    >
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
          active ? 'bg-sky/12 text-sky' : 'bg-raised text-muted'
        }`}
      >
        <Icon aria-hidden className="size-[15px]" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
        <span className="truncate font-sans text-[15px] leading-5 font-semibold text-ink">
          <Highlighted text={row.hit.text} query={query} />
        </span>
        <span className="flex min-w-0 items-center gap-[7px] font-mono leading-4">
          <span className="truncate text-xs text-muted">{row.section}</span>
          {row.kind && (
            <>
              <span aria-hidden className="text-xs text-faint">
                ·
              </span>
              <span className="shrink-0 text-[10px] tracking-[0.08em] text-muted uppercase">{row.kind}</span>
            </>
          )}
        </span>
      </span>
      {active && (
        <span className="flex shrink-0 items-center gap-2 font-mono text-xs leading-4 font-semibold text-sky">
          <span className="max-sm:hidden">{row.hit.anchor ? 'Jump to section' : 'Open page'}</span>
          <Kbd>↵</Kbd>
        </span>
      )}
    </div>
  );
}

function PartialRow(props: RowProps) {
  const { row, id, active, query } = props;
  const Icon = row.kind ? KIND_ICON[row.kind] : AlignLeft;
  return (
    <div
      id={id}
      role="option"
      aria-selected={active}
      {...useOptionHandlers(props)}
      className={`flex h-[34px] min-w-0 cursor-pointer items-center gap-[9px] rounded-lg border px-2 sm:px-3.5 ${
        active ? 'border-sky/50 bg-sky/7' : 'border-transparent'
      }`}
    >
      <Icon aria-hidden className={`size-3.5 shrink-0 ${active ? 'text-sky' : 'text-faint'}`} />
      <span className="shrink-0 font-sans text-[13px] leading-[18px] font-extrabold whitespace-nowrap text-body max-sm:max-w-[30%] max-sm:truncate">
        {row.group.title}
      </span>
      <ChevronRight aria-hidden className="size-[13px] shrink-0 text-faint max-sm:hidden" />
      <span className="max-w-[30%] shrink-0 truncate font-mono text-xs leading-4 text-muted max-sm:hidden">
        {row.section}
      </span>
      <span className="min-w-0 flex-1 truncate font-sans text-[13px] leading-5 font-medium text-muted">
        <Highlighted text={row.hit.text} query={query} leadIn={24} />
      </span>
    </div>
  );
}

function Highlighted({ text, query, leadIn }: { text: string; query: string; leadIn?: number }) {
  return highlight(text, query, leadIn).map((segment, i) =>
    segment.match ? (
      <mark key={i} className="rounded-[4px] bg-mint/16 px-0.5 font-extrabold text-mint">
        {segment.text}
      </mark>
    ) : (
      <Fragment key={i}>{segment.text}</Fragment>
    ),
  );
}

function Notice({ children }: { children: ReactNode }) {
  return <div className="px-5 py-10 text-center font-sans text-sm text-muted">{children}</div>;
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-[22px] min-w-[22px] shrink-0 items-center justify-center rounded-[5px] border border-seam-soft bg-raised px-1.5 font-mono text-[11px] leading-[14px] font-medium text-ink">
      {children}
    </kbd>
  );
}

function KeyHint({ keys, label, className = '' }: { keys: string[]; label: string; className?: string }) {
  return (
    <span className={`flex shrink-0 items-center gap-1.5 ${className}`}>
      {keys.map((key) => (
        <Kbd key={key}>{key}</Kbd>
      ))}
      {label}
    </span>
  );
}
