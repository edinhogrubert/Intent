import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  IntentReactionType,
  NotificationType,
  PrismaClient,
} from '@prisma/client';
import { revealAssociatedData, sealReveal } from '../domain/reveal-crypto.js';

const VERSION = 'intent-social-demo-seed-2026.09.18.01';
const SEED_PREFIX = 'seed:social-demo';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const backendRoot = resolve(__dirname, '../..');
const repoRoot = resolve(backendRoot, '..');

function loadEnvFile(path: string): void {
  if (!existsSync(path)) {
    return;
  }

  const content = readFileSync(path, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) {
      continue;
    }

    const index = line.indexOf('=');
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(resolve(repoRoot, '.env'));
loadEnvFile(resolve(backendRoot, '.env'));

function fail(message: string): never {
  console.error(`ERRO: ${message}`);
  process.exit(1);
}

function deterministicUuid(kind: string, key: string): string {
  const hash = createHash('sha1').update(`${SEED_PREFIX}:${kind}:${key}`).digest('hex');
  const raw = `${hash.slice(0, 8)}-${hash.slice(8, 12)}-5${hash.slice(13, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
  const chars = raw.split('');
  const variantIndex = 19;
  const variant = Number.parseInt(chars[variantIndex], 16);
  chars[variantIndex] = ((variant & 0x3) | 0x8).toString(16);
  return chars.join('');
}

function nowMinus(minutes: number): Date {
  return new Date(Date.now() - minutes * 60_000);
}

interface SeedUser {
  key: string;
  username: string;
  displayName: string;
  bio: string;
  avatarSeed: string;
}

interface SeedIntent {
  key: string;
  creator: string;
  title: string;
  story: string;
  reveal: string;
  category: string;
  supportGoal: number;
  status: 'PUBLISHED' | 'REALIZED';
  createdMinutesAgo: number;
}

const seedUsers: SeedUser[] = [
  {
    key: 'edinho_grubert',
    username: 'edinho_grubert',
    displayName: 'Edinho Grubert',
    bio: 'Criador do Intent e curador de acontecimentos programáveis.',
    avatarSeed: 'Edinho',
  },
  {
    key: 'miranha',
    username: 'miranha',
    displayName: 'Miranha',
    bio: 'Apoia causas locais, tecnologia aberta e desafios criativos.',
    avatarSeed: 'Miranha',
  },
  {
    key: 'batima',
    username: 'batima',
    displayName: 'Batima',
    bio: 'Organizador de missões comunitárias e metas coletivas.',
    avatarSeed: 'Batima',
  },
  {
    key: 'snoop',
    username: 'snoop',
    displayName: 'Snoop',
    bio: 'Observador social, comenta boas ideias e celebra entregas.',
    avatarSeed: 'Snoop',
  },
  {
    key: 'will',
    username: 'will',
    displayName: 'Will',
    bio: 'Constrói protótipos e apoia projetos de educação digital.',
    avatarSeed: 'Will',
  },
  {
    key: 'henry',
    username: 'henry',
    displayName: 'Henry',
    bio: 'Participa de campanhas, eventos e desafios de impacto.',
    avatarSeed: 'Henry',
  },
  {
    key: 'willian_santos',
    username: 'willian_santos',
    displayName: 'Willian Santos',
    bio: 'Cria conteúdos práticos para tecnologia, estudo e comunidade.',
    avatarSeed: 'Willian',
  },
];

const seedIntents: SeedIntent[] = [
  {
    key: 'guia-intent-comunidade',
    creator: 'edinho_grubert',
    title: 'Liberar guia prático do Intent quando a comunidade apoiar',
    story: 'Um material simples mostrando como transformar ideias em acontecimentos com metas públicas.',
    reveal: 'Conteúdo revelado: link interno para o guia prático do Intent e checklist de criação de acontecimentos.',
    category: 'TECHNOLOGY',
    supportGoal: 5,
    status: 'REALIZED',
    createdMinutesAgo: 1600,
  },
  {
    key: 'mutirao-bairro',
    creator: 'batima',
    title: 'Organizar um mutirão se 6 pessoas confirmarem apoio',
    story: 'A proposta é mobilizar vizinhos para uma ação local com horário, tarefas e responsáveis.',
    reveal: 'Conteúdo revelado: lista de materiais, ponto de encontro e divisão das tarefas do mutirão.',
    category: 'SOCIAL_IMPACT',
    supportGoal: 6,
    status: 'PUBLISHED',
    createdMinutesAgo: 1320,
  },
  {
    key: 'playlist-criadores',
    creator: 'snoop',
    title: 'Soltar playlist colaborativa quando bater a meta',
    story: 'Uma playlist feita por seguidores para marcar uma entrega coletiva e celebrar o progresso.',
    reveal: 'Conteúdo revelado: link da playlist colaborativa e créditos dos participantes.',
    category: 'CULTURE',
    supportGoal: 4,
    status: 'REALIZED',
    createdMinutesAgo: 980,
  },
  {
    key: 'aula-introducao-programacao',
    creator: 'will',
    title: 'Abrir aula gratuita de programação com 7 apoios',
    story: 'Aula introdutória para quem quer entender lógica, terminal e Git sem complicação.',
    reveal: 'Conteúdo revelado: roteiro da aula, repositório de exemplos e exercícios iniciais.',
    category: 'EDUCATION',
    supportGoal: 7,
    status: 'PUBLISHED',
    createdMinutesAgo: 760,
  },
  {
    key: 'desafio-familia',
    creator: 'henry',
    title: 'Criar desafio de fim de semana para família e amigos',
    story: 'Um desafio leve para incentivar fotos, histórias e pequenas conquistas durante o fim de semana.',
    reveal: 'Conteúdo revelado: regras do desafio, prazo e formato de participação.',
    category: 'LIFESTYLE',
    supportGoal: 3,
    status: 'REALIZED',
    createdMinutesAgo: 420,
  },
  {
    key: 'template-campanha-escola',
    creator: 'willian_santos',
    title: 'Publicar template de campanha escolar com meta de participação',
    story: 'Um modelo de campanha para escolas liberarem materiais conforme turmas e responsáveis participam.',
    reveal: 'Conteúdo revelado: modelo de campanha, exemplos de metas e texto para divulgação.',
    category: 'EDUCATION',
    supportGoal: 6,
    status: 'PUBLISHED',
    createdMinutesAgo: 260,
  },
];

const follows: Array<[string, string]> = [
  ['miranha', 'edinho_grubert'],
  ['batima', 'edinho_grubert'],
  ['snoop', 'edinho_grubert'],
  ['will', 'edinho_grubert'],
  ['henry', 'edinho_grubert'],
  ['willian_santos', 'edinho_grubert'],
  ['edinho_grubert', 'miranha'],
  ['edinho_grubert', 'batima'],
  ['edinho_grubert', 'will'],
  ['miranha', 'batima'],
  ['batima', 'miranha'],
  ['snoop', 'will'],
  ['will', 'snoop'],
  ['henry', 'willian_santos'],
  ['willian_santos', 'henry'],
  ['willian_santos', 'will'],
];

const supports: Record<string, string[]> = {
  'guia-intent-comunidade': ['miranha', 'batima', 'snoop', 'will', 'henry', 'willian_santos'],
  'mutirao-bairro': ['edinho_grubert', 'miranha', 'snoop', 'henry'],
  'playlist-criadores': ['edinho_grubert', 'miranha', 'batima', 'will'],
  'aula-introducao-programacao': ['edinho_grubert', 'miranha', 'batima', 'snoop', 'henry'],
  'desafio-familia': ['edinho_grubert', 'miranha', 'willian_santos'],
  'template-campanha-escola': ['edinho_grubert', 'miranha', 'batima', 'snoop'],
};

const comments = [
  ['guia-intent-comunidade', 'miranha', 'Esse guia ajuda a explicar o Intent para quem está chegando agora.'],
  ['guia-intent-comunidade', 'batima', 'A parte de reputação por realização ficou muito boa.'],
  ['mutirao-bairro', 'edinho_grubert', 'Se passar da meta, dá para transformar isso em modelo para outros bairros.'],
  ['playlist-criadores', 'will', 'A playlist ficou com cara de entrega coletiva mesmo.'],
  ['aula-introducao-programacao', 'henry', 'Quero participar da aula e testar os exercícios.'],
  ['template-campanha-escola', 'snoop', 'Esse template pode virar uma categoria própria no Intent.'],
] as const;

const reactions: Array<[string, string, IntentReactionType]> = [
  ['guia-intent-comunidade', 'miranha', IntentReactionType.CELEBRATE],
  ['guia-intent-comunidade', 'will', IntentReactionType.LOVE],
  ['mutirao-bairro', 'edinho_grubert', IntentReactionType.LIKE],
  ['mutirao-bairro', 'henry', IntentReactionType.CELEBRATE],
  ['playlist-criadores', 'batima', IntentReactionType.LOVE],
  ['aula-introducao-programacao', 'miranha', IntentReactionType.LIKE],
  ['desafio-familia', 'willian_santos', IntentReactionType.CELEBRATE],
  ['template-campanha-escola', 'edinho_grubert', IntentReactionType.LOVE],
];

function userId(key: string): string {
  return deterministicUuid('user', key);
}

function intentId(key: string): string {
  return deterministicUuid('intent', key);
}

function commentId(intentKey: string, authorKey: string, index: number): string {
  return deterministicUuid('comment', `${intentKey}:${authorKey}:${index}`);
}

function domainEventId(key: string): string {
  return deterministicUuid('domain-event', key);
}

function notificationId(key: string): string {
  return deterministicUuid('notification', key);
}

function demoEmail(username: string): string {
  return `seed+${username}@intent.local`;
}

function demoAvatar(seed: string): string {
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(seed)}`;
}

async function preflight(prisma: PrismaClient): Promise<void> {
  for (const user of seedUsers) {
    const expectedId = userId(user.key);
    const expectedFirebaseUid = `${SEED_PREFIX}:${user.username}`;
    const email = demoEmail(user.username);
    const conflicts = await prisma.user.findMany({
      where: {
        OR: [
          { id: expectedId },
          { firebaseUid: expectedFirebaseUid },
          { username: user.username },
          { email },
        ],
      },
      select: {
        id: true,
        firebaseUid: true,
        username: true,
        email: true,
      },
    });

    for (const conflict of conflicts) {
      const sameSeedIdentity = conflict.id === expectedId && conflict.firebaseUid === expectedFirebaseUid;
      if (!sameSeedIdentity) {
        fail(
          `conflito seguro bloqueado para @${user.username}. ` +
          `Existe registro id=${conflict.id}, firebaseUid=${conflict.firebaseUid}, email=${conflict.email ?? 'null'}. ` +
          `Não vou sobrescrever usuário real ou criado fora deste seed.`,
        );
      }
    }
  }
}

async function upsertDomainEvent(tx: any, key: string, type: string, actorKey: string | null, intentKey: string | null, payload: unknown, minutesAgo: number): Promise<void> {
  const idempotencyKey = `${SEED_PREFIX}:${key}`;
  await tx.domainEvent.upsert({
    where: { idempotencyKey },
    update: {
      actorId: actorKey ? userId(actorKey) : null,
      intentId: intentKey ? intentId(intentKey) : null,
      type,
      payload,
      occurredAt: nowMinus(minutesAgo),
    },
    create: {
      id: domainEventId(key),
      actorId: actorKey ? userId(actorKey) : null,
      intentId: intentKey ? intentId(intentKey) : null,
      type,
      payload,
      idempotencyKey,
      occurredAt: nowMinus(minutesAgo),
    },
  });
}

async function run(): Promise<void> {
  console.log(`VERSAO_SEED=${VERSION}`);
  console.log(`SEED_PREFIX=${SEED_PREFIX}`);

  const dryRun = process.env.INTENT_SEED_DRY_RUN !== 'NAO';
  const allowWrite = process.env.INTENT_ALLOW_SOCIAL_SEED === 'SIM';
  const allowProduction = process.env.INTENT_ALLOW_PRODUCTION_SOCIAL_SEED === 'SIM';

  if (!process.env.DATABASE_URL) {
    fail('DATABASE_URL ausente.');
  }

  if (!process.env.REVEAL_ENCRYPTION_KEY) {
    fail('REVEAL_ENCRYPTION_KEY ausente.');
  }

  if (process.env.NODE_ENV === 'production' && !allowProduction) {
    fail('NODE_ENV=production bloqueado. Para produção, exija INTENT_ALLOW_PRODUCTION_SOCIAL_SEED=SIM explicitamente.');
  }

  if (!dryRun && !allowWrite) {
    fail('escrita bloqueada. Use INTENT_ALLOW_SOCIAL_SEED=SIM e INTENT_SEED_DRY_RUN=NAO para gravar.');
  }

  const revealKey = Buffer.from(process.env.REVEAL_ENCRYPTION_KEY, 'base64');
  if (revealKey.length !== 32) {
    fail('REVEAL_ENCRYPTION_KEY deve conter exatamente 32 bytes em Base64.');
  }

  console.log(`MODO=${dryRun ? 'DRY_RUN_SEM_ESCRITA' : 'GRAVACAO_AUTORIZADA'}`);
  console.log(`USUARIOS=${seedUsers.length}`);
  console.log(`INTENTS=${seedIntents.length}`);
  console.log(`FOLLOWS=${follows.length}`);
  console.log(`SUPPORTS=${Object.values(supports).reduce((total, list) => total + list.length, 0)}`);
  console.log(`COMMENTS=${comments.length}`);
  console.log(`REACTIONS=${reactions.length}`);

  const prisma = new PrismaClient();

  try {
    await preflight(prisma);

    if (dryRun) {
      console.log('DRY_RUN_OK: nenhum registro foi inserido ou atualizado.');
      return;
    }

    await prisma.$transaction(async (tx) => {
      for (const user of seedUsers) {
        const id = userId(user.key);
        await tx.user.upsert({
          where: { id },
          update: {
            firebaseUid: `${SEED_PREFIX}:${user.username}`,
            email: demoEmail(user.username),
            username: user.username,
            displayName: user.displayName,
            bio: user.bio,
            avatarUrl: demoAvatar(user.avatarSeed),
            status: 'ACTIVE',
          },
          create: {
            id,
            firebaseUid: `${SEED_PREFIX}:${user.username}`,
            email: demoEmail(user.username),
            username: user.username,
            displayName: user.displayName,
            bio: user.bio,
            avatarUrl: demoAvatar(user.avatarSeed),
            status: 'ACTIVE',
          },
        });
      }

      for (const [followerKey, followingKey] of follows) {
        await tx.follow.upsert({
          where: {
            followerId_followingId: {
              followerId: userId(followerKey),
              followingId: userId(followingKey),
            },
          },
          update: {},
          create: {
            id: deterministicUuid('follow', `${followerKey}:${followingKey}`),
            followerId: userId(followerKey),
            followingId: userId(followingKey),
            createdAt: nowMinus(1200),
          },
        });

        await tx.notification.upsert({
          where: { deduplicationKey: `${SEED_PREFIX}:follow:${followerKey}:${followingKey}` },
          update: {
            userId: userId(followingKey),
            actorId: userId(followerKey),
            type: NotificationType.FOLLOW_RECEIVED,
            intentId: null,
          },
          create: {
            id: notificationId(`follow:${followerKey}:${followingKey}`),
            userId: userId(followingKey),
            actorId: userId(followerKey),
            type: NotificationType.FOLLOW_RECEIVED,
            intentId: null,
            deduplicationKey: `${SEED_PREFIX}:follow:${followerKey}:${followingKey}`,
            createdAt: nowMinus(1195),
          },
        });

        await upsertDomainEvent(tx, `follow:${followerKey}:${followingKey}`, 'FOLLOW_CREATED', followerKey, null, { followerKey, followingKey, seed: true }, 1190);
      }

      for (const intent of seedIntents) {
        const id = intentId(intent.key);
        const revealVersion = 1;
        const sealed = sealReveal(intent.reveal, revealKey, revealAssociatedData(id, revealVersion));
        const createdAt = nowMinus(intent.createdMinutesAgo);
        const realizedAt = intent.status === 'REALIZED' ? nowMinus(Math.max(intent.createdMinutesAgo - 180, 5)) : null;

        await tx.intent.upsert({
          where: { id },
          update: {
            creatorId: userId(intent.creator),
            type: 'SUPPORT_REVEAL',
            conditionType: 'SUPPORT',
            status: intent.status,
            visibility: 'PUBLIC',
            category: intent.category,
            title: intent.title,
            story: intent.story,
            supportGoal: intent.supportGoal,
            revealCiphertext: sealed.ciphertext,
            revealIv: sealed.iv,
            revealAuthTag: sealed.authTag,
            revealVersion,
            realizedAt,
          },
          create: {
            id,
            creatorId: userId(intent.creator),
            type: 'SUPPORT_REVEAL',
            conditionType: 'SUPPORT',
            status: intent.status,
            visibility: 'PUBLIC',
            category: intent.category,
            title: intent.title,
            story: intent.story,
            supportGoal: intent.supportGoal,
            supportCount: 0,
            revealCiphertext: sealed.ciphertext,
            revealIv: sealed.iv,
            revealAuthTag: sealed.authTag,
            revealVersion,
            publishedAt: createdAt,
            createdAt,
            realizedAt,
          },
        });

        await upsertDomainEvent(tx, `intent-created:${intent.key}`, 'INTENT_CREATED', intent.creator, intent.key, { intentKey: intent.key, seed: true }, intent.createdMinutesAgo);
      }

      for (const [intentKey, supporterKeys] of Object.entries(supports)) {
        for (const supporterKey of supporterKeys) {
          await tx.support.upsert({
            where: {
              intentId_userId: {
                intentId: intentId(intentKey),
                userId: userId(supporterKey),
              },
            },
            update: {},
            create: {
              id: deterministicUuid('support', `${intentKey}:${supporterKey}`),
              intentId: intentId(intentKey),
              userId: userId(supporterKey),
              createdAt: nowMinus(600),
            },
          });

          const targetIntent = seedIntents.find((intent) => intent.key === intentKey);
          if (targetIntent && targetIntent.creator !== supporterKey) {
            await tx.notification.upsert({
              where: { deduplicationKey: `${SEED_PREFIX}:support:${intentKey}:${supporterKey}` },
              update: {
                userId: userId(targetIntent.creator),
                actorId: userId(supporterKey),
                type: NotificationType.SUPPORT_RECEIVED,
                intentId: intentId(intentKey),
              },
              create: {
                id: notificationId(`support:${intentKey}:${supporterKey}`),
                userId: userId(targetIntent.creator),
                actorId: userId(supporterKey),
                type: NotificationType.SUPPORT_RECEIVED,
                intentId: intentId(intentKey),
                deduplicationKey: `${SEED_PREFIX}:support:${intentKey}:${supporterKey}`,
                createdAt: nowMinus(595),
              },
            });
          }

          await upsertDomainEvent(tx, `support:${intentKey}:${supporterKey}`, 'INTENT_SUPPORTED', supporterKey, intentKey, { intentKey, supporterKey, seed: true }, 590);
        }
      }

      for (const [index, [intentKey, authorKey, body]] of comments.entries()) {
        const targetIntent = seedIntents.find((intent) => intent.key === intentKey);
        const id = commentId(intentKey, authorKey, index);
        await tx.intentComment.upsert({
          where: { id },
          update: {
            intentId: intentId(intentKey),
            authorId: userId(authorKey),
            body,
          },
          create: {
            id,
            intentId: intentId(intentKey),
            authorId: userId(authorKey),
            body,
            createdAt: nowMinus(360 - index * 12),
          },
        });

        if (targetIntent && targetIntent.creator !== authorKey) {
          await tx.notification.upsert({
            where: { deduplicationKey: `${SEED_PREFIX}:comment:${intentKey}:${authorKey}:${index}` },
            update: {
              userId: userId(targetIntent.creator),
              actorId: userId(authorKey),
              type: NotificationType.INTENT_COMMENT_RECEIVED,
              intentId: intentId(intentKey),
            },
            create: {
              id: notificationId(`comment:${intentKey}:${authorKey}:${index}`),
              userId: userId(targetIntent.creator),
              actorId: userId(authorKey),
              type: NotificationType.INTENT_COMMENT_RECEIVED,
              intentId: intentId(intentKey),
              deduplicationKey: `${SEED_PREFIX}:comment:${intentKey}:${authorKey}:${index}`,
              createdAt: nowMinus(350 - index * 12),
            },
          });
        }

        await upsertDomainEvent(tx, `comment:${intentKey}:${authorKey}:${index}`, 'INTENT_COMMENTED', authorKey, intentKey, { intentKey, authorKey, body, seed: true }, 340 - index * 12);
      }

      for (const [intentKey, actorKey, type] of reactions) {
        const targetIntent = seedIntents.find((intent) => intent.key === intentKey);
        await tx.intentReaction.upsert({
          where: {
            intentId_userId: {
              intentId: intentId(intentKey),
              userId: userId(actorKey),
            },
          },
          update: { type },
          create: {
            id: deterministicUuid('reaction', `${intentKey}:${actorKey}`),
            intentId: intentId(intentKey),
            userId: userId(actorKey),
            type,
            createdAt: nowMinus(220),
          },
        });

        if (targetIntent && targetIntent.creator !== actorKey) {
          await tx.notification.upsert({
            where: { deduplicationKey: `${SEED_PREFIX}:reaction:${intentKey}:${actorKey}` },
            update: {
              userId: userId(targetIntent.creator),
              actorId: userId(actorKey),
              type: NotificationType.INTENT_REACTION_RECEIVED,
              intentId: intentId(intentKey),
            },
            create: {
              id: notificationId(`reaction:${intentKey}:${actorKey}`),
              userId: userId(targetIntent.creator),
              actorId: userId(actorKey),
              type: NotificationType.INTENT_REACTION_RECEIVED,
              intentId: intentId(intentKey),
              deduplicationKey: `${SEED_PREFIX}:reaction:${intentKey}:${actorKey}`,
              createdAt: nowMinus(215),
            },
          });
        }

        await upsertDomainEvent(tx, `reaction:${intentKey}:${actorKey}`, 'INTENT_REACTED', actorKey, intentKey, { intentKey, actorKey, type, seed: true }, 210);
      }

      for (const intent of seedIntents) {
        const supportCount = await tx.support.count({ where: { intentId: intentId(intent.key) } });
        await tx.intent.update({
          where: { id: intentId(intent.key) },
          data: { supportCount },
        });

        if (intent.status === 'REALIZED') {
          await upsertDomainEvent(tx, `intent-realized:${intent.key}`, 'INTENT_REALIZED', intent.creator, intent.key, { intentKey: intent.key, supportCount, seed: true }, 120);
        }
      }
    });

    console.log('SEED_OK: dados sociais demo inseridos/atualizados com segurança.');
  } finally {
    await prisma.$disconnect();
  }
}

run().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
