'use client';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { X } from 'lucide-react';
import Link from 'fumadocs-core/link';
import { usePathname } from 'fumadocs-core/framework';
import { useTreeContext } from 'fumadocs-ui/contexts/tree';
import { useSidebar } from 'fumadocs-ui/layouts/docs/slots/sidebar';
import { buildDocsNav, normalizePath, pageIcon, sectionIcon, type NavPage } from '@/lib/docs-nav';
import { releases } from '@/lib/releases.gen';
import { cn } from '@/lib/cn';
import { BrandLockup } from '@/components/console/brand';
import { CommandField } from '@/components/console/top-bar';
import { MonoLabel, StatusDot, iconButtonClass } from '@/components/console/primitives';

export const DRAWER_ID = 'console-nav-drawer';

export function useDocsNav() {
  const { full } = useTreeContext();
  return useMemo(() => buildDocsNav(full), [full]);
}

function RailItem({ page, active, big }: { page: NavPage; active: boolean; big: boolean }) {
  const Icon = pageIcon(page.url);
  return (
    <Link
      href={page.url}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group flex items-center gap-2.5 rounded-[9px] transition-colors focus-visible:shadow-[0_0_0_2px_var(--color-sky)] focus-visible:outline-none',
        big ? 'min-h-11 py-2 pe-3' : 'min-h-9 py-[7px] pe-2.5',
        active ? 'bg-mint/9' : 'hover:bg-white/5',
      )}
    >
      <span aria-hidden="true" className={cn('w-[3px] shrink-0 rounded-sm', big ? 'h-[22px]' : 'h-[18px]', active && 'bg-mint')} />
      <Icon
        aria-hidden="true"
        strokeWidth={1.75}
        className={cn('shrink-0', big ? 'size-[18px]' : 'size-4', active ? 'text-mint' : 'text-muted group-hover:text-body')}
      />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className={cn(
            big ? 'text-[15px] leading-5' : 'text-[14px] leading-[18px]',
            active ? 'font-extrabold text-ink' : 'font-semibold text-body group-hover:text-ink',
          )}
        >
          {page.label}
        </span>
        {page.subtitle ? (
          <span className={cn('font-mono text-[10px] leading-[14px] font-medium tracking-[0.08em] uppercase', active ? 'text-mint/85' : 'text-faint')}>
            {page.subtitle}
          </span>
        ) : null}
      </span>
    </Link>
  );
}

/** Icon rail: meta.json order, mono section headers, active page with a mint bar. */
export function RailNav({ big = false }: { big?: boolean }) {
  const { groups } = useDocsNav();
  const pathname = normalizePath(usePathname());
  return (
    <div className="flex flex-col gap-0.5">
      {groups.map((group, i) => {
        const SectionIcon = group.section ? sectionIcon(group.section) : null;
        const headingId = group.section ? `rail-${group.section.toLowerCase()}` : undefined;
        return (
          <div key={i} role={group.section ? 'group' : undefined} aria-labelledby={headingId} className="flex flex-col gap-0.5">
            {group.section && SectionIcon ? (
              <div className={cn('flex items-center gap-2 ps-[13px]', big ? 'pt-[18px] pb-2' : 'pt-4 pb-1.5')}>
                <SectionIcon aria-hidden="true" className="size-[13px] text-faint" strokeWidth={1.75} />
                <MonoLabel id={headingId} className="text-muted">
                  {group.section}
                </MonoLabel>
              </div>
            ) : null}
            {group.pages.map((page) => (
              <RailItem key={page.url} page={page} active={normalizePath(page.url) === pathname} big={big} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function DrawerReleases() {
  const { stable, nightly } = releases;
  if (!stable && !nightly) return null;
  return (
    <div className="flex flex-col gap-2.5 border-t border-seam-soft px-[22px] py-4">
      {[
        { tone: 'green' as const, label: 'Stable', release: stable },
        { tone: 'amber' as const, label: 'Nightly', release: nightly },
      ].map(({ tone, label, release }) =>
        release ? (
          <a key={label} href={release.url} className="flex items-center gap-[9px] rounded-md">
            <StatusDot tone={tone} className="size-[7px]" />
            <MonoLabel className="text-[10px] text-muted">{label}</MonoLabel>
            <span className="font-mono text-[12px] leading-4 font-semibold text-ink">{release.tag}</span>
          </a>
        ) : null,
      )}
    </div>
  );
}

function Drawer({ onClose }: { onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div aria-hidden="true" className="absolute inset-0 bg-[rgb(4_6_12/72%)]" onClick={onClose} />
      <div
        id={DRAWER_ID}
        role="dialog"
        aria-modal="true"
        aria-label="Docs navigation"
        className="absolute inset-y-0 start-0 flex w-[316px] max-w-[85vw] flex-col overflow-y-auto border-e border-seam bg-surface shadow-[24px_0_60px_rgb(0_0_0/50%)]"
      >
        <div className="flex h-14 shrink-0 items-center gap-2 ps-[18px] pe-3">
          <BrandLockup href="/" chip="Docs" />
          <button ref={closeRef} type="button" aria-label="Close navigation" onClick={onClose} className={cn(iconButtonClass, 'ms-auto size-[38px]')}>
            <X aria-hidden="true" className="size-[18px]" />
          </button>
        </div>
        <div className="px-4 pt-1.5 pb-2.5">
          <CommandField className="h-[42px] w-full" />
        </div>
        <nav aria-label="Docs" className="flex-1 px-2.5 pb-5">
          <RailNav big />
        </nav>
        <DrawerReleases />
      </div>
    </div>
  );
}

/** Sidebar slot: the 232px rail from 1024px up, a drawer below that. */
export function ConsoleRail() {
  const { open, setOpen } = useSidebar();
  const close = useCallback(() => setOpen(false), [setOpen]);
  return (
    <>
      <aside className="border-e border-seam-soft bg-surface [grid-area:sidebar] max-lg:hidden">
        <nav aria-label="Docs" className="sticky top-16 max-h-[calc(100dvh-4rem)] overflow-y-auto px-3 pt-5 pb-10">
          <RailNav />
        </nav>
      </aside>
      {open ? <Drawer onClose={close} /> : null}
    </>
  );
}
