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
  MonitorPlay,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { baseOptions } from '@/lib/layout.shared';

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
  ['Desktop', 'Windows · macOS · Linux'],
  ['Stream path', 'Chromium WebRTC by default'],
  ['Native mode', 'Experimental Windows Rust/GStreamer'],
  ['Source', 'Electron · React · TypeScript'],
] as const;

const buildCommands = [
  'git clone https://github.com/OpenCloudGaming/OpenNOW.git',
  'cd OpenNOW/opennow-stable',
  'npm install',
  'cd ..',
  'npm run dev',
] as const;

function Home() {
  return (
    <HomeLayout {...baseOptions()}>
      <main className="relative isolate min-h-screen overflow-hidden">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_20%_0%,rgba(16,185,129,0.22),transparent_32rem),radial-gradient(circle_at_82%_18%,rgba(56,189,248,0.16),transparent_28rem),linear-gradient(180deg,rgba(2,6,23,0.98),rgba(5,12,22,0.94)_45%,rgba(7,13,22,1))]" />
        <div className="opennow-grid absolute inset-0 -z-10 opacity-45" />
        <section className="mx-auto grid w-full max-w-7xl gap-12 px-6 pb-16 pt-20 md:pt-28 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:pb-24">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-100 shadow-[0_0_40px_rgba(16,185,129,0.16)]">
              <BadgeCheck className="size-4" />
              Independent open-source GeForce NOW client
            </div>
            <h1 className="max-w-4xl text-balance text-5xl font-semibold tracking-[-0.04em] text-white sm:text-7xl">
              Documentation for an open desktop GeForce NOW client.
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-slate-300">
              OpenNOW documents the Electron app, the renderer WebRTC path, the settings model, capture tools, input handling, and the experimental native streamer — straight from the source, without pretending the edge cases are cute.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/docs/$"
                params={{ _splat: '' }}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-emerald-300 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_70px_rgba(52,211,153,0.3)] transition hover:bg-emerald-200"
              >
                <MonitorPlay className="size-4" />
                Read the docs
                <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
              </Link>
              <a
                href="https://github.com/OpenCloudGaming/OpenNOW/releases"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/7 px-5 py-3 text-sm font-medium text-white backdrop-blur transition hover:bg-white/12"
              >
                <Download className="size-4" />
                Download release
              </a>
              <a
                href="https://github.com/OpenCloudGaming/OpenNOW"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 px-5 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/8"
              >
                <Code2 className="size-4" />
                GitHub
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-emerald-400/10 blur-3xl" />
            <div className="overflow-hidden rounded-[2rem] border border-white/12 bg-slate-950/70 shadow-2xl shadow-emerald-950/40 backdrop-blur">
              <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-5 py-3 text-xs text-slate-400">
                <span className="size-2 rounded-full bg-red-400" />
                <span className="size-2 rounded-full bg-amber-300" />
                <span className="size-2 rounded-full bg-emerald-300" />
                <span className="ml-2 font-mono">build from source</span>
              </div>
              <div className="p-5">
                <pre className="overflow-x-auto font-mono text-sm leading-7 text-slate-200">
                  <code>
                    {buildCommands.map((command) => (
                      <span key={command} className="block">
                        <span className="select-none text-emerald-300">$ </span>
                        {command}
                      </span>
                    ))}
                  </code>
                </pre>
                <p className="mt-4 border-t border-white/10 pt-4 text-sm text-slate-400">
                  Requires Node.js 22, npm, and Git. Packaged output lands in{' '}
                  <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-emerald-100">opennow-stable/dist-release/</code>.
                </p>
                <Link
                  to="/docs/$"
                  params={{ _splat: 'guides/getting-started' }}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-emerald-200 transition hover:text-emerald-100"
                >
                  Full install guide <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-7xl gap-4 px-6 pb-14 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.22em] text-emerald-200/70">{label}</p>
              <p className="mt-2 text-sm font-medium text-white">{value}</p>
            </div>
          ))}
        </section>

        <section className="mx-auto w-full max-w-7xl px-6 pb-16">
          <div className="mb-8">
            <p className="text-sm font-medium text-emerald-200">What the client actually does</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">Documented from the source.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map(({ title, description, icon: Icon }) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur">
                <span className="grid size-9 place-items-center rounded-xl border border-emerald-400/25 bg-emerald-400/10 text-emerald-200">
                  <Icon className="size-5" />
                </span>
                <p className="mt-4 font-medium text-white">{title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-6 pb-24">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-medium text-emerald-200">Documentation that matches the app</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">Start where the problem is.</h2>
            </div>
            <Link to="/docs/$" params={{ _splat: '' }} className="text-sm font-medium text-emerald-200 hover:text-emerald-100">
              Open full docs →
            </Link>
          </div>
          <div className="grid gap-4 lg:grid-cols-4">
            {docs.map(([title, description, splat]) => (
              <Link
                key={title}
                to="/docs/$"
                params={{ _splat: splat }}
                className="group rounded-3xl border border-white/10 bg-slate-900/65 p-6 text-left transition hover:-translate-y-1 hover:border-emerald-300/35 hover:bg-slate-900"
              >
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-200">
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
