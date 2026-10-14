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
    channel: 'control_channel_reliable',
    reliability: 'ordered, reliable (SCTP stream 0)',
    traffic: 'Input handshake, keyboard and mouse-button input, Unicode text, control commands, server cursor updates',
  },
  {
    channel: 'custom_message_on_sctp_private_reliable',
    reliability: 'ordered, reliable (stream 2)',
    traffic: 'Opened with the bundle; OpenNOW sends nothing on it',
  },
  {
    channel: 'custom_message_on_sctp_private_partially_reliable',
    reliability: 'ordered, at most 2 retransmits (stream 4)',
    traffic: 'Opened with the bundle; OpenNOW sends nothing on it',
  },
  {
    channel: 'control_channel_partially_reliable',
    reliability: 'unordered, 300 ms lifetime (stream 6)',
    traffic: 'Mouse motion and partially reliable control, including Mjolnir NACK-v2 requests',
  },
  {
    channel: 'control_channel_unreliable',
    reliability: 'unordered, no retransmits (stream 8)',
    traffic: 'Opened with the bundle; OpenNOW sends nothing on it',
  },
  {
    channel: 'input_channel_partially_reliable',
    reliability: 'unordered, 300 ms lifetime (stream 10)',
    traffic: 'Gamepad state',
  },
  {
    channel: 'cursor_channel',
    reliability: 'ordered, reliable (stream 12, when negotiated)',
    traffic: 'Cursor notifications, when a host sends them here instead of on the reliable control channel',
  },
  {
    channel: 'rtcp_on_sctp_private',
    reliability: 'ordered, reliable (stream 14, when negotiated)',
    traffic: 'RTCP feedback when video runs on the bundle instead of the Mjolnir socket',
  },
];

export const nativePlatformVideoPaths: NativePlatformVideoPath[] = [
  {
    platform: 'Windows',
    concisePaths: 'Media Foundation hardware decode on D3D11; DirectX 11 only in the stream view',
    preferredPaths:
      'Hardware decode through a Media Foundation transform that has a matching DXVA profile on the GPU Qt renders with. Frames stay on the GPU as D3D11 textures. The picker lists DirectX 12 and Vulkan, but the stream view does not support them. There is no software decode path.',
  },
  {
    platform: 'macOS (Apple Silicon)',
    concisePaths: 'VideoToolbox hardware decode; Metal presentation',
    preferredPaths:
      'VideoToolbox decode with hardware required, then IOSurface-to-Metal conversion inside the Qt scene graph. HEVC 10-bit, HDR, and 10-bit 4:4:4 are offered only when runtime probes pass. There is no software decode path.',
  },
  {
    platform: 'Linux',
    concisePaths: 'Vulkan Video, VA-API, CUDA, or V4L2 hardware decode; FFmpeg software on request; Vulkan presentation',
    preferredPaths:
      'Auto uses Vulkan Video on the shared Vulkan device when it supports the negotiated profile, otherwise a CUDA, VA-API, or V4L2 decoder that does. Presentation always uses Vulkan. Auto never switches to software: choose Software (CPU) for bundled FFmpeg decode, which is limited to 8-bit 4:2:0 SDR.',
  },
];

export const nativeStreamerEnvironmentVariables: NativeStreamerEnvironmentVariable[] = [
  {
    variable: 'OPENNOW_DATA_DIR',
    setBy: 'User',
    purpose:
      'Replaces the data directory for settings, accounts, and diagnostics. Default: `%APPDATA%\\OpenNOW` on Windows, `~/Library/Application Support/OpenNOW` on macOS, `$XDG_CONFIG_HOME/OpenNOW` or `~/.config/OpenNOW` on Linux.',
  },
  {
    variable: 'OPENNOW_PICTURES_DIR',
    setBy: 'User',
    purpose:
      'Replaces the Pictures root. Screenshots and recordings go to `OpenNOW/Screenshots` and `OpenNOW/Recordings` under it. Set but empty disables both folders.',
  },
  {
    variable: 'OPENNOW_NATIVE_VIDEO_BACKEND',
    setBy: 'User (troubleshooting)',
    purpose:
      'Process-wide decoder policy: `auto`, `hardware`, `software`, or one backend (`d3d11`, `videotoolbox`, `vulkan`, `vaapi`, `cuda` or `nvdec`, `v4l2`, `ffmpeg`). Other backends report as disabled. On Linux it applies when the Video backend setting is Auto.',
  },
  {
    variable: 'OPENNOW_VK_DEVICE_INDEX',
    setBy: 'User (Linux)',
    purpose:
      'Prefers the Vulkan physical device with this index when the streamer creates the shared Vulkan decode device.',
  },
  {
    variable: 'OPENNOW_VK_VENDOR_ID',
    setBy: 'User (Linux)',
    purpose:
      'Prefers a Vulkan device by PCI vendor ID, decimal or `0x` hex (for example `0x10de`). The same scoring also honors `__NV_PRIME_RENDER_OFFLOAD=1` and `DRI_PRIME=1`.',
  },
  {
    variable: 'LIBVA_DRIVERS_PATH',
    setBy: 'AppImage/DEB launcher',
    purpose:
      'When unset, the AppRun hook searches `/usr/lib/dri`, `/usr/lib64/dri`, and the matching Debian multiarch directory for VA-API drivers. An explicit value, including an empty one, is kept.',
  },
  {
    variable: 'OPENNOW_NVST_TRACE',
    setBy: 'Developer',
    purpose:
      '`1`, `true`, `yes`, or `on` prints verbose NVST transport lines (sampled datagram counters, input traces) to standard error. Start the app from a terminal to see them; they are not written to `native-streamer.log`.',
  },
  {
    variable: 'OPENNOW_NATIVE_WINDOW_SYSTEM',
    setBy: 'Developer (standalone host)',
    purpose: 'Forces `x11` or `wayland` for the standalone `opennow-streamer` host on Linux. The Qt app does not use it.',
  },
  {
    variable: 'OPENNOW_LINUX_NATIVE_WAYLAND',
    setBy: 'Developer (standalone host)',
    purpose:
      'Lets the standalone host use native Wayland. Without it, the standalone SDL window uses X11/XWayland when `DISPLAY` is set.',
  },
  {
    variable: 'OPENNOW_STREAMER_TRACE',
    setBy: 'Developer (standalone host)',
    purpose: 'Enables stderr trace output in the standalone `opennow-streamer` host.',
  },
  {
    variable: 'OPENNOW_STREAMER_LOG_FILE',
    setBy: 'Developer (standalone host)',
    purpose: 'Writes the standalone host log to this file.',
  },
  {
    variable: 'OPENNOW_MEDIACODEC_SOCKET',
    setBy: 'DroidDeck session (Nightly)',
    purpose:
      '(Nightly) Set by a DroidDeck session that has the MediaCodec bridge enabled. Used with `OPENNOW_NATIVE_VIDEO_BACKEND=mediacodec`. Do not set it by hand.',
  },
];

