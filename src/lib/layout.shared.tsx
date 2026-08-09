import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { BookOpen, Code2, Download, MessageCircle, MonitorPlay, Radio, Settings2 } from 'lucide-react';
import { appName } from './shared';

function NavTitle() {
  return (
    <span className="flex items-center gap-2 font-semibold tracking-tight">
      <span className="grid size-8 place-items-center rounded-[0.65rem] bg-gradient-to-br from-emerald-400 to-teal-500 text-emerald-950 shadow-[0_8px_24px_-10px_rgba(16,185,129,0.8)]">
        <MonitorPlay className="size-4" />
      </span>
      <span>{appName}<span className="ml-1.5 text-xs font-medium text-fd-muted-foreground">Docs</span></span>
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
        url: '/#downloads',
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
