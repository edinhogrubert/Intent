import { Router } from 'express';
import { z } from 'zod';
import { requireAuthenticatedUser } from '../middleware/auth.js';
import { searchIntentsAndUsers } from '../services/search-service.js';

export const searchRouter = Router();
const searchQuerySchema = z.object({
  q: z.string().trim().min(2).max(80),
  limit: z.coerce.number().int().min(1).max(20).default(10),
}).strict();

searchRouter.get('/', requireAuthenticatedUser, async (request, response, next) => {
  try {
    const query = searchQuerySchema.parse(request.query);
    const results = await searchIntentsAndUsers(request.appUser!.id, query.q, query.limit);
    response.json({ data: results });
  } catch (error) {
    next(error);
  }
});
