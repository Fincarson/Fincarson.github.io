// Everything on the Education tab, newest first inside each group.
// Adding an entry is one object here, in the same shape as on Experience.
import type { Group } from './experience';
import { nthu } from './site.config';
import graduationPhoto from './assets/experience/high-school-graduation.webp';
import taCertificate from './assets/experience/certificates/ta-training-camp.webp';

export const groups: Group[] = [
  {
    id: 'schools',
    title: 'Schools',
    entries: [
      {
        id: 'nthu',
        title: 'National Tsing Hua University (NTHU)',
        org: "Bachelor's degree, Computer Science",
        dates: 'Sep 2024 to Jun 2028',
        button: { label: 'NTHU', href: nthu.base },
        points: [
          'GPA 4.1/4.3',
          'Upcoming undergraduate research with Prof. Chiu Te-Chuan on applying large language models to security and resilience tasks',
          'Relevant coursework: Computer Networks, Data Structures, Software Studio, Hardware Design and Lab, Computer Architecture, Logic Design, Probability, Linear Algebra, Discrete Mathematics, Introduction to Programming I and II, Programming in Python',
        ],
      },
      {
        id: 'high-school',
        title: 'SMAK 2 BPK PENABUR Bandung',
        org: 'High school diploma',
        dates: 'Jul 2021 to Jun 2024',
        points: [
          'Final grade 91.19/100',
          '2LCB: a leadership, public speaking and communication program; organized events and served as MC with outside organizations',
          'Project Next: built an HTML/CSS website and presented it to Maranatha officials',
          "OSN Informatics: Indonesia's National Science Olympiad, in C++",
        ],
        photo: {
          src: graduationPhoto,
          alt: 'Vincent Jefferson in a navy suit with a graduation medal, holding his diploma folder and shaking hands on stage at the SMAK 2 BPK PENABUR graduation in Bandung, 15 June 2024.',
        },
      },
    ],
  },
  {
    id: 'courses',
    title: 'Courses and certifications',
    entries: [
      {
        id: 'citi',
        title: 'CITI Program: Human Research, Data or Specimens Only Research (Basic Course)',
        dates: 'Oct 2026, valid until Oct 2029',
        lead: 'The basic course in human research ethics, under requirements set by MIT Affiliates.',
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
        lead: 'Two days, 25 to 26 August 2026, 9.5 hours. Topics:',
        points: [
          'TA ethics in the AI era',
          'Experience from outstanding TAs and tutors',
          'Presentation structure and logical expression',
          'Gender equality in teaching',
          'Communication, guidance and facilitation as a TA',
          'English-medium instruction (EMI): TA roles, strategies and challenges',
        ],
        certificate: taCertificate,
      },
    ],
  },
];
