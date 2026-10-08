// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  // The production address, so canonical and Open Graph URLs are absolute and never localhost
  site: 'https://chaidiraliassegaf.vercel.app',

  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Firestore and Auth get their own chunks so pages that only log analytics
            // (the public pages) never download them; the admin still loads all three.
            if (/[\\/]@?firebase[\\/](firestore|auth)[\\/]/.test(id)) {
              return id.includes('firestore') ? 'firebase-firestore' : 'firebase-auth';
            }
            if (/[\\/]@?firebase[\\/]/.test(id)) return 'firebase';
            if (id.includes('/ckeditor5/')) return 'ckeditor';
          }
        }
      },
      chunkSizeWarningLimit: 1000
    }
  },

  adapter: vercel()
});
