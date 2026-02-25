---
title: Architecture Overview
description: High-level architecture of OpenNow Electron Client
---

OpenNow is built on Electron's multi-process architecture, leveraging the security and performance characteristics of the Chromium runtime. This document describes the three-process model and how components interact across process boundaries.

## Process Architecture

Electron applications run across three distinct process types, each with specific responsibilities and security privileges:

```
┌─────────────────────────────────────────────────────────────┐
│                     Electron Application                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐                                       │
│  │  Main Process    │  (Node.js)                             │
│  │  ─────────────   │                                       │
│  │  • OAuth flows   │                                       │
│  │  • HTTP APIs     │                                       │
│  │  • WebSocket     │                                       │
│  │    signaling     │                                       │
│  │  • Session mgmt  │                                       │
│  │  • Settings I/O  │                                       │
│  └────────┬─────────┘                                       │
│           │                                                 │
│           │ IPC (contextBridge)                             │
│           │                                                 │
│  ┌────────▼─────────┐                                       │
│  │  Preload Script  │  (Isolated Context)                    │
│  │  ─────────────   │                                       │
│  │  • Secure bridge │                                       │
│  │  • API exposure  │                                       │
│  │  • ContextIsolation│                                     │
│  └────────┬─────────┘                                       │
│           │                                                 │
│           │ PostMessage / Custom Events                     │
│           │                                                 │
│  ┌────────▼─────────┐                                       │
│  │  Renderer        │  (Chromium + React)                    │
│  │  ─────────────   │                                       │
│  │  • React UI      │                                       │
│  │  • WebRTC peer   │                                       │
│  │  • Input capture │                                       │
│  │  • Media decode  │                                       │
│  └──────────────────┘                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Core Processes

### Main Process (Node.js)

The main process is the application's entry point and controls the lifecycle of all renderer processes. It has full Node.js and system access.

**Responsibilities:**

```typescript
// Main process architecture
interface MainProcessAPI {
  // OAuth 2.0 with PKCE
  auth: {
    initiateOAuth(provider: string): Promise<AuthSession>;
    handleCallback(url: string): Promise<Tokens>;
    refreshToken(refreshToken: string): Promise<Tokens>;
  };
  
  // HTTP API clients
  api: {
    cloudMatch: CloudMatchClient;    // Session creation/polling
    games: GamesClient;              // GraphQL game library
    queue: QueueClient;              // Queue time estimates
  };
  
  // WebSocket signaling
  signaling: {
    connect(sessionId: string): WebSocket;
    send(message: SignalingMessage): void;
    onMessage(handler: (msg: SignalingMessage) => void): void;
  };
  
  // Session management
  session: {
    create(gameId: string): Promise<Session>;
    poll(sessionId: string): Promise<SessionStatus>;
    terminate(sessionId: string): Promise<void>;
  };
  
