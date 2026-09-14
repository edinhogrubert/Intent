import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const { db, verifyIdToken } = vi.hoisted(() => ({
  db: {
    user: { findUnique: vi.fn(), findMany: vi.fn(), update: vi.fn() },
    intent: { findMany: vi.fn(), findUnique: vi.fn(), findUniqueOrThrow: vi.fn(), create: vi.fn(), updateMany: vi.fn() },
    intentReaction: { groupBy: vi.fn(), findUnique: vi.fn(), upsert: vi.fn(), deleteMany: vi.fn() },
    $transaction: vi.fn(),
    domainEvent: { create: vi.fn() },
    follow: { findUnique: vi.fn() },
    support: { findUnique: vi.fn(), create: vi.fn(), delete: vi.fn() },
    notification: { count: vi.fn(), findMany: vi.fn(), updateMany: vi.fn(), findFirst: vi.fn() },
    intentComment: { findMany: vi.fn(), create: vi.fn() },
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

const viewer = {
  id: '10000000-0000-4000-8000-000000000002',
  firebaseUid: 'test-viewer',
  email: 'viewer@example.com',
  username: 'visitante',
  displayName: 'Visitante',
  bio: 'Perfil do visitante',
  avatarUrl: null,
  status: 'ACTIVE',
  createdAt: new Date('2026-01-02T03:04:05.000Z'),
  updatedAt: new Date('2026-02-03T04:05:06.000Z'),
};

const creatorId = '10000000-0000-4000-8000-000000000001';
const intentId = '20000000-0000-4000-8000-000000000001';

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
  verifyIdToken.mockResolvedValue({ uid: viewer.firebaseUid, name: 'Visitante' });
  db.user.findUnique.mockResolvedValue(viewer);
  db.user.update.mockResolvedValue(viewer);
  db.follow.findUnique.mockResolvedValue(null);
  db.support.findUnique.mockResolvedValue(null);
  db.intentReaction.groupBy.mockResolvedValue([]);
  db.intentReaction.findUnique.mockResolvedValue(null);
  db.intentReaction.upsert.mockResolvedValue({ id: 'reaction-1', intentId, userId: viewer.id, type: 'LIKE' });
  db.intentReaction.deleteMany.mockResolvedValue({ count: 1 });
});

function postJson(path: string, body: unknown, authorization?: string) {
  return fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(authorization ? { authorization } : {}),
    },
    body: JSON.stringify(body),
  });
}

function deleteReq(path: string, authorization?: string) {
  return fetch(`${baseUrl}${path}`, {
    method: 'DELETE',
    headers: authorization ? { authorization } : {},
  });
}

function get(path: string, authorization?: string) {
  return fetch(`${baseUrl}${path}`, {
    headers: authorization ? { authorization } : {},
  });
}

