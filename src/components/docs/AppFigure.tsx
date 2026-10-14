import type { ComponentProps } from 'react';
import { BrandMark } from '@/components/console/brand';

/** CSS sizes of the app UI exports in public/illustrations, keyed by file name (Vite may add a content hash). */
const SIZES: Record<string, { width: number; height: number }> = {
  'getting-started-mode': { width: 1136, height: 490 },
  'configuration-picture': { width: 1136, height: 448 },
  'troubleshooting-ctrlg': { width: 720, height: 900 },
  'input-controllers': { width: 720, height: 900 },
  'authentication-providers': { width: 720, height: 780 },
  'configuration-streaming': { width: 1136, height: 669 },
  'input-settings': { width: 1136, height: 669 },
  'troubleshooting-queue': { width: 1136, height: 639 },
  'troubleshooting-connecting': { width: 1136, height: 639 },
  'troubleshooting-console-guide': { width: 1136, height: 639 },
  'troubleshooting-console-controllers': { width: 720, height: 900 },
};

/**
 * Markdown images. `![alt](/illustrations/x.webp "In the app · Onboarding › Mode")` renders as an app
 * window with a mono caption bar; the title becomes the caption, the alt text describes the UI.
 */
export function AppFigure({ src, alt, title }: ComponentProps<'img'>) {
  const file = typeof src === 'string' ? (src.split('/').pop() ?? '') : '';
  const size = Object.entries(SIZES).find(([name]) => file.startsWith(`${name}.`) || file.startsWith(`${name}-`))?.[1];
  const tall = size !== undefined && size.height > size.width * 0.8;
  return (
    <figure className="console-figure not-prose">
      <figcaption className="flex h-10 items-center gap-2.5 border-b border-seam-soft bg-white/[0.025] px-4">
        <BrandMark height={11} />
        <span className="truncate font-mono text-[11px] leading-[14px] font-medium tracking-[0.08em] text-muted uppercase">{title ?? alt}</span>
        <span aria-hidden="true" className="ms-auto flex gap-1.5">
          <span className="size-2 rounded-full bg-white/12" />
          <span className="size-2 rounded-full bg-white/12" />
          <span className="size-2 rounded-full bg-white/12" />
        </span>
      </figcaption>
      <img
        src={src}
        alt={alt ?? ''}
        width={size?.width}
        height={size?.height}
        loading="lazy"
        decoding="async"
        style={tall ? { maxWidth: Math.round((620 * size.width) / size.height) } : undefined}
        className="mx-auto block h-auto w-full"
      />
    </figure>
  );
}
