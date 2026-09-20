import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { prisma } from '../src/lib/prisma.js';
import { createIntent, supportIntent } from '../src/services/intent-service.js';
import { listIntentHistory } from '../src/services/intent-history-service.js';

let ownerId: string;
let viewerId: string;
let supporterId: string;

beforeAll(async () => {
  execFileSync(process.execPath, ['node_modules/prisma/build/index.js', 'migrate', 'deploy'], { stdio: 'pipe' });
  const marker = randomUUID();
  const users = await Promise.all(['owner', 'viewer', 'supporter'].map((name) => prisma.user.create({ data: {
    firebaseUid: `history-${name}-${marker}`,
    username: `history_${name}_${marker.slice(0, 8)}`,
    displayName: `History ${name}`,
  } })));
  ownerId = users[0]!.id;
  viewerId = users[1]!.id;
  supporterId = users[2]!.id;
});

afterAll(async () => { await prisma.$disconnect(); });

describe('história da Intent em PostgreSQL', () => {
  it('usa eventos auditáveis reais, pagina de forma estável e não expõe payload', async () => {
    const intent = await createIntent(ownerId, {
      title: 'História persistida', story: 'Fixture de timeline', supportGoal: 1,
      revealContent: 'Conteúdo protegido', visibility: 'PUBLIC',
    });
    await supportIntent(intent.id, supporterId, randomUUID());

    const firstPage = await listIntentHistory(intent.id, viewerId, undefined, 2);
    expect(firstPage.items.map((event) => event.type)).toEqual(['INTENT_REALIZED', 'SUPPORT_RECEIVED']);
    expect(firstPage.nextCursor).not.toBeNull();
    expect(JSON.stringify(firstPage)).not.toContain('payload');
    const secondPage = await listIntentHistory(intent.id, viewerId, firstPage.nextCursor!, 2);
    expect(secondPage.items.map((event) => event.type)).toEqual(['INTENT_CREATED']);
  });

  it('bloqueia a história de uma Intent privada para quem não tem acesso', async () => {
    const intent = await createIntent(ownerId, {
      title: 'História privada', story: 'Fixture privada', conditionType: 'DATE',
      revealAt: new Date(Date.now() + 3_600_000).toISOString(), revealContent: 'Protegido', visibility: 'PRIVATE',
    });
    await expect(listIntentHistory(intent.id, viewerId)).rejects.toMatchObject({ code: 'INTENT_FORBIDDEN' });
  });
});
