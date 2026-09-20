import { beforeEach, describe, expect, it, vi } from 'vitest';

const db = vi.hoisted(() => ({
  intentWatch: { upsert: vi.fn(), deleteMany: vi.fn(), findMany: vi.fn() },
}));
const requireIntentViewAccess = vi.hoisted(() => vi.fn());

vi.mock('../src/lib/prisma.js', () => ({ prisma: db }));
vi.mock('../src/services/intent-service.js', () => ({ requireIntentViewAccess }));

import { listWatchedIntents, unwatchIntent, watchIntent } from '../src/services/intent-watch-service.js';

const viewerId = '10000000-0000-4000-8000-000000000001';
const otherUserId = '10000000-0000-4000-8000-000000000002';
const intentId = '20000000-0000-4000-8000-000000000001';
const intent = {
  id: intentId, type: 'SUPPORT_REVEAL', conditionType: 'SUPPORT', status: 'PUBLISHED',
  visibility: 'PUBLIC', category: 'OTHER', title: 'Acompanhável', story: 'Resumo público',
  supportGoal: 3, supportCount: 1, revealAt: null, guardianApprovalGoal: null,
  publishedAt: new Date(), realizedAt: null, createdAt: new Date(),
  creator: { id: otherUserId, username: 'autor', displayName: 'Autor', avatarUrl: null },
};

beforeEach(() => {
  vi.resetAllMocks();
  requireIntentViewAccess.mockResolvedValue(undefined);
  db.intentWatch.upsert.mockResolvedValue({ id: 'watch', intentId, userId: viewerId });
  db.intentWatch.deleteMany.mockResolvedValue({ count: 0 });
  db.intentWatch.findMany.mockResolvedValue([]);
});

describe('acompanhamento de Intents', () => {
  it('cria acompanhamento idempotente após autorização e não toca em apoio, reação ou realização', async () => {
    await expect(watchIntent(intentId, viewerId)).resolves.toEqual({ intentId, watching: true });
    expect(requireIntentViewAccess).toHaveBeenCalledWith(intentId, viewerId);
    expect(db.intentWatch.upsert).toHaveBeenCalledWith({
      where: { intentId_userId: { intentId, userId: viewerId } },
      create: { intentId, userId: viewerId },
      update: {},
    });
  });

  it('remove idempotentemente e só usa o usuário autenticado', async () => {
    await expect(unwatchIntent(intentId, viewerId)).resolves.toEqual({ intentId, watching: false });
    await expect(unwatchIntent(intentId, viewerId)).resolves.toEqual({ intentId, watching: false });
    expect(db.intentWatch.deleteMany).toHaveBeenLastCalledWith({ where: { intentId, userId: viewerId } });
    expect(db.intentWatch.deleteMany).not.toHaveBeenCalledWith(expect.objectContaining({ userId: otherUserId }));
  });

  it('pagina no banco e filtra vínculos cujo conteúdo deixou de ser visível', async () => {
    db.intentWatch.findMany.mockResolvedValue([
      { id: '30000000-0000-4000-8000-000000000001', intent },
      { id: '30000000-0000-4000-8000-000000000002', intent },
    ]);
    const page = await listWatchedIntents(viewerId, '30000000-0000-4000-8000-000000000000', 1);

    expect(db.intentWatch.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        userId: viewerId,
        intent: expect.objectContaining({ creator: { status: 'ACTIVE' } }),
      }),
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: 2,
      cursor: { id: '30000000-0000-4000-8000-000000000000' },
      skip: 1,
    }));
    expect(page).toEqual({ items: [{ ...intent, viewerWatching: true }], nextCursor: '30000000-0000-4000-8000-000000000001' });
    expect(page.items[0]).not.toHaveProperty('revealCiphertext');
  });
});

