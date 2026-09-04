import { z } from 'zod';

export const createIntentSchema = z.object({
  title: z.string().trim().min(3).max(160),
  story: z.string().trim().min(3).max(5000),
  category: z.enum([
    'SPORTS',
    'ENTERTAINMENT',
    'TECHNOLOGY',
    'EDUCATION',
    'HEALTH_WELLNESS',
    'CAREER_BUSINESS',
    'COMMUNITY_CAUSES',
    'PERSONAL_LIFE',
    'OTHER',
  ]).default('OTHER'),
  supportGoal: z.number().int().min(1).max(1_000_000),
  revealContent: z.string().min(1).max(10_000),
  visibility: z.enum(['PUBLIC', 'FOLLOWERS', 'PRIVATE']).default('PUBLIC'),
}).strict();

export const updateProfileSchema = z.object({
  username: z.string().trim().regex(/^[a-z0-9_]{3,30}$/).optional(),
  displayName: z.string().trim().min(2).max(120).optional(),
  bio: z.string().trim().max(500).nullable().optional(),
  avatarUrl: z.string().url().max(2048).nullable().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, {
  message: 'Informe ao menos um campo para atualização.',
});
