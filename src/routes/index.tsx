import { createFileRoute, Link } from '@tanstack/react-router';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import {
  ArrowRight,
  ArrowUpRight,
  Camera,
  Code2,
  Download,
  FlaskConical,
  Gamepad2,
  Gauge,
  Laptop,
  MonitorPlay,
  Radio,
  ShieldCheck,
  Smartphone,
  Wifi,
  type LucideIcon,
} from 'lucide-react';
import { baseOptions } from '@/lib/layout.shared';
import { track } from '@/lib/analytics';

const quickLinks: { title: string; description: string; href: string }[] = [
  {
    title: 'Install OpenNOW',
    description: 'Choose the right package and launch your first stream.',
    href: '/docs/guides/getting-started',
  },
  {
    title: 'Tune your stream',
    description: 'Balance codec, resolution, frame rate, and bitrate.',
    href: '/docs/reference/configuration',
  },
  {
    title: 'Fix a problem',
    description: 'Work through sign-in, launch, video, audio, and input issues.',
    href: '/docs/guides/troubleshooting',
  },
];

const highlights: { title: string; description: string; icon: LucideIcon; className: string }[] = [
  {
    title: 'Make the stream yours',
    description: 'Control codec, bitrate, resolution, FPS, color depth, region, L4S, and Cloud G-Sync from one place.',
    icon: Gauge,
    className: 'lg:col-span-2',
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
    className: 'lg:col-span-2',
  },
];

