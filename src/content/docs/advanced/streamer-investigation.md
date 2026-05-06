---
title: Native Streamer Architecture
description: Advanced notes on the Rust/GStreamer native streamer path
---

OpenNOW now ships an optional native streamer path. It is not an FFmpeg-first prototype: the current design is a Rust child process with a GStreamer `webrtcbin` backend, coordinated by Electron.

## Shipped design

Electron still owns the GeForce NOW session lifecycle. The main process creates and claims the CloudMatch session, connects NVST signaling, receives the server offer, and forwards signaling payloads either to the renderer WebRTC client or to the native child process.

The native process communicates over newline-delimited JSON on stdin/stdout. Protocol version is `2`. Electron sends commands and correlates responses by `id`; the native process also emits async events for logs, status, ICE, input readiness, video liveness, stats, and errors.

```text
GFN signaling WebSocket ── main process ── JSONL protocol v2 ── opennow-streamer
        │                         │                                  │
        │                         └─ fallback to renderer WebRTC      └─ GStreamer webrtcbin
        └─ shared offer/ICE/answer flow
```

## Responsibilities

| Component | Owns |
| --- | --- |
| Electron main | CloudMatch, signaling WebSocket, native executable lookup, environment variables, protocol supervision, fallback decisions |
| Renderer | App UI, session controls, surface updates, Electron input forwarding fallback, web streamer path |
| Rust streamer | Offer/answer, local ICE, input data channels, GStreamer pipeline, platform decode/render, native diagnostics |

## GStreamer backend

The `gstreamer` backend creates a `webrtcbin` pipeline, validates and adapts the remote SDP, negotiates the local answer, emits local ICE candidates, accepts remote ICE, opens the GFN input data channels, tracks input readiness, and shuts down the pipeline on stop.

If the binary was built without the `gstreamer` feature, or if an unknown/unavailable backend is requested, it reports `stub` capabilities with `requestedBackend` and `fallbackReason`. Electron uses that to fail the native attempt early and return to web mode instead of hanging.

## Platform decode/render selection

The backend chooses a low-latency platform path when plugins and drivers are available:

| Platform | Preferred paths |
| --- | --- |
| Windows | D3D12 for high-FPS sessions, otherwise D3D11, then software fallback |
| macOS | VideoToolbox, then software fallback |
| Linux x64 | VAAPI, then V4L2, then software fallback |
| Linux ARM/Raspberry Pi | V4L2 stateless, then VAAPI, then software fallback |

`nativeVideoBackend` is normalized to `auto`, `d3d11`, or `d3d12` in settings. Diagnostic environment overrides can force broader paths while testing.

## Runtime bundling

Release builds use `npm run native:build`, which builds the Rust binary and copies it to `native/opennow-streamer/bin`. Packaged apps prefer `resources/native/opennow-streamer/<platformKey>/opennow-streamer(.exe)`.

Windows x64 and macOS release jobs can bundle a private GStreamer runtime next to the selected streamer binary. The Electron manager detects that runtime and points only the child process at it. Linux packages rely on distro GStreamer packages; the `.deb` declares the common runtime dependencies.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `OPENNOW_NATIVE_STREAMER` | Override executable lookup |
| `OPENNOW_NATIVE_STREAMER_PROTOCOL` | Protocol version expected by the child |
| `OPENNOW_NATIVE_STREAMER_BACKEND` | Backend request; currently `gstreamer` or `stub` |
| `OPENNOW_NATIVE_VIDEO_BACKEND` | User video backend preference, normalized by Electron settings |
| `OPENNOW_NATIVE_VIDEO_API` | Diagnostic forced video API (`d3d12`, `d3d11`, `videotoolbox`, `vaapi`, `v4l2`, `software`) |
| `OPENNOW_NATIVE_EXTERNAL_RENDERER` | Enable native external renderer path; compatibility currently forces this true |
| `OPENNOW_NATIVE_CLOUD_GSYNC` | Native Cloud G-Sync/VRR mode |
| `OPENNOW_NATIVE_D3D_FULLSCREEN` | Windows D3D fullscreen behavior |
| `OPENNOW_NATIVE_PRESENT_MAX_FPS` | Diagnostic presentation limiter |
| `OPENNOW_NATIVE_ZERO_COPY` | Diagnostic zero-copy mode control |

Build-time variables include `OPENNOW_NATIVE_STREAMER_FEATURES`, `OPENNOW_NATIVE_STREAMER_TARGET`, `OPENNOW_NATIVE_STREAMER_PLATFORM_KEY`, and `OPENNOW_BUNDLE_GSTREAMER_RUNTIME`.

## Diagnostics and liveness

Native events include:

- `status` for starting/ready/streaming/stopped state
- `input-ready` when data channels are ready for input
- `video-stall` with decoded/sink FPS, age, zero-copy flags, recovery attempt, and likely stage
- `video-transition` for decoder/render path changes
- `stats` for native stream telemetry
- `error` for backend or protocol failures

These diagnostics are designed to make native fallback predictable under partial failures.

## Known platform limitations

- Native OS-level input capture is implemented on Windows. macOS and Linux keep the data channels active and rely on Electron input forwarding.
- Linux native/AppImage usage depends on system GStreamer libraries and hardware-acceleration plugins.
- Windows ARM64 release packaging currently does not build the native streamer.
- Native external rendering is separate from the renderer `<video>` path, so renderer MediaRecorder/canvas capture features do not apply the same way.

For the full reference, use [Native Streamer](/reference/native-streamer/). For the shared signaling details, use [WebRTC](/reference/webrtc/).
