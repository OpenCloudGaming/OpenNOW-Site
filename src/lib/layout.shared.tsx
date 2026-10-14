import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { BookOpen, Code2, Download, MessageCircle, Radio, Settings2 } from 'lucide-react';
import { BrandLockup } from '@/components/console/brand';

function NavTitle() {
  return <BrandLockup />;
}

const iconClassName = 'size-4';

export function baseOptions(): BaseLayoutProps {
  return {
    themeSwitch: { enabled: false },
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
            description: 'Qt shell, Rust core, and in-process native streamer code.',
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
            text: 'Native streamer',
            description: 'Production NVST path, GPU presentation, and diagnostics.',
            url: '/docs/reference/native-streamer',
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
