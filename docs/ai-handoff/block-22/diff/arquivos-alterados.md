# Escopo oficial — Bloco 22

## Alterados

- backend/src/services/public-profile-service.ts: quatro métricas agregadas com escopo público e contagem de Intents realizadas sem duplicação.
- backend/tests/social-http.test.ts: contrato ampliado, valores zero/ativos e regressões de privacidade.
- src/services/intentApi.ts: quatro campos adicionados a ApiPublicUserProfile.stats.
- src/components/PublicUserProfile.tsx: seções de identidade social reaproveitadas do laboratório, com controles oficiais preservados.

## Criados

- docs/ai-handoff/bloco-22-identidade-social-do-usuario.md
- docs/ai-handoff/block-22/reports/resumo-implementacao.md
- docs/ai-handoff/block-22/reports/validacoes.md
- docs/ai-handoff/block-22/diff/arquivos-alterados.md

## Não aplicados

backend/src/app.ts: nenhuma mudança no delta de laboratório do Bloco 22, nenhuma necessidade para o endpoint existente. Rotas, follows, notificações, Prisma, migrations e infraestrutura permanecem intactos.
