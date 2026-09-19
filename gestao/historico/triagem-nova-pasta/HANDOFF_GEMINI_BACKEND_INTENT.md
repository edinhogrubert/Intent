# Intent — Guia de Backend e Handoff para Gemini

Este documento existe para permitir que o Gemini trabalhe no laboratorio
`intentNew` criando funcionalidades que possam ser migradas para o projeto
oficial `edinhogrubert/Intent` com o minimo de retrabalho.

O objetivo nao e apenas gerar telas ou codigo experimental. O objetivo e
entregar pacotes tecnicos que respeitem a arquitetura real em producao na VM da
Oracle.

## 1. Estado atual do projeto oficial

Repositorio oficial:

```text
edinhogrubert/Intent
```

Branch principal:

```text
main
```

Release operacional mais recente:

```text
mvp-1.0.9
```

Ambientes usados:

```text
PC local        backup operacional e ambiente de merge/tag
GitHub main     fonte oficial versionada
Oracle VM       ambiente implantado e validado
intentNew       laboratorio/prototipo com Gemini
```

Regra principal:

```text
O que estiver em producao precisa estar no GitHub main, na VM e no PC local.
```

## 2. Stack real em producao

Frontend:

```text
React
Vite
TypeScript
Tailwind/CSS utilitario
Firebase Auth no cliente
```

Backend:

```text
Node.js
Express
TypeScript
Prisma
PostgreSQL
Firebase Admin para validar token
```

Infra:

```text
Oracle Cloud VM ARM64
Docker / Docker Compose
PostgreSQL 16
Redis 7
Nginx no container frontend fazendo proxy /api para backend
Portas publicas fechadas
Servicos publicados somente em localhost da VM
```

Endpoints locais na VM:

```text
Frontend: http://127.0.0.1:3000
API:      http://127.0.0.1:8080
```

Uso local via tunel:

```bash
ssh -i ~/.ssh/id_ed25519 \
  -N \
  -o ServerAliveInterval=60 \
  -o ServerAliveCountMax=3 \
  -L 3100:127.0.0.1:3000 \
  ubuntu@157.151.255.227
```

Navegador:

```text
http://localhost:3100
```

## 3. Principios de arquitetura

O Intent nao e apenas uma rede social generica. Ele e uma rede social de
acontecimentos:

```text
O que voce quer fazer acontecer.
```

Uma Intent e um conteudo lacrado que pode ser revelado por uma condicao:

```text
apoios
data
guardioes
```

O backend e a autoridade. O frontend pode sugerir, montar formulario e exibir
estado, mas as regras reais precisam estar no backend.

Regras permanentes:

- Nunca confiar em `userId`, `authorId`, `creatorId` vindo do body quando a
  operacao depende do usuario autenticado.
- Usuario autenticado vem de `request.appUser.id`.
- Token Firebase e validado no backend.
- Usar Prisma com `select` explicito.
- Nunca retornar objeto bruto de `User`, `Intent` ou outros models sensiveis.
- Validar payloads com Zod.
- Para endpoints de escrita, pensar em idempotencia quando houver risco de
  retry.
- Toda tabela nova precisa de migration Prisma versionada.
- Toda regra de acesso precisa de teste.

## 4. Fluxo de autenticacao

O frontend autentica com Firebase e envia:

```http
Authorization: Bearer <firebase id token>
```

O backend valida o token com Firebase Admin e sincroniza/carrega o usuario local.

Usuario da aplicacao fica disponivel em:

```ts
request.appUser
```

Endpoints protegidos devem usar middleware de autenticacao ja existente.

Padrao esperado:

```ts
router.use(requireAuthenticatedUser);
```

ou middleware equivalente em rota especifica.

Nao criar outro sistema de login. Nao criar senha local. Nao aceitar userId por
query/body para simular outro usuario.

## 5. Modelos principais do dominio

### User

Representa usuario local sincronizado com Firebase.

Campos sensiveis ou internos que nao devem vazar:

```text
firebaseUid
email
passwordHash, se existir
tokens, credentials ou equivalentes
status, salvo quando estritamente necessario internamente
```

Campos publicos normalmente permitidos:

```text
id
username
displayName
bio
avatarUrl
createdAt, quando fizer sentido
updatedAt, quando fizer sentido
```

### Intent

Representa um acontecimento/conteudo lacrado.

Campos principais:

```text
id
creatorId
type
conditionType
status
visibility
category
title
story
supportGoal
supportCount
revealAt
guardianIds
guardianApprovals
guardianApprovalGoal
publishedAt
realizedAt
createdAt
updatedAt
```

Campos secretos que nao podem vazar em listagens, busca, comentarios ou feeds:

```text
revealCiphertext
revealIv
revealAuthTag
revealContent, exceto no detalhe quando a regra de revelacao permite
```

### Support

Registra apoio de usuario em Intent.

Regra atual:

