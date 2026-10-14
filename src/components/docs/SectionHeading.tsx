import type { ComponentProps } from 'react';

/** H2 with a mono "01" chip (CSS counter, so it stays out of the heading text) and a "#" anchor at the right. */
export function SectionHeading({ id, children, ...props }: ComponentProps<'h2'>) {
  return (
    <h2 id={id} {...props} className="console-h2">
      <span className="console-h2-index" aria-hidden="true" />
      <span className="min-w-0 flex-1">{children}</span>
      {id ? (
        <a href={`#${id}`} className="console-h2-anchor" aria-label="Link to this section">
          #
        </a>
      ) : null}
    </h2>
  );
}
