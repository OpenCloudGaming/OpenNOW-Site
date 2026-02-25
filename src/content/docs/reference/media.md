---
title: Media Pipeline
description: WebRTC media pipeline with hardware acceleration in OpenNow
---

OpenNow uses Chromium's built-in WebRTC media engine for video and audio processing, leveraging hardware acceleration through platform-specific APIs.

## Pipeline Overview

```
WebRTC Peer Connection
        │
        ▼
┌─────────────────────┐
│  RTP Depacketizer   │  Native WebRTC (libwebrtc)
│  (libwebrtc)        │
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│  Video Decoder      │  Hardware-accelerated via:
│  (libwebrtc)        │  • D3D11 (Windows)
│                     │  • VA-API (Linux)
│                     │  • VideoToolbox (macOS)
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│  Video Frame        │  I420, NV12, P010 formats
│  (VideoFrameBuffer) │  Shared GPU textures
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│  Chromium Renderer  │  GPU compositing
│  (Electron)         │  YUV→RGB conversion
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│  Stats Collector    │  Frame timing, bitrate, latency
│  (Custom overlay)   │  Rendered via HTML5 Canvas/WebGL
└─────────────────────┘
```

## WebRTC Media Engine

OpenNow relies on Chromium's native WebRTC implementation (`libwebrtc`) for all media processing:

### Supported Codecs

**Video:**
- **H.264** - Baseline, Main, High profiles (hardware accelerated)
- **H.265/HEVC** - Main, Main 10 profiles (hardware accelerated where supported)
- **AV1** - Main profile (software fallback, hardware on newer GPUs)

**Audio:**
- **Opus** - 48kHz, stereo (built into WebRTC, no external dependencies)

### Platform Hardware Acceleration

WebRTC automatically selects hardware decoders based on the platform:

**Windows (D3D11):**
```
Decoder Selection:
├── D3D11 Video Decoder (H.264, H.265)
├── D3D11 AV1 Decoder (Windows 11+)
└── Software fallback (libaom, openh264)
```

**macOS (VideoToolbox):**
```
Decoder Selection:
├── VTDecompressionSession (H.264, H.265)
├── AV1 decoder (macOS 14+)
└── Software fallback
```

**Linux (VA-API):**
```
Decoder Selection:
├── VA-API (H.264, H.265)
├── VA-API AV1 (recent Mesa/drivers)
└── Software fallback (FFmpeg built into Chromium)
```

## Video Frame Flow

### Frame Lifecycle

Decoded frames flow through the WebRTC pipeline as `VideoFrame` objects:

```javascript
// WebRTC VideoFrame structure (simplified)
interface VideoFrame {
  width: number;
  height: number;
  timestamp: number;
  videoFrameBuffer: VideoFrameBuffer;
  colorSpace?: {
    primaries: 'BT709' | 'BT2020';
    transfer: 'SRGB' | 'PQ' | 'HLG';
    matrix: 'BT709' | 'BT2020_NCL';
    range: 'LIMITED' | 'FULL';
  };
}
```

### Pixel Formats

| Format | Bit Depth | Description | Platform |
|--------|-----------|-------------|----------|
| I420 | 8-bit | Planar YUV 4:2:0 | Universal |
| NV12 | 8-bit | Semi-planar YUV 4:2:0 | Windows D3D11 |
| P010 | 10-bit | HDR semi-planar | D3D11, VideoToolbox, VA-API |

**10-bit HDR Support:**
- Enabled when receiving HDR content (PQ/HLG transfer function)
- P010 format for HDR10 content
- Automatic tone mapping to SDR for non-HDR displays
- Full HDR passthrough on HDR-capable displays

## Audio Pipeline

### Opus Decoder

WebRTC includes a native Opus decoder (no external dependencies):

```javascript
// Audio configuration
const audioConfig = {
  codec: 'opus',
  sampleRate: 48000,
  channels: 2,
  // WebRTC handles jitter buffer internally
  // Default: 50-500ms adaptive buffer
};
```

### Audio Flow

```
RTP Audio Packets
        │
        ▼
┌─────────────────────┐
│  Opus Depacketizer  │  WebRTC native
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│  NetEQ Jitter Buffer│  Adaptive buffer (50-500ms)
│  (WebRTC)           │  Playout delay optimization
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│  Opus Decoder       │  libopus (built-in)
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│  Audio Device       │  WASAPI (Windows)
│  Output             │  CoreAudio (macOS)
│                     │  ALSA/PulseAudio (Linux)
└─────────────────────┘
```

## Stats Collection

OpenNow collects WebRTC statistics for overlay display:

### Video Stats

```javascript
// Collected from peerConnection.getStats()
interface VideoStats {
  // Inbound RTP stats
  framesDecoded: number;
  framesDropped: number;
  framesReceived: number;
  frameWidth: number;
  frameHeight: number;
  framesPerSecond: number;
  bitrate: number;           // bits per second
  decoderImplementation: string; // 'ExternalDecoder' | 'libvpx' | etc
  
  // Codec info
  codec: string;             // 'H264' | 'H265' | 'AV1'
  
  // Timing
  currentPlayoutDelay: number;  // ms
  jitterBufferDelay: number;    // ms
  totalProcessingDelay: number; // ms
}
```

### Audio Stats

