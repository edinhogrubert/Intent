# Estrutura do Backlog do Jira — INTENT OS

Este documento foi gerado para auxiliar na criação e atualização das demandas no **Jira**, mapeando a especificação do Confluence para os componentes já implementados no protótipo funcional **INTENT OS**.

Ele está dividido em duas partes:

| Parte | Epics | Natureza |
| :--- | :--- | :--- |
| **Parte A — Protótipo de produto** | 01 a 08 | o que já foi construído: as 8 etapas com experiência completa, validadas manualmente |
| **Parte B — Endurecimento (F-1 a F3)** | 09 a 13 | o que torna a promessa verdadeira: autoridade no servidor, cofre real e os invariantes `INV-001..010` |

A Parte B nasce de `projeto.md` (§13 roadmap, §14 invariantes, §18 rastreabilidade) e da revisão sênior em `visaodedoisenior.md`. Regra de ouro da Parte B: **nenhuma story é dada como concluída sem o teste automatizado do invariante que ela sustenta.**

---

## 📊 Mapeamento de Status no Jira
- **Concluído (Done):** Funcionalidade validada manualmente no MVP (o repositório ainda não possui testes automatizados). Na Parte B, exige teste automatizado verde.
- **Code Review:** Código implementado pela IA / Desenvolvedor, aguardando validação visual ou de regra de negócio do Product Owner.
- **Em Análise:** Item em refinamento funcional / validação com Product Owner.
- **Em Andamento (In Progress):** Item atualmente sendo trabalhado.
- **A Fazer (To Do):** Item planejado para Sprints futuras ou refinamento de casos extremos.

## 🧩 Tipos de Item
`EPIC` · `FEATURE` · `STORY` · **`SPIKE`** · `BUG` · `TASK`

O **SPIKE** é específico da Parte B: caixa de tempo cuja entrega é um **documento de decisão**, não código. Existe porque parte de F-1 a F2 ainda é descoberta, e implementar criptografia antes de decidir contra quem se defende produz criptografia decorativa.

---

# Parte A — Protótipo de produto (Epics 01 a 08)

---

## 🟢 EPIC 01 — Identity & Account
**Resumo:** Gestão de identidade, autenticação, controle de sessão e seleção de personas ativas.  
**Status do Epic:** `Concluído`  
**Componente Técnico:** `src/components/AuthGate.tsx`, `src/components/TesterProfileSwitcherBar.tsx`, `src/components/UserProfileModal.tsx`, `src/utils/storage.ts`

---

### ➔ US-01.1: Autenticação e Seleção de Perfil (Login/Session)
- **Status:** `Concluído`
- **Tipo:** User Story
- **Descrição:** Como usuário do INTENT, quero autenticar e selecionar meu perfil ativo para visualizar apenas as intenções, cofres e permissões associadas à minha conta.
- **Critérios de Aceitação (Given / When / Then):**
  - **Given** que estou na aplicação INTENT,
  - **When** seleciono uma persona (ex: Creator, Participant, Guardian, Recipient) na barra de perfis,
  - **Then** a sessão é alterada instantaneamente e o sistema filtra as Intents e alertas para a pessoa ativa.

---

### ➔ US-01.2: Visualização e Edição de Perfil de Usuário
- **Status:** `Concluído`
- **Tipo:** User Story
- **Descrição:** Como usuário cadastrado, quero abrir o modal de perfil para visualizar meu histórico de atividades, nível de verificação e estatísticas na plataforma.
- **Critérios de Aceitação:**
  - **Given** que estou autenticado,
  - **When** clico no avatar do perfil no topo,
  - **Then** o modal `UserProfileModal` exibe minhas informações, papel no sistema, histórico recente e insígnia de desenvolvedor.

---

### ➔ US-01.3: Cancelamento e Limpeza de Conta
- **Status:** `Em Andamento` — modal de confirmação (`DeleteAccountModal.tsx`) e remoção local (`deleteUserAccount()`) prontos; anonimização e expurgo remoto pendentes.
- **Tipo:** User Story
- **Descrição:** Como usuário, quero solicitar o cancelamento e anonimização da minha conta, garantindo conformidade com políticas de privacidade e LGPD.
- **Critérios de Aceitação:**
  - **Given** que abro o perfil de usuário,
  - **When** solicito a exclusão da conta e confirmo o aviso de segurança,
  - **Then** meus dados locais/remotos são anonimizados e a sessão é encerrada.

---

## 🟢 EPIC 02 — Intent (Gestão de Intenções)
**Resumo:** Criação, edição, ativação e controle de ciclo de vida das Intents.  
**Status do Epic:** `Concluído`  
**Componente Técnico:** `src/components/IntentManager.tsx`  
**Estados Suportados (`Intent.status`):** `draft` | `active` | `completed` | `cancelled`  
**Sub-estados de revelação (derivados das condições, não persistidos como status):** `is_locked` ➔ `CONDITION_SATISFIED` ➔ `REVEAL_STARTED` ➔ `REVEAL_EXPIRED`

