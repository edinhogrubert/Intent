# Bloco 23 — Feed de Seguidos

Estado: IMPLEMENTADO NA INTEGRAÇÃO OFICIAL
Base: mvp-1.0.21 / ee060182143aa6a00901ff39d242f8da96cd41f4
Bloco: 23 — Feed de Seguidos
Origem reaproveitada: intentNew / ae47824
Frontend alterado: SIM
Backend alterado: SIM
Prisma alterado: NÃO
Migration criada: NÃO
Mock alterado: NÃO (produto; doubles de persistência dos testes ampliados)
Contrato da API alterado: SIM, de forma aditiva/retrocompatível nos parâmetros e campos.
Quebra de contrato: NÃO nos formatos e endpoints; alteração de filtro de following explicitada abaixo.
Endpoint/feed anterior: GET /v1/intents/feed?scope=public|following (following já existia na base oficial)
Endpoint/feed atual: GET /v1/intents/feed?scope=all|public|following
Filtro de seguidos implementado: PUBLIC, PUBLISHED/REALIZED, criador ACTIVE com follows na direção followerId=visitante autenticado.
Campos preservados: id, type, conditionType, status, visibility, category, title, story, supportGoal, supportCount, revealAt, guardianApprovalGoal, publishedAt, realizedAt, createdAt, creator.id/displayName/username/avatarUrl; following passa a retornar também reactionCounts, viewerReaction e viewerHasSupported.
Dados sensíveis protegidos: email, firebaseUid, passwordHash e revealCiphertext/revealIv/revealAuthTag não selecionados na projeção do feed.
Risco: baixo. A query following depende da relação follows e deve ser observada com volume real; agregados sociais adicionam três consultas limitadas aos IDs da página.

## Reaproveitamento e ajustes oficiais

Aplicado delta do laboratório aos três arquivos de produto correspondentes, preservando integrações anteriores. server.ts do laboratório não aplicado. listFollowingFeed existente foi adaptado no service real.

all é alias de public; parâmetros ausentes continuam equivalendo a public e o frontend normaliza all para public. Todos mantém consulta, ordenação e seleção anteriores. following exige autenticação e usa apenas identidade do token.

A base oficial incluía PUBLIC e FOLLOWERS no feed following. Conforme o escopo explícito do Bloco 23, following passa a incluir somente PUBLIC. Esta é uma redução intencional do conjunto de resultados; não muda o acesso ao detalhe de Intents FOLLOWERS nem regras de follows, apoios ou revelação. Nenhum campo anterior foi removido.

Os campos sociais existiam no tipo/card, mas não eram retornados pelo serviço de feed. A integração os fornece em following com groupBy por intentId/type e consultas de reação/apoio do visitante em lote. As consultas abrangem somente itens efetivamente entregues (não o item extra de paginação); página vazia não realiza consultas sociais. Não são consultas por item.

Home abre em Todos, mantém cards e navegação. Textos de vazio/erro reaproveitados. Troca de scope ou usuário invalida respostas anteriores e reinicia cursor/filtro; desmontagem também invalida requisição.

## Arquivos alterados
- backend/src/routes/intents.ts
- backend/src/services/intent-service.ts
- backend/tests/social-http.test.ts
- backend/tests/social-regression.test.ts
- src/components/MvpHomeFeed.tsx
- src/services/intentApi.ts

## Arquivos criados
- docs/ai-handoff/bloco-23-feed-de-seguidos.md
- docs/ai-handoff/block-23/reports/resumo-implementacao.md
- docs/ai-handoff/block-23/reports/validacoes.md
- docs/ai-handoff/block-23/diff/arquivos-alterados.md

## Testes executados
- git diff --check: aprovado.
- npm run lint: aprovado.
- npm --prefix backend run lint: aprovado.
- npm run build: aprovado, 1706 módulos.
- cd backend && npx --no-install prisma generate --schema=prisma/schema.prisma: aprovado, Prisma Client 6.19.0 instalado no backend, sem alterar banco.
- npm --prefix backend test: 217 testes aprovados em 10 suítes; social-http com 103 testes. Expectativa antiga de paginação atualizada para os campos sociais aditivos.
- node /tmp/block23-ui-check.cjs: Chrome com componente e CSS reais, fixtures isoladas; Todos padrão, alternância/loading, resposta antiga ignorada, reações, clique no autor, abrir Intent, paginação, vazio, erro e retry aprovados; nenhum erro JS.

Resultado: aprovado. Testes verificam autenticação, alias all/public, filtro relacional público, paginação/ordenação, campos sociais, seleção sem segredos e página vazia; suites de domínio permanecem aprovadas.
Pendências: homologação autenticada na VM e avaliação da query com volume real. Sem PostgreSQL real ou teste de carga nesta integração.
Veredito: integração local concluída. Sem push, PR, merge ou deploy.
