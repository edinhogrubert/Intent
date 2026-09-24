import { beforeEach, describe, expect, it, vi } from 'vitest';

const { db } = vi.hoisted(() => ({
  db: {
    intent: { findUnique: vi.fn() },
    follow: { findUnique: vi.fn() },
    domainEvent: { findMany: vi.fn() },
  },
}));

vi.mock('../src/lib/prisma.js', () => ({ prisma: db }));
vi.mock('../src/config.js', () => ({ config: { revealEncryptionKey: Buffer.alloc(32, 7) } }));

import { listIntentHistory } from '../src/services/intent-history-service.js';

const intentId = '20000000-0000-4000-8000-000000000001';
const creatorId = '10000000-0000-4000-8000-000000000001';
const viewerId = '10000000-0000-4000-8000-000000000002';

beforeEach(() => {
  vi.resetAllMocks();
  db.intent.findUnique.mockResolvedValue({
    creatorId,
    visibility: 'PUBLIC',
    status: 'PUBLISHED',
    guardianIds: [],
    creator: { status: 'ACTIVE' },
  });
  db.follow.findUnique.mockResolvedValue(null);
});

describe('História da Intent', () => {
  it('retorna somente eventos persistidos permitidos, em ordem determinística e sem payload ou ator', async () => {
    const first = { id: '30000000-0000-4000-8000-000000000002', type: 'INTENT_REALIZED', occurredAt: new Date('2026-09-21T12:00:00.000Z') };
    const second = { id: '30000000-0000-4000-8000-000000000001', type: 'SUPPORT_RECEIVED', occurredAt: new Date('2026-09-21T12:00:00.000Z') };
    db.domainEvent.findMany.mockResolvedValue([first, second]);

    const page = await listIntentHistory(intentId, viewerId, undefined, 1);

    expect(page).toEqual({ items: [first], nextCursor: first.id });
    expect(db.domainEvent.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { intentId, type: { in: ['INTENT_CREATED', 'INTENT_PUBLISHED', 'SUPPORT_RECEIVED', 'SUPPORT_REMOVED', 'GUARDIAN_APPROVED', 'INTENT_REALIZED'] } },
      orderBy: [{ occurredAt: 'desc' }, { id: 'desc' }],
      take: 2,
      select: { id: true, type: true, occurredAt: true },
    }));
    expect(JSON.stringify(page)).not.toContain('payload');
    expect(JSON.stringify(page)).not.toContain('actor');
  });

  it('aplica cursor no banco, sem carregar a história inteira', async () => {
    const cursor = '30000000-0000-4000-8000-000000000001';
    db.domainEvent.findMany.mockResolvedValue([]);
    await listIntentHistory(intentId, viewerId, cursor, 20);
    expect(db.domainEvent.findMany).toHaveBeenCalledWith(expect.objectContaining({
      cursor: { id: cursor }, skip: 1, take: 21,
    }));
  });

  it('bloqueia a história restrita após a perda de acesso sem consultar eventos', async () => {
    db.intent.findUnique.mockResolvedValue({
      creatorId,
      visibility: 'FOLLOWERS',
      status: 'PUBLISHED',
      guardianIds: [],
      creator: { status: 'ACTIVE' },
    });
    await expect(listIntentHistory(intentId, viewerId)).rejects.toMatchObject({ code: 'INTENT_FORBIDDEN' });
    expect(db.domainEvent.findMany).not.toHaveBeenCalled();
  });

  it('permite a história privada somente ao guardião autorizado, sem revelar sua identidade', async () => {
    db.intent.findUnique.mockResolvedValue({
      creatorId,
      visibility: 'PRIVATE',
      status: 'PUBLISHED',
      guardianIds: [viewerId],
      creator: { status: 'ACTIVE' },
    });
    db.domainEvent.findMany.mockResolvedValue([]);
    await expect(listIntentHistory(intentId, viewerId)).resolves.toEqual({ items: [], nextCursor: null });
  });
});
