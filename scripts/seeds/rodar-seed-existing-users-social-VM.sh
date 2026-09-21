#!/usr/bin/env bash
set -Eeuo pipefail

VERSION="intent-existing-users-social-runner-VM-2026.09.18.01"
CONTAINER_API="${INTENT_API_CONTAINER:-intent-api}"
DRY_RUN="${INTENT_SEED_DRY_RUN:-SIM}"
ALLOW_WRITE="${INTENT_ALLOW_EXISTING_USERS_SOCIAL_SEED:-NAO}"

section() {
  echo
  echo "================================================================"
  echo "$1"
  echo "================================================================"
}

fail() {
  echo "ERRO: $1"
  exit 1
}

section "Intent — seed social com usuários existentes na VM"
echo "VERSAO_RUNNER=$VERSION"
echo "CONTAINER_API=$CONTAINER_API"
echo "MODO=$DRY_RUN"
echo "USERS_SOURCE=PostgreSQL.users existente via container intent-api"
echo "Usuário: $(id -un)"
echo "Host: $(hostname -s)"

[[ "$(id -un)" == "ubuntu" ]] || fail "este runner deve rodar na VM como usuário ubuntu"
command -v docker >/dev/null 2>&1 || fail "docker não encontrado na VM"
docker inspect "$CONTAINER_API" >/dev/null 2>&1 || fail "container não encontrado: $CONTAINER_API"

status="$(docker inspect -f '{{.State.Status}} {{if .State.Health}}{{.State.Health.Status}}{{end}}' "$CONTAINER_API" 2>/dev/null || true)"
echo "API_CONTAINER_STATUS=$status"

docker exec \
  -e INTENT_SEED_DRY_RUN="$DRY_RUN" \
  -e INTENT_ALLOW_EXISTING_USERS_SOCIAL_SEED="$ALLOW_WRITE" \
  -i "$CONTAINER_API" \
  node --input-type=module <<'NODE'
import { createCipheriv, createHash, randomBytes } from 'node:crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const dryRun = process.env.INTENT_SEED_DRY_RUN !== 'NAO';
const allowWrite = process.env.INTENT_ALLOW_EXISTING_USERS_SOCIAL_SEED === 'SIM';
const key = Buffer.from(process.env.REVEAL_ENCRYPTION_KEY || '', 'base64');

function log(name, value) {
  console.log(`${name}=${value}`);
}

