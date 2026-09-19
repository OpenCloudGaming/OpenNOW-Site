import { useEffect, useState } from 'react';
import { ArrowUpRight, Download, FileCheck, Laptop, Monitor, Terminal } from 'lucide-react';
import { track } from '@/lib/analytics';

const REPO = 'OpenCloudGaming/OpenNOW';
const API = 'https://api.github.com/repos';

type ReleaseAsset = {
  name: string;
  browser_download_url: string;
  size: number;
};

type Release = {
  tag_name: string;
  html_url: string;
  assets: ReleaseAsset[];
};

type Channel = 'stable' | 'nightly';

type DownloadTarget = {
  label: string;
  pattern: RegExp;
};

type PlatformRow = {
  id: string;
  label: string;
  note: string;
  primary: DownloadTarget;
  secondary: DownloadTarget[];
};

const PLATFORMS: PlatformRow[] = [
  {
    id: 'windows',
    label: 'Windows',
    note: 'Windows 10 or newer',
    primary: { label: 'Windows · x64 installer', pattern: /-Windows-x64\.msi$/ },
    secondary: [
      { label: 'x64 portable', pattern: /-Windows-x64\.zip$/ },
      { label: 'ARM64 installer', pattern: /-Windows-arm64\.msi$/ },
      { label: 'ARM64 portable', pattern: /-Windows-arm64\.zip$/ },
    ],
  },
  {
    id: 'macos',
    label: 'macOS',
    note: 'Apple Silicon',
    primary: { label: 'macOS · Apple Silicon', pattern: /-Darwin-arm64\.dmg$/ },
    secondary: [],
  },
  {
    id: 'linux',
    label: 'Linux',
    note: 'X11 and Wayland',
    primary: { label: 'Linux · x64 AppImage', pattern: /-Linux-x64\.AppImage$/ },
    secondary: [
      { label: 'x64 .deb', pattern: /-Linux-x64\.deb$/ },
      { label: 'ARM64 AppImage', pattern: /-Linux-arm64\.AppImage$/ },
      { label: 'ARM64 .deb', pattern: /-Linux-arm64\.deb$/ },
    ],
  },
];

const PLATFORM_ICONS = { windows: Monitor, macos: Laptop, linux: Terminal } as const;

type ChannelState =
  | { status: 'loading' }
  | { status: 'ready'; release: Release }
  | { status: 'error' };

function formatSize(bytes: number): string {
  return `${Math.max(1, Math.round(bytes / 1048576))} MB`;
}

async function fetchRelease(channel: Channel): Promise<Release> {
  if (channel === 'stable') {
    const response = await fetch(`${API}/${REPO}/releases/latest`);
    if (!response.ok) throw new Error(`stable lookup failed: ${response.status}`);
    return (await response.json()) as Release;
  }
  const response = await fetch(`${API}/${REPO}/releases?per_page=20`);
  if (!response.ok) throw new Error(`nightly lookup failed: ${response.status}`);
  const releases = (await response.json()) as (Release & { prerelease: boolean })[];
  const nightly = releases.find((release) => release.prerelease && release.tag_name.includes('nightly'));
  if (!nightly) throw new Error('no nightly release found');
  return nightly;
}

function findAsset(release: Release, pattern: RegExp): ReleaseAsset | undefined {
  return release.assets.find((asset) => pattern.test(asset.name));
}

