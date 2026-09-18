# INTENT — Master Specification & Reconstruction Guide

**Arquivo:** `INTENT_MASTER_SPEC.md`  
**Finalidade:** análise de requisitos, arquitetura atual e contrato de reconstrução fiel do projeto Intent.  
**Baseline analisada:** branch `main` do repositório `edinhogrubert/Intent`  
**Commit de referência:** `8264a48fb3dcda77bd1f2e9de35de1e1e67af389`  
**Commit:** `Merge pull request #5 from edinhogrubert/feat/creation-visibility-private — Melhorar criacao de Intent com data, privada e guardioes`  
**Data da baseline:** 13/09/2026  
**Regra de precedência:** quando houver conflito entre documentação histórica e implementação, o **código da `main` nesta baseline é a fonte primária de verdade**.

---

# 0. Como usar este documento

Este documento foi escrito para permitir que um engenheiro de software ou uma IA, **sem acesso às conversas anteriores do projeto**, consiga:

1. entender o que é o produto Intent;
2. distinguir visão de produto de funcionalidades realmente implementadas;
3. reconstruir a arquitetura técnica atual;
4. reconstruir banco, API, autenticação, regras e frontend;
5. identificar decisões que não devem ser alteradas acidentalmente;
6. conhecer limitações e dívidas técnicas atuais;
7. executar testes de compatibilidade para validar uma reconstrução.

## 0.1 Classificação obrigatória

Cada capacidade deve ser interpretada em uma destas categorias:

- **IMPLEMENTADO** — comportamento existente na `main` analisada.
- **PARCIAL** — existe implementação, mas ainda não cobre a visão final.
- **PLANEJADO** — faz parte da direção do produto, mas não deve ser apresentado como pronto.
- **LEGADO/REFERÊNCIA** — existe em documentação ou código arquivado, mas não representa necessariamente a implementação vigente.
- **NÃO IMPLEMENTADO** — requisito desejado sem implementação atual identificada.

Uma reconstrução fiel **não deve promover itens PLANEJADOS ou LEGADOS para IMPLEMENTADOS sem decisão explícita**.

---

# 1. Identidade do produto

## 1.1 Nome

**Intent**

## 1.2 Lema

> **O que você quer fazer acontecer.**

## 1.3 Definição curta

Intent é uma plataforma social orientada a acontecimentos em que uma pessoa cria uma intenção, define uma condição verificável e associa a ela um conteúdo que permanece indisponível até que a condição seja satisfeita.

A unidade principal não é simplesmente uma postagem. A unidade principal é uma **Intent**.

## 1.4 Fluxo conceitual

```text
INTENÇÃO
   ↓
CONDIÇÃO
   ↓
PARTICIPAÇÃO / TEMPO / APROVAÇÃO
   ↓
CONDIÇÃO SATISFEITA
   ↓
REALIZAÇÃO
   ↓
REVELAÇÃO
```

## 1.5 Princípio de identidade

O sistema não deve ser moldado individualmente para cada integração externa.

A direção arquitetural é:

```text
Sistemas externos
       ↓
adaptadores / contratos
       ↓
modelo de eventos do Intent
       ↓
motor do Intent
```

e não:

```text
Intent
 ↓
regra especial para sistema A
 ↓
regra especial para sistema B
 ↓
regra especial para sistema C
```

O núcleo do produto deve permanecer genérico.

---

# 2. Visão do produto versus estado implementado

## 2.1 Visão de longo prazo

O Intent é concebido como uma **rede social de acontecimentos/revelações condicionais**.

Casos de uso possíveis:

- atingir uma quantidade de apoios antes de revelar algo;
- revelar um conteúdo em uma data;
- usar aprovadores/guardiões;
- campanhas de criadores;
- cupons e links liberados por meta;
- compromissos;
- resultados futuros;
- conteúdos privados;
- conteúdos destinados a grupos;
- escola, concurso, empresa ou comunidade;
- integrações futuras via APIs, webhooks ou eventos externos.

## 2.2 O que está implementado na baseline

Na implementação atual, existem três tipos de condição:

```text
SUPPORT
DATE
GUARDIANS
```

Existem três níveis de visibilidade:

```text
PUBLIC
FOLLOWERS
PRIVATE
```

O ciclo persistente principal usa:

```text
PUBLISHED
REALIZED
```

O código também reconhece `CANCELLED` em verificações de segurança, mas nesta baseline não foi identificado endpoint de cancelamento.

## 2.3 Regra essencial

**Condição e autorização não devem ser confundidas.**

Uma condição determina **quando** a Intent pode ser realizada.

A visibilidade determina **quem pode acessar** a Intent.

Na baseline atual, entretanto, o modelo de autorização ainda é simplificado e não possui uma entidade separada de `Recipient`.

---

# 3. Arquitetura de alto nível atual

```text
                      ┌──────────────────────────┐
                      │        USUÁRIO           │
                      └────────────┬─────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │ FRONTEND SPA             │
                    │ React 19                 │
                    │ TypeScript 5.8           │
                    │ Vite 6                   │
                    │ Tailwind CSS 4           │
                    │ Firebase Client          │
                    └────────────┬─────────────┘
                                 │
                           /api/v1/...
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │ NGINX                    │
                    │ frontend container       │
                    │ SPA + reverse proxy      │
                    └────────────┬─────────────┘
                                 │
                       http://intent-api:8080
                                 │
                                 ▼
                 ┌────────────────────────────────┐
                 │ INTENT API                     │
                 │ Node.js >= 22                  │
                 │ TypeScript                     │
                 │ Express 4                      │
                 │ Zod                            │
                 │ Firebase Admin                 │
                 │ Prisma                         │
                 │ Pino                           │
                 └───────────────┬────────────────┘
                                 │
            ┌────────────────────┼────────────────────┐
            │                    │                    │
            ▼                    ▼                    ▼
     Middleware/Auth        Domain Rules         Services
            │                    │                    │
            └────────────────────┴────────────────────┘
                                 │
                                 ▼
                              Prisma
                                 │
                                 ▼
                           PostgreSQL
```

## 3.1 Redis

A infraestrutura da VM foi preparada com Redis para evolução de:

- cache;
- locks;
- contadores;
- coordenação;
- filas/eventos.

Porém, **na baseline de código analisada o backend principal não depende de Redis para os fluxos implementados**.

Portanto:

- Redis existe como infraestrutura preparada;
- não deve ser tratado como requisito funcional obrigatório do backend atual;
- uma reconstrução fiel da baseline pode reproduzir os fluxos atuais apenas com PostgreSQL, Firebase e a API.