---

### ➔ US-02.1: Criar Nova Intent
- **Status:** `Concluído`
- **Tipo:** User Story
- **Descrição:** Como Creator, quero criar uma nova Intent definindo título, objetivo, categoria e estado inicial para registrar uma intenção na rede.
- **Critérios de Aceitação:**
  - **Given** que clico em "Nova Intenção",
  - **When** preencho o título, descrição e meta,
  - **Then** uma nova Intent é registrada com ID único no estado `draft` ou `active` e exibida no painel.

---

### ➔ US-02.2: Transição de Estados da Intent
- **Status:** `Code Review`
- **Tipo:** User Story
- **Descrição:** Como Creator ou Sistema, quero que a Intent transite de forma transparente de `active` para `completed`, com a revelação derivada das condições (`is_locked` ➔ condição satisfeita ➔ janela de revelação ➔ expiração).
- **Critérios de Aceitação:**
  - **Given** uma Intent ativa,
  - **When** participantes se engajam e condições são cumpridas,
  - **Then** o estado da Intent é atualizado automaticamente na interface e persiste no armazenamento local/Firestore.

---

## 🟢 EPIC 03 — Participation (Participação & Guardiões)
**Resumo:** Envolvimento de participantes, aprovação de guardiões e quórum de liberação.  
**Status do Epic:** `Concluído`  
**Componente Técnico:** `src/components/ParticipantManager.tsx`, `src/components/ApprovalWorkflow.tsx`

---

### ➔ US-03.1: Solicitar e Aprovar Participação
- **Status:** `Concluído`
- **Tipo:** User Story
- **Descrição:** Como participante, quero ingressar em uma Intent para apoiar o objetivo; e como Creator/Guardião, quero aprovar ou rejeitar novos participantes.
- **Critérios de Aceitação:**
  - **Given** uma solicitação de entrada em uma Intent que requer aprovação,
  - **When** o Creator clica em "Aprovar Participante",
  - **Then** o `Participant.status` muda de `pending` para `approved` (com `approved_at`) e o log `GUARDIAN_APPROVED` é registrado.

---

### ➔ US-03.2: Gestão de Guardiões e Quórum Multi-Assinatura
- **Status:** `Concluído`
- **Tipo:** User Story
- **Descrição:** Como Creator, quero atribuir o papel de Guardião a usuários específicos para que o quórum mínimo de aprovações seja exigido para a liberação.
- **Critérios de Aceitação:**
  - **Given** uma Intent com quórum configurado (ex: 2 de 3 guardiões),
  - **When** cada guardião registra seu voto,
  - **Then** o contador do quórum é incrementado em tempo real até atingir a meta.

---

## 🟢 EPIC 04 — Content (Cofre & Proteção de Conteúdo)
**Resumo:** Armazenamento seguro, criptografia de conteúdo e bloqueio preventivo antes da revelação.  
**Status do Epic:** `Concluído`  
**Componente Técnico:** `src/components/ProtectedVaultPipeline.tsx`

---

### ➔ US-04.1: Bloqueio de Conteúdo no Cofre Criptografado
- **Status:** `Concluído`
- **Tipo:** User Story
- **Descrição:** Como Creator, quero anexar texto, mensagem ou documentos ao cofre da Intent garantindo que o conteúdo permaneça bloqueado (`LOCKED`) até a condição de release.
- **Critérios de Aceitação:**
  - **Given** um conteúdo sensível adicionado a uma Intent,
  - **When** a condição ainda não foi cumprida,
  - **Then** a interface exibe a impressão digital SHA-256, o `commitment` e o selo "Conteúdo Bloqueado" (`key_status: 'SEALED'`), impedindo visualização precoce — a chave AES nunca é exibida.

---

### ➔ US-04.2: Liberação do Cofre (`CONTENT_RELEASED`)
- **Status:** `Concluído`
- **Tipo:** User Story
- **Descrição:** Como Recipient, quero acessar o conteúdo descriptografado assim que o cofre atingir `key_status: 'REVEALED'`.
- **Critérios de Aceitação:**
  - **Given** que o Release Engine confirma a satisfação das regras,
  - **When** o destinatário acessa a aba do Cofre,
  - **Then** o conteúdo é revelado com indicação visual de liberação e timestamp de auditoria.

---

## 🟢 EPIC 05 — Rules & Conditions (Motor de Regras)
**Resumo:** Definição de regras baseadas em datas, metas numéricas e acontecimentos.  
**Status do Epic:** `Concluído`  
**Componente Técnico:** `src/utils/conditionEvaluator.ts`, `src/utils/timeCondition.ts`  
**Tipos de Condição (`ConditionType`):** `NONE` | `TIME` | `PEOPLE` | `APPROVAL` | `PUBLIC_SUPPORT` | `HYBRID`

---

