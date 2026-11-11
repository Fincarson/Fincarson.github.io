// Everything on the Experience page, newest first inside each group.
// Adding an entry is one object here. A photo is optional (at most one);
// a certificate is linked as a picture, never shown on the page.
import type { ImageMetadata } from 'astro';
import scholarshipPhoto from './assets/experience/scholarship-group-photo.webp';
import graduationPhoto from './assets/experience/high-school-graduation.webp';
import forumPhoto from './assets/experience/youth-speak-forum.webp';
import hackathonCertificate from './assets/experience/certificates/hackathon-first-place.webp';
import scholarshipCertificate from './assets/experience/certificates/scholarship.webp';
import taCertificate from './assets/experience/certificates/ta-training-camp.webp';
import forumCertificate from './assets/experience/certificates/youth-speak-forum.webp';

export interface Entry {
  /** The jump target: /experience/#id */
  id: string;
  title: string;
  org?: string;
  dates?: string;
  /** One to three short lines. */
  lines?: string[];
  links?: { label: string; href: string }[];
  certificate?: ImageMetadata;
  photo?: { src: ImageMetadata; alt: string };
}

export interface Group {
  id: string;
  title: string;
  entries: Entry[];
}

export const groups: Group[] = [
  {
    id: 'experience',
    title: 'Experience',
    entries: [
      {
        id: 'teaching-assistant',
        title: 'Teaching Assistant',
        org: 'National Tsing Hua University (NTHU)',
        dates: 'Sep 2026 to present',
        lines: [
          'Sole TA for the general education course Classics in Literature: Selected Readings of Western Classical Poetry, 69 students.',
          'Main contact between the international students and the instructor. I grade midterms, collect and organise homework, form the final presentation groups and keep attendance.',
        ],
      },
      {
        id: 'aiesec',
        title: 'Strategic Planner, Incoming Global Talent team',
        org: 'AIESEC Hsinchu (AIESEC in Taiwan)',
        dates: 'Mar 2026 to present',
      },
    ],
  },
  {
    id: 'awards',
    title: 'Awards',
    entries: [
      {
        id: 'hackathon-1st-place',
        title: '1st place, Vibe Coding Youth Hackathon',
        org: 'Women in Tech Global and Newly, at NTHU',
        dates: 'Oct 2026',
        lines: [
          'With NTHU FlashEat, a campus food pre-order app we built in one afternoon. Team "Katherine Johnson": Alicia Joely, Louise Davise and me.',
        ],
        links: [{ label: 'NTHU FlashEat project page', href: '/projects/nthu-flasheat/' }],
        certificate: hackathonCertificate,
      },
      {
        id: 'favorite-game-award',
        title: 'Favorite Game award',
        org: 'An indie game hackathon',
        dates: '2024',
        lines: ['For Panda_Tales.'],
        links: [{ label: 'Panda_Tales project page', href: '/projects/panda-tales/' }],
      },
      {
        id: 'taiwan-outstanding-scholarship',
        title: 'Taiwan Outstanding Scholarship',
        org: 'Overseas Community Affairs Council (OCAC)',
        dates: '2024 to 2028',
        lines: [
          "For my bachelor's at NTHU. Awarded Aug 2024.",
          'The certificate was presented by the West Java Chinese education coordinating board.',
        ],
        certificate: scholarshipCertificate,
        photo: {
          src: scholarshipPhoto,
          alt: 'A group of ten people standing in front of a wall painting of Chinese pavilions, at the scholarship award.',
        },
      },
      {
        id: 'ui-ux-iot-competition',
        title: '4th Runner-Up, UI/UX Design for IoT Mobile Apps Competition',
        org: 'Maranatha (Bisa Team)',
        dates: 'Feb 2023',
      },
      {
        id: 'iot-competition',
        title: '5th Runner-Up, IoT Competition',
        org: 'Maranatha',
        dates: 'Feb 2023',
      },
    ],
  },
  {
    id: 'education',
    title: 'Education',
    entries: [
      {
        id: 'nthu',
        title: 'Bachelor in Computer Science',
        org: 'National Tsing Hua University (NTHU)',
        dates: '2024 to 2028',
        lines: [
          'GPA 4.1/4.3.',
          'Upcoming: undergraduate research with Prof. Chiu Te-Chuan on using large language models for security and resilience.',
        ],
      },
      {
        id: 'high-school',
        title: 'High school',
        org: 'SMAK 2 BPK PENABUR Bandung',
        dates: '2021 to 2024',
        lines: ['Final score 91.19/100.', 'Class Representative Assembly member, Jul 2022 to Jun 2023.'],
        photo: {
          src: graduationPhoto,
          alt: 'Vincent Jefferson in a navy suit with a graduation medal, holding his diploma folder and shaking hands on stage at the SMAK 2 BPK PENABUR graduation in Bandung, 15 June 2024.',
        },
      },
    ],
  },
  {
    id: 'certifications',
    title: 'Certifications',
    entries: [
      {
        id: 'citi',
        title: 'Human Research, Data or Specimens Only Research, Basic Course',
        org: 'CITI Program',
        dates: 'Oct 2026, valid until Oct 2029',
        links: [
          {
            label: 'Verify on CITI',
            href: 'https://www.citiprogram.org/verify/?w53c5f1e3-cab3-43f4-93a6-fa3216859bce-80555556',
          },
        ],
      },
      {
        id: 'ta-training-camp',
        title: 'Teaching Assistant Training Camp',
        org: 'NTHU Center for Teaching and Learning Development',
        dates: 'Aug 2026',
        lines: ['9.5 hours.'],
        certificate: taCertificate,
      },
      {
        id: 'youth-speak-forum',
        title: 'National Youth Speak Forum 2026, delegate',
        org: 'AIESEC in Taiwan, Taipei',
        dates: 'Jan 2026',
        certificate: forumCertificate,
        photo: {
          src: forumPhoto,
          alt: 'Delegates in formal wear working on laptops at long tables in a hotel conference room.',
        },
      },
    ],
  },
  {
    id: 'languages',
    title: 'Languages',
    entries: [
      {
        id: 'english',
        title: 'English',
        lines: [
          'IELTS Academic 7.5 overall, CEFR C1 (Sep 2023). Listening 8.5, Reading 8.5, Writing 7.0, Speaking 6.5.',
        ],
      },
      { id: 'indonesian', title: 'Indonesian' },
      { id: 'mandarin', title: 'Mandarin' },
    ],
  },
];

/** The three facts on the Overview. Each links to its entry here. */
export const highlights = [
  { label: '1st place, Vibe Coding Youth Hackathon 2026', id: 'hackathon-1st-place' },
  { label: 'Taiwan Outstanding Scholarship, 2024 to 2028', id: 'taiwan-outstanding-scholarship' },
  { label: 'GPA 4.1/4.3 at NTHU', id: 'nthu' },
];

/** The roles held now, for the Overview. */
export const currentRoles = groups[0]!.entries.filter((e) => e.dates?.endsWith('to present'));