---

# 4. Stack vigente

## 4.1 Frontend

```text
React             ^19.0.1
React DOM         ^19.0.1
Vite              ^6.2.3
TypeScript        ~5.8.2
Tailwind CSS      ^4.1.14
@tailwindcss/vite ^4.1.14
Firebase          ^12.17.1
lucide-react      ^0.546.0
```

Scripts principais:

```bash
npm/bun run dev
npm/bun run build
npm/bun run preview
npm/bun run lint
```

O ambiente do projeto usa `bun.lock` no frontend e o CI executa frontend com Bun.

## 4.2 Backend

```text
Node.js                 >= 22
TypeScript              5.8.3
Express                 4.21.2
Prisma                  6.19.0
@prisma/client          6.19.0
Firebase Admin          13.5.0
Zod                     3.25.76
Helmet                  8.1.0
CORS                    2.8.5
Pino                    9.9.4
pino-http               10.5.0
Vitest                  3.2.4
```

Scripts:

```bash
npm run dev
npm run build
npm run start
npm run lint
npm test
npm run prisma:generate
npm run db:migrate
npm run test:postgres
```

---

# 5. Estrutura lógica do repositório

Estrutura relevante da baseline:

```text
Intent/
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── archive/
│   └── intentV1/
│       └── ... versão histórica / referência
│
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── domain/
│   │   │   ├── intent-schemas.ts
│   │   │   ├── reveal-crypto.ts
│   │   │   └── support-condition.ts
│   │   ├── lib/
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   ├── routes/
│   │   │   ├── health.ts
│   │   │   ├── intents.ts
│   │   │   └── users.ts
│   │   ├── services/
│   │   │   ├── intent-mutation.ts
│   │   │   ├── intent-service.ts
│   │   │   └── social-service.ts
│   │   ├── app.ts
│   │   ├── config.ts
│   │   └── server.ts
│   ├── tests/
│   ├── tests-postgres/
│   ├── Dockerfile
│   ├── compose.yaml
│   └── package.json
│
├── deploy/
│   └── oracle/
│       ├── 08-deploy-backend.sh
│       ├── frontend.Dockerfile
│       ├── frontend.compose.yaml
│       └── frontend.nginx.conf
│
├── docs/
├── src/
│   ├── components/
│   ├── services/
│   │   └── intentApi.ts
│   ├── utils/
│   ├── App.tsx
│   ├── main.tsx
│   └── types.ts
│
├── package.json
├── projetocompleto.md
├── projatual.md
├── ProximasFuncionalidades.md
└── JIRA.md
```

## 5.1 Regra sobre `archive/intentV1`

`archive/intentV1` é referência histórica.

**Não é a fonte de verdade da aplicação atual.**

Uma IA recriando o Intent não deve copiar comportamento do `archive` sobre a `main` sem comparar explicitamente com a implementação vigente.

---

# 6. Arquitetura do backend

A API segue uma separação modular simples:

```text
HTTP Request
    ↓
Route
    ↓
Middleware de autenticação
    ↓
Validação Zod
    ↓
Service / caso de uso
    ↓
Domain helpers
    ↓
Prisma transaction
    ↓
PostgreSQL
```

Essa organização é intencionalmente um **monólito modular**.

Não há necessidade de microserviços para reproduzir a baseline.

## 6.1 Camadas

### Routes

Responsáveis por:

- parsing básico;
- validação de parâmetros;
- aplicação de middleware;
- status HTTP;
- chamada de serviço.

### Middleware

Responsável principalmente por autenticação Firebase e associação do usuário externo ao usuário local.

### Domain

Contém regras puras ou próximas do domínio:

- schemas;
- criptografia da revelação;
- verificação de condição de apoio.

### Services

Contêm os casos de uso reais:

- criação;
- feed;
- consulta;
- apoio;
- remoção de apoio;
- aprovação de guardião;
- perfil social;
- seguir/deixar de seguir;
- idempotência/transações.

### Prisma/PostgreSQL

Persistência autoritativa do backend.

---

# 7. Modelo de dados vigente

O schema Prisma contém seis entidades principais:

```text
User
Follow
Intent
Support
DomainEvent
IdempotencyRequest
```

---

# 8. Entidade `User`

Campos:

```text
id             UUID PK
firebaseUid    varchar(128), unique
email          varchar(320), unique, nullable
username       varchar(40), unique
displayName    varchar(120)
bio            varchar(500), nullable
avatarUrl      varchar(2048), nullable
status         varchar(20), default ACTIVE
createdAt      timestamptz
updatedAt      timestamptz
```

Relações:

```text
User 1──N Intent
User 1──N Support
User 1──N Follow como follower
User 1──N Follow como following
User 1──N IdempotencyRequest
User 1──N DomainEvent como actor
```

## 8.1 Identidade

A identidade externa é Firebase Auth.

O backend mantém seu próprio UUID de usuário.

Mapeamento:

```text
Firebase uid
   ↓
User.firebaseUid
   ↓
User.id interno UUID
```

O restante do domínio utiliza o UUID interno.

---

# 9. Entidade `Follow`

Campos:

```text
id
followerId
followingId
createdAt
```

Restrição:

```text
UNIQUE(followerId, followingId)
```

A aplicação impede auto-follow no serviço.

---

# 10. Entidade `Intent`

Campos persistidos:

```text
id                    UUID
creatorId             UUID
type                  varchar(40)
conditionType         varchar(30)
status                varchar(20)
visibility            varchar(20)
category              varchar(40)
title                 varchar(160)
story                 text
supportGoal           integer
supportCount          integer
revealAt              timestamptz nullable
guardianIds           JSON
guardianApprovals     JSON
guardianApprovalGoal  integer nullable
revealCiphertext      text
revealIv              varchar(64)
revealAuthTag         varchar(64)
revealVersion         integer
publishedAt           timestamptz
realizedAt            timestamptz nullable
createdAt             timestamptz
updatedAt             timestamptz
```

## 10.1 Estado padrão

```text
type          = SUPPORT_REVEAL
conditionType = SUPPORT
status        = PUBLISHED
visibility    = PUBLIC
category      = OTHER
supportCount  = 0
revealVersion = 1
```

## 10.2 Índices

A baseline indexa:

```text
(status, visibility, createdAt desc)
(conditionType, revealAt)
(creatorId, createdAt desc)
```

---

# 11. Entidade `Support`

Representa um apoio único de um usuário a uma Intent.

Campos:

```text
id
intentId
userId
createdAt
```

Restrição crítica:

```text
UNIQUE(intentId, userId)
```

