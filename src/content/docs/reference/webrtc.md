---
title: WebRTC
description: Signaling, SDP negotiation, NVST SDP, data channels, diagnostics, and Chromium acceleration in OpenNOW
---

OpenNOW has two streaming clients that share Electron-owned session lifecycle and NVST signaling:

- **Web mode** (`streamClientMode: "web"`, default): the renderer owns Chromium `RTCPeerConnection`, media elements, data channels, stats, microphone, screenshots, and recordings.
- **Native mode**: the Rust/GStreamer child process answers the server offer and handles WebRTC media/data channels natively. Main-process signaling remains shared.

## Source files

| Role | File |
| --- | --- |
| WebSocket signaling | `opennow-stable/src/main/gfn/signaling.ts` |
| Chromium startup flags | `opennow-stable/src/main/index.ts` |
| Renderer peer connection + input | `opennow-stable/src/renderer/src/gfn/webrtcClient.ts` |
| SDP/NVST helpers | `opennow-stable/src/renderer/src/gfn/sdp.ts` |
| Native protocol bridge | `opennow-stable/src/main/nativeStreamer/manager.ts` |
| Native protocol/types | `opennow-stable/src/shared/nativeStreamer.ts`, `native/opennow-streamer/src/protocol.rs` |

## Signaling

The main process connects to the session signaling server:

```text
wss://{signalingServer}/nvst/sign_in?peer_id={name}&version=2
```

- Subprotocol: `x-nv-sessionid.{sessionId}`
- Origin: `https://play.geforcenow.com`
- Heartbeat: `{ hb: 1 }` every 5 seconds

After the `peer_info` init message, incoming signaling messages are classified as SDP offers, ICE candidates, or peer messages that may need ACKs. Offers and ICE are routed to the active streaming client. Answers, NVST SDP, and local ICE candidates are sent back through the same main-process signaling client.

## Renderer peer connection

In web mode, the renderer:

1. Fixes server SDP placeholders such as `0.0.0.0` using the session server IP.
2. Creates `RTCPeerConnection` with GFN ICE servers.
3. Prefers the configured codec and normalized color quality.
4. Sets the remote offer and creates a local answer.
5. Waits for ICE gathering, then sends the answer plus NVST SDP.
6. Injects the manual media endpoint candidate from `mediaConnectionInfo` when present.
7. Attaches video/audio tracks to `<video>` and `<audio>` elements.

## Native answer path

In native mode, the main process sends the server offer to the Rust child with an `offer` command. The GStreamer backend uses `webrtcbin` to create the local answer and emits local ICE as protocol events. Electron still sends the answer and ICE through the same NVST signaling WebSocket, so CloudMatch, signaling auth, and session teardown stay centralized.

## NVST SDP

OpenNOW sends standard WebRTC SDP plus an NVIDIA NVST SDP blob. NVST SDP carries stream-quality attributes such as resolution, viewport, FPS, bitrate, codec, color quality, QoS/FEC, bandwidth estimation, and ICE credentials.

The NVST session describes these m-lines:

| m-line | Direction | Purpose |
| --- | --- | --- |
| `video` | receive-only | Cloud GPU video RTP |
| `audio` | receive-only | Game audio |
| `mic` | send-only | Microphone audio when enabled |
| `application` | bidirectional | Input data channels |

## Data channels

| Channel | Reliability | Traffic |
| --- | --- | --- |
| `input_channel_v1` | ordered, reliable | Keyboard and control messages |
| `input_channel_partially_reliable` | unordered, partially reliable | Mouse deltas and gamepad state |

The partially reliable threshold is read from the negotiated `a=ri.partialReliableThresholdMs` SDP attribute. Native mode creates compatible data channels in the child process and reports `input-ready` before Electron sends native input packets.

## Diagnostics

Renderer WebRTC diagnostics poll `RTCPeerConnection.getStats()` for connection state, codec, resolution, HDR/color, bitrate, RTT, jitter, packet loss, frame decode/render timing, data-channel pressure, lag classification, and microphone state.

Native mode emits protocol events instead: `status`, `input-ready`, `video-stall`, `video-transition`, `stats`, `log`, and `error`. See [Native Streamer](/reference/native-streamer/) for event fields and fallback behavior.

## Chromium acceleration flags

At startup the main process configures Chromium/WebRTC for the renderer path:

| Platform | Current acceleration behavior |
| --- | --- |
| Windows | D3D11 video decode and Media Foundation integration |
| Linux x64 | VAAPI decoder/encoder flags with driver checks relaxed |
| Linux ARM | V4L2/direct decoder flags |
| macOS | Native VideoToolbox path |
| All | MP4 MediaRecorder support, dav1d AV1 fallback, disabled mDNS candidates, unthrottled renderer/background behavior |

These flags affect the renderer WebRTC path. Native mode uses the GStreamer platform paths documented in [Native Streamer](/reference/native-streamer/).
