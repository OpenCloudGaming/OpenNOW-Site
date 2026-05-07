---
title: Development Guide
description: Local setup, scripts, native streamer builds, CI, and release packaging
---

OpenNOW's active desktop client lives in `opennow-stable/` in the [OpenCloudGaming/OpenNOW](https://github.com/OpenCloudGaming/OpenNOW) repository. This site is the canonical public documentation for that codebase.

## Prerequisites

- Node.js 22
- npm
- Git
- Rust/Cargo when working on the native streamer
- GStreamer development packages when building the Rust streamer with the `gstreamer` backend
- A GeForce NOW account for end-to-end session testing

Install from the Electron workspace:

```bash
git clone https://github.com/OpenCloudGaming/OpenNOW.git
cd OpenNOW/opennow-stable
npm install
```

## Scripts

Root scripts proxy into `opennow-stable/`:

| Root command | Purpose |
| --- | --- |
| `npm run dev` | Start Electron/Vite development mode |
| `npm run build` | Build the renderer and Electron bundles |
| `npm run native:check` | Run `cargo check` for `native/opennow-streamer` |
| `npm run native:build` | Build the release Rust streamer and copy it into `native/opennow-streamer/bin` |
| `npm run typecheck` | Run Node and renderer TypeScript checks |
| `npm run locales:check` | Validate renderer translation keys and locale JSON files |
| `npm run crowdin:upload` | Upload `locales/en.json` source strings to Crowdin |
| `npm run crowdin:download` | Download translated locale JSON files from Crowdin |
| `npm run dist` | Build app + native streamer, then package unsigned artifacts |
| `npm run dist:signed` | Build app + native streamer, then package with signing enabled |

Workspace scripts available inside `opennow-stable/`:

| Workspace command | Purpose |
| --- | --- |
| `npm run dev` | Electron/Vite dev server |
| `npm run preview` | Preview a production build |
| `npm run lint` | Run `oxlint src` |
| `npm test` | Run the Node test harness |
| `npm run native:check` | Cargo check the native streamer crate |
| `npm run native:build` | Run `scripts/build-native-streamer.mjs` |
| `npm run typecheck` | Type-check main/preload and renderer projects |
| `npm run locales:check` | Validate renderer translation keys and locale JSON files |
| `npm run build` | Production build only |
| `npm run dist` | Unsigned electron-builder packaging |
| `npm run dist:signed` | Signed electron-builder packaging |

## Source layout

```text
locales/                         Source and translated renderer locale JSON files

opennow-stable/
├── src/main/                 Electron main process
│   ├── gfn/                  Auth, catalog, CloudMatch, signaling
│   ├── nativeStreamer/       Rust child-process lifecycle and protocol bridge
│   ├── discordRpc.ts         Discord Rich Presence integration
│   ├── updater.ts            electron-updater integration
│   └── settings.ts           settings.json defaults and migration
├── src/preload/              contextBridge API
├── src/renderer/src/         React UI, stream view, settings, controller mode
├── src/shared/               Shared IPC, Settings, protocol, and GFN types
├── scripts/build-native-streamer.mjs
├── scripts/check-translations.mjs
└── package.json

native/opennow-streamer/       Rust native streamer process
```

## Localization

Renderer UI strings live in `locales/en.json` as the English source file. Crowdin maps that file to `locales/%two_letters_code%.json` for translated locale files; the current settings UI labels English, Spanish, and French. Run `npm run locales:check` before merging localization changes to verify renderer `t("...")` keys exist in English and that non-English locale JSON files parse cleanly.

At runtime the renderer loads `locales/*.json`, normalizes locale codes such as `en-US` or `en_US` to `en`, stores the selected app language in browser localStorage as `opennow.locale`, and falls back to English for missing files or keys.

## Native streamer builds

`npm run native:build` runs Cargo in release mode through `opennow-stable/scripts/build-native-streamer.mjs`. By default it builds with the `gstreamer` feature. Set `OPENNOW_NATIVE_STREAMER_FEATURES=none` to build without optional media support, or set a comma-separated feature list to override. The script also supports `OPENNOW_NATIVE_STREAMER_TARGET`, `OPENNOW_NATIVE_STREAMER_PLATFORM_KEY`, and `OPENNOW_BUNDLE_GSTREAMER_RUNTIME`.

When the `gstreamer` feature is enabled, the build environment must provide GStreamer development files and plugins needed by `webrtcbin`. Release builders bundle a private GStreamer runtime on Windows x64 and macOS. Linux packages use distro GStreamer dependencies instead.

See [Native Streamer](/reference/native-streamer/) for runtime behavior, environment variables, protocol, and platform decoder paths.

## CI and releases

PRs and pushes that touch `native/**`, `opennow-stable/**`, or the CI workflow run the `auto-build.yml` validation job on Ubuntu 24.04 with Node.js 22. It installs workspace dependencies, then runs lint, typecheck, and tests.

The release workflow packages this matrix:

| Target | Native/GStreamer behavior | Artifacts |
| --- | --- | --- |
| Windows x64 | Builds native streamer and bundles private GStreamer runtime | NSIS setup, portable exe, updater metadata |
| Windows ARM64 | Packages app without native streamer build | NSIS setup, portable exe |
| macOS x64 / arm64 | Builds native streamer and bundles private GStreamer runtime | `dmg`, `zip` |
| Linux x64 / arm64 | Builds native streamer against host distro GStreamer packages | `AppImage`, `deb` |

Windows ARM64 artifacts are release downloads only; the Windows updater feed remains the x64 `latest.yml` channel. Manual releases can update `opennow-stable/package.json` and lockfile to the requested version before tagging so source archives match the app version.