- criador nao apoia a propria Intent;
- primeiro clique apoia;
- segundo clique retira apoio;
- apos realizacao, historico fica preservado conforme regra atual.

### Follow

Grafo social.

Usado para:

- feed seguindo;
- Intents `FOLLOWERS`;
- estatisticas de seguidores/seguindo.

### Notification

Criada no Bloco 7.

Tipos atuais:

```text
FOLLOW_RECEIVED
SUPPORT_RECEIVED
GUARDIAN_APPROVAL_RECEIVED
```

Possui `readAt` para lida/nao lida.

Possui `deduplicationKey` para evitar duplicacao.

### IdempotencyRequest

Usado para persistir respostas de operacoes idempotentes.

Antes de criar qualquer escrita nova que possa ser reenviada, avaliar se deve
usar o mecanismo existente.

## 6. Regras de visibilidade e acesso

Este e um ponto critico. Gemini deve respeitar a regra real; nao simplificar.

Visibilidades:

```text
PUBLIC
FOLLOWERS
PRIVATE
```

Condicoes:

```text
SUPPORT
DATE
GUARDIANS
```

Regras gerais de leitura:

### PUBLIC

Visivel para usuario autenticado e, em alguns feeds publicos, ate anonimo se a
rota atual permitir.

### FOLLOWERS

Visivel para:

- criador;
- usuario que segue o criador.

### PRIVATE

Visivel para:

- criador;
- guardiao listado quando a Intent for de guardioes e a regra atual permitir
  visualizar/aprovar.

Importante:

```text
Nao reduzir PRIVATE para "somente criador" em funcionalidades novas.
```

O projeto ja usa guardioes. Se uma funcionalidade nova depender de acesso a
Intent, ela precisa considerar guardioes autorizados.

Regra mental para qualquer recurso associado a Intent:

```text
Se o usuario nao pode ver a Intent, ele nao pode comentar, reagir, listar
comentarios, ver metadados privados ou executar a acao associada.
```

## 7. Endpoints atuais relevantes

Os nomes exatos podem evoluir, mas a arquitetura atual inclui:

Usuarios:

```text
POST  /v1/users/me/sync
GET   /v1/users/me
PATCH /v1/users/me
GET   /v1/users/:id/social
GET   /v1/users/me/social
GET   /v1/users/search?q=
POST  /v1/users/:id/follow
DELETE /v1/users/:id/follow
GET   /v1/users/:id/followers
GET   /v1/users/:id/following
```

Intents:

```text
POST   /v1/intents
GET    /v1/intents/feed
GET    /v1/intents/mine
GET    /v1/intents/guardian-requests
GET    /v1/intents/:id
POST   /v1/intents/:id/supports
DELETE /v1/intents/:id/supports
POST   /v1/intents/:id/guardian-approvals
```

Notificacoes:

```text
GET   /v1/notifications
GET   /v1/notifications/unread-count
PATCH /v1/notifications/:id/read
```

Busca:

```text
GET /v1/search?q=texto
```

Saude:

```text
GET /health/ready
```

## 8. Padrao de resposta da API

Sucesso:

```json
{
  "data": {}
}
```

Listas:

```json
{
  "data": {
    "items": [],
    "nextCursor": null
  }
}
```

Erros:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Revise os dados informados.",
    "fields": {},
    "requestId": "..."
  }
}
```

Ao criar endpoints novos, seguir esse padrao.

## 9. Padrao de validacao

Usar Zod.

Exemplo de schema esperado:

```ts
const schema = z.object({
  body: z.string().trim().min(1).max(500),
}).strict();
```

`.strict()` e importante para rejeitar campos extras como:

```text
authorId
userId
creatorId
status
role
firebaseUid
```

Se uma funcionalidade receber body vazio, definir claramente se e permitido.

## 10. Padrao de Prisma e projecoes

Sempre usar `select`.

Bom:

```ts
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    username: true,
    displayName: true,
    avatarUrl: true,
  },
});
```

Ruim:

```ts
const user = await prisma.user.findUnique({ where: { id } });
response.json({ data: user });
```

Motivo:

Prisma retorna todas as colunas por padrao. Isso pode expor email,
firebaseUid, status interno ou outros campos sensiveis.

## 11. Padrao de services/routes

Separar:

```text
routes/
  recebe HTTP, valida params/query/body, chama service, responde JSON

services/
  regra de negocio, acesso, Prisma, transacoes

domain/
  schemas, helpers puros, criptografia, validadores
```

Evitar regra de negocio grande dentro da rota.

## 12. Padrao para migrations

Quando criar model/tabela/campo:

```text
backend/prisma/migrations/YYYYMMDDHHMMSS_nome_da_migration/migration.sql
backend/prisma/schema.prisma
```

Toda migration deve:

- aplicar em PostgreSQL real;
- ser validada no CI, quando possivel;
- nao depender de dados manuais ocultos;
- nao apagar dados existentes sem plano de rollback.

## 13. Deploy na VM

O deploy real roda na Oracle VM a partir de:

```text
/opt/intent/source
```

Fluxo manual usado:

```bash
cd /opt/intent/source
git fetch origin main --tags
git switch --detach <commit>

