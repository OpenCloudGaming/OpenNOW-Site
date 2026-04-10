---
title: Input
description: Keyboard, mouse, gamepad, clipboard, and microphone controls in OpenNOW
---

OpenNOW captures input in the renderer and sends it to the GFN server over WebRTC data channels. All shortcuts are user-configurable in settings.

## Default shortcuts

| Shortcut | Action |
|----------|--------|
| `F3` | Toggle stats overlay |
| `F8` | Toggle pointer lock |
| `F11` | Take screenshot |
| `F12` | Start/stop recording |
| `Ctrl+Shift+Q` | Stop session |
| `Ctrl+Shift+K` | Toggle anti-AFK |
| `Ctrl+Shift+M` | Toggle microphone |

All shortcuts can be changed in the Settings page. On macOS, `Ctrl` is displayed as `Cmd` but the underlying binding uses the same key names.

## Pointer lock and mouse

- **Pointer lock** captures the cursor inside the stream view. Toggle with `F8` (default) or release by holding Escape.
- **`mouseSensitivity`** — multiplier applied to raw mouse deltas (default `1`).
- **`mouseAcceleration`** — software acceleration strength from 1 to 150 (percentage slider, default `1`).

Mouse events are sent over the `input_channel_partially_reliable` data channel for lowest latency.

## Keyboard

Keyboard events are captured and translated to virtual key codes + scan codes matching the Windows input model. They are sent over the `input_channel_v1` (reliable) data channel.

## Gamepad

- Up to **4 controllers** are tracked via the browser Gamepad API.
- Button presses and analog stick/trigger values are polled each frame and sent over the partially reliable channel.
- A controller badge appears in the stream UI when a gamepad is connected.

## Clipboard paste

When `clipboardPaste` is enabled, the app intercepts paste events and types the clipboard text into the stream as synthetic keystrokes. Clipboard payloads are limited to **64 KB**.

## Microphone

Microphone support has three modes controlled by `microphoneMode`:

| Mode | Behavior |
|------|----------|
| `disabled` | No mic capture (default) |
| `push-to-talk` | Hold the mic shortcut to transmit |
| `voice-activity` | Always listening when enabled |

Additional settings:

| Setting | Purpose |
|---------|---------|
| `microphoneDeviceId` | Select a specific input device |
| `shortcutToggleMicrophone` | Mute/unmute shortcut (default `Ctrl+Shift+M`) |
| `hideStreamButtons` | Hide the stream overlay buttons (mic, fullscreen, end session) |

The microphone audio track is added to the `RTCPeerConnection` via `MicrophoneManager`.

## Controller mode

Controller mode is a UI layout option, not a different input protocol. When enabled, the library switches to a controller-friendly grid with directional navigation.

| Setting | Description |
|---------|-------------|
| `controllerMode` | Enable controller-first library layout |
| `controllerUiSounds` | Play UI sounds in controller mode |
| `controllerBackgroundAnimations` | Animated backgrounds on loading screens |
| `autoLoadControllerLibrary` | Open controller library on app startup |
| `autoFullScreen` | Auto-enter fullscreen when controller mode triggers it |

## Data channels

| Channel | Reliability | Traffic |
|---------|-------------|---------|
| `input_channel_v1` | ordered, reliable | Keyboard, control messages |
| `input_channel_partially_reliable` | unordered, partially reliable | Mouse deltas, gamepad state |

## Source files

- `opennow-stable/src/renderer/src/gfn/webrtcClient.ts` — input encoding, mic management
- `opennow-stable/src/renderer/src/gfn/inputProtocol.ts` — key/button mapping
- `opennow-stable/src/renderer/src/components/StreamView.tsx` — shortcut handling, capture UI
- `opennow-stable/src/renderer/src/components/SettingsPage.tsx` — shortcut and input settings
- `opennow-stable/src/shared/gfn.ts` — `Settings` type with all input-related fields