```javascript
interface AudioStats {
  audioLevel: number;
  totalSamplesReceived: number;
  concealedSamples: number;
  jitterBufferDelay: number;
}
```

### Network Stats

```javascript
interface NetworkStats {
  bytesReceived: number;
  packetsReceived: number;
  packetsLost: number;
  jitter: number;
  roundTripTime: number;     // RTT in ms
  availableIncomingBitrate: number;
}
```

### Stats Overlay

Stats are rendered via the Electron overlay:

```javascript
// Stats collection interval (1 second)
setInterval(async () => {
  const stats = await peerConnection.getStats();
  const videoStats = extractVideoStats(stats);
  const audioStats = extractAudioStats(stats);
  
  // Send to overlay renderer
  overlayWindow.webContents.send('stats-update', {
    video: videoStats,
    audio: audioStats,
    network: networkStats
  });
}, 1000);
```

## Rendering Pipeline

### Electron/Chromium Rendering

Video frames are rendered through Electron's Chromium renderer:

```
VideoFrame (WebRTC)
        │
        ▼
┌─────────────────────┐
│  VideoFrameBuffer   │  Platform-specific:
│  to Texture         │  • D3D11Texture2D (Windows)
│                     │  • CVPixelBuffer (macOS)
│                     │  • VASurface (Linux)
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│  Chromium Compositor│  GPU rasterization
│  (Skia/Viz)         │  YUV→RGB conversion in shader
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│  Stats Overlay      │  HTML5 Canvas or WebGL
│  (Electron overlay) │  60 FPS update
└─────────────────────┘
```

### Color Space Handling

Chromium automatically handles color space conversion:

```javascript
// Color space detection from VideoFrame
colorSpace: {
  primaries: 'BT709',        // BT.709 for SDR
  transfer: 'SRGB',          // Gamma ~2.4
  matrix: 'BT709',
  range: 'LIMITED'           // TV range (16-235)
}

// HDR content
colorSpace: {
  primaries: 'BT2020',
  transfer: 'PQ',            // SMPTE ST 2084
  matrix: 'BT2020_NCL',
  range: 'LIMITED'
}
```

## HDR Pipeline (Planned)

Future HDR support roadmap:

1. **HDR Metadata Passthrough**
   - HDR10 static metadata (MaxCLL, MaxFALL)
   - HDR10+ dynamic metadata

2. **Tone Mapping**
   - Automatic tone mapping for SDR displays
   - User-adjustable tone mapping curves

3. **Display Detection**
   - HDR display capability detection via Electron APIs
   - Automatic HDR/SDR mode switching

## Threading Model

WebRTC's internal threading (transparent to application):

```
Main Thread (Electron)
├── UI rendering (React/Vue/HTML)
├── Stats overlay updates
└── User input handling

WebRTC Threads (libwebrtc internal)
├── Network thread: RTP receive/send
├── Worker thread: Decoding, encoding
└── Signaling thread: SDP, ICE

Audio Thread (dedicated)
├── NetEQ jitter buffer
├── Opus decode
└── Audio device output
```

All media processing occurs within WebRTC's thread pool. The Electron main process only handles:
- Stats aggregation and display
- User interface updates
- Window management

## Configuration

### Codec Preferences

```javascript
// Set codec preferences via SDP
const transceiver = peerConnection.getTransceivers()[0];
transceiver.setCodecPreferences([
  { mimeType: 'video/AV1' },
  { mimeType: 'video/H265' },
  { mimeType: 'video/H264' }
]);
```

### Hardware Acceleration Flags

Chromium flags for hardware acceleration (passed to Electron):

```javascript
// Electron main process
app.commandLine.appendSwitch('enable-features', 
  'PlatformHEVCDecoderSupport,HardwareSecureDecryption');

// Windows: Enable HEVC D3D11 decoder
app.commandLine.appendSwitch('enable-features',
  'D3D11VideoDecoder,DXGIWaitableSwapChain');

// Force hardware video decode
app.commandLine.appendSwitch('disable-features', 
  'DisableHardwareAcceleration');
```

## Performance Considerations

### GPU Memory

- Hardware decoded frames use GPU memory (not system RAM)
- Zero-copy texture sharing where supported
- Monitor GPU memory usage on high-resolution streams (4K+)

### Decode Performance

Typical decode latency (hardware acceleration):
- 1080p60: ~2-4ms
- 1440p60: ~3-6ms  
- 4K60: ~5-10ms

### Fallback Behavior

If hardware decoding fails:
1. WebRTC attempts software fallback automatically
2. Higher CPU usage expected
3. Stats show `decoderImplementation: 'libvpx'` or similar

## Debugging

### Enable WebRTC Logging

```javascript
// Enable verbose WebRTC logging
app.commandLine.appendSwitch('vmodule', '*/webrtc/*=2');
app.commandLine.appendSwitch('enable-logging', 'stderr');
```

### Chrome DevTools

Use `chrome://webrtc-internals` in Electron DevTools to inspect:
- Active peer connections
- Codec negotiation
- Real-time statistics graphs
- ICE candidate pairs

### Stats Verification

```javascript
// Verify hardware decoder is active
const stats = await pc.getStats();
const inbound = [...stats.values()].find(s => s.type === 'inbound-rtp');
console.log('Decoder:', inbound.decoderImplementation);
// Expected: 'ExternalDecoder' (hardware) or specific codec library
```
