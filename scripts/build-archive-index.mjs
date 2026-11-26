// Builds the file list the Archive page searches: public/data/archive/files.json.
// Run by hand after the archive changes: npm run archive:index
//
// It reads the private archive repository at its latest commit with your own
// git sign-in: a shallow clone without file contents into a temporary folder
// outside this repo, the list of paths from git, then the README.md of each
// course and professor folder that has files. It never downloads the files
// themselves, and it deletes the temporary folder when it is done.
//
// From a README it takes three things only: the names in the title line, the
// newest course number and the textbook in the newest syllabus. Nothing else.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { EXCLUDED_FOLDERS, OUTPUT, SOURCES, STUDENT_ID, TYPES } from './archive-rules.mjs';

const REPO = 'https://github.com/Fincarson/NTHU_Archive.git';
const SEMESTER = /^(\d{4})_(Spring|Summer|Fall|Winter)$/;
const NO_SEMESTER = '_Unknown_Semester';
const NO_PROFESSOR = '_Unknown_Professor';

const dir = mkdtempSync(join(tmpdir(), 'nthu-archive-'));
const git = (args, input) =>
  execFileSync('git', args, { cwd: dir, input, encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['pipe', 'pipe', 'inherit'] });

try {
  execFileSync('git', ['clone', '--depth', '1', '--filter=blob:none', '--no-checkout', '--quiet', REPO, dir], { stdio: 'inherit' });
  const [commit, committed] = git(['log', '-1', '--format=%H%n%cI']).trim().split('\n');
  const paths = git(['-c', 'core.quotepath=false', 'ls-tree', '-r', '--name-only', '-z', 'HEAD']).split('\0').filter(Boolean);

  // 1. The files: only the three sources, only the known shapes.
  const groups = new Map();
  const skipped = { excluded: 0, shape: 0, ids: 0, type: {} };
  for (const path of paths) {
    const parts = path.split('/');
    if (!(parts[0] in SOURCES)) continue;
    if (parts.some((p) => EXCLUDED_FOLDERS.includes(p))) { skipped.excluded++; continue; }
    const name = parts.at(-1);
    if (name === 'README.md' || name.startsWith('.')) continue;
    const found = locate(parts);
    if (!found) { skipped.shape++; continue; }
    if (found.otherType) { skipped.type[found.otherType] = (skipped.type[found.otherType] ?? 0) + 1; continue; }
    // A file named after a student (a nine-digit student number) is never listed.
    if (STUDENT_ID.test(path)) { skipped.ids++; continue; }
    const key = found.dir.join('/');
    if (!groups.has(key)) groups.set(key, { ...found.group, dir: key, files: [] });
    groups.get(key).files.push({ type: found.type, sem: found.sem, folder: found.folder, name });
  }

  // 2. The README of every group, and nothing else, is checked out.
  const list = [...groups.values()].sort((a, b) => a.dir.localeCompare(b.dir));
  git(['sparse-checkout', 'set', '--no-cone', '--stdin'], list.map((g) => `/${g.dir}/README.md`).join('\n') + '\n');
  git(['checkout', '--quiet', git(['symbolic-ref', '--short', 'HEAD']).trim()]);

  const stats = { groups: list.length, readme: 0, chinese: 0, numbers: 0, textbooks: 0, textbookLinks: 0 };
  for (const g of list) {
    const file = join(dir, g.dir, 'README.md');
    const info = existsSync(file) ? readReadme(readFileSync(file, 'utf8')) : null;
    if (info) stats.readme++;
    const folder = (s) => s.replace(/_/g, ' ').trim();
    // A general education title carries its category where the English name should be: the folder is right there.
    g.course = [info?.courseZh ?? '', (!g.category && info?.courseEn) || folder(g.courseFolder)];
    g.prof = g.profFolder && g.profFolder !== NO_PROFESSOR ? [info?.profZh ?? '', info?.profEn || folderName(g.profFolder)] : ['', ''];
    g.number = info?.number ?? '';
    g.textbook = info?.textbook ?? '';
    g.textbookUrl = info?.textbookUrl ?? '';
    if (g.course[0]) stats.chinese++;
    if (g.number) stats.numbers++;
    if (g.textbook) stats.textbooks++;
    if (g.textbookUrl) stats.textbookLinks++;
  }

  // 3. The list, compact: each group once, each file pointing to its group.
  const typeFolders = Object.keys(TYPES);
  let prefixed = 0;
  const files = [];
  // Inside a group the files are stored in the order the page shows them: newest semester first,
  // then by type, then by name (Midterm 2 before Midterm 10), a solution after its questions.
  const when = (sem) => (sem ? Number(sem.slice(0, 4)) * 10 + ({ Spring: 1, Summer: 2, Fall: 3, Winter: 4 }[sem.slice(5)] ?? 0) : 0);
  const shown = [...new Set(Object.values(TYPES))];
  const byName = new Intl.Collator('en', { numeric: true }).compare;
  list.forEach((g, gi) => {
    const described = g.files.map((f) => ({ ...f, ...describe(f.name, g, f.sem) }));
    described.sort(
      (a, b) =>
        when(b.sem) - when(a.sem) ||
        shown.indexOf(TYPES[a.type]) - shown.indexOf(TYPES[b.type]) ||
        byName(a.doc, b.doc) ||
        a.solution - b.solution ||
        byName(a.name, b.name),
    );
    for (const f of described) {
      const { doc, solution, rest } = f;
      if (rest !== f.name) prefixed++;
      // [group, type folder, semester folder (a year for an entrance exam, which has no such folder),
      //  file name without its standard start, document name, flags]
      files.push([gi, typeFolders.indexOf(f.type), f.folder, rest, doc, (solution ? 1 : 0) | (rest !== f.name ? 2 : 0)]);
    }
  });
  const data = {
    commit,
    committed,
    updated: new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Taipei', dateStyle: 'long', timeStyle: 'short' })
      .format(new Date(committed))
      .replace(' at ', ', '),
    built: new Date().toISOString().slice(0, 10),
    repo: 'Fincarson/NTHU_Archive',
    sources: Object.values(SOURCES),
    typeFolders,
    types: typeFolders.map((t) => TYPES[t]),
    // [directory, source, department code, department name, course zh, course en, professor zh, professor en, course number, textbook, textbook link]
    groups: list.map((g) => [g.dir, Object.keys(SOURCES).indexOf(g.source), g.deptCode, g.deptName, ...g.course, ...g.prof, g.number, g.textbook, g.textbookUrl]),
    files,
  };
  const json = JSON.stringify(data);
  mkdirSync(dirname(OUTPUT), { recursive: true });
  writeFileSync(OUTPUT, json);

  const kb = (n) => `${(n / 1024).toFixed(1)} kB`;
  console.log(`archive commit ${commit.slice(0, 7)}, ${data.updated} (Taiwan time)`);
  console.log(`${files.length} files in ${list.length} groups (${prefixed} file names follow the naming rule)`);
  console.log(`by type: ${typeFolders.map((t) => `${t} ${files.filter((f) => typeFolders[f[1]] === t).length}`).join(', ')}`);
  console.log(`by source: ${Object.keys(SOURCES).map((s) => `${s} ${list.filter((g) => g.source === s).reduce((n, g) => n + g.files.length, 0)}`).join(', ')}`);
  console.log(`READMEs read: ${stats.readme} of ${stats.groups}; Chinese names ${stats.chinese}, course numbers ${stats.numbers}, textbooks ${stats.textbooks} (${stats.textbookLinks} with a link)`);
  console.log(`left out: ${skipped.excluded} in excluded folders, ${skipped.shape} outside the folder shapes, ${skipped.ids} named with a student number, and by type folder: ${Object.entries(skipped.type).sort((a, b) => b[1] - a[1]).map(([t, n]) => `${t} ${n}`).join(', ')}`);
  console.log(`${OUTPUT}: ${kb(json.length)} raw (${kb(Buffer.byteLength(json))} in bytes), ${kb(gzipSync(json).length)} gzipped`);
} finally {
  rmSync(dir, { recursive: true, force: true, maxRetries: 5 });
}

