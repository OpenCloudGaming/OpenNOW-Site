---
title: Architecture Overview
description: How the OpenNOW Electron client, renderer WebRTC path, and native streamer fit together
---

OpenNOW is an Electron app with three always-present Electron layers and an optional experimental Rust native streamer child process on Windows. Electron owns authentication, session lifecycle, and signaling in both streaming modes.

## Source layout

```text
opennow-stable/src/
├── main/                    Electron main process
│   ├── gfn/                 OAuth, service URLs, catalog, CloudMatch, NVST transport
│   ├── ipc/                 focused account/catalog, session, and media IPC handlers
│   ├── session/             Cloud G-Sync preference, session conflict, selection/lifecycle helpers
│   ├── signaling/           signaling IPC coordinator and native-streamer bridge
│   ├── media/               screenshots, recordings, thumbnails, media file helpers
│   ├── services/            PrintedWaste queue metadata, region ping, request timeout/cache services
│   ├── nativeStreamer/      Rust child-process lifecycle plus input/surface helpers
│   ├── mediaPaths.ts        trusted OpenNOW media URL protocol
│   ├── discordRpc.ts        Discord Rich Presence lifecycle
│   ├── appBuildInfo.ts      app version, embedded build number, and commit metadata
│   ├── updater.ts           update checks and electron-updater integration
│   ├── settings.ts          settings defaults, migration, compatibility normalization
│   └── index.ts             app bootstrap, Chromium/WebRTC flags, windows, protocol/services wiring
├── preload/                 typed contextBridge surface
├── renderer/src/
│   ├── components/          app pages, StreamView, SettingsPage, queue server modal, controller library
│   ├── gfn/                 renderer WebRTC client, SDP/NVST helpers, input protocol, microphone
│   ├── hooks/               reusable runtime hooks, including queue ad playback/reporting
│   └── utils/               diagnostics and UI helpers
└── shared/                  IPC names, Settings, native streamer protocol/types, GFN models

native/opennow-streamer/      Rust child process with stub and modular GStreamer backend
```

## Process responsibilities

| Layer | Responsibilities |
| --- | --- |
| Main process | OAuth/PKCE, provider discovery, CloudMatch create/poll/claim/stop, queue/server selection state, WebSocket signaling, settings, build metadata/updater, Discord Rich Presence, media storage, native streamer process lifecycle |
| Preload | Narrow `window.openNow` API over IPC; isolates renderer from Node.js APIs |
| Renderer | React app, login/library/settings, queue and launch UI, controller mode, shortcuts, renderer WebRTC playback, stats overlay, screenshots/recordings |
| Native streamer (optional, experimental) | Windows-only Rust JSON-lines protocol v2 child process in the app; GStreamer `webrtcbin` offer/answer, local ICE, input data channels, video decode/render, stall/transition/stats diagnostics |

## Streaming data flow

| Flow | Main process | Renderer | Native streamer |
| --- | --- | --- | --- |
| Auth | Opens browser/callback server, exchanges and refreshes tokens | Starts login/logout, displays auth state | Not involved |
| Launch | Creates session, polls queue, handles server selector, claims session | Shows launch/queue state | Receives session context only in native mode |
| Signaling | Connects NVST WebSocket, receives offer/ICE, sends answers/candidates | Web mode: creates answer and local ICE | Native mode: receives offer command, returns answer and local ICE events |
| Streaming | Chooses web vs experimental native mode on Windows; normalizes native mode back to web on unsupported platforms and falls back when native is unavailable | Web mode: Chromium `RTCPeerConnection`, `<video>/<audio>`, input channels, stats | Native mode: GStreamer `webrtcbin`, platform decode/render, input readiness, native stats/events |
| Input | Provides IPC helpers and forwards native commands | Captures keyboard/mouse/gamepad/clipboard; web mode sends over data channels | Native mode sends encoded input after `input-ready`; non-Windows relies on Electron forwarding fallback |
| Media | Writes screenshots/recordings and thumbnails | Renderer capture via canvas/MediaRecorder | Native external renderer has separate capture limitations |
| Settings | Loads, migrates, normalizes, persists `settings.json` | Renders settings UI | Receives selected native settings as environment/session context |

## WebRTC renderer path

The default `streamClientMode` is `web`. The renderer owns `RTCPeerConnection`, SDP munging, NVST SDP generation, audio/video element playback, microphone capture, and data channels. Chromium acceleration flags are configured by the main process before app startup: Windows D3D11/Media Foundation, Linux x64 VAAPI, Linux ARM V4L2/direct decoder, macOS VideoToolbox, MP4 MediaRecorder support, dav1d AV1 fallback, disabled mDNS ICE candidates, and unthrottled renderer behavior.

