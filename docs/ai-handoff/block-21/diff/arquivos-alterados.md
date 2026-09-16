# Escopo oficial — Bloco 21

## Arquivos alterados

- backend/src/routes/users.ts: passa viewer autenticado ao perfil público.
- backend/src/services/public-profile-service.ts: isMe, viewerIsFollowing e contadores ativos.
- backend/src/services/social-service.ts: alias compatível e validação antes do unfollow.
- backend/tests/social-http.test.ts: testes reaproveitados e novas regressões HTTP.
- src/components/PublicUserProfile.tsx: interface social reaproveitada e adaptada ao contrato oficial, paginação e isolamento de requisições.
- src/services/intentApi.ts: campos do contrato público; clientes followProfile/unfollowProfile existentes reutilizados.

## Arquivos criados

- docs/ai-handoff/bloco-21-seguir-usuarios.md
- docs/ai-handoff/block-21/reports/resumo-implementacao.md
- docs/ai-handoff/block-21/reports/validacoes.md
- docs/ai-handoff/block-21/diff/arquivos-alterados.md

## Correção do relatório de laboratório

backend/prisma/schema.prisma não mudou entre a base oficial e c95d160. Não aplicado. follows e FOLLOW_RECEIVED já estavam cobertos por migrations oficiais. Sem novas migrations, alterações de domínio, adaptações Cloud SQL ou mudanças de dependências.
