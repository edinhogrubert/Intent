# Intent — arquitetura e ambientes

Arquitetura de código verificada na base de [Status](04_STATUS.md); fotografias de PC/VM abaixo são **registros históricos**, não inspeções atuais. [Scripts](9_scripts.md) concentra operação/recuperação; [Testes](06_TESTES.md) concentra comandos de validação. Atualizar esta referência quando mudar ferramenta obrigatória, módulo, configuração, diretório, rede, serviço ou mecanismo de recuperação.

## 1. Aplicação vigente

Monólito modular Node/Express/TypeScript e cliente SPA React. Regras de domínio e autorização são do backend; eventos de domínio acompanham mutações críticas, sem alegar event sourcing integral. Firebase é identidade; PostgreSQL é estado de negócio.

| Camada | Implementação / fonte |
|---|---|
| Frontend | React19, Vite6, TypeScript5.8, Tailwind4 e lucide-react; [package.json](../package.json) e bun.lock |
| Backend | Node>=22, Express4.21.2, Prisma6.19.0, Zod3.25.76, Firebase Admin13.5.0, Helmet, CORS e Pino; [backend/package.json](../backend/package.json) |
| Banco | PostgreSQL; [schema Prisma](../backend/prisma/schema.prisma), migrations versionadas, UUID e TIMESTAMPTZ |
| Auth | Firebase Auth cliente + Admin no servidor, perfil local por UID, middleware existente |
| Criptografia | AES-256-GCM no backend; nomes técnicos reveal preservados por compatibilidade |
| Testes | Vitest; suítes de serviço/HTTP e PostgreSQL local descartável |
| Build/publicação | Docker/Compose ARM64; frontend estático em Nginx com proxy /api |
| Redis | Infra provisionada no relato da VM; sem cliente Redis nas dependências/config do backend inspecionado. Não afirmar que cache/fila já usa Redis |
| Storage/KMS | Propostas futuras, não serviço funcional comprovado nesta baseline |

Fluxo: navegador → frontend/Nginx → `/api/` removido pelo proxy → Express `/v1/` → Prisma/PostgreSQL; tokens validados no Firebase. SPA não acessa PostgreSQL. Referências Firestore e telas antigas podem permanecer como legado no repositório; não usá-las como persistência autoritativa de produção.

## 2. Organização do código

| Caminho | Responsabilidade |
|---|---|
| src/App.tsx | Shell, autenticação/navegação, recursos selecionados e notificações |
| src/components/ | Wizard, feeds, detalhe, perfis, atividade, conexões, listas e modais; há componentes legados, não todos ativos |
| src/services/intentApi.ts | Tipos e chamadas HTTP reais |
| src/utils/shareLink.ts | URLs, clipboard e histórico de navegação |
| backend/src/app.ts e server.ts | HTTP, montagem de rotas e inicialização |
| backend/src/routes/ | Endpoints, autenticação, parsing e envelopes |
| backend/src/domain/ | Schemas, projeções públicas, condição e criptografia |
| backend/src/middleware/ | Identidade e controles transversais |
| backend/src/services/ | Intents, mutações/idempotência, perfil, busca, histórico, notificações, watch e listas |
| backend/src/lib/ | Clientes Prisma/Firebase/logger e utilitários de infraestrutura |
| backend/prisma/ | Schema e cadeia de migrations |
| backend/tests/ e tests-postgres/ | Testes automatizados com ambientes distintos |
| deploy/oracle/ | Compose/Nginx/Dockerfile frontend e scripts de deploy |
| script/ e scripts/executores/ | Pacote operacional modular e wrappers transitórios de checkout |
| archive/intentV1/ | Código histórico; não importar nem usar como baseline vigente. Nova pasta foi consolidada/retirada; fontes imutáveis no catálogo. |

A antiga main8db7ddd foi preservada em archive/intentV1 na consolidação de06/09. Não é versão estável de rollback; main consolidada nasceu da linha codex/mvp-backend-base. Recuperação escolhe conjunto aprovado compatível de código/dados/chave, não esse protótipo.

## 3. Dados e APIs

Modelos atuais: User, Follow, Intent, Support, DomainEvent, IdempotencyRequest, Notification, IntentComment, IntentReaction, IntentWatch, PersonalContactList e PersonalContactListMember. Guardiões/aprovações ainda são JSON no modelo Intent; destinatários independentes não são um modelo entregue. DomainEvent tem chave única/registro append-only protegido por migrations. Não substituir relações por contadores enviados pelo cliente.

