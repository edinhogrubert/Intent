import { Prisma } from '@prisma/client';
import { AppError } from '../errors.js';
import { prisma } from '../lib/prisma.js';

const profileIntentSelection = {
  id: true,
  type: true,
  status: true,
  visibility: true,
  category: true,
  title: true,
  story: true,
  supportGoal: true,
  supportCount: true,
  publishedAt: true,
  realizedAt: true,
  createdAt: true,
  creator: {
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
    },
  },
} as Prisma.IntentSelect;

export function calculateRealizationRate(intentsCreated: number, intentsRealized: number): number {
  if (intentsCreated <= 0) return 0;
  return Math.round((intentsRealized * 100) / intentsCreated);
}

export async function getSocialProfile(targetUserId: string, viewerUserId: string) {
  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: {
      id: true,
      username: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      status: true,
      createdAt: true,
    },
  });

  if (!user || user.status !== 'ACTIVE') {
    throw new AppError(404, 'USER_NOT_FOUND', 'Perfil não encontrado.');
  }

  const isMe = targetUserId === viewerUserId;
  const createdIntentScope: Prisma.IntentWhereInput = {
    creatorId: targetUserId,
    ...(!isMe ? { visibility: 'PUBLIC' } : {}),
  };
  const supportedIntentScope: Prisma.SupportWhereInput = {
    userId: targetUserId,
    ...(!isMe ? { intent: { visibility: 'PUBLIC' } } : {}),
  };
  const receivedSupportScope: Prisma.SupportWhereInput = {
    intent: {
      creatorId: targetUserId,
      ...(!isMe ? { visibility: 'PUBLIC' } : {}),
    },
  };

  const [
    intentsCreated,
    intentsRealized,
    followersCount,
    followingCount,
    supportsGiven,
    supportsReceived,
    followingRelation,
    recentIntents,
  ] = await Promise.all([
    prisma.intent.count({ where: createdIntentScope }),
    prisma.intent.count({ where: { ...createdIntentScope, status: 'REALIZED' } }),
    prisma.follow.count({ where: { followingId: targetUserId } }),
    prisma.follow.count({ where: { followerId: targetUserId } }),
    prisma.support.count({ where: supportedIntentScope }),
    prisma.support.count({ where: receivedSupportScope }),
    isMe
      ? Promise.resolve(null)
      : prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: viewerUserId,
              followingId: targetUserId,
            },
          },
          select: { id: true },
        }),
    prisma.intent.findMany({
      where: {
        creatorId: targetUserId,
        visibility: 'PUBLIC',
        status: { in: ['PUBLISHED', 'REALIZED'] },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: 10,
      select: profileIntentSelection,
    }),
  ]);

  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    isMe,
    isFollowing: Boolean(followingRelation),
    stats: {
      intentsCreated,
      intentsRealized,
      followersCount,
      followingCount,
      supportsGiven,
      supportsReceived,
      realizationRate: calculateRealizationRate(intentsCreated, intentsRealized),
    },
    recentIntents,
  };
}

export async function followUser(followerId: string, followingId: string) {
  if (followerId === followingId) {
    throw new AppError(409, 'SELF_FOLLOW_NOT_ALLOWED', 'Você não pode seguir a própria conta.');
  }

  const target = await prisma.user.findUnique({
    where: { id: followingId },
    select: { id: true, status: true },
  });

  if (!target || target.status !== 'ACTIVE') {
    throw new AppError(404, 'USER_NOT_FOUND', 'Perfil não encontrado.');
  }

  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId, followingId } },
    create: { followerId, followingId },
    update: {},
  });

  return getSocialProfile(followingId, followerId);
}

export async function unfollowUser(followerId: string, followingId: string) {
  if (followerId === followingId) {
    throw new AppError(409, 'SELF_FOLLOW_NOT_ALLOWED', 'Você não pode deixar de seguir a própria conta.');
  }

  await prisma.follow.deleteMany({ where: { followerId, followingId } });
  return getSocialProfile(followingId, followerId);
}
