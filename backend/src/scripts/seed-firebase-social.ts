import { createCipheriv, randomBytes } from 'node:crypto';
import { PrismaClient, IntentReactionType, NotificationType } from '@prisma/client';

const prisma = new PrismaClient();

const DRY_RUN = process.env.INTENT_SEED_DRY_RUN !== 'NAO';
const ALLOW_WRITE = process.env.INTENT_ALLOW_EXISTING_USERS_SOCIAL_SEED === 'SIM';
const ALLOW_PRODUCTION = process.env.INTENT_ALLOW_PRODUCTION_SEED === 'SIM';
const USER_LIMIT = Number.parseInt(process.env.INTENT_SOCIAL_SEED_USER_LIMIT ?? '7', 10);
const USERNAME_FILTER = (process.env.INTENT_SOCIAL_SEED_USERNAMES ?? '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

const INTENT_IDS = [
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333',
  '44444444-4444-4444-8444-444444444444',
  '55555555-5555-4555-8555-555555555555',
  '66666666-6666-4666-8666-666666666666',
];

const COMMENT_IDS = [
  'aaaaaaaa-1111-4111-8111-aaaaaaaaaaa1',
  'aaaaaaaa-2222-4222-8222-aaaaaaaaaaa2',
  'aaaaaaaa-3333-4333-8333-aaaaaaaaaaa3',
  'aaaaaaaa-4444-4444-8444-aaaaaaaaaaa4',
  'aaaaaaaa-5555-4555-8555-aaaaaaaaaaa5',
  'aaaaaaaa-6666-4666-8666-aaaaaaaaaaa6',
];

function assertSafeExecution() {
  if (process.env.NODE_ENV === 'production' && !ALLOW_PRODUCTION) {
    throw new Error('Seed bloqueado em NODE_ENV=production. Use INTENT_ALLOW_PRODUCTION_SEED=SIM somente com autorização explícita.');
  }

  if (!DRY_RUN && !ALLOW_WRITE) {
    throw new Error('Seed real bloqueado. Use INTENT_ALLOW_EXISTING_USERS_SOCIAL_SEED=SIM INTENT_SEED_DRY_RUN=NAO.');
  }
}

function getRevealKey(): Buffer {
  const raw = process.env.REVEAL_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error('REVEAL_ENCRYPTION_KEY ausente.');
  }

  const key = Buffer.from(raw, 'base64');
  if (key.length !== 32) {
    throw new Error('REVEAL_ENCRYPTION_KEY deve conter exatamente 32 bytes em Base64.');
  }

  return key;
}

function sealReveal(plaintext: string, intentId: string, version = 1) {
  const key = getRevealKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  cipher.setAAD(Buffer.from(`intent:${intentId}:reveal:v${version}`, 'utf8'));

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);

  return {
    revealCiphertext: encrypted.toString('base64'),
    revealIv: iv.toString('base64'),
    revealAuthTag: cipher.getAuthTag().toString('base64'),
    revealVersion: version,
  };
}

type ExistingUser = Awaited<ReturnType<typeof loadUsers>>[number];

async function loadUsers() {
  if (USERNAME_FILTER.length > 0) {
    const users = await prisma.user.findMany({
      where: {
        username: { in: USERNAME_FILTER },
        status: 'ACTIVE',
      },
      orderBy: { createdAt: 'asc' },
    });

    const found = new Set(users.map((user) => user.username));
    const missing = USERNAME_FILTER.filter((username) => !found.has(username));
    if (missing.length > 0) {
      throw new Error(`Usuários informados não existem na base users: ${missing.join(', ')}`);
    }

    return users;
  }

  return prisma.user.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'asc' },
    take: Number.isFinite(USER_LIMIT) && USER_LIMIT > 0 ? USER_LIMIT : 7,
  });
}