Portanto, um usuário não pode possuir dois apoios simultâneos na mesma Intent.

---

# 12. Entidade `DomainEvent`

Campos:

```text
id
intentId nullable
actorId nullable
type
payload JSON
idempotencyKey unique
occurredAt
```

Finalidade atual:

- auditoria de mutações relevantes;
- preservação de causalidade;
- permitir evolução futura orientada a eventos;
- impedir duplicação de eventos pela chave de idempotência.

Eventos observados na implementação:

```text
INTENT_CREATED
SUPPORT_RECEIVED
SUPPORT_REMOVED
GUARDIAN_APPROVED
INTENT_REALIZED
```

---

# 13. Entidade `IdempotencyRequest`

Campos:

```text
id
actorId
operation
key
requestHash
response JSON nullable
createdAt
```

Restrição:

```text
UNIQUE(actorId, operation, key)
```

A idempotência pertence ao ator e à operação.

---

# 14. Condições de realização

## 14.1 SUPPORT — IMPLEMENTADO

Objetivo:

```text
supportCount >= supportGoal
```

Regras:

- meta entre 1 e 1.000.000;
- criador não pode apoiar a própria Intent;
- um usuário só pode apoiar uma vez;
- somente `PUBLISHED` aceita novo apoio;
- somente Intent `SUPPORT` aceita apoio;
- Intent `PRIVATE` não aceita condição `SUPPORT`;
- em `FOLLOWERS`, somente quem segue o criador pode apoiar;
- ao atingir a meta, o mesmo transaction muda `PUBLISHED → REALIZED`.

## 14.2 DATE — IMPLEMENTADO COM LIMITAÇÃO

Criação exige `revealAt` no futuro.

Condição:

```text
revealAt <= agora
```

**Importante:** na baseline não existe scheduler identificado que realize automaticamente a Intent no instante da data.

A transição é **lazy**:

```text
GET Intent
    ↓
se PUBLISHED e DATE venceu
    ↓
updateMany → REALIZED
```

Portanto a data pode passar sem a linha ser alterada até uma leitura posterior.

Isso precisa ser reproduzido para compatibilidade estrita, ou explicitamente alterado em uma evolução futura.

## 14.3 GUARDIANS — IMPLEMENTADO

Criação exige:

- ao menos um guardião;
- UUIDs únicos;
- no máximo 20;
- `guardianApprovalGoal`;
- meta >= 1;
- meta <= quantidade de guardiões.

Aprovação:

```text
guardian ∈ guardianIds
        ↓
guardianApprovals += guardian
        ↓
quantidade approvals >= guardianApprovalGoal
        ↓
REALIZED
```

A aprovação repetida do mesmo guardião não aumenta a contagem.

---

# 15. Visibilidade e autorização

## 15.1 PUBLIC

Pode aparecer no feed público.

Após realização, o conteúdo revelado pode ser entregue ao visitante que possua acesso à rota.

## 15.2 FOLLOWERS

Visível ao:

- criador;
- usuário que segue o criador.

Feed `following` retorna Intents `PUBLIC` e `FOLLOWERS` de pessoas seguidas.

## 15.3 PRIVATE

Na baseline:

```text
criador
OU
guardião listado
```

pode consultar a Intent.

Qualquer outro usuário recebe `403 INTENT_FORBIDDEN`.

### Limitação importante

Ainda não existe entidade relacional independente para:

```text
Recipient / Destinatário
Viewer autorizado
ACL por Intent
```

Logo, na implementação atual, para uma Intent PRIVATE com guardiões, os próprios guardiões são também pessoas com acesso à Intent.

Essa é uma simplificação do modelo atual e não deve ser confundida com a visão futura de separar:

- quem conhece a Intent;
- quem pode aprová-la;
- quem pode receber/revelar o conteúdo.

---

# 16. Cofre e criptografia da revelação

## 16.1 Algoritmo

```text
AES-256-GCM
```

## 16.2 Chave

A API recebe:

```text
REVEAL_ENCRYPTION_KEY
```

em Base64.

Ao decodificar, a chave deve possuir exatamente:

```text
32 bytes
```

## 16.3 Criação

O frontend envia:

```json
{
  "revealContent": "conteúdo secreto"
}
```

O backend **não persiste o plaintext**.

Fluxo:

```text
revealContent plaintext
       ↓
sealReveal()
       ↓
AES-256-GCM
       ↓
ciphertext
iv
authTag
       ↓
PostgreSQL
```

## 16.4 IV

Gerado aleatoriamente:

```text
12 bytes
```

## 16.5 Associated Authenticated Data

Formato:

```text
intent:<intentId>:reveal:v<version>
```

Exemplo:

```text
intent:550e8400-e29b-41d4-a716-446655440000:reveal:v1
```

## 16.6 Revelação

Somente quando `status === REALIZED` e a condição ainda é validada como satisfeita o backend executa:

```text
openReveal()
```

e retorna `revealContent`.

Antes disso:

```json
"revealContent": null
```

## 16.7 O que NÃO está implementado na baseline

Documentos históricos falam em Commitment SHA-256/fingerprint.

O backend vigente analisado possui AES-GCM, mas **não foi identificado no schema atual um campo de commitment/fingerprint criptográfico equivalente ao descrito nos documentos antigos**.

Portanto isso deve ser classificado como:

**PLANEJADO/LEGADO, não como comportamento vigente da API.**

---

# 17. Idempotência e concorrência

Esta é uma característica arquitetural importante da baseline.

Mutações de Intent podem receber:

```http
Idempotency-Key: <valor>
```

Formato permitido:

```regex
^[A-Za-z0-9._:-]+$
```

Comprimento máximo:

```text
128
```

## 17.1 Hash de requisição

Quando a chave existe, o backend calcula:

```text
HMAC-SHA256(
  key = REVEAL_ENCRYPTION_KEY,
  data = "intent-idempotency:v1:" + JSON.stringify(command)
)
```

O comando original não é salvo.

Isso evita armazenar o conteúdo secreto da criação em uma tabela de idempotência.

## 17.2 Transação

Mutações são executadas com:

```text
Prisma Transaction
Isolation = Serializable
```

Há até três tentativas para conflitos concorrentes compatíveis.

## 17.3 Reutilização correta

Mesma:

```text
actor + operation + key + request
```

retorna a resposta previamente registrada.

## 17.4 Reutilização incorreta

Mesma chave com dados diferentes:

```text
409 IDEMPOTENCY_KEY_REUSED
```

---

# 18. Autenticação

## 18.1 Provedor

Firebase Authentication.

