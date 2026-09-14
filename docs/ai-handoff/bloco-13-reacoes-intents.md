# Intent — Bloco 13: Reações Sociais Simples em Intents (Revisão Corretiva)

## 1. Visão Geral e Arquitetura

Implementação de reações sociais leves em Intents no laboratório `intentNew`, mantendo a separação rígida entre interação social e o mecanismo oficial de apoio (`Support`).

As três reações suportadas são:
- **Curtir** (`LIKE`) 👍
- **Amar** (`LOVE`) ❤️
- **Celebrar** (`CELEBRATE`) 🎉

### Regra Principal de Negócio
Reações sociais são interações leves e **não são apoio**.
- NÃO alteram `supportCount`;
- NÃO alteram meta de apoios (`supportGoal`);
- NÃO realizam a Intent nem alteram `status` para `REALIZED`;
- NÃO preenchem `realizedAt`;
- NÃO revelam conteúdo protegido (`revealContent`);
- NÃO substituem nem removem o botão oficial de apoio existente.

---

## 2. Banco de Dados, Migration Prisma e Evidências de Execução

### Modelo Prisma (`backend/prisma/schema.prisma`)
```prisma
enum IntentReactionType {
  LIKE
  LOVE
  CELEBRATE
}

model IntentReaction {
  id        String             @id @default(uuid()) @db.Uuid
  intentId  String             @map("intent_id") @db.Uuid
  userId    String             @map("user_id") @db.Uuid
  type      IntentReactionType
  createdAt DateTime           @default(now()) @map("created_at") @db.Timestamptz(3)
  updatedAt DateTime           @updatedAt @map("updated_at") @db.Timestamptz(3)
  intent    Intent             @relation(fields: [intentId], references: [id], onDelete: Restrict)
  user      User               @relation(fields: [userId], references: [id], onDelete: Restrict)

  @@unique([intentId, userId], name: "intentId_userId")
  @@index([intentId, type])
  @@index([userId, createdAt(sort: Desc)])
  @@map("intent_reactions")
}
```

### Migration SQL (`backend/prisma/migrations/20260914000100_add_intent_reactions/migration.sql`)
```sql
CREATE TYPE "IntentReactionType" AS ENUM ('LIKE', 'LOVE', 'CELEBRATE');

CREATE TABLE "intent_reactions" (
  "id" UUID NOT NULL,
  "intent_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "type" "IntentReactionType" NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "intent_reactions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "intent_reactions_intent_id_fkey" FOREIGN KEY ("intent_id")
    REFERENCES "intents"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "intent_reactions_user_id_fkey" FOREIGN KEY ("user_id")
    REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "intent_reactions_intent_id_user_id_key" ON "intent_reactions"("intent_id", "user_id");
CREATE INDEX "intent_reactions_intent_id_type_idx" ON "intent_reactions"("intent_id", "type");
CREATE INDEX "intent_reactions_user_id_created_at_idx" ON "intent_reactions"("user_id", "created_at" DESC);
```

### Geração do Prisma e Preparação da Migration
```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/db" npx prisma validate --schema backend/prisma/schema.prisma
DATABASE_URL="postgresql://user:pass@localhost:5432/db" npx prisma generate --schema backend/prisma/schema.prisma
```
**Status:** Schema validado sintaticamente e Prisma Client gerado para v6.19.0.
**Execução contra PostgreSQL real na integração oficial:** realizada em 14 de
setembro de 2026 com PostgreSQL 15 efêmero, seguindo o serviço usado na CI. O
comando `npm run test:postgres` aprovou 36 testes, incluindo os 7 testes de
reações.

O ambiente oficial de implantação usa PostgreSQL 16. A validação desta
integração usou PostgreSQL 15, como definido na CI; por isso, a compatibilidade
com PostgreSQL 16 deve ser reconfirmada antes do deploy oficial.

---

## 3. Autorização Reutilizada e Guardiões

As rotas de reações `POST /v1/intents/:id/reactions` e `DELETE /v1/intents/:id/reactions` em `backend/src/routes/intents.ts` reutilizam estritamente a função central de autorização de leitura:
- **Função:** `requireIntentViewAccess(intentId, userId, client)` (em `backend/src/services/intent-service.ts`)
- **Regras validadas e testadas:**
  - **PUBLIC:** Qualquer usuário autenticado pode reagir.
  - **FOLLOWERS:** Apenas o criador e seus seguidores ativos podem reagir.
  - **PRIVATE:** Apenas o criador e seus guardiões autorizados (`guardianIds`) podem reagir.
  - **Inativos/Suspensos:** Criadores com `status !== 'ACTIVE'` retornam `404 INTENT_NOT_FOUND`.
  - **Visitante sem acesso:** Retorna `403 INTENT_FORBIDDEN`.

---

## 4. Endpoints e Contrato de API

### 1. Reagir ou Alterar Reação
- **Rota:** `POST /v1/intents/:id/reactions`
- **Autenticação:** Obrigatória (`requireAuthenticatedUser`)
- **Validação Zod (.strict()):**
  ```ts
  export const setReactionSchema = z.object({
    type: z.enum(['LIKE', 'LOVE', 'CELEBRATE']),
  }).strict();
  ```
