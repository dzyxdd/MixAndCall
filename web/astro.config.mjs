import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  outDir: 'dist',
  build: {
    format: 'directory',
  },
  vite: {
    server: { host: true },
  },
});