/** Where a path sits in the archive's folder shapes, or null when it fits none. */
function locate(parts) {
  const [source] = parts;
  if (source === 'Graduate_Entrance_Exams') {
    // Graduate_Entrance_Exams/<Subject>/GRAD_<Subject>_<Year>_Exam[-Variant].pdf
    if (parts.length !== 3 || !parts[2].startsWith('GRAD_')) return null;
    const year = parts[2].match(/_(\d{4})_/)?.[1];
    return { dir: parts.slice(0, 2), type: 'Exams', sem: year ?? null, folder: year ?? '', group: { source, deptCode: '', deptName: '', courseFolder: parts[1], profFolder: '' } };
  }
  // Courses/<Dept>/[<Category>/]<Course>/<Professor>/<Type>/[<Semester>/]<file>
  // OCW/<Course>/<Professor>/<Type>/[<Semester>/]<file>
  // The type folder sits fourth in OCW, fifth in Courses and sixth under a general education category.
  for (const i of source === 'OCW' ? [3] : [4, 5]) {
    const semester = parts[i + 1];
    const direct = parts.length === i + 2;
    const inSemester = parts.length === i + 3 && (SEMESTER.test(semester) || semester === NO_SEMESTER);
    if (!direct && !inSemester) continue;
    const type = parts[i];
    if (!(type in TYPES)) {
      // Not a type folder at all (a semester, shared material), or one the page does not list (Labs, Projects).
      if (SEMESTER.test(type) || type === NO_SEMESTER || parts[i - 1].startsWith('_Shared')) return null;
      return { otherType: type };
    }
    const [code, ...rest] = source === 'OCW' ? [''] : parts[1].split('_');
    return {
      dir: parts.slice(0, i),
      type,
      sem: inSemester && semester !== NO_SEMESTER ? semester : null,
      folder: inSemester ? semester : '',
      group: { source, deptCode: code, deptName: rest.join(' '), category: i === 5 ? parts[2] : '', courseFolder: parts[i - 2], profFolder: parts[i - 1] },
    };
  }
  return null;
}

