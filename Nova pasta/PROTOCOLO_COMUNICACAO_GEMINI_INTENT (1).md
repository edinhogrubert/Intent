# Intent — Protocolo de Comunicação para Gemini / AIStudio

Este documento deve ser enviado ao Gemini sempre que ele for criar, revisar ou adaptar uma funcionalidade para o projeto **Intent**.

O objetivo é fazer o Gemini trabalhar de um jeito que economize tempo do Codex, reduza retrabalho e permita que o projeto continue mesmo quando houver pouco crédito disponível.

---

## 1. Papel do Gemini

Você está atuando como ambiente de laboratório e aceleração do projeto **Intent**.

Você pode:

- criar protótipos funcionais;
- propor mudanças de frontend;
- propor mudanças de backend;
- propor migrations Prisma;
- propor testes;
- explicar como migrar uma funcionalidade para o repositório oficial;
- produzir arquivos completos prontos para copiar;
- produzir diffs ou instruções passo a passo.

Você não deve assumir que o código do laboratório `intentNew` é automaticamente igual ao código oficial.

Sempre trate `intentNew` como laboratório e o repositório oficial `edinhogrubert/Intent` como fonte final de verdade.

---

## 2. Estado Atual do Projeto Oficial

Antes de qualquer tarefa, leia esta seção como estado operacional atual.

> Esta seção precisa ser atualizada a cada release.

Repositório oficial:

```text
edinhogrubert/Intent
```

Branch principal:

```text
main
```

Release operacional mais recente:

```text
mvp-1.0.11
```

Commit operacional mais recente:

```text
9d2f33b5a87263ce84f6783c440c5e81a8e695e4
```

Último bloco implantado:

```text
Bloco 12 — Home social em três colunas
```

Estado:

- GitHub `main`: alinhada.
- VM Oracle: alinhada e saudável.
- PC local: alinhado e usado como backup operacional.
- Backend, frontend, PostgreSQL e Redis: saudáveis.
- Portas públicas diretas: nenhuma.
- Acesso local por túnel: `localhost:3100`.

Tags recentes:

| Tag | Conteúdo |
| --- | --- |
| `mvp-1.0.9` | filtros no modal de notificações |
| `mvp-1.0.10` | comentários simples em Intents |
| `mvp-1.0.11` | home social em três colunas |

---

## 3. Arquitetura Real do Projeto Oficial

O Intent oficial usa:

- Frontend: React, TypeScript, Vite, Tailwind, lucide-react.
- Backend: Node.js, Express, TypeScript.
- Banco: PostgreSQL.
- ORM: Prisma.
- Autenticação: Firebase Auth no frontend e Firebase Admin no backend.
- Deploy: Docker Compose em VM Oracle.
- Proxy local: frontend Nginx encaminha `/api` para o backend.

Estrutura principal:

```text
/
├── src/                         # frontend React
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── app.ts
│   │   ├── domain/
│   │   ├── routes/
│   │   └── services/
│   ├── tests/
│   └── tests-postgres/
├── deploy/oracle/
├── docs/
└── docs/ai-handoff/
```

---

## 4. Regra de Ouro

Toda funcionalidade precisa respeitar esta separação:

| Camada | Responsabilidade |
| --- | --- |
| `backend/src/domain` | schemas Zod, tipos e regras puras |
| `backend/src/services` | regra de negócio e Prisma |
| `backend/src/routes` | rotas HTTP, parse de entrada e resposta |
| `src/services/intentApi.ts` | contrato frontend com API real |
| `src/components` | interface React |
| `backend/prisma/migrations` | alterações reais de banco |
| `docs/ai-handoff` | explicação para migração e revisão |

Não coloque regra crítica apenas no frontend.

Toda regra de segurança, privacidade, acesso, autorização, owner, seguidores, guardiões ou segredo lacrado precisa existir no backend.

---

## 5. Autenticação e Usuário Atual

O frontend envia o token Firebase no header:

```http
Authorization: Bearer <firebase-id-token>
```

O backend valida o token e define:

```ts
request.appUser
```

Toda escrita deve usar:

```ts
request.appUser!.id
```

Nunca aceite `userId`, `authorId`, `creatorId`, `ownerId` ou `id` vindos do body para decidir quem é o usuário autenticado.

Payloads que tentem enviar esses campos devem ser rejeitados com Zod `.strict()`.

---

## 6. Modelos Principais do Domínio

### User

Usuário autenticado e perfil social.

Campos públicos típicos:

```ts
id
username
displayName
bio
avatarUrl
createdAt
updatedAt
```

Campos sensíveis nunca devem ser retornados:

```ts
email
firebaseUid
passwordHash
tokens
credentials
private keys
```

Use sempre `select` explícito ou helper de projeção pública.

Nunca retorne o objeto bruto do Prisma.

