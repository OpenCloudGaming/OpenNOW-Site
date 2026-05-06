---
title: Configuration
description: Settings model, defaults, compatibility normalization, and storage for OpenNOW
---

OpenNOW persists user settings as JSON at `app.getPath("userData")/settings.json`. The source model is `Settings` in `opennow-stable/src/shared/gfn.ts`; defaults and compatibility rules live in `opennow-stable/src/main/settings.ts`.

## File locations

| Data | Path |
| --- | --- |
| Settings | `app.getPath("userData")/settings.json` |
| Auth state | `app.getPath("userData")/auth-state.json` |
| Thumbnail cache | `app.getPath("userData")/media-thumbs/` |
| Screenshots | `app.getPath("pictures")/OpenNOW/Screenshots/` |
| Recordings | `app.getPath("pictures")/OpenNOW/Recordings/` |

## Video, stream, and native settings

| Setting | Type | Default | Description |
| --- | --- | --- | --- |
| `resolution` | `string` | `"1920x1080"` | Stream resolution |
| `aspectRatio` | `AspectRatio` | `"16:9"` | `16:9`, `16:10`, `21:9`, or `32:9` |
| `posterSizeScale` | `number` | `1` | Library poster scaling |
| `fps` | `number` | `60` | Target frame rate |
| `maxBitrateMbps` | `number` | `75` | Maximum stream bitrate in Mbps |
| `streamClientMode` | `StreamClientMode` | `"web"` | Renderer WebRTC by default; experimental native mode starts the Rust streamer and may fall back on unsupported platforms |
| `nativeStreamerBackend` | `NativeStreamerBackendPreference` | `"gstreamer"` | Compatibility currently forces `gstreamer` |
| `nativeVideoBackend` | `NativeVideoBackendPreference` | `"auto"` | Normalized to `auto`, `d3d11`, or `d3d12` |
| `nativeStreamerExecutablePath` | `string` | `""` | Optional explicit native streamer path |
| `nativeCloudGsyncMode` | `NativeStreamerFeatureMode` | `"auto"` | Native Cloud G-Sync/VRR mode |
| `nativeD3dFullscreenMode` | `NativeStreamerFeatureMode` | `"auto"` | Windows native fullscreen behavior |
| `nativeExternalRenderer` | `boolean` | `true` | Compatibility currently forces `true` |
| `codec` | `VideoCodec` | Source preference `H264` | Effective persisted H.264 uses `8bit_420` after compatibility normalization |
| `colorQuality` | `ColorQuality` | Source preference `10bit_420` | Normalized to a supported combination; H.264 becomes `8bit_420` |
| `decoderPreference` | `string` | `"auto"` | Decoder preference hint |
| `encoderPreference` | `string` | `"auto"` | Encoder preference hint sent with stream preferences |
| `region` | `string` | `""` | Preferred region URL; empty means auto |
| `sessionProxyEnabled` | `boolean` | `false` | Use an explicit proxy for session/signaling requests |
| `sessionProxyUrl` | `string` | `""` | Proxy URL when enabled |
| `gameLanguage` | `GameLanguage` | `"en_US"` | Game language sent to GFN |
| `enableL4S` | `boolean` | `false` | Request L4S behavior where supported |
| `enableCloudGsync` | `boolean` | `false` | User-facing Cloud G-Sync/VRR preference |
| `nativeTransitionDiagnostics` | internal/optional | `undefined` | Native transition diagnostics state |

Native streamer settings control an experimental opt-in path. Keep `streamClientMode` at the default `"web"` unless you are testing native streaming and expect possible platform-specific fallback behavior.

## Input and shortcuts