function intentPlans(users: ExistingUser[]) {
  const categories = ['SOCIAL', 'TECHNOLOGY', 'CULTURE', 'EDUCATION', 'COMMUNITY', 'OTHER'];
  const titles = [
    'Organizar um encontro aberto para testar o Intent',
    'Publicar um protótipo social validado por apoiadores',
    'Liberar uma curadoria cultural quando a meta for alcançada',
    'Criar um guia público para novos participantes',
    'Mobilizar pessoas para uma ação local simples',
    'Registrar uma conquista coletiva da rede',
  ];
  const stories = [
    'Uma Intent para reunir pessoas reais em torno de um acontecimento simples e verificável.',
    'Um teste social usando usuários já existentes para validar feed, perfil, apoios e reações.',
    'Uma proposta de conteúdo liberado por engajamento, mantendo a lógica de expectativa do Intent.',
    'Uma Intent educacional para demonstrar como participantes acompanham uma meta pública.',
    'Um acontecimento social pensado para mostrar mobilização e reputação por realização.',
    'Uma publicação de fechamento para validar histórico, notificações e participação.',
  ];
  const reveals = [
    'Revelação: o encontro será usado para validar o fluxo social ponta a ponta.',
    'Revelação: o protótipo foi aprovado pelos apoiadores e pode virar bloco oficial.',
    'Revelação: a curadoria será publicada em formato aberto para os participantes.',
    'Revelação: o guia será usado para explicar o Intent para usuários novos.',
    'Revelação: a ação local terá registro público de participação.',
    'Revelação: a conquista coletiva ficará registrada no perfil dos envolvidos.',
  ];

  return INTENT_IDS.map((id, index) => {
    const creator = users[index % users.length];
    const status = index === 1 || index === 5 ? 'REALIZED' : 'PUBLISHED';
    const supportGoal = 3 + index;

    return {
      id,
      creator,
      data: {
        type: 'SUPPORT_REVEAL',
        conditionType: 'SUPPORT',
        status,
        visibility: 'PUBLIC',
        category: categories[index],
        title: titles[index],
        story: stories[index],
        supportGoal,
        realizedAt: status === 'REALIZED' ? new Date(Date.now() - (index + 1) * 60 * 60 * 1000) : null,
        publishedAt: new Date(Date.now() - (index + 2) * 24 * 60 * 60 * 1000),
        revealPlaintext: reveals[index],
      },
    };
  });
}

async function upsertIntent(plan: ReturnType<typeof intentPlans>[number]) {
  const existing = await prisma.intent.findUnique({ where: { id: plan.id } });

  if (existing) {
    await prisma.intent.update({
      where: { id: plan.id },
      data: {
        creatorId: plan.creator.id,
        type: plan.data.type,
        conditionType: plan.data.conditionType,
        status: plan.data.status,
        visibility: plan.data.visibility,
        category: plan.data.category,
        title: plan.data.title,
        story: plan.data.story,
        supportGoal: plan.data.supportGoal,
        realizedAt: plan.data.realizedAt,
        publishedAt: plan.data.publishedAt,
      },
    });
    return;
  }

  const sealed = sealReveal(plan.data.revealPlaintext, plan.id, 1);

  await prisma.intent.create({
    data: {
      id: plan.id,
      creatorId: plan.creator.id,
      type: plan.data.type,
      conditionType: plan.data.conditionType,
      status: plan.data.status,
      visibility: plan.data.visibility,
      category: plan.data.category,
      title: plan.data.title,
      story: plan.data.story,
      supportGoal: plan.data.supportGoal,
      supportCount: 0,
      guardianIds: [],
      guardianApprovals: [],
      guardianApprovalGoal: null,
      revealCiphertext: sealed.revealCiphertext,
      revealIv: sealed.revealIv,
      revealAuthTag: sealed.revealAuthTag,
      revealVersion: sealed.revealVersion,
      realizedAt: plan.data.realizedAt,
      publishedAt: plan.data.publishedAt,
    },
  });
}

