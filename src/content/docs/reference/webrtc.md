---
title: WebRTC
description: WebRTC peer connection, signaling, and data channels in OpenNow Electron
---

OpenNow uses WebRTC for real-time video/audio streaming and bidirectional input. This document covers the signaling protocol, SDP negotiation, and data channel usage in the Electron implementation.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Electron Main Process                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │               WebSocket Signaling                         │   │
│  │          (main/gfn/signaling.ts)                         │   │
│  │     wss://{server}/nvst/sign_in?session_id={id}          │   │
│  └──────────────────────┬───────────────────────────────────┘   │
│                         │                                        │
│                         ▼ WebSocket messages                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    IPC Bridge                             │   │
│  │        (main/renderer communication)                      │   │
│  └──────────────────────┬───────────────────────────────────┘   │
└─────────────────────────┼────────────────────────────────────────┘
                          │ IPC
┌─────────────────────────┼────────────────────────────────────────┐
│                         ▼                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Electron Renderer Process                    │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────────┐  │   │
│  │  │         WebRTC Client                                │  │   │
│  │  │    (renderer/src/gfn/webrtcClient.ts)               │  │   │
│  │  │         Native Chromium RTCPeerConnection           │  │   │
│  │  └──────────────────────┬──────────────────────────────┘  │   │
│  │                         │                                  │   │
│  │                         ▼ UDP/DTLS                        │   │
│  │  ┌─────────────────────────────────────────────────────┐  │   │
│  │  │              Media Server (GFN)                      │  │   │
│  │  └─────────────────────────────────────────────────────┘  │   │
│  │                                                           │   │
│  │  Data Channels:                                          │   │
│  │    ├── input_channel_v1 (reliable) - Keyboard/Gamepad    │   │
│  │    ├── partially_reliable (unreliable) - Mouse           │   │
│  │    └── output_channel_v1 - Rumble/FFB                    │   │
│  │                                                           │   │
│  │  Tracks:                                                 │   │
│  │    ├── Video (H.264/H.265/AV1)                           │   │
│  │    └── Audio (Opus 48kHz stereo)                         │   │
│  │                                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Signaling

The signaling client is implemented in the main process using WebSocket for connection to the GFN server.

### Connection

```typescript
// main/gfn/signaling.ts
class SignalingClient {
  private ws: WebSocket | null = null;
  private serverHost: string;
  private sessionId: string;
  private eventEmitter: EventEmitter;

  constructor(serverHost: string, sessionId: string) {
    this.serverHost = serverHost;
    this.sessionId = sessionId;
    this.eventEmitter = new EventEmitter();
  }

  async connect(): Promise<void> {
    const url = `wss://${this.serverHost}/nvst/sign_in?session_id=${this.sessionId}`;
    this.ws = new WebSocket(url);
    
    this.ws.on('open', () => this.eventEmitter.emit('connected'));
    this.ws.on('message', (data) => this.handleMessage(data));
    this.ws.on('close', (code, reason) => this.eventEmitter.emit('disconnected', reason));
    this.ws.on('error', (err) => this.eventEmitter.emit('error', err.message));
  }

  on(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.on(event, listener);
  }
}
```

### Signaling Events

```typescript
// Messages received from signaling server
interface SignalingMessage {
  type: 'offer' | 'candidate' | 'error';
  data: any;
}

interface SdpOfferMessage {
  type: 'offer';
  sdp: string;              // Standard SDP offer
  nvstSdp?: string;         // GFN custom nvstSdp
}

interface IceCandidateMessage {
  type: 'candidate';
  candidate: RTCIceCandidateInit;
}

// Signaling event types
enum SignalingEvent {
  SdpOffer = 'sdpOffer',
  IceCandidate = 'iceCandidate',
  Connected = 'connected',
  Disconnected = 'disconnected',
  Error = 'error'
}
```

### IPC Communication

Signaling messages are bridged between main and renderer processes via IPC:

```typescript
// Main process sends to renderer
ipcMain.on('signaling-message', (event, message) => {
  mainWindow.webContents.send('signaling-message', message);
});

