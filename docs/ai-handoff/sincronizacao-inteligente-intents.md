# Handoff de implementação — sincronização inteligente de estado da Intent

**Estado:** análise e plano, NÃO é implementação/teste/deploy. Aceite manual da PR #46 informado pelo proprietário em 21/09/2026. Base auditada: main após PR #46, SHA `7b05285ed8e25a44a19f54f22ce541306d2f7a03`; revalidar HEAD antes de editar. Prioridade: correção de consistência antes do Bloco 37. Não usar `archive/` nem `Nova pasta/`.

## Evidência técnica e causa identificada

Em `backend/src/services/intent-service.ts`, `getIntent` consulta `viewerWatch` através de `prisma.intentWatch.findUnique` e retorna `viewerWatching: Boolean(viewerWatch)` **no retorno REALIZED**, porém o retorno `status !== 'REALIZED'` não inclui `viewerWatching`. Consequência: para Intent ainda publicada, o botão no detalhe (`MvpIntentDetail.tsx`) recebe undefined e parece desmarcado mesmo com acompanhamento persistido. Corrigir ambos os ramos e acrescentar regressões. Não criar novo vínculo, endpoint nem coluna para essa correção.

`MvpIntentDetail.tsx`: `handleWatch` atualiza apenas `viewerWatching` após resposta; `handleGuardianApproval` e `handleSupport` executam mutação seguida de `getIntent`, mas tratam falha do GET como falha da mutação e podem mostrar mensagem enganosa; `loadHistory()` só é chamado na montagem/troca de intentId, então evento de aprovação/realização recém-criado não aparece na história até reentrada; componente monta `getIntent`, comentários e história separadamente. `ConditionStatus` já utiliza `guardianApprovalCount` após PR #46. Identificar e tratar concorrência entre GET antigo, GET pós-mutação e mudança de intentId.

`src/App.tsx`: `openNotifications()` abre modal e sempre chama `getUnreadNotificationCount`; modal carrega sua própria lista. Abrir notificações não deve ser pré-requisito para sincronizar uma Intent nem disparar refresh global de Home/Perfil/Detalhe indiscriminadamente. O App atualmente monta uma view por vez, permitindo carregar dados ao entrar na view; auditar feeds/dashboards, callbacks e modal antes de criar qualquer cache compartilhado.

## Contrato funcional

1. Acompanhar no feed e abrir detalhe de uma Intent **PUBLISHED** deve mostrar `Acompanhando`, inclusive após refresh e outra sessão; desacompanhar deve refletir persistentemente em todos os pontos de UI. O servidor é a verdade; não inferir do modal ou de estado visual anterior.
2. Ao aprovar Intent, atualizar imediatamente ação, `viewerHasApprovedAsGuardian`, `guardianApprovalCount`, quórum, `status`, conteúdo autorizado e história, de acordo com o resultado confirmado. Não confundir resposta de mutação bem-sucedida com erro posterior de leitura: manter aviso honesto e oferecer reconsulta dirigida.
3. Ao apoiar/retirar apoio e acompanhar/deixar de acompanhar, atualizar só os componentes afetados e reconciliar com servidor; se há GET em trânsito, resposta antiga não sobrescreve estado novo nem outra Intent; evitar requisições redundantes. Preserve idempotência/autorização do backend.
4. Notificações: não exigir abertura para atualização; ao abrir, solicitar somente dados necessários. Reutilizar/deduplicar refresh do contador se já houver pedido em andamento ou informação recente, sem introduzir polling agressivo, WebSockets, ou reload da página inteira sem justificação. Não presumir eventos globais se ainda não existem.
5. Preservar privacidade: contar aprovações sem revelar IDs dos aprovadores a usuários não autorizados; não expor conteúdo protegido antes da realização/autorizações. Texto de produto: `Intent realizada`, `Aprovar Intent`, `Acompanhar Intent`, nunca o termo de descoberta de conteúdo proibido na interface. Não renomear campos técnicos legados sem migração própria.

## Proposta mínima de execução

- Backend: acrescentar `viewerWatching: Boolean(viewerWatch)` ao retorno não realizado do `getIntent` e criar testes de API/serviço para PUBLISHED e REALIZED, `viewerWatching` true/false, acesso/isolamento.
- Frontend: auditar e corrigir origem do estado do botão no feed e detalhe; na mutation de aprovação/apoio, reconciliar detalhe de forma dirigida, proteger contra stale requests e carregar história somente após sucesso que cria evento; se história estiver paginada, atualizar primeira página sem duplicar registros, sem carregar páginas antigas desnecessariamente. Evitar repetir GET da Intent se resposta da mutação já prover os campos suficientes, mas não inventar dados ausentes.
- `App.tsx`/`NotificationsModal.tsx`: auditar as requisições existentes, otimizar apenas duplicação demonstrável. Não refatorar globalmente por antecipação; documentar quais eventos atualizam quais componentes.
- Garantir feedback de sucesso mesmo se a mutação foi confirmada e a reconsulta falhou, com erro específico de sincronização e caminho de tentar novamente.

## Testes de aceite

PUBLISHED acompanhada aparece marcada feed → detalhe, reload, conta correta; desacompanhar persiste; outro usuário não herda estado. Aprovação por criador e guardião externo 0→1→quórum, história atualiza, botão travado após aprovação; erro da mutação não apresenta sucesso; sucesso da mutação seguido de GET com falha não afirma que aprovação falhou; simular GET antigo chegando depois do novo e troca de intentId; apoio/remover apoio; história com cursor; modal de notificações sem reload global nem chamadas repetidas gratuitas. Regressões dos Blocos 35–36, PR #45 e #46, backend/frontend lint/build, testes em PostgreSQL 16 descartável quando necessário.

## Execução operacional

Agente de Implementação de Laboratório: sincronizar main e confirmar HEAD; auditar fluxos reais; branch+PR com patch enxuto, CI, revisão e merge segundo contratos, backup/implantação direcionada apenas componentes alterados mediante autorização existente. Não alterar Prisma/migrations se não houver causa comprovada, nem Firebase, tags, releases, banco de produção para testes ou dados existentes. Não fazer operações Git destrutivas. Reportar evidência de testes, número de requisições antes/depois para cenários observados (não inventar), PR/SHA e estado de deploy com distinção entre verificado e reportado. Aceite humano final se necessário.