import { beforeEach, describe, expect, it, vi } from 'vitest';

const { db } = vi.hoisted(() => ({
  db: {
    intent: { findMany: vi.fn() },
    user: { findMany: vi.fn() },
  },
}));
vi.mock('../src/lib/prisma.js', () => ({ prisma: db }));

import { searchIntentsAndUsers } from '../src/services/search-service.js';

const viewerId = '10000000-0000-4000-8000-000000000002';
const creatorId = '10000000-0000-4000-8000-000000000001';
const intent = {
  id: '20000000-0000-4000-8000-000000000001',
  type: 'SUPPORT_REVEAL',
  conditionType: 'SUPPORT',
  status: 'PUBLISHED',
  visibility: 'PUBLIC',
  category: 'OTHER',
  title: 'Intent encontrada',
  story: 'História pública',
  supportGoal: 3,
  supportCount: 1,
  revealAt: null,
  guardianApprovalGoal: null,
  publishedAt: new Date('2026-09-01T00:00:00Z'),
  realizedAt: null,
  createdAt: new Date('2026-09-01T00:00:00Z'),
  revealCiphertext: 'secret-ciphertext',
  revealIv: 'secret-iv',
  revealAuthTag: 'secret-tag',
  revealContent: 'secret-content',
  creator: {
    id: creatorId,
    username: 'criador',
    displayName: 'Criador',
    avatarUrl: null,
    email: 'secret@example.com',
    firebaseUid: 'secret-firebase',
  },
};
const user = {
  id: creatorId,
  username: 'criador',
  displayName: 'Criador',
  bio: 'Perfil público',
  avatarUrl: null,
  email: 'secret@example.com',
  firebaseUid: 'secret-firebase',
  passwordHash: 'secret-password',
  tokens: ['secret-token'],
  status: 'ACTIVE',
};

beforeEach(() => {
  vi.resetAllMocks();
  db.intent.findMany.mockResolvedValue([]);
  db.user.findMany.mockResolvedValue([]);
});

function intentQuery() {
  return db.intent.findMany.mock.calls[0]![0];
}

