'use client';
import { useRef, useState, type ComponentProps } from 'react';
import { Check, Copy, SquareTerminal } from 'lucide-react';
import { transformerIcon } from 'fumadocs-core/mdx-plugins/transformer-icon';

/** rehype-code only passes the language through as an `icon` SVG; map it back to a label. */
const LANGUAGE_BY_ICON = (() => {
  const transformer = transformerIcon() as unknown as {
    pre: (this: { options: { lang: string } }, pre: { properties: Record<string, unknown> }) => { properties: { icon?: string } };
  };
  const map = new Map<string, string>();
  for (const lang of ['text', 'bash', 'powershell', 'json', 'ts', 'tsx', 'js', 'rust', 'cpp', 'c', 'python', 'yaml', 'toml', 'html', 'css', 'go', 'swift', 'kotlin', 'java', 'diff']) {
    const icon = transformer.pre.call({ options: { lang } }, { properties: {} }).properties.icon;
    if (icon && !map.has(icon)) map.set(icon, lang === 'text' ? 'text' : lang);
  }
  return map;
})();

/** Terminal code block: ">_ BASH" header with Copy, well background, line numbers. */
export function TerminalCode({ icon, title, children, className, style, ...props }: ComponentProps<'pre'> & { icon?: string }) {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);
  const language = (icon && LANGUAGE_BY_ICON.get(icon)) || 'text';
  const copy = async () => {
    await navigator.clipboard.writeText(ref.current?.textContent ?? '');
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <figure className="console-code not-prose">
      <figcaption className="flex h-[42px] items-center gap-2 border-b border-seam-soft bg-white/[0.025] ps-4 pe-2">
        <SquareTerminal aria-hidden="true" className="size-3.5 text-muted" />
        <span className="font-mono text-[11px] leading-[14px] font-medium tracking-[0.08em] text-muted uppercase">{title ?? language}</span>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? 'Copied' : 'Copy code'}
          className="ms-auto inline-flex h-[26px] items-center gap-1.5 rounded-[7px] border border-seam-soft bg-white/[0.03] px-2.5 font-mono text-[12px] leading-4 font-medium text-body transition-colors hover:text-ink"
        >
          {copied ? <Check aria-hidden="true" className="size-[13px] text-mint" /> : <Copy aria-hidden="true" className="size-[13px]" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </figcaption>
      <div className="console-code-viewport" tabIndex={0} role="region" aria-label={`${language} code`}>
        <pre ref={ref} {...props}>
          {children}
        </pre>
      </div>
    </figure>
  );
}
