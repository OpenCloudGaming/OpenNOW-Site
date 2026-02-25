---
title: Input System
description: Cross-platform input handling in OpenNow Electron client
---

OpenNow implements a low-latency input system with native event listeners, mouse sensitivity adjustment, local cursor rendering, and support for up to 4 simultaneous gamepads.

## Architecture

```
Native Event Listeners (Renderer Process)
        │
        ▼
┌─────────────────────┐
│  Keyboard Capture   │  keydown/keyup events
│  Mouse Capture      │  mousemove/mousedown/mouseup/wheel
│  Gamepad Polling    │  navigator.getGamepads() @ 250Hz
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│  Input Processor    │  Event normalization & sensitivity
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│  Binary Protocol    │  Efficient encoding (inputProtocol.ts)
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│  WebRTC Data Channel│  Network transmission
└─────────────────────┘
```

## Input Event Types

```typescript
export enum InputEventType {
  KeyDown = 0x01,
  KeyUp = 0x02,
  MouseMove = 0x03,
  MouseButtonDown = 0x04,
  MouseButtonUp = 0x05,
  MouseWheel = 0x06,
  GamepadState = 0x07,
  ClipboardPaste = 0x08,
  Heartbeat = 0x09,
}

export interface InputEvent {
  type: InputEventType;
  timestamp: number;  // Monotonic clock (microseconds)
  data: KeyEventData | MouseEventData | GamepadEventData | ClipboardData;
}

export interface KeyEventData {
  keycode: number;    // DOM keyCode normalized to Windows VK
  scancode: number;   // Platform scancode
  modifiers: number;  // Shift/Ctrl/Alt/Meta flags
}

export interface MouseEventData {
  dx?: number;        // Relative X (can be scaled)
  dy?: number;        // Relative Y (can be scaled)
  button?: number;    // 0=Left, 1=Middle, 2=Right, 3=Back, 4=Forward
  delta?: number;     // Wheel delta
}

export interface GamepadEventData {
  controllerId: number;  // 0-3
  buttons: number;       // 32-bit button bitmask
  leftStickX: number;    // -32768 to 32767
  leftStickY: number;
  rightStickX: number;
  rightStickY: number;
  leftTrigger: number;   // 0-255
  rightTrigger: number;
}

export interface ClipboardData {
  text: string;  // UTF-8 encoded, max 64KB
}
```

## Binary Input Protocol

Input events are encoded to binary format for efficient transmission:

**File**: `renderer/src/gfn/inputProtocol.ts`

```typescript
export class InputProtocol {
  private buffer: ArrayBuffer;
  private view: DataView;
  private offset: number = 0;

  constructor(bufferSize: number = 1024) {
    this.buffer = new ArrayBuffer(bufferSize);
    this.view = new DataView(this.buffer);
  }

  encodeKeyEvent(type: InputEventType, data: KeyEventData): Uint8Array {
    this.offset = 0;
    this.view.setUint8(this.offset++, type);
    this.view.setUint16(this.offset, data.keycode, true);
    this.offset += 2;
    this.view.setUint16(this.offset, data.scancode, true);
    this.offset += 2;
    this.view.setUint8(this.offset++, data.modifiers);
    return new Uint8Array(this.buffer, 0, this.offset);
  }

  encodeMouseMove(dx: number, dy: number): Uint8Array {
    this.offset = 0;
    this.view.setUint8(this.offset++, InputEventType.MouseMove);
    this.view.setInt16(this.offset, Math.max(-32768, Math.min(32767, dx)), true);
    this.offset += 2;
    this.view.setInt16(this.offset, Math.max(-32768, Math.min(32767, dy)), true);
    this.offset += 2;
    return new Uint8Array(this.buffer, 0, this.offset);
  }

  encodeGamepad(data: GamepadEventData): Uint8Array {
    this.offset = 0;
    this.view.setUint8(this.offset++, InputEventType.GamepadState);
    this.view.setUint8(this.offset++, data.controllerId & 0x03);
    this.view.setUint32(this.offset, data.buttons, true);
    this.offset += 4;
    this.view.setInt16(this.offset, data.leftStickX, true);
    this.offset += 2;
    this.view.setInt16(this.offset, data.leftStickY, true);
    this.offset += 2;
    this.view.setInt16(this.offset, data.rightStickX, true);
    this.offset += 2;
    this.view.setInt16(this.offset, data.rightStickY, true);
    this.offset += 2;
    this.view.setUint8(this.offset++, data.leftTrigger);
    this.view.setUint8(this.offset++, data.rightTrigger);
    return new Uint8Array(this.buffer, 0, this.offset);
  }
}
```