Cada tabela/constraint nova exige migration versionada; não reescrever migrations já aplicadas. Schema de status é string compatível, validada pela aplicação; publishedAt é opcional para DRAFT. Valores/defaults exatos estão no schema, não reproduzir toda definição SQL aqui.

Inventário de endpoints, todos relativos à API:

| Grupo | Rotas |
|---|---|
| Saúde | GET /health, /health/live, /health/ready |
| Usuário próprio | POST /v1/users/me/sync; GET/PATCH /v1/users/me; GET /v1/users/me/social |
| Pessoas | GET /v1/users/search; GET /v1/users/:id/profile, /social, /activity, /followers, /following; POST/DELETE /v1/users/:id/follow |
| Intents/listas | GET /v1/intents/feed, /social-feed, /mine, /guardian-requests, /watched; GET /v1/intents/:id |
| Escritas de Intent | POST /v1/intents; POST /:id/publish; POST/DELETE /:id/supports; POST /:id/guardian-approvals (prefixo /v1/intents) |
| Interações/história | GET/POST /v1/intents/:id/comments; POST/DELETE /:id/reactions e /:id/watch; GET /:id/history |
| Busca | GET /v1/search; parâmetros e limites em Regras |
| Notificações | GET /v1/notifications e /unread-count; POST /read-all; POST/PATCH /:id/read |
| Listas pessoais | GET/POST /v1/personal-lists; PATCH/DELETE /:id; POST /:id/members; DELETE /:id/members/:userId |

Não confundir feed/detalhe de autenticação opcional com rotas protegidas. Consultar os módulos de rotas antes de ampliar acesso. Sucesso usa envelope `{data:...}`; falhas de aplicação `{error:{code,message,requestId}}`, Zod400 e conflitos conhecidos409, conforme [app.ts](../backend/src/app.ts). Nem toda resposta de erro possui exatamente todos os campos; não presumir envelope adicional na saúde.

## 4. Configuração e bootstrap local

| Variável | Finalidade / contrato |
|---|---|
| NODE_ENV | development/test/production |
| PORT | Porta da API, padrão8080 |
| LOG_LEVEL | Nível de log |
| CORS_ORIGINS | Origens separadas por vírgula; padrão http://localhost:3000 |
| DATABASE_URL | PostgreSQL exclusivo do ambiente |
| FIREBASE_PROJECT_ID | Projeto Firebase autorizado |
| REVEAL_ENCRYPTION_KEY | Base64 de exatamente32 bytes; preservar chave de dados existentes |
| GOOGLE_APPLICATION_CREDENTIALS | Configuração do SDK Admin por arquivo seguro quando usada |
| TEST_DATABASE_URL | Somente suíte PostgreSQL descartável, contrato em Testes |

Fontes: [config.ts](../backend/src/config.ts) e [backend/.env.example](../backend/.env.example). O .env.example da raiz pode conter material histórico e não substitui contrato da API. Não copiar credenciais, tokens, volumes ou dumps de produção para outro PC. Configuração web Firebase é identificador público, não equivale à chave administrativa.

Para outro PC: instalar Git/OpenSSH, Node22 compatível, npm e Bun1.4.0 (versões da CI), Docker/Compose se usar banco em container; conferir acesso ao daemon. Criar chave SSH própria e cadastrar somente pública; clonar oficial e consultar main vigente; criar branch; instalar dependências pelos lockfiles existentes (Bun na raiz, npm ci no backend). Preparar .env local ignorado, PostgreSQL e Firebase de desenvolvimento autorizados e chave nova **só para ambiente novo**. Gerar Prisma, aplicar migrations no banco local e iniciar API/frontend pelos scripts dos manifestos. Não iniciar Compose da VM como bootstrap local: ele usa rede externa e segredos/caminhos de produção.

