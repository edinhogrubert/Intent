# Bloco 26 — Estado DRAFT e Publicação Explícita de Intent

## 1. Estado da Integração Oficial

- Repositório fonte de verdade: `edinhogrubert/Intent`.
- Branch de integração: `feat/intent-draft-publish`.
- Commit-base oficial: `ad4482607c994653a8572cc6f4139d855ab55694`.
- Commit do laboratório auditado: `24d2cc10faf77000cda626a216b176f91ec57c23`.
- Commit integrado neste branch: `75cacba`.
- Merge na `main`: não realizado.
- Deploy, alteração de VM e migração em ambiente compartilhado: não realizados.

Este documento descreve o que foi adaptado no branch oficial. O laboratório foi tratado como referência de transferência, não como fonte de verdade.

## 2. Visão Geral e Motivação Arquitetural

Historicamente, toda Intent nascia com o status `PUBLISHED`. Isso permitia registrar a criação (`INTENT_CREATED`) e a realização (`INTENT_REALIZED`), mas impossibilitava modelar formalmente o ciclo de preparação, revisão e publicação consciente de uma intenção.

Para resolver a tensão entre **integridade de proveniência** e **fricção de usuário**, adotou-se a estratégia:
- **Fluxo padrão de 1 clique preservado**: Ao criar pelo fluxo direto, a Intent já nasce `PUBLISHED` (`INTENT_CREATED` com `status: PUBLISHED` e `publishedAt` populado).
- **Opção explícita de Rascunho (`DRAFT`)**: Usuários podem optar por "Salvar como rascunho" no wizard.
- **Publicação Explícita**: Endpoint dedicado e idempotente `POST /v1/intents/:id/publish` para transicionar de `DRAFT` para `PUBLISHED`, registrando o evento de domínio `INTENT_PUBLISHED`.
- **Isolamento e Segurança Estrita**: Rascunhos nunca vazam em feeds, buscas ou perfis públicos e bloqueiam apoios, comentários, reações e acompanhamento.

---

## 3. Mudanças no Banco de Dados e Schema Prisma

### 2.1 Prisma Schema (`backend/prisma/schema.prisma`)
- O campo `publishedAt DateTime?` já existia na base de origem e foi tornado opcional para permitir `DRAFT` sem data de publicação.
- O status continua sendo uma string compatível com o modelo atual; a validação de entrada aceita `DRAFT` e `PUBLISHED`.

### 2.2 Migração SQL (`backend/prisma/migrations/20260924000100_allow_draft_intents/migration.sql`)
- A coluna `published_at` já existia na base de origem.
- A migration somente remove `NOT NULL` e o `DEFAULT` da coluna `published_at`.
- Não foi criado backfill, evento histórico ou constraint nova de status.
- Os registros legados preservam os valores de `published_at` já existentes; não recebem uma narrativa histórica nova.

---

## 4. Contratos de API e Endpoints

### 3.1 `POST /v1/intents`
Cria uma nova Intent.
- **Input (Zod)**: aceita opcionalmente `status: 'DRAFT' | 'PUBLISHED'` (default: `'PUBLISHED'`).
- **Se `DRAFT`**:
  - Salva com `status: 'DRAFT'` e `publishedAt: null`.
  - Registra evento de domínio `INTENT_CREATED` com payload `{ status: 'DRAFT' }`.
- **Se `PUBLISHED`**:
  - Salva com `status: 'PUBLISHED'` e `publishedAt: new Date()`.
  - Registra evento de domínio `INTENT_CREATED` com payload `{ status: 'PUBLISHED' }`.

### 3.2 `POST /v1/intents/:id/publish`
Publica uma Intent salva anteriormente como `DRAFT`.
- **Autenticação**: Obrigatória (`Bearer token`).
- **Autorização**: Apenas o criador da Intent pode publicá-la (HTTP 403 / 404 se não autorizado).
- **Validação de Estado**:
  - Se `status === 'DRAFT'`: transiciona para `PUBLISHED`, seta `publishedAt: new Date()`, e grava o evento de domínio `INTENT_PUBLISHED`.
  - **Idempotência de Estado**: Se a Intent já estiver `PUBLISHED`, retorna `200 OK` com os dados atuais sem erro e sem duplicar eventos.
  - Se a Intent estiver em outro estado incompatível (`REALIZED`, `EXPIRED`), retorna `HTTP 409 CONFLICT` (`INTENT_CANNOT_BE_PUBLISHED`).

