# INTENT OS — ENGENHARIA DE ARQUITETURA, ESPECIFICAÇÃO TÉCNICA E MANIFESTO DE SISTEMA

> **Documento:** `projetocompleto.md`  
> **Versão:** 2.4.0 (Full Blueprint & Reconstruction Specification)  
> **Classificação:** Core Architectural Blueprint / Whitepaper Técnico  
> **Propósito:** Especificação canônica integral para reconstrução, replicação e evolução do ecossistema Intent OS.

---

## 1. MANIFESTO & PRINCÍPIOS FUNDAMENTAIS

### 1.1 O Princípio da Universalidade e Desacoplamento de Domínio
O **Intent OS** não se especializa em domínios específicos (educação, concursos, metas fitness, finanças, IoT, governança, etc.).  
Ele fornece um **Contrato Universal de Intenções (Universal Intent Contract)**.  
- **Anti-Pattern proibido:** Criar `SchoolIntent`, `FitnessIntent`, `ContestIntent`.
- **Pattern canônico:** Existe apenas `INTENT` e seus **Adaptadores Externos (External Event Adapters)** que traduzem estímulos do mundo real para as condições do contrato universal.

### 1.2 O Conceito Central: "Intenção como Primitiva Criptográfica e Social"
Uma **Intent** é uma entidade de estado auto-verificável composta por:
1. **Metadados e História Pública:** O que o mundo ou a rede de apoio pode ver e acompanhar.
2. **Cofre Protegido (Secret Vault):** Conteúdo criptografado (AES-GCM / SHA-256) inacessível até a resolução integral das condições de desbloqueio.
3. **Máquina de Estados de Condições (Condition Engine):** Regras booleanas, temporais, de quórum ou externas que determinam a transição para o estado de revelação.
4. **Camada de Causalidade Social:** Rastreamento de origem de cada interação (quem convidou quem, profundidade de indicação, reputação gerada).

---

## 2. ARQUITETURA DE DADOS E CONTRATOS TYPESCRIPT

