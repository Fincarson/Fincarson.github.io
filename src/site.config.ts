// Single registry for the site: identity, profile links and sections.
// The header, footer and sitemap read from here.
//
// The main site is one page at `/` and the NTHU section one page at `/nthu`.
// Each holds all of its tabs; the address picks one: `/?tab=experience`,
// `/?tab=projects&project=<slug>`, `/nthu?tab=about`. A panel's id is the query
// that opens it ('' for Home), so an address and its panel cannot drift apart.
// Adding a tab: one line in `sections`, one panel in src/pages/index.astro.

export const site = {
  name: 'Vincent Jefferson',
  headline: 'CS student at NTHU, studying to become an AI engineer',
  motto: 'Fortune favors the bold.',
  /** "About me" on Home, one string per paragraph. */
  about: [
    "I'm a computer science student at NTHU in Taiwan, studying to become an AI engineer. I'm also learning cybersecurity and network engineering.",
    "I build both software and hardware. My latest projects are a travel planner with an AI agent at its core, where I worked on the interface and the backend, and a hackathon app that won first place, built entirely through my prompts. Before that, I recreated Five Nights at Freddy's 4 in Verilog on an FPGA.",
  ],
  /** "What I work with" on Home: only what the projects on this site show. */
  workWith: [
    { label: 'Languages', items: 'C, C++, Python, Dart, Verilog' },
    { label: 'Tools', items: 'Flutter, Firebase, the OpenAI API, Allegro 5, Xilinx Vivado' },
    { label: 'AI', items: 'AI agents, prompt engineering' },
  ],
  /** Link previews and search engines that run no scripts show this for every tab, so it fits them all. */
  description:
    'Vincent Jefferson, CS student at NTHU studying to become an AI engineer. Projects, experience and awards.',
};

/** The id of the panel shown for an address that names no real tab or project. */
export const NOT_FOUND = '404';

/** The address of a tab: `/`, `/?tab=about`, `/nthu?tab=about`. */
export const tabPath = (tab: string, base = '/') => (tab ? `${base}?tab=${tab}` : base);
/** The id of a tab's panel: the query that opens it. */
export const tabId = (tab: string) => (tab ? `tab=${tab}` : '');
export const projectId = (slug: string) => `tab=projects&project=${slug}`;
export const projectPath = (slug: string) => `/?${projectId(slug)}`;

export const sections = [
  { label: 'Home', tab: '', enabled: true },
  { label: 'Experience', tab: 'experience', enabled: true },
  { label: 'Projects', tab: 'projects', enabled: true },
  { label: 'Education', tab: 'education', enabled: true },
  { label: 'About', tab: 'about', enabled: true },
];

export const profileLinks = {
  linkedin: { label: 'LinkedIn', href: 'https://www.linkedin.com/in/vincent-jefferson' },
  instagram: { label: 'Instagram', href: 'https://www.instagram.com/huang.fen_' },
  github: { label: 'GitHub', href: 'https://github.com/Fincarson' },
};

/** The NTHU section: its own page, tabs, header and footer. */
export const nthu = {
  base: '/nthu',
  sections: [
    { label: 'Home', tab: '', enabled: true },
    { label: 'About', tab: 'about', enabled: true },
  ],
  officialLinks: [
    { label: 'NTHU website', href: 'https://www.nthu.edu.tw/' },
    { label: 'Instagram', href: 'https://www.instagram.com/nthu_official/' },
    { label: 'Facebook', href: 'https://www.facebook.com/nthu.tw/' },
    { label: 'YouTube', href: 'https://www.youtube.com/channel/UCjaf371JsfFmBZ6e1vMl1Nw' },
    { label: 'Library', href: 'https://www.lib.nthu.edu.tw/' },
  ],
};
