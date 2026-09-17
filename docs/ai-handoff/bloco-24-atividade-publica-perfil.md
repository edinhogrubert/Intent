# Bloco 24 — Atividade pública no perfil

## Estado e origem

INTEGRADO LOCALMENTE, auditado e testado; pendente de revisão humana/publicação.

- Oficial: `edinhogrubert/Intent`, main `7fc87c2b9ba89d6c4576d12f3c1adebffbe241c9`, tag `mvp-1.0.22`.
- Base confirmada limpa, inicialmente em HEAD destacado; main local atualizada por fast-forward antes da branch.
- Laboratório: `edinhogrubert/intentNew`, branch remota `main`, commit `0110c6c7fcb15a8a784a92957097a2a24493c120`.
- Pai do patch: `ae478248dc5c22e3f69aa3e743fbf94550058765`.
- Ancestral comum com o oficial: `25e688a581e6ae61be1eeefeb61a2c1aa0f26b1c` (merge do perfil público).
- A origem foi confirmada pela API GitHub e por fetch, não pelo resumo do Gemini. Não havia handoff `bloco-24` na árvore publicada.
- Integração: `feat/public-profile-activity`, a partir da main oficial, sem cherry-pick integral.
- Commit de entrega: o commit que adiciona este documento (`feat: integrate public profile activity`); hash no relatório final e em `git log -1`.

## Arquivos

Modificados:
- `backend/src/routes/users.ts`
- `src/services/intentApi.ts`
- `src/components/PublicUserProfile.tsx`

Criados:
- `backend/src/services/public-activity-service.ts`
- `src/components/PublicUserActivity.tsx`
- `backend/tests/public-activity.test.ts`
- `backend/tests-postgres/public-activity.test.ts`
- `docs/ai-handoff/bloco-24-atividade-publica-perfil.md`

Os seis arquivos relatados foram inspecionados e adaptados. Descartados do commit do laboratório: alterações de `backend/src/lib/db-url.ts` e `backend/src/scripts/seed-mock-social.ts`. Não houve alteração de backend Prisma/schema/migrations, Firebase, autenticação, mock frontend, Docker, portas configuradas, deploy ou dados de produção.

## Auditoria e diferenças em relação ao laboratório

### 204 versus 217 testes

A diferença corresponde às regressões oficiais ausentes no laboratório: 12 casos do Bloco 21, 4 do Bloco 22 e 1 do Bloco 23 em `social-http.test.ts`. A base de 200 testes do laboratório mais seus 4 novos resulta nos 204 relatados; o oficial já tinha 217. O relatório do laboratório não foi tomado como execução certificada nesta tarefa.

Nenhum teste oficial foi substituído, removido ou ignorado. Os 217 foram preservados, com 20 testes de atividade (os quatro do laboratório adaptados e 16 regressões), totalizando 237. A suíte PostgreSQL preserva os 36 testes existentes e acrescenta 3.

### Datas e cinco tipos

| Tipo | Origem | Data usada para consultar, ordenar e retornar |
| --- | --- | --- |
| INTENT_CREATED | Intent pública criada pelo perfil | Intent.createdAt |
| INTENT_SUPPORTED | Apoio atual do perfil | Support.createdAt |
| INTENT_REACTED | Reação atual e seu tipo atual | IntentReaction.updatedAt |
| INTENT_COMMENTED | Comentário atual do perfil | IntentComment.createdAt |
| INTENT_REALIZED_PARTICIPATION | Intent realizada com apoio, comentário ou reação atual do perfil | Intent.realizedAt |

O laboratório ordenava a criação por createdAt mas exibia publishedAt, convertia apoio em realização usando a data do apoio e omitia participações por comentários/reações. A integração mantém o evento de apoio e adiciona uma única participação por Intent realizada, coerente com `realizedParticipationsCount` do perfil oficial. Reações exibem a última atualização do tipo, não uma data antiga de criação.

Esta é uma projeção de vínculos atuais, não um log imutável: remover a última participação remove seu evento de realização. A data de realização pertence à Intent; não afirma que o vínculo foi criado antes da realização. A regra inclui vínculos posteriores, assim como as estatísticas oficiais do Bloco 22.

### Cursor e desempenho

O laboratório implementava somente `nextCursor`; não existia cursor bidirecional. A UI usa apenas “Carregar mais”, por isso não foi criada navegação reversa.

O filtro do laboratório aplicava `createdAt <= cursor` no banco e só desempata o ID em memória depois de `take`. Isso podia truncar eventos com a mesma data. Corrigido com fronteira keyset no WHERE de cada uma das cinco fontes antes do LIMIT, seguindo `(occurredAt DESC, eventId DESC)`, inclusive o prefixo do tipo. UUIDs canônicos e comparação textual determinística mantêm ordem compatível com PostgreSQL.

