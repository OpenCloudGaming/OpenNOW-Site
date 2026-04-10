---
title: WebRTC
description: Signaling, SDP negotiation, and data channels in OpenNOW
---

OpenNOW uses WebRTC for video, audio, and input transport. Signaling runs in the main process; the peer connection lives in the renderer.

## Source files

| Role | File |
|------|------|
| WebSocket signaling | `opennow-stable/src/main/gfn/signaling.ts` |
| Peer connection + input | `opennow-stable/src/renderer/src/gfn/webrtcClient.ts` |
| SDP helpers | `opennow-stable/src/renderer/src/gfn/sdp.ts` |
| Stream UI | `opennow-stable/src/renderer/src/components/StreamView.tsx` |

## Signaling

The main process connects a WebSocket to the session's signaling server:

```
wss://{signalingServer}/nvst/sign_in?peer_id={name}&version=2
```

- **Subprotocol:** `x-nv-sessionid.{sessionId}`
- **Origin:** `https://play.geforcenow.com`
- **Heartbeat:** `{ hb: 1 }` every 5 seconds

On connect, the client sends a `peer_info` message. Incoming messages are classified as:

| Type | Action |
|------|--------|
| `offer` (SDP) | Forwarded to renderer |
| ICE candidate | Forwarded to renderer |
| Other peer messages | ACKed if needed, logged |

The renderer responds through the preload bridge with:
- SDP answer + `nvstSdp` blob
- Local ICE candidates
- Keyframe requests (when decoder pressure is detected)

## Peer connection

`WebRTCStreamClient` in the renderer handles:

1. **Receive offer** — applies codec preference (H.264 / H.265 / AV1), rewrites SDP for color quality and level, creates an answer.
2. **ICE gathering** — waits up to 5 seconds, then sends the final SDP.
3. **nvstSdp** — builds a custom blob with resolution, viewport, FPS, bitrate, codec, color quality, and ICE credentials.
4. **Media endpoint injection** — if the session includes `mediaConnectionInfo`, a manual host ICE candidate is injected after the answer is sent.
5. **Track handling** — video and audio tracks are attached to `<video>` and `<audio>` elements.

## Data channels

| Channel | Reliability | Purpose |
|---------|-------------|---------|
| `input_channel_v1` | ordered, reliable | Keyboard input and control messages |
| `input_channel_partially_reliable` | unordered, partially reliable | Mouse deltas, gamepad state (latency-sensitive) |

The partially reliable channel's threshold comes from the negotiated `a=ri.partialReliableThresholdMs` SDP attribute.

## Diagnostics

The renderer polls `RTCPeerConnection.getStats()` and exposes:

| Metric | Source |
|--------|--------|
| Connection state | `pc.connectionState` |
| Resolution, codec, HDR | Inbound video stats |
| Bitrate (kbps) | Bytes received delta |
| RTT, jitter, packet loss | ICE candidate pair + inbound RTP |
| Decode/render time | Frame timing stats |
| Input queue pressure | Data channel buffered amount tracking |
| Lag reason | Heuristic classification (network / decoder / input / render) |
| Decoder recovery | Keyframe request attempts and outcomes |
| Microphone state | `MicrophoneManager` state |