- **Payload inválido:** retorna `400 VALIDATION_ERROR`, preservando o contrato
  atual do error handler oficial.
- **Comportamento:** Realiza `upsert` na tabela `intent_reactions`, garantindo 1 reação por usuário por Intent via restrição de banco. A autoria é extraída exclusivamente de `request.appUser.id`.
- **Resposta (200 OK):** Contém `intentId`, `viewerReaction` e `reactionCounts`.

### 2. Remover Reação
- **Rota:** `DELETE /v1/intents/:id/reactions`
- **Autenticação:** Obrigatória (`requireAuthenticatedUser`)
- **Comportamento:** Remove a reação de forma idempotente (`deleteMany`).
- **Resposta (200 OK):** Atualiza contadores e define `viewerReaction: null`.

---

## 5. Testes Automatizados Implementados

1. **Testes HTTP Reais (`backend/tests/reaction-http.test.ts`):**
   - Valida autenticação (`401` sem token);
   - Valida criação, troca de tipo sem duplicidade, remoção idempotente e tipo inválido (`400`);
   - Valida rejeição estrita `.strict()` de payloads maliciosos com campos extras (`userId`, `authorId`, `intentId`, `admin`, `supportCount`);
   - Valida permissões de visibilidade (`PUBLIC`, `FOLLOWERS`, `PRIVATE` com guardiões, bloqueio `403` para não-guardiões/não-seguidores, e `404` para criadores inativos);
   - Valida que a resposta da reação não afeta apoio nem expõe segredos protegidos.
   - Valida a projeção segura no detalhe (`GET /v1/intents/:id`) incluindo `reactionCounts` e `viewerReaction` sem vazar campos sensíveis (`revealCiphertext`, `revealIv`, `revealAuthTag`, `firebaseUid`, etc.).

2. **Testes PostgreSQL Reais (`backend/tests-postgres/reactions.test.ts`):**
   - Suíte PostgreSQL real implementada e preparada para execução, utilizando Prisma Client e PostgreSQL real para testar a aplicação da migration, unicidade por usuário (`@@unique`) e chaves estrangeiras.
   - **Execução contra PostgreSQL real:** aprovada durante a integração oficial.
   - Migration, unicidade, chaves estrangeiras, persistência, concorrência e
     isolamento do estado da Intent foram validados em runtime.

---

## 6. Projeção Segura no Detalhe (`intent-service.ts`)

O serviço `getIntent` enriquece o payload retornado ao frontend com:
- `reactionCounts`: totalizações numéricas por tipo (`LIKE`, `LOVE`, `CELEBRATE`, `total`);
- `viewerReaction`: tipo da reação do visualizador autenticado (ou `null` se não reagiu).

Nenhum campo privado (`revealCiphertext`, `revealIv`, `revealAuthTag`, `passwordHash`, `firebaseUid`, `tokens`) é incluído na projeção pública antes da realização.

---

## 7. Limitação do Mock no Frontend

> **Arquivo de laboratório (`src/services/mockIntentApi.ts`). Não migrar para o Intent oficial como implementação das reações reais.**
> O mock serve exclusivamente para previews locais no laboratório `intentNew`. A implementação migrada para o repositório oficial deve utilizar unicamente `src/services/intentApi.ts` conectada aos endpoints reais `/v1/intents/:id/reactions`.

---

## 8. Lista Final de Arquivos para Migração pelo Codex

1. `backend/prisma/schema.prisma` (Adicionado enum `IntentReactionType` e model `IntentReaction`)
2. `backend/prisma/migrations/20260914000100_add_intent_reactions/migration.sql`
3. `backend/src/domain/reaction-schemas.ts`
4. `backend/src/services/reaction-service.ts`
5. `backend/src/routes/intents.ts` (Rotas de reação integradas)
6. `backend/src/services/intent-service.ts` (Enriquecimento com `reactionCounts` e `viewerReaction`)
7. `backend/tests/reaction-http.test.ts` (Testes HTTP reais)
8. `backend/tests-postgres/reactions.test.ts` (Testes PostgreSQL reais)
9. `src/services/intentApi.ts` (Cliente frontend de reações)
10. `src/components/MvpIntentDetail.tsx` (Componente de UI com botões sociais)

---

## 9. Adaptações da integração oficial

- `src/services/intentApi.ts` recebeu somente os tipos e as chamadas à API real;
  o modo mock e `src/services/mockIntentApi.ts` não foram integrados;
- `backend/tests/reaction-http.test.ts` passou a configurar `user.update`, como
  exige o middleware de autenticação atual, e a esperar o contrato oficial
  `400 VALIDATION_ERROR` para falhas Zod;
- os testes HTTP e PostgreSQL ganharam verificações diretas de que reações não
  escrevem em Intent, Support ou DomainEvent e não alteram status, apoio ou
  material criptografado;
- `src/App.tsx`, `src/vite-env.d.ts`, `package.json`, lockfiles e configuração do
  Vitest permaneceram inalterados por não serem necessários ao Bloco 13.
