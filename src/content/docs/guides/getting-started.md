---
title: Getting Started
description: How to download or build OpenNow Streamer
---

OpenNow Streamer is a native GeForce NOW client built with Electron, React, and TypeScript. This guide covers downloading pre-built releases and building from source.

## Download Pre-Built Releases

The easiest way to get started is to download a pre-built release from [GitHub Releases](https://github.com/zortos293/OpenNOW/releases).

| Platform | Download | Notes |
|----------|----------|-------|
| **Windows x64** | `OpenNOW-Setup-1.0.0.exe` | NSIS installer, auto-updater enabled |
| **Windows ARM64** | `OpenNOW-Setup-1.0.0-arm64.exe` | Surface Pro X, etc. |
| **macOS (Apple Silicon)** | `OpenNOW-1.0.0-arm64.dmg` | M1/M2/M3 native, universal binary |
| **macOS (Intel)** | `OpenNOW-1.0.0-x64.dmg` | Intel Mac native, universal binary |
| **Linux x64** | `OpenNOW-1.0.0.AppImage` | AppImage portable |
| **Linux ARM64** | `OpenNOW-1.0.0-arm64.AppImage` | ARM64 portable |

### Installing

**Windows:** Run the `.exe` installer. The app will auto-update when new versions are released.

**macOS:** Open the `.dmg` and drag OpenNOW to Applications.

**Linux:** Make the AppImage executable and run:

```bash
chmod +x OpenNOW-1.0.0.AppImage
./OpenNOW-1.0.0.AppImage
```

---

## Building from Source

If you want to build from source, you'll need the following prerequisites:

### Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** 10+ or **pnpm** 8+ (pnpm recommended)
- **Git** for cloning the repository
- A valid **GeForce NOW account** (Free, Priority, or Ultimate tier)

### Platform-Specific Requirements

**Windows:**
- Visual Studio Build Tools (for native modules)

**macOS:**
- Xcode Command Line Tools (`xcode-select --install`)

**Linux:**
- Build tools: `sudo apt install build-essential python3-dev`
- For native modules: `sudo apt install libx11-dev libxkbfile-dev`

## Building

Clone the repository and install dependencies:

```bash
git clone https://github.com/zortos293/OpenNOW.git
cd OpenNOW

# Install dependencies
npm install
# or
pnpm install
```

### Development Mode

Run the app in development mode with hot reload:

```bash
npm run dev
# or
pnpm dev
```

This will start the Vite dev server and launch the Electron window. React components will auto-reload on changes.

### Production Build

Build the application for distribution:

```bash
# Build for all platforms (or specify one)
npm run build

# Build for specific platform
npm run build:win
npm run build:mac
npm run build:linux

# or with pnpm
pnpm build
pnpm build:win
pnpm build:mac
pnpm build:linux
```

Built artifacts will be in the `dist/` directory.

### Packaging

Create platform-specific installers:

```bash
# Package for current platform
npm run dist

# Package for all platforms
npm run dist:all
```

This uses electron-builder to create `.exe`, `.dmg`, `.AppImage`, etc.

## Running

```bash
# Development mode with hot reload
npm run dev

# Production preview (after build)
npm run preview
```

The application will open with the login screen.

## First Launch

1. **Select Provider**: Choose NVIDIA or an Alliance Partner (au, Taiwan Mobile, etc.)
2. **Login**: Click "Login with NVIDIA" to open the browser authentication
3. **Authorize**: Sign in with your NVIDIA account and grant permissions
4. **Browse Games**: After login, browse available games in the library
5. **Launch**: Click a game to start a streaming session

## Configuration

OpenNow uses **electron-store** for settings storage. Settings are stored in:

| Platform | Location |
|----------|----------|
| Windows | `%APPDATA%/OpenNOW/config.json` |
| macOS | `~/Library/Application Support/OpenNOW/config.json` |
| Linux | `~/.config/OpenNOW/config.json` |

Settings can also be accessed and modified via the app's Settings UI (accessible from the system tray or Settings menu).

### Key Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `resolution` | `1920x1080` | Stream resolution |
| `fps` | `60` | Target frame rate (60, 120, 240) |
| `codec` | `H265` | Video codec (H264, H265, AV1) |
| `maxBitrate` | `50` | Maximum bitrate in Mbps |
| `fullscreen` | `false` | Start in fullscreen mode |
| `lowLatencyMode` | `true` | Enable low-latency optimizations |
| `autoUpdate` | `true` | Enable automatic updates |

### Advanced Configuration

You can directly edit the `config.json` file for advanced options:

```json
{
  "resolution": "1920x1080",
  "fps": 60,
  "codec": "H265",
  "maxBitrate": 50,
  "fullscreen": false,
  "lowLatencyMode": true,
  "windowState": {
    "width": 1280,
    "height": 720,
    "x": 100,
    "y": 100,
    "maximized": false
  }
}
```

## Troubleshooting

### "App won't start"

- Ensure Node.js 20+ is installed if building from source
- Delete `%APPDATA%/OpenNOW` (Windows) or `~/.config/OpenNOW` (Linux) and restart
- Check the log files in the config directory for errors

### "Signaling connection failed"

- Check your internet connection
- Verify your GeForce NOW account is active
- Try a different server region in settings

### "Input not working"

- Press `F8` to toggle mouse capture
- Ensure the window is focused
- Check if "Game Mode" is enabled in settings

### Black screen after connection

- Press `F3` to show stats and verify frames are being received
- Try requesting a keyframe by pressing `Ctrl+Shift+K`
- Change the codec in settings (try H.264 if H.265 isn't working)

### Update Issues

- If auto-update fails, manually download the latest release
- Check the logs in the config directory for update errors
- Disable auto-update in settings if needed: `"autoUpdate": false`
