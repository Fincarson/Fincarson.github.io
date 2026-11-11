import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      slug: z.string(),
      order: z.number().int(),
      featured: z.boolean().default(false),
      /** The one-line description under the title. */
      summary: z.string(),
      /* The project page: facts only. An empty list leaves its
         section out; never fill one in without a source. */
      /** "Description": paragraphs, set justified. */
      about: z.array(z.string()).default([]),
      /** "How to play", or "How to use" for an app. Numbered when the items are steps in order. */
      play: z.array(z.string()).default([]),
      playHeading: z.enum(['How to play', 'How to use']).default('How to play'),
      playSteps: z.boolean().default(false),
      /** "How I built it" when solo, otherwise "How we built it". */
      built: z.array(z.string()).default([]),
      solo: z.boolean().default(false),
      /** "The team" */
      members: z.array(z.string()).default([]),
      stack: z.array(z.string()).min(1),
      repo: z.url(),
      video: z.object({ label: z.string(), url: z.url() }).optional(),
      /** The first picture is the project's picture everywhere. `pixel` keeps pixel art crisp when enlarged. */
      media: z.array(z.object({ src: image(), alt: z.string(), pixel: z.boolean().default(false) })).min(1),
    }),
});

export const collections = { projects };