  // Persistent settings
  settings: {
    get(key: string): any;
    set(key: string, value: any): void;
    watch(key: string, handler: (value: any) => void): void;
  };
}
```

**Key Characteristics:**
- Runs Node.js with unrestricted filesystem and network access
- Manages BrowserWindow instances for UI
- Handles OAuth flows via custom protocol handlers
- Maintains persistent WebSocket connections to GFN servers
- Stores encrypted credentials in OS keychain

### Preload Script (Secure Bridge)

The preload script runs in an isolated context before the renderer loads, establishing a secure communication channel between main and renderer.

```typescript
// Preload exposes safe APIs to renderer
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Auth
  auth: {
    login: (provider) => ipcRenderer.invoke('auth:login', provider),
    logout: () => ipcRenderer.invoke('auth:logout'),
    getTokens: () => ipcRenderer.invoke('auth:getTokens'),
    onTokensUpdated: (callback) => 
      ipcRenderer.on('auth:tokensUpdated', callback),
  },
  
  // Session
  session: {
    create: (gameId) => ipcRenderer.invoke('session:create', gameId),
    poll: (sessionId) => ipcRenderer.invoke('session:poll', sessionId),
    terminate: (sessionId) => ipcRenderer.invoke('session:terminate', sessionId),
    onStatusUpdate: (callback) => 
      ipcRenderer.on('session:status', callback),
  },
  
  // Signaling (WebSocket proxy)
  signaling: {
    connect: (sessionId) => ipcRenderer.send('signaling:connect', sessionId),
    send: (message) => ipcRenderer.send('signaling:send', message),
    onMessage: (callback) => 
      ipcRenderer.on('signaling:message', callback),
    disconnect: () => ipcRenderer.send('signaling:disconnect'),
  },
  
  // Settings
  settings: {
    get: (key) => ipcRenderer.invoke('settings:get', key),
    set: (key, value) => ipcRenderer.invoke('settings:set', key, value),
  },
  
  // Stream control
  stream: {
    onVideoFrame: (callback) => 
      ipcRenderer.on('stream:videoFrame', callback),
    onAudioData: (callback) => 
      ipcRenderer.on('stream:audioData', callback),
    sendInput: (inputData) => ipcRenderer.send('stream:input', inputData),
  },
});
```

**Security Model:**
- Runs with `contextIsolation: true` and `nodeIntegration: false`
- Only explicitly exposed APIs are available to renderer
- Prevents arbitrary code execution in renderer
- Validates all IPC messages before processing

### Renderer Process (React + WebRTC)

The renderer process is a Chromium environment where the React UI runs. It has no direct Node.js or system access—all operations go through the preload bridge.

**Application Structure:**

```
src/renderer/
├── components/
│   ├── Auth/
│   │   ├── LoginScreen.tsx       # OAuth provider selection
│   │   └── AlliancePartners.tsx  # Regional providers
│   ├── Library/
│   │   ├── GameGrid.tsx          # Browse games
│   │   ├── SearchBar.tsx         # Filter/search
│   │   └── GameCard.tsx          # Individual game
│   ├── Session/
│   │   ├── QueueStatus.tsx       # Queue position
│   │   ├── ConnectionProgress.tsx # Setup steps
│   │   └── ErrorDisplay.tsx      # Session errors
│   └── Stream/
│       ├── VideoPlayer.tsx       # WebRTC video element
│       ├── InputOverlay.tsx      # Mouse/keyboard capture
│       ├── StatsPanel.tsx        # Performance overlay
│       └── Sidebar.tsx           # In-stream controls
├── hooks/
│   ├── useAuth.ts                # Authentication state
│   ├── useSession.ts             # Session lifecycle
│   ├── useWebRTC.ts              # Peer connection management
│   └── useInput.ts               # Input capture & encoding
├── webrtc/
│   ├── peerConnection.ts         # RTCPeerConnection wrapper
│   ├── signaling.ts              # Signaling state machine
│   ├── tracks.ts                 # Video/audio track handling
│   └── datachannel.ts            # Input/data channels
└── input/
    ├── mouseCapture.ts           # Pointer lock & movement
    ├── keyboardCapture.ts        # Key event interception
    ├── gamepadCapture.ts         # Gamepad API wrapper
    └── inputEncoder.ts           # Binary format encoding