## Native Event Listeners

### Renderer Process Input Capture

Input is captured in the renderer process using native DOM events:

```typescript
// renderer/src/input/InputCapture.ts

export class InputCapture {
  private isPointerLocked: boolean = false;
  private sensitivity: number = 1.0;
  private onInput: (event: InputEvent) => void;

  constructor(onInput: (event: InputEvent) => void) {
    this.onInput = onInput;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Keyboard events
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));

    // Mouse events
    window.addEventListener('mousemove', this.handleMouseMove.bind(this));
    window.addEventListener('mousedown', this.handleMouseDown.bind(this));
    window.addEventListener('mouseup', this.handleMouseUp.bind(this));
    window.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });

    // Pointer lock changes
    document.addEventListener('pointerlockchange', this.handlePointerLockChange.bind(this));

    // Clipboard
    window.addEventListener('paste', this.handlePaste.bind(this));
  }

  private handleKeyDown(e: KeyboardEvent): void {
    e.preventDefault();
    
    // Check for paste shortcut (Ctrl+V / Cmd+V)
    if (this.isPasteShortcut(e)) {
      return; // Let paste event handle it
    }

    this.onInput({
      type: InputEventType.KeyDown,
      timestamp: performance.now() * 1000,
      data: {
        keycode: this.normalizeKeyCode(e.code),
        scancode: e.keyCode,
        modifiers: this.getModifiers(e)
      }
    });
  }

  private handleMouseMove(e: MouseEvent): void {
    if (!this.isPointerLocked) return;

    // Apply mouse sensitivity scaling (exclusive feature)
    const dx = Math.round(e.movementX * this.sensitivity);
    const dy = Math.round(e.movementY * this.sensitivity);

    if (dx !== 0 || dy !== 0) {
      this.onInput({
        type: InputEventType.MouseMove,
        timestamp: performance.now() * 1000,
        data: { dx, dy }
      });
    }
  }

  setSensitivity(value: number): void {
    this.sensitivity = Math.max(0.1, Math.min(5.0, value));
  }

  requestPointerLock(): void {
    const videoElement = document.getElementById('stream-video');
    if (videoElement) {
      videoElement.requestPointerLock();
    }
  }

  exitPointerLock(): void {
    document.exitPointerLock();
  }

  private normalizeKeyCode(code: string): number {
    // Map DOM key codes to Windows virtual key codes
    const keyMap: Record<string, number> = {
      'KeyA': 0x41, 'KeyB': 0x42, 'KeyC': 0x43, // ... etc
      'ArrowUp': 0x26, 'ArrowDown': 0x28,
      'Space': 0x20, 'Enter': 0x0D, 'Escape': 0x1B,
    };
    return keyMap[code] || e.keyCode;
  }

  private getModifiers(e: KeyboardEvent | MouseEvent): number {
    let mods = 0;
    if (e.shiftKey) mods |= 0x01;
    if (e.ctrlKey) mods |= 0x02;
    if (e.altKey) mods |= 0x04;
    if (e.metaKey) mods |= 0x08;
    return mods;
  }
}
```

## WebRTC Data Channel Transmission

```typescript
// renderer/src/webrtc/InputChannel.ts

export class InputChannel {
  private dataChannel: RTCDataChannel | null = null;
  private protocol: InputProtocol;
  private queue: Uint8Array[] = [];
  private maxQueueDepth: number = 8;

  constructor(private peerConnection: RTCPeerConnection) {
    this.protocol = new InputProtocol();
    this.setupChannel();
  }

  private setupChannel(): void {
    this.dataChannel = this.peerConnection.createDataChannel('input', {
      ordered: false,
      maxRetransmits: 0  // Unreliable for mouse
    });

    this.dataChannel.onopen = () => {
      this.flushQueue();
    };
  }

  send(event: InputEvent): void {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      if (this.queue.length < this.maxQueueDepth) {
        this.queue.push(this.encodeEvent(event));
      }
      return;
    }

    const data = this.encodeEvent(event);
    
    // Throttle if queue is getting deep
    if (this.queue.length > 0) {
      this.queue.push(data);
      return;
    }

    try {
      this.dataChannel.send(data);
    } catch (e) {
      console.error('Failed to send input:', e);
    }
  }

  private encodeEvent(event: InputEvent): Uint8Array {
    switch (event.type) {
      case InputEventType.KeyDown:
      case InputEventType.KeyUp:
        return this.protocol.encodeKeyEvent(event.type, event.data as KeyEventData);
      case InputEventType.MouseMove:
        const mouseData = event.data as MouseEventData;
        return this.protocol.encodeMouseMove(mouseData.dx || 0, mouseData.dy || 0);
      case InputEventType.GamepadState:
        return this.protocol.encodeGamepad(event.data as GamepadEventData);
      default:
        return new Uint8Array();
    }
  }

  private flushQueue(): void {
    while (this.queue.length > 0 && this.dataChannel?.readyState === 'open') {
      const data = this.queue.shift();
      if (data) this.dataChannel.send(data);
    }
  }
}
```

