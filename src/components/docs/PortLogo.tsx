import { Gamepad2 } from 'lucide-react';
import { BrandLogo, type Brand } from '@/components/brand-logos';

/** Inline platform mark for the Ports & team table. `handheld` is a neutral glyph for devices without a brand mark. */
export function PortLogo({ brand }: { brand: Brand | 'handheld' }) {
  return (
    <span className="not-prose me-1.5 inline-grid size-6 place-items-center rounded-md border border-seam-soft bg-white/5 align-middle">
      {brand === 'handheld' ? <Gamepad2 className="size-3.5 text-body" strokeWidth={1.75} aria-hidden /> : <BrandLogo brand={brand} className="size-3.5" />}
    </span>
  );
}
