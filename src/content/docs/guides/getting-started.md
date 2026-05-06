---
title: Getting Started
description: Download, install, first launch, and source builds for OpenNOW
---

OpenNOW is an open-source desktop client for GeForce NOW. The current app is the Electron client in `opennow-stable/`.

## Download a release

Grab the latest build from [GitHub Releases](https://github.com/OpenCloudGaming/OpenNOW/releases).

| Platform | Formats | Notes |
| --- | --- | --- |
| Windows x64 | NSIS installer, portable `.exe`, updater metadata | Native streamer builds include a bundled private GStreamer runtime |
| Windows ARM64 | NSIS installer, portable `.exe` | Release download only; no native streamer build in the release matrix |
| macOS x64 / arm64 | `.dmg`, `.zip` | Native streamer builds include a bundled private GStreamer runtime |
| Linux x64 / arm64 | `.AppImage`, `.deb` | Native streamer expects distro GStreamer packages; `.deb` declares the common dependencies |
| iOS | TestFlight/prototype links may be published from the project README | Separate prototype, not the desktop Electron app |

Artifact names use the app version, platform, and architecture, such as `OpenNOW-v{version}-setup-x64.exe`, `OpenNOW-v{version}-mac-arm64.dmg`, or `OpenNOW-v{version}-linux-x64.AppImage`.

## First launch

1. Open OpenNOW.
2. Choose a provider if prompted.
3. Sign in through the browser-based NVIDIA OAuth flow.
4. Browse your library or the public catalog.
5. Open Settings to choose resolution, FPS, bitrate, codec, region, controller mode, and other preferences.
6. Launch a game. Queue and server-selection screens appear when GFN requires them.

By default OpenNOW streams through Chromium/WebRTC in the renderer. The optional native streamer mode is experimental and uses a Rust child process with a GStreamer backend for video decode/rendering while Electron still owns session lifecycle and signaling. Native mode may have platform-specific bugs or missing media capabilities; if the native executable, backend, protocol, or platform capability is unavailable, OpenNOW reports the reason and falls back to the web streamer path. Report native-streamer issues on [GitHub Issues](https://github.com/OpenCloudGaming/OpenNOW/issues) or [Discord](https://discord.gg/8EJYaJcNfD).

On Linux, native/AppImage use depends on system GStreamer libraries and plugins. Install base/good/bad/ugly/libav plugins plus VAAPI or V4L2 packages for hardware decode where your distro provides them.

## Build from source

Prerequisites:

- Node.js 22
- npm
- Git
- Rust/Cargo for native streamer work
- GStreamer development packages when building the native `gstreamer` backend

```bash
git clone https://github.com/OpenCloudGaming/OpenNOW.git
cd OpenNOW/opennow-stable
npm install
cd ..
npm run dev
```

Common root scripts:

| Command | Description |
| --- | --- |
| `npm run dev` | Start development mode |
| `npm run build` | Build production bundles |
| `npm run native:check` | Check the Rust native streamer crate |
| `npm run native:build` | Build the Rust native streamer |
| `npm run typecheck` | Run TypeScript checks |
| `npm run dist` | Build unsigned packages |
| `npm run dist:signed` | Build signed packages when signing is configured |

Packaged output is written under `opennow-stable/dist-release/`.

## Local data

| Data | Location |
| --- | --- |
| Settings | `app.getPath("userData")/settings.json` |
| Auth state | `app.getPath("userData")/auth-state.json` |
| Thumbnail cache | `app.getPath("userData")/media-thumbs/` |
| Screenshots | `app.getPath("pictures")/OpenNOW/Screenshots/` |
| Recordings | `app.getPath("pictures")/OpenNOW/Recordings/` |

Close the app before deleting these files to reset local state.