### ➔ US-05.1: Condição por Data / Timer
- **Status:** `Concluído`
- **Tipo:** User Story
- **Descrição:** Como Creator, quero definir uma data e hora específicas para que o conteúdo seja liberado automaticamente ao atingir o prazo.
- **Critérios de Aceitação:**
  - **Given** uma regra configurada para a data X,
  - **When** o relógio do sistema atinge ou ultrapassa a data X,
  - **Then** `evaluateIntentConditions()` retorna condição satisfeita e registra `CONDITION_SATISFIED`.

---

### ➔ US-05.2: Condição por Meta de Apoio ou Quórum
- **Status:** `Concluído`
- **Tipo:** User Story
- **Descrição:** Como Creator, quero definir uma meta numérica (ex: 100 apoiadores ou 3 assinaturas de guardiões) para validar a regra de revelação.
- **Critérios de Aceitação:**
  - **Given** a meta `Target = N`,
  - **When** o valor atual atinge `Current >= Target`,
  - **Then** a regra retorna condição satisfeita e gera os eventos `SUPPORT_RECEIVED` / `CONDITION_SATISFIED`.

---

## 🟢 EPIC 06 — Goals (Motor de Metas)
**Resumo:** Acompanhamento do progresso de metas numéricas e engajamento.  
**Status do Epic:** `Concluído`  
**Componente Técnico:** `src/components/PublicSupportWorkflow.tsx`

---

### ➔ US-06.1: Atualização e Acompanhamento de Progresso
- **Status:** `Concluído`
- **Tipo:** User Story
- **Descrição:** Como Participante, quero visualizar uma barra de progresso em tempo real do objetivo da Intent para saber quanto falta para a liberação.
- **Critérios de Aceitação:**
  - **Given** uma Intent ativa com meta,
  - **When** um novo usuário entra ou faz uma contribuição,
  - **Then** o progresso (ex: 75 / 100) e a porcentagem são recalculados imediatamente na tela.

---

## 🟢 EPIC 07 — Event Engine (Motor de Eventos)
**Resumo:** Registro de fatos imutáveis no sistema e processamento reativo.  
**Status do Epic:** `Concluído`  
**Componente Técnico:** `src/types.ts` (`IntentEventType`, `HistoryLogEntry`), `src/components/SocialHistoryWorkflow.tsx`; persistência via Firestore e `src/utils/storage.ts`  
**Eventos Registrados (`IntentEventType`):** `INTENT_CREATED`, `CONTENT_ATTACHED`, `CONTENT_UPDATED`, `CONDITION_CREATED`, `CONDITION_SATISFIED`, `REVEAL_STARTED`, `CONTENT_REVEALED`, `REVEAL_EXPIRED`, `SUPPORT_RECEIVED`, `GUARDIAN_APPROVED`, `GUARDIAN_DECLINED`, `API_CONTENT_RECEIVED`, `STAGE_ADVANCED`, `WEBHOOK_RECEIVED`

---

### ➔ US-07.1: Registro Imutável de Eventos
- **Status:** `Concluído`
- **Tipo:** User Story
- **Descrição:** Como sistema, quero que todo fato relevante ocorrido na plataforma gere um evento com timestamp, payload e ID de usuário para garantir rastreabilidade.
- **Critérios de Aceitação:**
  - **Given** qualquer ação crítica no sistema,
  - **When** a ação é concluída com sucesso,
  - **Then** um novo registro de evento é persistido e enviado ao feed de atividades do sistema.

---

### ➔ US-07.2: Idempotência de Processamento
- **Status:** `Code Review`
- **Tipo:** User Story
- **Descrição:** Como sistema, quero garantir que eventos repetidos não provoquem múltiplas liberações indevidas de conteúdo.
- **Critérios de Aceitação:**
  - **Given** que `CONDITION_SATISFIED` já foi processado e o conteúdo foi revelado,
  - **When** um novo evento idêntico ocorre,
  - **Then** o sistema detecta que `key_status` já é `REVEALED` e ignora a re-execução.

---

## 🟢 EPIC 08 — Release Engine (Motor de Liberação)
**Resumo:** Liberação automática de conteúdo e validação final de autorização.  
**Status do Epic:** `Concluído`  
**Componente Técnico:** `src/components/ApprovalWorkflow.tsx`, `src/components/ProtectedVaultPipeline.tsx`

---

### ➔ US-08.1: Avaliação e Execução do Release Automático
- **Status:** `Concluído`
- **Tipo:** User Story
- **Descrição:** Como Release Engine, quero checar continuamente se a avaliação das regras retornou `TRUE` para executar a transição de liberação.
- **Critérios de Aceitação:**
  - **Given** uma Intent bloqueada (`is_locked`) com regra avaliada como satisfeita,
  - **When** o motor de liberação roda a validação,
  - **Then** o cofre passa para `key_status: 'REVEALED'`, `revealed_at` é gravado e a janela de revelação (`RevealWindowConfig`) é iniciada quando configurada.

---

---

# Parte B — Endurecimento: tornar a promessa verdadeira (F-1 a F3)

