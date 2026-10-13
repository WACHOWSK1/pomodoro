import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Essential for Electron so assets load correctly via file://
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});