function uuidFrom(input) {
  const hex = createHash('sha256').update(`intent-seed:${input}`).digest('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

function sealReveal(plaintext, intentId, version = 1) {
  if (key.length !== 32) {
    throw new Error('REVEAL_ENCRYPTION_KEY ausente ou inválida no container intent-api.');
  }

  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  cipher.setAAD(Buffer.from(`intent:${intentId}:reveal:v${version}`, 'utf8'));
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return {
    revealCiphertext: ciphertext.toString('base64'),
    revealIv: iv.toString('base64'),
    revealAuthTag: cipher.getAuthTag().toString('base64'),
    revealVersion: version,
  };
}

function pick(users, index) {
  return users[index % users.length];
}

async function main() {
  log('DRY_RUN', dryRun ? 'SIM' : 'NAO');

  if (!dryRun && !allowWrite) {
    throw new Error('Para gravar use INTENT_ALLOW_EXISTING_USERS_SOCIAL_SEED=SIM INTENT_SEED_DRY_RUN=NAO.');
  }

  const users = await prisma.user.findMany({
    where: { status: 'ACTIVE' },
    orderBy: [{ createdAt: 'asc' }, { username: 'asc' }],
    take: 7,
  });

  log('USERS_ACTIVE_FOUND', users.length);
  users.forEach((user, index) => {
    console.log(`USER_${index + 1}=${user.username}|${user.displayName}|${user.email ?? 'sem-email'}|${user.firebaseUid}`);
  });

  if (users.length < 3) {
    throw new Error('Seed social exige pelo menos 3 usuários ACTIVE existentes em users.');
  }

  const follows = [];
  for (let index = 0; index < users.length; index += 1) {
    follows.push({ follower: users[index], following: users[(index + 1) % users.length] });
    if (users.length > 3) {
      follows.push({ follower: users[index], following: users[(index + 2) % users.length] });
    }
  }

  const intentSpecs = [
    {
      key: 'impacto-social',
      creator: pick(users, 0),
      title: 'Mutirão local de impacto social',
      story: 'Organizar uma ação prática com pessoas reais da rede para gerar impacto local e registrar o acontecimento no Intent.',
      category: 'SOCIAL',
      supportGoal: Math.max(5, users.length),
      reveal: 'Checklist do mutirão: ponto de encontro, materiais, responsáveis e próximos passos.',
    },
    {
      key: 'tecnologia-comunidade',
      creator: pick(users, 1),
      title: 'Demonstração aberta do Intent',
      story: 'Apresentar como uma Intent pode mobilizar pessoas reais em torno de uma meta pública.',
      category: 'TECHNOLOGY',
      supportGoal: Math.max(4, users.length - 1),
      reveal: 'Roteiro da demonstração: cadastro, apoio, reação, comentário, notificação e revelação.',
    },
    {
      key: 'educacao-criativa',
      creator: pick(users, 2),
      title: 'Desafio educacional criativo',
      story: 'Criar um desafio simples para mostrar como acontecimentos podem ser acompanhados por apoio social.',
      category: 'EDUCATION',
      supportGoal: Math.max(4, users.length - 1),
      reveal: 'Material liberado: guia rápido para repetir o desafio com outra turma ou grupo.',
    },
  ];

  const intents = intentSpecs.map((spec) => {
    const id = uuidFrom(`intent:${spec.key}`);
    return {
      id,
      spec,
      sealed: sealReveal(spec.reveal, id, 1),
    };
  });

  const supportRows = [];
  const commentRows = [];
  const reactionRows = [];
  const notificationRows = [];
  const eventRows = [];

  for (const intent of intents) {
    const supporters = users.filter((user) => user.id !== intent.spec.creator.id).slice(0, Math.min(4, users.length - 1));
    for (const supporter of supporters) {
      supportRows.push({ intent, user: supporter });
      notificationRows.push({
        userId: intent.spec.creator.id,
        actorId: supporter.id,
        intentId: intent.id,
        type: 'SUPPORT_RECEIVED',
        key: `seed:support:${intent.id}:${supporter.id}`,
      });
    }

    users.slice(0, Math.min(3, users.length)).forEach((author, index) => {
      commentRows.push({
        id: uuidFrom(`comment:${intent.id}:${author.id}:${index}`),
        intent,
        author,
        body: [
          'Isso mostra bem a proposta social do Intent.',
          'Apoiado. Quero ver esse acontecimento avançar.',
          'Boa ideia para testar mobilização real.',
        ][index % 3],
      });
    });

    users.slice(0, Math.min(4, users.length)).forEach((user, index) => {
      reactionRows.push({
        intent,
        user,
        type: ['LIKE', 'LOVE', 'CELEBRATE', 'LIKE'][index % 4],
      });
    });

    eventRows.push({
      intentId: intent.id,
      actorId: intent.spec.creator.id,
      type: 'SEED_SOCIAL_INTENT_CREATED',
      key: `seed:event:intent:${intent.id}`,
      payload: { seed: 'existing-users-social', title: intent.spec.title },
    });
  }

  log('PLAN_FOLLOWS', follows.length);
  log('PLAN_INTENTS', intents.length);
  log('PLAN_SUPPORTS', supportRows.length);
  log('PLAN_COMMENTS', commentRows.length);
  log('PLAN_REACTIONS', reactionRows.length);
  log('PLAN_NOTIFICATIONS', notificationRows.length);
  log('PLAN_EVENTS', eventRows.length);

  if (dryRun) {
    console.log('RESULTADO=DRY_RUN_SEM_ESCRITA');
    return;
  }

  await prisma.$transaction(async (tx) => {
    for (const follow of follows) {
      if (follow.follower.id === follow.following.id) continue;
      await tx.follow.upsert({
        where: { followerId_followingId: { followerId: follow.follower.id, followingId: follow.following.id } },
        create: { followerId: follow.follower.id, followingId: follow.following.id },
        update: {},
      });
    }

    for (const intent of intents) {
      await tx.intent.upsert({
        where: { id: intent.id },
        create: {
          id: intent.id,
          creatorId: intent.spec.creator.id,
          type: 'SUPPORT_REVEAL',
          conditionType: 'SUPPORT',
          status: 'PUBLISHED',
          visibility: 'PUBLIC',
          category: intent.spec.category,
          title: intent.spec.title,
          story: intent.spec.story,
          supportGoal: intent.spec.supportGoal,
          supportCount: 0,
          guardianIds: [],
          guardianApprovals: [],
          ...intent.sealed,
        },
        update: {
          creatorId: intent.spec.creator.id,
          status: 'PUBLISHED',
          visibility: 'PUBLIC',
          category: intent.spec.category,
          title: intent.spec.title,
          story: intent.spec.story,
          supportGoal: intent.spec.supportGoal,
        },
      });
    }

    for (const row of supportRows) {
      await tx.support.upsert({
        where: { intentId_userId: { intentId: row.intent.id, userId: row.user.id } },
        create: { intentId: row.intent.id, userId: row.user.id },
        update: {},
      });
    }

    for (const row of commentRows) {
      await tx.intentComment.upsert({
        where: { id: row.id },
        create: { id: row.id, intentId: row.intent.id, authorId: row.author.id, body: row.body },
        update: { body: row.body },
      });
    }

    for (const row of reactionRows) {
      await tx.intentReaction.upsert({
        where: { intentId_userId: { intentId: row.intent.id, userId: row.user.id } },
        create: { intentId: row.intent.id, userId: row.user.id, type: row.type },
        update: { type: row.type },
      });
    }

    for (const row of notificationRows) {
      await tx.notification.upsert({
        where: { deduplicationKey: row.key },
        create: {
          userId: row.userId,
          actorId: row.actorId,
          intentId: row.intentId,
          type: row.type,
          deduplicationKey: row.key,
        },
        update: {},
      });
    }

    for (const row of eventRows) {
      await tx.domainEvent.upsert({
        where: { idempotencyKey: row.key },
        create: {
          intentId: row.intentId,
          actorId: row.actorId,
          type: row.type,
          payload: row.payload,
          idempotencyKey: row.key,
        },
        update: { payload: row.payload },
      });
    }

    for (const intent of intents) {
      const supportCount = await tx.support.count({ where: { intentId: intent.id } });
      await tx.intent.update({ where: { id: intent.id }, data: { supportCount } });
    }
  }, { timeout: 20000 });

  console.log('RESULTADO=SEED_GRAVADO_COM_USUARIOS_EXISTENTES');
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
NODE

section "Resumo"
echo "RUNNER_OK=$VERSION"
echo "MODO_FINAL=$DRY_RUN"
