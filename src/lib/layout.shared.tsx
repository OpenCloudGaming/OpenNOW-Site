import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { BookOpen, Code2, Download, MessageCircle, MonitorPlay, Radio, Settings2 } from 'lucide-react';
import { appName, gitConfig } from './shared';

function NavTitle() {
  return (
    <span className="flex items-center gap-2 font-semibold tracking-tight">
      <span className="grid size-7 place-items-center rounded-lg border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 shadow-[0_0_28px_rgba(52,211,153,0.22)]">
        <MonitorPlay className="size-4" />
      </span>
      <span>{appName}</span>
    </span>
  );
}

const iconClassName = 'size-4';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: NavTitle,
      url: '/',
      transparentMode: 'top',
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
    links: [
      {
        text: 'Docs',
        url: '/docs',
        active: 'nested-url',
        icon: <BookOpen className={iconClassName} />,
      },
      {
        type: 'menu',
        text: 'Resources',
        items: [
          {
            text: 'App source',
            description: 'Electron, renderer, main process, and native streamer code.',
            url: 'https://github.com/OpenCloudGaming/OpenNOW',
            external: true,
            icon: <Code2 className={iconClassName} />,
          },
          {
            text: 'Stream settings',
            description: 'Codec, resolution, FPS, bitrate, region, input, and capture controls.',
            url: '/docs/reference/configuration',
            icon: <Settings2 className={iconClassName} />,
          },
          {
            text: 'WebRTC internals',
            description: 'Session signaling, SDP negotiation, ICE, and data channels.',
            url: '/docs/reference/webrtc',
            icon: <Radio className={iconClassName} />,
          },
        ],
      },
      {
        type: 'button',
        text: 'Download',
        url: 'https://github.com/OpenCloudGaming/OpenNOW/releases',
        external: true,
        icon: <Download className={iconClassName} />,
      },
      {
        type: 'icon',
        text: 'Discord',
        label: 'OpenNOW Discord',
        url: 'https://discord.gg/8EJYaJcNfD',
        external: true,
        icon: <MessageCircle className={iconClassName} />,
      },
    ],
  };
}
