# Intent — histórico e rastreabilidade

## 1. Consolidação documental autorizada — 14/10/2026

Base de produto: `df02be79afaefd300e4106ecec0be0313ddb39f0`. O proprietário aprovou organização em documentos/, Agents.md na raiz/main, criação de documentos completos e exclusão de todos os Markdown anteriores, inclusive históricos/cópias. Não reescrever histórico Git nem remover código por causa desta consolidação.

Substituição:84 caminhos Markdown/74 conteúdos distintos por11 documentos canônicos. Cada origem está mapeada abaixo e permanece integralmente recuperável em link imutável do Git. Não mantemos .md antigos, renomeados para .txt ou anexados integralmente aos novos: isso perpetuaria o problema de duplicação. Detalhes antigos de tarefas, diffs, contagens e modelos divergentes permanecem evidências históricas nos objetos Git, não regras de produção.

O acordo de identidade 2.13 e as propostas 2.1–2.12 foram transportados sem perda de conteúdo; critérios de avaliação de ideias preservados com nova localização. Estados divergentes foram reconciliados consultando código, Git e PRs, sem inventar estado da VM. Referências dos executores e texto diagnóstico foram atualizados; o patch DRAFT já aplicado foi removido para não reintroduzir documentos antigos.

O teste funcional identificou um defeito anterior no resumo do executor PC: retornava erro após função9 bem-sucedida quando a última posição da lista de status estava vazia. Foi adicionado return0 explícito ao resumo, mantendo o rc do dispatcher e falhas reais. São a única correção de retorno e as únicas alterações fora de referências/textos nesta consolidação. Resultados locais e limites em Testes.

## 2. Linha de evolução confirmada no Git

| Marco | Evidência | Alcance |
|---|---|---|
| Protótipo / etapas 1–8 | Documentos de agosto e código em archive/intentV1 | UX, modelos e avaliações anteriores; não certificam o MVP com backend |
| Consolidação da main em 06/09 | Antiga main 8db7ddd arquivada; base b20862e; mvp-1.0.0 em 62e78cc | Protótipo arquivado não é baseline estável de rollback |
| Fundação e idempotência | PR #4, módulos e migrations correspondentes | Autoridade do servidor, transações e idempotência persistida |
| Reações / notificações | PRs #13/#14; merges 80ad51d / 79f169e | Interações sociais separadas de apoio e realização |
| Navegação / Home / perfis | PRs #16–#25 e relatórios dos blocos 12–24 | Entregas evoluíram após as etapas locais; pendência de uma etapa não é estado final |
| 25A / 25B / 25C | PR #26; ac3fb24828607940d611a4704c09dc08b0401acf | Links, edição, filtros e correção da race condition no fechamento |
| Contratos e executores | PR #27; f04cc3187fc325a9abc2639604c4beb35cc2a0cd | Interface PC/VM; contratos antigos substituídos pela organização atual |
| Feed e operação | PRs #29–#33 | Feed real, escopo de teste da imagem, layout e correções operacionais |
| Blocos 30–32 | PRs #35/#36 | Descoberta e deploy explícito do frontend |
| Blocos 33–36 | PRs #38/#40/#43/#44 | Participação, acompanhamento, notificações e história da Intent |
| Listas / criador guardião / sincronização | PRs #45/#46/#47 | Os planos antigos marcados não implementados foram superados por integrações |
| Bloco 37A | PR #48 | Conquistas objetivas, sem score ou data fictícia |
| DRAFT / publicação | PR #49 | Implementação aa658616; merge df02be79; evento de publicação sem backfill |

PRs estão em https://github.com/edinhogrubert/Intent/pulls. Hashes completos das entregas finais estão em Status e nos links imutáveis abaixo. Estes marcos atestam integração no Git, não implantação atual nem nova execução de testes.

## 3. Reconciliações sem apagar fatos históricos