---

## 5. Regras de Isolamento e Acesso

1. **Visibilidade de Rascunhos**:
   - `assertIntentViewAccess` (`intent-service.ts`): Lança `HTTP 404 INTENT_NOT_FOUND` se qualquer usuário que não seja o próprio criador tentar acessar ou buscar uma Intent em `DRAFT`.
2. **Bloqueio de Apoio**:
   - `support-service.ts`: Bloqueia tentativas de apoiar Intent em `DRAFT` com `HTTP 409 INTENT_NOT_OPEN`.
3. **Bloqueio de Comentários**:
   - `comment-service.ts`: Bloqueia comentários em Intent em `DRAFT` com `HTTP 400 INTENT_NOT_PUBLISHED`.
4. **Bloqueio de Reações**:
   - `reaction-service.ts`: Bloqueia reações em Intent em `DRAFT` com `HTTP 400 INTENT_NOT_PUBLISHED`.
5. **Bloqueio de Acompanhamento (Watch)**:
   - `intent-watch-service.ts`: Bloqueia acompanhamento em Intent em `DRAFT` com `HTTP 400 INTENT_NOT_PUBLISHED`.

---

## 6. Frontend & Experiência de Usuário

1. **`src/services/intentApi.ts`**:
   - Adicionado `status?: 'DRAFT' | 'PUBLISHED'` em `CreateSupportIntentInput`.
   - Adicionada função utilitária `publishIntent(intentId, idempotencyKey)`.
2. **`CreationWizard.tsx`**:
   - Passo 3 exibe o botão `"Salvar como rascunho"` ao lado de `"Publicar Intent"`.
   - Feedback de conclusão adaptado informando claramente se a Intent foi publicada ou mantida em rascunho privado.
3. **`MvpIntentDetail.tsx`**:
   - Tag de status de destaque (`Rascunho`).
   - Banner contextual informativo no topo para o proprietário: `"Rascunho Privado — Esta Intent está salva como rascunho e só você pode vê-la."`.
   - Botão interativo `"Publicar Intent"` que executa a transição em tempo real e atualiza o histórico e os controles da página.

---

## 7. Cobertura de Testes Automatizados

- Arquivo dedicado: `backend/tests/draft-and-publish.test.ts` (14 testes unitários e de integração HTTP).
- Validações testadas:
  - Criação direta como `PUBLISHED` (default).
  - Criação como `DRAFT`.
  - Tentativa de acesso a `DRAFT` por terceiros (retorna 404).
  - Acesso do criador a `DRAFT` (retorna 200).
  - Publicação de `DRAFT` pelo criador (emite `INTENT_PUBLISHED` e transiciona).
  - Idempotência de publicação subsequente.
  - Bloqueio de publicação por não criador (403/404).
  - Bloqueio de comentários em `DRAFT` (400).
  - Bloqueio de reações em `DRAFT` (400).
  - Bloqueio de acompanhamento em `DRAFT` (400).
  - Bloqueio de apoio em `DRAFT` (409).
- **Backend**: 20 arquivos e 344 testes passando (`npm test`).
- **Backend lint/build**: passando.
- **Frontend lint/build**: passando.
- **Teste contra PostgreSQL real após aplicar a migration**: pendente para o Codex/ambiente executor; os testes executados nesta etapa usam os mocks da suíte existente.

## 8. Pendências para o Codex

1. Revisar o diff do branch contra a `main` e confirmar os contratos de API, autenticação e projeções públicas.
2. Executar `backend npm run test:postgres` com PostgreSQL descartável/configurado e aplicar a migration em ambiente de teste.
3. Validar manualmente o fluxo do wizard e da tela de detalhe, incluindo criação direta publicada, salvamento como rascunho e publicação posterior.
4. Abrir/atualizar PR e aguardar revisão/autorização antes de qualquer merge, deploy ou alteração da VM.

Antes de alterar código, inspecione o estado atual do repositório e reconcilie-o com este handoff. Este handoff não autoriza merge, deploy, alteração de VM ou operações fora do branch indicado.
