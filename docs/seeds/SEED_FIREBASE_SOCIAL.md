# Seed Social com Usuários Existentes — Intent

Este documento descreve o fluxo seguro para povoar o lado social do PostgreSQL do Intent usando **usuários reais que já existem na tabela `users`**.

## Regra principal

Este seed não cria usuários.

Se os usuários já fizeram login uma vez, eles já estão na base do Intent. Então a fonte dos usuários é o próprio PostgreSQL atual:

```text
users existente -> follows/intents/supports/comments/reactions/notifications/domain_events
```

## O que o script faz

- Lê usuários `ACTIVE` já existentes em `users`.
- Reaproveita `id`, `firebaseUid`, `email`, `username` e `displayName` reais.
- Cria ou atualiza relações sociais em `follows`.
- Cria ou atualiza Intents sociais controladas para usuários existentes.
- Cria `supports`, `intent_comments`, `intent_reactions`, `notifications` e `domain_events`.
- Recalcula `supportCount` das Intents criadas pelo seed.
- Usa `REVEAL_ENCRYPTION_KEY` real para preencher `reveal_ciphertext`, `reveal_iv` e `reveal_auth_tag` nas Intents novas.

## O que o script não faz

- Não cria usuário no Firebase Auth.
- Não consulta Firebase Auth.
- Não cria `firebaseUid` fake.
- Não altera senha, e-mail ou provedor.
- Não roda automaticamente no deploy.
- Não grava nada em modo dry-run.

## Seleção de usuários

Por padrão, o script pega até 7 usuários `ACTIVE` existentes, ordenados por `createdAt`.

Para limitar por username real existente:

```bash
INTENT_SOCIAL_SEED_USERNAMES=edinho_grubert,miranha,batima
```

O seed exige pelo menos 3 usuários `ACTIVE` já existentes.

## Execução segura no PC

Dry-run, sem gravação:

```bash
INTENT_SEED_REF=chore/safe-social-demo-seed \
/usr/bin/bash <(/usr/bin/curl -fsSL https://raw.githubusercontent.com/edinhogrubert/Intent/chore/safe-social-demo-seed/scripts/seeds/rodar-seed-firebase-social-PC.sh)
```

Gravação real, após revisar o dry-run:

```bash
INTENT_ALLOW_EXISTING_USERS_SOCIAL_SEED=SIM \
INTENT_SEED_DRY_RUN=NAO \
INTENT_SEED_REF=chore/safe-social-demo-seed \
/usr/bin/bash <(/usr/bin/curl -fsSL https://raw.githubusercontent.com/edinhogrubert/Intent/chore/safe-social-demo-seed/scripts/seeds/rodar-seed-firebase-social-PC.sh)
```

## Travas de segurança

- Dry-run por padrão.
- Escrita exige `INTENT_ALLOW_EXISTING_USERS_SOCIAL_SEED=SIM`.
- Escrita exige `INTENT_SEED_DRY_RUN=NAO`.
- `NODE_ENV=production` exige também `INTENT_ALLOW_PRODUCTION_SEED=SIM`.
- O runner valida backup Git existente antes de executar o seed.
- O runner carrega `.env` e `.env.local` do backend sem imprimir segredos.

## Observação sobre `intentNew`

Se `intentNew` usa o mesmo Firebase e os usuários já fizeram login no Intent, então esses usuários já existem na tabela `users`. Este seed usa essa tabela diretamente e não precisa de manifesto de Firebase.
