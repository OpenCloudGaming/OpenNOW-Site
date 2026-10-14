import { ArrowUpRight, MessageCircle } from 'lucide-react';
import { releases, type ReleaseInfo } from '@/lib/releases.gen';
import { cn } from '@/lib/cn';
import { GitHubIcon, MonoLabel, StatusDot } from './primitives';
import { consoleLinks } from './links';

export type StatusBarTarget = 'stable' | 'nightly' | 'discord' | 'github' | 'releases';

interface ReleaseStatusBarProps {
  className?: string;
  /** Called before navigation, e.g. for analytics. */
  onLinkClick?: (target: StatusBarTarget) => void;
}

const linkClass =
  'inline-flex items-center gap-2 rounded-md font-mono text-[12px] leading-4 font-medium text-muted transition-colors hover:text-ink [&_svg]:size-[15px]';

function Channel({
  tone,
  label,
  release,
  onClick,
}: {
  tone: 'green' | 'amber';
  label: string;
  release: ReleaseInfo;
  onClick?: () => void;
}) {
  return (
    <a
      href={release.url}
      onClick={onClick}
      className="group inline-flex min-w-0 items-center gap-2.5 rounded-md max-lg:w-full"
    >
      <StatusDot tone={tone} />
      <MonoLabel className="text-muted max-lg:w-16 max-lg:text-[10px]">{label}</MonoLabel>
      <span className="truncate font-mono text-[12px] leading-4 font-semibold text-ink group-hover:text-mint">{release.tag}</span>
      {release.date ? (
        <time dateTime={release.date} className="shrink-0 font-mono text-[12px] leading-4 text-muted max-lg:ms-auto max-lg:text-[11px]">
          {release.date}
        </time>
      ) : null}
    </a>
  );
}

/**
 * Release status bar from Design B: stable + nightly versions (fetched from GitHub at build time,
 * see scripts/generate-releases-data.vite.ts) and community links. Channels the build could not
 * resolve are omitted; the Releases link always renders.
 */
export function ReleaseStatusBar({ className, onLinkClick }: ReleaseStatusBarProps) {
  const { stable, nightly } = releases;
  return (
    <footer
      className={cn(
        'flex border-t border-seam bg-bar px-5 max-lg:flex-col max-lg:gap-2.5 max-lg:pt-[18px] max-lg:pb-[34px] lg:h-[52px] lg:items-center lg:gap-5 lg:px-6',
        className,
      )}
    >
      {stable || nightly ? (
        <div className="flex min-w-0 gap-5 max-lg:flex-col max-lg:gap-2.5 lg:items-center" aria-label="Current releases">
          {stable ? <Channel tone="green" label="Stable" release={stable} onClick={() => onLinkClick?.('stable')} /> : null}
          {stable && nightly ? <span aria-hidden="true" className="h-[18px] w-px bg-seam max-lg:hidden" /> : null}
          {nightly ? <Channel tone="amber" label="Nightly" release={nightly} onClick={() => onLinkClick?.('nightly')} /> : null}
        </div>
      ) : null}
      <nav
        aria-label="Community"
        className="flex items-center gap-5 max-lg:gap-[18px] max-lg:border-t max-lg:border-seam-soft max-lg:pt-2.5 lg:ms-auto"
      >
        <a className={linkClass} href={consoleLinks.discord} onClick={() => onLinkClick?.('discord')}>
          <MessageCircle aria-hidden="true" />
          Discord
        </a>
        <a className={linkClass} href={consoleLinks.github} onClick={() => onLinkClick?.('github')}>
          <GitHubIcon className="size-3.5" />
          GitHub
        </a>
        <a className={linkClass} href={consoleLinks.releases} onClick={() => onLinkClick?.('releases')}>
          <ArrowUpRight aria-hidden="true" />
          Releases
        </a>
      </nav>
    </footer>
  );
}