## 18.2 Transporte

Frontend obtém ID token Firebase:

```ts
firebaseUser.getIdToken()
```

e envia:

```http
Authorization: Bearer <token>
```

## 18.3 Backend

Firebase Admin executa:

```text
verifyIdToken(token, true)
```

A segunda flag exige verificação considerando token revogado.

## 18.4 Sincronização de usuário

Se `firebaseUid` ainda não existir no PostgreSQL:

1. extrai nome/e-mail/foto do token;
2. normaliza username;
3. procura username disponível;
4. cria `User`;
5. anexa a `request.appUser`.

Se já existir:

- exige `status == ACTIVE`;
- atualiza e-mail quando disponível;
- mantém/ajusta username conforme regra de migração.

---

# 19. API HTTP atual

Base lógica:

```text
/api/v1/*
```

No container da API as rotas reais são:

```text
/v1/*
```

O Nginx remove `/api/` através do reverse proxy.

---

# 20. Health endpoints

```http
GET /health
GET /health/...
```

`GET /health` retorna aproximadamente:

```json
{
  "status": "ok",
  "service": "intent-api"
}
```

O container utiliza `/health/ready` em seu healthcheck.

---

# 21. API de usuários

Todas as rotas em `/v1/users` usam autenticação obrigatória.

## 21.1 Sincronizar usuário

```http
POST /v1/users/me/sync
```

Retorna `request.appUser`.

## 21.2 Perfil autenticado

```http
GET /v1/users/me
```

## 21.3 Atualizar perfil

```http
PATCH /v1/users/me
```

Campos aceitos:

```text
username
displayName
bio
avatarUrl
```

`username`:

```regex
^[a-z0-9_]{3,30}$
```

## 21.4 Buscar usuários

```http
GET /v1/users/search?q=<texto>&limit=<1..10>
```

Busca por:

- username;
- displayName.

Não retorna o próprio usuário.

## 21.5 Perfil social

```http
GET /v1/users/me/social
GET /v1/users/:id/social
```

Retorna:

```text
id
username
displayName
bio
avatarUrl
createdAt
isMe
isFollowing
stats
recentIntents
```

`stats`:

```text
intentsCreated
intentsRealized
followersCount
followingCount
supportsGiven
supportsReceived
realizationRate
```

`realizationRate`:

```text
round(intentsRealized * 100 / intentsCreated)
```

Se nenhuma Intent criada:

```text
0
```

## 21.6 Seguir

```http
POST /v1/users/:id/follow
```

Auto-follow:

```text
409 SELF_FOLLOW_NOT_ALLOWED
```

## 21.7 Deixar de seguir

```http
DELETE /v1/users/:id/follow
```

## 21.8 Listar seguidores

```http
GET /v1/users/:id/followers
```

## 21.9 Listar seguindo

```http
GET /v1/users/:id/following
```

Paginação por cursor.

---

# 22. API de Intents

## 22.1 Feed

```http
GET /v1/intents/feed?scope=public
GET /v1/intents/feed?scope=following
```

Parâmetros:

```text
cursor UUID opcional
limit 1..50, default 20
```

`following` exige autenticação.

### Feed público

Inclui:

```text
visibility = PUBLIC
status ∈ {PUBLISHED, REALIZED}
creator.status = ACTIVE
```

### Feed seguindo

Inclui Intents de contas seguidas:

```text
visibility ∈ {PUBLIC, FOLLOWERS}
status ∈ {PUBLISHED, REALIZED}
```

## 22.2 Minhas Intents

```http
GET /v1/intents/mine
```

Autenticado.

## 22.3 Solicitações como guardião

```http
GET /v1/intents/guardian-requests
```

Filtra:

```text
conditionType = GUARDIANS
guardianIds contém usuário autenticado
creator != guardião
status ∈ {PUBLISHED, REALIZED}
```

## 22.4 Consultar Intent

```http
GET /v1/intents/:id
```

A rota do backend aceita autenticação opcional.

Aplica regras de:

- usuário ativo;
- status válido;
- visibilidade;
- follower;
- private/guardian;
- realização lazy de DATE;
- retorno ou não de segredo.

## 22.5 Criar Intent

```http
POST /v1/intents
```

Autenticação obrigatória.

Pode receber `Idempotency-Key`.

Payload lógico:

```json
{
  "title": "string",
  "story": "string",
  "category": "OTHER",
  "conditionType": "SUPPORT",
  "supportGoal": 10,
  "revealAt": null,
  "guardianIds": [],
  "guardianApprovalGoal": null,
  "revealContent": "segredo",
  "visibility": "PUBLIC"
}
```

## 22.6 Apoiar

```http
POST /v1/intents/:id/supports
```

## 22.7 Remover apoio

```http
DELETE /v1/intents/:id/supports
```

Após realização não é permitido remover apoio.

## 22.8 Aprovar como guardião

```http
POST /v1/intents/:id/guardian-approvals
```

---

# 23. Validações de criação

## 23.1 Título

```text
3..160 caracteres
trim
```

## 23.2 História

```text
3..5000 caracteres
trim
```

## 23.3 Conteúdo a revelar

```text
1..10000 caracteres
```

## 23.4 Categorias

```text
SPORTS
ENTERTAINMENT
TECHNOLOGY
EDUCATION
HEALTH_WELLNESS
CAREER_BUSINESS
COMMUNITY_CAUSES
PERSONAL_LIFE
OTHER
```

## 23.5 Condições

```text
SUPPORT
DATE
GUARDIANS
```

## 23.6 Visibilidade

```text
PUBLIC
FOLLOWERS
PRIVATE
```

## 23.7 Regra de privada

```text
PRIVATE + SUPPORT = inválido
```

Motivo do modelo atual:

uma Intent privada não deve depender de engajamento público.

---

# 24. Estados e invariantes

## 24.1 Invariante de Intent publicada baseada em apoio

Para ser considerada consistente enquanto `PUBLISHED`:

```text
supportCount >= 0
supportGoal >= 1
supportCount < supportGoal
realizedAt == null
```

Caso contrário:

```text
409 INTENT_STATE_INVALID
```

## 24.2 Realização

Ao realizar:

```text
status = REALIZED
realizedAt = now()
```

## 24.3 Imutabilidade prática pós-reveal

A remoção de apoio é bloqueada depois da realização.

Isso impede que a condição deixe de ser verdadeira após o segredo ter sido revelado.

---

# 25. Eventos de domínio por fluxo

## 25.1 Criação

```text
INTENT_CREATED
```

Payload inclui informações não secretas:

