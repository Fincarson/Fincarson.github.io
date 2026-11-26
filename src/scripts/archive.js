// The Archive's search, all in the browser: it loads the file list and the
// textbook list once, then every keystroke, filter, sort and page change is
// answered from memory. The address holds the whole state, so a link or the
// Back button restores it.
//
// To stay fast on a phone, the index does not hold 15,000 files. It holds
// each thing a file can match once: every course and professor (a "group"),
// every document name, semester and type, and every book. A word of the query
// is looked up there, and a file matches the query when each word matches its
// group, its name, its semester or its type.
import MiniSearch from 'minisearch';
import booksUrl from '../data/textbooks.json?url';

const PER_PAGE = 25;
const SHOWN = 8;
const REPO = 'https://github.com/Fincarson/NTHU_Archive';
const FACETS = [
  { key: 'type', label: 'Type' },
  { key: 'sem', label: 'Semester' },
  { key: 'course', label: 'Course' },
  { key: 'prof', label: 'Professor' },
  { key: 'dept', label: 'Department' },
  { key: 'src', label: 'Source' },
];
const TYPE_ORDER = ['Exams', 'Homework', 'Quizzes', 'Notes', 'Slides', 'Tutorials', 'Textbooks'];
const ONE = { Exams: 'Exam', Homework: 'Homework', Quizzes: 'Quiz', Notes: 'Notes', Slides: 'Slides', Tutorials: 'Tutorial' };
const TERM = { Spring: 1, Summer: 2, Fall: 3, Winter: 4 };
const CJK = /[㐀-鿿豈-﫿]/;
const CJK_RUNS = /[㐀-鿿豈-﫿]+|[^㐀-鿿豈-﫿]+/g;

const $ = (id) => document.getElementById(id);
const root = $('archive');
const box = $('q');
const el = {
  facets: $('facets'), bar: $('bar'), count: $('count'), sort: $('sort'), chips: $('chips'), list: $('list'),
  top: $('pager-top'), bottom: $('pager-bottom'), note: $('note'), start: $('start'),
  open: $('filters-open'), panel: $('filters-panel'), slot: $('filters-slot'), close: $('filters-close'), home: $('filters'),
};
// 15,369: by hand, because the browser's own number formatting is slow enough to notice on every keystroke.
const number = (n) => String(n).replace(/\B(?=(\d{3})+$)/g, ',');
// Writes a piece of the page only when it changed.
const written = new Map();
const write = (node, html) => {
  if (written.get(node) === html) return;
  written.set(node, html);
  node.innerHTML = html;
};
const plural = (n, word) => `${number(n)} ${word}${n === 1 ? '' : 's'}`;
const escape = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// Words for the index. Latin words are split where a name runs together
// ("KuangRu" gives kuang, ru and kuangru); Chinese is cut into single
// characters and overlapping pairs, since it has no spaces to split on.
function tokenize(text, searching) {
  const out = [];
  for (const word of text.normalize('NFKC').split(/[^\p{L}\p{N}]+/u)) {
    for (const piece of word.match(CJK_RUNS) ?? []) {
      if (CJK.test(piece)) {
        const chars = [...piece];
        if (!searching || chars.length === 1) out.push(...chars);
        for (let i = 0; i < chars.length - 1; i++) out.push(chars[i] + chars[i + 1]);
      } else {
        const parts = piece.split(/(?<=[a-z])(?=[A-Z])/);
        if (parts.length > 1) out.push(...parts);
        out.push(piece);
      }
    }
  }
  return out;
}

const index = new MiniSearch({
  idField: 'i',
  fields: ['course', 'prof', 'dept', 'num', 'doc', 'sem', 'type'],
  tokenize: (text) => tokenize(text, false),
  searchOptions: {
    // One word at a time: the page combines the words itself.
    tokenize: (word) => [word],
    prefix: (term) => !CJK.test(term),
    fuzzy: (term) => (term.length >= 5 && !CJK.test(term) && !/\d/.test(term) ? 0.2 : false),
    // Exact course and professor matches come first.
    boost: { course: 3, prof: 3, dept: 1.5 },
    weights: { fuzzy: 0.3, prefix: 0.6 },
  },
});

