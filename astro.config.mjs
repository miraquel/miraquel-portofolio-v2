// @ts-check
import { readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import vercel from '@astrojs/vercel';

import { bundleOnBuild } from './integrations/bundle-on-build.mjs';

/**
 * A package and everything it pulls in, read from package-lock.json with Node's resolution
 * (nearest node_modules first), so the list stays current when its dependencies change.
 * @param {string} name
 * @returns {string[]}
 */
function dependencyTree(name) {
  const lock = JSON.parse(readFileSync(new URL('./package-lock.json', import.meta.url), 'utf8')).packages;
  /** @param {string} pkg @param {string} from */
  const resolve = (pkg, from) => {
    for (let base = from; ; base = base.replace(/\/?node_modules\/(@[^/]+\/)?[^/]+$/, '')) {
      const candidate = `${base ? `${base}/` : ''}node_modules/${pkg}`;
      if (lock[candidate]) return candidate;
      if (!base) return undefined;
    }
  };
  const visited = new Set();
  /** @param {string | undefined} path */
  const visit = (path) => {
    if (!path || visited.has(path)) return;
    visited.add(path);
    const { dependencies = {}, optionalDependencies = {} } = lock[path];
    for (const dep of Object.keys({ ...dependencies, ...optionalDependencies })) visit(resolve(dep, path));
  };
  visit(resolve(name, ''));
  return [...new Set([...visited].map((path) => path.slice(path.lastIndexOf('node_modules/') + 'node_modules/'.length)))];
}

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
            // three.js, shared by the 404 container and the career stack, both loaded on demand
            if (/[\\/]node_modules[\\/]three[\\/]/.test(id)) return 'three';
          }
        }
      },
      chunkSizeWarningLimit: 1000
    }
  },

  integrations: [
    // Bundle sanitize-html and its whole dependency tree into builds (see the integration for
    // why only builds). The whole tree, because Vercel's file tracing does not follow require()
    // calls left inside bundled chunks: bundle part of it and the rest goes missing at runtime.
    bundleOnBuild(dependencyTree('sanitize-html'))
  ],

  adapter: vercel()
});