describe('busca simples de Intents e pessoas', () => {
  it.each([
    ['título', { title: { contains: 'corrida', mode: 'insensitive' } }],
    ['história', { story: { contains: 'corrida', mode: 'insensitive' } }],
    ['nome do criador', { creator: { displayName: { contains: 'corrida', mode: 'insensitive' } } }],
    ['username do criador', { creator: { username: { contains: 'corrida', mode: 'insensitive' } } }],
  ])('pesquisa Intent pública por %s', async (_field, expectedFilter) => {
    db.intent.findMany.mockResolvedValue([intent]);
    const result = await searchIntentsAndUsers(viewerId, 'corrida');
    expect(result.intents).toHaveLength(1);
    expect(intentQuery().where.AND[0].OR).toContainEqual(expectedFilter);
    expect(intentQuery().where).toMatchObject({
      status: { in: ['PUBLISHED', 'REALIZED'] },
      creator: { status: 'ACTIVE' },
    });
  });

  it('não permite FOLLOWERS de criador não seguido', async () => {
    await searchIntentsAndUsers(viewerId, 'texto');
    const access = intentQuery().where.AND[1].OR;
    expect(access).not.toContainEqual({ visibility: 'FOLLOWERS' });
    expect(access).toContainEqual({
      visibility: 'FOLLOWERS',
      creator: { followers: { some: { followerId: viewerId } } },
    });
  });

  it('permite FOLLOWERS quando o usuário segue o criador', async () => {
    await searchIntentsAndUsers(viewerId, 'texto');
    expect(intentQuery().where.AND[1].OR).toContainEqual({
      visibility: 'FOLLOWERS',
      creator: { followers: { some: { followerId: viewerId } } },
    });
  });

  it('permite PRIVATE somente ao criador ou guardião autorizado pela regra atual', async () => {
    await searchIntentsAndUsers(viewerId, 'texto');
    const access = intentQuery().where.AND[1].OR;
    expect(access).toContainEqual({ creatorId: viewerId });
    expect(access).toContainEqual({
      visibility: 'PRIVATE',
      conditionType: 'GUARDIANS',
      guardianIds: { array_contains: [viewerId] },
    });
    expect(access).not.toContainEqual({ visibility: 'PRIVATE' });
  });

  it('retorna somente usuários ativos encontrados por displayName ou username', async () => {
    db.user.findMany.mockResolvedValue([user]);
    const result = await searchIntentsAndUsers(viewerId, '@cria');
    expect(result.users).toEqual([{
      id: creatorId,
      username: 'criador',
      displayName: 'Criador',
      bio: 'Perfil público',
      avatarUrl: null,
    }]);
    expect(db.user.findMany.mock.calls[0]![0]).toMatchObject({
      where: {
        status: 'ACTIVE',
        OR: [
          { displayName: { contains: '@cria', mode: 'insensitive' } },
          { username: { contains: 'cria', mode: 'insensitive' } },
        ],
      },
      take: 10,
      select: { id: true, username: true, displayName: true, bio: true, avatarUrl: true },
    });
  });

  it('exclui usuários inativos na própria consulta', async () => {
    await searchIntentsAndUsers(viewerId, 'Criador');
    expect(db.user.findMany.mock.calls[0]![0].where.status).toBe('ACTIVE');
    expect(db.user.findMany.mock.calls[0]![0].where).not.toHaveProperty('status.not');
  });

  it('não expõe conteúdo protegido nem campos internos da Intent', async () => {
    db.intent.findMany.mockResolvedValue([intent]);
    const result = await searchIntentsAndUsers(viewerId, 'Intent');
    for (const field of ['revealCiphertext', 'revealIv', 'revealAuthTag', 'revealContent', 'guardianIds', 'guardianApprovals']) {
      expect(result.intents[0]).not.toHaveProperty(field);
      expect(intentQuery().select).not.toHaveProperty(field);
    }
  });

  it('não expõe campos sensíveis dos usuários ou do criador', async () => {
    db.intent.findMany.mockResolvedValue([intent]);
    db.user.findMany.mockResolvedValue([user]);
    const result = await searchIntentsAndUsers(viewerId, 'Criador');
    for (const field of ['email', 'firebaseUid', 'passwordHash', 'tokens', 'status']) {
      expect(result.users[0]).not.toHaveProperty(field);
      expect(result.intents[0]!.creator).not.toHaveProperty(field);
    }
  });

  it('pagina Intents de modo estável, aplica estado e período no banco', async () => {
    db.intent.findMany.mockResolvedValue([intent, { ...intent, id: '20000000-0000-4000-8000-000000000003' }]);
    const result = await searchIntentsAndUsers(viewerId, 'Intent', { kind: 'intents', status: 'PUBLISHED', period: 'week', limit: 1 });
    expect(result.intents).toHaveLength(1);
    expect(result.users).toEqual([]);
    expect(result.nextCursor).toEqual(expect.any(String));
    expect(intentQuery()).toMatchObject({ take: 2, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], where: { status: 'PUBLISHED' } });
    expect(intentQuery().where.AND).toContainEqual(expect.objectContaining({ createdAt: { gte: expect.any(Date) } }));
  });

  it('usa cursor de Intents sem alterar as regras de privacidade', async () => {
    const cursor = Buffer.from(JSON.stringify({ kind: 'intents', createdAt: '2026-09-01T00:00:00.000Z', id: intent.id })).toString('base64url');
    await searchIntentsAndUsers(viewerId, 'Intent', { kind: 'intents', cursor });
    expect(intentQuery().where.AND).toContainEqual({ OR: [
      { createdAt: { lt: new Date('2026-09-01T00:00:00.000Z') } },
      { createdAt: new Date('2026-09-01T00:00:00.000Z'), id: { lt: intent.id } },
    ] });
    expect(intentQuery().where.AND[1].OR).toContainEqual({ visibility: 'PRIVATE', conditionType: 'GUARDIANS', guardianIds: { array_contains: [viewerId] } });
  });

  it('pagina pessoas ativas sem incluir campos privados', async () => {
    db.user.findMany.mockResolvedValue([user, { ...user, id: viewerId, username: 'visitante' }]);
    const result = await searchIntentsAndUsers(viewerId, 'Criador', { kind: 'users', limit: 1 });
    expect(result.intents).toEqual([]);
    expect(result.users).toHaveLength(1);
    expect(result.nextCursor).toEqual(expect.any(String));
    expect(db.user.findMany.mock.calls[0]![0]).toMatchObject({ take: 2, orderBy: [{ displayName: 'asc' }, { id: 'asc' }], where: { status: 'ACTIVE' } });
    expect(result.users[0]).not.toHaveProperty('email');
  });

  it('rejeita cursor incompatível com a aba selecionada', async () => {
    const cursor = Buffer.from(JSON.stringify({ kind: 'users', displayName: 'Criador', id: creatorId })).toString('base64url');
    await expect(searchIntentsAndUsers(viewerId, 'Criador', { kind: 'intents', cursor })).rejects.toMatchObject({ code: 'INVALID_CURSOR' });
  });
});
