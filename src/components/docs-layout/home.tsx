'use client';
import { ChevronRight, CornerDownLeft, CornerDownRight, Braces, Download, FolderOpen, MonitorPlay, type LucideIcon } from 'lucide-react';
import Link from 'fumadocs-core/link';
import { useSearchContext } from 'fumadocs-ui/contexts/search';
import { cn } from '@/lib/cn';
import { BrandMark } from '@/components/console/brand';
import { Kbd, MonoLabel } from '@/components/console/primitives';

/** Sign-in key art with the "IN THE APP · SIGN-IN" chip. LCP on /docs, so it loads eagerly with high priority. */
export function DocsHero() {
  return (
    <figure className="relative overflow-hidden rounded-xl border border-seam lg:rounded-2xl">
      <picture>
        <source type="image/avif" srcSet="/brand/signin-hero-400.avif 400w, /brand/signin-hero-832.avif 832w, /brand/signin-hero-1664.avif 1664w" sizes="(min-width: 1024px) 832px, calc(100vw - 40px)" />
        <source type="image/webp" srcSet="/brand/signin-hero-400.webp 400w, /brand/signin-hero-832.webp 832w, /brand/signin-hero-1664.webp 1664w" sizes="(min-width: 1024px) 832px, calc(100vw - 40px)" />
        <img
          src="/brand/signin-hero-832.webp"
          width={832}
          height={269}
          alt="Key art from the OpenNOW sign-in screen"
          fetchPriority="high"
          decoding="async"
          className="h-[132px] w-full object-cover lg:h-[268px]"
        />
      </picture>
      <figcaption className="absolute bottom-2.5 left-3 flex items-center gap-2.5 rounded-lg border border-seam-soft bg-[rgb(7_10_18/78%)] px-2.5 py-1.5 lg:bottom-3.5 lg:left-[18px]">
        <BrandMark height={11} />
        <MonoLabel className="text-muted">In the app · Sign-in</MonoLabel>
      </figcaption>
    </figure>
  );
}

interface Jump {
  icon: LucideIcon;
  title: string;
  mono?: boolean;
  path: string;
  href: string;
}

/** Shortcuts to real anchors; every href is checked against the built HTML. */
const JUMPS: Jump[] = [
  { icon: Download, title: 'Linux packages', path: 'Getting Started › Download a release', href: '/docs/guides/getting-started#download-a-release' },
  { icon: MonitorPlay, title: 'Black screen with audio', path: 'Troubleshooting › Stream quality and video', href: '/docs/guides/troubleshooting#stream-quality-and-video' },
  {
    icon: Braces,
    title: 'OPENNOW_DATA_DIR · OPENNOW_PICTURES_DIR',
    mono: true,
    path: 'Native Streamer Architecture › Environment overrides',
    href: '/docs/advanced/streamer-investigation#environment-overrides',
  },
  { icon: FolderOpen, title: 'Settings and data locations', path: 'Configuration › File locations', href: '/docs/reference/configuration#file-locations' },
];

/** Docs home "Jump to" block (b-docs-home.png). Rendered by the route, not the MDX, so it stays out of search and llms output. */
export function JumpTo() {
  const { setOpenSearch } = useSearchContext();
  return (
    <section
      aria-labelledby="jump-to-label"
      className="overflow-hidden rounded-[14px] border border-mint/22 bg-[linear-gradient(180deg,rgb(86_230_165/5%),rgb(255_255_255/2%))]"
    >
      <div className="flex items-center gap-2 border-b border-mint/16 px-4 py-3">
        <CornerDownLeft aria-hidden="true" className="size-3.5 text-mint" />
        <MonoLabel id="jump-to-label" className="text-mint">
          Jump to
        </MonoLabel>
        <button
          type="button"
          onClick={() => setOpenSearch(true)}
          className="ms-auto flex items-center gap-1.5 rounded-md text-[13px] leading-[18px] font-semibold text-muted hover:text-ink max-lg:hidden"
        >
          or search everything
          <Kbd>Ctrl</Kbd>
          <Kbd>K</Kbd>
        </button>
      </div>
      <ul>
        {JUMPS.map((jump, i) => (
          <li key={jump.href} className={cn(i > 0 && 'border-t border-seam-soft')}>
            <Link
              href={jump.href}
              className="group flex items-center gap-3 px-3 py-[11px] transition-colors hover:bg-white/[0.03] lg:h-[52px] lg:gap-3.5 lg:py-0 lg:ps-3 lg:pe-3.5"
            >
              <span aria-hidden="true" className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-mint/9 text-mint">
                <jump.icon className="size-4" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-[3px] lg:flex-row lg:items-center lg:gap-3.5">
                <span
                  className={cn(
                    'text-ink lg:w-[290px] lg:shrink-0',
                    jump.mono ? 'font-mono text-[12px] leading-5 font-semibold' : 'text-[15px] leading-5 font-extrabold',
                  )}
                >
                  {jump.title}
                </span>
                <span className="flex min-w-0 items-center gap-2 font-mono text-[11px] leading-[15px] font-medium text-muted lg:text-[12px] lg:leading-4">
                  <CornerDownRight aria-hidden="true" className="size-3.5 shrink-0 text-faint max-lg:hidden" />
                  <span className="lg:truncate">{jump.path}</span>
                </span>
              </span>
              <Kbd aria-hidden="true" className="max-lg:hidden">
                ↵
              </Kbd>
              <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-faint lg:hidden" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
