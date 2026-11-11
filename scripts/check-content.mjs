// Content lint: flags copy that breaks the site's writing style, leftover
// placeholders, and project entries without a repo link or media. Scans src/.
// Run: node scripts/check-content.mjs
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname, extname, relative } from 'node:path';

const ROOT = 'src';
const TEXT = new Set(['.astro', '.md', '.mdx', '.ts', '.js', '.mjs', '.json', '.css', '.html', '.txt', '.yml', '.yaml']);

const CHECKS = [
  ['em dash (U+2014)', /—/],
  ...[
    'passionate', 'innovative', 'leverag\\w*', 'utiliz\\w*', 'synerg\\w*', 'seamless\\w*', 'robust\\w*',
    'cutting-edge', 'spearhead\\w*', 'detail-oriented', 'highly motivated', 'digital experiences?',
    'welcome to', 'learn more', 'get started', 'click here', 'lorem', 'ipsum', 'your name',
  ].map((w) => [`style: ${w.replace('\\w*', '').replace('s?', '')}`, new RegExp(`\\b${w}\\b`, 'i')]),
  ['style: "It\'s not X, it\'s Y"', /\bit[’']?s not [^.,;!?]{1,60}, it[’']?s\b/i],
  ['style: "More X. Less Y."', /\bmore [\w ]{1,30}\. less [\w ]{1,30}\./i],
  ['placeholder: TODO', /\bTODO\b/],
  ['placeholder: TBD', /\bTBD\b/],
  ['placeholder link: href="#"', /href=["']#["']/],
];

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );
}

const errors = [];
const files = walk(ROOT).filter((f) => TEXT.has(extname(f)));

for (const file of files) {
  readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    for (const [name, re] of CHECKS) {
      if (re.test(line)) errors.push(`${relative('.', file)}:${i + 1}  ${name}\n    ${line.trim().slice(0, 120)}`);
    }
  });
}

// Every project entry needs a GitHub repo link and at least one media file that exists.
const projectDir = join(ROOT, 'content', 'projects');
const projects = walk(projectDir).filter((f) => extname(f) === '.md');
if (projects.length === 0) errors.push(`${projectDir}: no project entries found`);
for (const file of projects) {
  const frontmatter = readFileSync(file, 'utf8').split(/^---\s*$/m)[1] ?? '';
  if (!/^repo:\s*https:\/\/github\.com\/\S+/m.test(frontmatter)) {
    errors.push(`${relative('.', file)}  missing repo link (repo: https://github.com/...)`);
  }
  const media = [...frontmatter.matchAll(/^\s+-?\s*src:\s*(\S+)/gm)].map((m) => m[1]);
  if (!/^media:/m.test(frontmatter) || media.length === 0) {
    errors.push(`${relative('.', file)}  missing media (at least one image)`);
  }
  for (const src of media) {
    if (!existsSync(join(dirname(file), src))) errors.push(`${relative('.', file)}  media file not found: ${src}`);
  }
}

if (errors.length) {
  console.error(`check-content: FAILED, ${errors.length} problem(s)\n`);
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`check-content: passed (${files.length} files, ${projects.length} project entries)`);
