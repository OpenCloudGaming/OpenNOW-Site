import { defineConfig } from 'vite';
import mdx from 'fumadocs-mdx/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [mdx()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, 'src'),
      collections: path.resolve(rootDir, '.source'),
    },
  },
});
