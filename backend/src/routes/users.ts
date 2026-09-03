import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { requireAuthenticatedUser } from '../middleware/auth.js';
import { updateProfileSchema } from '../domain/intent-schemas.js';
import { prisma } from '../lib/prisma.js';

export const usersRouter = Router();

usersRouter.use(requireAuthenticatedUser);

usersRouter.post('/me/sync', (request, response) => {
  response.status(200).json({ data: request.appUser });
});

usersRouter.get('/me', (request, response) => {
  response.json({ data: request.appUser });
});

usersRouter.patch('/me', async (request, response, next) => {
  try {
    const changes = updateProfileSchema.parse(request.body);
    const data: Prisma.UserUpdateInput = {};
    if (changes.username !== undefined) data.username = changes.username;
    if (changes.displayName !== undefined) data.displayName = changes.displayName;
    if (changes.bio !== undefined) data.bio = changes.bio;
    if (changes.avatarUrl !== undefined) data.avatarUrl = changes.avatarUrl;

    const user = await prisma.user.update({
      where: { id: request.appUser!.id },
      data,
    });
    response.json({ data: user });
  } catch (error) {
    next(error);
  }
});