```text
type
conditionType
supportGoal
revealAt
guardianCount
guardianApprovalGoal
category
visibility
revealVersion
```

O plaintext `revealContent` não entra no evento.

## 25.2 Apoio

```text
SUPPORT_RECEIVED
```

## 25.3 Remoção

```text
SUPPORT_REMOVED
```

## 25.4 Aprovação

```text
GUARDIAN_APPROVED
```

## 25.5 Realização

```text
INTENT_REALIZED
```

---

# 26. Arquitetura do frontend atual

O `App.tsx` usa navegação de estado local, não um roteador externo.

Views:

```text
home
create
mine
detail
profile
```

Fluxo:

```text
Firebase onAuthStateChanged
        ↓
syncAuthenticatedUser()
        ↓
User PostgreSQL sincronizado
        ↓
Aplicação autenticada
```

Se não autenticado:

```text
AuthGate
```

Se autenticado:

```text
MvpHomeFeed
CreationWizard
MyIntentsDashboard
MvpIntentDetail
MvpSocialProfile
```

## 26.1 Navegação principal

Desktop/mobile oferece:

```text
Início
Criar
Minhas Intents
Perfil
Sair
```

---

# 27. Cliente HTTP do frontend

Arquivo de integração:

```text
src/services/intentApi.ts
```

Prefixo:

```text
/api
```

O método `authenticatedRequest()`:

1. exige Firebase user;
2. obtém ID token;
3. adiciona Bearer;
4. chama API;
5. interpreta envelope de erro;
6. lança `IntentApiError`.

## 27.1 Divergência importante

O backend permite autenticação opcional em:

```text
GET /v1/intents/feed
GET /v1/intents/:id
```

Porém o cliente frontend atual usa `authenticatedRequest()` inclusive para o feed e detalhes.

Resultado:

**a API suporta parcialmente leitura pública anônima, mas a UI vigente opera como aplicação autenticada.**

Uma reconstrução fiel deve preservar essa diferença ou documentar conscientemente a alteração.

---

# 28. Formato de erro HTTP

Estrutura:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Revise os dados informados.",
    "requestId": "..."
  }
}
```

Erros de validação podem incluir:

```json
{
  "fields": {
    "formErrors": [],
    "fieldErrors": {}
  }
}
```

Casos globais:

```text
INVALID_JSON        400
BODY_TOO_LARGE      413
VALIDATION_ERROR    400
RESOURCE_CONFLICT   409
ROUTE_NOT_FOUND     404
INTERNAL_ERROR      500
```

Cada request possui `X-Request-Id`.

Um `X-Request-Id` válido fornecido pelo cliente pode ser reaproveitado; caso contrário é gerado UUID.

---

# 29. Segurança HTTP

A API:

- desabilita `x-powered-by`;
- usa `helmet`;
- limita JSON a `128kb`;
- aplica allowlist CORS;
- não permite credentials CORS;
- limita métodos;
- limita headers conhecidos.

Headers aceitos incluem:

```text
Authorization
Content-Type
X-Request-Id
Idempotency-Key
```

---

# 30. Nginx / frontend container

O frontend de produção roda em Nginx.

Container:

```text
intent-frontend
```

Bind local:

```text
127.0.0.1:3000 → container:8080
```

Características:

- filesystem read-only;
- tmpfs para cache/run/tmp;
- `no-new-privileges`;
- gzip;
- assets com cache imutável;
- SPA fallback para `index.html`;
- proxy `/api/` para `intent-api:8080`.

Headers incluem:

```text
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Cross-Origin-Opener-Policy: same-origin-allow-popups
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

# 31. Backend container

Container:

```text
intent-api
```

Bind:

```text
127.0.0.1:8080:8080
```

Portanto a API não precisa ficar publicada diretamente na Internet.

Redes:

```text
intent-edge
intent-private
```

Volume de credencial:

```text
/opt/intent/secrets/firebase-admin.json
    ↓
/run/secrets/firebase-admin.json:ro
```

Arquivo de ambiente:

```text
/opt/intent/runtime/backend.env
```

Healthcheck:

```text
http://127.0.0.1:8080/health/ready
```

---

# 32. Variáveis essenciais do backend

```text
NODE_ENV
PORT
LOG_LEVEL
CORS_ORIGINS
DATABASE_URL
FIREBASE_PROJECT_ID
REVEAL_ENCRYPTION_KEY
```

Defaults relevantes:

```text
NODE_ENV=development
PORT=8080
LOG_LEVEL=info
CORS_ORIGINS=http://localhost:3000
```

---

# 33. Infraestrutura Oracle atual

A infraestrutura montada para o MVP segue a filosofia de uma VM única e simples.

Baseline operacional conhecida:

```text
Oracle Cloud
VM: intent-app-01
Ubuntu 24.04 LTS ARM64
Ampere A1
2 OCPU
12 GB RAM
50 GB disco
timezone America/Sao_Paulo
Docker
Docker Compose
```

Serviços preparados:

```text
PostgreSQL
Redis
Intent API
Intent frontend
```

PostgreSQL e Redis devem permanecer sem exposição pública direta.

O repositório é mantido em:

```text
/opt/intent/source
```

Dados operacionais usam caminhos em:

```text
/opt/intent/runtime
/opt/intent/secrets
/opt/intent/backups
/opt/intent/logs
```

---

# 34. Persistência e backup

PostgreSQL é a fonte persistente principal do backend.

Backup operacional conhecido:

```text
frequência: diária
horário: 03:15
retenção local: 7 dias
diretório: /opt/intent/backups/postgres
log: /opt/intent/logs/postgres-backup.log
```

---

# 35. CI

GitHub Actions executa três jobs.

## 35.1 Frontend

```text
Bun 1.4
bun install --frozen-lockfile
bun run lint
bun run build
```

## 35.2 Backend

```text
Node.js 22
npm ci
npm run lint
npm test
npm run test:postgres
npm run build
```

O CI sobe PostgreSQL real para teste de idempotência.

## 35.3 Scripts Oracle

```bash
bash -n deploy/oracle/*.sh
```

---

# 36. Requisitos funcionais implementados

## RF-001 — Autenticação

O sistema deve autenticar usuários por Firebase Auth.

**Status:** IMPLEMENTADO.

## RF-002 — Sincronização de identidade

Um usuário Firebase autenticado deve possuir correspondente local no PostgreSQL.

**Status:** IMPLEMENTADO.

## RF-003 — Perfil social

Usuário deve possuir username, nome, bio, avatar e métricas sociais.

**Status:** IMPLEMENTADO/PARCIAL.