```

**WebRTC Stack:**

```
┌─────────────────────────────────────────┐
│         Renderer Process               │
│  ┌─────────────────────────────────┐    │
│  │      React Application          │    │
│  │  ┌─────────────────────────┐    │    │
│  │  │    Video Player         │    │    │
│  │  │  ┌─────────────────┐    │    │    │
│  │  │  │  <video> Element │    │    │    │
│  │  │  │  (WebRTC stream) │    │    │    │
│  │  │  └─────────────────┘    │    │    │
│  │  └─────────────────────────┘    │    │
│  │  ┌─────────────────────────┐    │    │
│  │  │    Input Overlay        │    │    │
│  │  │  (Pointer Lock Capture) │    │    │
│  │  └─────────────────────────┘    │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │      WebRTC Stack               │    │
│  │  ┌─────────────────────────┐    │    │
│  │  │   RTCPeerConnection     │    │    │
│  │  │  • ICE gathering        │    │    │
│  │  │  • DTLS transport       │    │    │
│  │  │  • SDP negotiation      │    │    │
│  │  └─────────────────────────┘    │    │
│  │  ┌─────────────────────────┐    │    │
│  │  │   Media Streams         │    │    │
│  │  │  • Video (H.264/AV1)    │    │    │
│  │  │  • Audio (Opus)         │    │    │
│  │  └─────────────────────────┘    │    │
│  │  ┌─────────────────────────┐    │    │
│  │  │   Data Channels         │    │    │
│  │  │  • input_channel_v1     │    │    │
│  │  │  • cursor_channel       │    │    │
│  │  │  • control_channel      │    │    │
│  │  └─────────────────────────┘    │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │      Input System               │    │
│  │  • Pointer lock API             │    │
│  │  • Raw mouse movement           │    │
│  │  • Keyboard interception        │    │
│  │  • Gamepad API                  │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

## Data Flows

