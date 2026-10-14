import { useEffect, useState } from 'react';
import { ArrowUpRight, Download, FileCheck } from 'lucide-react';
import { track } from '@/lib/analytics';
import { BrandLogo, type Brand } from '@/components/brand-logos';

const REPO = 'OpenCloudGaming/OpenNOW';
const API = 'https://api.github.com/repos';
const RELEASES_URL = `https://github.com/${REPO}/releases`;

type ReleaseAsset = {
  name: string;
  browser_download_url: string;
  size: number;
};

type Release = {
  tag_name: string;
  html_url: string;
  published_at: string;
  assets: ReleaseAsset[];
};

type Channel = 'stable' | 'nightly';
type Os = 'windows' | 'macos' | 'linux';
type Arch = 'x64' | 'arm64';

type PackageFile = {
  /** Label on the recommended button; files without one only appear under "Other downloads". */
  recommended?: string;
  title: string;
  detail: string;
  format: string;
  arch: Arch;
  pattern: RegExp;
};

type DesktopOs = {
  id: Os;
  label: string;
  logo: Brand;
  note: string;
  help: string;
  files: PackageFile[];
};

const PLATFORMS: DesktopOs[] = [
  {
    id: 'windows',
    label: 'Windows',
    logo: 'windows',
    note: 'Windows 10 or newer',
    help: 'Run it and follow the prompts. Packages are not Authenticode-signed, so Windows may show a SmartScreen warning.',
    files: [
      { recommended: 'Installer (recommended)', title: 'Installer .msi', detail: 'The standard Windows installer.', format: '.msi', arch: 'x64', pattern: /-Windows-x64\.msi$/ },
      { title: 'Portable .zip', detail: 'No install. Unzip and run bin/OpenNOW.exe.', format: '.zip', arch: 'x64', pattern: /-Windows-x64\.zip$/ },
      { title: 'Setup .exe', detail: 'Installs for your user only. No admin rights needed.', format: '.exe', arch: 'x64', pattern: /-Windows-x64-setup\.exe$/ },
      { recommended: 'Installer (recommended)', title: 'Installer .msi', detail: 'For Windows on ARM, such as Snapdragon laptops.', format: '.msi', arch: 'arm64', pattern: /-Windows-arm64\.msi$/ },
      { title: 'Portable .zip', detail: 'Windows on ARM. No install.', format: '.zip', arch: 'arm64', pattern: /-Windows-arm64\.zip$/ },
      { title: 'Setup .exe', detail: 'Windows on ARM. Installs for your user only, no admin rights.', format: '.exe', arch: 'arm64', pattern: /-Windows-arm64-setup\.exe$/ },
    ],
  },
  {
    id: 'macos',
    label: 'macOS',
    logo: 'apple',
    note: 'Apple silicon · macOS 13 or later',
    help: 'Open it and drag OpenNOW into Applications. Intel Macs are not supported.',
    files: [
      { recommended: 'Disk image (recommended)', title: 'Disk image .dmg', detail: 'Drag OpenNOW into Applications.', format: '.dmg', arch: 'arm64', pattern: /-Darwin-arm64\.dmg$/ },
      { title: 'App .zip', detail: 'The same app without the disk image.', format: '.zip', arch: 'arm64', pattern: /-Darwin-arm64\.zip$/ },
    ],
  },
  {
    id: 'linux',
    label: 'Linux',
    logo: 'linux',
    note: 'X11 and Wayland',
    help: 'One file that runs on most distributions. Make it executable, then launch it.',
    files: [
      { recommended: 'AppImage (recommended)', title: 'AppImage', detail: 'One file for most distributions.', format: '.AppImage', arch: 'x64', pattern: /-Linux-x64\.AppImage$/ },
      { title: '.deb package', detail: 'For Debian and Ubuntu. Install it with apt.', format: '.deb', arch: 'x64', pattern: /-Linux-x64\.deb$/ },
      { recommended: 'AppImage (recommended)', title: 'AppImage', detail: 'ARM64 PCs and Raspberry Pi 4/5.', format: '.AppImage', arch: 'arm64', pattern: /-Linux-arm64\.AppImage$/ },
      { title: '.deb package', detail: 'ARM64 Debian and Raspberry Pi OS.', format: '.deb', arch: 'arm64', pattern: /-Linux-arm64\.deb$/ },
    ],
  },
];

