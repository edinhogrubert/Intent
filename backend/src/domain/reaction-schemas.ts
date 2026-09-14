import { z } from 'zod';

export const reactionTypeSchema = z.enum(['LIKE', 'LOVE', 'CELEBRATE']);
export type ReactionType = z.infer<typeof reactionTypeSchema>;

export const setReactionSchema = z.object({
  type: reactionTypeSchema,
}).strict();