async function main() {
  assertSafeExecution();

  console.log('INTENT_EXISTING_USERS_SOCIAL_SEED');
  console.log(`DRY_RUN=${DRY_RUN ? 'SIM' : 'NAO'}`);
  console.log(`NODE_ENV=${process.env.NODE_ENV ?? 'indefinido'}`);
  console.log(`USER_LIMIT=${USER_LIMIT}`);
  console.log(`USERNAME_FILTER=${USERNAME_FILTER.length > 0 ? USERNAME_FILTER.join(',') : 'AUTO'}`);

  const users = await loadUsers();

  if (users.length < 3) {
    throw new Error(`Seed social exige pelo menos 3 usuários ACTIVE já existentes na tabela users. Encontrados: ${users.length}.`);
  }

  console.log(`USERS_EXISTENTES=${users.length}`);
  for (const user of users) {
    console.log(`USER=${user.username} | firebaseUid=${user.firebaseUid} | email=${user.email ?? 'sem-email'}`);
  }

  const plans = intentPlans(users);
  const followPairs = users.flatMap((user, index) => {
    const next = users[(index + 1) % users.length];
    const previous = users[(index + users.length - 1) % users.length];
    return [
      { followerId: user.id, followingId: next.id },
      { followerId: user.id, followingId: previous.id },
    ].filter((pair) => pair.followerId !== pair.followingId);
  });

  const supportPlans = plans.flatMap((plan, intentIndex) => users
    .filter((user) => user.id !== plan.creator.id)
    .slice(0, Math.min(users.length - 1, 4 + (intentIndex % 2)))
    .map((user) => ({ intentId: plan.id, userId: user.id })));

  const reactionTypes = [IntentReactionType.LIKE, IntentReactionType.LOVE, IntentReactionType.CELEBRATE];
  const reactionPlans = supportPlans.map((support, index) => ({
    ...support,
    type: reactionTypes[index % reactionTypes.length],
  }));

  const commentPlans = plans.map((plan, index) => {
    const author = users[(index + 1) % users.length];
    return {
      id: COMMENT_IDS[index],
      intentId: plan.id,
      authorId: author.id,
      body: `Comentário de validação social da Intent por @${author.username}.`,
    };
  });

  console.log(`PLANO_INTENTS=${plans.length}`);
  console.log(`PLANO_FOLLOWS=${followPairs.length}`);
  console.log(`PLANO_SUPPORTS=${supportPlans.length}`);
  console.log(`PLANO_REACTIONS=${reactionPlans.length}`);
  console.log(`PLANO_COMMENTS=${commentPlans.length}`);

  if (DRY_RUN) {
    console.log('DRY_RUN_OK=nenhuma escrita executada');
    return;
  }

  for (const pair of followPairs) {
    await prisma.follow.upsert({
      where: { followerId_followingId: pair },
      update: {},
      create: pair,
    });
  }

  for (const plan of plans) {
    await upsertIntent(plan);
  }

  for (const support of supportPlans) {
    await prisma.support.upsert({
      where: { intentId_userId: support },
      update: {},
      create: support,
    });
  }

  for (const reaction of reactionPlans) {
    await prisma.intentReaction.upsert({
      where: {
        intentId_userId: {
          intentId: reaction.intentId,
          userId: reaction.userId,
        },
      },
      update: { type: reaction.type },
      create: reaction,
    });
  }

  for (const comment of commentPlans) {
    await prisma.intentComment.upsert({
      where: { id: comment.id },
      update: { body: comment.body, authorId: comment.authorId, intentId: comment.intentId },
      create: comment,
    });
  }

  for (const plan of plans) {
    const supportCount = await prisma.support.count({ where: { intentId: plan.id } });
    await prisma.intent.update({ where: { id: plan.id }, data: { supportCount } });
  }

  for (const plan of plans) {
    const actor = users.find((user) => user.id !== plan.creator.id) ?? users[0];
    await prisma.notification.upsert({
      where: { deduplicationKey: `seed-existing-users-social:intent:${plan.id}:support` },
      update: {},
      create: {
        userId: plan.creator.id,
        actorId: actor.id,
        intentId: plan.id,
        type: NotificationType.SUPPORT_RECEIVED,
        deduplicationKey: `seed-existing-users-social:intent:${plan.id}:support`,
      },
    });

    await prisma.domainEvent.upsert({
      where: { idempotencyKey: `seed-existing-users-social:intent:${plan.id}:published` },
      update: {},
      create: {
        intentId: plan.id,
        actorId: plan.creator.id,
        type: 'SEED_EXISTING_USERS_SOCIAL_INTENT_READY',
        payload: {
          source: 'seed-existing-users-social',
          title: plan.data.title,
        },
        idempotencyKey: `seed-existing-users-social:intent:${plan.id}:published`,
      },
    });
  }

  console.log('SEED_GRAVADO=SIM');
  console.log(`USERS_REAPROVEITADOS=${users.length}`);
  console.log(`INTENTS_UPSERT=${plans.length}`);
  console.log(`FOLLOWS_UPSERT=${followPairs.length}`);
  console.log(`SUPPORTS_UPSERT=${supportPlans.length}`);
  console.log(`REACTIONS_UPSERT=${reactionPlans.length}`);
  console.log(`COMMENTS_UPSERT=${commentPlans.length}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