> **Definition of Done do núcleo:** o INTENT não está pronto quando a interface aparentar bloquear o conteúdo. Estará pronto quando um usuário malicioso — usando o cliente, as APIs e as permissões que ele legitimamente possui — não conseguir violar nenhum dos dez invariantes.

**ADR-001 — The Client Is Untrusted** é vinculante para toda a Parte B: nenhuma decisão sobre satisfação de condição, liberação, contagem de participação, aprovação, custódia de chave ou autorização de leitura pode depender do cliente.

### 🎯 Invariantes do produto (`INV`) — a especificação executável

| ID | Invariante | Story responsável |
| :--- | :--- | :--- |
| **INV-001** | O criador não obtém a DEK antes da condição satisfeita | INTENT-1102 |
| **INV-002** | Condição de Intent ativa não pode ser reescrita | INTENT-1002 |
| **INV-003** | Quórum não libera antes do limiar | INTENT-1201 |
| **INV-004** | Uma identidade apoia uma única vez | INTENT-1004 |
| **INV-005** | Janela expirada impede nova entrega de chave | INTENT-1103 |
| **INV-006** | Conteúdo revelado corresponde ao commitment original | INTENT-1104 / INTENT-1302 |
| **INV-007** | Atividade social não altera condição | INTENT-1303 |
| **INV-008** | Evento duplicado não causa segunda revelação | INTENT-1203 |
| **INV-009** | O grafo de Intents não contém ciclos | INTENT-1204 |
| **INV-010** | Não-participante não lê dado protegido | INTENT-1001 |

Cadeia de rastreabilidade obrigatória: `INV-00x → Epic → Story → Critério de aceite → Teste automatizado`.

---

## 🔴 EPIC 09 — Threat Model & Decisões de Arquitetura (Fase F-1)
**Resumo:** Responder "contra quem estamos nos protegendo?" e fechar as decisões abertas antes de escrever código de segurança.  
**Status do Epic:** `A Fazer`  
**Entrega:** documentos de decisão versionados no repositório (`docs/`), não código.

---

### ➔ SPIKE-001: Threat model do Release Engine
- **Status:** `A Fazer` · **Tipo:** Spike · **Caixa de tempo:** 1 dia
- **Pergunta:** o que cada ator (criador, participante, guardião, destinatário, conta comprometida, operador da infra) consegue tentar, e o que o sistema faz a respeito?
- **Definição de Pronto:** matriz ator × ataque × contramedida publicada, **incluindo a lista explícita do que aceitamos não defender** (memória do autor, cópia pós-revelação) e onde isso será dito na UI.

---

### ➔ SPIKE-002: Modelo de envelope encryption e custódia
- **Status:** `A Fazer` · **Tipo:** Spike · **Caixa de tempo:** 1 dia
- **Pergunta:** qual KMS, qual política IAM, como rotacionar chave e qual o caminho futuro para *split-key* entre guardiões?
- **Definição de Pronto:** diagrama de custódia, contrato do endpoint `releaseKey` e estimativa de custo por Intent.

---

### ➔ SPIKE-003: Condições compostas e migração do `HYBRID`
- **Status:** `A Fazer` · **Tipo:** Spike · **Caixa de tempo:** 1 dia
- **Pergunta:** como migrar o enum `ConditionType` para a árvore recursiva (`ALL_OF`/`ANY_OF`) sem quebrar as Intents existentes?
- **Definição de Pronto:** tipo final acordado, script de migração descrito e compatibilidade de leitura definida.

---

### ➔ SPIKE-004: Estratégia de scheduler temporal
- **Status:** `A Fazer` · **Tipo:** Spike · **Caixa de tempo:** 0,5 dia
- **Pergunta:** qual precisão de disparo o produto promete (1 min? 5 min?) e a que custo de leitura no Firestore?
- **Definição de Pronto:** decisão sobre `nextEvaluationAt` indexado, frequência do cron e SLA de revelação declarado ao usuário.

---

### ➔ SPIKE-005: Verificador público de commitment
- **Status:** `A Fazer` · **Tipo:** Spike · **Caixa de tempo:** 0,5 dia
- **Pergunta:** como um terceiro que não participa da Intent verifica que o conteúdo revelado corresponde ao commitment?
- **Definição de Pronto:** especificação de RF-SEC-002 (entrada, saída, onde vive a ferramenta, o que é público).

---

## 🔴 EPIC 10 — Autoridade & Autorização (Fase F0)
**Resumo:** Tirar do cliente o direito de escrever a verdade e liberar a leitura multiusuário por papel.  
**Status do Epic:** `A Fazer` · **Caminho crítico** — sem isso, nada acima é confiável.  
**Componente Técnico:** `firestore.rules`, backend (Cloud Functions/Run), `/intents/{id}/roles/{userId}`, `/intents/{id}/protected/payload`, `/intents/{id}/events/{eventId}`, `/users/{uid}/intent_refs/{intentId}`

---