```typescript
// ==========================================
// 1. CONTRATO DE USUÁRIO E IDENTIDADE
// ==========================================
export interface UserAccount {
  id: string;
  name: string;
  username: string; // @handle
  email: string;
  password?: string;
  createdAt: string;
  lastLoginAt: string;
  avatarUrl?: string;
  bio?: string;
  status: 'active' | 'inactive' | 'suspended';
  configuracoes?: {
    theme?: 'light' | 'dark';
    notificationsEnabled?: boolean;
    privacyLevel?: 'public' | 'private' | 'guardians_only';
    emailAlerts?: boolean;
  };
  relacionamentos?: {
    intentsCriadasCount: number;
    intentsRecebidasCount: number;
    intentsParticipadasCount: number;
    historicoCount: number;
    seguidoresCount: number;
    seguindoCount: number;
    seguidoresList?: string[];
    seguindoList?: string[];
    reputacao?: {
      pontos: number;
      nivel: string;
      selo?: string;
    };
  };
}

// ==========================================
// 2. PAPÉIS E PARTICIPAÇÃO
// ==========================================
export type ParticipantRole = 'recipient' | 'guardian' | 'approver' | 'participant' | 'viewer';
export type PersonRole = 'recipient' | 'approver' | 'participant' | 'guardian';
export type ParticipantStatus = 'pending' | 'approved' | 'declined';

export interface Participant {
  id: string;
  name: string;
  email: string;
  role: ParticipantRole;
  roles?: PersonRole[]; // Múltiplos papéis simultâneos
  status: ParticipantStatus;
  approved_at?: string;
  avatar_url?: string;
  notes?: string;
}

// ==========================================
// 3. CONDIÇÕES E QUÓRUM DE DESBLOQUEIO
// ==========================================
export type ConditionType = 'NONE' | 'TIME' | 'PEOPLE' | 'APPROVAL' | 'PUBLIC_SUPPORT' | 'HYBRID';
export type QuorumMode = 'UNANIMOUS' | 'MAJORITY' | 'SUPERMAJORITY' | 'EXACT_N' | 'PERCENTAGE';
export type TimeOperator = '>=' | '<=' | 'BETWEEN' | 'WINDOW';

export interface TimeCondition {
  type: ConditionType;
  operator: TimeOperator;
  unlock_timestamp: string; // ISO 8601
  window_end_timestamp?: string;
  timezone?: string;
}

export interface QuorumCondition {
  type: 'APPROVAL';
  mode: QuorumMode;
  required_count?: number; // Para EXACT_N
  required_percentage?: number; // Para PERCENTAGE
  guardians_total: number;
  approved_count: number;
}

export interface PublicSupportCondition {
  type: 'PUBLIC_SUPPORT';
  target_supporters_count: number;
  current_supporters_count: number;
  requires_verification: boolean;
}

export interface HybridCondition {
  type: 'HYBRID';
  logical_operator: 'AND' | 'OR';
  conditions: Array<TimeCondition | QuorumCondition | PublicSupportCondition | Record<string, any>>;
}

// ==========================================
// 4. COFRE E CRIPTOGRAFIA (VAULT)
// ==========================================
export interface VaultContent {
  id: string;
  type: 'TEXT' | 'IMAGE' | 'URL' | 'FILE' | 'CREDENTIAL';
  encrypted_payload: string; // AES-GCM base64
  iv: string; // Initialization Vector
  auth_tag?: string;
  hash_checksum: string; // SHA-256
  is_revealed: boolean;
  revealed_at?: string;
  plaintext_cache?: string; // Disponível apenas no cliente pós-desbloqueio
}

// ==========================================
// 5. INTENT ROOT CANÔNICA
// ==========================================
export interface Intent {
  id: string;
  creator_id: string;
  creator_name: string;
  creator_avatar?: string;
  title: string;
  description: string;
  category: 'META_PESSOAL' | 'DESAFIO_GRUPO' | 'DATA_ESPECIFICA' | 'GOVERNANCA' | 'CUSTOM';
  created_at: string;
  updated_at: string;
  status: 'DRAFT' | 'ACTIVE' | 'LOCKED' | 'UNLOCKED' | 'EXPIRED' | 'CANCELLED';
  visibility: 'PUBLIC' | 'FOLLOWERS' | 'GUARDIANS_ONLY' | 'PRIVATE';
  
  // Regras de Condição
  condition_type: ConditionType;
  time_condition?: TimeCondition;
  quorum_condition?: QuorumCondition;
  public_support_condition?: PublicSupportCondition;
  hybrid_condition?: HybridCondition;
  
  // Participantes & Guardiões
  participants: Participant[];
  
  // Cofre de Revelação
  vault: VaultContent;
  
  // Rastreamento Social e Causalidade
  interactions_count: number;
  supporters_count: number;
  opinions_agree_count: number;
  opinions_disagree_count: number;
  
  // Atributos de Celebração e Recompensa
  reward_coupon_code?: string;
  celebration_message?: string;
  celebration_banner_url?: string;
}
```

---

## 3. MÁQUINA DE ESTADOS E REGRAS DE TRANSIÇÃO (LÓGICA DO MOTOR)

### 3.1 Tabela de Transições de Estado

| Estado Atual | Gatilho / Evento | Próximo Estado | Validação Obrigatória |
| :--- | :--- | :--- | :--- |
| `DRAFT` | `PUBLISH` | `ACTIVE` | Metadados válidos + Cofre Criptografado + Condições estruturadas. |
| `ACTIVE` | `LOCK_ENGAGED` | `LOCKED` | Início do período de trava (ex: cronômetro iniciado ou quórum aguardando). |
| `LOCKED` | `EVALUATE_CONDITIONS (TRUE)` | `UNLOCKED` | Avaliador lógico retorna `true` para todas as condições (tempo, quórum, apoio). |
| `LOCKED` | `TIMEOUT_EXPIRED_NO_QUORUM` | `EXPIRED` | Janela de tempo expirada sem atingir o quórum necessário. |
| `ACTIVE / LOCKED` | `CANCEL_BY_CREATOR` | `CANCELLED` | Permitido apenas se configurado nas regras de soberania do criador. |