let groups = [];
/** Files, in the order they are shown inside their group. */
let files = [];
let books = [];
/** Where each kind of thing starts in the index: groups, names, semesters, types, the solution word, books. */
const at = {};
let units = 0;
/** The values of each filter; every file and book holds the number of its value in each (-1 for none). */
const values = {};
let status = 'loading';

const state = { q: '', sort: 'relevance', page: 1, f: {}, all: {} };
for (const { key } of FACETS) state.f[key] = new Set();
const filtered = () => FACETS.some(({ key }) => state.f[key].size);
const atStart = () => !state.q.trim() && !filtered();

// The address: only what differs from the defaults.
function address(change = {}) {
  const s = { ...state, ...change };
  const params = new URLSearchParams();
  if (s.q.trim()) params.set('q', s.q.trim());
  for (const { key } of FACETS) for (const value of s.f[key]) params.append(key, key === 'type' || key === 'src' ? value.toLowerCase() : value);
  if (s.sort !== 'relevance') params.set('sort', s.sort);
  if (s.page > 1) params.set('page', s.page);
  const query = params.toString();
  return location.pathname + (query ? '?' + query : '');
}
function readAddress() {
  const params = new URLSearchParams(location.search);
  state.q = params.get('q') ?? '';
  state.sort = ['newest', 'course'].includes(params.get('sort')) ? params.get('sort') : 'relevance';
  state.page = Math.max(1, parseInt(params.get('page'), 10) || 1);
  for (const { key } of FACETS) state.f[key] = new Set(params.getAll(key));
  box.value = state.q;
  el.sort.value = state.sort;
}
// Values in an address may be in another case ("exams"): once the list is here, give them their real spelling.
function settleFilters() {
  for (const { key } of FACETS) {
    const known = new Map(values[key].map((value) => [value.toLowerCase(), value]));
    state.f[key] = new Set([...state.f[key]].map((value) => known.get(value.toLowerCase())).filter(Boolean));
  }
}
// While typing, the address follows a moment behind, so writing it never slows a keystroke.
// Anything else that touches the history writes the typed address first.
let typed = 0;
const record = (how) => {
  const url = address();
  if (url !== location.pathname + location.search) history[how](null, '', url);
};
function settle() {
  if (!typed) return;
  clearTimeout(typed);
  typed = 0;
  record('replaceState');
}
function go(change, push = true) {
  Object.assign(state, change);
  if (push) record('pushState');
  else {
    clearTimeout(typed);
    typed = setTimeout(settle, 250);
  }
  render();
}

