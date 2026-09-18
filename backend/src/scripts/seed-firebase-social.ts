import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient, IntentReactionType, NotificationType } from '@prisma/client';
import { firebaseAuth } from '../lib/firebase.js';
import { config } from '../config.js';
import { revealAssociatedData, sealReveal } from '../domain/reveal-crypto.js';

const prisma = new PrismaClient();
const VERSION = 'intent-firebase-social-seed-2026.09.18.01';

type RealUserInput = {
  key: string;
  username: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  firebaseUid?: string;
  email?: string;
};

type SeedManifest = {
  users: RealUserInput[];
};

type ResolvedSeedUser = Required<Pick<RealUserInput, 'key' | 'username'>> & {
  firebaseUid: string;
  email: string | null;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
};

type SeedIntent = {
  slug: string;
  creatorKey: string;
  title: string;
  story: string;
  category: string;
  supportGoal: number;
  status: 'PUBLISHED' | 'REALIZED';
  reveal: string;
};

const dryRun = process.env.INTENT_SEED_DRY_RUN !== 'NAO';
const allowSeed = process.env.INTENT_ALLOW_FIREBASE_SOCIAL_SEED === 'SIM';
const allowProduction = process.env.INTENT_ALLOW_PRODUCTION_SEED === 'SIM';

const defaultManifestCandidates = [
  process.env.INTENT_FIREBASE_SOCIAL_USERS_FILE,
  resolve(dirname(fileURLToPath(import.meta.url)), '../../prisma/firebase-social-users.json'),
].filter(Boolean) as string[];

const intents: SeedIntent[] = [
  {
    slug: 'biblioteca-comunitaria',
    creatorKey: 'edinho_grubert',
    title: 'Liberar biblioteca comunitária do bairro',
    story: 'Uma intent para mobilizar pessoas, livros e voluntários em torno de uma biblioteca comunitária local.',
    category: 'SOCIAL_IMPACT',
    supportGoal: 6,
    status: 'REALIZED',
    reveal: 'A biblioteca foi organizada com prateleiras, livros separados por idade e uma escala inicial de voluntários.',
  },
  {
    slug: 'oficina-tecnologia',
    creatorKey: 'will',
    title: 'Oficina aberta de tecnologia para iniciantes',
    story: 'Se a comunidade demonstrar interesse, abriremos uma oficina prática de tecnologia para quem está começando.',
    category: 'TECHNOLOGY',
    supportGoal: 5,
    status: 'PUBLISHED',
    reveal: 'Link da primeira turma: será liberado quando a meta de apoio for atingida.',
  },
  {
    slug: 'mutirao-praca',
    creatorKey: 'miranha',
    title: 'Mutirão para revitalizar uma praça',
    story: 'Um chamado público para reunir moradores em uma ação simples de cuidado com a praça.',
    category: 'COMMUNITY',
    supportGoal: 5,
    status: 'REALIZED',
    reveal: 'O mutirão aconteceu com pintura, limpeza e reorganização dos espaços de convivência.',
  },
  {
    slug: 'playlist-cultural',
    creatorKey: 'snoop',
    title: 'Playlist colaborativa de cultura local',
    story: 'Uma intent para reunir recomendações de música, eventos e artistas locais indicados pela rede.',
    category: 'CULTURE',
    supportGoal: 4,
    status: 'PUBLISHED',
    reveal: 'Playlist e curadoria serão publicadas após a meta.',
  },
  {
    slug: 'grupo-estudos',
    creatorKey: 'henry',
    title: 'Grupo de estudos com encontros semanais',
    story: 'Um experimento para organizar encontros de estudo com compromisso público e participação recorrente.',
    category: 'EDUCATION',
    supportGoal: 5,
    status: 'PUBLISHED',
    reveal: 'Agenda inicial e material de apoio ficam disponíveis quando a meta for atingida.',
  },
  {
    slug: 'desafio-criadores',
    creatorKey: 'willian_santos',
    title: 'Desafio de criadores por 7 dias',
    story: 'Criadores publicam um pequeno avanço por dia e liberam o bastidor completo ao final.',
    category: 'CREATOR',
    supportGoal: 5,
    status: 'PUBLISHED',
    reveal: 'Bastidores e roteiro do desafio serão liberados para os apoiadores.',
  },
];

