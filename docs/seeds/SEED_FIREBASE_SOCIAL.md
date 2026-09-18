# Seed Firebase Social — Intent

Este documento descreve o fluxo seguro para povoar o PostgreSQL social do Intent usando **usuários reais já existentes no Firebase Auth**.

## Regra principal

Este seed não é mock.

Ele não cria usuários falsos, não usa `firebaseUid` sintético e não cria contas no Firebase Auth.

A fonte dos usuários é o Firebase Auth. O PostgreSQL recebe ou atualiza os registros sociais do Intent com base em usuários reais resolvidos por `firebaseUid` ou `email`.

## O que o script faz

- Resolve usuários reais no Firebase Auth.
- Faz `upsert` na tabela `users` usando o `firebaseUid` real.
- Cria ou atualiza relações sociais em `follows`.
- Cria ou atualiza Intents sociais controladas.
- Cria `supports`, `intent_comments`, `intent_reactions`, `notifications` e `domain_events`.
- Recalcula `supportCount` das Intents criadas pelo seed.
- Usa criptografia real AES-256-GCM via domínio oficial do backend para `reveal_*`.

## O que o script não faz

- Não cria usuário no Firebase Auth.
- Não altera senha, e-mail ou provedor no Firebase.
- Não roda automaticamente no deploy.
- Não executa em produção sem autorização explícita.
- Não insere nada em modo dry-run.

## Manifesto obrigatório

O seed exige manifesto com usuários reais.

Cada item precisa ter:

```json
{
  "key": "edinho_grubert",
  "username": "edinho_grubert",
  "firebaseUid": "UID_REAL_DO_FIREBASE",
  "email": "email-opcional@exemplo.com",
  "displayName": "Nome de Exibição",
  "bio": "Texto opcional",
  "avatarUrl": "https://... opcional"
}
```

Também é aceito informar apenas `email` no lugar de `firebaseUid`; nesse caso o script resolve o UID pelo Firebase Auth.

Exemplo de manifesto:

```json
{
  "users": [
    {
      "key": "edinho_grubert",
      "username": "edinho_grubert",
      "email": "edinho@example.com",
      "displayName": "Edinho Grubert"
    },
    {
      "key": "miranha",
      "username": "miranha",
      "email": "miranha@example.com",
      "displayName": "Miranha"
    }
  ]
}
```

## Usuários esperados pelo roteiro social

O roteiro atual usa estas chaves quando existirem no manifesto:

- `edinho_grubert`
- `miranha`
- `batima`
- `snoop`
- `will`
- `henry`
- `willian_santos`

As Intents principais usam criadores dessas chaves. Se faltar um criador necessário, o seed aborta.

## Execução segura no PC

Dry-run, sem gravação:

```bash
INTENT_FIREBASE_SOCIAL_USERS_FILE=/caminho/usuarios-firebase-social.json \
INTENT_SEED_REF=chore/safe-social-demo-seed \
/usr/bin/bash <(/usr/bin/curl -fsSL https://raw.githubusercontent.com/edinhogrubert/Intent/chore/safe-social-demo-seed/scripts/seeds/rodar-seed-firebase-social-PC.sh)
```

Gravação real, após revisar o dry-run:

```bash
INTENT_FIREBASE_SOCIAL_USERS_FILE=/caminho/usuarios-firebase-social.json \
INTENT_ALLOW_FIREBASE_SOCIAL_SEED=SIM \
INTENT_SEED_DRY_RUN=NAO \
INTENT_SEED_REF=chore/safe-social-demo-seed \
/usr/bin/bash <(/usr/bin/curl -fsSL https://raw.githubusercontent.com/edinhogrubert/Intent/chore/safe-social-demo-seed/scripts/seeds/rodar-seed-firebase-social-PC.sh)
```

## Travas de segurança

- Dry-run por padrão.
- Escrita exige `INTENT_ALLOW_FIREBASE_SOCIAL_SEED=SIM`.
- Escrita exige `INTENT_SEED_DRY_RUN=NAO`.
- `NODE_ENV=production` exige também `INTENT_ALLOW_PRODUCTION_SEED=SIM`.
- O runner valida backup Git existente antes de executar o seed.
- O script aborta se detectar conflito de `firebaseUid`, `email` ou `username` já associado a outro usuário.

## Observação sobre `intentNew`

Se `intentNew` usa o mesmo Firebase, os usuários criados lá podem ser usados aqui desde que seus `firebaseUid` ou e-mails reais sejam colocados no manifesto. O seed não lê dados internos do `intentNew`; ele lê o Firebase Auth e grava no PostgreSQL do Intent.