export function DesktopDownloads() {
  const [channel, setChannel] = useState<Channel>('stable');
  const [states, setStates] = useState<Record<Channel, ChannelState>>({ stable: { status: 'loading' }, nightly: { status: 'loading' } });

  useEffect(() => {
    let cancelled = false;
    for (const next of ['stable', 'nightly'] as const) {
      fetchRelease(next)
        .then((release) => {
          if (!cancelled) setStates((previous) => ({ ...previous, [next]: { status: 'ready', release } }));
        })
        .catch(() => {
          if (!cancelled) setStates((previous) => ({ ...previous, [next]: { status: 'error' } }));
        });
    }
    return () => {
      cancelled = true;
    };
  }, []);

  const state = states[channel];
  const checksums = state.status === 'ready' ? state.release.assets.find((asset) => asset.name === 'SHA256SUMS') : undefined;

  return (
    <div className="mt-14">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-fd-foreground">Desktop packages</h3>
          <p className="mt-1 text-sm leading-6 text-fd-muted-foreground">Direct downloads for the current stable release and the latest nightly.</p>
        </div>
        <div className="inline-flex w-fit rounded-xl border bg-fd-card/75 p-1 text-sm font-semibold" role="tablist" aria-label="Release channel">
          {(['stable', 'nightly'] as const).map((option) => (
            <button
              key={option}
              role="tab"
              aria-selected={channel === option}
              onClick={() => setChannel(option)}
              className={`rounded-lg px-4 py-1.5 capitalize transition-colors ${channel === option ? 'bg-fd-primary text-fd-primary-foreground' : 'text-fd-muted-foreground hover:text-fd-foreground'}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border bg-fd-card/75">
        {state.status === 'loading' && (
          <div className="divide-y" aria-label="Loading downloads">
            {PLATFORMS.map((platform) => (
              <div key={platform.id} className="flex animate-pulse flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <div className="h-5 w-28 rounded bg-fd-accent" />
                <div className="h-10 flex-1 rounded-xl bg-fd-accent" />
              </div>
            ))}
          </div>
        )}

        {state.status === 'error' && (
          <div className="flex flex-col items-start gap-3 p-6">
            <p className="text-sm leading-6 text-fd-muted-foreground">Couldn&apos;t reach the GitHub releases API, so direct links are unavailable right now.</p>
            <a
              href={`https://github.com/${REPO}/releases`}
              onClick={() => track('home_download_clicked', { platform: 'desktop-fallback', href: 'releases' })}
              className="inline-flex items-center gap-2 rounded-xl bg-fd-primary px-4 py-2 text-sm font-semibold text-fd-primary-foreground transition-colors hover:opacity-90"
            >
              Browse all releases <ArrowUpRight className="size-4" />
            </a>
          </div>
        )}

        {state.status === 'ready' && (
          <div className="divide-y">
            {PLATFORMS.map((platform) => {
              const Icon = PLATFORM_ICONS[platform.id as keyof typeof PLATFORM_ICONS];
              const primary = findAsset(state.release, platform.primary.pattern);
              return (
                <div key={platform.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6">
                  <div className="flex min-w-44 items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                      <Icon className="size-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-fd-foreground">{platform.label}</span>
                      <span className="block text-xs text-fd-muted-foreground">{platform.note}</span>
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-2">
                    {primary ? (
                      <a
                        href={primary.browser_download_url}
                        onClick={() => track('home_download_clicked', { platform: platform.id, channel, asset: primary.name })}
                        className="inline-flex w-fit items-center gap-2 rounded-xl bg-fd-primary px-4 py-2 text-sm font-semibold text-fd-primary-foreground transition-colors hover:opacity-90"
                      >
                        <Download className="size-4" /> {platform.primary.label} · {formatSize(primary.size)}
                      </a>
                    ) : (
                      <span className="text-sm text-fd-muted-foreground">No {platform.label.toLowerCase()} build in {state.release.tag_name}.</span>
                    )}
                    {platform.secondary.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {platform.secondary.map((target) => {
                          const asset = findAsset(state.release, target.pattern);
                          if (!asset) return null;
                          return (
                            <a
                              key={target.label}
                              href={asset.browser_download_url}
                              onClick={() => track('home_download_clicked', { platform: platform.id, channel, asset: asset.name })}
                              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold text-fd-foreground transition-colors hover:bg-fd-accent"
                            >
                              {target.label} · {formatSize(asset.size)}
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-dashed px-5 py-4 text-xs text-fd-muted-foreground">
              <span>
                {channel === 'stable' ? 'Stable' : 'Nightly'} {state.release.tag_name}
              </span>
              {checksums && (
                <a href={checksums.browser_download_url} className="inline-flex items-center gap-1.5 font-semibold text-fd-primary hover:opacity-80">
                  <FileCheck className="size-3.5" /> Verify checksums
                </a>
              )}
              <a
                href={state.release.html_url}
                onClick={() => track('home_download_clicked', { platform: 'desktop-release-notes', channel, href: state.release.html_url })}
                className="inline-flex items-center gap-1.5 font-semibold text-fd-primary hover:opacity-80"
              >
                All files and release notes <ArrowUpRight className="size-3.5" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
