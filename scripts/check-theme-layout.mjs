// Layout check: switching between the light and the dark theme may change
// colours only. Serves dist/, opens every page at a phone and a desktop width,
// records the box of every element in light, presses the theme toggle, records
// again, and fails if any box moved or changed size.
// Left out: the sky art and the toggle's icon, which are different drawings in
// each theme by design and take no part in the layout.
// Needs a build in dist/ and Google Chrome (CHROME_PATH overrides the lookup).
// Run: node scripts/check-theme-layout.mjs
import { createServer } from 'node:http';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { extname, join, relative, sep } from 'node:path';
import { chromium } from 'playwright-core';

const DIST = 'dist';
const WIDTHS = [390, 1440];
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml',
};

if (!existsSync(join(DIST, 'index.html'))) {
  console.error('check-theme-layout: dist/ not found. Run "npm run build" first.');
  process.exit(1);
}

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );
}
const pages = walk(DIST)
  .filter((f) => extname(f) === '.html')
  .map((f) => '/' + relative(DIST, f).split(sep).join('/').replace(/index\.html$/, ''))
  .sort();

const server = createServer((req, res) => {
  let path = join(DIST, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (existsSync(join(path, 'index.html'))) path = join(path, 'index.html');
  if (!existsSync(path) || !extname(path)) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' });
  res.end(readFileSync(path));
});
await new Promise((done) => server.listen(0, '127.0.0.1', done));
const origin = `http://127.0.0.1:${server.address().port}`;

// Every element's box, to a hundredth of a pixel, plus the page's full height.
const measure = () => {
  const boxes = [...document.querySelectorAll('body *')]
    .filter((el) => !el.closest('.sky-art, .theme-toggle svg'))
    .map((el) => {
      const r = el.getBoundingClientRect();
      const name = el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().replace(/\s+/g, '.') : '');
      return [name, ...[r.x, r.y, r.width, r.height].map((v) => Math.round(v * 100) / 100)];
    });
  boxes.push(['(page height)', 0, 0, 0, document.documentElement.scrollHeight]);
  return boxes;
};

const browser = await chromium.launch(
  process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: 'chrome' },
);
const problems = [];
let compared = 0;

for (const width of WIDTHS) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  for (const path of pages) {
    await page.goto(origin + path);
    await page.evaluate(() => document.fonts.ready);
    const light = await page.evaluate(measure);
    await page.click('.theme-toggle');
    if ((await page.evaluate(() => document.documentElement.dataset.theme)) !== 'dark') {
      problems.push(`${path} at ${width}px: the toggle did not switch to dark`);
      continue;
    }
    const dark = await page.evaluate(measure);
    await page.click('.theme-toggle');
    compared += light.length;
    if (light.length !== dark.length) {
      problems.push(`${path} at ${width}px: ${light.length} elements in light, ${dark.length} in dark`);
      continue;
    }
    const moved = light.filter((box, i) => box.some((v, j) => v !== dark[i][j]));
    for (const box of moved.slice(0, 5)) {
      const other = dark[light.indexOf(box)];
      problems.push(`${path} at ${width}px: ${box[0]}  light ${box.slice(1).join(', ')}  dark ${other.slice(1).join(', ')}`);
    }
    if (moved.length > 5) problems.push(`${path} at ${width}px: and ${moved.length - 5} more`);
  }
  await context.close();
}

await browser.close();
server.close();

if (problems.length) {
  console.error(`check-theme-layout: FAILED, the themes do not share one layout\n`);
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`check-theme-layout: passed (${pages.length} pages at ${WIDTHS.join(' and ')} px, ${compared} boxes identical in light and dark)`);
