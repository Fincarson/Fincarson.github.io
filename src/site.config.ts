// Single registry for the site: identity, profile links and sections.
// The header, footer and sitemap read from here.
// Adding a section: new collection folder, two pages, one line in `sections`.

export const site = {
  name: 'Vincent Jefferson',
  headline: 'CS student at @NTHU',
  motto: 'Fortune favors the bold.',
  /** The About description: exactly one sentence. */
  about:
    'I am a computer science student at National Tsing Hua University (NTHU), in the Department of Computer Science.',
  description:
    'Vincent Jefferson, CS student at NTHU. Projects in FPGA design, Flutter and C++ game development.',
};

export const sections = [
  { label: 'Overview', path: '/', enabled: true },
  { label: 'Projects', path: '/projects/', enabled: true },
  { label: 'About', path: '/about/', enabled: true },
];

export const profileLinks = {
  linkedin: { label: 'LinkedIn', href: 'https://www.linkedin.com/in/vincent-jefferson' },
  instagram: { label: 'Instagram', href: 'https://www.instagram.com/huang.fen_' },
  github: { label: 'GitHub', href: 'https://github.com/Fincarson' },
};