describe('Rotas HTTP de Reações em Intents', () => {
  const publicIntentRecord = {
    id: intentId,
    creatorId,
    visibility: 'PUBLIC',
    status: 'PUBLISHED',
    guardianIds: [],
    creator: { status: 'ACTIVE' },
  };

  it('exige autenticação para reagir (POST retorna 401 sem token)', async () => {
    const response = await postJson(`/v1/intents/${intentId}/reactions`, { type: 'LIKE' });
    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({ error: { code: 'AUTH_REQUIRED' } });
    expect(db.intentReaction.upsert).not.toHaveBeenCalled();
  });

  it('exige autenticação para remover reação (DELETE retorna 401 sem token)', async () => {
    const response = await deleteReq(`/v1/intents/${intentId}/reactions`);
    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({ error: { code: 'AUTH_REQUIRED' } });
    expect(db.intentReaction.deleteMany).not.toHaveBeenCalled();
  });

  it('POST /v1/intents/:id/reactions cria reação e retorna contadores atualizados', async () => {
    db.intent.findUnique.mockResolvedValue(publicIntentRecord);
    db.intentReaction.groupBy.mockResolvedValue([
      { type: 'LIKE', _count: { _all: 1 } },
    ]);
    db.intentReaction.findUnique.mockResolvedValue({ type: 'LIKE' });

    const response = await postJson(
      `/v1/intents/${intentId}/reactions`,
      { type: 'LIKE' },
      'Bearer valid-token',
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({
      data: {
        intentId,
        viewerReaction: 'LIKE',
        reactionCounts: {
          LIKE: 1,
          LOVE: 0,
          CELEBRATE: 0,
          total: 1,
        },
      },
    });

    expect(db.intentReaction.upsert).toHaveBeenCalledWith({
      where: { intentId_userId: { intentId, userId: viewer.id } },
      create: { intentId, userId: viewer.id, type: 'LIKE' },
      update: { type: 'LIKE' },
    });
  });

  it('segundo POST do mesmo usuário troca o tipo sem duplicar', async () => {
    db.intent.findUnique.mockResolvedValue(publicIntentRecord);
    db.intentReaction.groupBy.mockResolvedValue([
      { type: 'LOVE', _count: { _all: 1 } },
    ]);
    db.intentReaction.findUnique.mockResolvedValue({ type: 'LOVE' });

    const response = await postJson(
      `/v1/intents/${intentId}/reactions`,
      { type: 'LOVE' },
      'Bearer valid-token',
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.viewerReaction).toBe('LOVE');
    expect(body.data.reactionCounts.LOVE).toBe(1);
    expect(body.data.reactionCounts.LIKE).toBe(0);
    expect(body.data.reactionCounts.total).toBe(1);

    expect(db.intentReaction.upsert).toHaveBeenCalledWith({
      where: { intentId_userId: { intentId, userId: viewer.id } },
      create: { intentId, userId: viewer.id, type: 'LOVE' },
      update: { type: 'LOVE' },
    });
  });

  it('DELETE /v1/intents/:id/reactions remove somente a reação do usuário autenticado', async () => {
    db.intent.findUnique.mockResolvedValue(publicIntentRecord);
    db.intentReaction.groupBy.mockResolvedValue([]);

    const response = await deleteReq(`/v1/intents/${intentId}/reactions`, 'Bearer valid-token');
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({
      data: {
        intentId,
        viewerReaction: null,
        reactionCounts: {
          LIKE: 0,
          LOVE: 0,
          CELEBRATE: 0,
          total: 0,
        },
      },
    });

    expect(db.intentReaction.deleteMany).toHaveBeenCalledWith({
      where: { intentId, userId: viewer.id },
    });
  });

  it('DELETE repetido é seguro e idempotente', async () => {
    db.intent.findUnique.mockResolvedValue(publicIntentRecord);
    db.intentReaction.deleteMany.mockResolvedValue({ count: 0 });
    db.intentReaction.groupBy.mockResolvedValue([]);

    const response = await deleteReq(`/v1/intents/${intentId}/reactions`, 'Bearer valid-token');
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.viewerReaction).toBeNull();
    expect(body.data.reactionCounts.total).toBe(0);
  });

  it('tipo inválido retorna 400 VALIDATION_ERROR', async () => {
    db.intent.findUnique.mockResolvedValue(publicIntentRecord);

    const response = await postJson(
      `/v1/intents/${intentId}/reactions`,
      { type: 'DISLIKE' },
      'Bearer valid-token',
    );
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: { code: 'VALIDATION_ERROR' } });
    expect(db.intentReaction.upsert).not.toHaveBeenCalled();
  });

  it('body com userId, authorId, intentId ou campos extras retorna 400 VALIDATION_ERROR (.strict())', async () => {
    db.intent.findUnique.mockResolvedValue(publicIntentRecord);

    const maliciousCases = [
      { type: 'LIKE', userId: 'attacker-uuid' },
      { type: 'LIKE', authorId: 'attacker-uuid' },
      { type: 'LIKE', intentId: 'another-intent-uuid' },
      { type: 'LOVE', admin: true },
      { type: 'CELEBRATE', supportCount: 999 },
    ];

    for (const body of maliciousCases) {
      const response = await postJson(
        `/v1/intents/${intentId}/reactions`,
        body,
        'Bearer valid-token',
      );
      expect(response.status).toBe(400);
      expect(await response.json()).toMatchObject({ error: { code: 'VALIDATION_ERROR' } });
    }
    expect(db.intentReaction.upsert).not.toHaveBeenCalled();
  });

  it('bloqueia reação em Intent PRIVATE para usuário não-guardião (403 INTENT_FORBIDDEN)', async () => {
    db.intent.findUnique.mockResolvedValue({
      id: intentId,
      creatorId,
      visibility: 'PRIVATE',
      status: 'PUBLISHED',
      guardianIds: ['some-guardian-id'],
      creator: { status: 'ACTIVE' },
    });

    const response = await postJson(
      `/v1/intents/${intentId}/reactions`,
      { type: 'LIKE' },
      'Bearer valid-token',
    );
    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({ error: { code: 'INTENT_FORBIDDEN' } });
    expect(db.intentReaction.upsert).not.toHaveBeenCalled();
  });

  it('permite reação em Intent PRIVATE para guardião autorizado', async () => {
    db.intent.findUnique.mockResolvedValue({
      id: intentId,
      creatorId,
      visibility: 'PRIVATE',
      status: 'PUBLISHED',
      guardianIds: [viewer.id],
      creator: { status: 'ACTIVE' },
    });
    db.intentReaction.groupBy.mockResolvedValue([{ type: 'LIKE', _count: { _all: 1 } }]);
    db.intentReaction.findUnique.mockResolvedValue({ type: 'LIKE' });

    const response = await postJson(
      `/v1/intents/${intentId}/reactions`,
      { type: 'LIKE' },
      'Bearer valid-token',
    );
    expect(response.status).toBe(200);
    expect(db.intentReaction.upsert).toHaveBeenCalled();
  });

  it('bloqueia reação em Intent FOLLOWERS para não-seguidor (403 INTENT_FORBIDDEN)', async () => {
    db.intent.findUnique.mockResolvedValue({
      id: intentId,
      creatorId,
      visibility: 'FOLLOWERS',
      status: 'PUBLISHED',
      guardianIds: [],
      creator: { status: 'ACTIVE' },
    });
    db.follow.findUnique.mockResolvedValue(null);

    const response = await postJson(
      `/v1/intents/${intentId}/reactions`,
      { type: 'LIKE' },
      'Bearer valid-token',
    );
    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({ error: { code: 'INTENT_FORBIDDEN' } });
    expect(db.intentReaction.upsert).not.toHaveBeenCalled();
  });

  it('permite reação em Intent FOLLOWERS para seguidor', async () => {
    db.intent.findUnique.mockResolvedValue({
      id: intentId,
      creatorId,
      visibility: 'FOLLOWERS',
      status: 'PUBLISHED',
      guardianIds: [],
      creator: { status: 'ACTIVE' },
    });
    db.follow.findUnique.mockResolvedValue({ id: 'follow-record-id' });
    db.intentReaction.groupBy.mockResolvedValue([{ type: 'LIKE', _count: { _all: 1 } }]);
    db.intentReaction.findUnique.mockResolvedValue({ type: 'LIKE' });

    const response = await postJson(
      `/v1/intents/${intentId}/reactions`,
      { type: 'LIKE' },
      'Bearer valid-token',
    );
    expect(response.status).toBe(200);
    expect(db.intentReaction.upsert).toHaveBeenCalled();
  });

  it('bloqueia reação com 404 quando criador está suspenso ou inativo', async () => {
    db.intent.findUnique.mockResolvedValue({
      id: intentId,
      creatorId,
      visibility: 'PUBLIC',
      status: 'PUBLISHED',
      guardianIds: [],
      creator: { status: 'SUSPENDED' },
    });

    const response = await postJson(
      `/v1/intents/${intentId}/reactions`,
      { type: 'LIKE' },
      'Bearer valid-token',
    );
    expect(response.status).toBe(404);
    expect(await response.json()).toMatchObject({ error: { code: 'INTENT_NOT_FOUND' } });
    expect(db.intentReaction.upsert).not.toHaveBeenCalled();
  });

  it('resposta da reação não expõe campos sensíveis nem afeta apoio/revelação', async () => {
    db.intent.findUnique.mockResolvedValue(publicIntentRecord);
    db.intentReaction.groupBy.mockResolvedValue([
      { type: 'CELEBRATE', _count: { _all: 2 } },
    ]);
    db.intentReaction.findUnique.mockResolvedValue({ type: 'CELEBRATE' });

    const response = await postJson(
      `/v1/intents/${intentId}/reactions`,
      { type: 'CELEBRATE' },
      'Bearer valid-token',
    );

    const rawText = await response.text();
    // Confere que dados sensíveis não vazam
    expect(rawText).not.toContain('revealCiphertext');
    expect(rawText).not.toContain('revealIv');
    expect(rawText).not.toContain('revealAuthTag');
    expect(rawText).not.toContain('firebaseUid');
    expect(rawText).not.toContain('passwordHash');
    expect(rawText).not.toContain('tokens');
    expect(rawText).not.toContain('supportCount');
    expect(db.intent.updateMany).not.toHaveBeenCalled();
    expect(db.support.create).not.toHaveBeenCalled();
    expect(db.support.delete).not.toHaveBeenCalled();
    expect(db.domainEvent.create).not.toHaveBeenCalled();
  });
});

