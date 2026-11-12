// Computes the WCAG 2 contrast ratio for every text and UI token pair
// in light and dark, and fails below the target.
// The colours are read from src/styles/tokens.css, so the check and the site
// cannot drift apart. Add a pair here whenever a new foreground/background
// combination is used.
// Run: node scripts/check-contrast.mjs
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');
const [lightCss, darkCss] = css.split(":root[data-theme='dark']");
const read = (text) =>
  Object.fromEntries([...text.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})\b/gi)].map((m) => [m[1], m[2].toUpperCase()]));
const light = read(lightCss);
const dark = { ...light, ...read(darkCss) };
const themes = { light, dark };

// Targets: 7 body text (AAA), 4.5 other text (AA), 3 large text and UI parts.
// Text on the sky and the header is large text (24 px, or 18.66 px bold) by design.
// [label, foreground token, background token, minimum ratio, themes]
const both = ['light', 'dark'];
const spec = [
  ['ink on bg (body)', 'ink', 'bg', 7, both],
  ['ink on surface (body, fact table)', 'ink', 'surface', 7, both],
  ['ink-muted on bg', 'ink-muted', 'bg', 4.5, both],
  ['ink-muted on surface (captions on a surface)', 'ink-muted', 'surface', 4.5, both],
  ['ink-faint on bg (never on surface)', 'ink-faint', 'bg', 4.5, both],
  ['link on bg', 'link', 'bg', 4.5, both],
  ['link on surface', 'link', 'surface', 4.5, both],
  ['link-hover on bg', 'link-hover', 'bg', 4.5, both],
  ['link-hover on surface', 'link-hover', 'surface', 4.5, both],
  ['internal button text', 'button-ink', 'button', 4.5, both],
  ['internal button text, hover', 'button-ink', 'button-hover', 4.5, both],
  ['GitHub button text', 'brand-ink', 'github', 4.5, both],
  ['GitHub button text, hover', 'brand-ink', 'github-hover', 4.5, both],
  ['GitHub button border on bg (dark: the only edge)', 'github-border', 'bg', 1.2, ['dark']],
  ['YouTube button text', 'brand-ink', 'youtube', 4.5, both],
  ['YouTube button text, hover', 'brand-ink', 'youtube-hover', 4.5, both],
  ['LinkedIn button text', 'brand-ink', 'linkedin', 4.5, both],
  ['LinkedIn button text, hover', 'brand-ink', 'linkedin-hover', 4.5, both],
  ['Instagram button text, purple end', 'brand-ink', 'instagram-1', 4.5, both],
  ['Instagram button text, middle', 'brand-ink', 'instagram-2', 4.5, both],
  ['Instagram button text, lightest end', 'brand-ink', 'instagram-3', 4.5, both],
  ['selection text on brand', 'selection-ink', 'brand', 4.5, both],
  ['focus ring on bg', 'focus', 'bg', 3, both],
  ['focus ring on surface', 'focus', 'surface', 3, both],
  ['sky text on the zenith (header, titles: large text only)', 'sky-ink', 'sky-zenith', 3, both],
  ['header control hover ground (large text only)', 'sky-ink', 'sky-mid', 3, both],
  ['language menu tick on bg', 'link', 'bg', 3, both],
  ['footer text on the footer ground', 'footer-ink', 'footer-bg', 4.5, both],
];
const pairs = spec.flatMap(([label, fg, bg, min, on]) =>
  on.map((theme) => {
    const t = themes[theme];
    if (!t[fg] || !t[bg]) throw new Error(`check-contrast: token --${t[fg] ? bg : fg} not found in tokens.css`);
    return [theme, label, t[fg], t[bg], min];
  }),
);

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

let failed = 0;
for (const [theme, label, fg, bg, min] of pairs) {
  const r = ratio(fg, bg);
  const ok = r >= min;
  if (!ok) failed++;
  console.log(`${ok ? 'pass' : 'FAIL'}  ${theme.padEnd(5)} ${r.toFixed(2).padStart(5)}:1 (min ${min})  ${fg} on ${bg}  ${label}`);
}

if (failed) {
  console.error(`\ncheck-contrast: FAILED, ${failed} of ${pairs.length} pairs below target`);
  process.exit(1);
}
console.log(`\ncheck-contrast: passed (${pairs.length} pairs)`);
