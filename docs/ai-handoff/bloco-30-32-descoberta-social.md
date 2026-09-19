# Blocos 30–32 — descoberta social

## Entrega

`GET /v1/search` continua autenticado e compatível com a busca combinada atual. Agora aceita `kind=all|intents|users`, `status=PUBLISHED|REALIZED`, `period=all|week|month`, `limit` e `cursor`.

- `kind=all` mantém o resultado combinado de Intents e pessoas, sem cursor ambíguo.
- `kind=intents` ordena por `createdAt DESC, id DESC`; o cursor é opaco e inclui ambos os campos.
- `kind=users` ordena por `displayName ASC, id ASC`; o cursor é opaco e inclui ambos os campos.
- A interface da Home usa abas e filtros para consultar o contrato real, com carregamento incremental, vazio e erro.

## Segurança

A pesquisa conserva a seleção explícita de campos públicos. Conteúdo de revelação, credenciais e dados internos não são selecionados. Intents seguem as regras já existentes de `PUBLIC`, `FOLLOWERS`, criador e guardião autorizado; criadores e pessoas inativas não aparecem.

## Bloco 32 reutilizado

Seguidores/seguindo já usam `Follow` com unicidade `(followerId, followingId)`, criação idempotente e remoção idempotente. As rotas, listas paginadas e integração de `FOLLOWERS` existentes foram preservadas; esta entrega não cria uma segunda implementação.

## Fora do escopo

Sem migrations, alterações de Firebase, deploy, dados de demonstração, busca semântica ou alteração de contratos de revelação.
