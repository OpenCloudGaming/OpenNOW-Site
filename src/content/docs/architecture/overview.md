---
title: Architecture Overview
description: How the OpenNOW Electron client is structured across processes
---

OpenNOW is an Electron app whose source lives in `opennow-stable/`. It follows the standard Electron three-process model with a shared type layer.

## Source layout

```text
opennow-stable/src/
├── main/           # Electron main process (Node.js)
│   ├── gfn/        # Auth, CloudMatch, signaling, game catalogs
│   ├── services/   # Cache and refresh helpers
│   ├── settings.ts # Settings manager
│   └── index.ts    # App entry, IPC handlers, window management
├── preload/        # contextBridge — typed IPC surface
│   └── index.ts
├── renderer/src/   # React UI
│   ├── components/ # Pages: StreamView, SettingsPage, ControllerLibrary, etc.
│   ├── gfn/        # WebRTC client, input protocol, SDP helpers, mic manager
│   └── utils/      # Diagnostics and UI helpers
└── shared/         # Shared types, IPC channel names, logging
    └── gfn.ts      # Settings, AuthSession, SessionInfo, OpenNowApi, etc.
```

## Process responsibilities

```text
┌─────────────────────────────────────────────────────────────┐
│  Main process (Node.js)                                     │
│  • OAuth login + token refresh                              │
│  • Provider discovery (serviceUrls)                         │
│  • CloudMatch session create / poll / claim / stop          │
│  • WebSocket signaling (GfnSignalingClient)                 │
│  • Settings persistence (settings.json)                     │
│  • Screenshot + recording storage and listing               │
│  • Cache management and thumbnail generation                │
├─────────────────────────────────────────────────────────────┤
│  Preload (contextBridge)                                    │
│  • Exposes window.openNow — a typed API over IPC            │
│  • ~50 methods covering auth, sessions, signaling,          │
│    settings, media, and app lifecycle                        │
├─────────────────────────────────────────────────────────────┤
│  Renderer (React)                                           │
│  • Login, library, settings, and stream UI                  │
│  • RTCPeerConnection, SDP negotiation, stream playback      │
│  • Input capture (keyboard, mouse, gamepad, clipboard)      │
│  • Microphone management                                    │
│  • Stats overlay, screenshot/recording controls             │
│  • Controller-friendly library mode                         │
└─────────────────────────────────────────────────────────────┘
```

## Data flow

| Flow | Main process | Renderer |
|------|-------------|----------|
| **Auth** | Opens browser, runs callback server, exchanges code for tokens, refreshes tokens | Triggers login/logout, displays provider and session state |
| **Launch** | Creates CloudMatch session, polls until ready, resolves signaling URL | Initiates launch, shows queue position, starts playback when ready |
| **Signaling** | Connects WebSocket, forwards SDP offer + ICE candidates, sends answer back | Creates `RTCPeerConnection`, generates SDP answer, sends ICE candidates |
| **Streaming** | — | Manages video/audio elements, decodes stream, renders stats overlay |
| **Input** | Provides IPC helpers for pointer lock | Captures keyboard/mouse/gamepad events, sends over data channels |
| **Media** | Writes screenshots/recordings to disk, manages thumbnails | Triggers capture, lists saved media, shows previews |
| **Settings** | Loads, saves, migrates `settings.json` | Reads settings via IPC, renders Settings UI, writes changes back |

## Key source files

| File | Purpose |
|------|---------|
| `src/main/index.ts` | App entry point, window creation, all IPC handlers |
| `src/main/gfn/auth.ts` | OAuth + PKCE, token refresh, provider discovery |
| `src/main/gfn/cloudmatch.ts` | Session creation, polling, claiming, stopping |
| `src/main/gfn/signaling.ts` | WebSocket signaling client |
| `src/main/settings.ts` | Settings persistence and migration |
| `src/preload/index.ts` | `window.openNow` API surface |
| `src/renderer/src/App.tsx` | Root React component, routing, shortcut handling |
| `src/renderer/src/gfn/webrtcClient.ts` | WebRTC peer connection and input channels |
| `src/renderer/src/components/StreamView.tsx` | Stream UI, stats, capture controls, mic toggle |
| `src/renderer/src/components/SettingsPage.tsx` | Settings form with codec diagnostics |
| `src/shared/gfn.ts` | All shared types: `Settings`, `AuthSession`, `OpenNowApi`, etc. |
