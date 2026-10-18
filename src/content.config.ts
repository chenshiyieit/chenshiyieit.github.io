import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    locale: z.enum(['en', 'zh']),
    page: z.enum(['home', 'biography', 'research', 'publications', 'people', 'gallery', 'alumni']),
    title: z.string(),
    description: z.string(),
    eyebrow: z.string(),
  }),
});

const publications = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/publications' }),
  schema: z.object({
    title: z.string(),
    authors: z.string(),
    year: z.number().int().min(1900).max(2100),
    venue: z.string(),
    volume: z.string().optional(),
    pages: z.string().optional(),
    doi: z.url().optional(),
    source: z.url(),
    selected: z.boolean().default(false),
    selectedRank: z.number().int().positive().optional(),
    kind: z.enum(['article', 'preprint']).default('article'),
  }),
});

const people = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/people' }),
  schema: z.object({
    name: z.string(),
    nameZh: z.string(),
    group: z.enum(['peking', 'sjtu-eit', 'polyu-eit']),
    role: z.string(),
    roleZh: z.string(),
    description: z.string(),
    descriptionZh: z.string(),
    image: z.string().optional(),
    homepage: z.url().optional(),
    homepageLabel: z.string().default('Personal homepage'),
    homepageLabelZh: z.string().default('个人主页'),
    order: z.number(),
    last: z.boolean().default(false),
    pi: z.boolean().default(false),
  }),
});

const gallery = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/gallery' }),
  schema: z.object({
    title: z.string(),
    titleZh: z.string(),
    caption: z.string(),
    captionZh: z.string(),
    image: z.string(),
    source: z.url(),
    order: z.number(),
  }),
});

const profile = defineCollection({
  loader: glob({ pattern: 'profile.md', base: './src/content' }),
  schema: z.object({
    name: z.string(), nameZh: z.string(),
    position: z.string(), positionZh: z.string(),
    academy: z.string(), academyZh: z.string(),
    institution: z.string(), institutionZh: z.string(),
    institutionUrl: z.url(), universityProfile: z.url(),
    email: z.email(), image: z.string(),
    address: z.array(z.string()), addressZh: z.array(z.string()),
  }),
});

export const collections = { pages, publications, people, gallery, profile };
