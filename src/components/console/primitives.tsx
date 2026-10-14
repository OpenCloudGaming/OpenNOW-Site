import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Kbd({ className, ...props }: ComponentProps<'kbd'>) {
  return (
    <kbd
      {...props}
      className={cn(
        'inline-flex h-[22px] min-w-[22px] shrink-0 items-center justify-center rounded-[5px] border border-seam-soft bg-raised px-1.5 font-mono text-[11px] leading-[14px] font-medium text-ink',
        className,
      )}
    />
  );
}

/** Mono caps label: IBM Plex Mono 500 11px, tracked 0.08em. */
export function MonoLabel({ className, ...props }: ComponentProps<'span'>) {
  return <span {...props} className={cn('font-mono text-[11px] leading-[14px] font-medium tracking-[0.08em] uppercase', className)} />;
}

export function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn('size-4 shrink-0', className)} fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

/** Ghost button chrome shared by Copy Markdown / Open in GitHub. */
export const ghostButtonClass =
  'inline-flex h-[34px] shrink-0 items-center gap-2 rounded-[9px] border border-seam bg-white/[0.04] px-3.5 text-[13px] leading-[18px] font-bold whitespace-nowrap text-ink transition-colors hover:bg-white/[0.08] [&_svg]:size-3.5 [&_svg]:text-body';

export const iconButtonClass =
  'inline-flex size-9 shrink-0 items-center justify-center rounded-[9px] border border-seam-soft bg-white/[0.03] text-body transition-colors hover:bg-white/[0.08] hover:text-ink';

export function StatusDot({ tone, className }: { tone: 'green' | 'amber'; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'size-2 shrink-0 rounded-full',
        tone === 'green' ? 'bg-green shadow-[0_0_0_3px_rgb(29_185_84/16%)]' : 'bg-amber shadow-[0_0_0_3px_rgb(255_209_102/16%)]',
        className,
      )}
    />
  );
}

export function IconTile({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex size-[34px] shrink-0 items-center justify-center rounded-[9px] border border-mint/18 bg-mint/10 text-mint [&_svg]:size-[18px]',
        className,
      )}
    >
      {children}
    </span>
  );
}
