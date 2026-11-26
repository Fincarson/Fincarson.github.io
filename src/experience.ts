// Everything on the Experience tab, newest first inside each group.
// Adding an entry is one object here. A photo is optional (at most one);
// a certificate is linked as a picture, never shown on the page.
import type { ImageMetadata } from 'astro';
import { projectPath } from './site.config';
import scholarshipPhoto from './assets/experience/scholarship-group-photo.webp';
import forumPhoto from './assets/experience/youth-speak-forum.webp';
import hackathonCertificate from './assets/experience/certificates/hackathon-first-place.webp';
import scholarshipCertificate from './assets/experience/certificates/scholarship.webp';
import forumCertificate from './assets/experience/certificates/youth-speak-forum.webp';

export interface Entry {
  id: string;
  title: string;
  /** The line under the title: organization, then place, then dates. */
  org?: string;
  place?: string;
  dates?: string;
  /** One sentence before the bullets. */
  lead?: string;
  points?: string[];
  links?: { label: string; href: string }[];
  certificate?: ImageMetadata;
  photo?: { src: ImageMetadata; alt: string };
  /** One button under the entry, to a page of this site. */
  button?: { label: string; href: string };
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
        place: 'Hsinchu',
        dates: 'Sep 2026 to present',
        lead: 'Sole TA for Classics in Literature: Selected Readings of Western Classical Poetry, a general education course with 69 students.',
        points: [
          'Main contact between international students and the professor on assignments, workload and course expectations',
          'Grade the midterm exams, and collect and summarize individual and group homework',
          'Form the final presentation teams and track attendance and leave requests',
          "Point students to the slides, readings and course materials on the university's online learning platform",
        ],
      },
      {
        id: 'aiesec',
        title: 'Strategic Planner, Incoming Global Talent team',
        org: 'AIESEC Hsinchu (AIESEC in Taiwan)',
        place: 'Hsinchu',
        dates: 'Mar 2026 to present',
        lead: 'AIESEC Hsinchu is a local committee of about 50 students that places international young professionals in internships at companies in Taiwan.',
        points: [
          'Set team targets with department leadership and turn them into weekly and monthly action plans',
          'Track progress on partnerships, open positions and intern placements, and report the results to leadership',
          'Find what slows the team down, adjust the plans, and coach teammates through regular check-ins',
        ],
      },
      {
        id: 'class-representative-assembly',
        title: 'Member, Class Representative Assembly',
        org: 'SMAK 2 BPK PENABUR Bandung',
        dates: 'Jul 2022 to Jun 2023',
        points: [
          'Represented my class in council meetings, bringing student concerns and suggestions',
          "Reviewed the Student Council's programs and budget proposals",
          'Helped plan and run school events with the Student Council',
        ],
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
        lead: 'Won as Team "Katherine Johnson" with Louise Davise and Alicia Joely. We built NTHU FlashEat, a campus cafeteria pre-order app, in one afternoon on Newly; I wrote every prompt the app was built from.',
        points: [
          'Part of the Global Vibe Coding Youth Tour, hosted at NTHU with NTHU EECS-GSA, NTHU IBPSA and the NTHU IBBA Student Association',
        ],
        links: [{ label: 'NTHU FlashEat project page', href: projectPath('nthu-flasheat') }],
        certificate: hackathonCertificate,
      },
      {
        id: 'favorite-game-award',
        title: 'Favorite Game award',
        org: 'Indie game hackathon at NTHU',
        dates: '2024',
        lead: 'For Panda Tales, a 2.5D action game I wrote in C with Allegro 5.',
        links: [{ label: 'Panda Tales project page', href: projectPath('panda-tales') }],
      },
      {
        id: 'taiwan-outstanding-scholarship',
        title: 'Taiwan Outstanding Scholarship',
        org: 'Overseas Community Affairs Council (OCAC)',
        place: 'Taiwan',
        dates: 'Aug 2024',
        lead: "Awarded to pursue my bachelor's degree at NTHU, 2024 to 2028.",
        points: ['Presented by the West Java Mandarin Education Coordinating Body (BKPBM Jabar) on 21 August 2024'],
        certificate: scholarshipCertificate,
        photo: {
          src: scholarshipPhoto,
          alt: 'With fellow recipients from West Java before leaving to study in Taiwan: ten people standing in front of a wall painting of Chinese pavilions.',
        },
      },
      {
        id: 'ui-ux-iot-competition',
        title: '4th Runner-Up, UI/UX Design for IoT Mobile Apps Competition',
        org: 'Universitas Kristen Maranatha',
        dates: 'Feb 2023',
        lead: "With my team (Bisa Team), designed the user interface for a smart schooling IoT mobile app, in a competition run by the university's Industrial Engineering program.",
      },
      {
        id: 'iot-competition',
        title: '5th Runner-Up, Maranatha IoT Competition',
        org: 'Universitas Kristen Maranatha',
        dates: 'Feb 2023',
        lead: "Built an Arduino smart house with an automatic door and a gate that detects cars, in a competition run by the university's Electrical Engineering program.",
      },
    ],
  },
  {
    id: 'organizations',
    title: 'Organizations and events',
    entries: [
      {
        id: 'youth-speak-forum',
        title: 'National Youth Speak Forum 2026, delegate',
        org: 'AIESEC in Taiwan',
        place: 'Taipei',
        dates: 'Jan 2026',
        points: [
          'In the workshop session, our team turned its idea into an app prototype with Google AI tools',
          'We then talked the idea through with an industry mentor',
        ],
        certificate: forumCertificate,
        photo: {
          src: forumPhoto,
          alt: 'Delegates in formal wear working on laptops at long tables in a hotel conference room.',
        },
      },
      {
        id: 'oc-hisa',
        title: 'OC-HISA (Overseas Chinese Hsinchu Indonesian Student Association)',
        org: 'Member',
        dates: 'Sep 2024 to May 2025',
        lead: 'Part of the Indonesian student community in Hsinchu: staying connected with fellow Indonesian students, sharing what studying abroad is like, and helping newer students settle into life in Taiwan.',
      },
    ],
  },
];

/** The line under an entry's title. */
export const meta = (entry: Entry) => [entry.org, entry.place, entry.dates].filter(Boolean).join(', ');

/** Home's summary: the roles held now, two awards and the schools.
 *  Each line is a name in bold and the rest after it; a role has one short
 *  line under it. The full entries are above. */
export const home = {
  roles: [
    {
      name: 'Teaching Assistant',
      rest: 'NTHU, Sep 2026 to present',
      note: 'Sole TA for a general education course with 69 students.',
    },
    {
      name: 'Strategic Planner, Incoming Global Talent team',
      rest: 'AIESEC Hsinchu, Mar 2026 to present',
      note: 'Plan targets and track progress for a team that places international interns at companies in Taiwan.',
    },
  ],
  awards: [
    { name: '1st place, Vibe Coding Youth Hackathon', rest: ' (Women in Tech Global and Newly), Oct 2026' },
    { name: 'Taiwan Outstanding Scholarship', rest: ' (OCAC), 2024 to 2028' },
  ],
  schools: [
    {
      name: 'National Tsing Hua University (NTHU)',
      rest: ", Bachelor's degree in Computer Science, 2024 to 2028",
    },
    { name: 'SMAK 2 BPK PENABUR Bandung', rest: ', high school, 2021 to 2024' },
  ],
};
