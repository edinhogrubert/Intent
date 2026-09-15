# Bloco 19 — Perfil Social Público MVP

IMPLEMENTADO — TESTADO LOCALMENTE — PENDENTE DE REVISÃO — PENDENTE DE PR/MERGE/DEPLOY

- BACKEND READ-ONLY: SIM
- FRONTEND ALTERADO: SIM
- PRISMA ALTERADO: NÃO
- MIGRATION CRIADA: NÃO
- MOCK ALTERADO: NÃO
- CONTRATO DA API ALTERADO: SIM (adição compatível)
- Branch: `feat/public-user-profile`
- Base: `b7f324b`, release `mvp-1.0.17`
- Commit de entrega: commit que adiciona este documento, com mensagem `feat: add public user profile`; hash registrado no relatório de entrega.

## Contrato e segurança

`GET /v1/users/:id/profile` exige a autenticação existente e retorna `{ data: profile }`. Usuários inexistentes ou não ACTIVE retornam 404. A projeção explícita do usuário contém somente id, username, displayName, bio, avatarUrl, createdAt e updatedAt.

O perfil inclui estatísticas e até 20 Intents PUBLIC, PUBLISHED/REALIZED, ordenadas por createdAt e id decrescentes. Cada Intent contém somente id, title, story, status, createdAt e supportCount. PRIVATE e FOLLOWERS não entram na lista nem nos totais, inclusive na consulta do próprio perfil. Email, firebaseUid, credenciais, auditoria e todos os campos de reveal ficam fora da seleção.

`intentsCreated` e `publicIntentsCount` contam as mesmas Intents públicas elegíveis; `intentsRealized` conta o subconjunto REALIZED. Apoios e reações contam registros atuais vinculados a essas Intents; comentários contam registros de autores ACTIVE nessas Intents. Não há escrita em suporte, reação, comentário, condição, realização, DomainEvent ou reveal.

## Interface e arquivos

O autor no feed abre `PublicUserProfile`, com avatar/fallback, nome, handle, membro desde, bio, estatísticas e Intents públicas recentes. Há carregamento, erro, vazio, retorno ao início e abertura do detalhe. O perfil social anterior permanece disponível nos fluxos existentes.

Arquivos alterados/criados:

- `backend/src/routes/users.ts`
- `backend/src/services/public-profile-service.ts`
- `backend/tests/social-http.test.ts`
- `src/services/intentApi.ts`
- `src/components/PublicUserProfile.tsx`
- `src/App.tsx`
- `docs/ai-handoff/bloco-19-perfil-social-publico.md`

## Validação

- `git diff --check`: PASS.
- `npm run lint`: PASS (frontend).
- `npm run build`: PASS (frontend).
- `npm run prisma:generate`: PASS; apenas regeneração do cliente local desatualizado, sem alterar schema ou banco.
- `npm run lint` no backend: PASS após regeneração.
- `npm test -- tests/social-http.test.ts` no backend: 78/78 PASS, incluindo 5 casos novos de perfil público.

Os testes HTTP usam persistência simulada conforme o padrão existente. PostgreSQL real e smoke test visual/manual não foram executados. Nenhum acesso à VM ou deploy.

## Pendências e teste manual

Revisão e publicação dependem de etapa posterior. Cidade/país não existem no schema e foram omitidos. Paginação, ranking, seguidores novos, edição, upload e mensagens estão fora do escopo. Os totais e a lista são consultas independentes e podem refletir momentos ligeiramente diferentes sob atividade concorrente.

Para revisar manualmente com uma sessão autenticada: abrir o autor de uma Intent no feed, conferir perfil e totais públicos, abrir uma Intent e voltar ao início. Verificar também usuário sem Intents públicas, erro de API e troca de perfil durante carregamento. Intents PRIVATE/FOLLOWERS não devem aparecer nesse perfil público.
