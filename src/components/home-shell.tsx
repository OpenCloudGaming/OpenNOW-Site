import { useState, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowUpRight, BookOpen, Download, MessageCircle } from 'lucide-react';
import { ConsoleTopBar, GitHubIcon, ReleaseStatusBar, consoleLinks } from '@/components/console';
import { cn } from '@/lib/cn';

const chipClass =
  'inline-flex h-7 items-center gap-[7px] rounded-[7px] border px-2.5 text-[14px] leading-[18px] transition-colors [&_svg]:size-[13px]';
const idleChip = 'border-seam-soft bg-glass font-semibold text-body hover:border-seam hover:text-ink [&_svg]:text-muted';
const activeChip = 'border-mint/36 bg-mint/8 font-extrabold text-mint';

const drawerLink =
  'flex h-12 items-center gap-3 rounded-[10px] px-3 text-[16px] font-bold text-body transition-colors hover:bg-white/5 hover:text-ink [&_svg]:size-[18px] [&_svg]:text-muted';

function HomeNav({ onNavigate, vertical = false }: { onNavigate?: () => void; vertical?: boolean }) {
  const items = [
    <Link key="home" to="/" aria-current="page" onClick={onNavigate} className={vertical ? cn(drawerLink, 'bg-mint/8 text-mint') : cn(chipClass, activeChip)}>
      Home
    </Link>,
    <Link key="docs" to="/docs/$" params={{ _splat: '' }} onClick={onNavigate} className={vertical ? drawerLink : cn(chipClass, idleChip)}>
      <BookOpen aria-hidden="true" /> Docs
    </Link>,
    <a key="downloads" href="#downloads" onClick={onNavigate} className={vertical ? drawerLink : cn(chipClass, idleChip)}>
      <Download aria-hidden="true" /> Downloads
    </a>,
    <a key="releases" href={consoleLinks.releases} className={vertical ? drawerLink : cn(chipClass, idleChip)}>
      <ArrowUpRight aria-hidden="true" /> Releases
    </a>,
  ];
  if (!vertical) return <nav aria-label="Site" className="flex items-center gap-2">{items}</nav>;
  return (
    <nav aria-label="Site" className="flex flex-col gap-1">
      {items}
      <div className="mt-2 flex gap-1 border-t border-seam-soft pt-3">
        <a href={consoleLinks.discord} className={cn(drawerLink, 'flex-1')}>
          <MessageCircle aria-hidden="true" /> Discord
        </a>
        <a href={consoleLinks.github} className={cn(drawerLink, 'flex-1')}>
          <GitHubIcon /> GitHub
        </a>
      </div>
    </nav>
  );
}

/** Landing-page chrome: the docs' Console top bar (nav chips instead of breadcrumbs) and release status bar. */
export function HomeShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="flex min-h-screen flex-col bg-ground">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-mint focus:px-3 focus:py-2 focus:font-bold focus:text-mint-ink">
        Skip to content
      </a>
      <ConsoleTopBar
        center={<HomeNav />}
        menu={{ open: menuOpen, onToggle: () => setMenuOpen((open) => !open), controls: 'home-menu' }}
      />
      {menuOpen ? (
        <div id="home-menu" className="sticky top-14 z-30 border-b border-seam bg-surface px-3 py-3 lg:hidden">
          <HomeNav vertical onNavigate={() => setMenuOpen(false)} />
        </div>
      ) : null}
      <main id="main" className="flex-1">
        {children}
      </main>
      <ReleaseStatusBar />
    </div>
  );
}
