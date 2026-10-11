import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        bodas: resolve(__dirname, 'bodas/index.html'),
        eventos: resolve(__dirname, 'eventos/index.html'),
        locaciones: resolve(__dirname, 'locaciones/index.html'),
        cotizar: resolve(__dirname, 'cotizar/index.html'),
        boda: resolve(__dirname, 'boda/index.html'),
      },
    },
  },
});
