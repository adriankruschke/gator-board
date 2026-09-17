import { defineConfig } from 'astro/config';

// Served from a GitHub Pages project site, so everything lives under /gator-board/.
export default defineConfig({
  output: 'static',
  site: 'https://adriankruschke.github.io',
  base: '/gator-board',
  trailingSlash: 'ignore',
});
