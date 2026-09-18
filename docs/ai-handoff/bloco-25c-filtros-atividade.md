# Bloco 25C — Integração oficial de filtros da atividade pública

Estado: INTEGRADO PARA REVISÃO no PR #26. Sem merge, tag, alteração de release, deploy ou alteração de VM.

## Base

- Repositório oficial: `edinhogrubert/Intent`.
- Branch oficial de trabalho: `feat/shareable-links`.
- PR oficial: `#26`.
- 25A e 25B já estavam integrados no PR #26.
- Origem de referência: handoff publicado em `edinhogrubert/intentNew/docs/ai-handoff/bloco-25c-filtros-atividade.md`.

## Escopo integrado

- Filtros visuais na atividade pública do perfil:
  - `ALL`
  - `INTENT_CREATED`
  - `INTENT_REALIZED_PARTICIPATION`
  - `INTENT_SUPPORTED`
  - `INTENT_REACTED`
  - `INTENT_COMMENTED`
- Backend aceita parâmetro opcional `type` em `GET /v1/users/:id/activity`.
- O contrato antigo continua válido: chamadas sem `type` usam `ALL`.
- A paginação por cursor preserva o filtro ativo e rejeita cursor incompatível com filtro específico.
- Troca de filtro no frontend limpa a lista, zera cursor e inicia nova busca.
- Nenhuma migration foi criada e Prisma não foi alterado.

## Arquivos alterados/criados

- `backend/src/services/public-activity-service.ts`
- `backend/src/routes/users.ts`
- `src/services/intentApi.ts`
- `src/components/PublicUserActivity.tsx`
- `docs/ai-handoff/bloco-25c-filtros-atividade.md`

## Observação sobre transferência

O handoff do 25C apareceu no `intentNew`, mas a busca pelo símbolo `PublicActivityFilter` não encontrou código publicado no laboratório no momento da integração. Por isso a implementação oficial foi feita diretamente a partir do handoff confirmado e do estado atual da branch oficial `feat/shareable-links`.

## Validação

- Validações laboratoriais informadas pelo usuário: `npm run lint` PASS, `npm run build` PASS e `backend/tests/public-activity.test.ts` 12/12 PASS.
- Nesta integração feita diretamente pelo GitHub, não houve execução local de testes pelo assistente. A validação pendente deve ser feita por CI, ambiente local ou agente executor antes do merge final.

## Limites preservados

- 25A preservado.
- 25B preservado.
- Sem merge na main.
- Sem tag/release.
- Sem deploy.
- Sem alteração de VM.
