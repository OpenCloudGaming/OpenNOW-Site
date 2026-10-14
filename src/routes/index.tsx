import { createFileRoute, Link } from '@tanstack/react-router';
import {
  ArrowRight,
  ArrowUpRight,
  Camera,
  CircleHelp,
  Code2,
  CornerDownLeft,
  Download,
  Gamepad2,
  Gauge,
  MonitorPlay,
  Radio,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  Wifi,
  type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { track } from '@/lib/analytics';
import { DesktopDownloads } from '@/components/desktop-downloads';
import { BrandLogo, type Brand } from '@/components/brand-logos';
import { releases } from '@/lib/releases.gen';
import { HomeShell } from '@/components/home-shell';
import { BrandMark, consoleLinks } from '@/components/console';

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

type PortStatus = 'Stable' | 'Beta' | 'Experimental' | 'Coming soon';

const statusChip: Record<PortStatus, string> = {
  Stable: 'border-mint/28 bg-mint/10 text-mint',
  Beta: 'border-sky/28 bg-sky/10 text-sky',
  Experimental: 'border-amber/28 bg-amber/10 text-amber',
  'Coming soon': 'border-seam-soft bg-white/3 text-muted',
};

const portCard = 'group flex h-full flex-col gap-3 rounded-[14px] border p-[18px] transition-colors sm:min-h-[232px] sm:gap-3.5 sm:p-5';
const portCardIdle = 'border-seam-soft bg-glass hover:border-seam hover:bg-white/5';

const downloads: {
  title: string;
  description: string;
  format: string;
  href: string;
  logo: Brand | 'handheld';
  cta: string;
  status: PortStatus;
  maintainers: string;
}[] = [
  {
    title: 'Raspberry Pi 4/5',
    description: 'The desktop app’s Linux ARM64 build on 64-bit Raspberry Pi OS, with V4L2 hardware HEVC decoding.',
    format: 'ARM64 .AppImage · .deb',
    href: 'https://github.com/OpenCloudGaming/OpenNOW/releases/latest',
    logo: 'raspberrypi',
    cta: 'Get the ARM64 build',
    status: 'Beta',
    maintainers: 'zortosofficial1',
  },
  {
    title: 'OpenNOW Mac',
    description: 'A separate native SwiftUI client for macOS 15.6 or later, optimized for Apple M-series Macs.',
    format: 'macOS .dmg · .zip',
    href: 'https://github.com/OpenCloudGaming/OpenNOW-Mac/releases',
    logo: 'apple',
    cta: 'View Mac releases',
    status: 'Beta',
    maintainers: 'anderson.oki',
  },
  {
    title: 'Android',
    description: 'Install the stable mobile release directly from Google Play.',
    format: 'Google Play',
    href: 'https://play.google.com/store/apps/details?id=com.opencloudgaming.opennow',
    logo: 'android',
    cta: 'Open Google Play',
    status: 'Stable',
    maintainers: 'printedwaste',
  },
  {
    title: 'Android Beta',
    description: 'Preview the latest Android changes with a direct APK.',
    format: '.apk beta',
    href: 'https://grid.printedwaste.com/download/3770b4c2c342a60242a18db9',
    logo: 'android',
    cta: 'Download beta APK',
    status: 'Beta',
    maintainers: 'printedwaste',
  },
  {
    title: 'iPhone and iPad',
    description: 'Install the current iOS beta through Apple TestFlight.',
    format: 'TestFlight beta',
    href: 'https://testflight.apple.com/join/u1XPJKH2',
    logo: 'apple',
    cta: 'Open TestFlight',
    status: 'Beta',
    maintainers: 'printedwaste',
  },
  {
    title: 'Nintendo Switch',
    description: 'A native controller-first client for modded Switch systems.',
    format: 'SwitchNOW.nro',
    href: 'https://github.com/OpenCloudGaming/OpenNOW-Switch/releases/latest',
    logo: 'switch',
    cta: 'Get the Switch build',
    status: 'Beta',
    maintainers: 'zortosofficial1',
  },
  {
    title: 'PlayStation 5',
    description: 'A console-tested native prototype with hardware decoding and DualSense controls, for PS5 systems that run native homebrew.',
    format: 'Homebrew .zip',
    href: 'https://github.com/OpenCloudGaming/OpenNOW-PS5/releases',
    logo: 'playstation',
    cta: 'View PS5 releases',
    status: 'Experimental',
    maintainers: 'zortosofficial1 · koi_sats',
  },
  {
    title: 'PS Vita',
    description: 'A native Rust homebrew client with hardware H.264 decoding, confirmed working on an original PS Vita.',
    format: '.vpk',
    href: 'https://github.com/OpenCloudGaming/OpenNOW-vita/releases/latest',
    logo: 'playstation',
    cta: 'Get the Vita build',
    status: 'Beta',
    maintainers: 'josephinoo',
  },
  {
    title: 'DualScreen',
    description: 'A bottom-screen companion deck for Android handhelds with a built-in second display, such as the AYN Thor. No build is published yet.',
    format: 'Android · branch',
    href: 'https://github.com/OpenCloudGaming/OpenNOW/tree/android-dual-screen',
    logo: 'android',
    cta: 'View the branch',
    status: 'Experimental',
    maintainers: 'zortosofficial1',
  },
  {
    title: '4handhelds',
    description: 'A port for the R36S and other RK3326 handhelds running dArkOS. The first release has not shipped yet.',
    format: 'R36S · RK3326',
    href: 'https://github.com/OpenCloudGaming/OpenNOW-4Handhelds',
    logo: 'handheld',
    cta: 'Follow the repo',
    status: 'Coming soon',
    maintainers: 'dpadguy__',
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

function ReleaseReadout({ className = '' }: { className?: string }) {
  const channels = [
    { label: 'Stable', release: releases.stable, tone: 'text-white' },
    { label: 'Nightly', release: releases.nightly, tone: 'text-white/64' },
  ].flatMap(({ release, ...channel }) => (release ? [{ ...channel, release }] : []));
  if (channels.length === 0) return null;
  return (
    <ul className={`flex flex-col gap-0.5 font-mono text-xs font-semibold uppercase leading-[14px] tracking-[0.08em] ${className}`} aria-label="Current releases">
      {channels.map(({ label, release, tone }) => (
        <li key={label} className={tone}>
          {label}{' '}
          <a href={release.url} className="underline-offset-4 hover:text-mint hover:underline">
            {release.tag}
          </a>
        </li>
      ))}
    </ul>
  );
}

const pillPrimary =
  'inline-flex h-14 items-center justify-center gap-3 rounded-full bg-white px-[30px] text-[18px] font-black leading-6 text-ground shadow-[0_18px_44px_rgb(127_212_255/20%)] transition-colors hover:bg-white/88 sm:h-16';
const pillGlass =
  'inline-flex h-14 items-center justify-center gap-3 rounded-full border border-seam bg-[rgb(14_16_24/82%)] px-7 text-[18px] font-extrabold leading-6 text-white transition-colors hover:bg-[rgb(30_36_52/92%)] sm:h-16';

/** A real app screen from the OpenNOW Paper files (master file, console mode from Game Mode v4), framed like the docs' app figures. */
function AppWindow({ src, label, alt }: { src: string; label: string; alt: string }) {
  return (
    <figure className="overflow-hidden rounded-xl border border-seam-soft bg-surface">
      <figcaption className="flex h-10 items-center gap-2.5 border-b border-seam-soft px-4">
        <BrandMark height={11} />
        <span className="truncate font-mono text-[11px] font-medium uppercase leading-[14px] tracking-[0.08em] text-muted">{label}</span>
        <span aria-hidden className="ms-auto flex gap-1.5">
          <span className="size-1.5 rounded-full bg-white/14" />
          <span className="size-1.5 rounded-full bg-white/14" />
          <span className="size-1.5 rounded-full bg-white/14" />
        </span>
      </figcaption>
      <img
        src={`/home/${src}-648.webp`}
        srcSet={`/home/${src}-648.webp 648w, /home/${src}-1296.webp 1296w`}
        sizes="(min-width: 1440px) 648px, (min-width: 1024px) calc(50vw - 72px), calc(100vw - 40px)"
        width={648}
        height={364}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="block aspect-[648/364] h-auto w-full object-cover"
      />
    </figure>
  );
}

function Home() {
  return (
    <HomeShell>
      <section aria-labelledby="home-title" className="home-hero-art">
        <div className="mx-auto flex max-w-[1080px] flex-col items-center gap-5 px-5 pt-10 text-center sm:gap-7 sm:pt-[88px]">
          <p className="inline-flex h-10 items-center gap-2.5 rounded-full border border-seam bg-[rgb(14_16_24/82%)] px-[18px] font-mono text-xs font-semibold uppercase leading-[14px] tracking-[0.08em] text-white">
            <span aria-hidden className="size-2 shrink-0 rounded-full bg-mint" />
            Open-source cloud gaming<span className="hidden sm:inline"> · Bring your own GeForce NOW account</span>
          </p>
          <h1 id="home-title" className="max-w-[880px] text-balance text-[39px] font-black leading-[41px] tracking-[-0.045em] text-white sm:text-[64px] sm:leading-[64px] lg:text-[96px] lg:leading-[94px] lg:tracking-[-0.055em]">
            <span className="sm:block">Your cloud games.</span> <span className="sm:block">Your rules.</span>
          </h1>
          <p className="max-w-[720px] text-pretty text-[17px] font-medium leading-[27px] text-white/64 sm:text-xl sm:leading-8">
            OpenNOW is an independent GeForce NOW client with deeper stream controls, local capture, and native apps across desktop, mobile, and Nintendo Switch.
          </p>
          <div className="flex w-full flex-col items-stretch gap-2.5 pt-1 sm:w-auto sm:flex-row sm:items-center sm:gap-3.5 sm:pt-2">
            <a
              href="#downloads"
              onClick={() => track('home_cta_clicked', { cta: 'choose_download', location: 'hero' })}
              className={pillPrimary}
            >
              <Download className="size-5" strokeWidth={2.4} aria-hidden />
              Choose a download
            </a>
            <Link
              to="/docs/$"
              params={{ _splat: 'guides/getting-started' }}
              onClick={() => track('home_cta_clicked', { cta: 'get_started', location: 'hero' })}
              className={pillGlass}
            >
              Read the quick start
            </Link>
            <ReleaseReadout className="items-center pt-2 sm:items-start sm:pl-3.5 sm:pt-0 sm:text-left" />
          </div>
        </div>
        <div className="flex justify-center px-5 pb-12 pt-9 sm:px-10 sm:pb-24 sm:pt-[72px]">
          <img
            src="/home/hero-1200.webp"
            srcSet="/home/hero-600.webp 600w, /home/hero-1200.webp 1200w, /home/hero-2400.webp 2400w"
            sizes="(min-width: 1280px) 1200px, calc(100vw - 40px)"
            width={1200}
            height={750}
            alt="The OpenNOW desktop Home screen: a Continue playing banner for Cyberpunk 2077 with Start and Details buttons and a 1440p · 120 fps · AV1 readout, then Jump back in and Favourites rows of game covers, the icon sidebar on the left and a shortcut bar along the bottom."
            fetchPriority="high"
            decoding="async"
            className="h-auto w-full max-w-[1200px] rounded-[14px] border border-seam shadow-[0_40px_100px_rgb(0_0_0/65%)] sm:rounded-[28px]"
          />
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-10 xl:px-16">
        <div className="grid gap-4 pb-14 sm:gap-4 lg:grid-cols-2 lg:pb-24">
          <AppWindow
            src="esc-menu"
            label="In the app · Desktop · In-stream menu (Esc)"
            alt="The OpenNOW desktop in-stream menu over Elden Ring: live FPS, latency and bitrate, Back to game, Stream quality, Invite a friend, Switch to console mode and End session, next to a connection graph and the F3 stats overlay shortcuts."
          />
          <AppWindow
            src="console"
            label="In the app · Console mode · My games"
            alt="OpenNOW console mode, My games: Cyberpunk 2077 focused as a wide tile at the start of a grid of large game tiles with store badges and an Add a game tile, the profile, region, clock and battery pills along the top, and the controller dock with Search, Edit tile and Details hints along the bottom."
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
                      <span className="mt-1 block font-mono text-[11px] font-medium text-muted sm:hidden">{splat}</span>
                    </span>
                    <span className="hidden w-[200px] font-mono text-xs font-medium text-muted sm:block">{splat}</span>
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
              <p className="text-base leading-[26px] text-body sm:pl-12 sm:text-[17px] sm:leading-[27px]">Every OpenNOW port, who builds it, and how far along it is—all in one place.</p>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <Link
                to="/docs/$"
                params={{ _splat: 'guides/ports-and-team' }}
                onClick={() => track('home_doc_card_clicked', { title: 'Ports & team', href: '/docs/guides/ports-and-team' })}
                className="inline-flex w-fit items-center gap-2 pb-1 text-sm font-extrabold text-mint hover:underline hover:underline-offset-4"
              >
                <Users className="size-[15px]" aria-hidden /> Meet the team <ArrowRight className="size-[15px]" aria-hidden />
              </Link>
              <a href="https://github.com/OpenCloudGaming/OpenNOW/releases" className="inline-flex w-fit items-center gap-2 pb-1 text-sm font-extrabold text-mint hover:underline hover:underline-offset-4">
                <Code2 className="size-[15px]" aria-hidden /> View release notes <ArrowUpRight className="size-[15px]" aria-hidden />
              </a>
            </div>
          </div>
          <DesktopDownloads />
          <div className="mt-12 flex flex-col gap-3.5 sm:mt-16 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
            <div className="flex flex-col gap-1.5">
              <h3 className="text-[22px] font-black leading-7 tracking-[-0.01em] text-ink sm:text-2xl sm:leading-[30px]">Phones, consoles, and handhelds</h3>
              <p className="text-[15px] leading-6 text-muted">Separate ports, each built by someone on the team. Status shows how far along each one is.</p>
            </div>
            <Link
              to="/docs/$"
              params={{ _splat: 'guides/ports-and-team' }}
              onClick={() => track('home_doc_card_clicked', { title: 'Ports & team', href: '/docs/guides/ports-and-team' })}
              className="inline-flex w-fit shrink-0 items-center gap-1.5 pb-1 text-sm font-extrabold text-mint hover:underline hover:underline-offset-4"
            >
              Status and requirements for every port <ArrowRight className="size-[15px]" aria-hidden />
            </Link>
          </div>
          <ul className="mt-5 grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
            {downloads.map(({ title, description, format, href, logo, cta, status, maintainers }) => (
              <li key={title}>
                <a href={href} onClick={() => track('home_download_clicked', { platform: title, href })} className={`${portCard} ${portCardIdle}`}>
                  <span className="flex items-start justify-between gap-3">
                    <span className="grid size-[38px] shrink-0 place-items-center rounded-[10px] border border-seam-soft bg-white/5 sm:size-11 sm:rounded-[11px]">
                      {logo === 'handheld' ? <Gamepad2 className="size-[22px] text-body" strokeWidth={1.75} aria-hidden /> : <BrandLogo brand={logo} className="size-5 sm:size-[22px]" />}
                    </span>
                    <span className="rounded-md border border-seam-soft bg-white/3 px-[9px] py-[5px] text-right font-mono text-[11px] font-medium leading-[14px] text-muted">{format}</span>
                  </span>
                  <span className="flex flex-col gap-1 sm:gap-1.5 sm:pt-1">
                    <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                      <span className="text-[19px] font-black leading-6 tracking-[-0.01em] text-ink sm:leading-[25px]">{title}</span>
                      <span className={`rounded-[5px] border px-1.5 py-[3px] font-mono text-[10px] font-semibold uppercase leading-3 tracking-[0.08em] ${statusChip[status]}`}>{status}</span>
                    </span>
                    <span className="text-sm leading-[21px] text-muted">{description}</span>
                    <span className="font-mono text-xs leading-4 text-body">by {maintainers}</span>
                  </span>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-1 text-sm font-extrabold text-mint">
                    {cta} <ArrowUpRight className="size-[15px] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </a>
              </li>
            ))}
            <li className="md:col-span-2">
              <a
                href={consoleLinks.discord}
                onClick={() => track('home_cta_clicked', { cta: 'help_port', location: 'downloads' })}
                className={`${portCard} border-dashed border-white/16 bg-linear-150 from-[rgb(88_101_242/10%)] to-white/2 to-60% hover:border-seam hover:bg-white/5`}
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="grid size-[38px] shrink-0 place-items-center rounded-[10px] border border-seam-soft bg-white/5 sm:size-11 sm:rounded-[11px]">
                    <BrandLogo brand="discord" className="size-5 sm:size-[22px]" />
                  </span>
                  <span className="rounded-md border border-seam-soft bg-white/3 px-[9px] py-[5px] text-right font-mono text-[11px] font-medium leading-[14px] text-muted">Discord</span>
                </span>
                <span className="flex flex-col gap-1 sm:gap-1.5 sm:pt-1">
                  <span className="text-[19px] font-black leading-6 tracking-[-0.01em] text-ink sm:leading-[25px]">Your device next</span>
                  <span className="text-sm leading-[21px] text-muted">Want to help bring OpenNOW to more devices? Reach out to the team!</span>
                </span>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-1 text-sm font-extrabold text-mint">
                  Join the Discord <ArrowUpRight className="size-[15px] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                </span>
              </a>
            </li>
          </ul>
          <p className="mt-4 text-sm leading-[22px] text-muted sm:mt-[18px]">
            Nintendo Switch requires custom firmware and Homebrew Menu.{' '}
            <Link to="/docs/$" params={{ _splat: 'guides/nintendo-switch' }} className="font-extrabold text-mint hover:underline hover:underline-offset-4">
              Read the installation guide
            </Link>
            . Status, maintainers, and hardware requirements for every port are in{' '}
            <Link to="/docs/$" params={{ _splat: 'guides/ports-and-team' }} className="font-extrabold text-mint hover:underline hover:underline-offset-4">
              Ports &amp; team
            </Link>
            .
          </p>
          <p className="mt-1.5 text-xs leading-[18px] text-faint">Platform names and logos are trademarks of their respective owners.</p>
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
                  <span className="font-mono text-[11px] font-medium text-muted sm:text-xs">{splat}</span>
                  <ArrowRight className="hidden size-4 text-mint transition-transform group-hover:translate-x-1 sm:block" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>

      </div>

      <section aria-labelledby="final-cta" className="home-cta-art border-t border-seam">
        <div className="mx-auto flex max-w-[900px] flex-col items-center gap-5 px-5 py-16 text-center sm:gap-[26px] sm:py-[120px]">
          <span className="grid size-[72px] place-items-center rounded-[22px] border-[3px] border-white bg-[#0b0b0a] shadow-[0_20px_60px_rgb(0_0_0/60%)] sm:size-[88px] sm:rounded-[26px]">
            <img src="/brand/opennow-mark.png" alt="" width={52} height={28} loading="lazy" className="h-6 w-auto drop-shadow-[0_0_18px_rgb(94_226_60/45%)] sm:h-7" />
          </span>
          <h2 id="final-cta" className="text-balance text-[34px] font-black leading-[37px] tracking-[-0.045em] text-white sm:text-[56px] sm:leading-[58px] lg:text-[76px] lg:leading-[76px] lg:tracking-[-0.055em]">
            Ready to take control of the stream?
          </h2>
          <p className="max-w-[600px] text-pretty text-[17px] font-medium leading-[27px] text-white/64 sm:text-xl sm:leading-[30px]">
            Start with the quick guide, or inspect every part of the open-source client.
          </p>
          <div className="flex w-full flex-col items-stretch gap-2.5 pt-1 sm:w-auto sm:flex-row sm:gap-3.5">
            <Link
              to="/docs/$"
              params={{ _splat: 'guides/getting-started' }}
              className={pillPrimary}
            >
              <ArrowRight className="size-5" strokeWidth={2.4} aria-hidden /> Get started
            </Link>
            <a
              href="https://github.com/OpenCloudGaming/OpenNOW"
              className={pillGlass}
            >
              Browse the source
            </a>
          </div>
        </div>
      </section>
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
        href: '/home/hero-1200.webp',
        imageSrcSet: '/home/hero-600.webp 600w, /home/hero-1200.webp 1200w, /home/hero-2400.webp 2400w',
        imageSizes: '(min-width: 1280px) 1200px, calc(100vw - 40px)',
        fetchPriority: 'high',
      },
      { rel: 'preload', as: 'image', href: '/home/keyart-1600.webp', media: '(min-width: 800px)', fetchPriority: 'high' },
    ],
  }),
  component: Home,
});
