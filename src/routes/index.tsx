import { createFileRoute, Link } from '@tanstack/react-router';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Camera,
  CircleHelp,
  Code2,
  CornerDownLeft,
  Download,
  FlaskConical,
  Gamepad2,
  Gauge,
  Laptop,
  MonitorPlay,
  Radio,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Wifi,
  type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { track } from '@/lib/analytics';
import { DesktopDownloads } from '@/components/desktop-downloads';
import { releases } from '@/lib/releases.gen';
import { HomeShell } from '@/components/home-shell';

const quickLinks: { title: string; description: string; splat: string; icon: LucideIcon }[] = [
  {
    title: 'Install OpenNOW',
    description: 'Choose the right package and launch your first stream.',
    splat: 'guides/getting-started',
    icon: Download,
  },
  {
    title: 'Tune your stream',
    description: 'Balance codec, resolution, frame rate, and bitrate.',
    splat: 'reference/configuration',
    icon: SlidersHorizontal,
  },
  {
    title: 'Fix a problem',
    description: 'Work through sign-in, launch, video, audio, and input issues.',
    splat: 'guides/troubleshooting',
    icon: CircleHelp,
  },
];

const highlights: { title: string; description: string; icon: LucideIcon; className: string }[] = [
  {
    title: 'Make the stream yours',
    description: 'Control codec, bitrate, resolution, FPS, color depth, region, L4S, and Cloud G-Sync from one place.',
    icon: Gauge,
    className: 'sm:col-span-2',
  },
  {
    title: 'Built to recover',
    description: 'Queue state, reconnect handling, launch errors, and session cleanup stay visible and actionable.',
    icon: ShieldCheck,
    className: '',
  },
  {
    title: 'Controller first',
    description: 'Use gamepads, pointer lock, mouse tuning, clipboard paste, microphone modes, and couch-friendly browsing.',
    icon: Gamepad2,
    className: '',
  },
  {
    title: 'Capture locally',
    description: 'Save screenshots and recordings with thumbnails, gallery access, and reveal-on-disk controls.',
    icon: Camera,
    className: 'sm:col-span-2',
  },
];

const deepDives = [
  ['Architecture', 'Follow a session across the Qt shell, out-of-process Rust core, and in-process streamer.', 'architecture/overview', Radio, false],
  ['Native streamer', 'See how the production NVST runtime loads in-process and presents GPU video in Qt.', 'reference/native-streamer', MonitorPlay, false],
  ['Protocol notes', 'Historical Chromium/WebRTC path notes retained for signaling and SDP context.', 'reference/webrtc', Wifi, true],
] as const;

const downloads: {
  title: string;
  description: string;
  format: string;
  href: string;
  icon: LucideIcon;
  cta: string;
  featured?: boolean;
}[] = [
  {
    title: 'Desktop',
    description: 'Qt Quick + native NVST client. Latest published desktop packages are OpenNOW-Qt (v1.0.1); historical tags may still ship Electron.',
    format: '.msi · .zip · .AppImage · .deb · .dmg',
    href: 'https://github.com/OpenCloudGaming/OpenNOW/releases',
    icon: Laptop,
    cta: 'Browse desktop builds',
    featured: true,
  },
  {
    title: 'Android',
    description: 'Install the stable mobile release directly from Google Play.',
    format: 'Google Play',
    href: 'https://play.google.com/store/apps/details?id=com.opencloudgaming.opennow',
    icon: Smartphone,
    cta: 'Open Google Play',
  },
  {
    title: 'Nintendo Switch',
    description: 'A native controller-first client for modded Switch systems.',
    format: 'SwitchNOW.nro',
    href: 'https://github.com/OpenCloudGaming/OpenNOW-Switch/releases/latest',
    icon: Gamepad2,
    cta: 'Get the Switch build',
  },
  {
    title: 'iPhone and iPad',
    description: 'Install the current iOS beta through Apple TestFlight.',
    format: 'TestFlight beta',
    href: 'https://testflight.apple.com/join/u1XPJKH2',
    icon: Smartphone,
    cta: 'Open TestFlight',
  },
  {
    title: 'OpenNOW Mac',
    description: 'A separate performance-focused macOS build by Jayian1890.',
    format: 'macOS .zip',
    href: 'https://github.com/OpenCloudGaming/OpenNOW-Mac/releases',
    icon: Laptop,
    cta: 'View Mac releases',
  },
  {
    title: 'Android Beta',
    description: 'Preview the latest Android changes with a direct APK.',
    format: '.apk beta',
    href: 'https://grid.printedwaste.com/download/3770b4c2c342a60242a18db9',
    icon: FlaskConical,
    cta: 'Download beta APK',
  },
];