const followPairs: Array<[string, string]> = [
  ['miranha', 'edinho_grubert'],
  ['batima', 'edinho_grubert'],
  ['snoop', 'edinho_grubert'],
  ['will', 'edinho_grubert'],
  ['henry', 'edinho_grubert'],
  ['willian_santos', 'edinho_grubert'],
  ['edinho_grubert', 'miranha'],
  ['edinho_grubert', 'will'],
  ['miranha', 'batima'],
  ['batima', 'miranha'],
  ['snoop', 'will'],
  ['will', 'snoop'],
  ['henry', 'willian_santos'],
  ['willian_santos', 'henry'],
  ['batima', 'snoop'],
  ['will', 'henry'],
];

const comments = [
  'Isso tem potencial de virar referência para a comunidade.',
  'A ideia ficou clara e dá vontade de participar.',
  'Quando abrir, quero acompanhar os próximos passos.',
  'Esse tipo de acontecimento combina muito com o Intent.',
  'Boa mobilização. O próximo passo ficou objetivo.',
];

function log(message: string) {
  console.log(message);
}

function fail(message: string): never {
  throw new Error(message);
}

function readManifest(): SeedManifest {
  const inline = process.env.INTENT_FIREBASE_SOCIAL_USERS_JSON;
  if (inline?.trim()) {
    return JSON.parse(inline) as SeedManifest;
  }

  for (const candidate of defaultManifestCandidates) {
    if (existsSync(candidate)) {
      return JSON.parse(readFileSync(candidate, 'utf8')) as SeedManifest;
    }
  }

  fail([
    'Manifesto de usuários reais não encontrado.',
    'Defina INTENT_FIREBASE_SOCIAL_USERS_JSON ou INTENT_FIREBASE_SOCIAL_USERS_FILE.',
    'Cada usuário precisa ter key, username e firebaseUid ou email resolvível no Firebase Auth.',
  ].join(' '));
}

function validateManifest(manifest: SeedManifest) {
  if (!Array.isArray(manifest.users) || manifest.users.length < 2) {
    fail('Manifesto inválido: informe ao menos 2 usuários reais.');
  }

  const keys = new Set<string>();
  const usernames = new Set<string>();
  for (const user of manifest.users) {
    if (!user.key || !user.username) fail('Manifesto inválido: key e username são obrigatórios.');
    if (!user.firebaseUid && !user.email) fail(`Usuário ${user.key} precisa de firebaseUid ou email.`);
    if (keys.has(user.key)) fail(`key duplicada no manifesto: ${user.key}`);
    if (usernames.has(user.username)) fail(`username duplicado no manifesto: ${user.username}`);
    keys.add(user.key);
    usernames.add(user.username);
  }
}

async function resolveFirebaseUser(input: RealUserInput): Promise<ResolvedSeedUser> {
  const authUser = input.firebaseUid
    ? await firebaseAuth.getUser(input.firebaseUid)
    : await firebaseAuth.getUserByEmail(input.email as string);

  if (input.email && authUser.email && input.email.toLowerCase() !== authUser.email.toLowerCase()) {
    fail(`E-mail divergente para ${input.key}: manifesto=${input.email} firebase=${authUser.email}`);
  }

  return {
    key: input.key,
    username: input.username,
    firebaseUid: authUser.uid,
    email: authUser.email ?? input.email ?? null,
    displayName: input.displayName ?? authUser.displayName ?? input.username,
    bio: input.bio ?? null,
    avatarUrl: input.avatarUrl ?? authUser.photoURL ?? null,
  };
}

async function preflightConflicts(users: ResolvedSeedUser[]) {
  for (const user of users) {
    const byUid = await prisma.user.findUnique({ where: { firebaseUid: user.firebaseUid } });
    if (byUid && byUid.username !== user.username) {
      fail(`Conflito: firebaseUid ${user.firebaseUid} já pertence ao username ${byUid.username}, não ${user.username}.`);
    }

    const byUsername = await prisma.user.findUnique({ where: { username: user.username } });
    if (byUsername && byUsername.firebaseUid !== user.firebaseUid) {
      fail(`Conflito: username ${user.username} já pertence a outro firebaseUid.`);
    }

    if (user.email) {
      const byEmail = await prisma.user.findUnique({ where: { email: user.email } });
      if (byEmail && byEmail.firebaseUid !== user.firebaseUid) {
        fail(`Conflito: email ${user.email} já pertence a outro firebaseUid.`);
      }
    }
  }
}

