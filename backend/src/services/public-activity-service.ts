import { prisma } from '../lib/prisma.js';
import { AppError } from '../errors.js';
import { Prisma } from '@prisma/client';

export type PublicActivityType =
  | 'INTENT_CREATED'
  | 'INTENT_SUPPORTED'
  | 'INTENT_REACTED'
  | 'INTENT_COMMENTED'
  | 'INTENT_REALIZED_PARTICIPATION';

export interface PublicActivityItem {
  id: string;
  type: PublicActivityType;
  occurredAt: string;
  metadata?: {
    reactionType?: 'LIKE' | 'LOVE' | 'CELEBRATE';
    commentSnippet?: string;
    supportGoal?: number;
    supportCount?: number;
    realizedAt?: string | null;
  };
  intent: {
    id: string;
    title: string;
    status: string;
    category?: string;
    creator?: {
      id: string;
      username: string;
      displayName: string;
      avatarUrl: string | null;
    };
  };
}

export interface ListPublicActivityResult {
  items: PublicActivityItem[];
  nextCursor: string | null;
}

export function encodeActivityCursor(occurredAt: Date | string, id: string): string {
  const timeStr = typeof occurredAt === 'string' ? new Date(occurredAt).toISOString() : occurredAt.toISOString();
  return Buffer.from(`${timeStr}|${id}`).toString('base64url');
}

const eventPrefixes = ['intent_created', 'intent_supported', 'intent_reacted',
  'intent_commented', 'intent_realized_participation'];

export function decodeActivityCursor(cursor: string): { occurredAt: Date; id: string } | null {
  if (!/^[A-Za-z0-9_-]{1,256}$/.test(cursor)) return null;
  const raw = Buffer.from(cursor, 'base64url').toString('utf8');
  const parts = raw.split('|');
  if (parts.length !== 2) return null;
  const [timeStr, id] = parts as [string, string];
  const occurredAt = new Date(timeStr);
  const [prefix, sourceId, extra] = id.split(':');
  if (!Number.isFinite(occurredAt.getTime()) || occurredAt.toISOString() !== timeStr
    || !eventPrefixes.includes(prefix!) || extra !== undefined
    || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(sourceId ?? '')
    || Buffer.from(raw).toString('base64url') !== cursor) return null;
  return { occurredAt, id };
}

// Apply the global (timestamp DESC, event ID DESC) boundary before each SQL LIMIT.
// UUIDs are canonical lowercase, so raw UUID order matches the suffix order.
function pageBoundary(field: 'createdAt' | 'updatedAt' | 'realizedAt', prefix: string,
  cursor: ReturnType<typeof decodeActivityCursor>) {
  if (!cursor) return {};
  const [cursorPrefix, sourceId] = cursor.id.split(':') as [string, string];
  const older = { [field]: { lt: cursor.occurredAt } };
  if (prefix > cursorPrefix) return older;
  return { OR: [older, { [field]: cursor.occurredAt,
    ...(prefix === cursorPrefix ? { id: { lt: sourceId } } : {}) }] };
}

const creatorSelect = { id: true, username: true, displayName: true, avatarUrl: true };
const intentSelect = {
  id: true, title: true, status: true, category: true, realizedAt: true,
  supportGoal: true, supportCount: true, creator: { select: creatorSelect },
} satisfies Prisma.IntentSelect;

function publicIntent(intent: Prisma.IntentGetPayload<{ select: typeof intentSelect }>) {
  return { id: intent.id, title: intent.title, status: intent.status, category: intent.category,
    creator: { id: intent.creator.id, username: intent.creator.username,
      displayName: intent.creator.displayName, avatarUrl: intent.creator.avatarUrl } };
}