async function load() {
  status = 'loading';
  render();
  try {
    const [list, library] = await Promise.all(
      [root.dataset.list, booksUrl].map((url) => fetch(url).then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))),
    );
    for (const { key } of FACETS) values[key] = [];
    const ids = Object.fromEntries(FACETS.map(({ key }) => [key, new Map()]));
    const id = (key, value) => {
      if (!value) return -1;
      if (!ids[key].has(value)) ids[key].set(value, values[key].push(value) - 1);
      return ids[key].get(value);
    };
    const names = new Map();
    const semesters = new Map();
    const seen = (map, text) => (map.has(text) ? map.get(text) : map.set(text, map.size).get(text));

    groups = list.groups.map(([dir, src, deptCode, deptName, czh, cen, pzh, pen, num, book, bookUrl]) => {
      const parts = dir.split('/');
      const exam = parts[0] === 'Graduate_Entrance_Exams';
      return {
        dir, parts, exam, deptCode, deptName, czh, cen, pzh, pen, num, book, bookUrl,
        f: [-1, -1, id('course', cen), id('prof', pen), id('dept', deptCode), id('src', list.sources[src])],
        // The start of a file name that follows the naming rule, up to the semester.
        start: [exam ? 'GRAD' : parts[0] === 'OCW' ? 'OCW' : deptCode, parts.at(exam ? -1 : -2), !exam && parts.at(-1) !== '_Unknown_Professor' && parts.at(-1)],
      };
    });
    // In slices, with a breath between them, so the page stays responsive while 15,000 rows are prepared.
    const pause = () => new Promise((done) => setTimeout(done));
    const describe = ([g, type, sem, rest, doc, flags]) => {
      const group = groups[g];
      // The semester folder is a dated one ("2024_Fall"), the one for unknown semesters, or absent.
      const dated = /^\d{4}_/.test(sem);
      const [year, term] = dated ? sem.split('_') : [group.exam ? sem : '', ''];
      const label = year ? (term ? `${term} ${year}` : year) : '';
      const start = [...group.start, (dated || group.exam) && sem].filter(Boolean).map((part) => part.replace(/_/g, '-')).join('_') + '_';
      const name = flags & 2 ? start + rest : rest;
      const kind = list.types[type];
      const f = group.f.slice();
      f[0] = id('type', kind);
      f[1] = id('sem', label);
      return {
        g, f, type: kind, doc, sem: label, solution: !!(flags & 1), ext: name.split('.').pop().toUpperCase(),
        when: year ? Number(year) * 10 + (TERM[term] ?? 0) : 0,
        path: (group.exam ? [group.dir, name] : [group.dir, list.typeFolders[type], sem, name]).filter(Boolean).join('/'),
        name: seen(names, doc), semester: label ? seen(semesters, label) : -1, kind: TYPE_ORDER.indexOf(kind),
      };
    };
    files = [];
    for (let i = 0; i < list.files.length; i += 1500) {
      for (const file of list.files.slice(i, i + 1500)) files.push(describe(file));
      await pause();
    }
    const textbooks = id('type', 'Textbooks');
    books = library.books.map((book) => ({ book, f: [textbooks, -1, -1, -1, -1, -1] }));

    // The index: one entry for each thing a file can match.
    const docs = [];
    const add = (doc) => docs.push({ i: docs.length, ...doc });
    at.group = 0;
    for (const g of groups) add({ course: `${g.czh} ${g.cen} ${g.parts.at(g.exam ? -1 : -2)}`, prof: `${g.pzh} ${g.pen} ${g.pen ? g.parts.at(-1) : ''}`, dept: `${g.deptCode} ${g.deptName}`, num: `${g.num} ${g.num.slice(5)}` });
    at.name = docs.length;
    for (const name of names.keys()) add({ doc: name });
    at.semester = docs.length;
    for (const semester of semesters.keys()) add({ sem: semester });
    at.kind = docs.length;
    for (const kind of TYPE_ORDER) add({ type: `${kind} ${ONE[kind] ?? 'Textbook'}` });
    at.solution = docs.length;
    add({ type: 'solution solutions answers' });
    at.book = docs.length;
    for (const { book } of books) add({ doc: book.title, course: book.subject, prof: book.authors ?? '', type: 'Textbooks Textbook' + (book.solution ? ' solution' : '') });
    units = docs.length;
    await index.addAllAsync(docs, { chunkSize: 150 });
    status = 'ready';
    settleFilters();
  } catch {
    status = 'failed';
  }
  render();
}

