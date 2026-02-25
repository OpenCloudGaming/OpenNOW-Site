---
title: Configuration
description: Settings and configuration options in OpenNow Streamer
---

OpenNow Streamer stores user settings using electron-store. This document covers all available configuration options.

## Settings File Location

| Platform | Path |
|----------|------|
| Windows | `%APPDATA%\opennow-streamer\config.json` |
| macOS | `~/Library/Application Support/opennow-streamer/config.json` |
| Linux | `~/.config/opennow-streamer/config.json` |

## Settings Structure

```typescript
interface Settings {
  // Video
  quality: StreamQuality;
  resolution: string;
  fps: number;
  codec: VideoCodec;
  maxBitrateMbps: number;
  colorQuality: ColorQuality;
  hdrEnabled: boolean;

  // Audio
  audioCodec: AudioCodec;
  audioVolume: number;

  // Shortcuts
  shortcuts: ShortcutConfig;

  // Gameplay
  mouseSensitivity: number;
  antiAfkEnabled: boolean;

  // Display
  fullscreen: boolean;
  showStats: boolean;
  statsPosition: StatsPosition;
}
```

## Video Settings

### Stream Quality Presets

```typescript
type StreamQuality = 
  | 'auto'        // Auto-detect best quality
  | 'low'         // 720p 30fps
  | 'medium'      // 1080p 60fps
  | 'high'        // 1440p 60fps
  | 'ultra'       // 4K 60fps
  | 'high120'     // 1080p 120fps
  | 'ultra120'    // 1440p 120fps
  | 'competitive' // 1080p 240fps
  | 'custom';     // Use manual resolution/fps
```

### Resolution Options

| Resolution | Name |
|------------|------|
| `1280x720` | 720p |
| `1920x1080` | 1080p |
| `2560x1440` | 1440p |
| `3840x2160` | 4K |
| `2560x1080` | Ultrawide 1080p |
| `3440x1440` | Ultrawide 1440p |
| `5120x1440` | Super Ultrawide |

### FPS Options

Available FPS values: `30`, `60`, `120`, `144`, `240`

```typescript
const FPS_OPTIONS = [30, 60, 120, 144, 240];
```

### Video Codec

```typescript
type VideoCodec = 'h264' | 'h265' | 'av1';
```

| Codec | Compression | Compatibility | HDR |
|-------|-------------|---------------|-----|
| H.264 | Good | All GPUs | No |
| H.265 | Better | Most GPUs | Yes |
| AV1 | Best | RTX 40+, RX 7000+ | Yes |

### Color Quality

```typescript
type ColorQuality = 
  | '8bit-420'   // 8-bit, YUV 4:2:0 - Most compatible
  | '8bit-444'   // 8-bit, YUV 4:4:4 - Better color (needs H.265)
  | '10bit-420'  // 10-bit, YUV 4:2:0 - HDR ready (default)
  | '10bit-444'; // 10-bit, YUV 4:4:4 - Best quality (needs H.265)
```

| Setting | Bit Depth | Chroma | Bandwidth | Requires |
|---------|-----------|--------|-----------|----------|
| `8bit-420` | 8 | 4:2:0 | Low | Any codec |
| `8bit-444` | 8 | 4:4:4 | Medium | H.265 |
| `10bit-420` | 10 | 4:2:0 | Medium | H.265 |
| `10bit-444` | 10 | 4:4:4 | High | H.265 |

### Bitrate

`maxBitrateMbps` controls the maximum stream bitrate:

| Value | Meaning |
|-------|---------|
| 50 | 50 Mbps (good for most connections) |
| 100 | 100 Mbps (fast connections) |
| 150 | 150 Mbps (very fast connections) |
| 200 | 200 Mbps maximum |

## Audio Settings

### Audio Codec

```typescript
type AudioCodec = 'opus' | 'opus-stereo';
```

| Codec | Description |
|-------|-------------|
| `opus` | Standard Opus encoding |
| `opus-stereo` | Opus with explicit stereo |

Audio is always 48kHz stereo.

### Audio Volume

