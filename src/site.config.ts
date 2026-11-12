// Single registry for the site: identity, profile links and sections.
// The header, footer and sitemap read from here.
// Adding a section: new collection folder, two pages, one line in `sections`.

export const site = {
  name: 'Vincent Jefferson',
  headline: 'CS student at @NTHU',
  motto: 'Fortune favors the bold.',
  /** "About me" on the Overview, one string per paragraph. */
  about: [
    "I'm a computer science student at NTHU in Taiwan, studying to become an AI engineer. I'm also learning cybersecurity and network engineering.",
    "I build both software and hardware. My latest projects are a travel planner with an AI agent at its core, where I worked on the interface and the backend, and a hackathon app that won first place, built entirely through my prompts. Before that, I recreated Five Nights at Freddy's 4 in Verilog on an FPGA.",
  ],
  /** "What I work with" on the Overview: only what the projects on this site show. */
  workWith: [
    { label: 'Languages', items: 'C, C++, Python, Dart, Verilog' },
    { label: 'Tools', items: 'Flutter, Firebase, the OpenAI API, Allegro 5, Xilinx Vivado' },
    { label: 'AI', items: 'AI agents, prompt engineering' },
  ],
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