function Kicker({ children }: { children: ReactNode }) {
  return <p className="font-mono text-[11px] font-medium uppercase leading-[14px] tracking-[0.08em] text-mint">{children}</p>;
}

function SectionHeading({ index, id, children }: { index: string; id?: string; children: ReactNode }) {
  return (
    <h2 id={id} className="flex items-start gap-3 text-balance text-[26px] font-black leading-[31px] tracking-[-0.015em] text-ink sm:gap-3.5 sm:text-[34px] sm:leading-10 sm:tracking-[-0.02em]">
      <span
        aria-hidden
        className="mt-0.5 grid h-[26px] w-[34px] shrink-0 place-items-center rounded-[7px] border border-mint/22 bg-mint/8 font-mono text-xs font-semibold leading-[14px] tracking-normal text-mint sm:mt-[7px]"
      >
        {index}
      </span>
      <span className="min-w-0">{children}</span>
    </h2>
  );
}

function IconTile({ icon: Icon, className = 'size-9 rounded-[9px]' }: { icon: LucideIcon; className?: string }) {
  return (
    <span className={`grid shrink-0 place-items-center border border-mint/18 bg-mint/10 text-mint ${className}`}>
      <Icon className="size-1/2" strokeWidth={1.75} aria-hidden />
    </span>
  );
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="grid h-[22px] min-w-[22px] place-items-center rounded-[5px] border border-seam-soft bg-raised px-1.5 font-mono text-[11px] font-medium leading-[14px] text-ink">
      {children}
    </kbd>
  );
}

function ReleaseReadout() {
  const channels = [
    { label: 'Stable', release: releases.stable, dot: 'bg-green shadow-[0_0_0_3px_rgb(29_185_84/0.16)]' },
    { label: 'Nightly', release: releases.nightly, dot: 'bg-amber shadow-[0_0_0_3px_rgb(255_209_102/0.16)]' },
  ].flatMap(({ release, ...channel }) => (release ? [{ ...channel, release }] : []));
  if (channels.length === 0) return null;
  return (
    <ul className="mt-5 flex flex-col gap-2.5 sm:mt-7 sm:flex-row sm:items-center sm:gap-4" aria-label="Current releases">
      {channels.map(({ label, release, dot }) => (
        <li key={label} className="flex items-center gap-2 sm:[&+li]:border-l sm:[&+li]:border-seam sm:[&+li]:pl-4">
          <span aria-hidden className={`size-2 rounded-full ${dot}`} />
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-muted">{label}</span>
          <a href={release.url} className="font-mono text-xs font-semibold text-ink underline-offset-4 hover:text-mint hover:underline">
            {release.tag}
          </a>
        </li>
      ))}
    </ul>
  );
}

