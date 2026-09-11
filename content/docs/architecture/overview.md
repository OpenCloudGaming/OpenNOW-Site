---
title: Architecture Overview
description: How the Qt shell, Rust core, and in-process native streamer fit together
---

OpenNOW's desktop client is a Qt Quick application with an out-of-process Rust core and an in-process native NVST streamer. The Electron/`opennow-stable` desktop runtime is retired. The Qt app does not embed a browser and has no Chromium/WebRTC fallback.

## Source layout

```text
opennow-qt/                  Qt Quick desktop app, C++ integration, and Qt tests
native/opennow-core/         Rust accounts, settings, catalog, and session services
native/opennow-streamer/     Native NVST transport, media, input, and Qt FFI
locales/                     English source and Crowdin-managed translations
docs/                        Architecture, protocols, acceptance, and release guides
```

## Process responsibilities

| Layer | Responsibilities |
| --- | --- |
| Qt Quick shell | Windows, navigation, focus, overlays, desktop and console layouts, stream chrome, settings UI |
| Rust core (separate process) | Authentication, settings, catalog, CloudMatch session lifecycle, updates, diagnostics, local storage |
| Native streamer (in-process FFI) | NVST transport, decode, audio, gameplay input, recording, GPU frame publication into Qt |

Qt talks to the core over a [versioned JSON protocol](https://github.com/OpenCloudGaming/OpenNOW/blob/main/docs/core-protocol.md). Qt loads the streamer through a [versioned C ABI](https://github.com/OpenCloudGaming/OpenNOW/blob/main/native/opennow-streamer/crates/opennow-streamer-ffi/README.md). Video stays on the GPU, and Qt draws menus over it in the same window.

## Streaming data flow

| Flow | Rust core | Qt shell | Native streamer |
| --- | --- | --- | --- |
| Auth | Opens browser/callback or device login, stores tokens/sessions | Starts login/logout, displays auth state | Not involved |
| Launch | Creates session, polls queue, claims session, normalizes CloudMatch errors | Shows launch/queue state and membership errors | Receives complete session context at start |
| Streaming | Prepares session and capabilities | Composes QML overlays on the video surface | Handles NVST transport, decode, audio, input, recording |
| Input | Persists input-related settings | Captures UI shortcuts and shell navigation; forwards gameplay capture into the streamer | Sends encoded input on negotiated channels |
| Media | Owns media directory helpers and gallery metadata | Surfaces Media UI and shortcuts | Writes source-stream Matroska recordings and screenshots through the native path |
| Settings | Loads, migrates, normalizes, persists `settings.json` | Renders Settings pages for desktop and console shells | Receives selected stream/audio settings as session context |

## Native streamer path

The production desktop path is always native. Qt lends its QRhi graphics objects to the embedded Rust engine. Platform decode publishes a native GPU frame; Qt imports the converted texture into the scene graph so overlays compose above video. The packaged app does not ship a separate streamer executable, helper window, or browser video path.

See [Native Streamer](/docs/reference/native-streamer) for packaging, diagnostics, and protocol details. Historical Chromium/WebRTC notes remain on [Protocol notes](/docs/reference/webrtc).

## Key source areas

| Path | Purpose |
| --- | --- |
| `opennow-qt/` | Qt Quick UI, C++ bridge, packaging, and Qt tests |
| `native/opennow-core/` | Auth, CloudMatch, settings, catalog, updater, diagnostics |
| `native/opennow-streamer/` | NVST runtime crates and FFI |
| `native/opennow-streamer/crates/opennow-streamer-ffi/` | In-process C ABI used by Qt |
| `docs/core-protocol.md` | Shell ↔ core JSON protocol |
| `docs/qt-nightly-release.md` | Qt package inventory and nightly publication |
| `locales/` | Crowdin-managed UI strings |