/** What matches the box and the filters: the groups in order with their rows, and the count of every filter value. */
function find() {
  const words = [...new Set(tokenize(state.q, true).map((word) => word.toLowerCase()))];
  // For each word, the score of every entry of the index that matches it.
  const hits = words.map((word) => {
    const scores = new Float32Array(units);
    for (const result of index.search(word)) scores[result.id] = result.score;
    return scores;
  });
  const chosen = FACETS.map(({ key }) => (state.f[key].size ? new Set([...state.f[key]].map((value) => values[key].indexOf(value))) : null));
  const counts = FACETS.map(({ key }) => new Int32Array(values[key].length));
  const found = new Map();
  let total = 0;
  // A row counts toward a filter's values when every other filter lets it through.
  const consider = (key, book, f, row, score, when) => {
    let failed = -1;
    for (let k = 0; k < 6; k++) {
      if (chosen[k] && !chosen[k].has(f[k])) {
        if (failed >= 0) return;
        failed = k;
      }
    }
    for (let k = 0; k < 6; k++) if ((failed < 0 || failed === k) && f[k] >= 0) counts[k][f[k]]++;
    if (failed >= 0) return;
    let group = found.get(key);
    if (!group) found.set(key, (group = { key, book, rows: [], score: 0, when: 0 }));
    group.rows.push(row);
    if (score > group.score) group.score = score;
    if (when > group.when) group.when = when;
    total++;
  };
  books.forEach((entry, b) => {
    let score = 0;
    for (const scores of hits) {
      const s = scores[at.book + b];
      if (!s) return;
      score += s;
    }
    consider('book ' + entry.book.subject, true, entry.f, entry, score, 0);
  });
  for (const file of files) {
    let score = 0;
    let matched = true;
    for (const scores of hits) {
      let s = scores[file.g];
      let other = scores[at.name + file.name];
      if (other > s) s = other;
      if (file.semester >= 0 && (other = scores[at.semester + file.semester]) > s) s = other;
      if ((other = scores[at.kind + file.kind]) > s) s = other;
      if (file.solution && (other = scores[at.solution]) > s) s = other;
      if (!s) { matched = false; break; }
      score += s;
    }
    if (matched) consider(file.g, false, file.f, file, score, file.when);
  }

  // Groups in order, books first. The rows of a group are already in theirs.
  const name = (group) => (group.book ? group.key : `${groups[group.key].cen} ${groups[group.key].pen}`);
  const sort = state.sort === 'relevance' && !words.length ? 'newest' : state.sort;
  const ordered = [...found.values()].sort(
    (a, b) =>
      b.book - a.book ||
      (sort === 'relevance' && b.score - a.score) ||
      (sort !== 'course' && !a.book && b.when - a.when) ||
      name(a).localeCompare(name(b), 'en', { numeric: true }),
  );
  for (const group of ordered) if (group.book) group.rows.sort((a, b) => a.book.solution - b.book.solution || a.book.title.localeCompare(b.book.title, 'en', { numeric: true }));
  return { ordered, total, counts };
}

// Query words, marked in the text. The mark is a second cue: the row is there because it matched.
function marker() {
  const words = state.q.normalize('NFKC').split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  if (!words.length) return escape;
  const pattern = words
    .sort((a, b) => b.length - a.length)
    .map((word) => (CJK.test(word) ? word : `(?<![\\p{L}\\p{N}])${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`))
    .join('|');
  const find = new RegExp(pattern, 'giu');
  return (text) => {
    let out = '';
    let last = 0;
    for (const match of text.matchAll(find)) {
      out += escape(text.slice(last, match.index)) + '<mark>' + escape(match[0]) + '</mark>';
      last = match.index + match[0].length;
    }
    return out + escape(text.slice(last));
  };
}

const ICON = {
  view: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true" focusable="false"><path d="M12 3v12M6.5 10l5.5 5.5L17.5 10M4 20.5h16"/></svg>',
};
const encode = (path) => path.split('/').map(encodeURIComponent).join('/');

