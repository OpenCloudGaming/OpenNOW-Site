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
    <div className="mt-12 sm:mt-14">
      <div className="flex flex-col justify-between gap-3.5 sm:flex-row sm:items-end sm:gap-6">
        <div>
          <h3 className="flex items-center gap-2.5 text-[21px] font-black leading-[27px] text-ink sm:text-[22px] sm:leading-7 sm:tracking-[-0.01em]">
            <Terminal className="size-4 text-mint" aria-hidden />
            Desktop packages
          </h3>
          <p className="mt-1 text-[15px] leading-6 text-muted">Direct downloads for the current stable release and the latest nightly.</p>
        </div>
        <div className="flex w-full gap-1 rounded-[10px] border border-seam bg-glass p-1 sm:w-fit" role="tablist" aria-label="Release channel">
          {(['stable', 'nightly'] as const).map((option) => (
            <button
              key={option}
              role="tab"
              aria-selected={channel === option}
              onClick={() => setChannel(option)}
              className={`inline-flex h-[34px] flex-1 items-center justify-center gap-2 rounded-[7px] border px-3.5 text-sm capitalize transition-colors sm:h-8 sm:flex-none ${channel === option ? 'border-mint/36 bg-mint/12 font-extrabold text-mint' : 'border-transparent font-bold text-muted hover:text-ink'}`}
            >
              <span aria-hidden className={`size-2 rounded-full ${option === 'stable' ? 'bg-green shadow-[0_0_0_3px_rgb(29_185_84/0.16)]' : 'bg-amber shadow-[0_0_0_3px_rgb(255_209_102/0.16)]'}`} />
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-[14px] border border-seam bg-[#0a0e18]">
        {state.status === 'loading' && (
          <div className="divide-y divide-seam-soft" aria-label="Loading downloads">
            {PLATFORMS.map((platform) => (
              <div key={platform.id} className="flex animate-pulse flex-col gap-4 p-4 sm:flex-row sm:items-center sm:px-5">
                <div className="h-5 w-28 rounded bg-raised" />
                <div className="h-10 flex-1 rounded-[9px] bg-raised" />
              </div>
            ))}
          </div>
        )}

        {state.status === 'error' && (
          <div className="flex flex-col items-start gap-3 p-5 sm:p-6">
            <p className="text-sm leading-6 text-muted">Couldn&apos;t reach the GitHub releases API, so direct links are unavailable right now.</p>
            <a
              href={`https://github.com/${REPO}/releases`}
              onClick={() => track('home_download_clicked', { platform: 'desktop-fallback', href: 'releases' })}
              className="inline-flex items-center gap-2 rounded-[9px] bg-mint px-4 py-2 text-sm font-extrabold text-mint-ink transition-colors hover:bg-[#7bedb9]"
            >
              Browse all releases <ArrowUpRight className="size-4" aria-hidden />
            </a>
          </div>
        )}

        {state.status === 'ready' && (
          <div>
            <div className="hidden items-center gap-6 border-b border-seam bg-white/3 px-5 py-[11px] font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-muted sm:flex" aria-hidden>
              <span className="w-[200px]">Platform</span>
              <span>Recommended</span>
            </div>
            <div className="divide-y divide-seam-soft">
              {PLATFORMS.map((platform) => {
                const Icon = PLATFORM_ICONS[platform.id as keyof typeof PLATFORM_ICONS];
                const primary = findAsset(state.release, platform.primary.pattern);
                return (
                  <div key={platform.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-6 sm:px-5 sm:py-[18px]">
                    <div className="flex items-center gap-3 sm:w-[200px] sm:shrink-0">
                      <span className="grid size-9 shrink-0 place-items-center rounded-[9px] border border-mint/18 bg-mint/10 text-mint sm:size-10 sm:rounded-[10px]">
                        <Icon className="size-[18px] sm:size-5" strokeWidth={1.75} aria-hidden />
                      </span>
                      <span>
                        <span className="block text-[15px] font-extrabold leading-5 text-ink">{platform.label}</span>
                        <span className="block font-mono text-xs leading-4 text-muted">{platform.note}</span>
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6">
                      {primary ? (
                        <a
                          href={primary.browser_download_url}
                          onClick={() => track('home_download_clicked', { platform: platform.id, channel, asset: primary.name })}
                          className="inline-flex h-[42px] items-center justify-center gap-2 rounded-[9px] bg-mint px-3.5 text-sm font-extrabold text-mint-ink transition-colors hover:bg-[#7bedb9] sm:h-[38px] sm:w-fit sm:rounded-lg"
                        >
                          <Download className="size-[15px]" aria-hidden /> {platform.primary.label} · {formatSize(primary.size)}
                        </a>
                      ) : (
                        <span className="text-sm text-muted">No {platform.label.toLowerCase()} build in {state.release.tag_name}.</span>
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
                                className="inline-flex h-[30px] items-center rounded-[7px] border border-seam bg-glass px-[11px] text-[13px] font-bold text-ink transition-colors hover:border-mint/40 hover:bg-raised"
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
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 border-t border-dashed border-seam px-4 py-3.5 sm:px-5">
              <span className="inline-flex items-center gap-2 font-mono text-xs font-semibold text-ink">
                <span aria-hidden className={`size-2 rounded-full ${channel === 'stable' ? 'bg-green' : 'bg-amber'}`} />
                {channel === 'stable' ? 'Stable' : 'Nightly'} {state.release.tag_name}
              </span>
              {checksums && (
                <a href={checksums.browser_download_url} className="inline-flex items-center gap-1.5 text-[13px] font-extrabold text-mint hover:underline hover:underline-offset-4">
                  <FileCheck className="size-3.5" aria-hidden /> Verify checksums
                </a>
              )}
              <a
                href={state.release.html_url}
                onClick={() => track('home_download_clicked', { platform: 'desktop-release-notes', channel, href: state.release.html_url })}
                className="inline-flex items-center gap-1.5 text-[13px] font-extrabold text-mint hover:underline hover:underline-offset-4"
              >
                All files and release notes <ArrowUpRight className="size-3.5" aria-hidden />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
