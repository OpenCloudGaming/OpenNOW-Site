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
    concisePaths: 'D3D12, D3D11, Vulkan diagnostic path, software fallback',
    preferredPaths: 'D3D12 for high-FPS sessions, otherwise D3D11, then Vulkan when explicitly selected, then software fallback',
  },
  {
    platform: 'macOS',
    concisePaths: 'VideoToolbox, software fallback',
    preferredPaths: 'VideoToolbox, then software fallback',
  },
  {
    platform: 'Linux x64',
    concisePaths: 'VAAPI, V4L2, Vulkan, software fallback',
    preferredPaths: 'VAAPI, then V4L2, then Vulkan when explicitly selected, then software fallback',
  },
  {
    platform: 'Linux ARM/Raspberry Pi',
    concisePaths: 'V4L2 stateless, VAAPI, Vulkan, software fallback',
    preferredPaths: 'V4L2 stateless, then VAAPI, then Vulkan when explicitly selected, then software fallback',
  },
];

export const nativeStreamerEnvironmentVariables: NativeStreamerEnvironmentVariable[] = [
  {
    variable: 'OPENNOW_NATIVE_STREAMER',
    setBy: 'User/dev',
    purpose: 'Override executable lookup',
  },
  {
    variable: 'OPENNOW_NATIVE_STREAMER_PROTOCOL',
    setBy: 'Electron',
    purpose: 'Expected protocol version',
    diagnosticPurpose: 'Protocol version expected by the child',
  },
  {
    variable: 'OPENNOW_NATIVE_STREAMER_BACKEND',
    setBy: 'Electron/user',
    purpose: 'Backend request',
    diagnosticPurpose: 'Backend request; currently `gstreamer` or `stub`',
  },
  {
    variable: 'OPENNOW_NATIVE_CODEC',
    setBy: 'User/dev',
    purpose: 'Override native offer codec during diagnostics',
    diagnosticPurpose: 'Diagnostic codec override (`h264`, `h265`/`hevc`, or `av1`); otherwise the configured stream codec is used',
  },
  {
    variable: 'OPENNOW_NATIVE_VIDEO_BACKEND',
    setBy: 'Electron',
    purpose: 'User video backend preference',
    diagnosticPurpose: 'User video backend preference, normalized by Electron settings',
  },
  {
    variable: 'OPENNOW_NATIVE_EXTERNAL_RENDERER',
    setBy: 'Electron on Windows',
    purpose: 'External native renderer flag',
    diagnosticPurpose: 'Enable native external renderer path; compatibility disables it outside Windows',
  },
  {
    variable: 'OPENNOW_NATIVE_CLOUD_GSYNC',
    setBy: 'Electron',
    purpose: 'Cloud G-Sync/VRR mode',
    diagnosticPurpose: 'Native Cloud G-Sync/VRR mode',
  },
  {
    variable: 'OPENNOW_NATIVE_D3D_FULLSCREEN',
    setBy: 'Electron',
    purpose: 'Windows D3D fullscreen mode',
    diagnosticPurpose: 'Windows D3D fullscreen behavior',
  },
  {
    variable: 'OPENNOW_NATIVE_VIDEO_API',
    setBy: 'User/dev',
    purpose: 'Force diagnostic video API',
    diagnosticPurpose: 'Diagnostic forced video API (`d3d12`, `d3d11`, `videotoolbox`, `vaapi`, `v4l2`, `software`)',
  },
  {
    variable: 'OPENNOW_NATIVE_PRESENT_MAX_FPS',
    setBy: 'User/dev',
    purpose: 'Override presentation limiter',
    diagnosticPurpose: 'Diagnostic presentation limiter',
  },
  {
    variable: 'OPENNOW_NATIVE_ZERO_COPY',
    setBy: 'User/dev',
    purpose: 'Diagnostic zero-copy setting',
    diagnosticPurpose: 'Diagnostic zero-copy mode control',
  },
];

export const gstreamerRuntimeStrategies: GStreamerRuntimeStrategy[] = [
  {
    platform: 'Windows x64',
    referenceStrategy: 'Bundle private GStreamer runtime next to `resources/native/opennow-streamer/win32-x64/opennow-streamer.exe`',
    releaseBehavior: 'Builds native streamer and bundles private GStreamer runtime',
    artifacts: 'NSIS setup, portable exe, updater metadata',
  },
  {
    platform: 'Windows ARM64',
    referenceStrategy: 'Package app without native streamer build in the current release matrix',
    releaseBehavior: 'Packages app without native streamer build',
    artifacts: 'NSIS setup, portable exe',
  },
  {
    platform: 'macOS x64 / arm64',
    referenceStrategy: 'Bundle private GStreamer runtime next to the platform streamer binary',
    releaseBehavior: 'Builds native streamer and bundles private GStreamer runtime',
    artifacts: '`dmg`, `zip`',
  },
  {
    platform: 'Linux x64 / arm64',
    referenceStrategy: 'Use host distro GStreamer packages; `.deb` declares common dependencies',
    releaseBehavior: 'Builds native streamer against host distro GStreamer packages',
    artifacts: '`AppImage`, `deb`',
  },
];

export const localDataLocations: LocalDataLocation[] = [
  {
    key: 'settings',
    data: 'Settings',
    path: '`app.getPath("userData")/settings.json`',
  },
  {
    key: 'authState',
    data: 'Auth state',
    path: '`app.getPath("userData")/auth-state.json`',
  },
  {
    key: 'gfnDeviceId',
    data: 'Stable CloudMatch device ID',
    path: '`app.getPath("userData")/gfn-device-id.json`',
  },
  {
    key: 'appLanguage',
    data: 'App language',
    path: 'Browser localStorage key `opennow.locale`',
  },
  {
    key: 'thumbnailCache',
    data: 'Thumbnail cache',
    mediaType: 'Thumbnails',
    path: '`app.getPath("userData")/media-thumbs/`',
    format: 'JPEG',
  },
  {
    key: 'screenshots',
    data: 'Screenshots',
    mediaType: 'Screenshots',
    path: '`app.getPath("pictures")/OpenNOW/Screenshots/`',
    format: 'PNG, JPG, or WebP',
  },
  {
    key: 'recordings',
    data: 'Recordings',
    mediaType: 'Recordings',
    path: '`app.getPath("pictures")/OpenNOW/Recordings/`',
    format: 'MP4 or WebM',
  },
];