### 1. Authentication Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Renderer   │     │    Preload   │     │     Main     │     │  NVIDIA OAuth│
│   (React)    │◄───►│   (Bridge)   │◄───►│   (Node.js)  │◄───►│   Server     │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘     └──────────────┘
       │                    │                    │
       │ 1. Click login     │                    │
       │───────────────────►│                    │
       │                    │ 2. auth:login      │
       │                    │───────────────────►│
       │                    │                    │ 3. Generate PKCE
       │                    │                    │    (verifier + challenge)
       │                    │                    │
       │                    │                    │ 4. Open browser
       │                    │                    │    (system.openExternal)
       │                    │                    │──────► Browser opens
       │                    │                    │        to login.nvidia.com
       │                    │                    │
       │                    │                    │ 5. User authenticates
       │                    │                    │◄─────── Authorization code
       │                    │                    │        via custom protocol
       │                    │                    │        (opennow://callback)
       │                    │                    │
       │                    │                    │ 6. Exchange code
       │                    │                    │    POST /token
       │                    │                    │◄─────── Access + refresh
       │                    │                    │        tokens
       │                    │                    │
       │                    │                    │ 7. Encrypt & store
       │                    │                    │    in OS keychain
       │                    │                    │
       │                    │◄───────────────────│ 8. auth:tokensUpdated
       │                    │   (IPC event)      │
       │◄───────────────────│                    │
       │ 9. Update UI       │                    │
       │    (logged in)     │                    │
```

**Key Steps:**
1. User clicks login button in React UI
2. Renderer invokes `auth:login` through preload bridge
3. Main generates PKCE verifier and challenge
4. Main opens system browser to NVIDIA OAuth endpoint
5. User completes authentication in browser
6. Authorization code received via custom protocol handler
7. Main exchanges code for tokens via HTTP POST
8. Tokens encrypted and stored in OS keychain
9. Tokens sent to renderer via IPC event
10. React UI updates to show logged-in state

### 2. Game Launch Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Renderer   │     │    Preload   │     │     Main     │     │    GFN API   │
│   (React)    │◄───►│   (Bridge)   │◄───►│   (Node.js)  │◄───►│   Servers    │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘     └──────────────┘
       │                    │                    │
       │ 1. Select game     │                    │
       │    & click play    │                    │
       │───────────────────►│                    │
       │                    │ 2. session:create  │
       │                    │───────────────────►│
       │                    │                    │ 3. POST /v2/session
       │                    │                    │    (CloudMatch API)
       │                    │                    │──────► Session created
       │                    │                    │◄─────── Session ID + URL
       │                    │                    │
       │                    │                    │ 4. Start polling loop
       │                    │                    │    (1-3 second intervals)
       │                    │                    │
       │                    │                    │ 5. Connect WebSocket
       │                    │                    │    to /nvst/sign_in
       │                    │                    │──────► Signaling ready
       │                    │                    │
       │                    │◄───────────────────│ 6. session:status event
       │                    │   (polling updates)│    (queue position, etc.)
       │◄───────────────────│                    │
       │ 7. Show queue/     │                    │
       │    progress UI     │                    │
       │                    │                    │
       │                    │                    │ 8. Receive SDP offer
       │                    │                    │◄─────── via WebSocket
       │                    │                    │
       │                    │◄───────────────────│ 9. signaling:message event
       │                    │   (SDP offer)      │
       │◄───────────────────│                    │
       │ 10. Create peer    │                    │
       │     connection     │                    │
       │     & set remote   │                    │
       │     description    │                    │
       │───────────────────►│                    │
       │                    │ 11. Create answer  │
       │                    │   + nvstSdp        │
       │                    │───────────────────►│
       │                    │                    │ 12. Send via WebSocket
       │                    │                    │──────► Signaling complete
       │                    │                    │
       │                    │                    │ 13. ICE candidates
       │                    │◄───────────────────│     (trickle ICE)
       │                    │   (ICE exchange)   │
       │◄───────────────────│                    │
       │ 14. ICE gathering  │                    │
       │     & connection   │                    │
       │                    │                    │
       │                    │                    │ 15. DTLS handshake
       │                    │                    │◄──────► Complete
       │                    │                    │
       │                    │                    │ 16. Data channel ready
       │                    │◄───────────────────│     (input_channel_v1)
       │◄───────────────────│                    │
       │ 17. Stream starts  │                    │
       │     Video received │                    │
```

**Key Steps:**
1. User selects game from library and clicks play
2. Renderer invokes `session:create` through preload
3. Main makes HTTP POST to CloudMatch API
4. Main starts polling loop for session status
5. Main establishes WebSocket signaling connection
6. Polling updates sent to renderer for UI display
7. Once ready, GFN server sends SDP offer via WebSocket
8. Renderer receives SDP offer via IPC
9. Renderer creates RTCPeerConnection and sets remote description
10. Renderer generates SDP answer with nvstSdp extension
11. Answer sent back to main via IPC
12. Main sends answer via WebSocket signaling
13. ICE candidates exchanged between peers
14. DTLS handshake completes for secure transport
15. Data channel established for input transmission
16. Video/audio RTP packets begin arriving
17. React video element displays decoded stream

### 3. Input Transmission Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Renderer   │     │    Preload   │     │     Main     │     │    GFN       │
│   (React)    │◄───►│   (Bridge)   │◄───►│   (Node.js)  │◄───►│    Server    │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘     └──────────────┘
       │                    │                    │
       │ 1. User moves      │                    │
       │    mouse/clicks    │                    │
       │                    │                    │
  ┌────┴────────────────────┴────────────────────┴────┐
  │         Input Capture (Renderer)                  │
  │  • Pointer Lock API locks cursor                  │
  │  • Raw mouse deltas via mousemove event           │
  │  • Keyboard via keydown/keyup                     │
  │  • Gamepad via requestAnimationFrame polling      │
  └────┬────────────────────┬────────────────────┬────┘
       │                    │                    │
       │ 2. Input events    │                    │
       │    captured by     │                    │
       │    input hooks     │                    │
       │                    │                    │
  ┌────┴────────────────────┴────────────────────┴────┐
  │         Input Processing (Renderer)               │
  │  • Mouse deltas coalesced (2ms batches)           │
  │  • Relative movement calculation                  │
  │  • Key state tracking                             │
  │  • Gamepad state snapshot                         │
  └────┬────────────────────┬────────────────────┬────┘
       │                    │                    │
       │ 3. Encode to       │                    │
       │    binary format   │                    │
       │                    │                    │
       │ 4. Send via        │                    │
       │    data channel    │                    │
       │    (RTCPeerConnection)                  │
       │───────────────────►│                    │
       │    (direct WebRTC, │                    │
       │     not IPC)       │                    │
       │                    │                    │
       │                    │                    │ 5. UDP/DTLS transport
       │                    │                    │──────► Server receives
       │                    │                    │        input packets
```

**Key Characteristics:**
1. **Pointer Lock API**: Cursor locked to game window, raw deltas captured
2. **No IPC for input**: Input goes directly via WebRTC data channel (lowest latency)
3. **Mouse coalescing**: Multiple movements within 2ms window combined
4. **Channel types**:
   - Mouse: `partially_reliable` channel (8ms packet lifetime, drops if delayed)
   - Keyboard/Gamepad: `input_channel_v1` reliable ordered channel
5. **Binary encoding**: Compact binary format for minimal overhead
6. **Local feedback**: Cursor rendered locally for instant visual response

```typescript
// Input encoding (Renderer process)
interface InputEncoder {
  // Mouse input (unreliable channel - low latency priority)
  encodeMouseMove(dx: number, dy: number): Uint8Array;
  encodeMouseButton(button: number, pressed: boolean): Uint8Array;
  encodeMouseWheel(deltaX: number, deltaY: number): Uint8Array;
  
  // Keyboard input (reliable channel)
  encodeKeyDown(keyCode: number, modifiers: number): Uint8Array;
  encodeKeyUp(keyCode: number): Uint8Array;
  
  // Gamepad input (reliable channel)
  encodeGamepadState(
    axes: number[],
    buttons: number[],
    timestamp: number
  ): Uint8Array;
}

// Send via RTCDataChannel
const inputChannel = peerConnection.createDataChannel('input_channel_v1', {
  ordered: true,
  maxRetransmits: 0, // For mouse: don't retransmit if delayed
});

inputChannel.send(encodedInput);
```

### 4. Stream Termination Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Renderer   │     │    Preload   │     │     Main     │     │    GFN       │
│   (React)    │◄───►│   (Bridge)   │◄───►│   (Node.js)  │◄───►│    Server    │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘     └──────────────┘
       │                    │                    │
       │ 1. User clicks     │                    │
       │    "End Session"   │                    │
       │    or connection   │                    │
       │    lost            │                    │
       │───────────────────►│                    │
       │                    │ 2. session:terminate│
       │                    │    or stream:end   │
       │                    │───────────────────►│
       │                    │                    │
  ┌────┴────────────────────┴────────────────────┴────┐
  │         Cleanup Sequence                          │
  └────┬────────────────────┬────────────────────┬────┘
       │                    │                    │
       │                    │                    │ 3. Close WebSocket
       │                    │                    │    signaling connection
       │                    │                    │──────► Disconnect
       │                    │                    │
       │                    │                    │ 4. Close RTCPeerConnection
       │                    │                    │    (if not already closed)
       │                    │                    │
       │                    │                    │ 5. Send DELETE /v2/session
       │                    │                    │──────► Session terminated
       │                    │                    │        on server
       │                    │                    │
       │                    │                    │ 6. Stop polling loop
       │                    │                    │
       │                    │                    │ 7. Release session state
       │                    │                    │
       │                    │◄───────────────────│ 8. session:terminated event
       │◄───────────────────│                    │
       │ 9. Return to       │                    │
       │    library view    │                    │
       │    (React Router)  │                    │
       │                    │                    │
       │ 10. Cleanup        │                    │
       │     renderer state │                    │
       │     (WebRTC refs,  │                    │
       │      input hooks)  │                    │
```

**Termination Scenarios:**

1. **User-initiated**: User clicks "End Session" button
2. **Session timeout**: Server disconnects due to inactivity
3. **Network error**: Connection lost, ICE failure
4. **Error condition**: Session error from GFN API

**Cleanup Actions:**
- Close WebSocket signaling connection
- Close RTCPeerConnection and all tracks
- Release pointer lock if active
- Remove input event listeners
- Clear video element source
- Release decoder resources
- Return to library view

## Security Model

### Process Isolation

```
┌─────────────────────────────────────────────────────────────┐
│                     Security Boundaries                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐                                       │
│  │  Main Process    │  🔒 Trusted (Node.js, system access)   │
│  │                  │                                       │
│  │  • Can access OS │                                       │
│  │  • Can make HTTP │                                       │
│  │  • Stores secrets│                                       │
│  └──────────────────┘                                       │
│           ▲                                                 │
│           │ IPC (validated)                                 │
│           ▼                                                 │
│  ┌──────────────────┐                                       │
│  │  Preload Script  │  🔒 Bridge (isolated context)          │
│  │                  │                                       │
│  │  • Exposes APIs  │                                       │
│  │  • Validates data│                                       │
│  │  • No Node access│                                       │
│  └──────────────────┘                                       │
│           ▲                                                 │
│           │ PostMessage                                     │
│           ▼                                                 │
│  ┌──────────────────┐                                       │
│  │  Renderer        │  🔒 Untrusted (web content)            │
│  │                  │                                       │
│  │  • No Node access│                                       │
│  │  • No file access│                                       │
│  │  • Sandboxed     │                                       │
│  └──────────────────┘                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Content Security Policy

```javascript
// Main process CSP configuration
const mainWindow = new BrowserWindow({
  webPreferences: {
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: true,
    preload: path.join(__dirname, 'preload.js'),
  },
});

// CSP headers prevent XSS
mainWindow.webContents.session.webRequest.onHeadersReceived(
  (details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self';" +
          "script-src 'self' 'unsafe-inline';" +
          "style-src 'self' 'unsafe-inline';" +
          "connect-src 'self' https://*.nvidiagrid.net https://*.geforce.com;" +
          "img-src 'self' https://*.geforce.com data:;"
        ]
      }
    });
  }
);
```

### IPC Validation

All IPC messages validated at preload boundary:

```typescript
// Preload script validation
const validChannels = [
  'auth:login', 'auth:logout', 'auth:getTokens', 'auth:tokensUpdated',
  'session:create', 'session:poll', 'session:terminate', 'session:status',
  'signaling:connect', 'signaling:send', 'signaling:message', 'signaling:disconnect',
  'settings:get', 'settings:set',
  'stream:input',
];

