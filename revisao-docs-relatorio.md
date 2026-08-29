# Relatório de Revisão da Documentação — INTENT OS

Revisão dos arquivos `AGENTS.md`, `JIRA.md`, `ProximasFuncionalidades.md`, `projatual.md` e `revisar.md` confrontados com o código em `src/` (commit `b46c13e`).

Legenda: **[CORRIGIDO]** = já ajustado no PR #1 · **[ABERTO]** = precisa da sua decisão · **[SUGESTÃO]** = melhoria proposta.

---

## 1. Divergências entre documentação e código

### 1.1 Estados da Intent inexistentes — **[CORRIGIDO]**
`projatual.md` e `JIRA.md` (Epic 02) descreviam o ciclo `DRAFT → ACTIVE → WAITING → TRIGGERED → RELEASED`.
No código, `Intent.status` (`src/types.ts`) é `'draft' | 'active' | 'completed' | 'cancelled'`. As strings `WAITING`, `TRIGGERED` e `RELEASED` não existem em lugar nenhum do `src/`. O avanço da revelação é derivado de `is_locked`, `reveal_window` e `revealed_at`, não de um campo de estado.

### 1.2 Papéis de participante errados — **[CORRIGIDO]**
`revisar.md` (Etapa 4) citava `IntentParticipant` com `OWNER`, `GUARDIAN`, `BENEFICIARY`, `COLLABORATOR`, `WITNESS`, `AUDITOR`.
Real: `ParticipantRole = 'recipient' | 'guardian' | 'approver' | 'participant' | 'viewer'`, com múltiplos papéis via `roles[]` e a separação tripla `IntentPeople { approvers, recipients, participants }`.

### 1.3 Contrato de quórum errado — **[CORRIGIDO]**
`revisar.md` (Etapa 5) citava `threshold_type: 'FIXED_COUNT'`, `min_count`, `allowed_guardians`.
Real: `IntentConditions.quorum_mode` (`UNANIMOUS | MAJORITY | SUPERMAJORITY | EXACT_N | PERCENTAGE`), `required_approvals`, `eligible_approvers`, `quorum_percentage`, resolvidos por `calculateEffectiveRequiredApprovals()`.

### 1.4 Motor de eventos inexistente (JIRA Epic 07) — **[CORRIGIDO]**
O Epic apontava `src/utils/storage.ts` como Event Engine, com os eventos `USER_REGISTERED`, `USER_JOINED`, `USER_APPROVED`, `GOAL_REACHED`, `DEADLINE_REACHED`, `CONTENT_RELEASED`, `CONTENT_ACCESSED`. **Nenhum desses sete existe no código.** O `storage.ts` só persiste contas, sessão e Intents locais.
Real: `IntentEventType` + `HistoryLogEntry` em `src/types.ts` (`INTENT_CREATED`, `CONDITION_SATISFIED`, `REVEAL_STARTED`, `CONTENT_REVEALED`, `REVEAL_EXPIRED`, `SUPPORT_RECEIVED`, `GUARDIAN_APPROVED`, ...). Os critérios de aceite das US-03.1, US-05.1, US-05.2, US-07.2 e US-08.1 citavam esses eventos fantasmas e foram reescritos.

### 1.5 Stack desatualizada — **[CORRIGIDO]**
`projatual.md` dizia React 18; `package.json` traz React 19, Vite 6 e Tailwind v4 via `@tailwindcss/vite`. Faltava também a derivação de chave PBKDF2 (SHA-256, 100.000 iterações) usada em `cryptoVault.ts`.

### 1.6 Tipos incompletos nos snippets — **[CORRIGIDO]**
- `Intent`: faltavam `created_at` e `visibility` (campos obrigatórios).
- `ProtectedPayload`: faltavam `fileSize`, `fileType`, `content_hash`, `encryptedAt`, `isEncrypted`; `key_status` é opcional, não obrigatório.
- `PostCategory`: documentado como `'GENERAL' | 'INTENT_OPINION'`, mas inclui também `'PREDICTION'` e `'DEBATE'`.
- `ProximasFuncionalidades.md`: o snippet de extensão redefinia `Participant` com `status: 'PENDING' | 'APPROVED'`, conflitando com o `ParticipantStatus` real (`'pending' | 'approved' | 'declined'`); também havia o typo `Guardia`.

### 1.7 Componente não documentado — **[CORRIGIDO]**
`DynamicGreetingCard.tsx` não constava na tabela de componentes de `projatual.md`.

---

## 2. Afirmações não sustentadas pelo código

### 2.1 "Etapas 1 a 8 totalmente testadas" — **[CORRIGIDO]** (ressalva adicionada)
Não existe nenhum arquivo de teste no repositório, nem dependência de test runner. O script `lint` do `package.json` é apenas `tsc --noEmit`. A validação é manual/visual.

### 2.2 "Log de auditoria local imutável" — **[CORRIGIDO]** (ressalva adicionada)
`HistoryLogEntry` é append-only por convenção da aplicação. As `firestore.rules` permitem `update` livre do documento inteiro da Intent pelo criador — nada impede reescrever ou apagar o histórico.

