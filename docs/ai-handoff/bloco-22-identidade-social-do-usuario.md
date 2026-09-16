# Bloco 22 — Identidade Social do Usuário

Estado: IMPLEMENTADO NA INTEGRAÇÃO OFICIAL
Base: mvp-1.0.20 / a075ec5be01866aadc24a9acc5bb619972ed80d8
Bloco: 22 — Identidade Social do Usuário
Origem reaproveitada: intentNew / bb641a4
Frontend alterado: SIM
Backend alterado: SIM
Prisma alterado: NÃO
Migration criada: NÃO
Mock alterado: NÃO (produto; doubles de testes ajustados)
Contrato da API alterado: SIM (adição de quatro métricas a stats)
backend/src/app.ts alterado: NÃO
Justificativa backend/src/app.ts: não há alteração nesse arquivo no delta c95d160..bb641a4. O endpoint autenticado de perfil já existe; a funcionalidade depende somente do serviço e da apresentação. Adaptações anteriores de infraestrutura do laboratório não foram importadas.
Campos adicionados ao perfil: supportedIntentsCount, reactionsGivenCount, commentsGivenCount, realizedParticipationsCount
Métricas públicas adicionadas: Intents apoiadas, reações dadas, comentários feitos e participações em acontecimentos realizados.
Métricas privadas/internas não expostas: atividade em Intents privadas/FOLLOWERS, atividade de autores inativos, remoções, trocas de reação, cancelamentos, unfollow, comportamento suspeito e avaliação automática.

## Definições oficiais e privacidade

Todas as novas métricas restringem a atividade a Intents PUBLIC, com status PUBLISHED/REALIZED e criador ACTIVE. A restrição vale também ao consultar o próprio perfil público. A entrega original contava sem filtro de visibilidade; foi adaptada para não revelar atividade privada nem mesmo por contagem.

- supportedIntentsCount: quantidade de registros de apoio atualmente existentes no escopo público. A chave única intentId/userId garante uma Intent por apoio; apoios removidos não contam.
- reactionsGivenCount: reações atualmente existentes no escopo público; não conta histórico de trocas ou remoções.
- commentsGivenCount: comentários atualmente existentes no escopo público, não pessoas ou Intents distintas.
- realizedParticipationsCount: count de Intents públicas REALIZED com ao menos um apoio, comentário ou reação atual do usuário. OR de relações evita somar a mesma Intent várias vezes. Não há filtro excluindo Intents do próprio usuário: conta sua participação real quando existir vínculo.

As quatro consultas agregadas executam no Promise.all existente, sem carregar listas completas de atividades. O custo em volumes de produção não foi medido; nenhum índice, schema ou banco foi alterado.

## Frontend

Reaproveitadas seções do laboratório: Conexões, Como criador, Como participante e Identidade Social no Intent. Preservadas as correções oficiais do Bloco 21, incluindo contrato de follow, isolamento de requisições, paginação e diálogo acessível. Controles de conexão usam botões acessíveis por teclado.

Texto informa que a participação contabiliza acontecimentos públicos. A explicação de identidade social é genérica, sem afirmar que um perfil vazio já criou ou participou de realizações. Não há ranking, score ou avaliação pública automática. Histórico, Abrir Intent, Voltar e estados existentes permanecem.

## Arquivos alterados

- backend/src/services/public-profile-service.ts
- backend/tests/social-http.test.ts
- src/services/intentApi.ts
- src/components/PublicUserProfile.tsx

## Arquivos criados

- docs/ai-handoff/bloco-22-identidade-social-do-usuario.md
- docs/ai-handoff/block-22/reports/resumo-implementacao.md
- docs/ai-handoff/block-22/reports/validacoes.md
- docs/ai-handoff/block-22/diff/arquivos-alterados.md

Testes executados: diff --check, lint frontend/backend, build, geração Prisma 6.19.0, 214 testes backend (10 suítes) e teste funcional Chrome com fixtures sintéticas.
Resultado: aprovados; novas métricas, perfis sem/com atividade, conexão do visitante, seleção pública e filtros de privacidade cobertos. Em navegador, novos cards e fluxos do Bloco 21 aprovados após restaurar controles do cabeçalho detectados na primeira execução.
Pendências: homologação visual autenticada na VM; validação de custo das consultas com volume real. Não executados testes PostgreSQL reais ou acesso à VM.
Veredito: integração local concluída. Sem push, PR, merge ou deploy.