### ➔ INTENT-1001: Rules por papel ativo (materialização de `roles`)
- **Status:** `A Fazer` · **Tipo:** User Story · **Invariante:** `INV-010`
- **Descrição:** Como guardião/destinatário/apoiador, quero enxergar a Intent em que participo, porque hoje as rules liberam `intents/{id}` apenas para `creator_id` e as Etapas 4, 5, 7 e 8 só funcionam no `localStorage`.
- **Critérios de Aceitação:**
  - **Given** uma Intent com participantes de vários papéis,
  - **When** um usuário com papel **ativo** (`status == 'approved'` e `revoked_at == null`) em `/intents/{id}/roles/{uid}` abre a Intent,
  - **Then** a leitura é permitida; e é negada para quem não tem papel, para convite **pendente** e para papel **revogado** — existir o documento de papel não basta.
- **Teste:** suíte contra o emulador das rules cobrindo permitido/negado por papel × estado (ativo, pendente, revogado, sem papel).

---

### ➔ INTENT-1002: Escrita da Intent exclusiva do backend
- **Status:** `A Fazer` · **Tipo:** User Story · **Invariante:** `INV-002`
- **Descrição:** Como sistema, quero que `update`/`delete` diretos do cliente sejam negados, de modo que condição, meta e histórico não possam ser reescritos por quem tem o token.
- **Critérios de Aceitação:**
  - **Given** uma Intent `active`,
  - **When** o cliente tenta alterar `conditions`, `target_supports` ou prazo por escrita direta,
  - **Then** a operação é negada pelas rules (`allow update: if false`) e pelo backend, e a Intent ativa não pode ser excluída — apenas cancelada.

---

### ➔ INTENT-1003: Eventos append-only autoritativos com read model
- **Status:** `A Fazer` · **Tipo:** User Story · **Invariante:** base de `INV-008`
- **Descrição:** Como sistema, quero que o log de eventos seja gravado somente pelo servidor, com `seq` monotônico **para ordenação**, e que o documento da Intent seja **projeção** desse log — sem replay a cada leitura de tela. A deduplicação não é responsabilidade do `seq` (ver INTENT-1203).
- **Critérios de Aceitação:**
  - **Given** qualquer transição de domínio,
  - **When** ela ocorre,
  - **Then** o evento é gravado pelo servidor na subcoleção append-only **na mesma transação** que atualiza a projeção, e a escrita do cliente na subcoleção é negada.
- **Observação:** substitui a alegação de "log imutável" da US-07.1, hoje append-only apenas por convenção. Inclui verificação periódica de consistência log × projeção.

---

### ➔ INTENT-1004: Contagem de apoios no servidor (1 identidade = 1 apoio)
- **Status:** `A Fazer` · **Tipo:** User Story · **Invariante:** `INV-004`
- **Descrição:** Como sistema, quero que o contador de apoios seja incrementado apenas por transação no servidor, para que a Etapa 7 não dependa de boa vontade do cliente.
- **Critérios de Aceitação:**
  - **Given** um usuário que já apoiou,
  - **When** ele apoia novamente (inclusive por chamada forjada ou concorrente),
  - **Then** o contador permanece incrementado em 1, com rate limit e registro do apoio por `uid`.

---

### ➔ INTENT-1005: Separar payload protegido do documento da Intent
- **Status:** `A Fazer` · **Tipo:** Task (segurança) · **Invariante:** apoia `INV-010`
- **Descrição:** Como sistema, quero que `cipherText`/`iv` vivam em `/intents/{id}/protected/payload`, e não no documento da Intent, para que abrir o metadado de uma Intent pública não entregue o texto cifrado a qualquer visitante anônimo.
- **Critérios de Aceitação:**
  - **Given** uma Intent com `visibility: 'PUBLIC'`,
  - **When** um usuário sem papel lê a Intent,
  - **Then** recebe apenas metadado (título, status, progresso, `commitment`) e a leitura de `protected/payload` é negada — nem por `isPublic()`.
- **Observação:** ciphertext sem DEK não abre, mas posse ilimitada por anônimos transforma um futuro vazamento de chave em vazamento retroativo de conteúdo.

---

### ➔ INTENT-1006: Índice de listagem por usuário (`intent_refs`)
- **Status:** `A Fazer` · **Tipo:** Feature · **Depende de:** INTENT-1001
- **Descrição:** Como participante, quero abrir o painel e ver todas as Intents em que tenho papel. Regra de rules não filtra `list`: o Firestore só autoriza a query se a própria query garantir que todo resultado é permitido, e `hasActiveRole` depende de um `get` por documento — serve para abrir uma Intent, não para listar.
- **Critérios de Aceitação:**
  - **Given** um usuário com papéis em várias Intents,
  - **When** o painel carrega,
  - **Then** ele consulta `/users/{uid}/intent_refs` (leitura restrita ao dono) e obtém a lista completa; o feed público usa query separada por `visibility == 'PUBLIC'`, retornando só metadado.
  - **And** conceder ou revogar papel atualiza `roles` e `intent_refs` **na mesma transação**, com verificação periódica de consistência entre os dois.

---