function rowHtml(row, mark) {
  let title, meta, about, view, download, format, solution;
  if (row.book) {
    const { book } = row;
    title = mark(book.title);
    meta = book.authors ? `Textbook, by ${mark(book.authors.trim())}` : 'Textbook';
    about = `${book.title}${book.solution ? ' solution' : ''}`;
    [view, download, format, solution] = [book.view, book.download, 'PDF', book.solution];
  } else {
    const group = groups[row.g];
    title = mark(row.sem ? `${row.doc}, ${row.sem}` : row.doc);
    meta = ONE[row.type];
    about = [row.doc + (row.solution ? ' solution' : ''), row.sem, group.cen, group.pen.replace(',', '')].filter(Boolean).join(', ');
    [view, download, format, solution] = [`${REPO}/blob/main/${encode(row.path)}`, `${REPO}/raw/main/${encode(row.path)}`, row.ext, row.solution];
  }
  return `<li class="file"><div><p class="file-title">${title}${solution ? ' <span class="tag">Solution</span>' : ''}</p><p class="file-meta">${meta}</p></div>
<div class="file-actions"><a class="act act-view" href="${escape(view)}" aria-label="${escape(`View ${about}${row.book ? '' : ' on GitHub'}`)}">${ICON.view}View</a><a class="act act-download" href="${escape(download)}" aria-label="${escape(`Download ${format}: ${about}`)}">${ICON.download}Download ${format}</a></div></li>`;
}

function groupHtml(group, rows, continued, mark) {
  let head, lines = '';
  if (group.book) {
    head = `${mark(group.key.slice(5))} Textbooks`;
  } else {
    const g = groups[group.key];
    head = `${g.czh ? `<span class="zh" lang="zh-Hant">${mark(g.czh)}</span> ` : ''}${mark(g.cen)}`;
    const professor = [g.pzh && `<span lang="zh-Hant">${mark(g.pzh)}</span>`, g.pen && mark(g.pen)].filter(Boolean).join(' ');
    const book = g.book && `Textbook: ${g.bookUrl ? `<a href="${escape(g.bookUrl)}">${escape(g.book)}</a>` : escape(g.book)}`;
    lines = [g.num && mark(g.num), professor, book].filter(Boolean).map((line) => `<span>${line}</span>`).join('');
  }
  const total = plural(group.rows.length, group.book ? 'book' : 'file');
  return `<section class="group"><div class="group-head"><h2 class="group-title">${head}${continued ? ' <span class="group-more">(continued)</span>' : ''}</h2><p class="group-count">${total}</p></div>
${lines ? `<p class="group-sub">${lines}</p>` : ''}<ul class="files">${rows.map((row) => rowHtml(row, mark)).join('')}</ul></section>`;
}

/** The groups of one page: 25 rows, a group cut by the page's edge carrying on under its heading. */
function pageHtml(ordered, mark) {
  let skip = (state.page - 1) * PER_PAGE;
  let room = PER_PAGE;
  let out = '';
  for (const group of ordered) {
    if (skip >= group.rows.length) { skip -= group.rows.length; continue; }
    const rows = group.rows.slice(skip, skip + room);
    out += groupHtml(group, rows, skip > 0, mark);
    room -= rows.length;
    skip = 0;
    if (!room) break;
  }
  return out;
}

function pagerHtml(pages) {
  if (pages < 2) return '';
  const link = (page, text, current) =>
    `<a class="pg${current ? ' current' : ''}" href="${escape(address({ page }))}"${current ? ' aria-current="page"' : ''}${text === page ? ` aria-label="Page ${page}"` : ''}>${text}</a>`;
  // The first, the last and two on each side of the current one; a wider gap where numbers are skipped.
  const shown = [...new Set([1, pages, ...[-2, -1, 0, 1, 2].map((d) => state.page + d)])].filter((p) => p >= 1 && p <= pages).sort((a, b) => a - b);
  let out = state.page > 1 ? link(state.page - 1, '<span aria-hidden="true">←</span> Previous') : '';
  shown.forEach((page, i) => {
    if (i && page - shown[i - 1] > 1) out += '<span class="pg-gap"></span>';
    out += link(page, page, page === state.page);
  });
  if (state.page < pages) out += link(state.page + 1, 'Next <span aria-hidden="true">→</span>');
  return out;
}

