---
title: Getting Started
description: Download, install, or build the OpenNOW Electron client from source
---

OpenNOW is an open-source desktop client for GeForce NOW, built with Electron, React, and TypeScript. The active application lives in `opennow-stable/` inside the [OpenCloudGaming/OpenNOW](https://github.com/OpenCloudGaming/OpenNOW) repo.

## Download a release

Grab the latest build from [GitHub Releases](https://github.com/OpenCloudGaming/OpenNOW/releases).

| Platform | Formats |
|----------|---------|
| Windows x64 / ARM64 | NSIS installer, portable executable |
| macOS (Apple Silicon + Intel) | `.dmg`, `.zip` |
| Linux x64 / ARM64 | `.AppImage`, `.deb` |

Release artifacts follow the naming pattern `OpenNOW-v{version}-{type}-{arch}.{ext}` — for example `OpenNOW-v0.3.2-setup-x64.exe` or `OpenNOW-v0.3.2-linux-arm64.AppImage`.

## Build from source

### Prerequisites

- **Node.js 22** or newer
- **npm**
- **Git**
- A GeForce NOW account (for end-to-end testing)

### Clone and install

```bash
git clone https://github.com/OpenCloudGaming/OpenNOW.git
cd OpenNOW/opennow-stable
npm install
```

### Run in development

From the repository root (one level above `opennow-stable/`):

```bash
cd ..          # back to repo root
npm run dev
```

The root `package.json` proxies commands into `opennow-stable/`, so you don't need to `cd` into it for day-to-day work.

### Available root scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the app in development mode |
| `npm run build` | Production build (Vite + electron-vite) |
| `npm run typecheck` | Run TypeScript type checks |
| `npm run dist` | Build + package unsigned release artifacts |
| `npm run dist:signed` | Build + package signed release artifacts |

### Package release artifacts locally

```bash
npm run dist          # unsigned
npm run dist:signed   # signed (requires code-signing env)
```

Output goes to `opennow-stable/dist-release/`.

## First launch

1. Open the app and select a login provider if prompted.
2. Sign in through the browser-based NVIDIA OAuth flow.
3. Browse games from the library or the public catalog.
4. Adjust stream settings (codec, resolution, FPS, bitrate, etc.) from the Settings page.
5. Launch a session and play.

## Data storage

OpenNOW stores its data in standard Electron locations:

| Data | Location |
|------|----------|
| Settings | `app.getPath("userData")/settings.json` |
| Auth state | `app.getPath("userData")/auth-state.json` |
| Thumbnail cache | `app.getPath("userData")/media-thumbs/` |
| Screenshots | `app.getPath("pictures")/OpenNOW/Screenshots/` |
| Recordings | `app.getPath("pictures")/OpenNOW/Recordings/` |

To fully reset, close the app and delete these files/directories.
