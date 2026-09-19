import { beforeEach, describe, expect, it, vi } from 'vitest';

const db = vi.hoisted(() => ({
  intent: { findMany: vi.fn() },
  intentReaction: { groupBy: vi.fn(), findMany: vi.fn() },
  support: { findMany: vi.fn() },
  intentComment: { findMany: vi.fn() },
}));

vi.mock('../src/lib/prisma.js', () => ({ prisma: db }));
vi.mock('../src/config.js', () => ({ config: { revealEncryptionKey: Buffer.alloc(32) } }));

import { listSocialFeed } from '../src/services/intent-service.js';

const viewerId = '10000000-0000-4000-8000-000000000001';
const intent = {
  id: '20000000-0000-4000-8000-000000000001', type: 'SUPPORT_REVEAL',
  conditionType: 'SUPPORT', status: 'PUBLISHED', visibility: 'PUBLIC',
  category: 'PERSONAL', title: 'Título público', story: 'Resumo permitido',
  supportGoal: 3, supportCount: 1, revealAt: null, guardianApprovalGoal: null,
  publishedAt: new Date('2026-09-01T00:00:00.000Z'), realizedAt: null,
  createdAt: new Date('2026-09-01T00:00:00.000Z'),
  // Deliberately present in the fake database row: the public contract must omit them.
  guardianIds: [viewerId], guardianApprovals: [viewerId], revealCiphertext: 'secret',
  creator: { id: '30000000-0000-4000-8000-000000000001', username: 'autor', displayName: 'Autor', avatarUrl: null },
};

beforeEach(() => {
  vi.resetAllMocks();
  db.intent.findMany.mockResolvedValue([intent]);
  db.intentReaction.groupBy.mockResolvedValue([{ intentId: intent.id, type: 'LIKE', _count: { _all: 2 } }]);
  db.intentReaction.findMany.mockResolvedValue([{ intentId: intent.id, type: 'LIKE' }]);
  db.support.findMany.mockResolvedValue([{ intentId: intent.id }]);
  db.intentComment.findMany.mockResolvedValue([{ id: '40000000-0000-4000-8000-000000000001', intentId: intent.id, body: 'Comentário', createdAt: intent.createdAt, updatedAt: intent.createdAt, author: intent.creator }]);
});

describe('feed social real', () => {
  it('aplica acesso do viewer, agrega dados em lote e não vaza conteúdo protegido', async () => {
    const result = await listSocialFeed(viewerId, 'recent');

    expect(db.intent.findMany).toHaveBeenCalledWith(expect.objectContaining({
      take: 21,
      where: expect.objectContaining({
        creator: { status: 'ACTIVE' },
        status: { in: ['PUBLISHED', 'REALIZED'] },
        OR: expect.arrayContaining([
          { visibility: 'PUBLIC' },
          { creatorId: viewerId },
          { visibility: 'PRIVATE', guardianIds: { array_contains: [viewerId] } },
        ]),
      }),
    }));
    expect(db.intentReaction.groupBy).toHaveBeenCalledOnce();
    expect(db.intentReaction.findMany).toHaveBeenCalledOnce();
    expect(db.support.findMany).toHaveBeenCalledOnce();
    expect(db.intentComment.findMany).toHaveBeenCalledOnce();
    expect(result).toMatchObject({ nextCursor: null, items: [{
      id: intent.id, viewerReaction: 'LIKE', viewerSupported: true,
      reactionCounts: { LIKE: 2, LOVE: 0, CELEBRATE: 0, total: 2 },
      recentComments: [{ body: 'Comentário', author: { username: 'autor' } }],
    }] });
    expect(result.items[0]).not.toHaveProperty('revealCiphertext');
    expect(result.items[0]).not.toHaveProperty('guardianIds');
    expect(result.items[0]).not.toHaveProperty('guardianApprovals');
  });

  it('mantém filtro apoiadas e cursor no banco', async () => {
    await listSocialFeed(viewerId, 'supported', intent.id, 10);
    expect(db.intent.findMany).toHaveBeenCalledWith(expect.objectContaining({
      take: 11, cursor: { id: intent.id }, skip: 1,
      where: expect.objectContaining({ supports: { some: { userId: viewerId } } }),
    }));
  });
});
