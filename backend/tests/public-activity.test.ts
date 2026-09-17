import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const { db, verifyIdToken } = vi.hoisted(() => ({
  db: {
    user: { findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), update: vi.fn() },
    intent: { count: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn() },
    $transaction: vi.fn(),
    domainEvent: { create: vi.fn() },
    follow: { findUnique: vi.fn(), count: vi.fn().mockResolvedValue(0) },
    support: { count: vi.fn(), findMany: vi.fn(), findUnique: vi.fn() },
    notification: { count: vi.fn(), createMany: vi.fn(), findMany: vi.fn(), updateMany: vi.fn() },
    intentComment: { count: vi.fn(), findMany: vi.fn(), create: vi.fn() },
    intentReaction: { count: vi.fn(), findMany: vi.fn(), groupBy: vi.fn().mockResolvedValue([]) },
  },
  verifyIdToken: vi.fn(),
}));

vi.mock('../src/lib/prisma.js', () => ({ prisma: db }));
vi.mock('../src/lib/firebase.js', () => ({ firebaseAuth: { verifyIdToken } }));
vi.mock('../src/config.js', () => ({
  config: {
    corsOrigins: ['http://localhost:3000'],
    logLevel: 'silent',
    revealEncryptionKey: Buffer.alloc(32, 7),
  },
}));

import { createApp } from '../src/app.js';
import { encodeActivityCursor, decodeActivityCursor, listUserPublicActivity } from '../src/services/public-activity-service.js';

const viewer = {
  id: '10000000-0000-4000-8000-000000000002',
  firebaseUid: 'test-viewer',
  email: 'viewer@example.com',
  username: 'visitante',
  displayName: 'Visitante',
  bio: 'Perfil visitante',
  avatarUrl: null,
  status: 'ACTIVE',
  createdAt: new Date('2026-01-02T03:04:05.000Z'),
  updatedAt: new Date('2026-02-03T04:05:06.000Z'),
  passwordHash: 'never-return-this',
  tokens: ['never-return-this'],
};

const targetUser = {
  id: '10000000-0000-4000-8000-000000000001',
  firebaseUid: 'test-target',
  email: 'target@example.com',
  username: 'joao.silva',
  displayName: 'João Silva',
  bio: 'Bio do João',
  avatarUrl: null,
  status: 'ACTIVE',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server = createApp().listen(0, '127.0.0.1', () => resolve());
    server.once('error', reject);
  });
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  if (server) {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
      server.closeAllConnections();
    });
  }
});

beforeEach(() => {
  vi.resetAllMocks();
  db.intent.findMany.mockResolvedValue([]);
  db.support.findMany.mockResolvedValue([]);
  db.intentReaction.findMany.mockResolvedValue([]);
  db.intentComment.findMany.mockResolvedValue([]);
  verifyIdToken.mockResolvedValue({ uid: viewer.firebaseUid, email: viewer.email });
  db.user.findUnique.mockImplementation(async ({ where }: { where: { firebaseUid?: string; id?: string } }) => {
    if (where.firebaseUid === viewer.firebaseUid || where.id === viewer.id) return viewer;
    if (where.id === targetUser.id) return targetUser;
    return null;
  });
  db.user.findFirst.mockImplementation(async ({ where }: { where: { id?: string; status?: string } }) => {
    if (where.id === targetUser.id && where.status === 'ACTIVE') return targetUser;
    if (where.id === viewer.id && where.status === 'ACTIVE') return viewer;
    return null;
  });
});