`audioVolume` - Master volume level (0-100, default: 100)

## Shortcuts Configuration

Configure keyboard shortcuts for quick actions:

```typescript
interface ShortcutConfig {
  toggleFullscreen: string;  // Default: F11
  toggleStats: string;       // Default: F12
  screenshot: string;        // Default: F9
  increaseVolume: string;    // Default: Ctrl+Up
  decreaseVolume: string;    // Default: Ctrl+Down
  muteAudio: string;         // Default: Ctrl+M
}
```

Shortcuts use standard Electron accelerator format:
- Keys: `A-Z`, `0-9`, `F1-F24`, etc.
- Modifiers: `Ctrl`, `Alt`, `Shift`, `Cmd` (macOS)
- Combinations: `Ctrl+Shift+S`, `Cmd+Alt+F`, etc.

## Gameplay Settings

### Mouse Sensitivity

`mouseSensitivity` - Mouse sensitivity multiplier (default: 1.0)

Range: 0.1 to 5.0

### Anti-AFK

`antiAfkEnabled` - Automatically prevent AFK kick (default: false)

When enabled, the application will simulate minimal activity to prevent being kicked for inactivity.

## Display Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `fullscreen` | `false` | Start in fullscreen mode |
| `showStats` | `true` | Show performance statistics overlay |
| `statsPosition` | `bottom-left` | Position of the stats panel |

### Stats Position

```typescript
type StatsPosition = 
  | 'top-left'
  | 'top-right'
  | 'bottom-left'   // Default
  | 'bottom-right';
```

## Default Settings

```typescript
const defaultSettings: Settings = {
  // Video
  quality: 'auto',
  resolution: '1920x1080',
  fps: 60,
  codec: 'h265',
  maxBitrateMbps: 150,
  colorQuality: '10bit-420',
  hdrEnabled: false,

  // Audio
  audioCodec: 'opus',
  audioVolume: 100,

  // Shortcuts
  shortcuts: {
    toggleFullscreen: 'F11',
    toggleStats: 'F12',
    screenshot: 'F9',
    increaseVolume: 'Ctrl+Up',
    decreaseVolume: 'Ctrl+Down',
    muteAudio: 'Ctrl+M',
  },

  // Gameplay
  mouseSensitivity: 1.0,
  antiAfkEnabled: false,

  // Display
  fullscreen: false,
  showStats: true,
  statsPosition: 'bottom-left',
};
```

## Example config.json

```json
{
  "quality": "high120",
  "resolution": "1920x1080",
  "fps": 120,
  "codec": "h265",
  "maxBitrateMbps": 100,
  "colorQuality": "10bit-420",
  "hdrEnabled": false,
  "audioCodec": "opus",
  "audioVolume": 85,
  "shortcuts": {
    "toggleFullscreen": "F11",
    "toggleStats": "F12",
    "screenshot": "F9",
    "increaseVolume": "Ctrl+Up",
    "decreaseVolume": "Ctrl+Down",
    "muteAudio": "Ctrl+M"
  },
  "mouseSensitivity": 1.2,
  "antiAfkEnabled": true,
  "fullscreen": false,
  "showStats": true,
  "statsPosition": "top-right"
}
```

## Loading and Saving

Settings are automatically managed by electron-store:

```typescript
import { settings } from './main/settings';

// Get a setting value
const fps = settings.get('fps');

// Set a setting value (auto-saves)
settings.set('fps', 144);

// Reset to defaults
settings.clear();

// Get all settings
const allSettings = settings.store;
```

## Programmatic API

Access settings from the main process:

```typescript
import { ipcMain } from 'electron';
import { settings } from './settings';

// Handle settings requests from renderer
ipcMain.handle('settings:get', (event, key) => {
  return settings.get(key);
});

ipcMain.handle('settings:set', (event, key, value) => {
  settings.set(key, value);
  return true;
});

// Get typed resolution
type Resolution = { width: number; height: number };

function getResolution(): Resolution {
  const [width, height] = settings.get('resolution').split('x').map(Number);
  return { width, height };
}
```