/** "Wu_KuangRu" reads "Wu Kuang-Ru". */
function folderName(folder) {
  return folder
    .split('_')
    .map((word) => word.replace(/([a-z])([A-Z])/g, '$1-$2'))
    .join(' ');
}

/** The three things a README gives: the names in its title, the newest course number, the newest textbook. */
function readReadme(text) {
  const title = text.match(/^# (.+)$/m)?.[1].trim();
  if (!title) return null;
  const [coursePart, profPart = ''] = title.split(/ by (?=[^ ])/);
  let [courseZh, courseEn] = splitNames(coursePart);
  let [profZh, profEn] = splitNames(profPart);
  // "Calculus I by", "Life Science (Unknown Professor)": a title with no professor to name.
  courseEn = courseEn.replace(/\s*\(?Unknown Professor\)?$/i, '').replace(/\s+by$/, '').trim();
  if (/^Unknown Professor$/i.test(profEn)) profEn = '';
  // "Pan HungHua" reads "Pan Hung-Hua".
  if (!profEn.includes(',')) profEn = profEn.replace(/([a-z])([A-Z])/g, '$1-$2');
  const numbers = [...text.matchAll(/\b(\d{5})[A-Z]{2,5} ?\d{6}\b/g)].map((m) => m[0]);
  const number = numbers.sort((a, b) => b.slice(0, 5).localeCompare(a.slice(0, 5)))[0] ?? '';
  return { courseZh, courseEn, profZh, profEn, number, ...textbook(text) };
}

/** "微積分 Calculus B1" gives ["微積分", "Calculus B1"]: the leading words without Latin letters, then the rest. */
function splitNames(text) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  let i = 0;
  while (i < words.length && /[㐀-鿿＀-￯]/.test(words[i]) && !/[A-Za-z]/.test(words[i])) i++;
  return [words.slice(0, i).join(' '), words.slice(i).join(' ')];
}

