import { defineConfig } from 'astro/config';

/*
 * GitHub Pages serves everything with `Cache-Control: max-age=600` and offers no way to change
 * it, so a replaced image or sound could serve stale for ten minutes. Astro already fingerprints
 * CSS and JS; this stamps the files in public/ with the same build id, giving them fresh URLs on
 * every deploy. The commit SHA on CI, a timestamp locally.
 */
process.env.PUBLIC_BUILD_ID ??= (process.env.GITHUB_SHA ?? Date.now().toString(36)).slice(0, 8);

// Served from a GitHub Pages project site, so everything lives under /gator-board/.
export default defineConfig({
  output: 'static',
  site: 'https://adriankruschke.github.io',
  base: '/gator-board',
  trailingSlash: 'ignore',
});
