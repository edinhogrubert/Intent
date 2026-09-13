# Bloco 8 — Busca simples de Intents e pessoas

O Bloco 8 adiciona uma busca textual autenticada sobre dados já públicos ou
autorizados para o usuário atual. A implementação usa consultas Prisma e
PostgreSQL, sem índice externo, mock ou armazenamento no navegador.

## Endpoint

`GET /v1/search?q=texto&limit=10`

- exige autenticação Firebase válida;
- exige de 2 a 80 caracteres em `q`;
- aceita `limit` entre 1 e 20, usando 10 por padrão;
- retorna `{ data: { intents, users } }`.

## Campos pesquisados

As Intents são pesquisadas por `title`, `story`, `displayName` do criador e
`username` do criador. Os resultados são ordenados por `createdAt` decrescente e
incluem somente Intents publicadas ou realizadas de criadores ativos.

As pessoas são pesquisadas por `displayName` e `username`, incluem somente
contas `ACTIVE` e retornam `id`, `username`, `displayName`, `bio` e `avatarUrl`.

## Privacidade

- `PUBLIC`: visível ao usuário autenticado;
- `FOLLOWERS`: visível ao criador e a quem segue o criador;
- `PRIVATE`: visível ao criador;
- `PRIVATE` baseada em guardiões: também visível ao guardião listado, seguindo a
  regra atual do detalhe e da lista de solicitações.

A projeção de Intent nunca consulta ou retorna `revealCiphertext`, `revealIv`,
`revealAuthTag` ou `revealContent`. A projeção de pessoa e do criador não retorna
email, `firebaseUid`, senha, tokens ou status.

## Interface

O formulário na tela inicial consulta a API ao ser enviado. A área de resultados
separa “Intents” e “Pessoas”, abre o detalhe ou perfil correspondente e apresenta
estados de carregamento, erro e nenhum resultado.

## Fora do escopo

Elasticsearch, IA, busca semântica, ranking avançado, sugestões automáticas e
pesquisa em conteúdo criptografado permanecem fora deste bloco. Não há alteração
em Firebase, autenticação, deploy, Docker ou portas.

## Validação

```bash
npm run lint
npm run build

cd backend
npm test
npm run lint
npm run build
```
