import type { NotificationType, Prisma } from '@prisma/client';
import { AppError } from '../errors.js';
import { prisma } from '../lib/prisma.js';

export const notificationSelect = {
  id: true,
  type: true,
  readAt: true,
  createdAt: true,
  actor: {
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
    },
  },
  intent: {
    select: {
      id: true,
      title: true,
    },
  },
} satisfies Prisma.NotificationSelect;

type NotificationProjection = Prisma.NotificationGetPayload<{ select: typeof notificationSelect }>;

function toPublicNotification(notification: NotificationProjection) {
  return {
    id: notification.id,
    type: notification.type,
    readAt: notification.readAt,
    createdAt: notification.createdAt,
    actor: {
      id: notification.actor.id,
      username: notification.actor.username,
      displayName: notification.actor.displayName,
      avatarUrl: notification.actor.avatarUrl,
    },
    intent: notification.intent ? {
      id: notification.intent.id,
      title: notification.intent.title,
    } : null,
  };
}

interface CreateNotificationInput {
  userId: string;
  actorId: string;
  type: NotificationType;
  intentId?: string;
  deduplicationKey: string;
}

export async function createNotification(
  transaction: Prisma.TransactionClient,
  input: CreateNotificationInput,
): Promise<void> {
  if (input.userId === input.actorId) return;

  await transaction.notification.createMany({
    data: [{
      userId: input.userId,
      actorId: input.actorId,
      type: input.type,
      intentId: input.intentId ?? null,
      deduplicationKey: input.deduplicationKey,
    }],
    skipDuplicates: true,
  });
}

export async function listNotifications(userId: string, limit = 50) {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: Math.min(Math.max(limit, 1), 50),
    select: notificationSelect,
  });
  return notifications.map(toPublicNotification);
}

export async function markNotificationRead(userId: string, notificationId: string) {
  return prisma.$transaction(async (transaction) => {
    await transaction.notification.updateMany({
      where: { id: notificationId, userId, readAt: null },
      data: { readAt: new Date() },
    });

    const notification = await transaction.notification.findFirst({
      where: { id: notificationId, userId },
      select: notificationSelect,
    });
    if (!notification) {
      throw new AppError(404, 'NOTIFICATION_NOT_FOUND', 'Notificação não encontrada.');
    }
    return toPublicNotification(notification);
  });
}