## 🔴 EPIC 11 — Cofre Real & KMS (Fase F1)
**Resumo:** A promessa central do produto: a chave que abre o conteúdo deixa de existir no cliente antes da revelação.  
**Status do Epic:** `A Fazer` · **Caminho crítico**  
**Componente Técnico:** `src/utils/cryptoVault.ts`, KMS, coleção `/vault/{intentId}` (sem leitura por cliente), endpoint `releaseKey`

---

### ➔ INTENT-1101: Remover a chave padrão do cofre (`DEFAULT_VAULT_KEY`)
- **Status:** `A Fazer` · **Tipo:** Bug (segurança, severidade alta)
- **Descrição:** Hoje o conteúdo é cifrado no cliente com passphrase padrão presente no código: quem lê o repositório abre o cofre. A trava atual é de interface.
- **Critérios de Aceitação:**
  - **Given** o pipeline de cofre,
  - **When** um conteúdo é selado,
  - **Then** a cifragem usa DEK aleatória de 256 bits, o cliente descarta a DEK após o envelopamento e nenhuma chave aparece na UI, em log ou no código.

---

### ➔ INTENT-1102: Envelope encryption com custódia em KMS e `releaseKey`
- **Status:** `A Fazer` · **Tipo:** Feature · **Invariante:** `INV-001`
- **Descrição:** Como sistema, quero guardar `wrappedDEK` no servidor via KMS e entregar a DEK somente por endpoint autoritativo, após validar papel, condição e janela.
- **Critérios de Aceitação:**
  - **Given** uma Intent selada cuja condição ainda não foi satisfeita,
  - **When** o **próprio criador** chama `releaseKey(intentId)`,
  - **Then** a resposta é 403, nenhuma chave é devolvida e a tentativa vira evento auditado.

---

### ➔ INTENT-1103: Janela de revelação com efeito real
- **Status:** `A Fazer` · **Tipo:** User Story · **Invariante:** `INV-005`
- **Descrição:** Como sistema, quero que a expiração da `RevealWindowConfig` impeça **novas entregas** da DEK pelo backend.
- **Critérios de Aceitação:**
  - **Given** uma janela expirada,
  - **When** um destinatário que não acessou solicita a chave,
  - **Then** recebe negação — e a UI declara explicitamente que a janela restringe novos acessos e **não apaga cópias já baixadas**.

---

### ➔ INTENT-1104: Commitment obrigatório e imutável (RF-SEC-001)
- **Status:** `A Fazer` · **Tipo:** User Story · **Invariante:** `INV-006`
- **Descrição:** Como qualquer pessoa, quero que `content_hash` e `commitment = SHA-256(content_hash || salt)` sejam gravados na criação e nunca mais alterados.
- **Critérios de Aceitação:**
  - **Given** uma Intent criada com conteúdo condicionado,
  - **When** se tenta alterar `content_hash`/`commitment` após a criação,
  - **Then** a escrita é rejeitada, e o `commitment` é legível publicamente desde antes da revelação.

---

## 🔴 EPIC 12 — Motor Autoritativo de Regras e Liberação (Fase F2)
**Resumo:** Tirar do navegador a decisão de revelar.  
**Status do Epic:** `A Fazer` · **Caminho crítico**  
**Componente Técnico:** avaliador puro compartilhado, scheduler, `src/utils/conditionEvaluator.ts` (migração)

---

### ➔ INTENT-1201: Avaliador recursivo de condições no backend
- **Status:** `A Fazer` · **Tipo:** Feature · **Invariante:** `INV-003`
- **Descrição:** Como sistema, quero um avaliador puro `evaluate(condition, context)` executado no servidor, cobrindo `TIME`, `APPROVAL`, `PUBLIC_SUPPORT`, `EXTERNAL`, `INTENT`, `ALL_OF`, `ANY_OF` — o cliente pode reusar o mesmo código apenas para *preview*.
- **Critérios de Aceitação:**
  - **Given** quórum de 2 de 3,
  - **When** há 1 aprovação → não libera; 2 aprovações → libera; a 3ª → não gera segunda liberação,
  - **Then** a decisão vem do servidor, é idêntica em qualquer cliente e imune a manipulação via DevTools.
- **Observação:** `reason` legível ("faltam 27 apoios e 1 aprovação") é parte do contrato.

---

### ➔ INTENT-1202: Scheduler temporal (`nextEvaluationAt`)
- **Status:** `A Fazer` · **Tipo:** Feature
- **Descrição:** Como sistema, quero revelar Intents por tempo mesmo sem ninguém com o app aberto, varrendo apenas o índice `nextEvaluationAt <= now`.
- **Critérios de Aceitação:**
  - **Given** uma Intent com condição `TIME` vencida e nenhum cliente conectado,
  - **When** o scheduler roda,
  - **Then** `CONDITION_SATISFIED` é gravado dentro do SLA definido no SPIKE-004, sem varredura da coleção inteira.

---

