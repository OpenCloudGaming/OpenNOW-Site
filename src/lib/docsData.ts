export interface DataChannelRow {
  channel: string;
  reliability: string;
  traffic: string;
}

export interface NativePlatformVideoPath {
  platform: string;
  concisePaths: string;
  preferredPaths: string;
}

export interface NativeStreamerEnvironmentVariable {
  variable: string;
  setBy: string;
  purpose: string;
  diagnosticPurpose?: string;
}

export interface GStreamerRuntimeStrategy {
  platform: string;
  referenceStrategy: string;
  releaseBehavior: string;
  artifacts?: string;
}

export interface LocalDataLocation {
  key: string;
  data: string;
  mediaType?: string;
  path: string;
  format?: string;
}

export const dataChannels: DataChannelRow[] = [
  {
    channel: 'input_channel_v1',
    reliability: 'ordered, reliable',
    traffic: 'Keyboard and control messages',
  },
  {
    channel: 'input_channel_partially_reliable',
    reliability: 'unordered, partially reliable',
    traffic: 'Mouse deltas and gamepad state',
  },
];

export const nativePlatformVideoPaths: NativePlatformVideoPath[] = [
  {
    platform: 'Windows',
    concisePaths: 'Embedded D3D11 presenter; Auto capability selection',
    preferredPaths:
      'Qt embedded path uses D3D11 today. Auto selects codecs against the embedded capability report. Unsupported forced backends fail explicitly.',
  },
  {
    platform: 'macOS',
    concisePaths: 'VideoToolbox / Metal presentation',
    preferredPaths: 'Apple Silicon Qt path uses platform decode with Metal presentation in the Qt scene graph.',
  },
  {
    platform: 'Linux',
    concisePaths: 'Platform GPU decode + Qt presentation; FFmpeg fallback available in packages',
    preferredPaths:
      'Linux packages discover GPU driver interfaces dynamically and can use a bundled FFmpeg fallback when needed.',
  },
];

export const nativeStreamerEnvironmentVariables: NativeStreamerEnvironmentVariable[] = [
  {
    variable: 'OPENNOW_DATA_DIR',
    setBy: 'User/dev',
    purpose: 'Override the OpenNOW data directory (settings, auth, diagnostics)',
  },
  {
    variable: 'OPENNOW_PICTURES_DIR',
    setBy: 'User/dev',
    purpose: 'Override the Pictures root used for Screenshots/Recordings',
  },
];

export const gstreamerRuntimeStrategies: GStreamerRuntimeStrategy[] = [
  {
    platform: 'Windows x64 / ARM64',
    referenceStrategy: 'CMake builds and links `opennow-streamer-ffi` into the Qt app; no separate streamer executable',
    releaseBehavior: 'Qt package embeds the streamer library beside `OpenNOW` and `opennow-core`',
    artifacts: '`OpenNOW-Qt-…-Windows-*.msi`, portable `.zip`',
  },
  {
    platform: 'Linux x64 / ARM64',
    referenceStrategy: 'Same embedded FFI; packages may include bundled FFmpeg fallback while GPU interfaces stay dynamic',
    releaseBehavior:
      'AppImage recommended; bundled release DEBs ship Qt/SDL under `/opt/opennow` (published v1.0.0 DEBs still need distro Qt 6.8+ and SDL3). Optional Flatpak (`io.github.opencloudgaming.OpenNOW`) disables in-app updates',
    artifacts: '`OpenNOW-Qt-…-Linux-*.AppImage`, `.deb`; Flatpak via workflow/local build',
  },
  {
    platform: 'macOS Apple Silicon',
    referenceStrategy: 'Embedded FFI inside the app bundle; published packages are not notarized (Gatekeeper Open Anyway). Notarization is being prepared for the v1.0.1 candidate',
    releaseBehavior: 'DMG installs to Applications; Intel Macs are not included',
    artifacts: '`OpenNOW-Qt-…-Darwin-arm64.dmg`',
  },
];

export const localDataLocations: LocalDataLocation[] = [
  {
    key: 'settings',
    data: 'Settings',
    path: '`%APPDATA%/OpenNOW/settings.json` (Windows), `~/Library/Application Support/OpenNOW/settings.json` (macOS), `~/.config/OpenNOW/settings.json` (Linux), or `$OPENNOW_DATA_DIR/settings.json`',
  },
  {
    key: 'authState',
    data: 'Accounts / sessions',
    path: '`accounts.json` and `sessions/*.json` under the OpenNOW data directory (legacy `auth-state.json` may still be migrated)',
  },
  {
    key: 'diagnostics',
    data: 'Diagnostics',
    path: '`diagnostics/` under the OpenNOW data directory (`native-streamer.log`, `qt-native.log`)',
  },
  {
    key: 'appLanguage',
    data: 'App language',
    path: '`appLanguage` in `settings.json` (default `system`)',
  },
  {
    key: 'screenshots',
    data: 'Screenshots',
    mediaType: 'Screenshots',
    path: '`Pictures/OpenNOW/Screenshots/` (or `$OPENNOW_PICTURES_DIR/OpenNOW/Screenshots/`)',
    format: 'PNG, JPG, or WebP',
  },
  {
    key: 'recordings',
    data: 'Recordings',
    mediaType: 'Recordings',
    path: '`Pictures/OpenNOW/Recordings/` (or `$OPENNOW_PICTURES_DIR/OpenNOW/Recordings/`)',
    format: 'Matroska `.mkv` (plus thumbnail `.jpg`)',
  },
];
