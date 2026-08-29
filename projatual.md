# INTENT OS — Documentação do Estado Atual do Sistema

> **Visão Geral do Repositório**: Documentação completa das funcionalidades, componentes, contratos de dados, arquitetura e modelo conceitual da plataforma **INTENT OS** implementados até o momento.

---

## 📌 1. Visão Geral & Manifesto do Produto

O **INTENT OS** é a implementação de referência de uma **Intent Network** (Rede Orientada a Intenções). Ao contrário das redes sociais tradicionais — onde o conteúdo é postado e imediatamente consumido —, o INTENT introduz uma camada determinística e causal entre a criação de um conteúdo e a sua revelação.

### 🔄 O Fluxo Fundamental Causal
$$\text{INTENÇÃO} \longrightarrow \text{CONDIÇÃO} \longrightarrow \text{PARTICIPAÇÃO} \longrightarrow \text{ACONTECIMENTO} \longrightarrow \text{REVELAÇÃO} \longrightarrow \text{ACESSO AUTORIZADO}$$

### 💡 Princípios Arquiteturais Essenciais
1. **Intenção antes do Conteúdo**: Conteúdo é consequência de um objetivo definido, não um simples upload imediato.
2. **Criptografia & Bloqueio Preventivo**: O conteúdo existe antes de estar acessível. Ele fica armazenado no cofre selado com criptografia **AES-256-GCM** e prova imutável (**SHA-256 Commitment**).
3. **Condição ≠ Autorização**: Uma condição satisfeita (ex: meta atingida ou data ultrapassada) **não concede acesso universal**. O acesso é restrito exclusivamente aos **Destinatários (`Recipients`)** autorizados pelo Criador.
4. **Independência de Domínio**: O contrato central da `Intent` em `src/types.ts` é genérico e agnóstico de domínio (servindo para campanhas, testamentos digitais, quóruns corporativos, revelações de editais, metas sociais, etc.).

---

## 🛠️ 2. Arquitetura Técnica & Stack Tecnológico

* **Frontend**: React 19 + Vite 6 + TypeScript (Modo SPA responsivo e desktop-first).
* **Estilização**: Tailwind CSS v4 (plugin `@tailwindcss/vite`) com esquema neutro de alto contraste e legibilidade.
* **Animações & UI**: `motion` (Framer Motion) e `lucide-react` para ícones.
* **Persistência de Dados**:
  * **Firebase Firestore & Auth Sync**: Sincronização remota e autenticação de usuários.
  * **Local Storage Layer (`src/utils/storage.ts`)**: Fallback e persistência imediata no navegador (contas de usuário, sessão ativa e Intents locais).
* **Segurança & Criptografia Client-side** (`src/utils/cryptoVault.ts`, Web Crypto API):
  * Criptografia AES-256-GCM para carga selada (`ProtectedPayload`), com chave derivada via PBKDF2 (SHA-256, 100.000 iterações).
  * Checksum SHA-256 e Commitment imutável pré-revelação: `SHA-256(Payload || Salt || Secret)`.

---

## 🧩 3. Mapeamento de Componentes e Funcionalidades

Abaixo está o detalhamento de todos os módulos que compõem o sistema hoje em `/src/components`:

| Componente | Função Principal & Recursos Implementados |
| :--- | :--- |
| **`AuthGate.tsx`** | Portal de Autenticação com suporte a login/cadastro real no Firebase Auth e simulação rápida para ambiente de teste. |
| **`TesterProfileSwitcherBar.tsx`** | Barra de navegação rápida de personas em modo de teste (`Creator`, `Participant`, `Guardian`, `Recipient`). Permite alternar de perfil em tempo real para validar regras de acesso. |
| **`UserProfileModal.tsx`** | Modal de gestão da conta do usuário com estatísticas de participação, configurações de privacidade e os campos de reputação previstos em `UserAccount.relacionamentos.reputacao` (pontuação ainda não calculada — ver Etapa 9). |
| **`DeleteAccountModal.tsx`** | Modal de confirmação para cancelamento da inscrição. A exclusão executa `deleteUserAccount()`, removendo o usuário do Local Storage; **anonimização formal e expurgo remoto ainda não implementados**. |
| **`IntentManager.tsx`** | Painel principal do ciclo de vida das Intents (criação, edição e listener em tempo real no Firestore com fallback local). Estados persistidos em `Intent.status`: `draft`, `active`, `completed`, `cancelled`; o progresso da revelação é derivado das condições (`is_locked`, `reveal_window`, `revealed_at`). |
| **`ParticipantManager.tsx`** | Gestor de participantes e papéis múltiplos (`Approver/Guardian`, `Recipient`, `Participant`, `Viewer`), incluindo aprovação ou rejeição de solicitações. |
| **`ApprovalWorkflow.tsx`** | Motor de quórum e multi-assinatura para Guardiões. Calcula o consenso exigido (`UNANIMOUS`, `MAJORITY`, `SUPERMAJORITY`, `EXACT_N`, `PERCENTAGE`). |
| **`ProtectedVaultPipeline.tsx`** | Pipeline do cofre criptografado. Exibe o estado selado (`LOCKED`), a impressão digital SHA-256, o Commitment de prova e executa a revelação quando as regras são cumpridas. |
| **`PublicSupportWorkflow.tsx`** | Motor de engajamento público com metas numéricas (ex: 100 apoiadores), contador de progresso visual e **Janela de Revelação Efêmera** (ex: acesso liberado por 24 horas pós-disparo). |
| **`SocialHistoryWorkflow.tsx`** | Camada social desacoplada da Intent. Permite postar opiniões, concordar/discordar, publicar comentários, criar previsões formais de desfecho e rastrear **causalidade/indicação** (referral). |
| **`StagesChecklistModal.tsx`** | Modal de visualização de revelações em etapas/fases sequenciais (ex: Estágio 1 -> Estágio 2 -> Estágio Final). |
| **`IntentStructureModal.tsx`** | Inspetor estrutural interativo que exibe a árvore de dados JSON modular da Intent ativa. |
| **`DevInspectorBadge.tsx`** | Badge de desenvolvimento para inspeção rápida de logs, contadores de estado e integridade de dados. |
| **`AccountStatusCard.tsx`** & **`BottomCardsRow.tsx`** | Cards informativos com status da conta ativa, métricas resumidas e links para verificação. |
| **`Sidebar.tsx`** | Menu lateral responsivo com atalhos de navegação para a plataforma. |
| **`DynamicGreetingCard.tsx`** | Card de saudação contextual por período do dia (`GreetingConfig`: manhã, tarde, noite). |

