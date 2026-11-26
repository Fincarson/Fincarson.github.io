import { copyFileSync, mkdirSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { sections, nthu, tabPath, projectPath } from './src/site.config.ts';

const origin = 'https://fincarson.github.io';

// The sitemap lists the tab addresses, not the files: every tab of the main
// page, every project, and the tabs of the NTHU page. Nothing else.
const projects = readdirSync('./src/content/projects')
  .filter((file) => file.endsWith('.md'))
  .map((file) => file.slice(0, -3))
  .sort();
const addresses = [
  ...sections.filter((s) => s.enabled).map((s) => tabPath(s.tab)),
  ...projects.map(projectPath),
  ...nthu.sections.filter((s) => s.enabled).map((s) => tabPath(s.tab, nthu.base)),
].map((path) => origin + path);

export default defineConfig({
  site: origin,
  output: 'static',
  // File names follow the source: nthu.astro becomes nthu.html, not nthu/index.html.
  build: {
    format: 'preserve',
    // One small stylesheet: inlined, so the first paint needs no second request.
    inlineStylesheets: 'always',
  },
  integrations: [
    sitemap({
      customPages: addresses,
      filter: (page) => addresses.includes(page),
    }),
    // The NTHU page is published twice, as nthu.html and as nthu/index.html: the
    // host will hold both a file and a folder of that name, and whichever it
    // picks for /nthu, the same page opens.
    {
      name: 'nthu-twice',
      hooks: {
        'astro:build:done': ({ dir }) => {
          const dist = fileURLToPath(dir);
          mkdirSync(`${dist}nthu`, { recursive: true });
          copyFileSync(`${dist}nthu.html`, `${dist}nthu/index.html`);
        },
      },
    },
  ],
});