/** The textbook named in the newest syllabus: one line of plain text and a link when one is given with it. */
function textbook(text) {
  const syllabus = text.split(/^## .*Syllabus.*$/m)[1];
  if (!syllabus) return {};
  // Syllabi come newest first: the newest one that names a textbook is used.
  for (const block of syllabus.split(/<details/).slice(1)) {
    const found = textbookIn(block);
    if (found) return found;
  }
  return {};
}

function textbookIn(block) {
  // The heading of the textbook section, at the start of a line: "二、指定用書(Text Books)", "Textbook:", "教科書：".
  const label = block.match(
    /(?:<br\s*\/?>|<td[^>]*>|\n)\s*(?:[二2][、.．]\s*)?(?:(?:指定用書|教科書)\s*[(（]?\s*(?:Text\s?-?Books?)?\s*[)）]?|(?:\d\.\s*)?Text\s?-?Books?)\s*[:：]?\s*(?=<br|\S)/i,
  );
  if (!label) return null;
  // Its text runs to the next section (references, teaching method) or the end of the cell.
  const section = block
    .slice(label.index + label[0].length)
    .split(/<br\s*\/?>\s*(?:[三四五六3-6][、.．]|參考|References?\b|Reference Books|教學方式|[(（]?Teaching Method)|<\/td>/i)[0];
  const lines = section
    .split(/<br\s*\/?>|\n/)
    .map((s) => s.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&[a-z#0-9]+;/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  if (!lines.length) return null;
  // One book: the first line, and the next one when the first is only an author or a short title.
  const numbered = /^[(（]?[1１一][.、)）]/.test(lines[0]);
  let line = lines[0];
  // A title broken over two lines: the first ends mid-sentence, or opens a quotation it does not close.
  const open = (line.match(/["“”]/g) ?? []).length % 2 === 1;
  const unfinished = /,$/.test(line) || line.length < 30 || open || (/[A-Za-z]$/.test(line) && /^[a-z]/.test(lines[1] ?? ''));
  if (!numbered && lines[1] && unfinished && !/^[(（]?[2２二][.、)）]/.test(lines[1])) line += ' ' + lines[1];
  const url = line.match(/https?:\/\/[^\s;,)]+/)?.[0] ?? '';
  let plain = line.replace(/https?:\/\/[^\s;,)]+/g, '').replace(/^[\s\-–•*.)(（）、:：]*(?:[1１一][.、)）])?\s*/, '').replace(/^\(?optional\)\s*/i, '').replace(/[\s;,:：(（]+$/, '').trim();
  // Anything that could be a contact detail, or is not a title at all, is dropped.
  if (plain.length < 4 || /@|\b\d{2,4}[- ]\d{3,4}[- ]?\d{3,4}\b|^(none|無|n\/a|tba|tbd|no textbook|not required|與|本課|course slides|slides)|講義|自編|lecture notes?|class notes?|handouts?|禁止|規則/i.test(plain)) return null;
  if (plain.length > 160) plain = plain.slice(0, 160).replace(/\s+\S*$/, '');
  return { textbook: plain, textbookUrl: url };
}

/** The document a file name describes: "..._Midterm-01_Solution.pdf" gives "Midterm 1" and the solution flag. */
function describe(name, g, sem) {
  const hyphens = (s) => s.replace(/_/g, '-');
  const start = [
    g.source === 'Courses' ? g.deptCode : g.source === 'OCW' ? 'OCW' : 'GRAD',
    hyphens(g.courseFolder),
    g.profFolder && g.profFolder !== NO_PROFESSOR ? hyphens(g.profFolder) : '',
    sem ? hyphens(sem) : '',
  ].filter(Boolean).join('_') + '_';
  const rest = name.startsWith(start) ? name.slice(start.length) : name;
  let parts = rest.replace(/\.[^.]+$/, '').split('_').filter(Boolean);
  // A name that follows the rule with another spelling of the course: drop the department, the course,
  // then a professor ("Chen-HsinLung") and a semester or year when they come next.
  if (rest === name && parts.length > 2 && /^[A-Z]{2,5}$/.test(parts[0])) {
    parts = parts.slice(2);
    if (parts.length > 1 && /^[A-Z][a-z]+-[A-Z][A-Za-z]+$/.test(parts[0])) parts.shift();
    if (parts.length > 1 && /^\d{4}(-[A-Z][a-z]+)?$/.test(parts[0])) parts.shift();
  }
  let copy = '';
  if (parts.length > 1 && /^\d$/.test(parts.at(-1))) copy = parts.pop();
  const solution = parts.length > 1 ? /^Solutions?$/i.test(parts.at(-1)) && !!parts.pop() : false;
  let doc = parts
    .join(' ')
    .replace(/-/g, ' ')
    .replace(/\b(Chapter|Lecture|Week|Homework|Quiz|Exam|Midterm|Lab|Assignment|Ch|HW)(\d+)\b/gi, '$1 $2')
    .replace(/\b0+(\d)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  // Sentence case for the everyday words; names and codes keep their capitals.
  const plain = /^(policy|midterm|final|review|exam|quiz|homework|assignment|practice|sample|answer|answers|key|sheet|notes|note|lecture|part|chapter|week|grading|information|formula|schedule|problems|problem|questions|question|solutions|set|makeup|mock|test|for|of|on|and|the|with|in|to)$/i;
  doc = doc.split(' ').map((w, i) => (i > 0 && plain.test(w) ? w.toLowerCase() : w)).join(' ');
  doc = doc.replace(/\b(for|of|on|before|after) (midterm|final)\b/g, '$1 the $2');
  if (g.source === 'Graduate_Entrance_Exams') doc = doc.replace(/^Exam (.+)$/, 'Exam, $1');
  if (copy) doc += ` (${copy})`;
  return { doc: doc || rest, solution, rest };
}
