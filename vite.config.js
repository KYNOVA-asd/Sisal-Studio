import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        bodas: resolve(import.meta.dirname, 'bodas/index.html'),
        eventos: resolve(import.meta.dirname, 'eventos/index.html'),
        locaciones: resolve(import.meta.dirname, 'locaciones/index.html'),
        cotizar: resolve(import.meta.dirname, 'cotizar/index.html'),
        boda: resolve(import.meta.dirname, 'boda/index.html'),
        blog: resolve(import.meta.dirname, 'blog/index.html'),
      },
    },
  },
});
