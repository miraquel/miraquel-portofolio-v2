// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('/firebase/')) return 'firebase';
            if (id.includes('/ckeditor5/')) return 'ckeditor';
          }
        }
      },
      chunkSizeWarningLimit: 1000
    }
  },

  adapter: vercel()
});