function idFor(prefix: string, value: string) {
  const hex = createHash('sha256').update(`intent:${prefix}:${value}`).digest('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

async function upsertUsers(users: ResolvedSeedUser[]) {
  const map = new Map<string, string>();
  for (const user of users) {
    const row = await prisma.user.upsert({
      where: { firebaseUid: user.firebaseUid },
      create: {
        id: idFor('user', user.firebaseUid),
        firebaseUid: user.firebaseUid,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        status: 'ACTIVE',
      },
      update: {
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        status: 'ACTIVE',
      },
    });
    map.set(user.key, row.id);
  }
  return map;
}

async function upsertFollow(followerId: string, followingId: string) {
  if (followerId === followingId) return;
  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId, followingId } },
    create: { followerId, followingId },
    update: {},
  });
}

async function upsertIntent(seed: SeedIntent, userIds: Map<string, string>) {
  const creatorId = userIds.get(seed.creatorKey);
  if (!creatorId) fail(`Creator ausente no manifesto: ${seed.creatorKey}`);

  const id = idFor('intent', seed.slug);
  const sealed = sealReveal(seed.reveal, config.revealEncryptionKey, revealAssociatedData(id, 1));
  const realizedAt = seed.status === 'REALIZED' ? new Date() : null;

  return prisma.intent.upsert({
    where: { id },
    create: {
      id,
      creatorId,
      type: 'SUPPORT_REVEAL',
      conditionType: 'SUPPORT',
      status: seed.status,
      visibility: 'PUBLIC',
      category: seed.category,
      title: seed.title,
      story: seed.story,
      supportGoal: seed.supportGoal,
      supportCount: 0,
      revealCiphertext: sealed.ciphertext,
      revealIv: sealed.iv,
      revealAuthTag: sealed.authTag,
      revealVersion: 1,
      realizedAt,
    },
    update: {
      creatorId,
      status: seed.status,
      visibility: 'PUBLIC',
      category: seed.category,
      title: seed.title,
      story: seed.story,
      supportGoal: seed.supportGoal,
      revealCiphertext: sealed.ciphertext,
      revealIv: sealed.iv,
      revealAuthTag: sealed.authTag,
      revealVersion: 1,
      realizedAt,
    },
  });
}

async function upsertSupport(intentId: string, userId: string) {
  await prisma.support.upsert({
    where: { intentId_userId: { intentId, userId } },
    create: { intentId, userId },
    update: {},
  });
}

async function upsertReaction(intentId: string, userId: string, type: IntentReactionType) {
  await prisma.intentReaction.upsert({
    where: { intentId_userId: { intentId, userId } },
    create: { intentId, userId, type },
    update: { type },
  });
}

async function upsertComment(intentId: string, authorId: string, body: string) {
  const id = idFor('comment', `${intentId}:${authorId}:${body}`);
  await prisma.intentComment.upsert({
    where: { id },
    create: { id, intentId, authorId, body },
    update: { body },
  });
}

async function upsertNotification(userId: string, actorId: string, type: NotificationType, intentId: string | null, key: string) {
  await prisma.notification.upsert({
    where: { deduplicationKey: key },
    create: { userId, actorId, type, intentId, deduplicationKey: key },
    update: { userId, actorId, type, intentId },
  });
}

async function upsertEvent(intentId: string | null, actorId: string | null, type: string, payload: unknown, key: string) {
  await prisma.domainEvent.upsert({
    where: { idempotencyKey: key },
    create: { intentId, actorId, type, payload: payload as object, idempotencyKey: key },
    update: { intentId, actorId, type, payload: payload as object },
  });
}