sudo bash /opt/intent/source/deploy/oracle/08-deploy-backend.sh

sudo docker compose \
  -f /opt/intent/source/deploy/oracle/frontend.compose.yaml \
  up -d --build --force-recreate
```

Validacao:

```bash
curl -s http://127.0.0.1:8080/health/ready
echo
curl -s http://127.0.0.1:3000/healthz
echo
sudo docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
```

## 14. Fluxo Git e releases

Nunca trabalhar direto na `main`.

Fluxo esperado:

```text
branch pequena
commit
push
PR
CI
review
merge
deploy VM
teste manual
tag mvp-1.0.x
backup bundle local
```

Tags recentes:

```text
mvp-1.0.5  edicao simples de perfil
mvp-1.0.6  notificacoes persistidas
mvp-1.0.7  busca simples
mvp-1.0.8  contador de notificacoes nao lidas
mvp-1.0.9  filtros no modal de notificacoes
```

PC local tambem e backup operacional.

Backup local:

```bash
git bundle create ~/Projetos/Intent-backup-$(date +%Y-%m-%d_%H-%M).bundle --all
```

## 15. Como Gemini deve entregar uma funcionalidade

Toda tarefa do Gemini deve produzir um pacote de migracao, nao apenas um resumo.

Formato obrigatorio de entrega:

```text
Nome do bloco:
Objetivo:

Arquivos alterados no intentNew:
- arquivo
- o que mudou
- pronto para migrar? sim/parcial/nao

Contrato de API:
- metodo
- rota
- auth
- body
- query
- resposta
- erros

Modelo Prisma sugerido:
- model completo
- indices
- relacoes
- migration necessaria

Schemas Zod:
- schema completo
- campos aceitos
- campos rejeitados

Regra de acesso:
- PUBLIC
- FOLLOWERS
- PRIVATE criador
- PRIVATE guardiao
- sem acesso

Projecoes seguras:
- campos permitidos
- campos proibidos

Frontend:
- componentes alterados/criados
- props
- estados loading/empty/error
- chamadas de API

Testes sugeridos:
- unitarios
- HTTP
- PostgreSQL real
- frontend lint/build

O que NAO migrar:
- mocks
- localStorage
- atalhos do laboratorio
- suposicoes nao compativeis

Riscos:
- pontos duvidosos
- decisoes pendentes
```

## 16. O que Gemini nao deve fazer

Nao deve:

- criar outro padrao de autenticacao;
- criar endpoints fora do padrao `/v1`;
- retornar objeto Prisma bruto;
- ignorar guardioes em Intents privadas;
- depender de localStorage para dado de producao;
- criar migration sem explicar;
- mudar Docker/deploy/Firebase sem pedido explicito;
- misturar varias funcionalidades grandes em um bloco;
- criar UI bonita que nao conversa com backend real;
- assumir que `intentNew` e identico ao `Intent` oficial.

## 17. Checklist de revisao antes de mandar ao Codex

Antes de entregar ao Codex, Gemini deve responder:

```text
1. Tem migration? sim/nao
2. Quais tabelas/campos novos?
3. Quais endpoints novos?
4. Exige autenticacao?
5. Usa request.appUser.id?
6. Algum userId/authorId vem do body?
7. Usa select explicito?
8. Quais campos sensiveis foram protegidos?
9. Como PRIVATE + GUARDIANS foi tratado?
10. Quais testes provam a regra?
11. O que ficou fora do escopo?
12. O que e prototipo e nao deve migrar?
```

## 18. Exemplo de entrega ideal para comentario em Intent

Se a tarefa for comentarios, Gemini deve entregar algo assim:

```text
Funcionalidade:
Comentarios simples em Intents.

Model:
IntentComment

Endpoints:
GET /v1/intents/:id/comments
POST /v1/intents/:id/comments

Regra:
Somente quem pode visualizar a Intent pode listar/criar comentario.

PRIVATE + GUARDIANS:
Guardiao listado pode comentar se ja pode visualizar/aprovar a Intent.

Fora:
edicao, exclusao, respostas, reacoes, notificacao de comentario.
```

## 19. Criatividade esperada do Gemini

Gemini pode e deve propor melhorias, inclusive backend, desde que separe:

```text
Essencial para MVP
Boa melhoria mas opcional
Ideia futura
Nao recomendado agora
```

O melhor Gemini para este projeto nao e o que faz mais codigo. E o que entrega
codigo, contrato, riscos e teste de forma que o Codex ou o humano consiga
integrar com seguranca mesmo com pouco credito disponivel.

