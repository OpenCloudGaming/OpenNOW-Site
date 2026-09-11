import react from '@vitejs/plugin-react';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import mdx from 'fumadocs-mdx/vite';
import { nitro } from 'nitro/vite';

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    mdx(),
    tailwindcss(),
    tanstackStart({
      prerender: {
        enabled: true,
        crawlLinks: true,
        // Hash URLs resolve to the same HTML path as the parent page. Concurrent
        // crawls of those anchors race-write one file and can truncate it at 64KB,
        // which Cloudflare then serves as an empty 200 for that route.
        filter: (page) => !String(page.path).includes('#'),
        concurrency: 1,
      },
      spa: {
        enabled: true,
        prerender: {
          enabled: true,
          crawlLinks: true,
        },
      },
      pages: [
        { path: '/docs' },
        { path: '/api/search' },
        { path: '/llms-full.txt' },
        { path: '/llms.txt' },
      ],
    }),
    react(),
    nitro({
      preset: 'node-server',
      exportConditions: ['node', 'import', 'default'],
    }),
  ],
  resolve: {
    tsconfigPaths: true,
  },
});