- O prompt antigo dizia que a PR #26 estava bloqueada. Relatório posterior e Git registram a correção e o merge; a retomada atual não manda repetir esse trabalho.
- O estado datado de 19/09 recebeu apêndices posteriores, mas não absorveu as PRs #45–#49. Foi substituído por fotografia com alcance e fontes explícitos.
- O handoff DRAFT tinha bases diferentes em etapas diferentes, teste PostgreSQL pendente e depois 46/46 aprovados. A cronologia permanece no original; o estado final de integração é a PR #49. Publicar uma Intent já realizada retorna sucesso no código, apesar do erro409 descrito no plano anterior.
- Blueprint v3.0.0, README da fundação, máquina de estados do protótipo e recomendações de frameworks não foram promovidos a contrato vigente. Registrar uma conclusão antiga não a torna verdade atual.
- Fotografias de PC e VM foram preservadas como registros históricos, sem completar valores não inspecionados. Labels no frontend e versões de packages não certificam release implantada.

## 4. Mapa completo dos 84 documentos anteriores

Os links da origem apontam ao commit anterior fixo, não a arquivos locais removidos. Cada objeto continua integralmente recuperável pelo Git. Destinos indicam os novos donos do assunto; o conteúdo histórico divergente não foi copiado como regra atual. O SHA do blob permite verificar cópias e recuperar detalhes antigos sem depender de conversas.

