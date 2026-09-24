import { prisma } from '../lib/prisma.js';
import { AppError } from '../errors.js';
import { publicUserSelect, toPublicUser } from '../domain/public-user.js';

export interface PublicProfileAchievement {
  id: string;
  name: string;
  description: string;
  criterion: string;
}

export function deriveAchievements(stats: {
  intentsCreated: number;
  intentsRealized: number;
  realizedParticipationsCount: number;
}): PublicProfileAchievement[] {
  const achievements: PublicProfileAchievement[] = [];
  if (stats.intentsCreated >= 1) {
    achievements.push({
      id: 'first-intent-created',
      name: 'Primeira Intent',
      description: 'Criou sua primeira Intent pública.',
      criterion: 'Ao criar pelo menos uma Intent pública.',
    });
  }
  if (stats.intentsRealized >= 1) {
    achievements.push({
      id: 'first-intent-realized',
      name: 'Primeira Intent realizada',
      description: 'Teve sua primeira Intent pública realizada.',
      criterion: 'Ao realizar pelo menos uma Intent pública.',
    });
  }
  if (stats.intentsRealized >= 5) {
    achievements.push({
      id: 'five-intents-realized',
      name: 'Cinco Intents realizadas',
      description: 'Teve cinco Intents públicas realizadas.',
      criterion: 'Ao realizar pelo menos cinco Intents públicas.',
    });
  }
  if (stats.intentsRealized >= 10) {
    achievements.push({
      id: 'ten-intents-realized',
      name: 'Dez Intents realizadas',
      description: 'Teve dez Intents públicas realizadas.',
      criterion: 'Ao realizar pelo menos dez Intents públicas.',
    });
  }
  if (stats.realizedParticipationsCount >= 1) {
    achievements.push({
      id: 'first-realized-participation',
      name: 'Primeira participação realizada',
      description: 'Participou de uma Intent pública realizada.',
      criterion: 'Ao participar de pelo menos uma Intent pública realizada.',
    });
  }
  return achievements;
}

export async function getPublicUserProfile(userId: string, viewerId?: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId, status: 'ACTIVE' },
    select: publicUserSelect,
  });
  if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'Perfil não encontrado.');

  const scope = {
    creatorId: userId,
    visibility: 'PUBLIC',
    status: { in: ['PUBLISHED', 'REALIZED'] },
    creator: { status: 'ACTIVE' },
  };

  // Public aggregates must not reveal activity in private/followers-only Intents.
  const participationScope = {
    visibility: 'PUBLIC',
    status: { in: ['PUBLISHED', 'REALIZED'] },
    creator: { status: 'ACTIVE' },
  };

  const isMe = Boolean(viewerId && userId === viewerId);

  const [
    intentsCreated,
    intentsRealized,
    totalSupportReceived,
    totalReactionsReceived,
    totalCommentsReceived,
    followersCount,
    followingCount,
    followRelation,
    intents,
    supportedIntentsCount,
    reactionsGivenCount,
    commentsGivenCount,
    realizedParticipationsCount,
  ] = await Promise.all([
    prisma.intent.count({ where: scope }),
    prisma.intent.count({ where: { ...scope, status: 'REALIZED' } }),
    prisma.support.count({ where: { intent: scope } }),
    prisma.intentReaction.count({ where: { intent: scope } }),
    prisma.intentComment.count({ where: { intent: scope, author: { status: 'ACTIVE' } } }),
    prisma.follow.count({ where: { followingId: userId, follower: { status: 'ACTIVE' } } }),
    prisma.follow.count({ where: { followerId: userId, following: { status: 'ACTIVE' } } }),
    viewerId && !isMe
      ? prisma.follow.findUnique({
          where: { followerId_followingId: { followerId: viewerId, followingId: userId } },
          select: { id: true },
        })
      : Promise.resolve(null),
    prisma.intent.findMany({
      where: scope,
      take: 20,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: {
        id: true,
        title: true,
        story: true,
        status: true,
        createdAt: true,
        supportCount: true,
      },
    }),
    prisma.support.count({ where: { userId, intent: participationScope } }),
    prisma.intentReaction.count({ where: { userId, intent: participationScope } }),
    prisma.intentComment.count({ where: { authorId: userId, intent: participationScope } }),
    prisma.intent.count({
      where: {
        ...participationScope,
        status: 'REALIZED',
        OR: [
          { supports: { some: { userId } } },
          { comments: { some: { authorId: userId } } },
          { reactions: { some: { userId } } },
        ],
      },
    }),
  ]);

  const stats = {
    publicIntentsCount: intentsCreated,
    intentsCreated,
    intentsRealized,
    realizationEligibleCount: intentsCreated,
    realizationRate: intentsCreated > 0 ? intentsRealized / intentsCreated : null,
    totalSupportReceived,
    totalReactionsReceived,
    totalCommentsReceived,
    followersCount,
    followingCount,
    supportedIntentsCount,
    reactionsGivenCount,
    commentsGivenCount,
    realizedParticipationsCount,
  };

  return {
    ...toPublicUser(user),
    isMe,
    viewerIsFollowing: Boolean(followRelation),
    stats,
    achievements: deriveAchievements(stats),
    intents,
  };
}