### 2.3 "Anonimização de dados (LGPD/GDPR compliance)" — **[CORRIGIDO]** (texto ajustado)
`DeleteAccountModal.tsx` só confirma a ação; `deleteUserAccount()` faz `filter` na lista do Local Storage. Não há anonimização, nem expurgo no Firestore, nem exclusão da conta no Firebase Auth. No JIRA a US-01.3 foi movida de `A Fazer` para `Em Andamento` com a ressalva.

### 2.4 Reputação exibida como funcionalidade pronta — **[CORRIGIDO]** (texto ajustado)
`UserProfileModal.tsx` renderiza `nivel: 'Membro Ativo — Nível 1'` com valor fixo (`storage.ts`). Não há cálculo de pontuação — isso é justamente a Etapa 9, ainda não iniciada.

---

## 3. Problemas em aberto (precisam da sua decisão)

### 3.1 Regras do Firestore contradizem o modelo de papéis — **[ABERTO]** (crítico)
`firestore.rules` só permite `get/list/update` de `intents/{id}` quando `resource.data.creator_id == request.auth.uid`.
Consequência: **guardiões, aprovadores, destinatários e apoiadores não conseguem ler nem atualizar a Intent no Firestore.** Todos os fluxos das Etapas 4, 5, 7 e 8 só funcionam de fato no fallback de Local Storage (mesma máquina/mesmo navegador). A documentação descreve esses fluxos como multiusuário e validados — o que não se sustenta no backend atual.
Sugestão: tratar como item de backlog explícito (novo Epic "Autorização Multiusuário") e, até lá, marcar as Etapas 4/5/7/8 como "validadas em ambiente single-user/local".

### 3.2 Data da auditoria em `revisar.md` — **[ABERTO]**
Consta "15 de Agosto de 2026", mas o documento foi commitado agora. Confirma se essa é a data pretendida ou se deve virar a data real da revisão.

### 3.3 Chave/segredo padrão hardcoded — **[ABERTO]**
`cryptoVault.ts` define `DEFAULT_VAULT_KEY = 'INTENT_VAULT_DEFAULT_SECRET_KEY_2026'` e o seed de commitment `'INTENT_COMMITMENT_SEED'`. Com passphrase padrão, o "cofre" é decifrável por qualquer pessoa com o `cipherText`. Isso não está documentado como limitação em nenhum dos .md e contradiz o discurso de "conteúdo protegido". Recomendo registrar como risco conhecido no `projatual.md` (seção 5) e como item de backlog.

### 3.4 `firebase-applet-config.json` versionado — **[ABERTO]**
Config do Firebase commitada no repositório. Chaves de cliente Firebase não são segredos por si só, mas convém confirmar que a proteção real está nas `firestore.rules` (hoje frágil, ver 3.1) e no App Check.

---

## 4. Sugestões de melhoria dos documentos

1. **Criar um `README.md`** — hoje não existe. O repositório abre com quatro documentos longos e nenhum ponto de entrada com: o que é, como rodar (`npm install`, `npm run dev`), variáveis de `.env.example` e um índice apontando para os demais .md.
2. **Padronizar nomes de arquivos** — `projatual.md`, `revisar.md` e `ProximasFuncionalidades.md` misturam idioma e convenções. Sugestão: `docs/arquitetura.md`, `docs/auditoria-etapas-1-8.md`, `docs/roadmap.md`, `docs/backlog-jira.md`, deixando a raiz com `README.md` + `AGENTS.md`.
3. **Eliminar a duplicação de fonte da verdade** — as 8 Etapas são descritas em `revisar.md`, em `projatual.md` e em `StagesChecklistModal.tsx` (que tem os textos das evidências no código). Três cópias que já divergiram entre si. Sugestão: manter a descrição canônica em um único doc e fazer o componente consumir/citar esse doc.
4. **Não replicar interfaces TypeScript nos .md** — os snippets de `Intent` e `ProtectedPayload` são cópias que envelhecem a cada commit (foi o que aconteceu). Prefira citar o arquivo e os nomes dos campos, ou gerar a referência automaticamente (ex.: TypeDoc).
5. **Separar "implementado" de "planejado" com marcação explícita** — vários trechos misturam o que existe com a visão de produto (KMS, ZK-proofs, webhooks). Uma etiqueta por item (`✅ implementado` / `🚧 parcial` / `📋 planejado`) evita que o doc seja lido como estado atual.
6. **Datar e versionar os documentos** — cabeçalho com "última revisão: <data> / commit `<sha>`" em cada .md, para que a defasagem fique visível.
7. **JIRA.md: adicionar coluna de rastreabilidade** — cada US deveria apontar o arquivo/função que a implementa e o critério de verificação, o que teria evitado os eventos fantasmas do item 1.4.
8. **`AGENTS.md` está subutilizado** — ele só define quatro comandos de trigger. Vale incluir as convenções reais do projeto (comandos de build/lint, padrão de nomenclatura de tipos, regra de "nunca criar `SchoolIntent`/`ContestIntent`" que hoje só existe como comentário no topo de `src/types.ts`).
9. **Registrar a limitação do fallback local** — todos os documentos tratam Firestore e Local Storage como equivalentes; na prática o Local Storage é single-device e não sincroniza entre personas. Isso muda a leitura de quase toda a matriz de validação.
10. **Adicionar seção de "Como validar cada etapa"** — passo a passo reproduzível para cada um dos 8 testes concretos, já que não há testes automatizados. Ideal como precursor de uma suíte real (Vitest + Testing Library).