describe('Bloco 24 — Atividade Pública do Perfil', () => {
  it('encodes and decodes activity cursor reliably', () => {
    const date = new Date('2026-03-15T14:30:00.000Z');
    const id = 'intent_created:20000000-0000-4000-8000-000000000001';
    const cursor = encodeActivityCursor(date, id);
    expect(typeof cursor).toBe('string');

    const decoded = decodeActivityCursor(cursor);
    expect(decoded).not.toBeNull();
    expect(decoded?.occurredAt.toISOString()).toBe(date.toISOString());
    expect(decoded?.id).toBe(id);
  });

  it('returns 404 if target user is not active or does not exist', async () => {
    db.user.findFirst.mockResolvedValueOnce(null);

    const response = await fetch(`${baseUrl}/v1/users/00000000-0000-4000-8000-000000000099/activity`, {
      headers: { Authorization: 'Bearer valid-token' },
    });

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error?.code).toBe('USER_NOT_FOUND');
  });

  it('aggregates created intents, supports, reactions, and comments chronologically', async () => {
    const creatorUser = {
      id: targetUser.id,
      username: targetUser.username,
      displayName: targetUser.displayName,
      avatarUrl: null,
    };

    // 1. Intent criada
    db.intent.findMany.mockResolvedValueOnce([
      {
        id: '20000000-0000-4000-8000-000000000001',
        title: 'Criar uma horta comunitária',
        status: 'PUBLISHED',
        category: 'COMMUNITY_CAUSES',
        createdAt: new Date('2026-03-10T10:00:00.000Z'),
        publishedAt: new Date('2026-03-10T10:00:00.000Z'),
        realizedAt: null,
        supportGoal: 50,
        supportCount: 12,
        creator: creatorUser,
      },
    ]);

    // 2. Apoio a uma intent realizada (Participação em realização)
    db.support.findMany.mockResolvedValueOnce([
      {
        id: '20000000-0000-4000-8000-000000000003',
        createdAt: new Date('2026-03-12T15:00:00.000Z'),
        intent: {
          id: '20000000-0000-4000-8000-000000000002',
          title: 'Maratona Solidária 2026',
          status: 'REALIZED',
          category: 'SPORTS',
          realizedAt: new Date('2026-03-14T18:00:00.000Z'),
          supportGoal: 100,
          supportCount: 105,
          creator: {
            id: 'creator-999',
            username: 'maria.atleta',
            displayName: 'Maria Atleta',
            avatarUrl: null,
          },
        },
      },
    ]);

    db.intent.findMany.mockResolvedValueOnce([{
      id: '20000000-0000-4000-8000-000000000002', title: 'Maratona Solidária 2026',
      status: 'REALIZED', category: 'SPORTS', realizedAt: new Date('2026-03-14T18:00:00.000Z'),
      supportGoal: 100, supportCount: 105, creator: creatorUser,
    }]);

    // 3. Reação dada
    db.intentReaction.findMany.mockResolvedValueOnce([
      {
        id: '20000000-0000-4000-8000-000000000004',
        type: 'CELEBRATE',
        createdAt: new Date('2026-03-11T09:00:00.000Z'),
        updatedAt: new Date('2026-03-15T09:00:00.000Z'),
        intent: {
          id: '20000000-0000-4000-8000-000000000002',
          title: 'Maratona Solidária 2026',
          status: 'REALIZED',
          category: 'SPORTS',
          realizedAt: new Date('2026-03-14T18:00:00.000Z'),
          creator: {
            id: 'creator-999',
            username: 'maria.atleta',
            displayName: 'Maria Atleta',
            avatarUrl: null,
          },
        },
      },
    ]);

    // 4. Comentário feito
    db.intentComment.findMany.mockResolvedValueOnce([
      {
        id: '20000000-0000-4000-8000-000000000005',
        body: 'Parabéns pela conquista incrível de todos os envolvidos!',
        createdAt: new Date('2026-03-13T12:00:00.000Z'),
        intent: {
          id: '20000000-0000-4000-8000-000000000002',
          title: 'Maratona Solidária 2026',
          status: 'REALIZED',
          category: 'SPORTS',
          realizedAt: new Date('2026-03-14T18:00:00.000Z'),
          creator: {
            id: 'creator-999',
            username: 'maria.atleta',
            displayName: 'Maria Atleta',
            avatarUrl: null,
          },
        },
      },
    ]);

    const response = await fetch(`${baseUrl}/v1/users/${targetUser.id}/activity`, {
      headers: { Authorization: 'Bearer valid-token' },
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    const items = body.data.items;

    expect(items).toHaveLength(5);

    expect(items.map((item: { type: string }) => item.type)).toEqual([
      'INTENT_REACTED', 'INTENT_REALIZED_PARTICIPATION', 'INTENT_COMMENTED',
      'INTENT_SUPPORTED', 'INTENT_CREATED',
    ]);
    expect(items[0].metadata.reactionType).toBe('CELEBRATE');
    expect(items[0].occurredAt).toBe('2026-03-15T09:00:00.000Z');
    expect(items[1].occurredAt).toBe('2026-03-14T18:00:00.000Z');
    expect(items[1].metadata.realizedAt).toBe(items[1].occurredAt);
    expect(items[2].metadata.commentSnippet).toBe('Parabéns pela conquista incrível de todos os envolvidos!');
    expect(items[3].occurredAt).toBe('2026-03-12T15:00:00.000Z');
    expect(items[4].intent.title).toBe('Criar uma horta comunitária');

    // Garantir que nenhum dado sensível foi vazado
    for (const item of items) {
      expect((item as any).revealCiphertext).toBeUndefined();
      expect((item as any).revealIv).toBeUndefined();
      expect((item as any).guardianIds).toBeUndefined();
      expect(item.intent.creator?.email).toBeUndefined();
    }
  });

  it('respects limit and generates valid nextCursor for pagination', async () => {
    const creatorUser = {
      id: targetUser.id,
      username: targetUser.username,
      displayName: targetUser.displayName,
      avatarUrl: null,
    };

    db.intent.findMany.mockResolvedValueOnce([
      {
        id: '20000000-0000-4000-8000-000000000006',
        title: 'Intent 1',
        status: 'PUBLISHED',
        category: 'EDUCATION',
        createdAt: new Date('2026-03-20T10:00:00.000Z'),
        publishedAt: new Date('2026-03-20T10:00:00.000Z'),
        realizedAt: null,
        supportGoal: 10,
        supportCount: 2,
        creator: creatorUser,
      },
      {
        id: '20000000-0000-4000-8000-000000000007',
        title: 'Intent 2',
        status: 'PUBLISHED',
        category: 'EDUCATION',
        createdAt: new Date('2026-03-19T10:00:00.000Z'),
        publishedAt: new Date('2026-03-19T10:00:00.000Z'),
        realizedAt: null,
        supportGoal: 10,
        supportCount: 2,
        creator: creatorUser,
      },
      {
        id: '20000000-0000-4000-8000-000000000008',
        title: 'Intent 3',
        status: 'PUBLISHED',
        category: 'EDUCATION',
        createdAt: new Date('2026-03-18T10:00:00.000Z'),
        publishedAt: new Date('2026-03-18T10:00:00.000Z'),
        realizedAt: null,
        supportGoal: 10,
        supportCount: 2,
        creator: creatorUser,
      },
    ]);
    db.support.findMany.mockResolvedValueOnce([]);
    db.intentReaction.findMany.mockResolvedValueOnce([]);
    db.intentComment.findMany.mockResolvedValueOnce([]);

    const response = await fetch(`${baseUrl}/v1/users/${targetUser.id}/activity?limit=2`, {
      headers: { Authorization: 'Bearer valid-token' },
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.items).toHaveLength(2);
    expect(body.data.nextCursor).toBeTruthy();

    const decoded = decodeActivityCursor(body.data.nextCursor);
    expect(decoded?.id).toBe('intent_created:20000000-0000-4000-8000-000000000007');
  });
});

// Exercise database WHERE/orderBy/take semantics instead of returning a fixed page.
// These are query-contract tests; they do not substitute for a real PostgreSQL run.
type Row = Record<string, any>;
function matches(row: Row, where: Row): boolean {
  return Object.entries(where).every(([key, condition]) => {
    if (key === 'AND') return condition.every((part: Row) => matches(row, part));
    if (key === 'OR') return condition.some((part: Row) => matches(row, part));
    const value = row[key];
    if (condition instanceof Date) return value instanceof Date && +value === +condition;
    if (condition === null || typeof condition !== 'object') return value === condition;
    if ('lt' in condition) return value < condition.lt;
    if ('lte' in condition) return value <= condition.lte;
    if ('not' in condition) return value !== condition.not;
    if ('in' in condition) return condition.in.includes(value);
    if ('some' in condition) return (value ?? []).some((entry: Row) => matches(entry, condition.some));
    return value != null && matches(value, condition);
  });
}
function installRows(intents: Row[], supports: Row[] = [], reactions: Row[] = [], comments: Row[] = []) {
  for (const [mock, rows] of [[db.intent.findMany, intents], [db.support.findMany, supports],
    [db.intentReaction.findMany, reactions], [db.intentComment.findMany, comments]] as const) {
    mock.mockImplementation(async ({ where, orderBy, take }) => rows.filter((row) => matches(row, where))
      .sort((a, b) => {
        for (const order of orderBy) {
          const key = Object.keys(order)[0]!;
          if (a[key] < b[key]) return 1;
          if (a[key] > b[key]) return -1;
        }
        return 0;
      }).slice(0, take));
  }
}
const uuid = (value: number) => `30000000-0000-4000-8000-${String(value).padStart(12, '0')}`;
const timestamp = new Date('2026-09-01T12:00:00.000Z');
function publicFixture(index = 1): Row {
  return { id: uuid(index), creatorId: targetUser.id, creator: targetUser,
    title: 'Título público', status: 'REALIZED', visibility: 'PUBLIC', category: 'OTHER',
    createdAt: timestamp, publishedAt: new Date('2026-09-02T12:00:00.000Z'),
    realizedAt: timestamp, supportGoal: 2, supportCount: 2,
    supports: [{ userId: targetUser.id }], comments: [], reactions: [],
    revealCiphertext: 'SECRET', revealIv: 'SECRET', revealAuthTag: 'SECRET', revealContent: 'SECRET' };
}

describe('regressões oficiais da atividade pública', () => {
  it('exige autenticação sem consultar atividade', async () => {
    const response = await fetch(`${baseUrl}/v1/users/${targetUser.id}/activity`);
    expect(response.status).toBe(401);
    expect(db.intent.findMany).not.toHaveBeenCalled();
  });

  it.each(['cursor=invalid', 'cursor=', 'limit=0', 'limit=51', 'limit=1.5',
    `cursor=${encodeActivityCursor(timestamp, 'intent_created:not-a-uuid')}`])(
    'rejeita consulta inválida: %s', async (query) => {
      const response = await fetch(`${baseUrl}/v1/users/${targetUser.id}/activity?${query}`, {
        headers: { Authorization: 'Bearer valid-token' },
      });
      expect(response.status).toBe(400);
      expect(db.intent.findMany).not.toHaveBeenCalled();
    });

  it('pagina todos os cinco tipos com muitos timestamps iguais sem perder ou repetir eventos', async () => {
    const intents = Array.from({ length: 24 }, (_, index) => publicFixture(index + 1));
    const supports = intents.map((intent, index) => ({ id: uuid(index + 100), userId: targetUser.id, createdAt: timestamp, intent }));
    const reactions = intents.map((intent, index) => ({ id: uuid(index + 200), userId: targetUser.id, updatedAt: timestamp, type: 'LOVE', intent }));
    const comments = intents.map((intent, index) => ({ id: uuid(index + 300), authorId: targetUser.id, createdAt: timestamp, body: 'Olá', intent }));
    installRows(intents, supports, reactions, comments);
    const expected = [
      ...intents.map((row) => `intent_created:${row.id}`),
      ...intents.map((row) => `intent_realized_participation:${row.id}`),
      ...supports.map((row) => `intent_supported:${row.id}`),
      ...reactions.map((row) => `intent_reacted:${row.id}`),
      ...comments.map((row) => `intent_commented:${row.id}`),
    ].sort().reverse();
    const seen: string[] = [];
    let cursor: string | undefined;
    for (let page = 0; page < 30; page++) {
      const result = await listUserPublicActivity(targetUser.id, cursor, 7);
      seen.push(...result.items.map((item) => item.id));
      if (!result.nextCursor) break;
      cursor = result.nextCursor;
    }
    expect(seen).toEqual(expected);
    expect(new Set(seen).size).toBe(120);
    for (const mock of [db.intent.findMany, db.support.findMany, db.intentReaction.findMany, db.intentComment.findMany]) {
      for (const [query] of mock.mock.calls) expect(query.take).toBe(8);
    }
  });

  it.each(['PRIVATE', 'FOLLOWERS', 'DRAFT', 'INACTIVE_CREATOR'])(
    'reconsulta visibilidade/estado atual em todas as fontes: %s', async (restriction) => {
      const intent = publicFixture();
      const support = { id: uuid(10), userId: targetUser.id, createdAt: timestamp, intent };
      const reaction = { id: uuid(11), userId: targetUser.id, updatedAt: timestamp, type: 'LIKE', intent };
      const comment = { id: uuid(12), authorId: targetUser.id, createdAt: timestamp, body: 'Público', intent };
      installRows([intent], [support], [reaction], [comment]);
      expect((await listUserPublicActivity(targetUser.id)).items).toHaveLength(5);
      if (restriction === 'DRAFT') intent.status = restriction;
      else if (restriction === 'INACTIVE_CREATOR') intent.creator = { ...targetUser, status: 'SUSPENDED' };
      else intent.visibility = restriction;
      expect(await listUserPublicActivity(targetUser.id)).toEqual({ items: [], nextCursor: null });
    });

  it('remoção de apoio/reação/comentário elimina atividade e participação sem cache', async () => {
    const intent = publicFixture();
    const supports: Row[] = [{ id: uuid(2), userId: targetUser.id, createdAt: timestamp, intent }];
    const reactions: Row[] = [{ id: uuid(3), userId: targetUser.id, updatedAt: timestamp, type: 'LIKE', intent }];
    const comments: Row[] = [{ id: uuid(4), authorId: targetUser.id, createdAt: timestamp, body: 'Texto', intent }];
    installRows([intent], supports, reactions, comments);
    expect((await listUserPublicActivity(targetUser.id)).items).toHaveLength(5);
    supports.length = 0; reactions.length = 0; comments.length = 0; intent.supports = [];
    expect((await listUserPublicActivity(targetUser.id)).items.map((item) => item.type)).toEqual(['INTENT_CREATED']);
  });

  it.each(['comments', 'reactions'])('participação por %s segue a regra oficial sem exigir apoio', async (relation) => {
    const intent = publicFixture(); intent.supports = [];
    intent[relation] = relation === 'comments' ? [{ authorId: targetUser.id }] : [{ userId: targetUser.id }];
    installRows([intent]);
    const items = (await listUserPublicActivity(targetUser.id)).items;
    expect(items.filter((item) => item.type === 'INTENT_REALIZED_PARTICIPATION')).toHaveLength(1);
  });

  it('retorna título e trecho públicos sem reveal/credenciais; seleção explícita e consultas constantes', async () => {
    const intent = publicFixture();
    const comment = { id: uuid(2), authorId: targetUser.id, createdAt: timestamp, body: 'x'.repeat(500), intent };
    installRows([intent], [], [], [comment]);
    const result = await listUserPublicActivity(targetUser.id);
    expect(JSON.stringify(result)).not.toMatch(/SECRET|firebaseUid|passwordHash|email|tokens|reveal/);
    const item = result.items.find((entry) => entry.type === 'INTENT_COMMENTED')!;
    expect(item.metadata!.commentSnippet).toHaveLength(120);
    expect(item.intent.title).toBe('Título público');
    expect(Object.keys(item.intent.creator!).sort()).toEqual(['avatarUrl', 'displayName', 'id', 'username']);
    expect(db.user.findFirst).toHaveBeenCalledTimes(1);
    expect(db.intent.findMany).toHaveBeenCalledTimes(2);
    for (const mock of [db.support.findMany, db.intentReaction.findMany, db.intentComment.findMany]) expect(mock).toHaveBeenCalledTimes(1);
    for (const mock of [db.intent.findMany, db.support.findMany, db.intentReaction.findMany, db.intentComment.findMany]) {
      for (const [query] of mock.mock.calls) {
        expect(query.select).toBeDefined();
        expect(JSON.stringify(query.select)).not.toMatch(/reveal|email|firebaseUid|passwordHash/);
      }
    }
    expect(db.domainEvent.create).not.toHaveBeenCalled();
    expect(db.intent.create).not.toHaveBeenCalled();
    expect(result.items.find((entry) => entry.type === 'INTENT_CREATED')!.occurredAt).toBe(timestamp.toISOString());
  });
});