### ➔ INTENT-1203: Idempotência transacional da liberação
- **Status:** `A Fazer` · **Tipo:** User Story · **Invariante:** `INV-008`
- **Descrição:** Reescreve a US-07.2 em bases confiáveis: a garantia deixa de ser "o cliente confere se `key_status` já é `REVEALED`" e passa a ser **chave de idempotência estável na origem** + transação. A chave é derivada do fato que causou o evento — `SUPPORT:{intentId}:{uid}`, `APPROVAL:{intentId}:{uid}`, `TIME:{intentId}:{scheduled_for}`, `EXTERNAL:{source_id}:{delivery_id}`, `REVEAL:{intentId}` — e **nunca** de `seq`, que muda a cada reentrega e portanto não dedupica nada.
- **Critérios de Aceitação:**
  - **Given** o mesmo fato reentregue (retry de broker, duplo clique, replay de webhook),
  - **When** o motor processa,
  - **Then** o `create` de `/intents/{id}/dedupe/{dedupe_key}` falha dentro da transação, nada é aplicado duas vezes e o chamador recebe sucesso (o efeito já está aplicado).
  - **And given** dois apoios **distintos** e simultâneos que cruzam a meta (concorrência legítima, não duplicata),
  - **Then** ambos são contados, mas exatamente uma revelação ocorre e exatamente uma janela é aberta, sob `REVEAL:{intentId}`.

---

### ➔ INTENT-1204: Composição de Intents com detecção de ciclo
- **Status:** `A Fazer` · **Tipo:** Feature · **Invariante:** `INV-009`
- **Descrição:** Como Creator, quero condicionar minha Intent ao estado de outra (`kind: 'INTENT'`), sem criar dependência circular.
- **Critérios de Aceitação:**
  - **Given** o vínculo A→B já existente,
  - **When** alguém tenta criar B→A (direto ou indireto),
  - **Then** a criação é recusada por detecção de ciclo (DFS) com mensagem clara.

---

## 🔴 EPIC 13 — Confiança: Suíte de Invariantes (Fase F3)
**Resumo:** Provar por teste automatizado tudo o que o produto afirma. Sem isso, as afirmações são marketing.  
**Status do Epic:** `A Fazer`  
**Componente Técnico:** suíte de testes (inexistente hoje; `npm run lint` executa apenas `tsc --noEmit`), emulador do Firestore

---

### ➔ INTENT-1301: Suíte dos dez invariantes em CI
- **Status:** `A Fazer` · **Tipo:** Feature · **Invariantes:** `INV-001` a `INV-010`
- **Descrição:** Como time, quero que `INV-001..010` rodem a cada push, para poder mexer no núcleo sem medo.
- **Critérios de Aceitação:**
  - **Given** o pipeline de CI,
  - **When** um push é feito,
  - **Then** os dez invariantes são executados e qualquer falha bloqueia o merge.

---

### ➔ INTENT-1302: Verificador público de commitment (RF-SEC-002)
- **Status:** `A Fazer` · **Tipo:** Feature · **Invariante:** `INV-006`
- **Descrição:** Como terceiro sem vínculo com a Intent, quero conferir que o conteúdo revelado é exatamente o que foi selado.
- **Critérios de Aceitação:**
  - **Given** um conteúdo revelado e o `commitment` publicado na criação,
  - **When** executo a verificação,
  - **Then** `SHA-256(plaintext) == content_hash` **e** `SHA-256(content_hash || salt) == commitment`, com resultado legível para leigos.

---

### ➔ INTENT-1303: Teste de arquitetura — social não toca em condição
- **Status:** `A Fazer` · **Tipo:** Task · **Invariante:** `INV-007`
- **Descrição:** Como time, quero que o build falhe se o avaliador importar qualquer coisa da camada social — é a única garantia de que debate nunca vira governança acidental.
- **Critérios de Aceitação:**
  - **Given** o avaliador de condições,
  - **When** alguém importa `SocialPost` ou qualquer módulo social nele,
  - **Then** o teste de arquitetura falha; e 500 interações sociais não alteram um único campo de `conditions`.

---

## 🚫 Stop List (congelado até F3 concluir)

Não entram no backlog agora, por decisão explícita: ranking · pontuação · gamificação · algoritmo sofisticado de feed · marketplace · novos tipos de condição além dos cinco definidos · novos tipos de conteúdo · blockchain · microserviços · IA · automações genéricas · **Etapa 9 (impacto e reputação)**.

Critério de descongelamento: `Can we seal? · Can we wait? · Can we verify? · Can we release? · Can we authorize? · Can we prove?` — todas respondidas com sim **e com teste verde**.

---

## 📋 Resumo para Copiar e Colar no Jira

### Parte A — Protótipo (Epics 01 a 08)