// Renderer sends signaling response to main
ipcRenderer.send('signaling-response', {
  type: 'answer',
  sdp: answerSdp,
  nvstSdp: customNvstSdp
});
```

## WebRTC Client

The WebRTC client runs in the renderer process and uses Chromium's native RTCPeerConnection API.

### Client Structure

```typescript
// renderer/src/gfn/webrtcClient.ts
class WebRTCClient extends EventEmitter {
  private pc: RTCPeerConnection | null = null;
  private videoTrack: MediaStreamTrack | null = null;
  private audioTrack: MediaStreamTrack | null = null;
  private dataChannels: Map<string, RTCDataChannel> = new Map();
  private iceServers: RTCIceServer[] = [];

  constructor(config: WebRTCConfig) {
    super();
    this.iceServers = config.iceServers;
  }

  async initialize(): Promise<void> {
    this.pc = new RTCPeerConnection({
      iceServers: this.iceServers,
      iceTransportPolicy: 'all',
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require'
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    if (!this.pc) return;

    this.pc.ontrack = (event) => this.handleTrack(event);
    this.pc.onicecandidate = (event) => this.handleIceCandidate(event);
    this.pc.onconnectionstatechange = () => this.handleConnectionStateChange();
    this.pc.ondatachannel = (event) => this.handleDataChannel(event);
  }
}
```

### Events

```typescript
interface WebRTCClientEvents {
  'connected': () => void;
  'disconnected': () => void;
  'video-frame': (frame: VideoFrame) => void;
  'audio-frame': (frame: AudioFrame) => void;
  'data-channel-open': (label: string) => void;
  'data-channel-message': (label: string, data: ArrayBuffer) => void;
  'ice-candidate': (candidate: RTCIceCandidate) => void;
  'error': (error: Error) => void;
  'ssrc-change-detected': (stallDurationMs: number) => void;
}

interface VideoFrame {
  payload: Uint8Array;
  rtpTimestamp: number;
  marker: boolean;
}
```

## SDP Negotiation

SDP manipulation is handled in a dedicated module. GFN uses a custom SDP format called `nvstSdp` that includes streaming-specific parameters.

### SDP Processing Flow

```typescript
// renderer/src/gfn/sdp.ts
class SDPManager {
  /**
   * Process incoming SDP offer from GFN server
   */
  async processOffer(offerSdp: string, nvstSdp?: string): Promise<RTCSessionDescriptionInit> {
    // 1. Extract public IP from hostname (e.g., 95-178-87-234.server.com → 95.178.87.234)
    const serverIp = this.extractIpFromHostname(this.serverHost);
    
    // 2. Fix server IP in SDP for proper ICE connectivity
    let modifiedSdp = this.fixServerIp(offerSdp, serverIp);
    
    // 3. Inject provisional SSRCs (2, 3, 4) for resolution change handling
    modifiedSdp = this.injectProvisionalSsrcs(modifiedSdp);
    
    // 4. Set preferred codec based on user settings
    modifiedSdp = this.preferCodec(modifiedSdp, this.preferredCodec);
    
    // 5. Create answer via peer connection
    const offer = new RTCSessionDescription({ type: 'offer', sdp: modifiedSdp });
    await this.pc.setRemoteDescription(offer);
    
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    
    return answer;
  }

  /**
   * Build nvstSdp with streaming parameters
   */
  buildNvstSdp(params: NvstSdpParams): string {
    return this.generateNvstSdp(params);
  }
}
```

### nvstSdp Parameters

The `buildNvstSdp()` function generates streaming parameters:

```
v=0
o=SdpTest test_id_13 14 IN IPv4 127.0.0.1
s=-
t=0 0
a=general.icePassword:{ice_pwd}
a=general.iceUserNameFragment:{ice_ufrag}
a=general.dtlsFingerprint:{fingerprint}

m=video 0 RTP/AVP
a=msid:fbc-video-0

# FEC (Forward Error Correction)
a=vqos.fec.rateDropWindow:10
a=vqos.fec.minRequiredFecPackets:2
a=vqos.fec.repairMinPercent:5
a=vqos.fec.repairPercent:5
a=vqos.fec.repairMaxPercent:35

# DRC/DFC (Dynamic Rate/Frame Control)
a=vqos.drc.enable:0
a=vqos.dfc.enable:1  # For 120+ FPS
a=vqos.dfc.decodeFpsAdjPercent:85

# Video Quality
a=video.clientViewportWd:{width}
a=video.clientViewportHt:{height}
a=video.maxFPS:{fps}
a=video.initialBitrateKbps:{max_bitrate * 3/4}
a=vqos.bw.maximumBitrateKbps:{max_bitrate}
a=vqos.bw.peakBitrateKbps:{max_bitrate}

# Resolution Control (disabled to prevent SSRC changes)
a=vqos.resControl.cpmRtc.enable:0
a=vqos.resControl.cpmRtc.featureMask:0
a=vqos.resControl.cpmRtc.minResolutionPercent:100

m=audio 0 RTP/AVP
a=msid:audio

m=mic 0 RTP/AVP
a=msid:mic

m=application 0 RTP/AVP
a=msid:input_1
a=ri.partialReliableThresholdMs:300
```

### High FPS Optimizations (120+ FPS)

Additional parameters for high frame rate streaming:

```typescript
// renderer/src/gfn/sdp.ts
function getHighFpsParams(targetFps: number): Record<string, string> {
  const params: Record<string, string> = {
    'bwe.iirFilterFactor': '8',
    'video.encoderFeatureSetting': '47',
    'video.encoderPreset': '6',
    'video.fbcDynamicFpsGrabTimeoutMs': targetFps === 120 ? '6' : '18'
  };

  if (targetFps === 120) {
    params['vqos.dfc.minTargetFps'] = '100';
  } else if (targetFps >= 240) {
    params['vqos.dfc.minTargetFps'] = '60';
    params['video.enableNextCaptureMode'] = '1';
    params['vqos.maxStreamFpsEstimate'] = '240';
    params['video.videoSplitEncodeStripsPerFrame'] = '3';
    params['video.updateSplitEncodeStateDynamically'] = '1';
  }

  return params;
}
```

### 240+ FPS Optimizations

```
a=video.enableNextCaptureMode:1
a=vqos.maxStreamFpsEstimate:240
a=video.videoSplitEncodeStripsPerFrame:3
a=video.updateSplitEncodeStateDynamically:1
```

## ICE Servers

ICE servers are configured from the CloudMatch session response plus fallbacks:

```typescript
// renderer/src/gfn/webrtcClient.ts
function buildIceServers(session: CloudMatchSession): RTCIceServer[] {
  const servers: RTCIceServer[] = [];

  // From session.ice_servers
  if (session.iceServers) {
    for (const server of session.iceServers) {
      servers.push({
        urls: server.urls,
        username: server.username,
        credential: server.credential
      });
    }
  }

  // Fallback STUN servers
  servers.push(
    { urls: 'stun:s1.stun.gamestream.nvidia.com:19308' },
    { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }
  );

  return servers;
}
```

## Data Channels

### Input Channels

| Channel | Type | Purpose |
|---------|------|---------|
| `input_channel_v1` | Reliable, ordered | Keyboard, gamepad input |
| `partially_reliable` | Unreliable, unordered | Mouse input (8ms lifetime) |

### Output Channels

| Channel | Type | Purpose |
|---------|------|---------|
| `output_channel_v1` | Reliable | Rumble, force feedback events |

### Creating Data Channels

```typescript
// renderer/src/gfn/webrtcClient.ts
private createInputChannels(): void {
  if (!this.pc) return;

  // Reliable channel for keyboard/gamepad
  const inputChannel = this.pc.createDataChannel('input_channel_v1', {
    ordered: true,
    maxRetransmits: null
  });
  this.setupDataChannel(inputChannel);

  // Unreliable channel for mouse (low latency, allows drops)
  const mouseChannel = this.pc.createDataChannel('partially_reliable', {
    ordered: false,
    maxRetransmits: 0,
    maxPacketLifeTime: 8  // 8ms lifetime
  });
  this.setupDataChannel(mouseChannel);
}

private setupDataChannel(channel: RTCDataChannel): void {
  this.dataChannels.set(channel.label, channel);
  
  channel.onopen = () => {
    this.emit('data-channel-open', channel.label);
    
    if (channel.label === 'input_channel_v1') {
      this.performInputHandshake(channel);
    }
  };
  
  channel.onmessage = (event) => {
    this.emit('data-channel-message', channel.label, event.data);
  };
}
```

## Input Protocol

The custom binary input protocol handles input event encoding and transmission.

### Input Handshake

```typescript
// renderer/src/gfn/inputProtocol.ts
class InputProtocol {
  private inputReady: boolean = false;
  private protocolVersion: number = 1;

  /**
   * Perform input channel handshake
   * Server sends version info, client echoes back
   */
  performHandshake(channel: RTCDataChannel): void {
    channel.onmessage = (event) => {
      const data = new Uint8Array(event.data);
      
      // Parse handshake message
      // New format: [0x0E, 0x02, version_lo, version_hi]
      // Old format: [0x0E, version_lo, version_hi]
      
      if (data[0] === 0x0E) {
        if (data[1] === 0x02) {
          // New format with feature byte
          this.protocolVersion = data[2] | (data[3] << 8);
        } else {
          // Old format
          this.protocolVersion = data[1] | (data[2] << 8);
        }
        
        // Echo back to complete handshake
        channel.send(data.buffer);
        this.inputReady = true;
      }
    };
  }
}
```

### Input Encoding

```typescript
// renderer/src/gfn/inputProtocol.ts
interface InputEvent {
  type: 'keyboard' | 'mouse' | 'gamepad';
  timestamp: number;  // microseconds
  data: KeyboardData | MouseData | GamepadData;
}

interface MouseData {
  x: number;
  y: number;
  buttonMask: number;
  wheelDelta: number;
}

class InputEncoder {
  private protocolVersion: number;
  private sequence: number = 0;

  constructor(protocolVersion: number) {
    this.protocolVersion = protocolVersion;
  }

  encode(event: InputEvent): Uint8Array {
    // Binary encoding with timestamps for server-side processing
    const buffer = new ArrayBuffer(64);
    const view = new DataView(buffer);
    let offset = 0;

    // Sequence number
    view.setUint32(offset, this.sequence++, true);
    offset += 4;

    // Timestamp (microseconds)
    view.setBigUint64(offset, BigInt(event.timestamp), true);
    offset += 8;

    // Event type
    view.setUint8(offset++, this.getEventTypeCode(event.type));

    // Event-specific data
    switch (event.type) {
      case 'mouse':
        this.encodeMouseData(view, offset, event.data as MouseData);
        break;
      case 'keyboard':
        this.encodeKeyboardData(view, offset, event.data as KeyboardData);
        break;
      case 'gamepad':
        this.encodeGamepadData(view, offset, event.data as GamepadData);
        break;
    }

    return new Uint8Array(buffer, 0, offset);
  }
}
```

### Sending Input

```typescript
// renderer/src/gfn/webrtcClient.ts
sendInput(event: InputEvent): void {
  if (!this.inputReady) return;

  const encoded = this.inputEncoder.encode(event);
  
  // Send mouse on unreliable channel for low latency
  if (event.type === 'mouse') {
    const mouseChannel = this.dataChannels.get('partially_reliable');
    if (mouseChannel && mouseChannel.readyState === 'open') {
      mouseChannel.send(encoded);
    }
  } else {
    // Send keyboard/gamepad on reliable channel
    const inputChannel = this.dataChannels.get('input_channel_v1');
    if (inputChannel && inputChannel.readyState === 'open') {
      inputChannel.send(encoded);
    }
  }
}
```

## Streaming Result

The streaming session returns a result indicating how it ended:

```typescript
enum StreamingResult {
  Normal = 'normal',                    // Clean shutdown
  Error = 'error',                      // Connection error
  SsrcChangeDetected = 'ssrcChange'     // Resolution change detected
}

interface StreamingEndReason {
  result: StreamingResult;
  message?: string;
  stallDurationMs?: number;
}
```

### SSRC Change Handling

GFN servers may change video SSRC when resolution changes. Chromium doesn't support mid-stream SSRC changes without MID extensions, so OpenNow detects this as a stall and initiates reconnection:

1. Video frames stop arriving
2. After timeout, `ssrc-change-detected` event is raised
3. Application triggers session reconnect
4. Provisional SSRCs (2, 3, 4) are injected in SDP to help with future changes

```typescript
// renderer/src/gfn/webrtcClient.ts
private checkForStall(): void {
  const lastFrameTime = this.getLastFrameTimestamp();
  const stallDuration = Date.now() - lastFrameTime;
  
  if (stallDuration > this.ssrcChangeTimeout) {
    this.emit('ssrc-change-detected', stallDuration);
  }
}
```

## Network Stats

```typescript
// renderer/src/gfn/webrtcClient.ts
interface NetworkStats {
  rttMs: number;           // Round-trip time from ICE candidate pair
  packetsLost: number;     // Total packets lost
  packetsReceived: number; // Total packets received
  bytesReceived: number;   // Total bytes received
  bitrate: number;         // Current bitrate in bps
}

async getNetworkStats(): Promise<NetworkStats> {
  if (!this.pc) throw new Error('Peer connection not initialized');

  const stats = await this.pc.getStats();
  const networkStats: NetworkStats = {
    rttMs: 0,
    packetsLost: 0,
    packetsReceived: 0,
    bytesReceived: 0,
    bitrate: 0
  };

  stats.forEach((report) => {
    if (report.type === 'candidate-pair' && report.state === 'succeeded') {
      networkStats.rttMs = report.currentRoundTripTime * 1000;
    }
    if (report.type === 'inbound-rtp') {
      networkStats.packetsLost = report.packetsLost;
      networkStats.packetsReceived = report.packetsReceived;
      networkStats.bytesReceived = report.bytesReceived;
    }
  });

  return networkStats;
}
```

## Keyframe Requests

When the decoder needs a keyframe (corruption, packet loss), it can request one:

```typescript
// renderer/src/gfn/webrtcClient.ts
async requestKeyframe(): Promise<void> {
  if (!this.pc) return;

  const sender = this.pc.getSenders().find(s => 
    s.track?.kind === 'video'
  );

  if (sender) {
    const params = sender.getParameters();
    // Chromium handles PLI automatically or via RTCP
    await sender.setParameters(params);
  }
}
```

## File Structure

```
renderer/src/gfn/
├── webrtcClient.ts      # Main WebRTC client using native APIs
├── sdp.ts               # SDP manipulation and nvstSdp generation
├── inputProtocol.ts     # Binary input protocol encoding
└── types.ts             # TypeScript interfaces

main/gfn/
├── signaling.ts         # WebSocket signaling client
└── ipc-handlers.ts      # IPC bridge between main and renderer
```

## Key Differences from Native Implementation

| Aspect | Electron/Chromium | Notes |
|--------|-------------------|-------|
| WebRTC API | Native RTCPeerConnection | Uses Chromium's built-in implementation |
| Video Decoding | Hardware accelerated | Via Chromium's media pipeline |
| Data Channels | Native RTCDataChannel | No custom implementation needed |
| SDP Handling | Standard SDP + nvstSdp | Same protocol, TypeScript implementation |
| Input Encoding | Binary protocol | Custom TypeScript encoder |
| Process Model | Main + Renderer | Signaling in main, WebRTC in renderer |
