'use client';
import type { ComponentProps, ReactNode } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ChevronDown, List } from 'lucide-react';
import Link from 'fumadocs-core/link';
import { usePathname } from 'fumadocs-core/framework';
import { useActiveAnchor, useTOCItems } from 'fumadocs-ui/components/toc';
import { MarkdownCopyButton } from 'fumadocs-ui/layouts/docs/page';
import { useSearchContext } from 'fumadocs-ui/contexts/search';
import { normalizePath, pageIcon, type NavPage } from '@/lib/docs-nav';
import { cn } from '@/lib/cn';
import { GitHubIcon, Kbd, MonoLabel, ghostButtonClass } from '@/components/console/primitives';
import { useDocsNav } from './rail';

const two = (n: number) => String(n).padStart(2, '0');

function useCurrentPage(): { page: NavPage | undefined; pages: NavPage[] } {
  const { pages } = useDocsNav();
  const pathname = normalizePath(usePathname());
  return { page: pages.find((p) => normalizePath(p.url) === pathname), pages };
}

/** H2 entries of the page TOC, numbered like the section headers. */
function useSections() {
  return useTOCItems().filter((item) => item.depth === 2);
}

/** DocsPage container slot. */
export function ConsoleArticle({ className, children, ...props }: ComponentProps<'article'>) {
  return (
    <article
      id="nd-page"
      tabIndex={-1}
      {...props}
      className={cn(
        'flex w-full max-w-[936px] min-w-0 flex-col gap-11 px-5 pt-[26px] pb-11 [grid-area:main] focus:outline-none lg:gap-14 lg:ps-12 lg:pe-14 lg:pt-11 lg:pb-20',
        className,
      )}
    >
      {children}
    </article>
  );
}

function SectionList({ onNavigate }: { onNavigate?: () => void }) {
  const sections = useSections();
  const active = useActiveAnchor();
  return (
    <ol className="flex flex-col gap-0.5">
      {sections.map((item, i) => {
        const isActive = item.url === `#${active}` || (!active && i === 0);
        return (
          <li key={item.url}>
            <a
              href={item.url}
              onClick={onNavigate}
              aria-current={isActive ? 'location' : undefined}
              className="group flex items-start gap-2.5 rounded-sm py-[5px] pe-3.5"
            >
              <span aria-hidden="true" className={cn('w-0.5 self-stretch rounded-sm', isActive && 'bg-mint')} />
              <span aria-hidden="true" className={cn('w-5 shrink-0 font-mono text-[11px] leading-5 font-medium', isActive ? 'text-mint' : 'text-faint')}>{two(i + 1)}</span>
              <span
                className={cn(
                  'min-w-0 flex-1 text-[13px] leading-5',
                  isActive ? 'font-extrabold text-ink' : 'font-semibold text-muted group-hover:text-ink',
                )}
              >
                {item.title}
              </span>
            </a>
          </li>
        );
      })}
    </ol>
  );
}

function scrollToTop(e: React.MouseEvent) {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.getElementById('nd-page')?.focus({ preventScroll: true });
}

/** Right "ON THIS PAGE" panel (TOC main slot), from 1280px up. */
export function ConsoleTocPanel() {
  const sections = useSections();
  const { setOpenSearch } = useSearchContext();
  return (
    <aside aria-label="On this page" className="pe-10 pt-11 [grid-area:toc] max-xl:hidden">
      <div className="sticky top-[108px] flex max-h-[calc(100dvh-128px)] w-[232px] flex-col gap-3.5">
        {sections.length > 0 ? (
          <div className="flex min-h-0 flex-col rounded-xl border border-seam bg-glass pt-3.5 pb-3">
            <div className="flex items-center gap-2 border-b border-seam-soft px-4 pb-3">
              <List aria-hidden="true" className="size-3.5 text-muted" />
              <MonoLabel className="text-muted">On this page</MonoLabel>
            </div>
            <nav aria-label="Sections" className="min-h-0 overflow-y-auto pt-2.5 pb-1.5">
              <SectionList />
            </nav>
            <a href="#" onClick={scrollToTop} className="flex items-center gap-2 border-t border-seam-soft px-4 pt-2.5 font-mono text-[12px] leading-4 font-medium text-muted hover:text-ink">
              <ArrowUp aria-hidden="true" className="size-[13px]" />
              Back to top
            </a>
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => setOpenSearch(true)}
          className="flex items-center gap-3 rounded-xl border border-dashed border-seam px-3.5 py-3 text-start transition-colors hover:border-mint/40"
        >
          <span className="flex gap-1" aria-hidden="true">
            <Kbd>Ctrl</Kbd>
            <Kbd>K</Kbd>
          </span>
          <span className="min-w-0 flex-1 text-[13px] leading-[18px] font-semibold text-muted">Jump to any page, section or table row</span>
        </button>
      </div>
    </aside>
  );
}

/** Mobile/tablet "On this page · N sections" dropdown. Native <details>, so it works without JS. */
export function MobileToc() {
  const sections = useSections();
  if (sections.length === 0) return null;
  const close = (e: React.MouseEvent) => (e.currentTarget.closest('details') as HTMLDetailsElement | null)?.removeAttribute('open');
  return (
    <details className="group/toc rounded-[10px] border border-seam bg-glass xl:hidden">
      <summary className="flex h-[46px] cursor-pointer list-none items-center gap-2.5 px-3.5 [&::-webkit-details-marker]:hidden">
        <List aria-hidden="true" className="size-4 text-mint" />
        <span className="text-[14px] leading-[18px] font-extrabold text-ink">On this page</span>
        <span className="font-mono text-[11px] leading-[14px] font-medium text-muted">{sections.length} sections</span>
        <ChevronDown aria-hidden="true" className="ms-auto size-4 text-muted transition-transform group-open/toc:rotate-180" strokeWidth={2} />
      </summary>
      <nav aria-label="Sections" className="border-t border-seam-soft pt-2 pb-2">
        <div onClick={close}>
          <SectionList />
        </div>
      </nav>
    </details>
  );
}

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  markdownUrl: string;
  githubUrl: string;
}