function AppShot({ src, width, height, alt, eager = false }: { src: string; width: number; height: number; alt: string; eager?: boolean }) {
  return (
    <img
      src={`/home/${src}-1x.webp`}
      srcSet={`/home/${src}-1x.webp ${width}w, /home/${src}-2x.webp ${width * 2}w`}
      sizes={`(min-width: 1440px) ${width}px, (min-width: 1024px) calc(${width / 1440} * 100vw), calc(100vw - 40px)`}
      width={width}
      height={height}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding={eager ? 'sync' : 'async'}
      fetchPriority={eager ? 'high' : 'auto'}
      className="h-auto w-full rounded-[14px] sm:rounded-2xl"
    />
  );
}

function Home() {
  return (
    <HomeShell>
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-10 xl:px-16">
        <section aria-labelledby="home-title" className="grid items-center gap-8 pt-8 sm:pt-14 lg:grid-cols-[minmax(0,560px)_minmax(0,1fr)] lg:gap-14 lg:pb-10 lg:pt-[72px]">
          <div>
            <p className="inline-flex items-center gap-2.5 rounded-lg border border-mint/20 bg-mint/6 px-2.5 py-1.5">
              <img src="/brand/opennow-mark.png" alt="" width={19} height={11} className="h-[11px] w-[19px]" />
              <span className="font-mono text-[11px] font-medium uppercase leading-[14px] tracking-[0.08em] text-mint">Open-source cloud gaming</span>
            </p>
            <h1 id="home-title" className="mt-5 text-balance text-[38px] font-black leading-[42px] tracking-[-0.03em] text-ink sm:mt-7 sm:text-[52px] sm:leading-[56px] xl:text-[62px] xl:leading-[66px] xl:tracking-[-0.035em]">
              Your cloud games. Your rules.
            </h1>
            <p className="mt-4 max-w-[500px] text-pretty text-[17px] leading-[27px] text-body sm:mt-[22px] sm:text-[19px] sm:leading-[30px]">
              OpenNOW is an independent GeForce NOW client with deeper stream controls, local capture, and native apps across desktop, mobile, and Nintendo Switch.
            </p>
            <div className="mt-6 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:gap-3">
              <a
                href="#downloads"
                onClick={() => track('home_cta_clicked', { cta: 'choose_download', location: 'hero' })}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] bg-mint px-[18px] text-[15px] font-extrabold text-mint-ink transition-colors hover:bg-[#7bedb9] sm:h-11 sm:rounded-[9px]"
              >
                <Download className="size-4" aria-hidden />
                Choose a download
              </a>
              <Link
                to="/docs/$"
                params={{ _splat: 'guides/getting-started' }}
                onClick={() => track('home_cta_clicked', { cta: 'get_started', location: 'hero' })}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] border border-seam bg-glass px-[18px] text-[15px] font-bold text-ink transition-colors hover:bg-raised sm:h-11 sm:rounded-[9px]"
              >
                <BookOpen className="size-4" aria-hidden />
                Read the quick start
              </Link>
            </div>
            <ReleaseReadout />
          </div>
          <AppShot
            src="stage"
            width={696}
            height={620}
            eager
            alt="The OpenNOW in-stream Ctrl+G menu docked on the left over a game: live FPS, output resolution and bitrate, a Back to game button, and quick toggles for microphone, Anti-AFK, the stats overlay and fullscreen."
          />
        </section>

        <div className="grid gap-4 pb-14 pt-4 sm:gap-6 lg:grid-cols-[minmax(0,648fr)_minmax(0,640fr)] lg:pb-[88px] lg:pt-0">
          <AppShot
            src="mode"
            width={648}
            height={440}
            alt="OpenNOW first-launch onboarding, step 1 of 4: choose Desktop mode, with a compact sidebar, search and a detailed library, or Console mode, with big cover art and controller navigation."
          />
          <AppShot
            src="accounts"
            width={640}
            height={440}
            alt="The OpenNOW “Who's playing?” account picker: profile tiles show each account's membership tier, an alliance-partner badge and the last-used account, next to an Add account tile."
          />
        </div>

        <section aria-labelledby="start-here" className="grid gap-3.5 pb-14 sm:pb-24 lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-14">
          <div className="flex flex-col gap-3.5">
            <SectionHeading index="01" id="start-here">Start here</SectionHeading>
            <p className="text-base leading-[26px] text-body sm:pl-12 sm:text-[17px] sm:leading-[27px]">Three pages cover most of what people need first.</p>
          </div>
          <nav aria-label="Start here" className="mt-1 overflow-hidden rounded-[14px] border border-mint/22 bg-linear-to-b from-mint/5 to-white/2 lg:mt-0">
            <div className="flex items-center gap-2 border-b border-mint/16 px-3.5 py-3 sm:px-4">
              <CornerDownLeft className="size-3.5 text-mint" aria-hidden />
              <span className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-mint">Start here</span>
              <span className="ml-auto hidden items-center gap-1.5 text-[13px] font-semibold text-muted sm:flex">
                or search everything <Kbd>Ctrl</Kbd>
                <Kbd>K</Kbd>
              </span>
            </div>
            <ul>
              {quickLinks.map(({ title, description, splat, icon }) => (
                <li key={title} className="border-seam-soft [&+li]:border-t">
                  <Link
                    to="/docs/$"
                    params={{ _splat: splat }}
                    onClick={() => track('home_doc_card_clicked', { title, href: `/docs/${splat}` })}
                    className="group flex items-start gap-3 p-3.5 transition-colors hover:bg-white/3 sm:items-center sm:gap-4 sm:py-4 sm:pl-3.5 sm:pr-4"
                  >
                    <IconTile icon={icon} className="size-8 rounded-lg sm:size-9 sm:rounded-[9px]" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-extrabold leading-[21px] text-ink group-hover:text-mint sm:text-[17px] sm:leading-[22px]">{title}</span>
                      <span className="mt-[3px] block text-sm leading-[21px] text-muted">{description}</span>
                      <span className="mt-1 block font-mono text-[11px] font-medium text-faint sm:hidden">{splat}</span>
                    </span>
                    <span className="hidden w-[200px] font-mono text-xs font-medium text-faint sm:block">{splat}</span>
                    <span className="hidden sm:block">
                      <Kbd>↵</Kbd>
                    </span>
                    <ArrowRight className="mt-0.5 size-4 text-faint sm:hidden" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </section>

        <section id="downloads" aria-labelledby="downloads-title" className="scroll-mt-20 pb-14 sm:pb-24">
          <div className="flex flex-col gap-3.5 lg:flex-row lg:items-end lg:gap-6">
            <div className="flex flex-1 flex-col gap-3.5">
              <Kicker>Downloads</Kicker>
              <SectionHeading index="02" id="downloads-title">Pick the build made for your screen.</SectionHeading>
              <p className="text-base leading-[26px] text-body sm:pl-12 sm:text-[17px] sm:leading-[27px]">Stable releases, platform-native clients, and previews—all in one place.</p>
            </div>
            <a href="https://github.com/OpenCloudGaming/OpenNOW/releases" className="inline-flex w-fit items-center gap-2 pb-1 text-sm font-extrabold text-mint hover:underline hover:underline-offset-4">
              <Code2 className="size-[15px]" aria-hidden /> View release notes <ArrowUpRight className="size-[15px]" aria-hidden />
            </a>
          </div>
          <ul className="mt-6 grid gap-3 sm:mt-9 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
            {downloads.map(({ title, description, format, href, icon, cta, featured }) => (
              <li key={title}>
                <a
                  href={href}
                  onClick={() => track('home_download_clicked', { platform: title, href })}
                  className={`group flex h-full flex-col gap-3 rounded-[14px] border p-[18px] transition-colors sm:min-h-[232px] sm:gap-3.5 sm:p-5 ${
                    featured
                      ? 'border-mint/36 bg-linear-150 from-mint/10 via-white/2 via-60% to-white/2 hover:border-mint/60'
                      : 'border-seam-soft bg-glass hover:border-seam hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-start justify-between gap-3">
                    <IconTile icon={icon} className="size-[38px] rounded-[10px] sm:size-10" />
                    <span className="rounded-md border border-seam-soft bg-white/3 px-[9px] py-[5px] text-right font-mono text-[11px] font-medium leading-[14px] text-muted">{format}</span>
                  </span>
                  <span className="flex flex-col gap-1 sm:gap-1.5 sm:pt-1.5">
                    <span className="text-[19px] font-black leading-6 tracking-[-0.01em] text-ink sm:text-xl sm:leading-[26px]">{title}</span>
                    <span className="text-sm leading-[21px] text-muted sm:leading-[22px]">{description}</span>
                  </span>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-1 text-sm font-extrabold text-mint">
                    {cta} <ArrowUpRight className="size-[15px] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm leading-[22px] text-muted sm:mt-[18px]">
            Nintendo Switch requires custom firmware and Homebrew Menu.{' '}
            <Link to="/docs/$" params={{ _splat: 'guides/nintendo-switch' }} className="font-extrabold text-mint hover:underline hover:underline-offset-4">
              Read the installation guide
            </Link>
            .
          </p>
          <DesktopDownloads />
        </section>

        <section aria-labelledby="more-control" className="grid gap-3.5 pb-14 sm:pb-24 lg:grid-cols-[400px_minmax(0,1fr)] lg:gap-14">
          <div className="flex flex-col gap-3.5 lg:sticky lg:top-24 lg:self-start">
            <Kicker>More control</Kicker>
            <SectionHeading index="03" id="more-control">The useful controls aren’t hidden.</SectionHeading>
            <p className="text-base leading-[26px] text-body sm:pl-12 sm:text-[17px] sm:leading-[27px]">OpenNOW puts session quality, input, reliability, and capture where you can actually reach them.</p>
            <Link to="/docs/$" params={{ _splat: 'reference/configuration' }} className="inline-flex w-fit items-center gap-1.5 text-sm font-extrabold text-mint hover:underline hover:underline-offset-4 sm:ml-12 sm:mt-2">
              Explore every setting <ArrowRight className="size-[15px]" aria-hidden />
            </Link>
          </div>
          <ul className="mt-2.5 grid gap-3 sm:grid-cols-3 sm:gap-4 lg:mt-0">
            {highlights.map(({ title, description, icon: Icon, className }) => (
              <li key={title} className={`rounded-[14px] border border-seam-soft bg-glass p-[18px] sm:min-h-[208px] sm:p-[22px] ${className}`}>
                <span className="grid size-9 place-items-center rounded-[9px] bg-mint text-mint-ink sm:size-10 sm:rounded-[10px]">
                  <Icon className="size-[18px] sm:size-5" strokeWidth={1.75} aria-hidden />
                </span>
                <h3 className="mt-[18px] text-lg font-black leading-6 tracking-[-0.01em] text-ink sm:mt-7 sm:text-[19px] sm:leading-[25px]">{title}</h3>
                <p className="mt-1.5 max-w-[460px] text-sm leading-[22px] text-muted">{description}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="under-the-hood" className="pb-14 sm:pb-24">
          <div className="flex flex-col gap-3.5">
            <Kicker>Under the hood</Kicker>
            <SectionHeading index="04" id="under-the-hood">Documentation for people who want the whole picture.</SectionHeading>
          </div>
          <ul className="mt-2 divide-y divide-seam-soft border-y border-seam-soft sm:mt-8">
            {deepDives.map(([title, description, splat, Icon, historical]) => (
              <li key={title}>
                <Link
                  to="/docs/$"
                  params={{ _splat: splat }}
                  onClick={() => track('home_doc_card_clicked', { title, href: `/docs/${splat}` })}
                  className="group grid grid-cols-[38px_minmax(0,1fr)] items-start gap-x-3.5 gap-y-1 py-4 transition-colors hover:bg-white/2 sm:grid-cols-[44px_300px_minmax(0,1fr)_200px_16px] sm:items-center sm:gap-x-5 sm:px-1 sm:py-5"
                >
                  <IconTile icon={Icon} className="row-span-3 size-[38px] rounded-[10px] sm:row-span-1 sm:size-11 sm:rounded-[11px]" />
                  <span className="flex items-center gap-2.5">
                    <span className="text-[17px] font-black leading-[22px] text-ink group-hover:text-mint sm:text-lg sm:leading-6">{title}</span>
                    {historical && (
                      <span className="rounded-[5px] border border-amber/28 bg-amber/10 px-1.5 py-[3px] font-mono text-[10px] font-semibold uppercase leading-3 tracking-[0.08em] text-amber">Historical</span>
                    )}
                  </span>
                  <span className="text-sm leading-[22px] text-muted sm:text-[15px] sm:leading-6">{description}</span>
                  <span className="font-mono text-[11px] font-medium text-faint sm:text-xs">{splat}</span>
                  <ArrowRight className="hidden size-4 text-mint transition-transform group-hover:translate-x-1 sm:block" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="final-cta" className="pb-12 sm:pb-24">
          <div className="flex flex-col gap-4 rounded-[18px] border border-mint/22 bg-[radial-gradient(120%_140%_at_0%_0%,rgb(86_230_165/0.12)_0%,var(--color-surface)_55%)] px-[22px] py-7 lg:flex-row lg:items-center lg:gap-10 lg:px-12 lg:py-11">
            <span className="grid size-[52px] shrink-0 place-items-center rounded-[14px] border border-mint/22 bg-mint/10 text-mint lg:size-16 lg:rounded-2xl">
              <MonitorPlay className="size-[26px] lg:size-[30px]" strokeWidth={1.75} aria-hidden />
            </span>
            <div className="flex flex-1 flex-col gap-2">
              <h2 id="final-cta" className="text-balance text-[26px] font-black leading-[31px] tracking-[-0.015em] text-ink lg:text-[32px] lg:leading-[38px] lg:tracking-[-0.02em]">
                Ready to take control of the stream?
              </h2>
              <p className="text-base leading-[26px] text-body lg:text-[17px] lg:leading-[27px]">Start with the quick guide, or inspect every part of the open-source client.</p>
            </div>
            <div className="flex flex-col gap-2.5 pt-1 sm:flex-row sm:gap-3 lg:pt-0">
              <Link
                to="/docs/$"
                params={{ _splat: 'guides/getting-started' }}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] bg-mint px-[18px] text-[15px] font-extrabold text-mint-ink transition-colors hover:bg-[#7bedb9] sm:h-11 sm:rounded-[9px]"
              >
                <ArrowRight className="size-4" aria-hidden /> Get started
              </Link>
              <a
                href="https://github.com/OpenCloudGaming/OpenNOW"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] border border-seam bg-glass px-[18px] text-[15px] font-bold text-ink transition-colors hover:bg-raised sm:h-11 sm:rounded-[9px]"
              >
                <Code2 className="size-4" aria-hidden /> Browse the source
              </a>
            </div>
          </div>
        </section>
      </div>
    </HomeShell>
  );
}

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'OpenNOW — Open-source GeForce NOW client' },
      { name: 'description', content: 'Download OpenNOW and learn how to install, tune, and troubleshoot the open-source GeForce NOW client.' },
    ],
    links: [
      {
        rel: 'preload',
        as: 'image',
        href: '/home/stage-1x.webp',
        imageSrcSet: '/home/stage-1x.webp 696w, /home/stage-2x.webp 1392w',
        imageSizes: '(min-width: 1440px) 696px, (min-width: 1024px) calc(0.48333 * 100vw), calc(100vw - 40px)',
        fetchPriority: 'high',
      },
    ],
  }),
  component: Home,
});