## RF-004 — Seguir usuário

Usuário deve conseguir seguir outra conta ativa.

**Status:** IMPLEMENTADO.

## RF-005 — Deixar de seguir

**Status:** IMPLEMENTADO.

## RF-006 — Feed público

Deve listar Intents públicas de criadores ativos.

**Status:** IMPLEMENTADO.

## RF-007 — Feed de seguindo

Deve listar Intents PUBLIC/FOLLOWERS dos usuários seguidos.

**Status:** IMPLEMENTADO.

## RF-008 — Criar Intent por apoio

**Status:** IMPLEMENTADO.

## RF-009 — Criar Intent por data

**Status:** IMPLEMENTADO, com realização lazy.

## RF-010 — Criar Intent por guardiões

**Status:** IMPLEMENTADO.

## RF-011 — Intent PUBLIC

**Status:** IMPLEMENTADO.

## RF-012 — Intent FOLLOWERS

**Status:** IMPLEMENTADO.

## RF-013 — Intent PRIVATE

**Status:** IMPLEMENTADO em modelo simplificado criador + guardiões.

## RF-014 — Apoiar Intent

**Status:** IMPLEMENTADO.

## RF-015 — Remover apoio antes da realização

**Status:** IMPLEMENTADO.

## RF-016 — Aprovação de guardião

**Status:** IMPLEMENTADO.

## RF-017 — Criptografar revelação

**Status:** IMPLEMENTADO com AES-256-GCM.

## RF-018 — Revelar somente após condição

**Status:** IMPLEMENTADO.

## RF-019 — Registrar eventos

**Status:** IMPLEMENTADO.

## RF-020 — Idempotência

**Status:** IMPLEMENTADO.

---

# 37. Requisitos não funcionais vigentes

## RNF-001 — Segurança de segredo

Plaintext não deve ser persistido na tabela `Intent`.

## RNF-002 — Integridade criptográfica

AES-GCM deve rejeitar ciphertext/AAD/tag adulterado.

## RNF-003 — Autorização server-side

A UI nunca deve ser a autoridade de permissão.

## RNF-004 — Identidade do ator

`actorId` deve vir do contexto autenticado, nunca do corpo do comando.

## RNF-005 — Transação

A mutação e seus eventos devem ser atomicamente consistentes.

## RNF-006 — Concorrência

Mutações idempotentes devem ser executadas com transação serializável.

## RNF-007 — Observabilidade

Cada request deve possuir request ID e logging estruturado.

## RNF-008 — Banco não público

PostgreSQL não deve ficar exposto à Internet.

## RNF-009 — API não pública diretamente

Em produção, o desenho atual liga API em loopback e usa Nginx/frontend como caminho de entrada.

---

# 38. Métricas sociais realmente existentes

Na baseline atual o backend calcula:

```text
Intents criadas
Intents realizadas
Seguidores
Seguindo
Apoios dados
Apoios recebidos
Taxa de realização
```

Ainda não existe persistência/backend completo identificado para:

```text
Mobilização avançada
Confiabilidade 0..5
Ranking diário/semanal/mensal
Impacto causal completo
Curtidas em falas
Comentários sociais
Chat
Previsões
Pontuação de reputação composta
```

Esses itens pertencem à visão/roadmap ou a protótipos/documentos históricos.

---

# 39. Divergências entre documentação histórica e código atual

Este capítulo é obrigatório para uma IA de reconstrução.

## 39.1 React 18 versus React 19

Documentos antigos mencionam React 18.

A baseline atual usa React 19.

**Decisão de reconstrução:** usar stack do `package.json` atual.

## 39.2 Commitment SHA-256

Documentação histórica descreve compromisso/fingerprint pré-revelação.

O schema/backend atual analisado não persiste esses campos.

**Decisão:** não inventar essa feature na reprodução exata da baseline.

## 39.3 Recipients

A visão conceitual separa destinatários e autorizadores.

O backend atual não possui tabela `Recipient`.

**Decisão:** registrar como evolução futura.

## 39.4 Motor DSL genérico

A visão futura possui operadores:

```text
AND
OR
NOT
N_OF_M
SEQUENCE
TIME_WINDOW
```

A baseline real usa três branches explícitos:

```text
SUPPORT
DATE
GUARDIANS
```

**Decisão:** não afirmar que a DSL completa já está operacional.

## 39.5 Redis

Redis está preparado na infraestrutura, mas não é necessário para os serviços atuais observados.

## 39.6 Estados ricos antigos

Documentos/protótipos antigos podem mencionar:

```text
DRAFT
ACTIVE
WAITING
TRIGGERED
RELEASED
```

A API/backend vigente usa principalmente:

```text
PUBLISHED
REALIZED
```

e reconhece `CANCELLED`.

---

# 40. Dívidas técnicas observáveis

Estas não devem ser “corrigidas silenciosamente” durante reconstrução; primeiro deve-se reproduzir, depois evoluir.

## DT-001 — `supportGoal` semanticamente sobrecarregado

O banco exige `supportGoal`.

Na criação:

```text
SUPPORT   → supportGoal
GUARDIANS → guardianApprovalGoal como fallback
DATE      → 1
```

Isso mostra que o modelo ainda carrega herança da Intent baseada em apoio.

## DT-002 — `type = SUPPORT_REVEAL`

A criação atual persiste:

```text
SUPPORT_REVEAL
```

mesmo para condições DATE/GUARDIANS.

O cliente TypeScript aceita também `CONDITIONAL_REVEAL`, indicando evolução em andamento.

## DT-003 — Guardiões em JSON

```text
guardianIds
guardianApprovals
```

são arrays JSON.

Para escala, auditoria relacional e consultas complexas, uma tabela própria poderá ser superior.

## DT-004 — DATE lazy

Não há job/scheduler obrigatório para virar `REALIZED` automaticamente na hora programada.

## DT-005 — Leitura pública versus UI autenticada

Backend admite leitura pública em algumas rotas, mas o frontend exige Firebase user.

## DT-006 — Ausência de Recipient ACL

Privado ainda não representa todos os cenários privados desejados.

---

# 41. Funcionalidades planejadas que não devem ser confundidas com baseline

Direções registradas para evolução:

- Rule Engine genérico;
- `AND`, `OR`, `NOT`;
- `N_OF_M`;
- `SEQUENCE`;
- `TIME_WINDOW`;
- integrações API;
- webhooks;
- eventos externos;
- storage de arquivos S3 compatível;
- signed URLs;
- filas;
- tracing/OpenTelemetry;
- anti-fraude avançado;
- ranking;
- reputação;
- confiabilidade;
- impacto/mobilização;
- recipient ACL;
- revelações por janela;
- notificações;
- conteúdo além de texto;
- KMS/custódia mais avançada de chave.

