// @ts-check

/**
 * Bundle these packages into the server output, for `astro build` only.
 *
 * sanitize-html is CommonJS and require()s the ESM-only htmlparser2 family, which Vercel's
 * function loader refuses (ERR_REQUIRE_ESM) although plain Node 24 allows it. Bundling the
 * whole tree at build time leaves nothing to require() at runtime.
 *
 * Only at build time: in `astro dev`, ssr.noExternal hands these packages to Vite's module
 * runner, which evaluates CommonJS as ESM and fails with "require is not defined". Left
 * external in dev, Node loads them directly, and that path never reaches Vercel.
 *
 * @param {string[]} packages
 * @returns {import('astro').AstroIntegration}
 */
export function bundleOnBuild(packages) {
  return {
    name: 'bundle-on-build',
    hooks: {
      'astro:config:setup': ({ command, updateConfig }) => {
        if (command === 'build') {
          updateConfig({ vite: { ssr: { noExternal: packages } } });
        }
      },
    },
  };
}
