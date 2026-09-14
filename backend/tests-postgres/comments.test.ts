import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { prisma } from '../src/lib/prisma.js';
import { createIntentComment, listIntentComments } from '../src/services/comment-service.js';
import { createIntent } from '../src/services/intent-service.js';

let ownerId: string;
let authorId: string;
let intentId: string;

beforeAll(async () => {
  execFileSync(process.execPath, ['node_modules/prisma/build/index.js', 'migrate', 'deploy'], { stdio: 'pipe' });
  const marker = randomUUID();
  const [owner, author] = await Promise.all([
    prisma.user.create({ data: { firebaseUid: `comment-owner-${marker}`, username: `comment_owner_${marker.slice(0, 8)}`, displayName: 'Comment owner' } }),
    prisma.user.create({ data: { firebaseUid: `comment-author-${marker}`, username: `comment_author_${marker.slice(0, 8)}`, displayName: 'Comment author' } }),
  ]);
  ownerId = owner.id;
  authorId = author.id;
  const intent = await createIntent(ownerId, {
    title: 'Intent para comentários reais',
    story: 'Fixture PostgreSQL de comentários',
    supportGoal: 3,
    revealContent: 'Conteúdo protegido da fixture',
    visibility: 'PUBLIC',
  });
  intentId = intent.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('comentários persistidos em PostgreSQL', () => {
  it('aplica a migration versionada', async () => {
    const rows = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'intent_comments'
    `;
    expect(rows).toEqual([{ table_name: 'intent_comments' }]);
  });

  it('cria e lista comentário real com projeção pública do autor', async () => {
    const created = await createIntentComment(intentId, authorId, { body: '  Comentário persistido  ' });
    expect(created).toMatchObject({ body: 'Comentário persistido', author: { id: authorId } });

    const comments = await listIntentComments(intentId, authorId);
    expect(comments).toContainEqual(created);
    expect(Object.keys(created.author)).toEqual(['id', 'username', 'displayName', 'avatarUrl']);
    expect(JSON.stringify(created)).not.toContain('firebaseUid');
    expect(JSON.stringify(created)).not.toContain('revealCiphertext');
  });

  it('mantém as relações e restrições de chave estrangeira', async () => {
    const created = await createIntentComment(intentId, authorId, { body: 'Relações válidas' });
    const related = await prisma.intentComment.findUniqueOrThrow({
      where: { id: created.id },
      select: { intent: { select: { id: true } }, author: { select: { id: true } } },
    });
    expect(related).toEqual({ intent: { id: intentId }, author: { id: authorId } });

    await expect(prisma.intentComment.create({
      data: { intentId: randomUUID(), authorId, body: 'Intent inexistente' },
    })).rejects.toMatchObject({ code: 'P2003' });
    await expect(prisma.intentComment.create({
      data: { intentId, authorId: randomUUID(), body: 'Autor inexistente' },
    })).rejects.toMatchObject({ code: 'P2003' });
  });
});
