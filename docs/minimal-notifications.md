# Bloco 7 — Notificações mínimas reais

O Bloco 7 persiste notificações no PostgreSQL e as expõe somente ao usuário
autenticado. A criação ocorre na mesma transação da ação de origem para que a
ação e sua notificação sejam confirmadas ou revertidas juntas.

## Modelo e tipos

A migration `20260913000100_add_notifications` cria o enum
`NotificationType` e a tabela `notifications`. Cada registro contém o usuário
destinatário, o ator público, uma Intent opcional, data de leitura e data de
criação. A coluna interna `deduplication_key` possui restrição única e impede
duplicação sob retries ou concorrência.

Tipos iniciais:

- `FOLLOW_RECEIVED`: alguém começou a seguir o destinatário;
- `SUPPORT_RECEIVED`: alguém apoiou uma Intent do destinatário;
- `GUARDIAN_APPROVAL_RECEIVED`: um guardião aprovou uma Intent do destinatário.

Não é criada notificação quando ator e destinatário são a mesma pessoa. Seguir
uma relação já existente, reenviar um apoio idempotente ou repetir uma aprovação
já registrada também não cria outro registro.

## Endpoints

### `GET /v1/notifications`

Exige autenticação, retorna até 50 notificações do usuário atual e ordena por
`createdAt` decrescente. A resposta contém apenas `id`, `type`, `readAt`,
`createdAt`, ator público (`id`, `username`, `displayName`, `avatarUrl`) e resumo
opcional da Intent (`id`, `title`).

### `PATCH /v1/notifications/:id/read`

Exige autenticação e marca `readAt` somente quando a notificação pertence ao
usuário atual e ainda não foi lida. Notificações ausentes ou de outro usuário
retornam `404 NOTIFICATION_NOT_FOUND`.

### `GET /v1/notifications/unread-count`

Exige autenticação e retorna exatamente
`{ "data": { "unreadCount": number } }`. O contador considera somente registros
do usuário atual com `readAt` igual a `null`. A rota rejeita parâmetros extras,
inclusive tentativas de informar outro `userId`, e não retorna a lista.

## Interface

O sino no cabeçalho abre um modal que consulta a API. O modal apresenta texto em
português, data e hora, estado vazio e diferença visual entre itens lidos e não
lidos. Marcar como lida atualiza apenas o item retornado pela API, sem recarregar
a lista e sem usar mocks ou `localStorage`. O sino mostra o total não lido e usa
`9+` acima de nove itens. O contador é carregado após autenticação, atualizado ao
abrir o modal e reduzido depois de cada leitura confirmada. Se a consulta falhar,
o badge é ocultado sem interromper a aplicação.

## Fora do escopo

WebSocket, polling, push, e-mail, atualização em tempo real, preferências avançadas,
agrupamento, reações e comentários permanecem fora deste bloco. Não há mudança
em Firebase, portas, Docker ou deploy da Oracle.

## Validação

```bash
npm run lint
npm run build

cd backend
npm run prisma:generate
npm test
npm run lint
npm run build
```

Para validar a migration em um PostgreSQL de integração configurado por
`DATABASE_URL`:

```bash
cd backend
npm run test:postgres
```