**Status geral:** PLANEJADO.

---

# 42. Princípios que uma reconstrução NÃO deve violar

1. `creatorId` vem da identidade autenticada.
2. O cliente não decide autorização.
3. Conteúdo secreto não fica em plaintext no banco.
4. Uma condição satisfeita é validada pelo servidor.
5. Uma Intent não deve ser revelada antes da realização.
6. Apoio único é garantido no banco.
7. Criador não apoia sua própria Intent.
8. Operações críticas podem ser idempotentes.
9. Eventos de domínio pertencem à mesma transação da mutação.
10. Dados externos devem se adaptar ao modelo do Intent.
11. Código arquivado não suplanta `main`.
12. Itens de roadmap não podem ser apresentados como implementados.

---

# 43. Ordem recomendada de reconstrução

Uma IA recriando do zero deve seguir esta ordem.

## Etapa 1 — Banco

Criar PostgreSQL e schema:

```text
User
Follow
Intent
Support
DomainEvent
IdempotencyRequest
```

## Etapa 2 — Criptografia

Implementar:

```text
sealReveal
openReveal
revealAssociatedData
```

com AES-256-GCM.

## Etapa 3 — Firebase Admin

Validar Bearer token e sincronizar `User`.

## Etapa 4 — Infra HTTP

Express + Helmet + CORS + Pino + JSON 128kb + request ID.

## Etapa 5 — Usuários

Implementar:

```text
/me/sync
/me
/search
/social
follow
followers
following
patch profile
```

## Etapa 6 — Criação de Intent

Implementar Zod e persistência criptografada.

## Etapa 7 — Feed e autorização

PUBLIC/FOLLOWERS/PRIVATE.

## Etapa 8 — SUPPORT

Apoiar, remover, realizar.

## Etapa 9 — GUARDIANS

Lista, aprovação, realização.

## Etapa 10 — DATE

Validação de data e realização lazy na leitura.

## Etapa 11 — Idempotência

Adicionar transações serializáveis e HMAC de request.

## Etapa 12 — Frontend

Firebase Client + API client + views:

```text
home
create
mine
detail
profile
```

## Etapa 13 — Containers

API em `127.0.0.1:8080`.

Frontend em `127.0.0.1:3000`.

## Etapa 14 — Nginx

SPA + reverse proxy `/api`.

## Etapa 15 — CI

Lint + build + testes + PostgreSQL real.

---

# 44. Teste de compatibilidade de reconstrução

Uma implementação só deve ser chamada de “reconstrução fiel da baseline 8264a48” quando passar no mínimo estes testes.

## Identidade

- [ ] Firebase token válido cria/sincroniza usuário.
- [ ] Token ausente falha em rota privada.
- [ ] Conta não ACTIVE é bloqueada.
- [ ] Actor não pode ser forjado pelo payload.

## Social

- [ ] usuário A segue B;
- [ ] relação aparece em followers/following;
- [ ] auto-follow é rejeitado;
- [ ] unfollow remove a relação;
- [ ] perfil calcula taxa de realização.

## Criação SUPPORT

- [ ] meta obrigatória;
- [ ] segredo é criptografado;
- [ ] plaintext não está na linha do banco;
- [ ] Intent inicia PUBLISHED;
- [ ] PRIVATE + SUPPORT é rejeitado.

## SUPPORT

- [ ] criador não consegue apoiar;
- [ ] apoio duplicado é rejeitado;
- [ ] contador incrementa;
- [ ] evento SUPPORT_RECEIVED é criado;
- [ ] último apoio muda para REALIZED;
- [ ] INTENT_REALIZED é criado;
- [ ] segredo passa a ser retornado;
- [ ] apoio não pode ser removido após realização.

## DATE

- [ ] data passada é rejeitada na criação;
- [ ] antes da data, revealContent é null;
- [ ] após a data, uma leitura realiza a Intent;
- [ ] conteúdo é descriptografado somente depois.

## GUARDIANS

- [ ] guardiões duplicados são rejeitados;
- [ ] meta maior que número de guardiões é rejeitada;
- [ ] não guardião recebe 403;
- [ ] aprovação repetida não conta duas vezes;
- [ ] atingir quórum realiza a Intent.

## Visibilidade

- [ ] PUBLIC aparece no feed público;
- [ ] FOLLOWERS não aparece no feed público;
- [ ] FOLLOWERS pode ser lida por follower;
- [ ] FOLLOWERS é negada a não follower;
- [ ] PRIVATE é lida pelo criador;
- [ ] PRIVATE é lida por guardião;
- [ ] PRIVATE é negada a terceiro.

## Idempotência

- [ ] mesma key + mesmo comando retorna a resposta anterior;
- [ ] mesma key + comando diferente gera 409;
- [ ] corrida concorrente não duplica mutação;
- [ ] segredo não é gravado na tabela de idempotência.

## Criptografia

- [ ] chave possui 32 bytes;
- [ ] IV é único/aleatório;
- [ ] AAD contém Intent ID e versão;
- [ ] authTag adulterada impede decrypt;
- [ ] ciphertext adulterado impede decrypt.

---

# 45. Contrato de comportamento da criação

Pseudoalgoritmo compatível:

```text
function createIntent(authenticatedUser, command):
    validate command

    intentId = UUID()
    revealVersion = 1

    sealed = AES_256_GCM.encrypt(
        command.revealContent,
        REVEAL_ENCRYPTION_KEY,
        aad = "intent:" + intentId + ":reveal:v1"
    )

    transaction SERIALIZABLE:
        create Intent:
            id = intentId
            creatorId = authenticatedUser.id
            conditionType = command.conditionType
            status = PUBLISHED
            visibility = command.visibility
            title = command.title
            story = command.story
            category = command.category
            supportCount = 0
            revealAt = command.revealAt
            guardianIds = command.guardianIds
            guardianApprovals = []
            guardianApprovalGoal = command.guardianApprovalGoal
            ciphertext/iv/tag = sealed

        create DomainEvent(INTENT_CREATED)

    return public Intent
```

---

# 46. Contrato de revelação

Pseudoalgoritmo:

```text
function getIntent(intentId, viewer):

    intent = load intent

    authorize(viewer, intent.visibility)

    if intent.status == PUBLISHED
       and conditionSatisfied(intent):
          atomically set REALIZED + realizedAt

    if intent.status != REALIZED:
        return intent with revealContent = null

    assert conditionSatisfied(intent)

    revealContent = decrypt(
        ciphertext,
        iv,
        authTag,
        key,
        aad(intent.id, revealVersion)
    )

    return intent + revealContent
```