type System = { os?: Os; arch?: Arch };

type UserAgentData = {
  platform?: string;
  getHighEntropyValues?: (hints: string[]) => Promise<{ architecture?: string }>;
};

function osFrom(text: string): Os | undefined {
  if (/android|iphone|ipad|cros/i.test(text)) return undefined;
  if (/win/i.test(text)) return 'windows';
  if (/mac/i.test(text)) return 'macos';
  if (/linux/i.test(text)) return 'linux';
  return undefined;
}

/** Reads the visitor's OS and CPU from navigator.userAgentData when the browser exposes it, else the user agent string. */
async function detectSystem(): Promise<System> {
  const ua = navigator.userAgent;
  const data = (navigator as Navigator & { userAgentData?: UserAgentData }).userAgentData;
  const os = osFrom(data?.platform || ua);
  let arch: Arch | undefined = /aarch64|arm64/i.test(ua) ? 'arm64' : undefined;
  if (data?.getHighEntropyValues) {
    const { architecture } = await data.getHighEntropyValues(['architecture']).catch(() => ({ architecture: undefined }));
    if (architecture === 'arm') arch = 'arm64';
    if (architecture === 'x86') arch = 'x64';
  }
  return { os, arch };
}

type ChannelState =
  | { status: 'loading' }
  | { status: 'ready'; release: Release }
  | { status: 'error' };

