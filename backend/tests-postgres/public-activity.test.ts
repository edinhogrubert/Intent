import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { prisma } from '../src/lib/prisma.js';
import { createIntent } from '../src/services/intent-service.js';
import { listUserPublicActivity } from '../src/services/public-activity-service.js';

let userId: string;
const intentIds: string[] = [];
const expectedIds: string[] = [];
const at = new Date('2026-09-01T12:00:00.000Z');

beforeAll(async () => {
  execFileSync(process.execPath, ['node_modules/prisma/build/index.js', 'migrate', 'deploy'], { stdio: 'pipe' });
  const marker = randomUUID();
  const user = await prisma.user.create({ data: {
    firebaseUid: `activity-${marker}`, username: `activity_${marker.slice(0, 8)}`, displayName: 'Activity fixture',
  } });
  userId = user.id;
  for (let index = 0; index < 12; index++) {
    const intent = await createIntent(userId, { title: `Public activity ${index}`, story: 'Ephemeral activity fixture',
      supportGoal: 50, revealContent: 'Protected fixture', visibility: 'PUBLIC' });
    intentIds.push(intent.id);
    // Test fixtures only: ties across every source and publication distinct from creation.
    await prisma.intent.update({ where: { id: intent.id }, data: {
      status: 'REALIZED', realizedAt: at, createdAt: at, publishedAt: new Date(+at + 1000),
    } });
    const support = await prisma.support.create({ data: { intentId: intent.id, userId, createdAt: at } });
    const reaction = await prisma.intentReaction.create({ data: {
      intentId: intent.id, userId, type: 'LOVE', createdAt: new Date(+at - 1000), updatedAt: at,
    } });
    const comment = await prisma.intentComment.create({ data: {
      intentId: intent.id, authorId: userId, body: 'Public comment', createdAt: at,
    } });
    expectedIds.push(`intent_created:${intent.id}`, `intent_realized_participation:${intent.id}`,
      `intent_supported:${support.id}`, `intent_reacted:${reaction.id}`, `intent_commented:${comment.id}`);
  }
});
afterAll(async () => { await prisma.$disconnect(); });

describe('atividade pública em PostgreSQL real', () => {
  it('pagina cinco fontes com timestamps iguais sem lacunas, duplicação ou escrita de domínio', async () => {
    const snapshot = () => prisma.intent.findMany({ where: { id: { in: intentIds } }, orderBy: { id: 'asc' },
      select: { id: true, status: true, supportCount: true, realizedAt: true, revealCiphertext: true, updatedAt: true } });
    const before = await snapshot();
    const eventCount = await prisma.domainEvent.count({ where: { intentId: { in: intentIds } } });
    const resultIds: string[] = [];
    let cursor: string | undefined;
    for (let page = 0; page < 20; page++) {
      const result = await listUserPublicActivity(userId, cursor, 7);
      resultIds.push(...result.items.map((item) => item.id));
      expect(result.items.every((item) => item.occurredAt === at.toISOString())).toBe(true);
      expect(JSON.stringify(result)).not.toMatch(/revealCiphertext|firebaseUid|email|Protected fixture/);
      if (!result.nextCursor) break;
      cursor = result.nextCursor;
    }
    expect(resultIds).toEqual(expectedIds.sort().reverse());
    expect(resultIds).toHaveLength(60);
    expect(await snapshot()).toEqual(before);
    expect(await prisma.domainEvent.count({ where: { intentId: { in: intentIds } } })).toBe(eventCount);
  });

  it('reflete visibilidade e remoções na consulta seguinte, inclusive participação sem apoio', async () => {
    const id = intentIds[0]!;
    for (const visibility of ['PRIVATE', 'FOLLOWERS']) {
      await prisma.intent.update({ where: { id }, data: { visibility } });
      expect((await listUserPublicActivity(userId, undefined, 50)).items.some((item) => item.intent.id === id)).toBe(false);
    }
    await prisma.intent.update({ where: { id }, data: { visibility: 'PUBLIC', realizedAt: new Date(+at + 5000) } });
    await prisma.support.deleteMany({ where: { intentId: id } });
    const realized = (await listUserPublicActivity(userId)).items.find((item) => item.intent.id === id
      && item.type === 'INTENT_REALIZED_PARTICIPATION');
    expect(realized?.occurredAt).toBe(new Date(+at + 5000).toISOString());
    await prisma.intentReaction.deleteMany({ where: { intentId: id } });
    await prisma.intentComment.deleteMany({ where: { intentId: id } });
    const items = (await listUserPublicActivity(userId, undefined, 50)).items.filter((item) => item.intent.id === id);
    expect(items.every((item) => item.type === 'INTENT_CREATED')).toBe(true);
  });

  it('não expõe perfil suspenso', async () => {
    await prisma.user.update({ where: { id: userId }, data: { status: 'SUSPENDED' } });
    await expect(listUserPublicActivity(userId)).rejects.toMatchObject({ statusCode: 404 });
  });
});