export async function listUserPublicActivity(
  userId: string,
  cursorString?: string,
  limit = 20,
): Promise<ListPublicActivityResult> {
  const user = await prisma.user.findFirst({
    where: { id: userId, status: 'ACTIVE' },
    select: { id: true, status: true },
  });

  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', 'Perfil não encontrado.');
  }

  const safeLimit = Math.min(Math.max(limit, 1), 50);
  const parsedCursor = cursorString ? decodeActivityCursor(cursorString) : null;
  if (cursorString !== undefined && !parsedCursor) {
    throw new AppError(400, 'INVALID_CURSOR', 'Cursor de atividade inválido.');
  }
  const publicIntentScope = {
    visibility: 'PUBLIC', status: { in: ['PUBLISHED', 'REALIZED'] },
    creator: { status: 'ACTIVE' },
  };
  const take = safeLimit + 1;
  const [createdIntents, supports, reactions, comments, realizedIntents] = await Promise.all([
    prisma.intent.findMany({
      where: { creatorId: userId, ...publicIntentScope,
        ...pageBoundary('createdAt', 'intent_created', parsedCursor) },
      take, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: { ...intentSelect, createdAt: true },
    }),
    prisma.support.findMany({
      where: { userId, intent: publicIntentScope,
        ...pageBoundary('createdAt', 'intent_supported', parsedCursor) },
      take, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: { id: true, createdAt: true, intent: { select: intentSelect } },
    }),
    prisma.intentReaction.findMany({
      where: { userId, intent: publicIntentScope,
        ...pageBoundary('updatedAt', 'intent_reacted', parsedCursor) },
      take, orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
      select: { id: true, type: true, updatedAt: true, intent: { select: intentSelect } },
    }),
    prisma.intentComment.findMany({
      where: { authorId: userId, intent: publicIntentScope,
        ...pageBoundary('createdAt', 'intent_commented', parsedCursor) },
      take, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: { id: true, body: true, createdAt: true, intent: { select: intentSelect } },
    }),
    // Same participation rule as the official profile statistics: any current
    // support/comment/reaction. One event per realized Intent, never per relation.
    prisma.intent.findMany({
      where: { ...publicIntentScope, status: 'REALIZED', realizedAt: { not: null },
        AND: [{ OR: [ { supports: { some: { userId } } },
          { comments: { some: { authorId: userId } } }, { reactions: { some: { userId } } } ] },
          pageBoundary('realizedAt', 'intent_realized_participation', parsedCursor)] },
      take, orderBy: [{ realizedAt: 'desc' }, { id: 'desc' }], select: intentSelect,
    }),
  ]);

  const rawEvents: PublicActivityItem[] = [];

  // Mapear Intents criadas
  for (const intent of createdIntents) {
    const rawId = `intent_created:${intent.id}`;
    const occurredAt = intent.createdAt.toISOString();
    rawEvents.push({
      id: rawId,
      type: 'INTENT_CREATED',
      occurredAt,
      metadata: {
        supportGoal: intent.supportGoal,
        supportCount: intent.supportCount,
        realizedAt: intent.realizedAt ? intent.realizedAt.toISOString() : null,
      },
      intent: publicIntent(intent),
    });
  }

  // Keep the support event when an Intent realizes; realization is a separate event.
  for (const support of supports) {
    rawEvents.push({ id: `intent_supported:${support.id}`, type: 'INTENT_SUPPORTED',
      occurredAt: support.createdAt.toISOString(),
      metadata: { supportGoal: support.intent.supportGoal, supportCount: support.intent.supportCount },
      intent: publicIntent(support.intent) });
  }
  for (const intent of realizedIntents) {
    rawEvents.push({ id: `intent_realized_participation:${intent.id}`,
      type: 'INTENT_REALIZED_PARTICIPATION', occurredAt: intent.realizedAt!.toISOString(),
      metadata: { realizedAt: intent.realizedAt!.toISOString(),
        supportGoal: intent.supportGoal, supportCount: intent.supportCount },
      intent: publicIntent(intent) });
  }

  // Mapear Reações
  for (const reaction of reactions) {
    const rawId = `intent_reacted:${reaction.id}`;
    const occurredAt = reaction.updatedAt.toISOString();
    rawEvents.push({
      id: rawId,
      type: 'INTENT_REACTED',
      occurredAt,
      metadata: {
        reactionType: reaction.type,
      },
      intent: publicIntent(reaction.intent),
    });
  }

  // Mapear Comentários
  for (const comment of comments) {
    const rawId = `intent_commented:${comment.id}`;
    const occurredAt = comment.createdAt.toISOString();
    // Trecho seguro e truncado do comentário (máximo 120 caracteres)
    const snippet = comment.body.length > 120 ? `${comment.body.slice(0, 117)}...` : comment.body;
    rawEvents.push({
      id: rawId,
      type: 'INTENT_COMMENTED',
      occurredAt,
      metadata: {
        commentSnippet: snippet,
      },
      intent: publicIntent(comment.intent),
    });
  }

  // Ordenação global cronológica: occurredAt DESC, id DESC
  rawEvents.sort((a, b) => {
    const timeDiff = new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime();
    if (timeDiff !== 0) return timeDiff;
    return a.id === b.id ? 0 : a.id < b.id ? 1 : -1;
  });

  const items = rawEvents.slice(0, safeLimit);
  const hasMore = rawEvents.length > safeLimit;

  let nextCursor: string | null = null;
  if (hasMore && items.length > 0) {
    const lastItem = items[items.length - 1]!;
    nextCursor = encodeActivityCursor(lastItem.occurredAt, lastItem.id);
  }

  return {
    items,
    nextCursor,
  };
}