describe('Projeção Segura de Reações no Detalhe da Intent (GET /v1/intents/:id)', () => {
  it('GET /v1/intents/:id projeta reactionCounts e viewerReaction sem vazar campos sensíveis antes de realizada', async () => {
    db.intent.findUnique.mockResolvedValue({
      id: intentId,
      type: 'PUBLIC',
      conditionType: 'SUPPORT',
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      category: 'GENERAL',
      title: 'Intent de Teste',
      story: 'História pública da intent',
      supportGoal: 10,
      supportCount: 2,
      revealAt: null,
      guardianIds: [],
      guardianApprovals: [],
      guardianApprovalGoal: null,
      publishedAt: new Date('2026-03-01T12:00:00.000Z'),
      realizedAt: null,
      createdAt: new Date('2026-03-01T12:00:00.000Z'),
      revealCiphertext: 'SECRET_CIPHERTEXT',
      revealIv: 'SECRET_IV',
      revealAuthTag: 'SECRET_AUTH_TAG',
      revealVersion: 1,
      creatorId,
      creator: {
        id: creatorId,
        username: 'criador',
        displayName: 'Criador da Intent',
        avatarUrl: null,
        status: 'ACTIVE',
      },
    });

    db.intentReaction.groupBy.mockResolvedValue([
      { type: 'LIKE', _count: { _all: 3 } },
      { type: 'LOVE', _count: { _all: 1 } },
    ]);
    db.intentReaction.findUnique.mockResolvedValue({ type: 'LIKE' });

    const response = await get(`/v1/intents/${intentId}`, 'Bearer valid-token');
    expect(response.status).toBe(200);

    const body = await response.json();
    const intent = body.data;

    expect(intent.reactionCounts).toEqual({
      LIKE: 3,
      LOVE: 1,
      CELEBRATE: 0,
      total: 4,
    });
    expect(intent.viewerReaction).toBe('LIKE');
    expect(intent.revealContent).toBeNull();

    // Verificação estrita de ausência de dados sensíveis na resposta JSON
    const serialized = JSON.stringify(body);
    expect(serialized).not.toContain('SECRET_CIPHERTEXT');
    expect(serialized).not.toContain('SECRET_IV');
    expect(serialized).not.toContain('SECRET_AUTH_TAG');
    expect(serialized).not.toContain('revealCiphertext');
    expect(serialized).not.toContain('revealIv');
    expect(serialized).not.toContain('revealAuthTag');
    expect(serialized).not.toContain('firebaseUid');
    expect(serialized).not.toContain('passwordHash');
    expect(serialized).not.toContain('tokens');
  });
});
