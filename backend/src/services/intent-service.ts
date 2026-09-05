import { randomUUID } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { config } from '../config.js';
import { AppError } from '../errors.js';
import { prisma } from '../lib/prisma.js';
import { openReveal, revealAssociatedData, sealReveal } from '../domain/reveal-crypto.js';
import { isSupportConditionSatisfied } from '../domain/support-condition.js';

interface CreateIntentCommand {
  title: string;
  story: string;
  category: string;
  supportGoal: number;
  revealContent: string;
  visibility: 'PUBLIC' | 'FOLLOWERS' | 'PRIVATE';
}

const publicIntentSelection = {
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

export async function createIntent(creatorId: string, command: CreateIntentCommand) {
  const intentId = randomUUID();
  const revealVersion = 1;
  const sealed = sealReveal(
    command.revealContent,
    config.revealEncryptionKey,
    revealAssociatedData(intentId, revealVersion),
  );

  return prisma.$transaction(async (transaction) => {
    const intent = await transaction.intent.create({
      data: {
        id: intentId,
        creatorId,
        title: command.title,
        story: command.story,
        category: command.category,
        supportGoal: command.supportGoal,
        visibility: command.visibility,
        revealCiphertext: sealed.ciphertext,
        revealIv: sealed.iv,
        revealAuthTag: sealed.authTag,
        revealVersion,
      } as Prisma.IntentUncheckedCreateInput,
      select: publicIntentSelection,
    });

    await transaction.domainEvent.create({
      data: {
        intentId,
        actorId: creatorId,
        type: 'INTENT_CREATED',
        idempotencyKey: `intent-created:${intentId}:v1`,
        payload: {
          type: 'SUPPORT_REVEAL',
          supportGoal: command.supportGoal,
          category: command.category,
          visibility: command.visibility,
          revealVersion,
        },
      },
    });

    return intent;
  });
}

export async function listUserIntents(creatorId: string, cursor?: string, limit = 20) {
  const safeLimit = Math.min(Math.max(limit, 1), 50);
  const items = await prisma.intent.findMany({
    where: { creatorId },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: safeLimit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: publicIntentSelection,
  });

  const hasMore = items.length > safeLimit;
  const page = hasMore ? items.slice(0, safeLimit) : items;

  return {
    items: page,
    nextCursor: hasMore ? page.at(-1)?.id ?? null : null,
  };
}

export async function listPublicFeed(cursor?: string, limit = 20) {
  const safeLimit = Math.min(Math.max(limit, 1), 50);
  const items = await prisma.intent.findMany({
    where: {
      visibility: 'PUBLIC',
      status: { in: ['PUBLISHED', 'REALIZED'] },
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: safeLimit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: publicIntentSelection,
  });

  const hasMore = items.length > safeLimit;
  const page = hasMore ? items.slice(0, safeLimit) : items;

  return {
    items: page,
    nextCursor: hasMore ? page.at(-1)?.id ?? null : null,
  };
}

export async function listFollowingFeed(viewerId: string, cursor?: string, limit = 20) {
  const safeLimit = Math.min(Math.max(limit, 1), 50);
  const items = await prisma.intent.findMany({
    where: {
      visibility: { in: ['PUBLIC', 'FOLLOWERS'] },
      status: { in: ['PUBLISHED', 'REALIZED'] },
      creator: {
        status: 'ACTIVE',
        followers: { some: { followerId: viewerId } },
      },
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: safeLimit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: publicIntentSelection,
  });

  const hasMore = items.length > safeLimit;
  const page = hasMore ? items.slice(0, safeLimit) : items;

  return {
    items: page,
    nextCursor: hasMore ? page.at(-1)?.id ?? null : null,
  };
}

export async function getIntent(intentId: string, viewerId?: string) {
  const intent = await prisma.intent.findUnique({
    where: { id: intentId },
    include: {
      creator: {
        select: { id: true, username: true, displayName: true, avatarUrl: true },
      },
    },
  });

  if (!intent) {
    throw new AppError(404, 'INTENT_NOT_FOUND', 'Intent não encontrada.');
  }

  if (intent.visibility === 'PRIVATE' && intent.creatorId !== viewerId) {
    throw new AppError(403, 'INTENT_FORBIDDEN', 'Você não pode acessar esta Intent.');
  }

  if (intent.visibility === 'FOLLOWERS' && intent.creatorId !== viewerId) {
    const followsCreator = viewerId
      ? await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: viewerId,
              followingId: intent.creatorId,
            },
          },
          select: { id: true },
        })
      : null;

    if (!followsCreator) {
      throw new AppError(403, 'INTENT_FORBIDDEN', 'Esta Intent é visível somente para seguidores.');
    }
  }

  const viewerSupport = viewerId
    ? await prisma.support.findUnique({
        where: { intentId_userId: { intentId, userId: viewerId } },
        select: { id: true },
      })
    : null;

  const {
    revealCiphertext,
    revealIv,
    revealAuthTag,
    ...publicIntent
  } = intent;

  if (intent.status !== 'REALIZED') {
    return { ...publicIntent, revealContent: null, viewerHasSupported: Boolean(viewerSupport) };
  }

  const revealContent = openReveal(
    {
      ciphertext: revealCiphertext,
      iv: revealIv,
      authTag: revealAuthTag,
    },
    config.revealEncryptionKey,
    revealAssociatedData(intent.id, intent.revealVersion),
  );

  return { ...publicIntent, revealContent, viewerHasSupported: Boolean(viewerSupport) };
}