Cada fonte busca no máximo `limit + 1`; limit padrão 20, máximo 50. No máximo 255 candidatos são combinados em memória. Não são carregados históricos inteiros. Uma consulta de usuário e cinco consultas de fontes, com seleções relacionais em lote do Prisma; nenhum laço de consulta por item, sem N+1. Cursores inválidos retornam 400 em vez de reiniciar silenciosamente a página.

Sem migration: os índices existentes são reutilizados. Ordenação por updatedAt de reação e realizedAt de Intent pode exigir sort/scan em volumes grandes; não foi realizado benchmark nem EXPLAIN com volume de produção. Memória limitada na aplicação não significa custo constante no banco.

### Privacidade e reveal

A rota usa o middleware autenticado existente. Perfil inexistente/inativo retorna 404; visitante suspenso é bloqueado pelo middleware oficial. Todas as fontes exigem Intent PUBLIC, status PUBLISHED/REALIZED e criador ACTIVE. Não há exceção para visualizar PRIVATE/FOLLOWERS no próprio histórico público.

Selects explícitos; autor contém somente id, username, displayName e avatarUrl. Não seleciona campos de reveal, credenciais, auditoria, email ou firebaseUid. O título já é público no detalhe/feed oficial. Comentários já são legíveis por quem tem acesso à Intent, independentemente da liberação: não existe campo de comentário protegido por reveal no domínio atual. O trecho usa no máximo 120 caracteres desse body público; não decifra nem deriva conteúdo de reveal. Renderização React como texto, sem HTML injetado.

Visibilidade e remoções são consultadas novamente em cada requisição, sem cache de histórico. Dados já exibidos em uma tela aberta não podem ser revogados sem nova consulta; não foi adicionado polling/tempo real. O detalhe mantém sua própria autorização ao abrir uma Intent.

### Interface e preservação dos Blocos 21–23

Migrados componente de atividade, tipos/chamada real e abas Atividade pública / Histórico de Intents. Preservados seguir/deixar de seguir oficiais, estatísticas, modal acessível de conexões com paginação, retry/cancelamento, navegação entre perfis, lista anterior de Intents e feed Seguindo.

Resolvidos conflitos sem reintroduzir as chamadas antigas followUser/unfollowUser do laboratório. Adicionados aria-pressed às abas; cancelamento de respostas antigas inclusive na paginação/retry; deduplicação de itens e preservação dos cards em falha de carregar mais. Correção mínima para TypeScript estrito no acesso ao último item do cursor.

## Contrato

`GET /v1/users/:id/activity?cursor=...&limit=20`

Resposta: `{ data: { items: PublicActivityItem[], nextCursor: string | null } }`.

Contrato aditivo; rotas existentes intactas. Endpoint somente de leitura; não altera suporte, status, realizedAt, reveal, DomainEvent, notificações, comentários ou reações.

## Validação executada

| Comando | Resultado |
| --- | --- |
| npm run lint | PASS frontend |
| npm run build | PASS frontend |
| npm --prefix backend run lint | PASS |
| npm --prefix backend run build | PASS |
| npm --prefix backend test | 237/237 PASS, 11 arquivos |
| npm run test:postgres (backend, TEST_DATABASE_URL descartável) | 39/39 PASS, 4 arquivos |
| git diff --check | PASS |

PostgreSQL real 16.15, imagem postgres:16 já disponível, container temporário com dados em tmpfs e porta aleatória vinculada somente a 127.0.0.1. Cadeia existente aplicada pelo mecanismo oficial dos testes. Container removido automaticamente após execução; sem dados persistentes do teste. Nenhum banco oficial foi utilizado.

Regressões HTTP/serviço: autenticação, perfil inexistente/inativo, parâmetros inválidos, cinco tipos/datas, 120 eventos empatados sem perdas/duplicações, limites no banco, remoções, PRIVATE/FOLLOWERS, criador inativo, projeção segura, participação por comentário/reação e número constante de chamadas. PostgreSQL: 60 eventos empatados com paginação real, visibilidade e remoções, participação sem apoio, perfil suspenso e snapshot do domínio inalterado.

Os erros Prisma impressos nos testes antigos de concorrência/FK/falha parcial são cenários negativos esperados; todos passaram.

## Riscos, pendências e revisão

- Pendente homologação visual/autenticada da nova aba; lint/build não substituem validação no navegador.
- Paginação não é um snapshot histórico entre requisições: alterações concorrentes/reação atualizada podem mover ou remover eventos. Reabrir a aba recarrega o estado atual.
- Pendente medir consultas em volume real; não há benchmark de produção nesta entrega.
- Revisar a semântica documentada de participação atual em realização, coerente com as estatísticas existentes.
- Sem push, PR, merge, tag, deploy ou acesso à VM.

Teste manual sugerido: abrir perfil, alternar abas, conferir as funções anteriores de seguir/conexões, carregar mais, abrir uma Intent, trocar rapidamente de perfil e simular erro/retry. Validar título/trecho públicos sem exibir reveal protegido.

Veredito: pronto para revisão e posterior publicação, com as limitações acima registradas.
