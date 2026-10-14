'use client';
import type { ReactNode } from 'react';
import { Download, Menu, MessageCircle, Search, X } from 'lucide-react';
import { useSearchContext } from 'fumadocs-ui/contexts/search';
import { cn } from '@/lib/cn';
import { BrandLockup } from './brand';
import { GitHubIcon, Kbd, iconButtonClass } from './primitives';
import { consoleLinks } from './links';

export type TopBarTarget = 'home' | 'download' | 'discord' | 'github';

/** "Search or jump to…" field that opens the fumadocs search dialog (Ctrl/⌘ K is bound by SearchProvider). */
export function CommandField({ className }: { className?: string }) {
  const { setOpenSearch } = useSearchContext();
  return (
    <button
      type="button"
      onClick={() => setOpenSearch(true)}
      aria-keyshortcuts="Control+K Meta+K"
      className={cn(
        'flex h-[38px] min-w-0 items-center gap-2.5 rounded-[10px] border border-seam bg-white/[0.04] ps-3 pe-2 text-start transition-colors hover:border-white/20 hover:bg-white/[0.06]',
        className,
      )}
    >
      <Search aria-hidden="true" className="size-4 shrink-0 text-muted" />
      <span className="flex-1 truncate text-[14px] leading-[18px] font-medium text-muted">Search or jump to…</span>
      <span className="flex gap-1" aria-hidden="true">
        <Kbd>Ctrl</Kbd>
        <Kbd>K</Kbd>
      </span>
    </button>
  );
}

interface ConsoleTopBarProps {
  /** Lockup chip, e.g. "Docs". */
  chip?: string;
  /** Middle area shown inline from 1024px up: PathCrumbs on docs, nav chips on the landing page. */
  center?: ReactNode;
  /** Mobile menu button; omitted when there is no drawer to open. */
  menu?: { open: boolean; onToggle: () => void; controls?: string };
  className?: string;
  onLinkClick?: (target: TopBarTarget) => void;
}

/**
 * Design B top bar: lockup | path chips | command field, Download, Discord, GitHub.
 * 64px from 1024px up; below that a 56px bar with lockup, search and menu buttons.
 */
export function ConsoleTopBar({ chip, center, menu, className, onLinkClick }: ConsoleTopBarProps) {
  const { setOpenSearch } = useSearchContext();
  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-14 items-center border-b border-seam-soft bg-surface lg:h-16 lg:border-seam',
        className,
      )}
    >
      <div className="flex h-full shrink-0 items-center ps-[18px] lg:w-[232px] lg:border-e lg:border-seam-soft lg:ps-5">
        <BrandLockup href="/" chip={chip} onClick={() => onLinkClick?.('home')} />
      </div>
      <div className="flex min-w-0 flex-1 items-center px-6 max-lg:hidden">{center}</div>
      <div className="ms-auto flex items-center gap-2.5 pe-3.5 lg:pe-5">
        <CommandField className="w-[240px] max-lg:hidden xl:w-[340px]" />
        <a
          href={consoleLinks.download}
          onClick={() => onLinkClick?.('download')}
          className="inline-flex h-9 items-center gap-[7px] rounded-[9px] bg-mint px-3.5 text-[13px] leading-[18px] font-extrabold text-mint-ink transition-[filter] hover:brightness-110 max-lg:hidden"
        >
          <Download aria-hidden="true" className="size-[15px]" strokeWidth={2.2} />
          Download
        </a>
        <a
          href={consoleLinks.discord}
          aria-label="OpenNOW Discord"
          onClick={() => onLinkClick?.('discord')}
          className={cn(iconButtonClass, 'max-lg:hidden')}
        >
          <MessageCircle aria-hidden="true" className="size-[17px]" />
        </a>
        <a
          href={consoleLinks.github}
          aria-label="OpenNOW on GitHub"
          onClick={() => onLinkClick?.('github')}
          className={cn(iconButtonClass, 'max-lg:hidden')}
        >
          <GitHubIcon />
        </a>
        <button
          type="button"
          aria-label="Search docs"
          onClick={() => setOpenSearch(true)}
          className={cn(iconButtonClass, 'size-10 lg:hidden')}
        >
          <Search aria-hidden="true" className="size-[18px]" />
        </button>
        {menu ? (
          <button
            type="button"
            aria-label={menu.open ? 'Close navigation' : 'Open navigation'}
            aria-expanded={menu.open}
            aria-controls={menu.controls}
            onClick={menu.onToggle}
            className={cn(iconButtonClass, 'size-10 lg:hidden')}
          >
            {menu.open ? <X aria-hidden="true" className="size-[18px]" /> : <Menu aria-hidden="true" className="size-[18px]" />}
          </button>
        ) : null}
      </div>
    </header>
  );
}
