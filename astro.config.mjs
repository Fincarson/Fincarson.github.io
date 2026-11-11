import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { sections } from './src/site.config.ts';

const disabled = sections.filter((s) => !s.enabled).map((s) => s.path);

export default defineConfig({
  site: 'https://fincarson.github.io',
  output: 'static',
  trailingSlash: 'always',
  // One small stylesheet: inlined, so the first paint needs no second request.
  build: { inlineStylesheets: 'always' },
  integrations: [
    sitemap({
      filter: (page) => !disabled.some((path) => new URL(page).pathname.startsWith(path)),
    }),
  ],
});
