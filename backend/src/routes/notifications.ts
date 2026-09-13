import { Router } from 'express';
import { z } from 'zod';
import { requireAuthenticatedUser } from '../middleware/auth.js';
import { listNotifications, markNotificationRead } from '../services/notification-service.js';

export const notificationsRouter = Router();
const identifierSchema = z.string().uuid();
const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(50),
}).strict();
const emptyBodySchema = z.object({}).strict();

notificationsRouter.use(requireAuthenticatedUser);

notificationsRouter.get('/', async (request, response, next) => {
  try {
    const query = listQuerySchema.parse(request.query);
    const notifications = await listNotifications(request.appUser!.id, query.limit);
    response.json({ data: { items: notifications } });
  } catch (error) {
    next(error);
  }
});

notificationsRouter.patch('/:id/read', async (request, response, next) => {
  try {
    const notificationId = identifierSchema.parse(request.params.id);
    emptyBodySchema.parse(request.body ?? {});
    const notification = await markNotificationRead(request.appUser!.id, notificationId);
    response.json({ data: notification });
  } catch (error) {
    next(error);
  }
});