## Mouse Sensitivity Adjustment

Mouse sensitivity is an exclusive feature that scales relative mouse movements before transmission:

```typescript
// renderer/src/input/MouseSensitivity.ts

export class MouseSensitivity {
  private sensitivity: number = 1.0;
  private acceleration: boolean = false;

  /**
   * Set mouse sensitivity multiplier
   * @param value Sensitivity value (0.1 to 5.0, default 1.0)
   */
  setSensitivity(value: number): void {
    this.sensitivity = Math.max(0.1, Math.min(5.0, value));
  }

  /**
   * Apply sensitivity to raw mouse delta
   */
  apply(dx: number, dy: number): { dx: number; dy: number } {
    if (this.acceleration) {
      // Simple acceleration curve
      const magnitude = Math.sqrt(dx * dx + dy * dy);
      const factor = 1 + (magnitude / 100) * 0.5;
      return {
        dx: Math.round(dx * this.sensitivity * factor),
        dy: Math.round(dy * this.sensitivity * factor)
      };
    }

    return {
      dx: Math.round(dx * this.sensitivity),
      dy: Math.round(dy * this.sensitivity)
    };
  }
}

// React component for sensitivity control
// renderer/src/components/MouseSettings.tsx

export const MouseSettings: React.FC = () => {
  const [sensitivity, setSensitivity] = useState(1.0);

  return (
    <div className="mouse-settings">
      <label>Mouse Sensitivity: {sensitivity.toFixed(2)}x</label>
      <input
        type="range"
        min="0.1"
        max="5.0"
        step="0.1"
        value={sensitivity}
        onChange={(e) => setSensitivity(parseFloat(e.target.value))}
      />
    </div>
  );
};
```

## Gamepad Support

Up to 4 simultaneous gamepads are supported via the Gamepad API:

```typescript
// renderer/src/input/GamepadManager.ts

const GAMEPAD_BUTTONS = [
  'A', 'B', 'X', 'Y',
  'LB', 'RB',
  'LT', 'RT',
  'Back', 'Start',
  'L3', 'R3',
  'DPadUp', 'DPadDown', 'DPadLeft', 'DPadRight',
  'Xbox', // Guide button
];

export class GamepadManager {
  private gamepads: (Gamepad | null)[] = new Array(4).fill(null);
  private onStateChange: (data: GamepadEventData) => void;
  private pollingId: number | null = null;
  private lastStates = new Map<number, GamepadEventData>();

  constructor(onStateChange: (data: GamepadEventData) => void) {
    this.onStateChange = onStateChange;
    window.addEventListener('gamepadconnected', this.handleConnect.bind(this));
    window.addEventListener('gamepaddisconnected', this.handleDisconnect.bind(this));
  }

  startPolling(): void {
    const poll = () => {
      this.updateGamepads();
      this.pollingId = requestAnimationFrame(poll);
    };
    this.pollingId = requestAnimationFrame(poll);
  }

  stopPolling(): void {
    if (this.pollingId) {
      cancelAnimationFrame(this.pollingId);
      this.pollingId = null;
    }
  }

  private updateGamepads(): void {
    const gamepads = navigator.getGamepads();
    
    for (let i = 0; i < 4; i++) {
      const gamepad = gamepads[i];
      if (!gamepad) continue;

      const state = this.encodeGamepadState(i, gamepad);
      const lastState = this.lastStates.get(i);

      // Only send if state changed
      if (!lastState || !this.statesEqual(state, lastState)) {
        this.onStateChange(state);
        this.lastStates.set(i, state);
      }
    }
  }

  private encodeGamepadState(id: number, gp: Gamepad): GamepadEventData {
    let buttons = 0;
    gp.buttons.forEach((btn, idx) => {
      if (btn.pressed && idx < 32) {
        buttons |= (1 << idx);
      }
    });

    return {
      controllerId: id,
      buttons,
      leftStickX: this.normalizeAxis(gp.axes[0]),
      leftStickY: this.normalizeAxis(gp.axes[1]),
      rightStickX: this.normalizeAxis(gp.axes[2]),
      rightStickY: this.normalizeAxis(gp.axes[3]),
      leftTrigger: Math.floor(gp.buttons[6]?.value * 255) || 0,
      rightTrigger: Math.floor(gp.buttons[7]?.value * 255) || 0,
    };
  }

  private normalizeAxis(value: number): number {
    // Apply deadzone
    if (Math.abs(value) < 0.1) return 0;
    // Scale to -32768 to 32767
    return Math.round(value * 32767);
  }

  private statesEqual(a: GamepadEventData, b: GamepadEventData): boolean {
    return a.buttons === b.buttons &&
           a.leftStickX === b.leftStickX &&
           a.leftStickY === b.leftStickY &&
           a.rightStickX === b.rightStickX &&
           a.rightStickY === b.rightStickY &&
           a.leftTrigger === b.leftTrigger &&
           a.rightTrigger === b.rightTrigger;
  }
}
```

