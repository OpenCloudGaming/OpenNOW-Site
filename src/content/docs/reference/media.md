---
title: Media
description: Screenshots, recordings, and local media storage in OpenNOW
---

OpenNOW captures screenshots and recordings from the stream and stores them locally. Media is managed through the preload API and surfaced in the app UI.

## Storage locations

| Type | Directory | Format |
|------|-----------|--------|
| Screenshots | `app.getPath("pictures")/OpenNOW/Screenshots/` | PNG, JPG, or WebP |
| Recordings | `app.getPath("pictures")/OpenNOW/Recordings/` | MP4 or WebM |
| Thumbnails | `app.getPath("userData")/media-thumbs/` | JPEG |

## Screenshots

- Triggered by the screenshot shortcut (default `F11`) or the stream overlay button.
- The renderer captures the current video frame as a data URL and sends it to the main process.
- The main process writes the image to the screenshots directory with a timestamped filename.
- Limited to the newest **60** entries.
- Screenshots can be exported to a user-selected location via a save dialog.

## Recordings

- Triggered by the recording shortcut (default `F12`) or the stream overlay button.
- The renderer uses `MediaRecorder` to capture the stream.
- Chunks are streamed to the main process, which writes to a temp file.
- On finish, the file is renamed with duration and game title metadata.
- Limited to the newest **20** entries.
- Format depends on browser codec support — MP4 (preferred when available) or WebM.

## Media listing

- Screenshots and recordings can be listed together via `listMediaByGame()`, optionally filtered by game title.
- Thumbnails are generated on demand: video thumbnails use a companion `-thumb.jpg` file when present, or fall back to `ffmpeg` extraction.
- Media can be revealed in the system file manager or deleted from the app.

## Capture flow

```text
Renderer                         Main process
   │                                  │
   ├─ saveScreenshot(dataUrl) ───────►│── write PNG to disk
   │◄─── ScreenshotEntry ────────────┤
   │                                  │
   ├─ beginRecording(mimeType) ──────►│── create temp file
   ├─ sendRecordingChunk(data) ──────►│── append to temp file
   ├─ finishRecording(duration) ─────►│── rename + save metadata
   │◄─── RecordingEntry ─────────────┤
```

## Source files

- `opennow-stable/src/main/index.ts` — screenshot/recording IPC handlers
- `opennow-stable/src/preload/index.ts` — media API bridge
- `opennow-stable/src/shared/gfn.ts` — `ScreenshotEntry`, `RecordingEntry`, `MediaListingResult` types
- `opennow-stable/src/renderer/src/components/StreamView.tsx` — capture UI controls
