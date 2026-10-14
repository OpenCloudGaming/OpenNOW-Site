import type { ReactNode } from 'react';
import { Callout } from 'fumadocs-ui/components/callout';

interface NightlyProps {
  /** Nightly line or first nightly build that ships the feature, for example `v1.0.3-nightly.1026.1`. */
  since: string;
  /** With children, renders a callout around nightly-only content; without, an inline badge. */
  children?: ReactNode;
}

const stableRelease = 'v1.0.2';

function NightlyBadge({ since }: { since: string }) {
  return (
    <span
      title={`Nightly only: in ${since} and later nightly builds from dev, not in stable ${stableRelease}`}
      className="not-prose inline-flex items-center gap-1 rounded-md border border-fd-primary/40 bg-fd-primary/10 px-1.5 py-0.5 align-middle font-mono text-[0.7rem] font-medium leading-none text-fd-primary"
    >
      Nightly
      <span className="text-fd-muted-foreground">{since}</span>
    </span>
  );
}

export function Nightly({ since, children }: NightlyProps) {
  if (!children) return <NightlyBadge since={since} />;

  return (
    <Callout type="warn" title={<>Nightly only <NightlyBadge since={since} /></>}>
      Not in the stable {stableRelease} release. Available in {since} and later nightly builds from{' '}
      <code>dev</code>.
      {children}
    </Callout>
  );
}

export default Nightly;