---

# 47. Contrato de SUPPORT

```text
authenticate
 ↓
load Intent
 ↓
creator active?
 ↓
supporter != creator?
 ↓
status == PUBLISHED?
 ↓
conditionType == SUPPORT?
 ↓
visibility permite apoio?
 ↓
insert Support UNIQUE(intent,user)
 ↓
increment supportCount
 ↓
DomainEvent SUPPORT_RECEIVED
 ↓
supportCount >= supportGoal?
    ├─ não → commit
    └─ sim
        ↓
      REALIZED
        ↓
      INTENT_REALIZED
        ↓
      commit
```

---

# 48. Contrato de GUARDIAN

```text
authenticate
 ↓
Intent existe?
 ↓
conditionType == GUARDIANS?
 ↓
PUBLISHED?
 ↓
authenticatedUser ∈ guardianIds?
 ↓
add unique approval
 ↓
GUARDIAN_APPROVED (se nova)
 ↓
approvals >= goal?
    ├─ não → commit
    └─ sim → REALIZED + INTENT_REALIZED
```

---

# 49. Modelo social vigente

O sistema já possui uma camada social mínima real:

```text
User
 ↓
Follow
 ↓
feed de seguindo

User
 ↓
perfil
 ↓
Intents recentes
 ↓
métricas
```

Isso diferencia o MVP atual de uma ferramenta puramente privada de “cofre”.

Entretanto, ainda não é uma rede social completa porque faltam recursos como:

- comentários;
- mensagens;
- ranking;
- descoberta avançada;
- notificações;
- reações além de support;
- reputação composta.

---

# 50. Critério para futuras IAs

Ao receber este documento, uma IA deve primeiro declarar:

```text
Baseline alvo: 8264a48fb3dcda77bd1f2e9de35de1e1e67af389
```

Depois deve separar qualquer proposta em:

```text
1. REPRODUÇÃO DA BASELINE
2. MELHORIA PROPOSTA
```

Nenhuma melhoria deve alterar silenciosamente a reprodução da baseline.

Exemplo correto:

```text
BASELINE:
DATE realiza de forma lazy no GET.

EVOLUÇÃO PROPOSTA:
adicionar scheduler para realização automática.
```

Exemplo incorreto:

```text
Implementar scheduler e afirmar que isso já era o comportamento original.
```

---

# 51. Fontes de verdade do repositório

Para reconstrução, consultar nesta ordem:

1. `backend/prisma/schema.prisma`
2. `backend/src/services/intent-service.ts`
3. `backend/src/services/intent-mutation.ts`
4. `backend/src/services/social-service.ts`
5. `backend/src/domain/*`
6. `backend/src/middleware/auth.ts`
7. `backend/src/routes/*`
8. `backend/src/app.ts`
9. `src/services/intentApi.ts`
10. `src/App.tsx`
11. `package.json`
12. `backend/package.json`
13. `deploy/oracle/*`
14. `.github/workflows/ci.yml`
15. documentação atual
16. documentação histórica
17. `archive/intentV1` somente como referência

---

# 52. Estado de maturidade

A baseline atual já ultrapassou um mock exclusivamente local.

Ela possui:

- backend real;
- PostgreSQL;
- Prisma;
- autenticação Firebase verificada no servidor;
- API HTTP;
- criptografia server-side;
- idempotência;
- eventos de domínio;
- feed;
- relações follow;
- perfil social;
- três condições;
- três visibilidades;
- Docker;
- deploy Oracle;
- Nginx;
- CI.

Porém continua sendo um **MVP arquitetural em evolução**, especialmente em:

- autorização privada granular;
- genericidade do Rule Engine;
- modelo de destinatários;
- reputação;
- storage de conteúdo;
- eventos externos;
- scheduler;
- filas/cache;
- observabilidade distribuída.

---

# 53. Resumo executivo para reconstrução

Se todo o restante deste documento for perdido, preserve estes pontos:

```text
PRODUTO
Intent = conteúdo condicionado a um acontecimento.

FRONTEND
React 19 + Vite 6 + TS + Tailwind 4 + Firebase.

BACKEND
Node 22 + Express + TS + Zod + Firebase Admin + Prisma.

BANCO
PostgreSQL.

MODELOS
User, Follow, Intent, Support, DomainEvent, IdempotencyRequest.

CONDIÇÕES
SUPPORT, DATE, GUARDIANS.

VISIBILIDADE
PUBLIC, FOLLOWERS, PRIVATE.

ESTADOS
PUBLISHED → REALIZED.

SEGREDO
AES-256-GCM no servidor.
Nunca plaintext no banco.

AUTH
Firebase ID token → User local.

SOCIAL
follow/unfollow, feed público, feed seguindo, perfil e métricas.

AUDITORIA
DomainEvent.

CONCORRÊNCIA
Idempotency-Key + HMAC + Serializable transaction.

DATE
Realização lazy na leitura.

PRIVATE
Hoje: criador + guardiões.
Recipient independente ainda não existe.

ARQUITETURA
Monólito modular containerizado.
Não microserviços.

PRODUÇÃO
Nginx frontend → /api → intent-api → PostgreSQL.

REGRA
Código main da baseline > documentos antigos > archive.
```

---

# 54. Conclusão

O Intent atual deve ser entendido como um **monólito modular orientado a domínio e eventos**, com autenticação federada pelo Firebase, estado de negócio no PostgreSQL, segredos criptografados no backend e uma camada social já funcional.

A característica central que deve sobreviver a qualquer reconstrução é:

> **uma Intent representa algo que existe agora, mas cuja realização/revelação depende de uma condição futura verificável.**

A reconstrução é fiel quando preserva não apenas telas semelhantes, mas principalmente:

- invariantes;
- autorização;
- transações;
- criptografia;
- causalidade;
- idempotência;
- estados;
- contratos HTTP;
- modelo social;
- separação entre o que está implementado e o que ainda é visão.

---

## Apêndice A — Baseline congelada

```text
Repository: edinhogrubert/Intent
Branch: main
Commit: 8264a48fb3dcda77bd1f2e9de35de1e1e67af389
Commit message:
Merge pull request #5 from edinhogrubert/feat/creation-visibility-private

Melhorar criacao de Intent com data, privada e guardioes
```

Ao atualizar este documento no futuro, criar uma nova seção de baseline em vez de apagar silenciosamente esta referência.

