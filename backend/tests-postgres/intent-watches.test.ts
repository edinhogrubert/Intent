import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { prisma } from '../src/lib/prisma.js';
import { createIntent, supportIntent } from '../src/services/intent-service.js';
import { listWatchedIntents, unwatchIntent, watchIntent } from '../src/services/intent-watch-service.js';
import { listNotifications } from '../src/services/notification-service.js';

let ownerId: string;
let viewerId: string;
let supporterId: string;
let intentId: string;

beforeAll(async () => {
  execFileSync(process.execPath, ['node_modules/prisma/build/index.js', 'migrate', 'deploy'], { stdio: 'pipe' });
  const marker = randomUUID();
  const [owner, viewer, supporter] = await Promise.all([
    prisma.user.create({ data: { firebaseUid: `watch-owner-${marker}`, username: `watch_owner_${marker.slice(0, 8)}`, displayName: 'Watch owner' } }),
    prisma.user.create({ data: { firebaseUid: `watch-viewer-${marker}`, username: `watch_viewer_${marker.slice(0, 8)}`, displayName: 'Watch viewer' } }),
    prisma.user.create({ data: { firebaseUid: `watch-supporter-${marker}`, username: `watch_supporter_${marker.slice(0, 8)}`, displayName: 'Watch supporter' } }),
  ]);
  ownerId = owner.id;
  viewerId = viewer.id;
  supporterId = supporter.id;
  intentId = (await createIntent(ownerId, {
    title: 'Intent acompanhada no PostgreSQL',
    story: 'Resumo público da fixture',
    supportGoal: 3,
    revealContent: 'Conteúdo protegido',
    visibility: 'PUBLIC',
  })).id;
});

afterAll(async () => { await prisma.$disconnect(); });

describe('acompanhamentos persistidos em PostgreSQL', () => {
  it('aplica a migration, mantém unicidade e não altera o domínio da Intent', async () => {
    const before = await prisma.intent.findUniqueOrThrow({ where: { id: intentId }, select: { supportCount: true, status: true, realizedAt: true } });
    await expect(watchIntent(intentId, viewerId)).resolves.toEqual({ intentId, watching: true });
    await expect(watchIntent(intentId, viewerId)).resolves.toEqual({ intentId, watching: true });
    expect(await prisma.intentWatch.count({ where: { intentId, userId: viewerId } })).toBe(1);
    const after = await prisma.intent.findUniqueOrThrow({ where: { id: intentId }, select: { supportCount: true, status: true, realizedAt: true } });
    expect(after).toEqual(before);
  });

  it('lista pelo vínculo, preserva projeção e remove idempotentemente', async () => {
    const page = await listWatchedIntents(viewerId);
    expect(page.items).toContainEqual(expect.objectContaining({ id: intentId, viewerWatching: true }));
    expect(JSON.stringify(page)).not.toContain('revealCiphertext');
    await unwatchIntent(intentId, viewerId);
    await unwatchIntent(intentId, viewerId);
    expect(await prisma.intentWatch.count({ where: { intentId, userId: viewerId } })).toBe(0);
  });

  it('notifica uma única vez o acompanhante elegível quando a Intent é realizada', async () => {
    const realizedIntent = await createIntent(ownerId, {
      title: 'Intent realizada acompanhada',
      story: 'Fixture para notificação de realização',
      supportGoal: 1,
      revealContent: 'Conteúdo protegido',
      visibility: 'PUBLIC',
    });
    await watchIntent(realizedIntent.id, viewerId);

    await supportIntent(realizedIntent.id, supporterId, randomUUID());
    await supportIntent(realizedIntent.id, supporterId, randomUUID()).catch(() => undefined);

    const notifications = await listNotifications(viewerId);
    expect(notifications.filter((notification) => notification.type === 'INTENT_WATCHED_REALIZED' && notification.intent?.id === realizedIntent.id)).toHaveLength(1);
    expect(await prisma.notification.count({ where: {
      userId: viewerId,
      deduplicationKey: `intent-watch-realized:${realizedIntent.id}:${viewerId}`,
    } })).toBe(1);
  });
});