async function main() {
  log(`VERSAO_SEED=${VERSION}`);
  log(`NODE_ENV=${config.nodeEnv}`);
  log(`FIREBASE_PROJECT_ID=${config.firebaseProjectId}`);
  log(`DRY_RUN=${dryRun ? 'SIM' : 'NAO'}`);

  if (config.nodeEnv === 'production' && !allowProduction) {
    fail('Seed bloqueado em production. Use INTENT_ALLOW_PRODUCTION_SEED=SIM para autorizar explicitamente.');
  }

  if (!dryRun && !allowSeed) {
    fail('Para gravar, use INTENT_ALLOW_FIREBASE_SOCIAL_SEED=SIM INTENT_SEED_DRY_RUN=NAO.');
  }

  const manifest = readManifest();
  validateManifest(manifest);

  const resolvedUsers = [] as ResolvedSeedUser[];
  for (const user of manifest.users) {
    resolvedUsers.push(await resolveFirebaseUser(user));
  }

  await preflightConflicts(resolvedUsers);

  const resolvedKeys = new Set(resolvedUsers.map((user) => user.key));
  for (const intent of intents) {
    if (!resolvedKeys.has(intent.creatorKey)) {
      fail(`Manifesto não contém usuário necessário para intent ${intent.slug}: ${intent.creatorKey}`);
    }
  }

  log(`USUARIOS_FIREBASE_RESOLVIDOS=${resolvedUsers.length}`);
  for (const user of resolvedUsers) {
    log(` - ${user.key} | ${user.username} | ${user.email ?? 'sem-email'} | ${user.firebaseUid}`);
  }

  if (dryRun) {
    log('DRY_RUN_OK=SIM');
    log('Nenhuma escrita foi feita.');
    return;
  }

  await prisma.$transaction(async () => {
    const userIds = await upsertUsers(resolvedUsers);

    for (const [followerKey, followingKey] of followPairs) {
      const followerId = userIds.get(followerKey);
      const followingId = userIds.get(followingKey);
      if (followerId && followingId) {
        await upsertFollow(followerId, followingId);
        await upsertNotification(followingId, followerId, NotificationType.FOLLOW_RECEIVED, null, `seed-firebase-social:follow:${followerId}:${followingId}`);
        await upsertEvent(null, followerId, 'FOLLOW_CREATED', { followingId }, `seed-firebase-social:event:follow:${followerId}:${followingId}`);
      }
    }

    const allUserIds = Array.from(userIds.values());
    for (const seed of intents) {
      const intent = await upsertIntent(seed, userIds);
      await upsertEvent(intent.id, intent.creatorId, 'INTENT_SEEDED', { slug: seed.slug, status: seed.status }, `seed-firebase-social:event:intent:${seed.slug}`);

      const supporters = allUserIds.filter((id) => id !== intent.creatorId).slice(0, Math.min(seed.supportGoal, Math.max(2, allUserIds.length - 1)));
      for (const supporterId of supporters) {
        await upsertSupport(intent.id, supporterId);
        await upsertNotification(intent.creatorId, supporterId, NotificationType.SUPPORT_RECEIVED, intent.id, `seed-firebase-social:support:${intent.id}:${supporterId}`);
      }

      const reactionTypes = [IntentReactionType.LIKE, IntentReactionType.LOVE, IntentReactionType.CELEBRATE];
      for (let i = 0; i < supporters.length; i += 1) {
        await upsertReaction(intent.id, supporters[i], reactionTypes[i % reactionTypes.length]);
        await upsertNotification(intent.creatorId, supporters[i], NotificationType.INTENT_REACTION_RECEIVED, intent.id, `seed-firebase-social:reaction:${intent.id}:${supporters[i]}`);
      }

      for (let i = 0; i < Math.min(3, supporters.length); i += 1) {
        await upsertComment(intent.id, supporters[i], comments[i % comments.length]);
        await upsertNotification(intent.creatorId, supporters[i], NotificationType.INTENT_COMMENT_RECEIVED, intent.id, `seed-firebase-social:comment:${intent.id}:${supporters[i]}:${i}`);
      }

      const supportCount = await prisma.support.count({ where: { intentId: intent.id } });
      await prisma.intent.update({ where: { id: intent.id }, data: { supportCount } });
    }
  }, { timeout: 20000 });

  log('SEED_FIREBASE_SOCIAL_OK=SIM');
}

main()
  .catch((error) => {
    console.error('SEED_FIREBASE_SOCIAL_ERRO=SIM');
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
