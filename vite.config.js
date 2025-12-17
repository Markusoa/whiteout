import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'docs',
    assetsDir: 'assets',
    sourcemap: true
  },
  server: {
    port: 3000,
    open: false
  }
});
