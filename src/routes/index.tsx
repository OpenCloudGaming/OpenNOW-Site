import { createFileRoute, Link } from '@tanstack/react-router';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  return (
    <HomeLayout {...baseOptions()}>
      <main className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-1 flex-col overflow-hidden px-6 py-20 text-center sm:py-28">
        <div className="absolute inset-x-10 top-12 -z-10 h-64 rounded-full bg-gradient-to-r from-emerald-500/20 via-sky-500/20 to-lime-400/20 blur-3xl" />
        <p className="mx-auto mb-5 w-fit rounded-full border bg-fd-card/80 px-3 py-1 text-sm text-fd-muted-foreground">
          Open-source GeForce NOW desktop client
        </p>
        <h1 className="mx-auto max-w-4xl text-balance text-5xl font-semibold tracking-tight sm:text-7xl">
          Stream, tune, capture, and hack on OpenNOW.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-fd-muted-foreground">
          Documentation for the Electron client, renderer WebRTC path, optional Rust/GStreamer native streamer, settings, media, input, CI, and release packaging.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/docs/$"
            params={{ _splat: '' }}
            className="rounded-full bg-fd-primary px-5 py-3 text-sm font-medium text-fd-primary-foreground shadow-lg shadow-fd-primary/20 transition hover:opacity-90"
          >
            Open docs
          </Link>
          <a
            href="https://github.com/OpenCloudGaming/OpenNOW/releases"
            className="rounded-full border bg-fd-card px-5 py-3 text-sm font-medium transition hover:bg-fd-accent"
          >
            Download OpenNOW
          </a>
        </div>
        <div className="mt-14 grid gap-4 text-left sm:grid-cols-3">
          <section className="rounded-2xl border bg-fd-card/70 p-5">
            <h2 className="mb-2 text-base font-medium">Electron app docs</h2>
            <p className="text-sm text-fd-muted-foreground">Main, preload, renderer, shared contracts, settings, updater, Discord RPC, and media storage.</p>
          </section>
          <section className="rounded-2xl border bg-fd-card/70 p-5">
            <h2 className="mb-2 text-base font-medium">Streaming internals</h2>
            <p className="text-sm text-fd-muted-foreground">GFN auth/session lifecycle, NVST signaling, SDP, input channels, stats, and fallback behavior.</p>
          </section>
          <section className="rounded-2xl border bg-fd-card/70 p-5">
            <h2 className="mb-2 text-base font-medium">Native streamer reference</h2>
            <p className="text-sm text-fd-muted-foreground">Experimental Windows Rust/GStreamer path with protocol v2, backend selection, diagnostics, and platform gates.</p>
          </section>
        </div>
      </main>
    </HomeLayout>
  );
}