function formatSize(bytes: number): string {
  return `${Math.max(1, Math.round(bytes / 1048576))} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
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

const archLabel = (arch: Arch, os: Os) => (os === 'macos' ? 'Apple silicon' : arch === 'x64' ? 'x64' : 'ARM64');

function OsCard({ platform, release, channel, system }: { platform: DesktopOs; release?: Release; channel: Channel; system: System }) {
  const detected = system.os === platform.id;
  const arch: Arch =
    detected && system.arch && platform.files.some((file) => file.recommended && file.arch === system.arch) ? system.arch : platform.files[0].arch;
  const recommended = platform.files.find((file) => file.recommended && file.arch === arch)!;
  const others = [...platform.files.filter((file) => file !== recommended && file.arch === arch), ...platform.files.filter((file) => file.arch !== arch)];
  const assetOf = (file: PackageFile) => release?.assets.find((asset) => file.pattern.test(asset.name));
  const primary = assetOf(recommended);

  return (
    <article
      className={`flex flex-col gap-4 rounded-2xl border p-[18px] sm:gap-[18px] sm:p-6 ${
        detected ? 'border-mint/40 bg-linear-160 from-mint/9 to-white/2 to-55% max-lg:order-first' : 'border-seam-soft bg-glass'
      }`}
    >
      {detected && (
        <span className="-mb-1 inline-flex w-fit items-center gap-1.5 rounded-md border border-mint/30 bg-mint/10 px-2 py-[5px] font-mono text-[10px] font-semibold uppercase leading-3 tracking-[0.08em] text-mint lg:hidden">
          <span aria-hidden className="size-1.5 rounded-full bg-mint" /> Your system
        </span>
      )}
      <header className="flex items-center gap-3.5">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-seam-soft bg-white/5">
          <BrandLogo brand={platform.logo} className="size-6" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h4 className="text-[22px] font-black leading-7 tracking-[-0.01em] text-ink">{platform.label}</h4>
          <span className="font-mono text-xs leading-4 text-muted">{platform.note}</span>
        </span>
        {detected && (
          <span className="hidden items-center gap-1.5 rounded-md border border-mint/30 bg-mint/10 px-2 py-[5px] font-mono text-[10px] font-semibold uppercase leading-3 tracking-[0.08em] text-mint lg:inline-flex">
            <span aria-hidden className="size-1.5 rounded-full bg-mint" /> Your system
          </span>
        )}
      </header>

      <div className="flex flex-col gap-2.5">
        {!release ? (
          <div className="h-[60px] animate-pulse rounded-xl bg-raised" />
        ) : primary ? (
          <a
            href={primary.browser_download_url}
            onClick={() => track('home_download_clicked', { platform: platform.id, channel, asset: primary.name })}
            className={`flex h-[60px] items-center gap-3 rounded-xl px-[18px] transition-colors ${
              detected ? 'bg-mint text-mint-ink hover:bg-[#93efca]' : 'border border-mint/30 bg-mint/14 text-mint hover:bg-mint/20'
            }`}
          >
            <Download className="size-[18px] shrink-0" strokeWidth={2.2} aria-hidden />
            <span className="flex min-w-0 flex-col">
              <span className="text-base font-black leading-[21px]">{recommended.recommended}</span>
              <span className="font-mono text-xs leading-4 opacity-70">
                {recommended.format} · {archLabel(arch, platform.id)} · {formatSize(primary.size)}
              </span>
            </span>
          </a>
        ) : (
          <p className="text-sm text-muted">No {platform.label} build in {release.tag_name}.</p>
        )}
        <p className="text-sm leading-[21px] text-muted">
          {platform.help}
          {detected && system.arch && platform.id !== 'macos' && ` Detected an ${archLabel(arch, platform.id)} computer.`}
        </p>
      </div>

      <div className="flex flex-col border-t border-seam-soft pt-3.5">
        <p className="pb-1.5 font-mono text-[11px] font-medium uppercase leading-[14px] tracking-[0.08em] text-faint">Other downloads</p>
        <ul>
          {others.map((file) => {
            const asset = assetOf(file);
            if (release && !asset) return null;
            return (
              <li key={`${file.arch}-${file.format}`} className="border-b border-white/4">
                {asset ? (
                  <a
                    href={asset.browser_download_url}
                    onClick={() => track('home_download_clicked', { platform: platform.id, channel, asset: asset.name })}
                    className="group flex items-center gap-3 py-2"
                  >
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="text-sm font-extrabold leading-[19px] text-ink group-hover:text-mint">{file.title}</span>
                      <span className="text-[13px] leading-[18px] text-muted">{file.detail}</span>
                    </span>
                    <span className="shrink-0 font-mono text-xs leading-4 text-body">
                      {archLabel(file.arch, platform.id)} · {formatSize(asset.size)}
                    </span>
                    <Download className="size-3.5 shrink-0 text-mint" strokeWidth={2} aria-hidden />
                  </a>
                ) : (
                  <span className="my-2 block h-9 animate-pulse rounded-md bg-raised" />
                )}
              </li>
            );
          })}
        </ul>
      </div>
      {platform.id === 'macos' && (
        <a href="https://github.com/OpenCloudGaming/OpenNOW-Mac/releases" className="group flex flex-col gap-2 rounded-xl border border-dashed border-seam px-4 py-3.5 sm:flex-row sm:items-center sm:gap-3">
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-sm font-extrabold leading-[19px] text-ink">Prefer a native SwiftUI app?</span>
            <span className="text-[13px] leading-[18px] text-muted">OpenNOW Mac is a separate client tuned for M-series Macs.</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-[13px] font-extrabold text-mint group-hover:underline group-hover:underline-offset-4">
            OpenNOW Mac <ArrowUpRight className="size-3.5" aria-hidden />
          </span>
        </a>
      )}
    </article>
  );
}

export function DesktopDownloads() {
  const [channel, setChannel] = useState<Channel>('stable');
  const [states, setStates] = useState<Record<Channel, ChannelState>>({ stable: { status: 'loading' }, nightly: { status: 'loading' } });
  const [system, setSystem] = useState<System>({});

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
    detectSystem().then((detected) => {
      if (!cancelled) setSystem(detected);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const state = states[channel];
  const release = state.status === 'ready' ? state.release : undefined;
  const checksums = release?.assets.find((asset) => asset.name === 'SHA256SUMS');

  return (
    <div className="mt-6 flex flex-col gap-4 sm:mt-9 sm:gap-5">
      <div className="flex flex-col justify-between gap-3.5 sm:flex-row sm:items-end sm:gap-6">
        <div className="flex flex-col gap-1.5">
          <h3 className="flex items-center gap-2.5 text-[22px] font-black leading-7 tracking-[-0.01em] text-ink sm:text-2xl sm:leading-[30px]">
            Desktop
            <span className="rounded-[5px] border border-mint/28 bg-mint/10 px-1.5 py-[3px] font-mono text-[10px] font-semibold uppercase leading-3 tracking-[0.08em] text-mint">Stable</span>
          </h3>
          <p className="text-[15px] leading-6 text-muted">
            Qt Quick + native NVST client for Windows, macOS, and Linux by zortosofficial1. We picked the right file for your computer.
          </p>
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

      {state.status === 'error' ? (
        <div className="flex flex-col items-start gap-3 rounded-[14px] border border-seam bg-[#0a0e18] p-5 sm:p-6">
          <p className="text-sm leading-6 text-muted">Couldn&apos;t reach the GitHub releases API, so direct links are unavailable right now.</p>
          <a
            href={RELEASES_URL}
            onClick={() => track('home_download_clicked', { platform: 'desktop-fallback', href: 'releases' })}
            className="inline-flex items-center gap-2 rounded-[9px] bg-mint px-4 py-2 text-sm font-extrabold text-mint-ink transition-colors hover:bg-[#93efca]"
          >
            Browse all releases <ArrowUpRight className="size-4" aria-hidden />
          </a>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-3 lg:gap-4" aria-busy={!release}>
          {PLATFORMS.map((platform) => (
            <OsCard key={platform.id} platform={platform} release={release} channel={channel} system={system} />
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-[22px] gap-y-2.5 rounded-xl border border-seam-soft bg-[#0a0e18] px-4 py-3.5 sm:px-5">
        {release && (
          <span className="inline-flex items-center gap-2 font-mono text-xs leading-4 max-sm:w-full">
            <span aria-hidden className={`size-2 rounded-full ${channel === 'stable' ? 'bg-green' : 'bg-amber'}`} />
            <span className="font-semibold text-ink">
              {channel === 'stable' ? 'Stable' : 'Nightly'} {release.tag_name}
            </span>
            <span className="text-muted">· released {formatDate(release.published_at)}</span>
          </span>
        )}
        <span className="flex-1 max-sm:hidden" />
        {checksums && (
          <a href={checksums.browser_download_url} className="inline-flex items-center gap-1.5 text-[13px] font-extrabold text-mint hover:underline hover:underline-offset-4">
            <FileCheck className="size-3.5" aria-hidden /> Verify checksums (SHA256SUMS)
          </a>
        )}
        <a
          href={RELEASES_URL}
          onClick={() => track('home_download_clicked', { platform: 'Desktop', href: RELEASES_URL })}
          className="inline-flex items-center gap-1.5 text-[13px] font-extrabold text-mint hover:underline hover:underline-offset-4"
        >
          Browse desktop builds <ArrowUpRight className="size-3.5" aria-hidden />
        </a>
        {release && (
          <a
            href={release.html_url}
            onClick={() => track('home_download_clicked', { platform: 'desktop-release-notes', channel, href: release.html_url })}
            className="inline-flex items-center gap-1.5 text-[13px] font-extrabold text-mint hover:underline hover:underline-offset-4"
          >
            All files and release notes <ArrowUpRight className="size-3.5" aria-hidden />
          </a>
        )}
      </div>
    </div>
  );
}