/** Icon tile, "SECTION / PAGE 02 OF 13", H1, lead, page actions and section count. */
export function ConsolePageHeader({ title, description, markdownUrl, githubUrl }: PageHeaderProps) {
  const { page, pages } = useCurrentPage();
  const sections = useSections();
  const Icon = pageIcon(page?.url ?? '');
  const historical = page?.subtitle ? /historical/i.test(page.subtitle) : false;
  return (
    <header className="flex flex-col gap-3 border-b border-seam-soft pb-6 lg:gap-4 lg:pb-[30px]">
      <div className="grid grid-cols-[48px_minmax(0,1fr)] items-center gap-x-3.5 gap-y-3 lg:grid-cols-[76px_minmax(0,1fr)] lg:gap-x-6 lg:gap-y-2">
        <span
          aria-hidden="true"
          className="col-start-1 row-start-1 inline-flex size-12 items-center justify-center rounded-[13px] border border-mint/30 bg-[linear-gradient(160deg,rgb(86_230_165/20%),rgb(86_230_165/4%))] text-mint shadow-[0_0_40px_rgb(86_230_165/12%)] lg:row-span-2 lg:size-[76px] lg:rounded-[20px]"
        >
          <Icon className="size-6 lg:size-9" strokeWidth={1.6} />
        </span>
        {page ? (
          <p className="col-start-2 row-start-1 flex flex-wrap items-center gap-[9px] lg:self-end">
            <MonoLabel className="text-mint">{page.section ?? 'Docs'}</MonoLabel>
            <span aria-hidden="true" className="font-mono text-[11px] text-faint">
              /
            </span>
            <MonoLabel className="text-muted">
              Page {two(page.index)} of {two(pages.length)}
            </MonoLabel>
            {historical ? (
              <span className="rounded-[5px] border border-amber/25 bg-amber/12 px-[7px] py-[3px] font-mono text-[10px] leading-3 font-semibold tracking-[0.08em] text-amber">
                HISTORICAL
              </span>
            ) : null}
          </p>
        ) : null}
        <h1 className="col-span-2 row-start-2 text-[34px] leading-10 font-black tracking-[-0.02em] text-ink lg:col-span-1 lg:col-start-2 lg:self-start lg:text-[52px] lg:leading-[58px] lg:tracking-[-0.025em]">
          {title}
        </h1>
      </div>
      {description ? <p className="max-w-[700px] text-[16px] leading-6 text-lead lg:text-[19px] lg:leading-[29px]">{description}</p> : null}
      <div className="flex items-center gap-2.5 pt-1 lg:pt-1.5">
        <MarkdownCopyButton markdownUrl={markdownUrl} className={cn(ghostButtonClass, 'max-lg:h-8')}>
          Copy Markdown
        </MarkdownCopyButton>
        <a href={githubUrl} target="_blank" rel="noreferrer noopener" className={cn(ghostButtonClass, 'max-lg:h-8')}>
          <GitHubIcon className="size-3.5 text-body" />
          <span className="lg:hidden">GitHub</span>
          <span className="max-lg:hidden">Open in GitHub</span>
        </a>
        {sections.length > 0 ? (
          <span className="ms-auto font-mono text-[12px] leading-4 font-medium text-muted max-lg:hidden">{sections.length} sections</span>
        ) : null}
      </div>
    </header>
  );
}

function PagerCard({ page, dir }: { page: NavPage; dir: 'prev' | 'next' }) {
  const next = dir === 'next';
  return (
    <Link
      href={page.url}
      rel={next ? 'next' : 'prev'}
      className={cn(
        'flex flex-1 flex-col gap-1.5 rounded-xl border bg-glass px-5 py-4 transition-colors hover:bg-white/[0.05]',
        next ? 'border-mint/28 hover:border-mint/50 lg:items-end lg:text-end' : 'border-seam hover:border-white/25',
      )}
    >
      <span className="flex items-center gap-2">
        {next ? null : <ArrowLeft aria-hidden="true" className="size-3.5 text-muted" />}
        <MonoLabel className="text-muted">{next ? 'Next' : 'Previous'}</MonoLabel>
        {next ? <ArrowRight aria-hidden="true" className="size-3.5 text-mint" /> : null}
      </span>
      <span className="text-[18px] leading-6 font-extrabold text-ink">{page.title}</span>
      <span className="font-mono text-[12px] leading-4 font-medium text-muted">{page.section ?? 'Docs'}</span>
    </Link>
  );
}

/** Footer slot: PREVIOUS / NEXT cards in page-tree order. */
export function ConsolePager() {
  const { page, pages } = useCurrentPage();
  if (!page) return null;
  const prev = pages[page.index - 2];
  const next = pages[page.index];
  return (
    <nav aria-label="Pages" className="flex gap-3 border-t border-seam-soft pt-2 max-lg:flex-col lg:pt-4">
      {prev ? <PagerCard page={prev} dir="prev" /> : <span className="flex-1 max-lg:hidden" />}
      {next ? <PagerCard page={next} dir="next" /> : <span className="flex-1 max-lg:hidden" />}
    </nav>
  );
}

export function NoTocPopover() {
  return null;
}
