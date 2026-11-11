// Single registry for the site: identity, profile links and sections.
// The header, footer and sitemap read from here.
// Adding a section: new collection folder, two pages, one line in `sections`.

export const site = {
  name: 'Vincent Jefferson',
  headline: 'CS student at @NTHU',
  motto: 'Fortune favors the bold.',
  /** The "About me" line on the Overview. The About page holds the longer text. */
  about: "I'm studying to become an AI engineer, and I'm also learning cybersecurity and network engineering.",
  description:
    'Vincent Jefferson, CS student at NTHU studying to become an AI engineer. Projects, experience and awards.',
};

export const sections = [
  { label: 'Overview', path: '/', enabled: true },
  { label: 'Experience', path: '/experience/', enabled: true },
  { label: 'Projects', path: '/projects/', enabled: true },
  { label: 'About', path: '/about/', enabled: true },
];

export const profileLinks = {
  linkedin: { label: 'LinkedIn', href: 'https://www.linkedin.com/in/vincent-jefferson' },
  instagram: { label: 'Instagram', href: 'https://www.instagram.com/huang.fen_' },
  github: { label: 'GitHub', href: 'https://github.com/Fincarson' },
};