function facetsHtml(counts) {
  return FACETS.map(({ key, label }, k) => {
    const list = values[key].map((value, i) => [value, counts[k][i]]).filter(([value, n]) => n || state.f[key].has(value));
    if (!list.length) return '';
    if (key === 'type') list.sort((a, b) => TYPE_ORDER.indexOf(a[0]) - TYPE_ORDER.indexOf(b[0]));
    else if (key === 'sem') {
      const when = (text) => { const [a, b] = text.split(' '); return b ? Number(b) * 10 + TERM[a] : Number(a) * 10; };
      list.sort((a, b) => when(b[0]) - when(a[0]));
    } else if (key !== 'src') list.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    const long = list.length > SHOWN;
    // A collapsed list still shows every chosen value.
    const visible = long && !state.all[key] ? list.filter(([value], i) => i < SHOWN || state.f[key].has(value)) : list;
    return `<fieldset class="facet"><legend>${label}</legend><ul>${visible
      .map(([value, n]) => `<li><label><input type="checkbox" data-f="${key}" value="${escape(value)}"${state.f[key].has(value) ? ' checked' : ''}><span>${escape(value)}</span><span class="count">${number(n)}</span></label></li>`)
      .join('')}</ul>${long ? `<button class="facet-all" type="button" data-all="${key}" aria-expanded="${!!state.all[key]}">${state.all[key] ? 'Show fewer' : `Show all ${list.length}`}</button>` : ''}</fieldset>`;
  }).join('');
}

function chipsHtml() {
  const chips = FACETS.flatMap(({ key, label }) =>
    [...state.f[key]].map((value) => `<li><button class="chip" type="button" data-f="${key}" data-v="${escape(value)}" aria-label="${escape(`${label}: ${value}, remove filter`)}">${escape(`${label}: ${value}`)} <span aria-hidden="true">×</span></button></li>`),
  );
  return chips.length ? chips.join('') + '<li><button class="chip-clear" type="button" data-clear>Clear all</button></li>' : '';
}

function render() {
  const start = atStart();
  const ready = status === 'ready';
  const q = state.q.trim();
  const show = (node, on) => { node.hidden = !on; };
  root.dataset.status = status;
  root.classList.toggle('searching', !start);
  let total = 0;
  let pages = 1;
  if (ready) {
    const { ordered, total: n, counts } = find();
    total = n;
    const keep = document.activeElement?.matches?.('#facets input') ? [document.activeElement.dataset.f, document.activeElement.value] : null;
    write(el.facets, facetsHtml(counts));
    if (keep) [...el.facets.querySelectorAll('input')].find((input) => input.dataset.f === keep[0] && input.value === keep[1])?.focus();
    pages = Math.max(1, Math.ceil(total / PER_PAGE));
    if (state.page > pages) state.page = pages;
    if (!start && total) {
      write(el.list, pageHtml(ordered, marker()));
      write(el.count, `<strong>${plural(total, 'result')}</strong>${q ? ` for “${escape(q)}”` : ''}${pages > 1 ? `, page ${state.page} of ${pages}` : ''}`);
      const pager = pagerHtml(pages);
      write(el.top, pager);
      write(el.bottom, pager);
    } else {
      write(el.list, '');
      write(el.count, start ? '' : escape(`No results${q ? ` for “${q}”` : ''}`));
    }
  } else {
    write(el.list, '');
  }
  const some = ready && !start && total > 0;
  show(el.start, start);
  show(el.bar, some);
  show(el.top, some && pages > 1);
  show(el.bottom, some && pages > 1);
  write(el.chips, chipsHtml());
  show(el.chips, ready && !start && filtered());

  // What takes the results' place: still loading, nothing found, or the list did not arrive.
  let note = '';
  if (status === 'failed') {
    note = `<div class="archive-error" role="alert"><p><strong>The file list didn't load.</strong></p><p>Check your connection, then try again.</p><button class="btn" type="button" data-retry>Retry</button></div>`;
  } else if (!ready && !start) {
    note = `<p class="archive-loading">Loading the file list</p>`;
  } else if (ready && !start && !total) {
    const guess = q && index.autoSuggest(q, { tokenize: (text) => tokenize(text, true), fuzzy: 0.34, prefix: true, combineWith: 'AND' }).find((s) => s.suggestion !== q.toLowerCase())?.suggestion;
    note = `<div class="archive-empty"><p class="archive-empty-title">No files match${q ? ` “${escape(q)}”` : ' these filters'}</p>
${guess ? `<p>Did you mean <a href="${escape(address({ q: guess, page: 1 }))}">“${escape(guess)}”</a>?</p>` : ''}
${filtered() ? '<p>Remove a filter above, or clear them all.</p>' : ''}<p><a href="${location.pathname}">Back to the start</a></p></div>`;
  }
  write(el.note, note);
  show(el.note, !!note);

  const chosen = FACETS.reduce((n, { key }) => n + state.f[key].size, 0);
  el.open.textContent = chosen ? `Filters (${chosen})` : 'Filters';
  el.open.disabled = !ready;
  el.close.textContent = start ? 'Show the start' : `Show ${plural(total, 'result')}`;
}