export const gstreamerRuntimeStrategies: GStreamerRuntimeStrategy[] = [
  {
    platform: 'Windows x64 / ARM64',
    referenceStrategy: 'CMake builds and links `opennow-streamer-ffi` into the Qt app; no separate streamer executable',
    releaseBehavior:
      'Qt package embeds the streamer library beside `OpenNOW` and `opennow-core`. `setup.exe` installs per user into `%LOCALAPPDATA%\\OpenNOW`; the MSI and portable ZIP carry the same binaries. Not Authenticode-signed, so SmartScreen can warn',
    artifacts: '`OpenNOW-Qt-<version>-Windows-<arch>-setup.exe`, `.msi`, portable `.zip`',
  },
  {
    platform: 'Linux x64 / ARM64',
    referenceStrategy:
      'Same embedded FFI, built with bundled FFmpeg software decoding and native H.264 VA-API; GPU drivers stay on the host',
    releaseBehavior:
      'AppImage recommended, with a `.zsync` sidecar for external delta-update tools. DEBs bundle Qt, QML plugins, SDL3, and the media runtime under `/opt/opennow`. The Flatpak (`io.github.opencloudgaming.OpenNOW`, x86_64) is a local or workflow build only and has no in-app updates',
    artifacts: '`OpenNOW-Qt-<version>-Linux-<arch>.AppImage`, `.AppImage.zsync`, `.deb`; Flatpak via workflow or local build',
  },
  {
    platform: 'macOS Apple Silicon',
    referenceStrategy:
      'Embedded FFI inside the app bundle; stable packages are Developer ID–signed and notarized, nightlies use ad-hoc signatures and are not notarized',
    releaseBehavior: 'DMG or ZIP installs to Applications on macOS 13 or later; Intel Macs are not included. Nightlies publish the DMG only',
    artifacts: '`OpenNOW-Qt-<version>-Darwin-arm64.dmg`, `.zip`',
  },
];

export const localDataLocations: LocalDataLocation[] = [
  {
    key: 'settings',
    data: 'Settings',
    path: '`%APPDATA%\\OpenNOW\\settings.json` (Windows), `~/Library/Application Support/OpenNOW/settings.json` (macOS), `$XDG_CONFIG_HOME/OpenNOW/settings.json` or `~/.config/OpenNOW/settings.json` (Linux), or `$OPENNOW_DATA_DIR/settings.json`. The previous valid copy is kept as `settings.json.bak`',
  },
  {
    key: 'authState',
    data: 'Accounts and sign-in tokens',
    path: '`accounts.json` in the data directory lists saved accounts without tokens. Tokens are kept in the OS credential store; on Windows they are encrypted files in `secure-sessions/` with the key in Credential Manager. If the credential store is unavailable, tokens are saved unencrypted in `fallback-sessions/`. Legacy `auth-state.json` and `sessions/*.json` are migrated and removed',
  },
  {
    key: 'profilePins',
    data: 'Profile PINs',
    path: '`console-profiles-qt.json` in the data directory (scrypt hashes, local only)',
  },
  {
    key: 'diagnostics',
    data: 'Diagnostics',
    path: '`diagnostics/` in the data directory: `current.log` and `previous.log` (core), `qt-native.log`, `native-streamer.log`, and exported `opennow-diagnostics-<timestamp>.txt` reports',
  },
  {
    key: 'caches',
    data: 'Caches and updates',
    path: '`artwork-cache/`, `store-cache-v2/`, and `updates/` (downloaded update packages) in the data directory',
  },
  {
    key: 'screenshots',
    data: 'Screenshots',
    mediaType: 'Screenshots',
    path: '`OpenNOW/Screenshots/` in the system Pictures folder, or `$OPENNOW_PICTURES_DIR/OpenNOW/Screenshots/`',
    format: 'PNG (the Media library also lists JPG and WebP files)',
  },
  {
    key: 'recordings',
    data: 'Recordings',
    mediaType: 'Recordings',
    path: '`OpenNOW/Recordings/` in the system Pictures folder, or `$OPENNOW_PICTURES_DIR/OpenNOW/Recordings/`',
    format: 'Matroska `.mkv`, plus a `-thumb.jpg` thumbnail',
  },
];
