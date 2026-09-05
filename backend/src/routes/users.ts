import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { requireAuthenticatedUser } from '../middleware/auth.js';
import { updateProfileSchema } from '../domain/intent-schemas.js';
import { prisma } from '../lib/prisma.js';
import { followUser, getSocialProfile, unfollowUser } from '../services/social-service.js';

export const usersRouter = Router();
const userIdSchema = z.string().uuid();

usersRouter.use(requireAuthenticatedUser);

usersRouter.post('/me/sync', (request, response) => {
  response.status(200).json({ data: request.appUser });
});

usersRouter.get('/me', (request, response) => {
  response.json({ data: request.appUser });
});

usersRouter.get('/me/social', async (request, response, next) => {
  try {
    const profile = await getSocialProfile(request.appUser!.id, request.appUser!.id);
    response.json({ data: profile });
  } catch (error) {
    next(error);
  }
});

usersRouter.get('/:id/social', async (request, response, next) => {
  try {
    const userId = userIdSchema.parse(request.params.id);
    const profile = await getSocialProfile(userId, request.appUser!.id);
    response.json({ data: profile });
  } catch (error) {
    next(error);
  }
});

usersRouter.post('/:id/follow', async (request, response, next) => {
  try {
    const userId = userIdSchema.parse(request.params.id);
    const profile = await followUser(request.appUser!.id, userId);
    response.status(201).json({ data: profile });
  } catch (error) {
    next(error);
  }
});

usersRouter.delete('/:id/follow', async (request, response, next) => {
  try {
    const userId = userIdSchema.parse(request.params.id);
    const profile = await unfollowUser(request.appUser!.id, userId);
    response.json({ data: profile });
  } catch (error) {
    next(error);
  }
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
