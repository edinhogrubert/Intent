# Intent — Bloco 14: Notificações Sociais MVP

## 1. Visão Geral e Arquitetura

Implementação do sistema mínimo de notificações sociais para o Intent no laboratório `intentNew`, mantendo a separação estrita entre efeitos sociais (notificações) e regras de domínio (apoios, status, reveal, etc.).

### Tipos de Notificações Suportadas
- `INTENT_REACTION_RECEIVED`: Reação recebida em uma Intent.
- `INTENT_COMMENT_RECEIVED`: Comentário recebido em uma Intent.
- `INTENT_REALIZED`: Realização de Intent.
- `USER_FOLLOWED`: Novo seguidor.
- `GUARDIAN_ACTION`: Ação ou aprovação de guardião.

---

## 2. Regra de Domínio e Isolamento

Notificações são efeitos colaterais informativos puros e **não devem**:
- Alterar `supportCount` ou metas de apoio (`supportGoal`);
- Alterar status da Intent ou realizar condições;
- Executar reveal de conteúdo protegido;
- Alterar regras de autorização ou criar participações.

---

## 3. Backend e Endpoints

- `backend/src/services/notification-service.ts`
- `backend/src/routes/notifications.ts`

### Rotas Disponíveis:
1. `GET /v1/notifications`: Lista notificações do usuário autenticado.
2. `GET /v1/notifications/unread-count`: Retorna contagem de não lidas.
3. `POST /v1/notifications/:id/read` (e `PATCH`): Marca notificação individual como lida.
4. `POST /v1/notifications/read-all` (e `PATCH`): Marca todas as notificações como lidas.

---

## 4. Prisma / Banco de Dados e Migration

- **Migration Criada:** `backend/prisma/migrations/20260914000200_add_social_notification_types/migration.sql`
- **Validação:** `npx prisma validate` e `npx prisma generate` executados com sucesso no laboratório.
- **Testes PostgreSQL / Integração Real:** Suíte de testes de integração PostgreSQL real preparada para validação de migration, constraints e persistência.
- **Execução contra PostgreSQL real:** PENDENTE (a validação runtime deverá ocorrer no ambiente oficial que disponha de PostgreSQL ativo).

---

## 5. Status de Entrega (Bloco 14)

- **IMPLEMENTADO:** Sim
- **TESTADO NO LABORATÓRIO:** Sim (Testes HTTP reais em `backend/tests/notification-http.test.ts`)
- **VALIDADO ESTATICAMENTE:** Sim (`tsc` / `lint_applet` / `compile_applet`)
- **PENDENTE DE POSTGRESQL REAL:** Sim
- **PENDENTE DE INTEGRAÇÃO OFICIAL:** Sim
