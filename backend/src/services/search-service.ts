import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

const searchIntentSelect = {
  id: true,
  type: true,
  conditionType: true,
  status: true,
  visibility: true,
  category: true,
  title: true,
  story: true,
  supportGoal: true,
  supportCount: true,
  revealAt: true,
  guardianApprovalGoal: true,
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
} satisfies Prisma.IntentSelect;

const searchUserSelect = {
  id: true,
  username: true,
  displayName: true,
  bio: true,
  avatarUrl: true,
} satisfies Prisma.UserSelect;

type SearchIntent = Prisma.IntentGetPayload<{ select: typeof searchIntentSelect }>;
type SearchUser = Prisma.UserGetPayload<{ select: typeof searchUserSelect }>;

function toSearchIntent(intent: SearchIntent) {
  return {
    id: intent.id,
    type: intent.type,
    conditionType: intent.conditionType,
    status: intent.status,
    visibility: intent.visibility,
    category: intent.category,
    title: intent.title,
    story: intent.story,
    supportGoal: intent.supportGoal,
    supportCount: intent.supportCount,
    revealAt: intent.revealAt,
    guardianApprovalGoal: intent.guardianApprovalGoal,
    publishedAt: intent.publishedAt,
    realizedAt: intent.realizedAt,
    createdAt: intent.createdAt,
    creator: {
      id: intent.creator.id,
      username: intent.creator.username,
      displayName: intent.creator.displayName,
      avatarUrl: intent.creator.avatarUrl,
    },
  };
}

function toSearchUser(user: SearchUser) {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
  };
}

export async function searchIntentsAndUsers(viewerId: string, text: string, limit = 10) {
  const query = text.trim();
  const usernameQuery = query.replace(/^@+/, '');
  const safeLimit = Math.min(Math.max(limit, 1), 20);

  const [intents, users] = await Promise.all([
    prisma.intent.findMany({
      where: {
        status: { in: ['PUBLISHED', 'REALIZED'] },
        creator: { status: 'ACTIVE' },
        AND: [
          {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { story: { contains: query, mode: 'insensitive' } },
              { creator: { displayName: { contains: query, mode: 'insensitive' } } },
              { creator: { username: { contains: usernameQuery, mode: 'insensitive' } } },
            ],
          },
          {
            OR: [
              { visibility: 'PUBLIC' },
              { creatorId: viewerId },
              {
                visibility: 'FOLLOWERS',
                creator: { followers: { some: { followerId: viewerId } } },
              },
              {
                visibility: 'PRIVATE',
                conditionType: 'GUARDIANS',
                guardianIds: { array_contains: [viewerId] },
              },
            ],
          },
        ],
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: safeLimit,
      select: searchIntentSelect,
    }),
    prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { displayName: { contains: query, mode: 'insensitive' } },
          { username: { contains: usernameQuery, mode: 'insensitive' } },
        ],
      },
      orderBy: [{ displayName: 'asc' }, { id: 'asc' }],
      take: safeLimit,
      select: searchUserSelect,
    }),
  ]);

  return {
    intents: intents.map(toSearchIntent),
    users: users.map(toSearchUser),
  };
}