| Código | Título da História / Tarefa | Status Sugerido | Epic Correspondente |
| :--- | :--- | :--- | :--- |
| **INTENT-101** | Autenticação e Seleção de Perfil (Login/Session) | `Concluído` | Epic 01 — Identity & Account |
| **INTENT-102** | Visualização e Edição de Perfil de Usuário | `Concluído` | Epic 01 — Identity & Account |
| **INTENT-103** | Cancelamento e Limpeza de Conta | `Em Andamento` | Epic 01 — Identity & Account |
| **INTENT-201** | Criar Nova Intent | `Concluído` | Epic 02 — Intent |
| **INTENT-202** | Transição de Estados da Intent | `Code Review` | Epic 02 — Intent |
| **INTENT-301** | Solicitar e Aprovar Participação | `Concluído` | Epic 03 — Participation |
| **INTENT-302** | Gestão de Guardiões e Quórum Multi-Assinatura | `Concluído` | Epic 03 — Participation |
| **INTENT-401** | Bloqueio de Conteúdo no Cofre Criptografado | `Concluído` | Epic 04 — Content |
| **INTENT-402** | Liberação do Cofre (`CONTENT_RELEASED`) | `Concluído` | Epic 04 — Content |
| **INTENT-501** | Condição por Data / Timer | `Concluído` | Epic 05 — Rules & Conditions |
| **INTENT-502** | Condição por Meta de Apoio ou Quórum | `Concluído` | Epic 05 — Rules & Conditions |
| **INTENT-601** | Atualização e Acompanhamento de Progresso | `Concluído` | Epic 06 — Goals |
| **INTENT-701** | Registro Imutável de Eventos | `Concluído` | Epic 07 — Event Engine |
| **INTENT-702** | Idempotência de Processamento de Eventos | `Code Review` | Epic 07 — Event Engine |
| **INTENT-801** | Avaliação e Execução do Release Automático | `Concluído` | Epic 08 — Release Engine |

### Parte B — Endurecimento (Epics 09 a 13)

| Código | Título | Tipo | Status | Epic | Fase | Invariante |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **SPIKE-001** | Threat model do Release Engine | Spike | `A Fazer` | Epic 09 | F-1 | — |
| **SPIKE-002** | Modelo de envelope encryption e custódia | Spike | `A Fazer` | Epic 09 | F-1 | — |
| **SPIKE-003** | Condições compostas e migração do `HYBRID` | Spike | `A Fazer` | Epic 09 | F-1 | — |
| **SPIKE-004** | Estratégia de scheduler temporal | Spike | `A Fazer` | Epic 09 | F-1 | — |
| **SPIKE-005** | Verificador público de commitment | Spike | `A Fazer` | Epic 09 | F-1 | — |
| **INTENT-1001** | Rules por papel ativo (materialização de `roles`) | Story | `A Fazer` | Epic 10 | F0 | INV-010 |
| **INTENT-1002** | Escrita da Intent exclusiva do backend | Story | `A Fazer` | Epic 10 | F0 | INV-002 |
| **INTENT-1003** | Eventos append-only autoritativos com read model | Story | `A Fazer` | Epic 10 | F0 | base INV-008 |
| **INTENT-1004** | Contagem de apoios no servidor | Story | `A Fazer` | Epic 10 | F0 | INV-004 |
| **INTENT-1005** | Separar payload protegido do documento da Intent | Task | `A Fazer` | Epic 10 | F0 | apoia INV-010 |
| **INTENT-1006** | Índice de listagem por usuário (`intent_refs`) | Feature | `A Fazer` | Epic 10 | F0 | — |
| **INTENT-1101** | Remover `DEFAULT_VAULT_KEY` | Bug | `A Fazer` | Epic 11 | F1 | — |
| **INTENT-1102** | Envelope encryption + KMS + `releaseKey` | Feature | `A Fazer` | Epic 11 | F1 | INV-001 |
| **INTENT-1103** | Janela de revelação com efeito real | Story | `A Fazer` | Epic 11 | F1 | INV-005 |
| **INTENT-1104** | Commitment obrigatório e imutável | Story | `A Fazer` | Epic 11 | F1 | INV-006 |
| **INTENT-1201** | Avaliador recursivo no backend | Feature | `A Fazer` | Epic 12 | F2 | INV-003 |
| **INTENT-1202** | Scheduler temporal (`nextEvaluationAt`) | Feature | `A Fazer` | Epic 12 | F2 | — |
| **INTENT-1203** | Idempotência transacional da liberação | Story | `A Fazer` | Epic 12 | F2 | INV-008 |
| **INTENT-1204** | Composição de Intents com detecção de ciclo | Feature | `A Fazer` | Epic 12 | F2 | INV-009 |
| **INTENT-1301** | Suíte dos dez invariantes em CI | Feature | `A Fazer` | Epic 13 | F3 | INV-001..010 |
| **INTENT-1302** | Verificador público de commitment | Feature | `A Fazer` | Epic 13 | F3 | INV-006 |
| **INTENT-1303** | Teste de arquitetura: social ≠ condição | Task | `A Fazer` | Epic 13 | F3 | INV-007 |

**Ordem de execução:** Epic 09 → 10 → 11 → 12 → 13. Nada da Parte B é paralelizado para trás: sem F0, o cofre de F1 protege um dado que qualquer um pode reescrever.