### Intent

Uma Intent é um conteúdo lacrado que pode ser revelado por condição.

Condições atuais:

- apoio comunitário;
- data futura;
- aprovação por guardiões.

Visibilidades atuais:

- `PUBLIC`;
- `FOLLOWERS`;
- `PRIVATE`.

Importante:

- `PRIVATE` não significa sempre “somente criador”.
- Uma Intent privada por guardião pode ser visível para guardiões autorizados conforme regra do detalhe.
- Não simplifique acesso privado sem conferir a regra real do backend.

### Support

Apoio alternável.

Regra atual:

- primeiro clique apoia;
- segundo clique retira apoio;
- depois de realizada, participação histórica pode permanecer conforme regra atual.

### Follow

Grafo social.

Usado para:

- feed seguindo;
- acesso a Intents `FOLLOWERS`;
- listas de seguidores e seguindo;
- busca social.

### Notification

Notificações persistidas.

Tipos atuais:

- `FOLLOW_RECEIVED`;
- `SUPPORT_RECEIVED`;
- `GUARDIAN_APPROVAL_RECEIVED`.

Funcionalidades atuais:

- listagem;
- marcar como lida;
- contador de não lidas;
- filtros: todas, não lidas, lidas.

### IntentComment

Comentários simples em Intents.

Regras atuais:

- lista até 50 comentários;
- cria comentário autenticado;
- autor vem de `request.appUser.id`;
- corpo com limite de 500 caracteres;
- acesso segue a mesma autorização do detalhe da Intent.

---

## 7. Endpoints Reais Atuais

### Health

```http
GET /health/ready
```

### Usuários

```http
POST   /v1/users/me/sync
GET    /v1/users/me
PATCH  /v1/users/me
GET    /v1/users/me/social
GET    /v1/users/:id/social
GET    /v1/users/search?q=texto
POST   /v1/users/:id/follow
DELETE /v1/users/:id/follow
GET    /v1/users/:id/followers
GET    /v1/users/:id/following
```

### Intents

```http
POST   /v1/intents
GET    /v1/intents/feed
GET    /v1/intents/mine
GET    /v1/intents/guardian-requests
GET    /v1/intents/:id
POST   /v1/intents/:id/supports
DELETE /v1/intents/:id/supports
POST   /v1/intents/:id/guardian-approvals
GET    /v1/intents/:id/comments
POST   /v1/intents/:id/comments
```

### Notificações

```http
GET   /v1/notifications
GET   /v1/notifications/unread-count
PATCH /v1/notifications/:id/read
```

### Busca

```http
GET /v1/search?q=texto
```

---

## 8. Formato de Resposta da API

Respostas de sucesso devem usar:

```json
{
  "data": {}
}
```

ou:

```json
{
  "data": []
}
```

Erros devem seguir o padrão:

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

O frontend já espera mensagens humanas vindas desse formato.

---

## 9. Regras de Segurança Obrigatórias

Sempre que criar backend:

1. Usar Zod para validar entrada.
2. Usar `.strict()` em payloads de escrita.
3. Rejeitar payload vazio quando não fizer sentido.
4. Não aceitar campos sensíveis vindos do cliente.
5. Não retornar objeto Prisma bruto.
6. Usar `select` explícito.
7. Não expor conteúdo criptografado.
8. Não expor segredo revelado antes da condição.
9. Usar `request.appUser.id` para autoria.
10. Criar testes para tentativa de injeção de campos.

Campos que devem ser rejeitados se aparecerem em body de escrita comum:

```text
id
userId
authorId
creatorId
ownerId
firebaseUid
email
passwordHash
status
createdAt
updatedAt
supportCount
followersCount
followingCount
```

---

## 10. Regras de Privacidade das Intents

Antes de listar, buscar, comentar, apoiar ou abrir uma Intent, conferir acesso.

Tabela base:

| Visibilidade | Quem pode ver |
| --- | --- |
| `PUBLIC` | usuários autorizados pela regra pública atual |
| `FOLLOWERS` | criador e seguidores autorizados |
| `PRIVATE` | criador e, quando aplicável, guardiões autorizados |

Não criar lógica duplicada no frontend para decidir acesso sensível.

O frontend pode esconder botões, mas o backend deve bloquear de verdade.

---

## 11. Regras para Migrations Prisma

Se a funcionalidade exigir banco:

1. Alterar `backend/prisma/schema.prisma`.
2. Criar migration versionada em:

```text
backend/prisma/migrations/YYYYMMDDHHMMSS_nome_da_migration/migration.sql
```

3. A migration deve ser clara e compatível com PostgreSQL.
4. Não alterar migrations antigas.
5. Explicar se há risco de dados existentes.
6. Criar teste em `backend/tests-postgres` quando a regra depender de constraint, índice, concorrência ou integridade real do banco.

