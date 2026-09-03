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
  supportGoal: number;
  revealContent: string;
  visibility: 'PUBLIC' | 'FOLLOWERS' | 'PRIVATE';
}

const publicIntentSelection = {
  id: true,
  type: true,
  status: true,
  visibility: true,
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
} satisfies Prisma.IntentSelect;

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
        supportGoal: command.supportGoal,
        visibility: command.visibility,
        revealCiphertext: sealed.ciphertext,
        revealIv: sealed.iv,
        revealAuthTag: sealed.authTag,
        revealVersion,
      },
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
          visibility: command.visibility,
          revealVersion,
        },
      },
    });

    return intent;
  });
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

  if (intent.visibility !== 'PUBLIC' && intent.creatorId !== viewerId) {
    throw new AppError(403, 'INTENT_FORBIDDEN', 'Você não pode acessar esta Intent.');
  }

  const {
    revealCiphertext,
    revealIv,
    revealAuthTag,
    ...publicIntent
  } = intent;

  if (intent.status !== 'REALIZED') {
    return { ...publicIntent, revealContent: null };
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

  return { ...publicIntent, revealContent };
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
