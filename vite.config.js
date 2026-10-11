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
        contacto: resolve(import.meta.dirname, 'contacto/index.html'),
        experiencia3d: resolve(import.meta.dirname, 'experiencia-3d/index.html'),
        tunel3d: resolve(import.meta.dirname, 'tunel-3d/index.html'),
        galeriaEditorial: resolve(import.meta.dirname, 'galeria-editorial/index.html'),
        espiral3d: resolve(import.meta.dirname, 'espiral-3d/index.html'),
        museo3d: resolve(import.meta.dirname, 'museo-3d/index.html'),
        experiencias: resolve(import.meta.dirname, 'experiencias/index.html'),
        portafolio: resolve(import.meta.dirname, 'portafolio/index.html'),
      },
    },
  },
});
