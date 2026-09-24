import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { requireIntentViewAccess } from './intent-service.js';

export const intentHistoryEventTypes = [
  'INTENT_CREATED',
  'INTENT_PUBLISHED',
  'SUPPORT_RECEIVED',
  'SUPPORT_REMOVED',
  'GUARDIAN_APPROVED',
  'INTENT_REALIZED',
] as const;

export type IntentHistoryEventType = typeof intentHistoryEventTypes[number];

const historySelect = {
  id: true,
  type: true,
  occurredAt: true,
} satisfies Prisma.DomainEventSelect;

function toPublicHistoryEvent(event: Prisma.DomainEventGetPayload<{ select: typeof historySelect }>) {
  return {
    id: event.id,
    type: event.type as IntentHistoryEventType,
    occurredAt: event.occurredAt,
  };
}

/**
 * History is an intentionally narrow projection of audit events. Payloads and
 * actors can reveal supporter or guardian information, so neither leaves the
 * backend. Access is rechecked for every page.
 */
export async function listIntentHistory(intentId: string, viewerId: string, cursor?: string, limit = 20) {
  await requireIntentViewAccess(intentId, viewerId);
  const safeLimit = Math.min(Math.max(limit, 1), 50);
  const rows = await prisma.domainEvent.findMany({
    where: { intentId, type: { in: [...intentHistoryEventTypes] } },
    orderBy: [{ occurredAt: 'desc' }, { id: 'desc' }],
    take: safeLimit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: historySelect,
  });
  const page = rows.slice(0, safeLimit);
  return {
    items: page.map(toPublicHistoryEvent),
    nextCursor: rows.length > safeLimit ? page.at(-1)?.id ?? null : null,
  };
}