### 3.2 Algoritmo de Avaliação de Quórum
```typescript
export function evaluateQuorum(condition: QuorumCondition, participants: Participant[]): boolean {
  const approvers = participants.filter(p => p.role === 'approver' || p.role === 'guardian');
  const approvedCount = approvers.filter(p => p.status === 'approved').length;
  const total = approvers.length;

  if (total === 0) return false;

  switch (condition.mode) {
    case 'UNANIMOUS':
      return approvedCount === total;
    case 'MAJORITY':
      return approvedCount > Math.floor(total / 2);
    case 'SUPERMAJORITY':
      return approvedCount >= Math.ceil(total * (2 / 3));
    case 'EXACT_N':
      return approvedCount >= (condition.required_count || 1);
    case 'PERCENTAGE':
      return (approvedCount / total) * 100 >= (condition.required_percentage || 50);
    default:
      return false;
  }
}
```

---

## 4. DESIGN SYSTEM E COMPONENTIZAÇÃO FRONTEND (REACT + TAILWIND)

### 4.1 Identidade Visual e Paleta de Cores
- **Navy Primário (Ação & Foco):** `#000666` / `#0055FF`
- **Teal / Confiança (Validação & Sucesso):** `#006A62` / `#00A389`
- **Superfícies & Contraste:** Light Canvas `#F8FAFC`, Cards `#FFFFFF`, Bordas `#E2E8F0`, Divisórias Sutis `#F1F5F9`.
- **Tipografia:** `Plus Jakarta Sans`, pesos 400, 500, 600, 700, 800, 900.

### 4.2 Arquitetura Modular de Telas (Views)
1. **`LandingHeroView`**: Apresentação de valor (*"Faça acontecer. Juntos."*), cards em Bento Grid com demonstração interativa de cofre trancado vs. destrancado.
2. **`CreationWizard`**: Fluxo em 5 etapas para modelar e lançar intenções com seleção de template, cofre secreto e visibilidade.
3. **`ExploreFeedView`**: Feed de descoberta comunitária, busca em tempo real, filtros por categoria e painel de criadores confiáveis.
4. **`MyIntentsDashboard`**: Painel de controle pessoal (Em Andamento, Estagnadas, Concluídas) e métricas consolidadas de impacto social.
5. **`IntentDetailView`**: Visualização detalhada da Intent com termômetro circular de progresso (85%), linha do tempo de atualizações e suporte da comunidade.
6. **`IntentCelebrationView`**: Experiência festiva pós-desbloqueio, exibição do conteúdo secreto revelado, botão de cópia de cupom/recompensa e reações ao vivo.
7. **`MessagesView`**: Mensagens diretas e compartilhamento nativo de cards de Intent no chat.
8. **`NotificationsView`**: Central de alertas com convites para grupos de guardiões e avisos de metas concluídas.
9. **`UserProfileView` & `SettingsView`**: Gestão de identidade, histórico de reputação (pontos e selos) e configurações de privacidade.

---

## 5. ROTEIRO DE EVOLUÇÃO FUTURA (ROADMAP TÉCNICO)

### Fase 1: Hardening de Criptografia & Zero-Knowledge Vaults
- Migração do cofre para chaves derivadas do cliente (PBKDF2/WebCrypto API).
- Fragmentação de chave secreta via **Shamir's Secret Sharing (SSS)** distribuída entre os Guardiões.

### Fase 2: Adaptadores Externos de Eventos (External Event Adapters)
- **Webhooks & APIs:** Desbloqueio automático via confirmações externas (ex: Stripe, GitHub PR merged, Strava API corrida concluída).
- **IoT Oracles:** Integração com sensores e smart contracts.

### Fase 3: Governança P2P e Reputação Descentralizada
- Cálculo matemático de impacto de causalidade (grafo de indicações e profundidade de apoio).
- Sistema de quórum com pesos de reputação dinâmica.

---

## 6. COMANDOS OPERACIONAIS E DIRETIVAS DO ASSISTENTE

- `#Retomar projeto Intent#`: Ativa o modo de desenvolvimento, lógica e interfaces do Intent OS.
- `#Pausar projeto Intent#`: Suspende alterações ativas de desenvolvimento.
- `#Retomar projeto jira#`: Ativa a geração e estruturação de Épicos, Histórias de Usuário, DoD e DoR no Jira/Confluence.
- `#Pausar projeto jira#`: Pausa a assistência referente ao Jira.

---
*Intent OS — The Social Operating System for Collective Expectations.*
