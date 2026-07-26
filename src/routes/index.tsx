import { createFileRoute, Link } from '@tanstack/react-router';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  Download,
  Gauge,
  Gamepad2,
  Code2,
  Laptop,
  MonitorPlay,
  ShieldCheck,
  Smartphone,
  type LucideIcon,
} from 'lucide-react';
import { baseOptions } from '@/lib/layout.shared';
import { track } from '@/lib/analytics';

const highlights: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: 'Stream tuning',
    description: 'Codec, bitrate, resolution, FPS, color depth, region, L4S, and Cloud G-Sync controls in one desktop UI.',
    icon: Gauge,
  },
  {
    title: 'Session reliability',
    description: 'OAuth, CloudMatch, queue state, reconnect handling, and launch errors live in the Electron main process.',
    icon: ShieldCheck,
  },
  {
    title: 'Input + controller mode',
    description: 'Keyboard, pointer lock, mouse tuning, gamepad support, clipboard paste, microphone modes, and couch-friendly browsing.',
    icon: Gamepad2,
  },
  {
    title: 'Capture built in',
    description: 'Screenshots and recordings are saved locally with formats, thumbnails, gallery access, and reveal-on-disk controls.',
    icon: Camera,
  },
];

const docs = [
  ['Getting started', 'Install, sign in, choose quality settings, and launch your first game.', 'guides/getting-started'],
  ['Architecture', 'Main, preload, renderer, native streamer, IPC, and session ownership.', 'architecture/overview'],
  ['Configuration', 'Every setting, default, storage behavior, and compatibility rule.', 'reference/configuration'],
  ['WebRTC internals', 'Signaling, SDP, ICE, NVST data channels, and Chromium flags.', 'reference/webrtc'],
] as const;

const stats = [
  ['Platforms', 'Windows · macOS · Linux · Switch · iOS beta'],
  ['Stream path', 'Chromium WebRTC by default'],
  ['Switch client', 'Native Horizon OS homebrew'],
  ['Source', 'Electron desktop · C++ Switch client'],
] as const;

const downloads: {
  title: string;
  description: string;
  format: string;
  href: string;
  icon: LucideIcon;
  cta: string;
}[] = [
  {
    title: 'Desktop',
    description: 'Windows, macOS, and Linux packages for the main Electron client.',
    format: '.exe · .dmg · .zip · .AppImage · .deb',
    href: 'https://github.com/OpenCloudGaming/OpenNOW/releases/latest',
    icon: Laptop,
    cta: 'Download desktop',
  },
  {
    title: 'Nintendo Switch',
    description: 'Native controller-first homebrew client for modded Switch systems.',
    format: 'SwitchNOW.nro',
    href: 'https://github.com/OpenCloudGaming/OpenNOW-Switch/releases/latest',
    icon: Gamepad2,
    cta: 'Download for Switch',
  },
  {
    title: 'iPhone and iPad',
    description: 'Install the current iOS beta through Apple TestFlight.',
    format: 'TestFlight beta',
    href: 'https://testflight.apple.com/join/u1XPJKH2',
    icon: Smartphone,
    cta: 'Open TestFlight',
  },
];

