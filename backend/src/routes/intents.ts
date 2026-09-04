import { Router } from 'express';
import { z } from 'zod';
import { createIntentSchema } from '../domain/intent-schemas.js';
import { optionalAuthenticatedUser, requireAuthenticatedUser } from '../middleware/auth.js';
import {
  createIntent,
  getIntent,
  listUserIntents,
  listPublicFeed,
  supportIntent,
} from '../services/intent-service.js';

export const intentsRouter = Router();

const identifierSchema = z.string().uuid();

intentsRouter.get('/feed', async (request, response, next) => {
  try {
    const cursor = typeof request.query.cursor === 'string' ? request.query.cursor : undefined;
    const limit = typeof request.query.limit === 'string' ? Number(request.query.limit) : 20;
    const feed = await listPublicFeed(cursor, Number.isFinite(limit) ? limit : 20);
    response.json({ data: feed });
  } catch (error) {
    next(error);
  }
});

intentsRouter.get('/mine', requireAuthenticatedUser, async (request, response, next) => {
  try {
    const cursor = typeof request.query.cursor === 'string' ? request.query.cursor : undefined;
    const limit = typeof request.query.limit === 'string' ? Number(request.query.limit) : 20;
    const intents = await listUserIntents(
      request.appUser!.id,
      cursor,
      Number.isFinite(limit) ? limit : 20,
    );
    response.json({ data: intents });
  } catch (error) {
    next(error);
  }
});

intentsRouter.get('/:id', optionalAuthenticatedUser, async (request, response, next) => {
  try {
    const intentId = identifierSchema.parse(request.params.id);
    const intent = await getIntent(intentId, request.appUser?.id);
    response.json({ data: intent });
  } catch (error) {
    next(error);
  }
});

intentsRouter.post('/', requireAuthenticatedUser, async (request, response, next) => {
  try {
    const command = createIntentSchema.parse(request.body);
    const intent = await createIntent(request.appUser!.id, command);
    response.status(201).json({ data: intent });
  } catch (error) {
    next(error);
  }
});

intentsRouter.post('/:id/supports', requireAuthenticatedUser, async (request, response, next) => {
  try {
    const intentId = identifierSchema.parse(request.params.id);
    const result = await supportIntent(intentId, request.appUser!.id);
    response.status(201).json({ data: result });
  } catch (error) {
    next(error);
  }
});
