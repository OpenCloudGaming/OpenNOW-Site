'use client';
import { useId, useState, type ReactNode } from 'react';
import { List } from 'lucide-react';
import { cn } from '@/lib/cn';
import { nodeText } from '@/lib/docs-nav';

const PLATFORMS = [
  { id: 'windows', label: 'Windows', match: /\bwindows\b/i },
  { id: 'linux', label: 'Linux', match: /\blinux\b/i },
  { id: 'macos', label: 'macOS', match: /\bmac ?os\b|\bapple silicon\b/i },
] as const;

type PlatformId = (typeof PLATFORMS)[number]['id'];

function platformOf(cell: ReactNode): PlatformId | undefined {
  const text = nodeText(cell);
  return PLATFORMS.find((p) => p.match.test(text))?.id;
}

export interface DataGridProps {
  headers: ReactNode[];
  rows: ReactNode[][];
}

/**
 * Design B data grid: mono caps header row, key column in mint mono (when it holds code), row hover.
 * Platform tables (first header names a platform, rows span 2+ desktop OSes, one OS has several rows) get filter chips; every
 * row is server-rendered and only hidden after a filter is picked. Below 640px rows stack into cards.
 */
export function DataGrid({ headers, rows }: DataGridProps) {
  const id = useId();
  const [filter, setFilter] = useState<PlatformId | 'all'>('all');
  const platforms = rows.map((row) => platformOf(row[0]));
  const counts = Object.fromEntries(PLATFORMS.map((p) => [p.id, platforms.filter((x) => x === p.id).length]));
  const filterable =
    /platform/i.test(nodeText(headers[0])) && new Set(platforms.filter(Boolean)).size > 1 && Object.values(counts).some((n) => n > 1);
  const visible = filter === 'all' ? rows.length : counts[filter];
  const labels = headers.map((h) => nodeText(h));

  return (
    <div className="console-datagrid not-prose" data-columns={headers.length}>
      {filterable ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-seam-soft bg-white/[0.02] px-3.5 py-2.5">
          <span className="flex items-center gap-2 pe-1 font-mono text-[11px] leading-[14px] font-medium tracking-[0.08em] text-muted uppercase" id={`${id}-filter`}>
            <List aria-hidden="true" className="size-3.5" />
            Filter
          </span>
          <div role="radiogroup" aria-labelledby={`${id}-filter`} className="flex flex-wrap gap-2">
            {[{ id: 'all' as const, label: 'All' }, ...PLATFORMS.filter((p) => counts[p.id] > 0)].map((option) => {
              const active = filter === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setFilter(option.id)}
                  className={cn(
                    'inline-flex h-7 items-center rounded-lg border px-2.5 text-[13px] leading-[18px] transition-colors',
                    active ? 'border-mint/32 bg-mint/10 font-extrabold text-mint' : 'border-seam-soft bg-white/[0.04] font-semibold text-body hover:text-ink',
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <span className="ms-auto font-mono text-[12px] leading-4 font-medium text-muted" aria-live="polite">
            {visible} of {rows.length} rows
          </span>
        </div>
      ) : null}
      <p className="console-datagrid-mobile-head" aria-hidden="true">
        {labels.join(' · ')}
      </p>
      <div className="console-datagrid-scroll">
        <table>
          <thead>
            <tr>
              {headers.map((header, i) => (
                <th key={i} scope="col">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r} hidden={filter !== 'all' && platforms[r] !== filter}>
                {row.map((cell, c) => (
                  <td key={c} data-label={labels[c]}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
