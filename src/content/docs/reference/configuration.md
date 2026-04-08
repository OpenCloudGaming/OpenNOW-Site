---
title: Configuration
description: Settings model, defaults, and storage for the OpenNOW client
---

OpenNOW persists user settings as JSON at `app.getPath("userData")/settings.json`. The shared `Settings` type is defined in `opennow-stable/src/shared/gfn.ts` and used by both the main process and renderer.

## File locations

| Data | Path |
|------|------|
| Settings | `app.getPath("userData")/settings.json` |
| Auth state | `app.getPath("userData")/auth-state.json` |
| Thumbnail cache | `app.getPath("userData")/media-thumbs/` |
| Screenshots | `app.getPath("pictures")/OpenNOW/Screenshots/` |
| Recordings | `app.getPath("pictures")/OpenNOW/Recordings/` |

## Settings reference

### Video and streaming

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `resolution` | `string` | `"1920x1080"` | Stream resolution (e.g. `"2560x1440"`, `"3840x2160"`) |
| `aspectRatio` | `AspectRatio` | `"16:9"` | `"16:9"`, `"16:10"`, `"21:9"`, or `"32:9"` |
| `fps` | `number` | `60` | Target frame rate (30, 60, 90, 120, 144, 165, 240, 360) |
| `maxBitrateMbps` | `number` | `75` | Maximum stream bitrate in Mbps (capped at 150) |
| `codec` | `VideoCodec` | `"H264"` | `"H264"`, `"H265"`, or `"AV1"` |
| `colorQuality` | `ColorQuality` | `"8bit_420"` | `"8bit_420"`, `"8bit_444"`, `"10bit_420"`, or `"10bit_444"` |
| `region` | `string` | `""` | Preferred region URL; empty = auto-select |
| `gameLanguage` | `GameLanguage` | `"en_US"` | In-game language sent to GFN servers |
| `enableL4S` | `boolean` | `false` | Request Low Latency, Low Loss, Scalable throughput (experimental) |

### Input and shortcuts

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `clipboardPaste` | `boolean` | `false` | Enable paste into the stream (max 64 KB) |
| `mouseSensitivity` | `number` | `1` | Multiplier on relative mouse motion |
| `mouseAcceleration` | `number` | `1` | Acceleration strength 1–150 (percentage slider) |
| `shortcutToggleStats` | `string` | `"F3"` | Toggle stats overlay |
| `shortcutTogglePointerLock` | `string` | `"F8"` | Toggle pointer lock |
| `shortcutStopStream` | `string` | `"Ctrl+Shift+Q"` | Stop the current session |
| `shortcutToggleAntiAfk` | `string` | `"Ctrl+Shift+K"` | Toggle anti-AFK |
| `shortcutToggleMicrophone` | `string` | `"Ctrl+Shift+M"` | Toggle microphone mute |
| `shortcutScreenshot` | `string` | `"F11"` | Take a screenshot |
| `shortcutToggleRecording` | `string` | `"F12"` | Start/stop recording |

### Microphone

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `microphoneMode` | `MicrophoneMode` | `"disabled"` | `"disabled"`, `"push-to-talk"`, or `"voice-activity"` |
| `microphoneDeviceId` | `string` | `""` | Preferred mic device ID; empty = system default |

### Stream UI

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `hideStreamButtons` | `boolean` | `false` | Hide the mic / fullscreen / end-session buttons during streaming |
| `sessionClockShowEveryMinutes` | `number` | `60` | Re-show the session timer every N minutes |
| `sessionClockShowDurationSeconds` | `number` | `30` | How long the session timer stays visible |

### Controller mode

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `controllerMode` | `boolean` | `false` | Enable controller-first library layout |
| `controllerUiSounds` | `boolean` | `false` | UI sounds in controller mode |
| `controllerBackgroundAnimations` | `boolean` | `false` | Animated backgrounds in controller mode loading screens |
| `autoLoadControllerLibrary` | `boolean` | `false` | Open controller library on startup when controller mode is enabled |
| `autoFullScreen` | `boolean` | `false` | Auto-fullscreen when controller mode triggers it |

### Window and misc

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `favoriteGameIds` | `string[]` | `[]` | Saved game favorites |
| `windowWidth` | `number` | `1400` | Last saved window width |
| `windowHeight` | `number` | `900` | Last saved window height |

## Compatibility logic

The settings manager (`opennow-stable/src/main/settings.ts`) applies these rules on load:

- **Codec/color mismatch** — if `codec` is `"H264"` and `colorQuality` is anything other than `"8bit_420"`, color quality is reset to `"8bit_420"` (H.264 doesn't support 4:4:4 or 10-bit).
- **Legacy shortcuts** — old macOS-style stop/anti-AFK shortcuts (e.g. `Meta+Shift+Q`) are migrated to `Ctrl+Shift+Q` / `Ctrl+Shift+K`.
- **Acceleration clamp** — `mouseAcceleration` is clamped to `[1, 150]`; legacy boolean values are converted to `100` (on) or `1` (off).

## Source files

- `opennow-stable/src/main/settings.ts` — `SettingsManager` class, defaults, load/save/migration
- `opennow-stable/src/shared/gfn.ts` — `Settings` type, `VideoCodec`, `ColorQuality`, `MicrophoneMode`, `AspectRatio`, `GameLanguage`
- `opennow-stable/src/renderer/src/components/SettingsPage.tsx` — Settings UI
