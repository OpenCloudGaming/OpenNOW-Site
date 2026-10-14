import { BookMarked, ChevronRight } from 'lucide-react';
import Link from 'fumadocs-core/link';
import { cn } from '@/lib/cn';

export interface Crumb {
  label: string;
  href?: string;
}

const chip = 'inline-flex h-7 min-w-0 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-[13px] leading-[18px] whitespace-nowrap';

/** Path-chip breadcrumbs (Docs › Section › Page). The last crumb is the current page, in mint. */
export function PathCrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn('min-w-0', className)}>
      <ol className="flex min-w-0 items-center gap-1.5">
        {items.map((item, i) => {
          const current = i === items.length - 1;
          const body = (
            <>
              {i === 0 ? <BookMarked aria-hidden="true" className="size-[13px] text-muted" /> : null}
              <span className="truncate">{item.label}</span>
            </>
          );
          return (
            <li key={i} className={cn('flex items-center gap-1.5', current ? 'min-w-0 shrink' : 'shrink-0')}>
              {i > 0 ? <ChevronRight aria-hidden="true" className="size-3.5 shrink-0 text-faint" strokeWidth={2} /> : null}
              {current ? (
                <span aria-current="page" className={cn(chip, 'shrink border-mint/32 bg-mint/10 font-extrabold text-mint')}>
                  {body}
                </span>
              ) : item.href ? (
                <Link href={item.href} className={cn(chip, 'border-seam-soft bg-white/[0.04] font-semibold text-body hover:text-ink')}>
                  {body}
                </Link>
              ) : (
                <span className={cn(chip, 'border-seam-soft bg-white/[0.04] font-semibold text-body')}>{body}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