export async function supportIntent(intentId: string, supporterId: string) {
  try {
    return await prisma.$transaction(async (transaction) => {
      const existing = await transaction.intent.findUnique({ where: { id: intentId } });

      if (!existing) {
        throw new AppError(404, 'INTENT_NOT_FOUND', 'Intent não encontrada.');
      }

      if (existing.creatorId === supporterId) {
        throw new AppError(409, 'CREATOR_CANNOT_SUPPORT', 'O criador não pode apoiar a própria Intent.');
      }

      if (existing.status !== 'PUBLISHED') {
        throw new AppError(409, 'INTENT_NOT_OPEN', 'Esta Intent não está aberta para novos apoios.');
      }

      const support = await transaction.support.create({
        data: { intentId, userId: supporterId },
      });

      const updated = await transaction.intent.update({
        where: { id: intentId },
        data: { supportCount: { increment: 1 } },
      });

      await transaction.domainEvent.create({
        data: {
          intentId,
          actorId: supporterId,
          type: 'SUPPORT_RECEIVED',
          idempotencyKey: `support-received:${support.id}`,
          payload: {
            supportId: support.id,
            supportCount: updated.supportCount,
            supportGoal: updated.supportGoal,
          },
        },
      });

      let realizedNow = false;
      if (isSupportConditionSatisfied(updated.supportCount, updated.supportGoal)) {
        const result = await transaction.intent.updateMany({
          where: { id: intentId, status: 'PUBLISHED' },
          data: { status: 'REALIZED', realizedAt: new Date() },
        });

        realizedNow = result.count === 1;

        if (realizedNow) {
          await transaction.domainEvent.create({
            data: {
              intentId,
              actorId: supporterId,
              type: 'INTENT_REALIZED',
              idempotencyKey: `intent-realized:${intentId}:v${updated.revealVersion}`,
              payload: {
                supportCount: updated.supportCount,
                supportGoal: updated.supportGoal,
                revealVersion: updated.revealVersion,
              },
            },
          });
        }
      }

      return {
        intentId,
        supportCount: updated.supportCount,
        supportGoal: updated.supportGoal,
        supported: true,
        realized: realizedNow || updated.status === 'REALIZED',
        realizedNow,
      };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError(409, 'SUPPORT_ALREADY_EXISTS', 'Você já apoiou esta Intent.');
    }
    throw error;
  }
}

export async function removeSupport(intentId: string, supporterId: string) {
  return prisma.$transaction(async (transaction) => {
    const intent = await transaction.intent.findUnique({ where: { id: intentId } });

    if (!intent) {
      throw new AppError(404, 'INTENT_NOT_FOUND', 'Intent não encontrada.');
    }

    if (intent.creatorId === supporterId) {
      throw new AppError(409, 'CREATOR_CANNOT_SUPPORT', 'O criador não participa do apoio à própria Intent.');
    }

    if (intent.status !== 'PUBLISHED') {
      throw new AppError(409, 'SUPPORT_LOCKED_AFTER_REVEAL', 'O apoio não pode ser alterado depois da realização.');
    }

    const support = await transaction.support.findUnique({
      where: { intentId_userId: { intentId, userId: supporterId } },
    });

    if (!support) {
      return {
        intentId,
        supportCount: intent.supportCount,
        supportGoal: intent.supportGoal,
        supported: false,
        removed: false,
        realized: false,
        realizedNow: false,
      };
    }

    await transaction.support.delete({ where: { id: support.id } });
    const updated = await transaction.intent.update({
      where: { id: intentId },
      data: {
        supportCount: intent.supportCount > 0 ? { decrement: 1 } : 0,
      },
    });

    await transaction.domainEvent.create({
      data: {
        intentId,
        actorId: supporterId,
        type: 'SUPPORT_REMOVED',
        idempotencyKey: `support-removed:${support.id}`,
        payload: {
          supportId: support.id,
          supportCount: updated.supportCount,
          supportGoal: updated.supportGoal,
        },
      },
    });

    return {
      intentId,
      supportCount: updated.supportCount,
      supportGoal: updated.supportGoal,
      supported: false,
      removed: true,
      realized: false,
      realizedNow: false,
    };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}
