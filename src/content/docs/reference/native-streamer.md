---
title: Native Streamer
description: Settings, protocol, executable lookup, GStreamer dependencies, diagnostics, and fallback behavior
---

The native streamer is an optional Rust child process used when `streamClientMode` is set to native mode. It is supervised by Electron and communicates over JSON-lines protocol version `2`.

## Settings

| Setting | Default/effective behavior | Purpose |
| --- | --- | --- |
| `streamClientMode` | `"web"` | Default renderer WebRTC path; native mode opts into the child process |
| `nativeStreamerBackend` | `"gstreamer"`; compatibility forces this value | Backend requested through `OPENNOW_NATIVE_STREAMER_BACKEND` when needed |
| `nativeVideoBackend` | `"auto"` | Normalized to `auto`, `d3d11`, or `d3d12` |
| `nativeStreamerExecutablePath` | `""` | Optional user-selected executable path |
| `nativeCloudGsyncMode` | `"auto"` | Forwarded to native child as Cloud G-Sync/VRR mode |
| `nativeD3dFullscreenMode` | `"auto"` | Windows D3D fullscreen behavior |
| `nativeExternalRenderer` | `true`; compatibility forces true | Use native external rendering |
| `enableCloudGsync` | `false` | User-facing Cloud G-Sync/VRR preference |

If native startup fails, protocol versions mismatch, the backend reports `stub`, or required platform media support is missing, OpenNOW falls back to the renderer WebRTC client with a diagnostic reason.

## Backend selection

The Rust binary reads `OPENNOW_NATIVE_STREAMER_BACKEND`. Valid runtime backend names are:

| Backend | Behavior |
| --- | --- |
| `gstreamer` | Uses GStreamer `webrtcbin` when the binary was built with the feature |
| `stub` | Reports capabilities but cannot stream |

When no backend is requested, the compiled default is `gstreamer` if the binary has the feature, otherwise `stub`. Unknown or unavailable backends return stub capabilities with `requestedBackend` and `fallbackReason`.

## Protocol v2

Electron sends newline-delimited JSON commands on stdin and reads responses/events from stdout.

| Commands | Purpose |
| --- | --- |
| `hello` | Version handshake; returns `ready` capabilities |
| `start` | Provide session context before negotiation |
| `offer` | Send server SDP offer and session context; returns answer |
| `remote-ice` | Add server ICE candidate |
| `input` | Send encoded input packet |
| `surface` | Update native render surface/window info |
| `bitrate` | Update max bitrate limit |
| `stop` | Stop the native session |

| Responses | Purpose |
| --- | --- |
| `ready` | Capabilities, protocol version, backend, fallback details |
| `ok` | Command accepted |
| `answer` | WebRTC/NVST answer payload for signaling |
| `error` | Command failure |

| Events | Purpose |
| --- | --- |
| `log` | Native log line |
| `status` | `starting`, `ready`, `streaming`, or `stopped` |
| `local-ice` | Candidate to send through main-process signaling |
| `input-ready` | Native data channels are ready for input |
| `video-stall` | Liveness/stall diagnostics and recovery attempt data |
| `video-transition` | Decoder/render path transition |
| `stats` | Native stream telemetry |
| `error` | Async backend error |

## Executable lookup

Electron starts the selected native executable and sets protocol/video environment variables for the child.

Lookup order:

1. `OPENNOW_NATIVE_STREAMER` environment override.
2. `nativeStreamerExecutablePath` from settings.
3. Packaged app path: `resources/native/opennow-streamer/<platformKey>/opennow-streamer(.exe)`.
4. Development paths: `native/opennow-streamer/bin`, `native/opennow-streamer/dist`, and `native/opennow-streamer/target/{release,debug}`.

Packaged binaries are copied by `npm run native:build` into `native/opennow-streamer/bin`, including platform-specific directories such as `win32-x64`, `darwin-arm64`, `linux-x64`, or `linux-arm64`.

## GStreamer dependencies and runtime layout

`npm run native:build` builds a release Rust binary. By default it enables the `gstreamer` feature and verifies GStreamer capabilities. `OPENNOW_NATIVE_STREAMER_FEATURES=none` disables optional features.

Release packaging behavior:

| Platform | Runtime strategy |
| --- | --- |
| Windows x64 | Bundle private GStreamer runtime next to `resources/native/opennow-streamer/win32-x64/opennow-streamer.exe` |
| Windows ARM64 | Package app without native streamer build in the current release matrix |
| macOS x64 / arm64 | Bundle private GStreamer runtime next to the platform streamer binary |
| Linux x64 / arm64 | Use host distro GStreamer packages; `.deb` declares common dependencies |

Linux users should install GStreamer base/good/bad/ugly/libav plugins plus hardware packages such as VAAPI, V4L2, GL, Vulkan, and distro driver packages where available.

## Platform video paths

| Platform | Native backend paths |
| --- | --- |
| Windows | D3D12, D3D11, software fallback |
| macOS | VideoToolbox, software fallback |
| Linux x64 | VAAPI, V4L2, software fallback |
| Linux ARM/Raspberry Pi | V4L2 stateless, VAAPI, software fallback |

The backend logs selected decoder, renderer, memory mode, and fallback path at startup. D3D presentation limiting can be used to avoid stale-frame buildup when D3D11 is forced for high-FPS sessions.

## Environment variables

| Variable | Set by | Purpose |
| --- | --- | --- |
| `OPENNOW_NATIVE_STREAMER` | User/dev | Override executable lookup |
| `OPENNOW_NATIVE_STREAMER_PROTOCOL` | Electron | Expected protocol version |
| `OPENNOW_NATIVE_STREAMER_BACKEND` | Electron/user | Backend request |
| `OPENNOW_NATIVE_VIDEO_BACKEND` | Electron | User video backend preference |
| `OPENNOW_NATIVE_EXTERNAL_RENDERER` | Electron | External native renderer flag |
| `OPENNOW_NATIVE_CLOUD_GSYNC` | Electron | Cloud G-Sync/VRR mode |
| `OPENNOW_NATIVE_D3D_FULLSCREEN` | Electron | Windows D3D fullscreen mode |
| `OPENNOW_NATIVE_VIDEO_API` | User/dev | Force diagnostic video API |
| `OPENNOW_NATIVE_PRESENT_MAX_FPS` | User/dev | Override presentation limiter |
| `OPENNOW_NATIVE_ZERO_COPY` | User/dev | Diagnostic zero-copy setting |

Build variables: `OPENNOW_NATIVE_STREAMER_FEATURES`, `OPENNOW_NATIVE_STREAMER_TARGET`, `OPENNOW_NATIVE_STREAMER_PLATFORM_KEY`, and `OPENNOW_BUNDLE_GSTREAMER_RUNTIME`.

## Diagnostics and fallback

The native manager validates the protocol handshake and backend capabilities before streaming. Runtime events surface status, input readiness, local ICE, video stalls, video transitions, stats, logs, and errors.

Fallback is expected and intentional when:

- The executable cannot be found or started.
- Protocol version is not `2`.
- The binary reports `stub` because GStreamer was not compiled in.
- A requested backend is unknown or unavailable.
- Required GStreamer plugins or platform decoders are missing.
- Native streaming errors before a usable session is established.

In those cases, OpenNOW returns to the web streamer path rather than leaving the user in a partial stream state.
