import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName, gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: appName,
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
    links: [
      {
        text: 'App repo',
        url: 'https://github.com/OpenCloudGaming/OpenNOW',
        active: 'none',
      },
      {
        text: 'Discord',
        url: 'https://discord.gg/8EJYaJcNfD',
        active: 'none',
      },
    ],
  };
}