// Typing replaces the history entry; a filter, the sort or a page adds one, so Back undoes it.
box.addEventListener('input', () => go({ q: box.value, page: 1 }, false));
$('search').addEventListener('submit', (event) => { event.preventDefault(); go({ q: box.value, page: 1 }, false); });
el.sort.addEventListener('change', () => { settle(); go({ sort: el.sort.value, page: 1 }); });
el.facets.addEventListener('change', (event) => {
  const { f } = event.target.dataset;
  if (!f) return;
  settle();
  state.f[f][event.target.checked ? 'add' : 'delete'](event.target.value);
  go({ page: 1 });
});
root.addEventListener('click', (event) => {
  const target = event.target.closest('button, a');
  if (!target) return;
  settle();
  if (target.dataset.all) {
    state.all[target.dataset.all] = !state.all[target.dataset.all];
    render();
    el.facets.querySelector(`[data-all="${target.dataset.all}"]`)?.focus();
  } else if (target.classList.contains('chip')) {
    state.f[target.dataset.f].delete(target.dataset.v);
    go({ page: 1 });
    (el.chips.querySelector('button') ?? box).focus();
  } else if ('clear' in target.dataset) {
    for (const { key } of FACETS) state.f[key].clear();
    go({ page: 1 });
    box.focus();
  } else if ('retry' in target.dataset) {
    load();
  } else if (target.tagName === 'A' && target.origin === location.origin && target.pathname === location.pathname && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.button) {
    // A link to another state of this page: a page number, a card, a suggestion, the start.
    event.preventDefault();
    const paging = target.classList.contains('pg');
    history.pushState(null, '', target.href);
    readAddress();
    if (status === 'ready') settleFilters();
    render();
    if (paging) {
      el.bar.scrollIntoView({ block: 'start' });
      el.count.focus({ preventScroll: true });
    } else if (!el.panel.open) box.focus({ preventScroll: true });
  }
});
addEventListener('popstate', () => {
  clearTimeout(typed);
  typed = 0; readAddress(); if (status === 'ready') settleFilters(); render(); });

// Phones: the filters move into a full-screen panel and back.
el.open.addEventListener('click', () => { el.slot.append(el.facets); el.panel.showModal(); });
el.close.addEventListener('click', () => el.panel.close());
el.panel.addEventListener('close', () => { el.home.append(el.facets); el.open.focus(); });
matchMedia('(min-width: 52em)').addEventListener('change', (event) => { if (event.matches && el.panel.open) el.panel.close(); });

readAddress();
render();
// The list is fetched once the page itself has shown, so it never holds up the first paint.
if (document.readyState === 'complete') load();
else addEventListener('load', () => setTimeout(load), { once: true });