| Origem íntegra no Git | Blob SHA | Destinos e tratamento |
|---|---|---|
| [AGENTS.md](https://github.com/edinhogrubert/Intent/blob/df02be79afaefd300e4106ecec0be0313ddb39f0/AGENTS.md) | `8467d9513978a1a77d1df6b76128262209cc23b8` | [Agents.md](../Agents.md). Contrato estável consolidado no dono do assunto; referências e interface reconciliadas com os executores versionados. |
| [JIRA.md](https://github.com/edinhogrubert/Intent/blob/df02be79afaefd300e4106ecec0be0313ddb39f0/JIRA.md) | `72dcf4aa732f7b1738c3bdd03615d03693cb805e` | [01_CASOS_DE_USO.md](01_CASOS_DE_USO.md), [8_Novas_funcionalidades.md](8_Novas_funcionalidades.md). Visão, casos, invariantes e possibilidades preservados. Diagnósticos, status e recomendações do protótipo não certificam produção. |
| [Nova pasta/HANDOFF_GEMINI_BACKEND_INTENT (1).md](https://github.com/edinhogrubert/Intent/blob/df02be79afaefd300e4106ecec0be0313ddb39f0/Nova%20pasta/HANDOFF_GEMINI_BACKEND_INTENT%20%281%29.md) | `d7c536a558574874eeb1c0fac51712d9b331b21f` | [Agents.md](../Agents.md), [02_REGRAS.md](02_REGRAS.md), [03_ARQUITETURA.md](03_ARQUITETURA.md), [8_Novas_funcionalida…4046 tokens truncated…HISTORICO.md](07_HISTORICO.md). Diff, resumo ou validações dos blocos 20–23. Resultados, revisão e limites permanecem rastreáveis; não repetir por troca de agente. |
| [docs/ai-handoff/bloco-12-home-social-3-colunas.md](https://github.com/edinhogrubert/Intent/blob/df02be79afaefd300e4106ecec0be0313ddb39f0/docs/ai-handoff/bloco-12-home-social-3-colunas.md) | `eba9414119efcf4c413f2195fbd0cf5b7db5cf11` | [01_CASOS_DE_USO.md](01_CASOS_DE_USO.md), [02_REGRAS.md](02_REGRAS.md), [04_STATUS.md](04_STATUS.md), [06_TESTES.md](06_TESTES.md), [07_HISTORICO.md](07_HISTORICO.md). Entrega por bloco: comportamento e critérios consolidados; etapas locais e limites de validação preservados como histórico. |
| [docs/ai-handoff/bloco-12-migracao-codex.md](https://github.com/edinhogrubert/Intent/blob/df02be79afaefd300e4106ecec0be0313ddb39f0/docs/ai-handoff/bloco-12-migracao-codex.md) | `2d78ec6610d02013a42279961c9db1ab806ae6b7` | [01_CASOS_DE_USO.md](01_CASOS_DE_USO.md), [02_REGRAS.md](02_REGRAS.md), [04_STATUS.md](04_STATUS.md), [06_TESTES.md](06_TESTES.md), [07_HISTORICO.md](07_HISTORICO.md). Entrega por bloco: comportamento e critérios consolidados; etapas locais e limites de validação preservados como histórico. |
| [docs/ai-handoff/bloco-13-reacoes-intents.md](https://github.com/edinhogrubert/Intent/blob/df02be79afaefd300e4106ecec0be0313ddb39f0/docs/ai-handoff/bloco-13-reacoes-intents.md) | `4a662cf5323f613cf03e22217ed24a9a1d8358cb` | [01_CASOS_DE_USO.md](01_CASOS_DE_USO.md), [02_REGRAS.md](02_REGRAS.md), [04_STATUS.md](04_STATUS.md), [06_TESTES.md](06_TESTES.md), [07_HISTORICO.md](07_HISTORICO.md). Entrega por bloco: comportamento e critérios consolidados; etapas locais e limites de validação preservados como histórico. |
| [docs/ai-handoff/bloco-14-notificacoes-sociais.md](https://github.com/edinhogrubert/Intent/blob/df02be79afaefd300e4106ecec0be0313ddb39f0/docs/ai-handoff/bloco-14-notificacoes-sociais.md) | `929d3591d15539189fbdcadcf8ab3dccc53786c1` | [01_CASOS_DE_USO.md](01_CASOS_DE_USO.md), [02_REGRAS.md](02_REGRAS.md), [04_STATUS.md](04_STATUS.md), [06_TESTES.md](06_TESTES.md), [07_HISTORICO.md](07_HISTORICO.md). Entrega por bloco: comportamento e critérios consolidados; etapas locais e limites de validação preservados como histórico. |
| [docs/ai-handoff/bloco-15-central-notificacoes-frontend.md](https://github.com/edinhogrubert/Intent/blob/df02be79afaefd300e4106ecec0be0313ddb39f0/docs/ai-handoff/bloco-15-central-notificacoes-frontend.md) | `6d836ca86ad260e9e47f460499399e440d08c5b2` | [01_CASOS_DE_USO.md](01_CASOS_DE_USO.md), [02_REGRAS.md](02_REGRAS.md), [04_STATUS.md](04_STATUS.md), [06_TESTES.md](06_TESTES.md), [07_HISTORICO.md](07_HISTORICO.md). Entrega por bloco: comportamento e critérios consolidados; etapas locais e limites de validação preservados como histórico. |
| [docs/ai-handoff/bloco-16-navegacao-notificacoes-intent.md](https://github.com/edinhogrubert/Intent/blob/df02be79afaefd300e4106ecec0be0313ddb39f0/docs/ai-handoff/bloco-16-navegacao-notificacoes-intent.md) | `fcc64fbb4117418f273d0c84cc90b5b56dd682d9` | [01_CASOS_DE_USO.md](01_CASOS_DE_USO.md), [02_REGRAS.md](02_REGRAS.md), [04_STATUS.md](04_STATUS.md), [06_TESTES.md](06_TESTES.md), [07_HISTORICO.md](07_HISTORICO.md). Entrega por bloco: comportamento e critérios consolidados; etapas locais e limites de validação preservados como histórico. |
| [docs/ai-handoff/bloco-17-polimento-social-intent.md](https://github.com/edinhogrubert/Intent/blob/df02be79afaefd300e4106ecec0be0313ddb39f0/docs/ai-handoff/bloco-17-polimento-social-intent.md) | `3d857ed2acfc1ceef35dd0c3996dc6697eae395b` | [01_CASOS_DE_USO.md](01_CASOS_DE_USO.md), [02_REGRAS.md](02_REGRAS.md), [04_STATUS.md](04_STATUS.md), [06_TESTES.md](06_TESTES.md), [07_HISTORICO.md](07_HISTORICO.md). Entrega por bloco: comportamento e critérios consolidados; etapas locais e limites de v…3736 tokens truncated…to comportamental principal; contém limites e condições exatos já conferidos |
| Arquitetura, dados, rotas, configuração | [03_ARQUITETURA.md](03_ARQUITETURA.md) | Contexto técnico vigente; schema e código citados prevalecem para detalhes não transcritos |
| Estado, integrações e evidências | [04_STATUS.md](04_STATUS.md) | Distinguir implementado, validado, mergeado e implantado |
| Decisões aprovadas | [05_DECISOES.md](05_DECISOES.md) | Não reabrir escolhas sem nova evidência ou decisão |
| Testes e resultados reutilizáveis | [06_TESTES.md](06_TESTES.md) | Critério de execução; consultar CI do SHA correspondente antes de repetir |
| Rastreabilidade histórica | [07_HISTORICO.md](07_HISTORICO.md) | Apenas para contexto e proveniência |
| Backlog futuro | [8_Novas_funcionalidades.md](8_Novas_funcionalidades.md) | Fora do requisito de paridade atual até triagem/aprovação |
| Scripts e operação | [9_scripts.md](9_scripts.md), [manual](../script/MANUAL.md) | Referência de ferramenta; não instalar ou operar produção para reconstruir software |

Se uma descrição resumida divergir do código e dos testes da revisão confirmada, registrar a divergência como lacuna e resolvê-la com o proprietário; não escolher silenciosamente uma interpretação. Dados de versões antigas são HISTÓRICOS. Não aplicar sugestões de produto do protótipo arquivado como regra.

## 3. Inventário funcional confirmado

O mapa abaixo é a lista mínima de capacidades visíveis no shell ativo `src/App.tsx` e de capacidades servidas pela API. A presença de componente legado no repositório não prova que está ativo. Cada linha aponta para o UC que dá critério de aceite.

| Área ativa | Comportamento a preservar | Aceite |
|---|---|---|
| Sessão | Firebase Auth no cliente; sincronização/validação de identidade na API; estados checking, erro recuperável, não autenticado e autenticado; sair | UC01 |
| Início/feed | Feed, filtros sociais, descoberta/busca, abrir detalhe/perfil, iniciar criação; loading/erro/empty e atualização | UC02, UC11 |
| Criar | Wizard de Intent com categoria, visibilidade, condição, meta/data/guardiões e conteúdo protegido; publicação direta padrão ou salvar rascunho; resumo e erros | UC03, UC04 |
| Minhas Intents | Listar próprias Intents, filtrar ativas/realizadas/para aprovar, atualizar e abrir detalhe | UC04–UC07 |
| Detalhe | Projeção com controle de acesso, conteúdo protegido apenas se condição e autorização satisfeitas, apoiar/retirar, aprovar, reagir, comentar, acompanhar, consultar história e retornar | UC02, UC05–UC08, UC12, UC14 |
| Perfil público | Dados públicos permitidos, métricas/conquistas objetivas, atividades públicas e abertura de Intents/conexões | UC09, UC10 |
| Perfil próprio | Informações próprias, conexões/estatísticas, editar nome/bio/avatar e refletir a atualização | UC10 |
| Conexões | Seguir/deixar de seguir, listas de seguidores/seguindo e feed de autores seguidos | UC09 |
| Notificações | Badge não lidas, lista e filtros apresentados, marcar individual/todas, abrir detalhe quando há referência | UC13 |
| Listas pessoais | CRUD privado e composição/revisão de pessoas ao selecionar guardiões na criação | UC15 |
| Links/navegação | Compartilhar URL de Intent/perfil por query string, manter navegação/histórico e destino pós-autenticação | UC16 |

O `App.tsx` atual exige sessão autenticada antes da shell principal, ainda que algumas rotas de API permitam consulta anônima. Reconstrução deve preservar o comportamento realmente pretendido após revisar `AuthGate`, links e decisões do produto; não ampliar acesso por inferência a partir de `optionalAuthenticatedUser`.

### 3.1 Conceitos de domínio

Uma Intent é criada por uma pessoa ativa, tem título/história, categoria, uma condição individual, meta/data/guardiões, visibilidade, status e texto protegido. A API vigente implementa `SUPPORT`, `DATE` e `GUARDIANS`; status `DRAFT`, `PUBLISHED`, `REALIZED`, `CANCELLED`; visibilidades `PUBLIC`, `FOLLOWERS`, `PRIVATE`. Categorias: `SPORTS`, `ENTERTAINMENT`, `TECHNOLOGY`, `EDUCATION`, `HEALTH_WELLNESS`, `CAREER_BUSINESS`, `COMMUNITY_CAUSES`, `PERSONAL_LIFE`, `OTHER`.

Apoiar, aprovar como guardião, seguir uma pessoa, acompanhar uma Intent, reagir, comentar, realizar e visualizar conteúdo são operações distintas. Meta alcançada/condição satisfeita deve ser avaliada pelo servidor; não aceitar do cliente contador, estado realizado ou identidade do ator. Condições compostas, beneficiários independentes, pagamentos e encerramento futuro não fazem parte do contrato mínimo confirmado.

### 3.2 API confirmada na revisão

Prefixos abaixo são relativos ao serviço HTTP. A autenticação é definida por rota: feed e detalhe aceitam consulta anônima sob escopo público; feeds sociais e ações que dependem da identidade exigem sessão. Confira cada rota em `backend/src/routes` para status HTTP e DTO completo. Respostas de sucesso são envolvidas em `{data: ...}`; falhas são formatadas em `app.ts`.

| Método e rota | Uso / acesso | UC |
|---|---|---|
| GET `/health`, `/health/live`, `/health/ready` | Sondagem do serviço; readiness verifica dependências conforme `health.ts` | Operação |
| POST `/v1/users/me/sync`; GET `/v1/users/me`; PATCH `/v1/users/me` | Sincronizar/consultar/editar o próprio perfil | UC01, UC10 |
| GET `/v1/users/me/social`; GET `/v1/users/:id/social` | Métricas sociais e se o visitante segue/alcança o perfil | UC09–UC10 |
| GET `/v1/users/search?q=&limit=` | Localizar pessoas para guardiões/conexões | UC03, UC15 |
| GET `/v1/users/:id/profile`, `/activity`, `/followers`, `/following` | Projeção pública, atividade e conexões paginadas | UC09–UC10 |
| POST/DELETE `/v1/users/:id/follow` | Criar/remover relação de follow | UC09 |
| GET `/v1/intents/feed?scope=&cursor=&limit=` | Feed público ou de autores seguidos | UC02, UC09 |
| GET `/v1/intents/social-feed?filter=&cursor=&limit=` | Feed autenticado com filtros `recent`, `realized`, `supported`, `mine`, `popular` | UC02 |
| GET `/v1/intents/mine`, `/guardian-requests`, `/watched` | Minhas, para aprovar e acompanhadas | UC04, UC06, UC12 |
| GET `/v1/intents/:id`; POST `/v1/intents` | Consultar detalhe/criar Intent; POST aceita `Idempotency-Key` | UC02–UC03 |
| POST `/v1/intents/:id/publish` | Publicar rascunho como seu criador; idempotente sob contrato documentado | UC04 |
| POST/DELETE `/v1/intents/:id/supports` | Apoiar/remover apoio elegível | UC05 |
| POST `/v1/intents/:id/guardian-approvals` | Registrar aprovação do guardião selecionado | UC06 |
| GET/POST `/v1/intents/:id/comments` | Ler até50 comentários/criar comentário | UC08 |
| POST/DELETE `/v1/intents/:id/reactions` | Definir/remover `LIKE`, `LOVE`, `CELEBRATE` | UC08 |
| POST/DELETE `/v1/intents/:id/watch` | Acompanhar/deixar de acompanhar | UC12 |
| GET `/v1/intents/:id/history?cursor=&limit=` | História paginada de eventos reais | UC14 |
| GET `/v1/search?q=&limit=&kind=&status=&period=&cursor=` | Busca autenticada por Intent/pessoa e filtros | UC11 |
| GET `/v1/notifications?limit=`, `/unread-count` | Lista e contador do destinatário | UC13 |
| POST/PATCH `/v1/notifications/read-all` | Marcar notificações próprias como lidas | UC13 |
| POST/PATCH `/v1/notifications/:id/read` | Marcar uma notificação própria como lida | UC13 |
| GET/POST `/v1/personal-lists` | Listar/criar listas próprias | UC15 |
| PATCH/DELETE `/v1/personal-lists/:id` | Renomear/excluir lista do proprietário | UC15 |
| POST/DELETE `/v1/personal-lists/:id/members[/:userId]` | Incluir/remover membro individual | UC15 |

Limites, enums, critérios de acesso, paginação, erros e idempotência são os das rotas/schemas/serviços desta revisão e de `02_REGRAS.md`; esta tabela é mapa de cobertura, não substitui DTOs da API.

## 4. Dados e integridade

Banco atual PostgreSQL e Prisma. Modelos confirmados em `backend/prisma/schema.prisma`: `User`, `Follow`, `Intent`, `Support`, `DomainEvent`, `IdempotencyRequest`, `Notification`, `IntentComment`, `IntentReaction`, `IntentWatch`, `PersonalContactList`, `PersonalContactListMember`. A relação de guardiões/aprovações está em JSON no registro Intent; não reconstruir como tabelas sem decisão de compatibilidade.

Invariantes relacionais obrigatórios: UID Firebase e username únicos; follow único por par; support/reaction/watch únicos por Intent+pessoa; membro único por lista+pessoa; nome de lista único por proprietário após normalização; evento de domínio e chave de deduplicação de notificação únicos; referências com integridade referencial e deleção restrita onde declarada. Valores de campo, nulabilidade, precisão, índices e nomes físicos são especificados no schema Prisma e nas migrations; gerar schema equivalente, não omitir esses detalhes durante implementação.

A cadeia versionada contém 13 migrations, de `20260903000100_initial` a `20260924000100_allow_draft_intents`. Aplicar todas em banco novo na ordem por `prisma migrate deploy`; não editar migrations aplicadas. A migration DRAFT altera nulabilidade/default de `published_at`; não executar `migrate reset`, `db push` ou backfill narrativo. Confirmar contagem e schema com migration history em ambiente novo.

Eventos atuais relevantes: `INTENT_CREATED`, `INTENT_PUBLISHED`, `SUPPORT_RECEIVED`, `SUPPORT_REMOVED`, `GUARDIAN_APPROVED`, `INTENT_REALIZED`. São registros de fatos de domínio selecionados, não event sourcing integral. Não sintetizar evento passado para preencher linha do tempo. Métricas não podem usar mocks ou ações removidas como fatos reais.

Conteúdo protegido é criptografado no backend com AES-256-GCM, IV aleatório e associated data versionada; chave não é armazenada no banco. Garantias, formato e restrições estão em `02_REGRAS.md` e `03_ARQUITETURA.md`. A recriação de aplicação vazia usa chave própria; migração de dados existentes só é possível com a chave original correspondente.

## 5. Arquitetura mínima equivalente

Uma implementação alternativa pode trocar framework e componentes visuais, mas deve preservar limites de confiança e contratos:

1. Cliente web responsivo autentica via Firebase e chama API HTTPS; nunca conecta direto ao PostgreSQL nem decide autorização/realização.
2. API valida token Firebase Admin, associa usuário ativo ao UID, valida entrada estrita e deriva ator da sessão.
3. Serviços de domínio aplicam acesso, regras e transações; PostgreSQL guarda estado autoritativo; migrations versionadas controlam evolução.
4. Conteúdo protegido só é descriptografado depois das verificações de condição e acesso no backend.
5. Notificações/eventos/métricas são consequências controladas da operação; deduplicar e persistir no mesmo limite transacional quando o código atual assim exige.
6. Logs não registram token, segredo, chave, ciphertext ou dados privados desnecessários; respostas públicas usam projeção mínima.

Implementação atual: SPA React/Vite/TypeScript/Tailwind; Node22/Express/Zod/Prisma; PostgreSQL; Firebase Auth/Admin; Docker Compose/Nginx. Redis, storage de objetos, KMS e webhook não foram comprovados como dependências funcionais do caminho principal. Não os tornar requisitos da reconstrução sem decisão e evidência.

## 6. Interface mínima equivalente

Preservar idioma português, pergunta central e identidade em `00_VISAO.md`. Reproduzir os estados e ações dos fluxos, não pixels. Shell autenticada tem cabeçalho, Início, Criar, Minhas Intents, Perfil, acesso às notificações e saída; navegação inferior no mobile. Vistas montadas na shell atual: `MvpHomeFeed`, perfil público, `CreationWizard`, `MyIntentsDashboard`, `MvpIntentDetail`, `MvpSocialProfile`; modais de notificação e edição do perfil.

Componentes com nomes parecidos podem ser protótipos/legado; só tratar como requisito quando montados na shell atual ou chamados pelo fluxo ativo. Descoberta/busca pode estar embutida em Início. As telas antigas `IntentDetailView`, `ExploreFeedView`, `ProtectedVaultPipeline` e outras não são, por sua existência isolada, evidência de experiência ativa.

Critérios gerais de UI: carregando, erro com recuperação, vazio, sucesso, confirmação, disabled e foco/teclado; atualização de estado só após resposta autoritativa; não mostrar conteúdo antes da autorização; paginação/filtros não devem misturar respostas atrasadas. Texto pode ser reescrito, preservando sentido e distinções permanentes.

## 7. Ordem de reconstrução sugerida

Uma equipe nova pode seguir esta ordem para manter uma versão executável a cada passo:

| Etapa | Entrega | Critério para avançar |
|---:|---|---|
| 0 | Repositório, ambientes, contratos, config segura e CI | Setup reproduzível; segredos fora do Git; migrations aplicam em PostgreSQL descartável |
| 1 | User/Firebase, perfil próprio, API base e projeções | Token válido cria/sincroniza conta; token inválido/inativo falha; APIs não aceitam ator do cliente |
| 2 | Modelo Intent, criptografia e detalhe/autorização | Visibilidade e conteúdo testados por criador, guardião, seguidor, usuário externo e anônimo |
| 3 | Criação publicada e condições SUPPORT/DATE/GUARDIANS | Casos UC03,05–07; meta/quórum concorrentes e autorização cobertos por PostgreSQL real |
| 4 | DRAFT/publicação, dashboard e feeds | UC02,04; rascunho isolado em toda listagem e publicação autorizada idempotente |
| 5 | Follow, perfis, busca, atividade, métricas/conquistas | UC09–11; projeção privada excluída; números derivam de dados elegíveis e definidos |
| 6 | Comentário, reação, watch, história e notificações | UC08,12–14; sem confundir reação/apoio/watch; sem ator próprio e sem evento inventado |
| 7 | Listas pessoais e seleção de guardiões | UC15; ownership e snapshot de seleção preservados |
| 8 | Compartilhamento, navegação e refinamento responsivo | UC16; links não contornam autorização; navegação continua após login |
| 9 | Build, imagem, health, backup e runbook do novo ambiente | Restore ensaiado separadamente; release/rede/deploy não presumidos pela CI |

Esta ordem é uma PROPOSTA de execução. O escopo funcional das etapas 1–8 é evidência atual, não autorização automática para reescrever a produção. Para cada etapa, compare teste de aceitação e regra antes de avançar.

## 8. Matriz de testes de reconstrução

A coluna “base existente” identifica onde encontrar testes reaproveitáveis, não declara que foram executados nesta revisão. Primeiro consultar status/CI do SHA. Se a nova implementação tiver contrato equivalente, portar o cenário e adaptar o teste; não repetir a mesma suíte do original sem necessidade.

| Área que não pode faltar | Base de testes existente |
|---|---|
| Schemas/validação e crypto | `intent-schemas`, `comment-schemas`, `reveal-crypto`, `support-condition` |
| Idempotência, replay conflitante e concorrência PostgreSQL | `idempotency.test.ts` em `tests-postgres` |
| DRAFT/publicação e isolamento | `draft-and-publish.test.ts` |
| Feed social, suporte, autorização e regressões | `social-feed`, `social-http`, `social-regression`, `support-condition` |
| Perfil, métricas e conquistas | `social-stats`, `public-activity`, `public-profile-service` via `reputation-achievements` |
| Paginação determinística e cursores | `public-activity-pagination`, `search-service`, `intent-history` |
| Comentários, reações e watches | `comments`, `reactions`, `intent-watches` nos testes PostgreSQL e HTTP/unitários correspondentes |
| Listas pessoais e ownership | `personal-contact-lists` PostgreSQL e `personal-contact-list` unitário |
| Notificações e leitura própria | `notification-http` e regressões ligadas à realização/watch |
| URLs compartilhadas e estado de navegação | `share-link.test.ts`; acrescentar integração de UI para auth/pushState se reconstruído |
| Erros HTTP, CI, tipagem e build | Workflow `.github/workflows/ci.yml`; cobertura de app/rotas e builds atuais |

Critério para declarar reconstrução funcional: cada UC aplicável tem um ou mais cenários positivos e negativos; propriedades de privacidade/acesso/concorrência são testadas em banco real ou mecanismo equivalente comprovado; nenhuma linha de matriz permanece “sem dono” sem ser marcada como lacuna aceita pelo proprietário. Teste unitário simulado não prova atomicidade PostgreSQL nem restauração.

## 9. Lacunas e limites explícitos

A documentação atual mais código permite descrever a base e iniciar reconstrução. Para uma réplica com fidelidade de operação também faltam, ou devem ser reconfirmados no começo da nova instalação:

- Quais recursos visuais de cada tela são essenciais e quais são apenas decisões de design atual; o contrato do produto é comportamento, não reprodução pixel a pixel.
- Fluxos de exclusão/recuperação de conta, moderação e mensagens privadas: há componentes/nomes no repositório, mas não entram automaticamente no shell/contrato ativo desta revisão.
- Configuração/seed segura de Firebase para ambiente novo, domínios autorizados, criação de usuários de teste, quotas e fluxo de recuperação da conta.
- Desenho de OCI, ingressos/NSG, DNS/TLS, volumes, restore externo e rotina de backup: o repositório não provisiona a infraestrutura toda; detalhes de operação em `09_scripts` podem ser históricos ou externos.
- Atualizações de perfil/sessão, campos públicos em cada tela e detalhes completos de cada DTO precisam ser conferidos nas rotas/serviços e nos testes, não inferidos apenas da tabela de endpoints.
- A rota `GET /v1/intents/:id` pode avaliar e efetivar condição DATE durante leitura; não existe garantia de job no instante do prazo. Se produto esperar execução automática pontual, isso é decisão nova.
- Retenção/expurgo de eventos, idempotency requests, notificações, contas e dados de backup não estão definidos aqui como política completa.
- O encerramento por prazo, metas imediatas com reserva, regras de retirada/reposição e alternativas de insucesso estão em proposta futura, não podem ser incorporados como se estivessem implementados.
- Release/tag e configuração efetivamente instaladas na VM não foram verificadas neste inventário.

Resolva lacunas de produto com o proprietário e registre a decisão no documento dono do assunto. Resolva lacunas de evidência operacional por inspeção da superfície correspondente. Até então, marque como NÃO VERIFICADO ou PROPOSTO; não preencha por analogia.

## 10. Checklist para agente que recebe somente o repositório

1. Ler `Agents.md`, este documento e os arquivos referenciados necessários; confirmar main/commit e estado de testes pelo provedor.
2. Marcar o objetivo como reconstrução de aplicação nova ou recuperação de dados/produção; este documento só especifica a primeira.
3. Implementar apenas capacidades confirmadas e manter propostas separadas.
4. Derivar validação e ator no backend; aplicar migrations em PostgreSQL; testar isolamento, idempotência e concorrência.
5. Ligar interface a APIs reais, preservar conteúdo privado e estados de erro/carregamento/vazio.
6. Portar cenários de aceitação aplicáveis; reutilizar evidências do mesmo comportamento quando a revisão não mudou; repetir somente delta/check obrigatório.
7. Fechar cada lacuna com decisão ou marcador explícito; atualizar o documento dono e Status/Histórico na mesma entrega.
8. Declarar o que foi reconstruído e testado, SHA/branch, ambiente, o que continua ausente e se dados/produção foram ou não tocados.

## Fluxo de alterações na main — 18/10/2026

O proprietário determinou que alterações autorizadas do Intent sejam registradas diretamente na `main`, sem branches, PRs ou worktrees para manter trabalho pendente. Atualizados `Agents.md`, Decisões (D16) e o texto de governança do backlog. O escopo de cada alteração e as validações continuam exigindo confirmação; propostas do backlog não viram implementação automaticamente.
