import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { prisma } from '../src/lib/prisma.js';
import { createIntent } from '../src/services/intent-service.js';
import {
  getIntentReactionSummary,
  removeIntentReaction,
  setIntentReaction,
} from '../src/services/reaction-service.js';

let ownerId: string;
let user1Id: string;
let user2Id: string;
let intentId: string;

beforeAll(async () => {
  execFileSync(process.execPath, ['node_modules/prisma/build/index.js', 'migrate', 'deploy'], { stdio: 'pipe' });
  const marker = randomUUID();
  const [owner, user1, user2] = await Promise.all([
    prisma.user.create({
      data: {
        firebaseUid: `reaction-owner-${marker}`,
        username: `react_owner_${marker.slice(0, 8)}`,
        displayName: 'Reaction Owner',
      },
    }),
    prisma.user.create({
      data: {
        firebaseUid: `reaction-user1-${marker}`,
        username: `react_u1_${marker.slice(0, 8)}`,
        displayName: 'Reaction User 1',
      },
    }),
    prisma.user.create({
      data: {
        firebaseUid: `reaction-user2-${marker}`,
        username: `react_u2_${marker.slice(0, 8)}`,
        displayName: 'Reaction User 2',
      },
    }),
  ]);

  ownerId = owner.id;
  user1Id = user1.id;
  user2Id = user2.id;

  const intent = await createIntent(ownerId, {
    title: 'Intent para teste PostgreSQL de reações',
    story: 'Fixture PostgreSQL de reações',
    supportGoal: 5,
    revealContent: 'Segredo protegido para teste PostgreSQL',
    visibility: 'PUBLIC',
  });
  intentId = intent.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Reações persistidas em PostgreSQL real', () => {
  it('aplica a migration versionada e cria a tabela intent_reactions', async () => {
    const rows = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'intent_reactions'
    `;
    expect(rows).toEqual([{ table_name: 'intent_reactions' }]);
  });

  it('verifica que o enum IntentReactionType existe no banco', async () => {
    const enumTypes = await prisma.$queryRaw<Array<{ enumlabel: string }>>`
      SELECT e.enumlabel
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname = 'IntentReactionType'
      ORDER BY e.enumsortorder
    `;
    expect(enumTypes.map((e) => e.enumlabel)).toEqual(['LIKE', 'LOVE', 'CELEBRATE']);
  });

  it('cria reação e atualiza contadores com coerência', async () => {
    const intentBeforeReaction = await prisma.intent.findUniqueOrThrow({
      where: { id: intentId },
      select: {
        supportCount: true,
        status: true,
        realizedAt: true,
        revealCiphertext: true,
        revealIv: true,
        revealAuthTag: true,
      },
    });

    const summary1 = await setIntentReaction(intentId, user1Id, 'LIKE');
    expect(summary1.viewerReaction).toBe('LIKE');
    expect(summary1.reactionCounts).toEqual({
      LIKE: 1,
      LOVE: 0,
      CELEBRATE: 0,
      total: 1,
    });

    const summary2 = await setIntentReaction(intentId, user2Id, 'CELEBRATE');
    expect(summary2.viewerReaction).toBe('CELEBRATE');
    expect(summary2.reactionCounts).toEqual({
      LIKE: 1,
      LOVE: 0,
      CELEBRATE: 1,
      total: 2,
    });

    const intentAfterReaction = await prisma.intent.findUniqueOrThrow({
      where: { id: intentId },
      select: {
        supportCount: true,
        status: true,
        realizedAt: true,
        revealCiphertext: true,
        revealIv: true,
        revealAuthTag: true,
      },
    });
    expect(intentAfterReaction).toEqual(intentBeforeReaction);
  });

  it('segunda gravação do mesmo usuário troca o tipo mantendo unicidade protegida por chave única', async () => {
    const updated = await setIntentReaction(intentId, user1Id, 'LOVE');
    expect(updated.viewerReaction).toBe('LOVE');
    expect(updated.reactionCounts).toEqual({
      LIKE: 0,
      LOVE: 1,
      CELEBRATE: 1,
      total: 2,
    });

    // Confere no banco que existe apenas 1 registro para (intentId, user1Id)
    const records = await prisma.intentReaction.findMany({
      where: { intentId, userId: user1Id },
    });
    expect(records).toHaveLength(1);
    expect(records[0]?.type).toBe('LOVE');
  });

  it('duas gravações concorrentes do mesmo usuário para a mesma Intent não produzem dois registros', async () => {
    // Executa duas operações simultâneas
    await Promise.all([
      setIntentReaction(intentId, user1Id, 'CELEBRATE'),
      setIntentReaction(intentId, user1Id, 'LIKE'),
    ]);

    const records = await prisma.intentReaction.findMany({
      where: { intentId, userId: user1Id },
    });
    expect(records).toHaveLength(1);

    // Tentar inserção bruta direta concorrente duplicada deve disparar violação de unicidade P2002
    await expect(
      prisma.intentReaction.create({
        data: {
          intentId,
          userId: user1Id,
          type: 'LOVE',
        },
      }),
    ).rejects.toMatchObject({ code: 'P2002' });
  });

  it('remoção mantém contagens corretas e é idempotente', async () => {
    const afterRemove = await removeIntentReaction(intentId, user1Id);
    expect(afterRemove.viewerReaction).toBeNull();
    expect(afterRemove.reactionCounts.total).toBe(1);

    // Segunda remoção (idempotente)
    const repeatRemove = await removeIntentReaction(intentId, user1Id);
    expect(repeatRemove.viewerReaction).toBeNull();
    expect(repeatRemove.reactionCounts.total).toBe(1);
  });

  it('mantém integridade referencial com Intent e User (chaves estrangeiras)', async () => {
    await expect(
      prisma.intentReaction.create({
        data: { intentId: randomUUID(), userId: user2Id, type: 'LIKE' },
      }),
    ).rejects.toMatchObject({ code: 'P2003' });

    await expect(
      prisma.intentReaction.create({
        data: { intentId, userId: randomUUID(), type: 'LIKE' },
      }),
    ).rejects.toMatchObject({ code: 'P2003' });
  });
});