Na estação histórica, checkout era /home/grubert/Projetos/Intent-local, usuário grubert/host lubuntu. Fotografia de18/09/2026: Lubuntu/Ubuntu26.04.1, kernel7.0.0-31 x86_64; RAM30GiB/swap512MiB, volume144GiB/86GiB livres; Node22.22.1/npm9.2.0/Git2.53.0, Docker29.1.3/Compose2.40.3/OpenSSH10.2p1. São relatos preservados, não requisitos universais nem novas verificações. Executor tem identidade/caminhos fixos: adaptar versionadamente para outra estação, sem symlink disfarçando diferença. Não replicar segredo/runtime da VM. Caminhos e instalação dos executores em Scripts.

## 5. VM e rede: configuração versionada versus relato

[Compose API](../backend/compose.yaml): container intent-api, porta host127.0.0.1:8080→8080, redes intent-edge e intent-private externa, runtime/segredo externo. [Compose frontend](../deploy/oracle/frontend.compose.yaml): intent-frontend,127.0.0.1:3000→8080, rede intent-edge externa, filesystem read-only/tmpfs. [Nginx](../deploy/oracle/frontend.nginx.conf) serve SPA e /healthz, encaminha /api para intent-api:8080. A rede intent-edge é definida pela API; intent-private precisa existir. Nome private não comprova atributo Internal; API precisa alcançar Firebase. Conferir firewall/NSG/bindings IPv4/IPv6 em inspeção própria.

Fotografia histórica da Oracle: intent-app-01, Ashburn/us-ashburn-1, Ubuntu24.04.4ARM64, VM.Standard.A1.Flex2OCPU/12GB, disco50GB, timezone America/Sao_Paulo, swap2GB; Docker29.7.2/Compose5.5.0 relatados. Serviços de dados intent-postgres16 e intent-redis7; API/frontend saudáveis foram relatados em entregas anteriores. Nenhum desses estados foi reinspecionado nesta consolidação. Não declarar80/443 abertas/fechadas, domínio, TLS ou versões correntes sem relatório recente.

| Caminho operacional | Papel / proteção registrada |
|---|---|
| /opt/intent/source | Checkout oficial, deploy key somente leitura; sem segredos |
| /opt/intent/.env | Configuração PostgreSQL restrita |
| /opt/intent/runtime/backend.env | Ambiente API/chave; root:docker0640 no runbook histórico |
| /opt/intent/secrets/firebase-admin.json | Credencial Admin; root:10001/0440, montagem read-only em /run/secrets/firebase-admin.json |
| /opt/intent/backups/postgres | Dumps, fora do checkout |
| /opt/intent/logs/postgres-backup.log | Log do backup |
| /opt/intent/scripts/executar-backup-postgres.sh | Rotina externa requerida no deploy, não versionada neste repo |

PostgreSQL/Redis não devem ser expostos à Internet. UFW/SSH restritos são relatos de configuração, não prova atual. Não há manifestos completos de dados/OCI no repositório; reconstrução fiel depende do inventário protegido (rede, volumes, credenciais, chaves, digests e backup). Storage S3/OCI e KMS permanecem propostos.

Entrypoint da API usa prisma migrate deploy com tentativas antes de subir; reiniciar imagem pode aplicar migration pendente. Não usar migrate reset/dev ou db push em produção. Backup histórico diário03:15/retenção7dias não equivale à prova atual do cron ou da cópia externa. Recovery/rollback e suas limitações em Scripts.

## 6. Limites arquiteturais e manutenção

Preservar nomes técnicos legados por compatibilidade; renomear reveal exige escopo próprio. Não inferir genericidade DSL, commitment público, recipient ACL, armazenamento de arquivos ou uso funcional de Redis de textos históricos. Condição DATE ainda usa realização na leitura; guardiões JSON e supportGoal para compatibilidade são dívidas a avaliar, sem refatorar automaticamente.

Atualizar este arquivo junto a alteração significativa de ferramentas, runtime, dados, credenciais exigidas, infraestrutura, portas, domínio/TLS, backup/restauração, publicação ou autenticação que afete operação. Declarar em PR: ArquiteturaPC/VM sem mudança, ou quais seções mudaram. Esta consolidação muda caminhos documentais, não o desenho nem a configuração executada de PC/VM.


## Consolidação operacional de scripts — 2026-10-15 UTC

Ferramentas operacionais consolidadas em `script/`, com módulos reutilizáveis PC/VM e manual local. A alteração reorganiza o repositório; não altera serviços, volumes, rede ou instalações vigentes no PC/VM. Backend entrypoint permanece junto ao Dockerfile.