## Native streamer path

When experimental native mode is selected on Windows, the main process starts `opennow-streamer`, performs a protocol `hello`, sends `start`/`offer`/ICE/input/surface/bitrate/stop` commands, and receives `ready`/`answer` responses plus async status, local ICE, input readiness, video liveness, stats, and error events. The shipped media backend is Rust + GStreamer `webrtcbin`; unsupported platforms, unsupported builds, or unavailable backends report fallback details so the app can return to the web streamer path.

## Key source files

| File | Purpose |
| --- | --- |
| `opennow-stable/src/main/index.ts` | App bootstrap, Chromium/WebRTC flags, windows, protocol/services wiring |
| `opennow-stable/src/main/ipc/accountCatalogHandlers.ts` | Auth/account/catalog/cache/community IPC |
| `opennow-stable/src/main/ipc/sessionHandlers.ts` | Create/poll/claim/stop/session-ad IPC |
| `opennow-stable/src/main/ipc/mediaHandlers.ts` | Screenshot, recording, and media gallery IPC |
| `opennow-stable/src/main/signaling/signalingCoordinator.ts` | Signaling IPC coordination and native-streamer bridge |
| `opennow-stable/src/main/session/*.ts` | Cloud G-Sync preference, active-session conflict handling, session selection/lifecycle helpers |
| `opennow-stable/src/main/media/*.ts` | Screenshot/recording persistence, media file validation, thumbnail helpers |
| `opennow-stable/src/main/mediaPaths.ts` | Trusted OpenNOW media path resolution and playback URL protocol |
| `opennow-stable/src/main/services/*.ts` | PrintedWaste queue metadata, region ping, request timeout/cache services |
| `opennow-stable/src/main/gfn/auth.ts` | OAuth + PKCE, token refresh, provider discovery |
| `opennow-stable/src/main/gfn/cloudmatch.ts` | Session creation, queue polling, claim, stop |
| `opennow-stable/src/main/gfn/signaling.ts` | NVST WebSocket signaling client |
| `opennow-stable/src/main/nativeStreamer/manager.ts` | Native executable lookup, environment, protocol lifecycle, fallback |
| `opennow-stable/src/main/nativeStreamer/input.ts`, `surface.ts` | Native input and render-surface normalization |
| `opennow-stable/src/main/discordRpc.ts` | Discord Rich Presence updates |
| `opennow-stable/src/main/appBuildInfo.ts` | App version, embedded build number, and commit metadata |
| `opennow-stable/src/main/updater.ts` | Automatic update checks |
| `opennow-stable/src/main/settings.ts` | Settings defaults and compatibility normalization |
| `opennow-stable/src/renderer/src/gfn/webrtcClient.ts` | Renderer WebRTC peer connection, data channels, stats |
| `opennow-stable/src/renderer/src/gfn/sdp.ts` | SDP and NVST SDP helpers |
| `opennow-stable/src/renderer/src/hooks/useQueueAdRuntime.ts` | Queue ad playback/reporting watchdog runtime |
| `opennow-stable/src/renderer/src/components/QueueServerSelectModal.tsx` | Queue server selection UI |
| `opennow-stable/src/renderer/src/components/controllerMode/ControllerLibraryPage.tsx` | Controller-first library page |
| `opennow-stable/src/renderer/src/components/controllerMode/controllerLibrary/ControllerLibraryLayout.tsx` | Controller library layout and navigation |
| `opennow-stable/src/shared/gfn.ts` | Shared settings, session, stream, native, and API types |
| `opennow-stable/src/shared/nativeStreamer.ts` | TypeScript protocol v2 definitions |
| `native/opennow-streamer/src/protocol.rs` | Rust protocol/session structs |
| `native/opennow-streamer/src/backend.rs` | Backend selection and stub fallback |
| `native/opennow-streamer/src/gstreamer_backend.rs` | GStreamer backend orchestration |
| `native/opennow-streamer/src/gstreamer_pipeline.rs` | GStreamer `webrtcbin` pipeline construction and negotiation |
| `native/opennow-streamer/src/gstreamer_input.rs`, `gstreamer_liveness.rs`, `gstreamer_platform.rs`, `gstreamer_transitions.rs`, `gstreamer_config.rs` | Input channels, liveness diagnostics, platform paths, transition telemetry, backend configuration |
