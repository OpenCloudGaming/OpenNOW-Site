import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

/** The OpenNOW cloud mark (opennow-qt/res/brand/opennow-mark.png), 16px tall like DesktopBrandLockup.qml. */
export function BrandMark({ height = 16, className }: { height?: number; className?: string }) {
  return (
    <img
      src="/brand/opennow-mark.png"
      alt=""
      width={Math.round((height * 362) / 208)}
      height={height}
      decoding="async"
      className={cn('shrink-0', className)}
    />
  );
}

/**
 * DesktopBrandLockup: 16px mark, 10px gap, "OpenNOW" Nunito 900 18px at -0.02em, plus an optional
 * mono chip ("DOCS"). Renders a link when `href` is set.
 */
export function BrandLockup({
  chip,
  href,
  className,
  ...props
}: { chip?: string; href?: string } & Omit<ComponentProps<'a'>, 'href'>) {
  const body = (
    <>
      <span className="flex items-center gap-2.5">
        <BrandMark />
        <span className="text-[18px] leading-[22px] font-black tracking-[-0.02em] text-ink">OpenNOW</span>
      </span>
      {chip ? (
        <span className="rounded-[5px] bg-raised px-1.5 py-0.5 font-mono text-[10px] leading-[14px] font-semibold tracking-[0.12em] text-muted uppercase">
          {chip}
        </span>
      ) : null}
    </>
  );
  const classes = cn('inline-flex shrink-0 items-center gap-2.5 rounded-md', className);
  if (!href) return <span className={classes}>{body}</span>;
  return (
    <a href={href} className={classes} {...props}>
      {body}
    </a>
  );
}