// Only allow whitelisted channels
ipcRenderer.on('signaling:message', (event, ...args) => {
  // Validate message structure
  const message = args[0];
  if (!isValidSignalingMessage(message)) {
    console.error('Invalid signaling message received');
    return;
  }
  // Forward to renderer
});

function isValidSignalingMessage(msg: any): boolean {
  return msg && 
         typeof msg.type === 'string' &&
         ['offer', 'answer', 'candidate', 'error'].includes(msg.type);
}
```

## Build Output

```
dist/
├── main/
│   └── index.js              # Bundled main process
├── preload/
│   └── index.js              # Bundled preload script
└── renderer/
    ├── index.html            # Entry HTML
    ├── assets/
    │   ├── index-*.js        # React bundle
    │   ├── index-*.css       # Styles
    │   └── *.woff2           # Fonts
    └── images/               # Static assets
```

## Technology Stack

| Component | Technology |
|-----------|------------|
| **Main Process** | Node.js 20, Electron 28 |
| **Renderer** | React 18, TypeScript 5 |
| **State Management** | Zustand |
| **Routing** | React Router 6 |
| **Styling** | Tailwind CSS |
| **WebRTC** | Native WebRTC API |
| **Bundling** | Vite |
| **Testing** | Vitest, Playwright |

---

*Last updated: Architecture documentation for Electron migration*