| Setting | Type | Default | Description |
| --- | --- | --- | --- |
| `clipboardPaste` | `boolean` | `false` | Paste clipboard text into the stream |
| `mouseSensitivity` | `number` | `1` | Relative mouse delta multiplier |
| `mouseAcceleration` | `number` | `1` | Acceleration strength clamped to 1–150 |
| `shortcutToggleStats` | `string` | `"F3"` | Toggle stats overlay |
| `shortcutTogglePointerLock` | `string` | `"F8"` | Toggle pointer lock |
| `shortcutToggleFullscreen` | `string` | `"F10"` | Toggle fullscreen |
| `shortcutStopStream` | `string` | `"Ctrl+Shift+Q"` | Stop session |
| `shortcutToggleAntiAfk` | `string` | `"Ctrl+Shift+K"` | Toggle anti-AFK |
| `shortcutToggleMicrophone` | `string` | `"Ctrl+Shift+M"` | Toggle microphone |
| `shortcutScreenshot` | `string` | `"F11"` | Screenshot |
| `shortcutToggleRecording` | `string` | `"F12"` | Start/stop recording |
| `keyboardLayout` | `KeyboardLayout` | default keyboard layout | Keyboard scan-code layout used for input mapping |
| `allowEscapeToExitFullscreen` | `boolean` | `false` | Let Escape exit fullscreen when enabled |

## Microphone and stream UI

| Setting | Type | Default | Description |
| --- | --- | --- | --- |
| `microphoneMode` | `MicrophoneMode` | `"disabled"` | Disabled, push-to-talk, or voice-activity |
| `microphoneDeviceId` | `string` | `""` | Preferred input device ID |
| `hideStreamButtons` | `boolean` | `false` | Hide stream overlay buttons |
| `showAntiAfkIndicator` | `boolean` | `true` | Show anti-AFK status indicator |
| `showStatsOnLaunch` | `boolean` | `false` | Open stats overlay when a session starts |
| `hideServerSelector` | `boolean` | `false` | Skip/hide queue server selector UI where possible |
| `sessionCounterEnabled` | `boolean` | `false` | Enable session timer display behavior |
| `sessionClockShowEveryMinutes` | `number` | `60` | Re-show the session timer every N minutes |
| `sessionClockShowDurationSeconds` | `number` | `30` | Duration for each session timer display |

## Controller, window, and app behavior

| Setting | Type | Default | Description |
| --- | --- | --- | --- |
| `controllerMode` | `boolean` | `false` | Controller-first library UI |
| `controllerUiSounds` | `boolean` | `false` | UI sounds in controller mode |
| `controllerBackgroundAnimations` | `boolean` | `false` | Animated backgrounds/loading screens |
| `controllerThemeStyle` | `ControllerThemeStyle` | `"aurora"` | Controller UI theme style |
| `controllerThemeColor` | RGB object | `{ r: 124, g: 241, b: 177 }` | Controller UI accent color |
| `controllerLibraryGameBackdrop` | `boolean` | `true` | Show selected game backdrop in controller library |
| `autoLoadControllerLibrary` | `boolean` | `false` | Open controller library on startup |
| `autoFullScreen` | `boolean` | `false` | Auto-enter fullscreen when controller mode triggers it |
| `favoriteGameIds` | `string[]` | `[]` | Saved favorites |
| `windowWidth` | `number` | `1400` | Last window width |
| `windowHeight` | `number` | `900` | Last window height |
| `discordRichPresence` | `boolean` | `false` | Enable Discord Rich Presence |
| `autoCheckForUpdates` | `boolean` | `true` | Check for app updates automatically |

## Compatibility rules

On load, OpenNOW merges saved settings with defaults, migrates legacy values, then saves the file if anything changed.

- Codec/color combinations are normalized. `DEFAULT_STREAM_PREFERENCES` currently names H.264 + `10bit_420`, but H.264 does not support that effective combination in OpenNOW, so persisted/effective H.264 is normalized to `8bit_420`. Higher color qualities remain available only for codecs that support them.
- `nativeStreamerBackend` is forced to `gstreamer`.
- `nativeExternalRenderer` is forced to `true`.
- `nativeVideoBackend` is normalized to `auto`, `d3d11`, or `d3d12`.
- Old macOS-style default shortcuts are migrated to the current `Ctrl+Shift+...` defaults.
- `mouseAcceleration` is clamped to 1–150; legacy booleans become `100` or `1`.
- Controller theme style/color values are normalized to supported ranges.

## Related pages

- [Native Streamer](/reference/native-streamer/)
- [Input](/reference/input/)
- [WebRTC](/reference/webrtc/)