---

## 12. Regras para Frontend

O frontend oficial usa dados reais da API.

Não migrar para produção:

- `localStorage` como fonte principal;
- mocks como regra de negócio;
- dados fictícios fixos;
- endpoints inventados sem backend correspondente.

Pode criar componentes visuais, mas deve indicar claramente:

- o que já usa API real;
- o que é apenas visual;
- qual endpoint falta, se faltar.

---

## 13. Testes Esperados

Sempre que possível, entregar:

### Backend

```bash
cd backend
npm test
npm run lint
npm run build
```

### Frontend

```bash
npm run lint
npm run build
```

### PostgreSQL real

Usar quando envolver:

- migration;
- constraint;
- unicidade;
- idempotência;
- transação;
- concorrência;
- integridade relacional.

---

## 14. Como o Gemini Deve Entregar uma Funcionalidade

Ao terminar uma tarefa, responda sempre neste formato:

```md
# Entrega — <nome do bloco>

## Resumo
- ...

## Arquivos alterados
- caminho/arquivo.ts — motivo

## Backend
- Endpoints criados/alterados
- Services criados/alterados
- Schemas Zod criados/alterados
- Projeções públicas usadas

## Banco
- Migration criada?
- Tabelas/índices/constraints
- Risco de dados existentes

## Frontend
- Componentes criados/alterados
- Chamadas de API
- Estados de loading/erro/vazio

## Testes
- Comandos executados
- Resultado
- O que ficou sem teste automático

## Segurança e privacidade
- Como impede acesso indevido
- Como evita vazamento de campos sensíveis
- Como evita spoofing de usuário

## Como migrar para o Intent oficial
1. Copiar arquivo X
2. Criar migration Y
3. Registrar rota Z
4. Rodar testes

## O que NÃO foi feito
- ...
```

---

## 15. Quando Criar Código para o Repositório Oficial

Se for uma mudança real, entregue de preferência:

- arquivos completos;
- ou diff claro;
- ou patch separado por arquivo.

Evite entregar apenas resumo.

O ideal é que o Codex ou o humano consiga aplicar sem redescobrir a arquitetura.

---

## 16. Escopo Negativo Permanente

Não fazer sem pedido explícito:

- mudar Firebase;
- mudar portas;
- mudar Docker;
- mudar deploy Oracle;
- criar serviço externo;
- adicionar dependência pesada;
- alterar autenticação;
- substituir Prisma;
- reescrever arquitetura;
- apagar migrations antigas;
- retornar mocks como se fossem produção;
- fazer merge direto na `main`.

---

## 17. Fluxo Oficial de Trabalho

O fluxo correto do projeto é:

```text
ideia → laboratório intentNew → handoff claro → branch no Intent oficial → PR → revisão → merge → deploy VM → tag → backup local
```

O Gemini normalmente trabalha no laboratório.

O Codex normalmente migra para o repositório oficial, valida e prepara PR.

O humano decide quando aprovar, testar, fazer merge e seguir.

---

## 18. Checklist Antes de Dizer “Pronto”

Antes de dizer que está pronto, confirme:

- [ ] Não usou dados fake em produção.
- [ ] Não retornou objeto Prisma bruto.
- [ ] Não expôs campos sensíveis.
- [ ] Não aceitou autoria pelo body.
- [ ] Usou Zod `.strict()` em escrita.
- [ ] Atualizou tipos do frontend.
- [ ] Atualizou `intentApi.ts`, se houver API nova.
- [ ] Criou migration, se mudou banco.
- [ ] Criou teste de schema.
- [ ] Criou teste HTTP ou service.
- [ ] Criou teste PostgreSQL real, se necessário.
- [ ] Documentou em `docs/ai-handoff`.
- [ ] Explicou o que é produção e o que é protótipo.

---

## 19. Pedido Padrão para o Gemini

Use este pedido ao iniciar uma nova tarefa:

```text
Leia e siga o protocolo de comunicação do projeto Intent.

Trabalhe como laboratório intentNew, mas entregue pensando em migração para o repositório oficial edinhogrubert/Intent.

Antes de implementar, diga:
1. se a mudança é só frontend, só backend ou full-stack;
2. se exige migration;
3. quais endpoints reais usará ou criará;
4. quais arquivos provavelmente serão alterados;
5. quais testes provarão que está correto.

Depois implemente e entregue no formato de handoff combinado, com arquivos, regras de segurança, testes e instruções de migração.
```

---

## 20. Observação Final

O objetivo não é o Gemini “adivinhar” o projeto oficial.

O objetivo é ele produzir mudanças mais próximas da arquitetura real, com evidência suficiente para o Codex ou o humano aplicar no repositório oficial com menos custo, menos retrabalho e menos risco.

