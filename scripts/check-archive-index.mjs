// Checks the Archive's file list before it is published: nothing private may be in it.
// Fails if public/data/archive/files.json holds a forbidden word, a path through
// an excluded folder or outside the three sources, or a student number.
// Run: node scripts/check-archive-index.mjs
import { existsSync, readFileSync } from 'node:fs';
import { EXCLUDED_FOLDERS, FORBIDDEN_TEXT, OUTPUT, SOURCES, STUDENT_ID } from './archive-rules.mjs';

if (!existsSync(OUTPUT)) {
  console.error(`check-archive-index: ${OUTPUT} not found. Run "npm run archive:index" first.`);
  process.exit(1);
}

const text = readFileSync(OUTPUT, 'utf8');
const data = JSON.parse(text);
const errors = [];

for (const word of FORBIDDEN_TEXT) {
  const at = text.indexOf(word);
  if (at >= 0) errors.push(`forbidden text "${word}": ${text.slice(Math.max(0, at - 40), at + 40)}`);
}

// Every path, rebuilt the way the page rebuilds it.
const paths = data.files.map(([g, type, sem, name]) => [data.groups[g][0], data.typeFolders[type], sem, name].filter(Boolean).join('/'));
for (const path of [...data.groups.map((g) => g[0]), ...paths]) {
  const parts = path.split('/');
  if (!(parts[0] in SOURCES)) errors.push(`outside the three sources: ${path}`);
  const folder = parts.find((p) => EXCLUDED_FOLDERS.includes(p));
  if (folder) errors.push(`excluded folder "${folder}": ${path}`);
}
// Folder names that are whole words anywhere in the text, not only in paths ("TA" alone would match half the list).
for (const folder of EXCLUDED_FOLDERS.filter((f) => f.length > 3)) {
  if (new RegExp(`(^|[/"\\s])${folder}([/"\\s]|$)`).test(text)) errors.push(`excluded folder name "${folder}" appears in the list`);
}
for (const value of [...paths, ...data.files.map((f) => f[4]), ...data.groups.flat().filter((v) => typeof v === 'string')]) {
  if (STUDENT_ID.test(value)) errors.push(`a nine-digit number, the shape of a student number: ${value}`);
}

if (errors.length) {
  console.error(`check-archive-index: FAILED, ${errors.length} problem(s)\n`);
  console.error(errors.slice(0, 30).join('\n'));
  process.exit(1);
}
console.log(`check-archive-index: passed (${data.files.length} files in ${data.groups.length} groups, archive commit ${data.commit.slice(0, 7)})`);