---

## 🗄️ 4. Modelagem de Dados (`src/types.ts`)

A estrutura central do sistema é composta por contratos estritamente tipados:

### `Intent` (A Intenção)
```typescript
export interface Intent {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  visibility: 'private' | 'public';
  creator?: IntentCreator;
  content?: IntentContent;
  conditions?: IntentConditions;
  audience?: IntentAudience;
  people?: IntentPeople; // Approvers, Recipients, Participants
  protected_payload?: ProtectedPayload;
  history_logs?: HistoryLogEntry[];
  social_interactions?: SocialInteraction[];
  reveal_window?: RevealWindowConfig; // Revelação temporária com expiração
}
```

### `ProtectedPayload` (O Cofre Selado)
```typescript
export interface ProtectedPayload {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  cipherText: string;
  cipherAlg: 'AES-256-GCM';
  salt: string;
  iv: string;
  fingerprint: string; // SHA-256 Checksum prefixado (exibição)
  content_hash: string; // SHA-256 integral do payload original
  commitment: string; // SHA-256 (Payload || Salt || Secret) -> Prova imutável pré-revelação
  key_status?: 'SEALED' | 'AUTHORIZED' | 'REVEALED';
  encryptedAt: string;
  isEncrypted: boolean;
  integrity_verified?: boolean; // Verificação pós-abertura
}
```

### `IntentConditions` (Motor de Regras)
Suporta múltiplos tipos de condição:
* **`TIME`**: Data/hora específica no futuro ou janela temporal.
* **`PEOPLE` / `APPROVAL`**: Quórum de Guardiões/Aprovadores (`M` de `N` assinaturas).
* **`PUBLIC_SUPPORT`**: Meta de apoios coletivos (ex: 100 assinaturas/apoiadores).
* **`HYBRID`**: Combinação de data + aprovação ou meta + quórum.

---

## 🔒 5. Modelo de Segurança & Auditoria

1. **Criptografia e Prova Pré-Revelação**:
   Antes de o segredo ser revelado, o sistema gera e publica o **Commitment SHA-256**. Qualquer pessoa pode verificar que o conteúdo revelado no futuro é idêntico ao que foi registrado no momento da criação, sem que o conteúdo pudesse ser lido antecipadamente.
2. **Log de Auditoria (`HistoryLogEntry`)**:
   As ações críticas (`CREATED`, `ENCRYPTED`, `GUARDIAN_APPROVED`, `SUPPORTED`, `REVEALED`, `PREDICTION_MADE`, `PREDICTION_RESOLVED`, além dos `IntentEventType` como `CONDITION_SATISFIED`, `REVEAL_STARTED`, `CONTENT_REVEALED` e `REVEAL_EXPIRED`) geram uma entrada com timestamp e nome do ator. O log é append-only por convenção da aplicação — a imutabilidade ainda não é garantida por regras do Firestore.
3. **Atribuição de Causalidade (`CausalityAttribution`)**:
   O sistema rastreia quem convidou quem (`source_user_id`), permitindo calcular o impacto causal de um usuário no engajamento e nas metas de uma Intent.

---

## 💡 6. Potencialidades e Próximos Passos (Ideas & Roadmap)

O **INTENT OS** possui uma arquitetura pronta para ser expandida em diversas direções:

1. **Gatilhos Externos e Webhooks**:
   - Conectar com APIs externas (ex: oráculos financeiros, resultados de editais publicamente auditáveis, sensores IoT, confirmações de entrega).
2. **KMS & Custódia Descentralizada de Chaves**:
   - Integração com serviços de Key Management (AWS KMS, Google Cloud KMS ou contratos inteligentes em blockchain) para custódia da chave AES sem dependência de servidor centralizado.
3. **Notificações Push / Email em Tempo Real**:
   - Disparo de e-mails ou notificações push via Firebase Cloud Messaging quando o quórum for atingido ou uma revelação for liberada.
4. **Rede de Reputação e Previsões (Prediction Network)**:
   - Rankear usuários e guardiões pela assertividade de suas previsões públicas sobre o desfecho das Intents, criando uma camada de reputação descentralizada.
