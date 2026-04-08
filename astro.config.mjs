// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://opennow.zortos.me',
  integrations: [
    starlight({
      title: 'OpenNOW',
      description: 'Documentation for the OpenCloudGaming/OpenNOW Electron client',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/OpenCloudGaming/OpenNOW' },
        { icon: 'discord', label: 'Discord', href: 'https://discord.gg/8EJYaJcNfD' },
      ],
      sidebar: [
        {
          label: 'Guides',
          items: [
            { label: 'Development Guide', slug: 'development' },
            { label: 'Getting Started', slug: 'guides/getting-started' },
          ],
        },
        {
          label: 'Architecture',
          items: [{ label: 'Overview', slug: 'architecture/overview' }],
        },
        {
          label: 'Advanced',
          items: [{ label: 'Streamer Investigation', slug: 'advanced/streamer-investigation' }],
        },
        {
          label: 'Reference',
          items: [
            { label: 'Authentication', slug: 'reference/authentication' },
            { label: 'WebRTC', slug: 'reference/webrtc' },
            { label: 'Media', slug: 'reference/media' },
            { label: 'Input', slug: 'reference/input' },
            { label: 'Configuration', slug: 'reference/configuration' },
          ],
        },
      ],
    }),
  ],
});