function Home() {
  return (
    <HomeLayout {...baseOptions()}>
      <main className="flex flex-1 flex-col">
        <section className="mx-auto flex w-full max-w-3xl flex-col items-center px-6 pb-16 pt-20 text-center md:pt-28">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-fd-card px-3 py-1 text-sm text-fd-muted-foreground">
            <BadgeCheck className="size-4 text-emerald-500" />
            Independent open-source GeForce NOW client
          </div>
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-fd-foreground sm:text-5xl">
            Stream, tune, capture, and control GeForce NOW from an open client.
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-lg leading-8 text-fd-muted-foreground">
            OpenNOW is an open-source GeForce NOW client with desktop builds for Windows, macOS, and Linux, plus native Nintendo Switch homebrew and an iOS beta.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#downloads"
              onClick={() => track('home_cta_clicked', { cta: 'choose_download', location: 'hero' })}
              className="group inline-flex items-center justify-center gap-2 rounded-lg bg-fd-primary px-5 py-2.5 text-sm font-medium text-fd-primary-foreground transition hover:opacity-90"
            >
              <Download className="size-4" />
              Choose a download
              <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
            </a>
            <Link
              to="/docs/$"
              params={{ _splat: '' }}
              onClick={() => track('home_cta_clicked', { cta: 'read_docs', location: 'hero' })}
              className="inline-flex items-center justify-center gap-2 rounded-lg border bg-fd-card px-5 py-2.5 text-sm font-medium text-fd-foreground transition hover:bg-fd-accent"
            >
              <MonitorPlay className="size-4" />
              Read the docs
            </Link>
            <a
              href="https://github.com/OpenCloudGaming/OpenNOW"
              onClick={() => track('home_cta_clicked', { cta: 'github', location: 'hero' })}
              className="inline-flex items-center justify-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium text-fd-muted-foreground transition hover:bg-fd-accent hover:text-fd-foreground"
            >
              <Code2 className="size-4" />
              GitHub
            </a>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-7xl gap-4 px-6 pb-16 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(([label, value]) => (
            <div key={label} className="rounded-xl border bg-fd-card p-5">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-fd-muted-foreground">{label}</p>
              <p className="mt-2 text-sm font-medium text-fd-foreground">{value}</p>
            </div>
          ))}
        </section>

        <section id="downloads" className="mx-auto w-full max-w-7xl scroll-mt-20 px-6 pb-16">
          <h2 className="text-2xl font-semibold tracking-tight text-fd-foreground">Download OpenNOW</h2>
          <p className="mt-2 text-fd-muted-foreground">Choose the client built for your device.</p>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {downloads.map(({ title, description, format, href, icon: Icon, cta }) => (
              <a
                key={title}
                href={href}
                onClick={() => track('home_download_clicked', { platform: title, href })}
                className="group flex flex-col rounded-xl border bg-fd-card p-6 text-left transition hover:bg-fd-accent"
              >
                <span className="grid size-10 place-items-center rounded-lg bg-emerald-400/10 text-emerald-500">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-5 text-lg font-medium text-fd-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-fd-muted-foreground">{description}</p>
                <p className="mt-4 text-xs font-medium uppercase tracking-[0.14em] text-fd-muted-foreground">{format}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-fd-primary">
                  {cta} <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                </span>
              </a>
            ))}
          </div>
          <p className="mt-4 text-sm text-fd-muted-foreground">
            Nintendo Switch installation requires custom firmware and Homebrew Menu.{' '}
            <Link
              to="/docs/$"
              params={{ _splat: 'guides/nintendo-switch' }}
              className="font-medium text-fd-primary hover:opacity-80"
            >
              Read the Switch installation guide
            </Link>
            .
          </p>
        </section>

        <section className="mx-auto w-full max-w-7xl px-6 pb-16">
          <h2 className="text-2xl font-semibold tracking-tight text-fd-foreground">What the client does</h2>
          <p className="mt-2 text-fd-muted-foreground">Documented from the source.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map(({ title, description, icon: Icon }) => (
              <div key={title} className="rounded-xl border bg-fd-card p-5">
                <span className="grid size-9 place-items-center rounded-lg bg-emerald-400/10 text-emerald-500">
                  <Icon className="size-5" />
                </span>
                <p className="mt-4 font-medium text-fd-foreground">{title}</p>
                <p className="mt-2 text-sm leading-6 text-fd-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-6 pb-24">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-fd-foreground">Start where the problem is</h2>
              <p className="mt-2 text-fd-muted-foreground">Documentation that matches the app.</p>
            </div>
            <Link
              to="/docs/$"
              params={{ _splat: '' }}
              onClick={() => track('home_open_full_docs_clicked')}
              className="text-sm font-medium text-fd-primary hover:opacity-80"
            >
              Open full docs →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {docs.map(([title, description, splat]) => (
              <Link
                key={title}
                to="/docs/$"
                params={{ _splat: splat }}
                onClick={() => track('home_doc_card_clicked', { title, splat })}
                className="group rounded-xl border bg-fd-card p-5 text-left transition hover:bg-fd-accent"
              >
                <h3 className="font-medium text-fd-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-fd-muted-foreground">{description}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-fd-primary">
                  Read section <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </HomeLayout>
  );
}

export const Route = createFileRoute('/')({
  component: Home,
});
