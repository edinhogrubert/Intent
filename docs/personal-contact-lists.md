# Listas pessoais reutilizáveis

Listas pessoais são atalhos privados do usuário para selecionar pessoas no estágio de guardiões da criação de uma Intent.

## API

- `GET /v1/personal-lists` lista somente as listas do usuário autenticado.
- `POST /v1/personal-lists` cria `{ "name": "..." }`.
- `PATCH /v1/personal-lists/:id` renomeia uma lista própria.
- `DELETE /v1/personal-lists/:id` remove a lista própria.
- `POST /v1/personal-lists/:id/members` adiciona `{ "userId": "uuid" }`.
- `DELETE /v1/personal-lists/:id/members/:userId` remove um membro.

Os membros retornados são apenas usuários ACTIVE e usam projeção pública. O proprietário é derivado da autenticação; listas e membros de terceiros não são expostos. A unicidade de nome é por proprietário, sem diferenciação de maiúsculas/minúsculas, e a unicidade de membro é garantida pelo PostgreSQL.

Na criação de uma Intent com condição `GUARDIANS`, a interface expande uma ou mais listas em UUIDs individuais. O backend revalida que todos estão ACTIVE, diferentes do criador e dentro do limite existente de 20. A Intent persiste somente esse snapshot em `guardianIds`; editar ou excluir uma lista depois não altera Intents, aprovações, eventos ou histórico existentes.

Fora do escopo: listas públicas, feeds, notificações por alteração de lista, grupos para outros destinatários, novas regras de realização e migração de dados existentes.