## Controller Navigation

Controller navigation allows using a gamepad to navigate the UI:

**File**: `renderer/src/input/controllerNavigation.ts`

```typescript
export class ControllerNavigation {
  private focusedElement: HTMLElement | null = null;
  private gamepadIndex: number = 0;
  private navigationMode: boolean = false;

  enable(): void {
    this.navigationMode = true;
    window.addEventListener('gamepadconnected', (e) => {
      if (this.navigationMode && e.gamepad.index === this.gamepadIndex) {
        this.setupNavigationListeners();
      }
    });
  }

  private setupNavigationListeners(): void {
    const checkNavigation = () => {
      const gamepads = navigator.getGamepads();
      const gp = gamepads[this.gamepadIndex];
      if (!gp) return;

      // D-pad navigation
      if (gp.buttons[12]?.pressed) this.navigate('up');
      if (gp.buttons[13]?.pressed) this.navigate('down');
      if (gp.buttons[14]?.pressed) this.navigate('left');
      if (gp.buttons[15]?.pressed) this.navigate('right');

      // A button = click
      if (gp.buttons[0]?.pressed) this.activate();
      // B button = back
      if (gp.buttons[1]?.pressed) this.goBack();

      requestAnimationFrame(checkNavigation);
    };
    
    requestAnimationFrame(checkNavigation);
  }

  private navigate(direction: 'up' | 'down' | 'left' | 'right'): void {
    const focusable = document.querySelectorAll('[tabindex]:not([tabindex="-1"])');
    const current = document.activeElement as HTMLElement;
    // Simple spatial navigation logic
    // ...
  }

  private activate(): void {
    const active = document.activeElement as HTMLElement;
    if (active) {
      active.click();
    }
  }

  private goBack(): void {
    window.history.back();
  }
}
```

## Clipboard Paste Support

Clipboard paste sends text content as input events:

```typescript
// renderer/src/input/ClipboardHandler.ts

const MAX_CLIPBOARD_SIZE = 65536;  // 64KB, matching official GFN

export class ClipboardHandler {
  private onPaste: (text: string) => void;

  constructor(onPaste: (text: string) => void) {
    this.onPaste = onPaste;
    this.setupPasteListener();
  }

  private setupPasteListener(): void {
    window.addEventListener('paste', async (e) => {
      e.preventDefault();
      
      const text = e.clipboardData?.getData('text');
      if (!text) return;

      if (text.length > MAX_CLIPBOARD_SIZE) {
        console.warn('Clipboard content too large, truncating');
      }

      const truncated = text.slice(0, MAX_CLIPBOARD_SIZE);
      this.onPaste(truncated);
    });
  }

  /**
   * Convert text to key events (fallback for platforms without native paste)
   */
  static textToKeyEvents(text: string): InputEvent[] {
    const events: InputEvent[] = [];
    
    for (const char of text) {
      const keycode = char.charCodeAt(0);
      
      events.push({
        type: InputEventType.KeyDown,
        timestamp: performance.now() * 1000,
        data: { keycode, scancode: 0, modifiers: 0 }
      });
      
      events.push({
        type: InputEventType.KeyUp,
        timestamp: performance.now() * 1000,
        data: { keycode, scancode: 0, modifiers: 0 }
      });
    }
    
    return events;
  }
}
```

