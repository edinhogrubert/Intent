# Bloco 15 — Central de Notificações no Frontend

Reaplicação visual sobre mvp-1.0.13 (79f169e), limitada ao modal e ao callback
`onAllRead` do cabeçalho. Mantém listagem, filtros, leitura individual e estados
de carregamento, vazio e erro. Acrescenta textos e ícones dos tipos sociais,
fallback para tipos desconhecidos e ação de marcar todas como lidas.

Consome as chamadas reais existentes em `src/services/intentApi.ts`:
- GET /v1/notifications
- GET /v1/notifications/unread-count
- POST /v1/notifications/:id/read
- POST /v1/notifications/read-all

Após sucesso da leitura em massa, atualiza os itens carregados e zera o badge
via onAllRead. Sem mock, polling, alteração de API, backend, Prisma ou migration.

Validação desta entrega: git diff --check, npm run lint e npm run build.
Sem teste live, push, PR, merge ou deploy nesta etapa.
