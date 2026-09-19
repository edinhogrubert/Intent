# Estrutura do Backlog do Jira — INTENT OS (Epics 01 ao 08)

Este documento foi gerado para auxiliar na criação e atualização das demandas no **Jira**, mapeando a especificação do Confluence para os componentes já implementados no protótipo funcional **INTENT OS**.

---

## 📊 Mapeamento de Status no Jira
- **Concluído (Done):** Funcionalidade validada no MVP e testada no aplicativo.
- **Code Review:** Código implementado pela IA / Desenvolvedor, aguardando validação visual ou de regra de negócio do Product Owner.
- **Em Análise:** Item em refinamento funcional / validação com Product Owner.
- **Em Andamento (In Progress):** Item atualmente sendo trabalhado.
- **A Fazer (To Do):** Item planejado para Sprints futuras ou refinamento de casos extremos.

---

## 🟢 EPIC 01 — Identity & Account
**Resumo:** Gestão de identidade, autenticação, controle de sessão e seleção de personas ativas.  
**Status do Epic:** `Concluído`  
**Componente Técnico:** `src/components/TesterProfileSwitcherBar.tsx`, `src/components/UserProfileModal.tsx`

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
- **Status:** `A Fazer` (Futuro)
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
**Estados Suportados:** `DRAFT` | `ACTIVE` | `WAITING` | `TRIGGERED` | `RELEASED`

---

### ➔ US-02.1: Criar Nova Intent
- **Status:** `Concluído`
- **Tipo:** User Story
- **Descrição:** Como Creator, quero criar uma nova Intent definindo título, objetivo, categoria e estado inicial para registrar uma intenção na rede.
- **Critérios de Aceitação:**
  - **Given** que clico em "Nova Intenção",
  - **When** preencho o título, descrição e meta,
  - **Then** uma nova Intent é registrada com ID único no estado `DRAFT` ou `ACTIVE` e exibida no painel.

---

### ➔ US-02.2: Transição de Estados da Intent
- **Status:** `Code Review`
- **Tipo:** User Story
- **Descrição:** Como Creator ou Sistema, quero que a Intent transite de forma transparente entre os estados `ACTIVE` -> `WAITING` -> `TRIGGERED` -> `RELEASED`.
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
  - **Then** o usuário muda de `REQUESTED` para `APPROVED` e o evento `USER_APPROVED` é registrado.

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
  - **Then** a interface exibe a chave de criptografia AES-256 e o selo "Conteúdo Bloqueado", impedindo visualização precoce.

---

### ➔ US-04.2: Liberação do Cofre (`CONTENT_RELEASED`)
- **Status:** `Concluído`
- **Tipo:** User Story
- **Descrição:** Como Recipient, quero acessar o conteúdo descriptografado assim que a Intent atingir o estado `RELEASED`.
- **Critérios de Aceitação:**
  - **Given** que o Release Engine confirma a satisfação das regras,
  - **When** o destinatário acessa a aba do Cofre,
  - **Then** o conteúdo é revelado com indicação visual de liberação e timestamp de auditoria.

---

## 🟢 EPIC 05 — Rules & Conditions (Motor de Regras)
**Resumo:** Definição de regras baseadas em datas, metas numéricas e acontecimentos.  
**Status do Epic:** `Concluído`  
**Componente Técnico:** `src/utils/conditionEvaluator.ts`

---

### ➔ US-05.1: Condição por Data / Timer
- **Status:** `Concluído`
- **Tipo:** User Story
- **Descrição:** Como Creator, quero definir uma data e hora específicas para que o conteúdo seja liberado automaticamente ao atingir o prazo.
- **Critérios de Aceitação:**
  - **Given** uma regra configurada para a data X,
  - **When** o relógio do sistema atinge ou ultrapassa a data X,
  - **Then** a avaliação da regra retorna `TRUE` e dispara o evento `DEADLINE_REACHED`.

---

### ➔ US-05.2: Condição por Meta de Apoio ou Quórum
- **Status:** `Concluído`
- **Tipo:** User Story
- **Descrição:** Como Creator, quero definir uma meta numérica (ex: 100 apoiadores ou 3 assinaturas de guardiões) para validar a regra de revelação.
- **Critérios de Aceitação:**
  - **Given** a meta `Target = N`,
  - **When** o valor atual atinge `Current >= Target`,
  - **Then** a regra retorna `TRUE` e gera o evento `GOAL_REACHED`.

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
**Componente Técnico:** `src/utils/storage.ts`  
**Eventos Registrados:** `USER_REGISTERED`, `USER_JOINED`, `USER_APPROVED`, `GOAL_REACHED`, `DEADLINE_REACHED`, `CONTENT_RELEASED`, `CONTENT_ACCESSED`

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
  - **Given** que o evento `GOAL_REACHED` já foi processado e o conteúdo foi liberado,
  - **When** um novo evento idêntico ocorre,
  - **Then** o sistema detecta que o estado atual já é `RELEASED` e ignora a re-execução.

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
  - **Given** uma Intent em estado de espera com regra avaliada como `TRUE`,
  - **When** o motor de liberação roda a validação,
  - **Then** o status muda para `RELEASED`, a chave do cofre é liberada e a notificação é gerada.

---

## 📋 Resumo para Copiar e Colar no Jira

| Código | Título da Histórico / Tarefa | Status Sugerido | Epic Correspondente |
| :--- | :--- | :--- | :--- |
| **INTENT-101** | Autenticação e Seleção de Perfil (Login/Session) | `Concluído` | Epic 01 — Identity & Account |
| **INTENT-102** | Visualização e Edição de Perfil de Usuário | `Concluído` | Epic 01 — Identity & Account |
| **INTENT-103** | Cancelamento e Limpeza de Conta | `A Fazer` | Epic 01 — Identity & Account |
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
