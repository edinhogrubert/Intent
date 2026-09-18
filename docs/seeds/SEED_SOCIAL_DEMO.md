# Seed Social Demo — Intent

Este documento descreve o seed seguro de usuários, relações sociais, Intents, apoios, comentários, reações, notificações e eventos de domínio para demonstração social do Intent.

## Objetivo

Popular a base PostgreSQL do Intent com dados sociais de demonstração sem mexer diretamente no Firebase Auth e sem depender de comandos soltos.

## Segurança

O seed foi desenhado com estas travas:

- não cria usuários no Firebase Auth;
- não altera Firebase diretamente;
- usa `firebaseUid` sintético prefixado com `seed:social-demo:`;
- bloqueia escrita por padrão;
- roda em dry-run por padrão;
- exige `INTENT_ALLOW_SOCIAL_SEED=SIM` para gravar;
- bloqueia `NODE_ENV=production` salvo autorização explícita com `INTENT_ALLOW_PRODUCTION_SOCIAL_SEED=SIM`;
- faz preflight de conflito antes de escrever;
- aborta se encontrar usuário real ou usuário criado fora do seed com o mesmo username, email, id ou firebaseUid;
- é idempotente: usa ids determinísticos e upserts para não duplicar registros.

## Conteúdo inserido

- 7 usuários demo:
  - `@edinho_grubert`
  - `@miranha`
  - `@batima`
  - `@snoop`
  - `@will`
  - `@henry`
  - `@willian_santos`
- 16 relações de follow;
- 6 Intents públicas;
- apoios com `supportCount` recalculado;
- comentários;
- reações `LIKE`, `LOVE` e `CELEBRATE`;
- notificações sociais;
- eventos de domínio sintéticos identificados por chave idempotente.

## Arquivos

- `backend/src/scripts/seed-social-demo.ts`
- `scripts/seeds/rodar-seed-social-demo-PC.sh`
- `backend/package.json`, script `seed:social-demo`

## Dry-run pelo PC

O dry-run não grava nada:

```bash
/usr/bin/bash <(/usr/bin/curl -fsSL https://raw.githubusercontent.com/edinhogrubert/Intent/main/scripts/seeds/rodar-seed-social-demo-PC.sh)
```

## Gravação pelo PC

A gravação exige autorização explícita:

```bash
INTENT_ALLOW_SOCIAL_SEED=SIM INTENT_SEED_DRY_RUN=NAO /usr/bin/bash <(/usr/bin/curl -fsSL https://raw.githubusercontent.com/edinhogrubert/Intent/main/scripts/seeds/rodar-seed-social-demo-PC.sh)
```

## Observação sobre Firebase real

Este seed não vincula usuários reais do Firebase. Ele cria usuários demo no PostgreSQL com `firebaseUid` sintético.

Para vincular usuários reais criados no Firebase, é necessário criar um fluxo separado usando um arquivo de mapeamento controlado com `firebaseUid`, email e username reais. Esse fluxo deve ser revisado antes de tocar em dados reais.

## Onde rodar

Preferencialmente no PC local/laboratório.

Não rodar na VM/prod sem autorização explícita e backup validado.
