import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const { db, verifyIdToken } = vi.hoisted(() => ({
  db: {
    user: { findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
    personalContactList: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    personalContactListMember: { createMany: vi.fn(), deleteMany: vi.fn(), findMany: vi.fn() },
  },
  verifyIdToken: vi.fn(),
}));
vi.mock('../src/lib/prisma.js', () => ({ prisma: db }));
vi.mock('../src/lib/firebase.js', () => ({ firebaseAuth: { verifyIdToken } }));
vi.mock('../src/config.js', () => ({ config: { corsOrigins: ['http://localhost:3000'], logLevel: 'silent', revealEncryptionKey: Buffer.alloc(32, 7) } }));

import { createApp } from '../src/app.js';

const ownerId = '10000000-0000-4000-8000-000000000001';
const memberId = '10000000-0000-4000-8000-000000000002';
const listId = '20000000-0000-4000-8000-000000000001';
const member = { id: memberId, username: 'member', displayName: 'Member', bio: null, avatarUrl: null };
const baseList = { id: listId, name: 'Time', createdAt: new Date('2026-01-01'), updatedAt: new Date('2026-01-01'), members: [{ user: member, createdAt: new Date('2026-01-01') }] };
let server: Server;
let baseUrl: string;

beforeAll(async () => { server = createApp().listen(0, '127.0.0.1'); await new Promise<void>((resolve) => server.once('listening', () => resolve())); baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`; });
afterAll(async () => { await new Promise<void>((resolve) => server.close(() => resolve())); });
beforeEach(() => {
  vi.resetAllMocks();
  verifyIdToken.mockResolvedValue({ uid: 'firebase-owner' });
  db.user.findUnique.mockResolvedValue({ id: ownerId, firebaseUid: 'firebase-owner', status: 'ACTIVE' });
  db.user.update.mockResolvedValue({ id: ownerId, firebaseUid: 'firebase-owner', status: 'ACTIVE' });
  db.user.findFirst.mockResolvedValue({ id: memberId });
  db.personalContactList.findMany.mockResolvedValue([baseList]);
  db.personalContactList.findFirst.mockResolvedValue(baseList);
  db.personalContactList.create.mockResolvedValue(baseList);
  db.personalContactList.update.mockResolvedValue({ ...baseList, name: 'Novo nome' });
  db.personalContactList.delete.mockResolvedValue(baseList);
  db.personalContactListMember.createMany.mockResolvedValue({ count: 1 });
  db.personalContactListMember.deleteMany.mockResolvedValue({ count: 1 });
});

function request(path: string, init: RequestInit = {}) { return fetch(`${baseUrl}${path}`, { ...init, headers: { authorization: 'Bearer token', ...(init.body ? { 'content-type': 'application/json' } : {}), ...(init.headers ?? {}) } }); }

describe('listas pessoais HTTP', () => {
  it('exige autenticação', async () => { expect((await fetch(`${baseUrl}/v1/personal-lists`)).status).toBe(401); });
  it('retorna somente listas do proprietário com membros públicos', async () => {
    const response = await request('/v1/personal-lists');
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: { items: [{ ...baseList, createdAt: baseList.createdAt.toISOString(), updatedAt: baseList.updatedAt.toISOString(), members: [member] }] } });
    expect(db.personalContactList.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { ownerId } }));
  });
  it('rejeita campos de proprietário e payload desconhecido', async () => {
    expect((await request('/v1/personal-lists', { method: 'POST', body: JSON.stringify({ name: 'x', ownerId }) })).status).toBe(400);
  });
  it('adiciona membro ativo com operação repetida idempotente', async () => {
    const response = await request(`/v1/personal-lists/${listId}/members`, { method: 'POST', body: JSON.stringify({ userId: memberId }) });
    expect(response.status).toBe(201);
    expect(db.personalContactListMember.createMany).toHaveBeenCalledWith({ data: [{ listId, userId: memberId }], skipDuplicates: true });
  });
  it('não expõe uma lista de outro proprietário', async () => {
    db.personalContactList.findFirst.mockResolvedValue(null);
    expect((await request(`/v1/personal-lists/${listId}/members/${memberId}`, { method: 'DELETE' })).status).toBe(404);
  });
});
