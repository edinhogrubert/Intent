# Bloco 11 — Comentários simples em Intents

O Bloco 11 adiciona comentários persistidos às Intents que o usuário autenticado
já pode visualizar. A implementação usa PostgreSQL e a API oficial; não utiliza
mocks ou `localStorage` no fluxo de produção.

## Modelo

`IntentComment` registra `id`, `intentId`, `authorId`, `body`, `createdAt` e
`updatedAt`. A migration `20260913000200_add_intent_comments` cria as chaves
estrangeiras para `Intent` e `User` com exclusão restrita, além de índices por
`intentId + createdAt` e `authorId + createdAt`.

O corpo é validado com Zod, remove espaços externos, exige entre 1 e 500
caracteres e rejeita qualquer campo adicional. O autor sempre vem da sessão
autenticada.

## Endpoints

### `GET /v1/intents/:id/comments`

Exige autenticação e acesso à Intent. Retorna até 50 comentários em ordem
cronológica, dentro de `{ "data": { "items": [...] } }`.

### `POST /v1/intents/:id/comments`

Exige autenticação e o mesmo acesso da listagem. Aceita somente `{ "body":
"..." }` e retorna o comentário criado com status `201`.

As duas respostas usam uma projeção explícita: `id`, `body`, datas e autor com
`id`, `username`, `displayName` e `avatarUrl`. Dados sensíveis do usuário e o
conteúdo protegido da Intent não fazem parte das consultas ou respostas.

## Regra de acesso

A autorização é compartilhada com o detalhe da Intent:

- `PUBLIC`: qualquer usuário autenticado;
- `FOLLOWERS`: criador ou seguidor atual do criador;
- `PRIVATE`: criador;
- `PRIVATE` com guardiões: guardião que já possui acesso ao detalhe.

Intents de criadores inativos, estados desconhecidos e usuários sem vínculo são
negados antes da consulta ou criação de comentários.

## Interface

O detalhe apresenta a seção **Comentários**, lista, carregamento, estado vazio e
erro. O formulário mostra o contador de 0 a 500 caracteres. Após a criação, o
item retornado pela API entra na lista sem recarregar a página.

## Fora do escopo

Edição, exclusão, respostas em árvore, reações, notificações de comentário,
paginação, WebSocket, push e polling permanecem fora deste bloco.

## Validação

```bash
npm run lint
npm run build

cd backend
npm run prisma:generate
npm test
npm run lint
npm run build
TEST_DATABASE_URL=postgresql://.../intent_test_comments npm run test:postgres
```