const deepDives = [
  ['Architecture', 'Follow a session across Electron main, preload, renderer, and the native process.', 'architecture/overview', Radio],
  ['WebRTC internals', 'Understand signaling, SDP, ICE, NVST data channels, and Chromium flags.', 'reference/webrtc', Wifi],
  ['Native streamer', 'Explore the experimental Rust and GStreamer path, runtime checks, and fallback.', 'reference/native-streamer', FlaskConical],
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
    description: 'The main Electron client for Windows, macOS, and Linux.',
    format: '.exe · .dmg · .zip · .AppImage · .deb',
    href: 'https://github.com/OpenCloudGaming/OpenNOW/releases/latest',
    icon: Laptop,
    cta: 'Get the latest release',
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

function Home() {
  return (
    <HomeLayout {...baseOptions()}>
      <main className="home-page flex flex-1 flex-col overflow-hidden">
        <section className="hero-grid relative border-b">
          <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-6 pb-20 pt-20 text-center lg:pb-28 lg:pt-28">
            <p className="mb-7 text-xs font-semibold uppercase tracking-[0.18em] text-fd-primary">Open-source cloud gaming</p>
            <h1 className="text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-fd-foreground sm:text-6xl lg:text-7xl">
              Your cloud games. Your rules.
            </h1>
            <p className="mt-7 max-w-xl text-pretty text-lg leading-8 text-fd-muted-foreground">
              OpenNOW is an independent GeForce NOW client with deeper stream controls, local capture, and native apps across desktop, mobile, and Nintendo Switch.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href="#downloads"
                onClick={() => track('home_cta_clicked', { cta: 'choose_download', location: 'hero' })}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-fd-primary px-5 py-3 text-sm font-semibold text-fd-primary-foreground transition-colors hover:opacity-90"
              >
                <Download className="size-4" />
                Choose a download
              </a>
              <Link
                to="/docs/$"
                params={{ _splat: 'guides/getting-started' }}
                onClick={() => track('home_cta_clicked', { cta: 'get_started', location: 'hero' })}
                className="inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold text-fd-foreground transition-colors hover:bg-fd-accent"
              >
                Read the quick start
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-3xl px-6 py-20 sm:py-24">
          <h2 className="text-2xl font-semibold tracking-tight text-fd-foreground sm:text-3xl">Start here</h2>
          <p className="mt-3 leading-7 text-fd-muted-foreground">Three pages cover most of what people need first.</p>
          <nav className="mt-8 border-t" aria-label="Start here">
            {quickLinks.map(({ title, description, href }) => (
              <Link
                key={title}
                to={href}
                onClick={() => track('home_doc_card_clicked', { title, href })}
                className="group flex items-start justify-between gap-6 border-b py-5"
              >
                <span>
                  <span className="block font-medium text-fd-foreground transition group-hover:text-fd-primary">{title}</span>
                  <span className="mt-1 block text-sm leading-6 text-fd-muted-foreground">{description}</span>
                </span>
                <ArrowRight className="mt-1.5 size-4 shrink-0 text-fd-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-fd-primary" />
              </Link>
            ))}
          </nav>
        </section>

        <section id="downloads" className="download-zone scroll-mt-20 border-y">
          <div className="mx-auto w-full max-w-7xl px-6 py-20 sm:py-24">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div className="max-w-2xl">
                <p className="section-kicker">Downloads</p>
                <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-fd-foreground sm:text-4xl">Pick the build made for your screen.</h2>
                <p className="mt-4 text-lg leading-8 text-fd-muted-foreground">Stable releases, platform-native clients, and previews—all in one place.</p>
              </div>
              <a href="https://github.com/OpenCloudGaming/OpenNOW/releases" className="inline-flex items-center gap-2 text-sm font-semibold text-fd-primary hover:opacity-80">
                <Code2 className="size-4" /> View release notes <ArrowUpRight className="size-4" />
              </a>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {downloads.map(({ title, description, format, href, icon: Icon, cta, featured }) => (
                <a
                  key={title}
                  href={href}
                  onClick={() => track('home_download_clicked', { platform: title, href })}
                  className={`download-card group flex min-h-64 flex-col rounded-2xl border p-6 transition hover:-translate-y-1 ${featured ? 'download-card-featured' : 'bg-fd-card/75'}`}
                >
                  <div className="flex items-start justify-between">
                    <span className="grid size-11 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                      <Icon className="size-5" />
                    </span>
                    <span className="rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-fd-muted-foreground">{format}</span>
                  </div>
                  <h3 className="mt-7 text-xl font-semibold text-fd-foreground">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-fd-muted-foreground">{description}</p>
                  <span className="mt-auto inline-flex items-center gap-2 pt-7 text-sm font-semibold text-fd-primary">
                    {cta} <ArrowUpRight className="size-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </a>
              ))}
            </div>
            <p className="mt-5 text-sm text-fd-muted-foreground">
              Nintendo Switch requires custom firmware and Homebrew Menu.{' '}
              <Link to="/docs/$" params={{ _splat: 'guides/nintendo-switch' }} className="font-semibold text-fd-primary hover:opacity-80">Read the installation guide</Link>.
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-6 py-20 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div className="lg:sticky lg:top-28">
              <p className="section-kicker">More control</p>
              <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-fd-foreground sm:text-4xl">The useful controls aren’t hidden.</h2>
              <p className="mt-4 text-lg leading-8 text-fd-muted-foreground">OpenNOW puts session quality, input, reliability, and capture where you can actually reach them.</p>
              <Link to="/docs/$" params={{ _splat: 'reference/configuration' }} className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-fd-primary hover:opacity-80">
                Explore every setting <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {highlights.map(({ title, description, icon: Icon, className }) => (
                <article key={title} className={`bento-card rounded-2xl border bg-fd-card/65 p-6 ${className}`}>
                  <span className="grid size-10 place-items-center rounded-xl bg-fd-primary text-fd-primary-foreground"><Icon className="size-5" /></span>
                  <h3 className="mt-8 text-lg font-semibold text-fd-foreground">{title}</h3>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-fd-muted-foreground">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t bg-fd-card/35">
          <div className="mx-auto w-full max-w-7xl px-6 py-20 sm:py-24">
            <div className="max-w-2xl">
              <p className="section-kicker">Under the hood</p>
              <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-fd-foreground sm:text-4xl">Documentation for people who want the whole picture.</h2>
            </div>
            <div className="mt-10 divide-y border-y">
              {deepDives.map(([title, description, splat, Icon]) => (
                <Link
                  key={title}
                  to="/docs/$"
                  params={{ _splat: splat }}
                  onClick={() => track('home_doc_card_clicked', { title, splat })}
                  className="group grid gap-4 py-6 transition hover:pl-2 sm:grid-cols-[48px_0.7fr_1fr_auto] sm:items-center"
                >
                  <span className="grid size-11 place-items-center rounded-xl border bg-fd-background text-fd-primary"><Icon className="size-5" /></span>
                  <h3 className="font-semibold text-fd-foreground">{title}</h3>
                  <p className="text-sm leading-6 text-fd-muted-foreground">{description}</p>
                  <ArrowRight className="hidden size-4 text-fd-primary transition group-hover:translate-x-1 sm:block" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-6 py-20 sm:py-24">
          <div className="final-cta relative overflow-hidden rounded-3xl border px-6 py-14 text-center sm:px-12 sm:py-16">
            <div className="relative mx-auto max-w-2xl">
              <MonitorPlay className="mx-auto size-10 text-emerald-400" />
              <h2 className="mt-6 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">Ready to take control of the stream?</h2>
              <p className="mt-4 text-pretty leading-7 text-white/60">Start with the quick guide, or inspect every part of the open-source client.</p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link to="/docs/$" params={{ _splat: 'guides/getting-started' }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300">
                  Get started <ArrowRight className="size-4" />
                </Link>
                <a href="https://github.com/OpenCloudGaming/OpenNOW" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                  <Code2 className="size-4" /> Browse the source
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </HomeLayout>
  );
}

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'OpenNOW — Open-source GeForce NOW client' },
      { name: 'description', content: 'Download OpenNOW and learn how to install, tune, and troubleshoot the open-source GeForce NOW client.' },
    ],
  }),
  component: Home,
});