## Configuration Constants

```typescript
// renderer/src/input/constants.ts

export const INPUT_CONSTANTS = {
  // Mouse sensitivity range (exclusive feature)
  MIN_SENSITIVITY: 0.1,
  MAX_SENSITIVITY: 5.0,
  DEFAULT_SENSITIVITY: 1.0,

  // Gamepad polling rate (250Hz = 4ms)
  GAMEPAD_POLL_INTERVAL_MS: 4,

  // Maximum input queue depth before throttling
  MAX_INPUT_QUEUE_DEPTH: 8,

  // Maximum clipboard paste size
  MAX_CLIPBOARD_PASTE_SIZE: 65536,

  // Deadzone for analog sticks (0.0 - 1.0)
  ANALOG_STICK_DEADZONE: 0.1,

  // Trigger activation threshold
  TRIGGER_THRESHOLD: 0.1,
} as const;
```

## Modifier Flags

```typescript
export const Modifiers = {
  SHIFT: 0x01,
  CTRL: 0x02,
  ALT: 0x04,
  META: 0x08,  // Windows/Command key
} as const;
```

## Usage Example

```typescript
// renderer/src/hooks/useInput.ts

import { useEffect, useRef } from 'react';
import { InputCapture } from '../input/InputCapture';
import { InputChannel } from '../webrtc/InputChannel';
import { GamepadManager } from '../input/GamepadManager';
import { ClipboardHandler } from '../input/ClipboardHandler';

export function useInput(peerConnection: RTCPeerConnection) {
  const inputCaptureRef = useRef<InputCapture | null>(null);
  const inputChannelRef = useRef<InputChannel | null>(null);
  const gamepadManagerRef = useRef<GamepadManager | null>(null);

  useEffect(() => {
    inputChannelRef.current = new InputChannel(peerConnection);

    inputCaptureRef.current = new InputCapture((event) => {
      inputChannelRef.current?.send(event);
    });

    gamepadManagerRef.current = new GamepadManager((data) => {
      inputChannelRef.current?.send({
        type: InputEventType.GamepadState,
        timestamp: performance.now() * 1000,
        data
      });
    });

    new ClipboardHandler((text) => {
      inputChannelRef.current?.send({
        type: InputEventType.ClipboardPaste,
        timestamp: performance.now() * 1000,
        data: { text }
      });
    });

    gamepadManagerRef.current.startPolling();

    return () => {
      gamepadManagerRef.current?.stopPolling();
    };
  }, [peerConnection]);

  return {
    requestPointerLock: () => inputCaptureRef.current?.requestPointerLock(),
    exitPointerLock: () => inputCaptureRef.current?.exitPointerLock(),
    setMouseSensitivity: (value: number) => 
      inputCaptureRef.current?.setSensitivity(value),
  };
}
```

## Key State Tracking

```typescript
export class KeyStateTracker {
  private pressedKeys = new Set<number>();

  isKeyPressed(keycode: number): boolean {
    return this.pressedKeys.has(keycode);
  }

  pressKey(keycode: number): boolean {
    if (this.pressedKeys.has(keycode)) {
      return false;  // Already pressed, don't duplicate
    }
    this.pressedKeys.add(keycode);
    return true;
  }

  releaseKey(keycode: number): void {
    this.pressedKeys.delete(keycode);
  }

  releaseAll(): number[] {
    const keys = Array.from(this.pressedKeys);
    this.pressedKeys.clear();
    return keys;
  }
}
```

## Input Channels

Different input types use different WebRTC data channel configurations:

| Input Type | Channel Config | Reliability | Purpose |
|------------|---------------|-------------|---------|
| Keyboard | `ordered: true, maxRetransmits: 3` | Reliable | No dropped keys |
| Gamepad | `ordered: true, maxRetransmits: 3` | Reliable | Accurate button state |
| Mouse | `ordered: false, maxRetransmits: 0` | Unreliable | Lowest latency |
| Clipboard | `ordered: true, maxRetransmits: 3` | Reliable | Complete delivery |

## Performance Considerations

- **Coalescing**: Mouse events are naturally coalesced by the browser during `requestAnimationFrame`
- **Throttling**: Queue depth monitoring prevents buffer bloat
- **Binary encoding**: Reduces packet size by ~80% compared to JSON
- **Dead reckoning**: Gamepad state only sent on changes
- **Polling rate**: Gamepad polling at 250Hz balances responsiveness and CPU usage
