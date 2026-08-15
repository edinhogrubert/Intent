/**
 * ARCHITECTURAL MANIFESTO & CORE CONTRACT (INTENT ENGINE)
 * 
 * PRINCÍPIO DE INDEPENDÊNCIA:
 * A plataforma não se especializa no domínio que utiliza sua infraestrutura.
 * Ela fornece um contrato universal (Interface) de Intents; sistemas externos (escolas,
 * bancas de concurso, ERPs, IoT, redes sociais, gateways) adaptam seus eventos a este contrato.
 * 
 * Nunca criar "SchoolIntent" ou "ContestIntent". Existe apenas INTENT e seus Adaptadores Externos.
 */

export interface UserAccount {
  id: string;
  name: string; // nome
  username: string; // @username
  email: string;
  password?: string;
  createdAt: string; // created_at
  lastLoginAt: string;
  avatarUrl?: string; // avatar
  bio?: string;
  status: 'active' | 'inactive' | 'suspended';
  configuracoes?: {
    theme?: 'light' | 'dark';
    notificationsEnabled?: boolean;
    privacyLevel?: 'public' | 'private' | 'guardians_only';
    emailAlerts?: boolean;
  };
  
  // Estrutura de Relacionamentos Preparada (Etapa 1)
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

export type ParticipantRole = 'recipient' | 'guardian' | 'approver' | 'participant' | 'viewer';
export type PersonRole = 'recipient' | 'approver' | 'participant' | 'guardian';
export type ParticipantStatus = 'pending' | 'approved' | 'declined';

export interface Participant {
  id: string;
  name: string;
  email: string;
  role: ParticipantRole; // 'recipient' (Destinatário), 'approver'/'guardian' (Aprovador), 'participant'/'viewer' (Participante)
  roles?: PersonRole[]; // Suporte a múltiplos papéis (ex: Aprovador + Destinatário)
  status: ParticipantStatus; // 'pending' | 'approved' | 'declined'
  approved_at?: string;
  avatar_url?: string;
  notes?: string;
}

export type ConditionType = 'NONE' | 'TIME' | 'PEOPLE' | 'PUBLIC_SUPPORT' | 'HYBRID';

export type SocialOpinionType = 'AGREE' | 'DISAGREE' | 'COMMENT' | 'PREDICTION';

export interface SocialInteraction {
  id: string;
  user_name: string;
  user_avatar?: string;
  type: SocialOpinionType;
  text?: string;
  prediction_val?: string;
  created_at: string;
}

export type TimeOperator = '>=' | '<=' | 'BETWEEN' | 'WINDOW';

export type ContentSource = 'UPLOAD' | 'API' | 'WEBHOOK' | 'LINK' | 'MANUAL';

export interface ContentVersion {
  version: number;
  created_at: string;
  source: ContentSource;
  payload_summary?: string;
  author_or_system: string;
  protected_payload_id?: string;
}

export interface ReleaseStage {
  stage_index: number;
  title: string;
  description?: string;
  conditions?: IntentConditions;
  status: 'locked' | 'satisfied' | 'revealed' | 'expired';
  content_version?: number;
  revealed_at?: string;
}

export type IntentEventType =
  | 'INTENT_CREATED'
  | 'CONTENT_ATTACHED'
  | 'CONTENT_UPDATED'
  | 'CONDITION_CREATED'
  | 'CONDITION_SATISFIED'
  | 'REVEAL_STARTED'
  | 'CONTENT_REVEALED'
  | 'REVEAL_EXPIRED'
  | 'SUPPORT_RECEIVED'
  | 'GUARDIAN_APPROVED'
  | 'GUARDIAN_DECLINED'
  | 'API_CONTENT_RECEIVED'
  | 'STAGE_ADVANCED'
  | 'WEBHOOK_RECEIVED';

export interface HistoryLogEntry {
  id: string;
  timestamp: string;
  action_type: 'CREATED' | 'UPDATED' | 'ENCRYPTED' | 'GUARDIAN_APPROVED' | 'GUARDIAN_DECLINED' | 'SUPPORTED' | 'REVEALED' | 'SOCIAL_OPINION' | IntentEventType;
  actor_name: string;
  description: string;
  badge?: string;
  event_type?: IntentEventType;
  metadata?: Record<string, unknown>;
}

export interface Supporter {
  id: string;
  name: string;
  email?: string;
  avatar_url?: string;
  supported_at: string;
  comment?: string;
}

export type AudienceType = 'PRIVATE' | 'SELECTED' | 'PUBLIC' | 'FOLLOWERS' | 'LINK' | 'GROUP';

export interface IntentCreator {
  id: string;
  name: string;
  username?: string;
  email?: string;
  avatar_url?: string;
}

export interface IntentContent {
  title: string;
  description: string;
  objective?: string;
  reveal_content?: string;
  source?: ContentSource; // 'UPLOAD' | 'API' | 'WEBHOOK' | 'LINK' | 'MANUAL'
  current_version?: number; // v1, v2, v3
  versions?: ContentVersion[]; // Histórico imutável de edições/versões de conteúdo
  release_stages?: ReleaseStage[]; // Suporte a revelações em etapas (ex: Edital -> Homologação -> Aprovados)
  protected_payload?: {
    id: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    cipherText: string;
    cipherAlg: 'AES-256-GCM';
    salt: string;
    iv: string;
    fingerprint: string;
    encryptedAt: string;
    isEncrypted: boolean;
    decryptedContent?: string;
  };
}

export interface IntentConditions {
  condition_type: ConditionType;
  operator?: TimeOperator; // '>=' | '<=' | 'BETWEEN'
  value?: string; // ISO string UTC do alvo (ex: 2030-12-25T00:00:00.000Z)
  target_date?: string; // Data/hora do disparo/revelação (ISO string)
  expiration_date?: string; // Data limite de expiração da janela de revelação
  required_approvals?: number; // Quórum de aprovações de guardiões (ex: 2)
  target_supports?: number; // Meta de apoios (ex: 100)
  current_supports?: number; // Apoios acumulados
  is_locked?: boolean; // Bloqueio atual do conteúdo
}

export interface IntentAudience {
  type: AudienceType; // PRIVATE | SELECTED | PUBLIC | FOLLOWERS | LINK | GROUP
  visibility: 'private' | 'public';
  recipients?: Participant[];
}

export interface IntentPermissions {
  can_view?: string[];
  can_edit?: string[];
  can_reveal?: string[];
}

export interface IntentPeople {
  approvers: Participant[];   // Aprovadores / Guardiões com poder de voto/satisfação da condição
  recipients: Participant[];  // Destinatários que receberão a revelação do segredo
  participants: Participant[]; // Participantes e envolvidos gerais
}

export interface Intent {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  visibility: 'private' | 'public';
  audience_type?: AudienceType;

  // ETAPA 2 — Estrutura Modular Separada
  creator?: IntentCreator;
  content?: IntentContent;
  conditions?: IntentConditions;
  audience?: IntentAudience;
  permissions?: IntentPermissions;
  people?: IntentPeople; // ETAPA 4 — Separação Tripla de Pessoas (Approvers, Recipients, Participants)
  
  // Etapa 3: Condições Temporais
  condition_type?: ConditionType;
  target_date?: string; // Data/hora do disparo/revelação (ISO string)
  reveal_content?: string; // Conteúdo protegido/revelado no momento definido
  is_locked?: boolean; // Se o conteúdo está atualmente bloqueado pela condição
  revealed_at?: string; // Timestamp em que a revelação ocorreu

  // Etapa 4 & 5: Pessoas, Guardiões, Quórum & Aprovação (Revelação)
  participants?: Participant[];
  approvers?: Participant[]; // Aprovadores específicos
  recipients?: Participant[]; // Destinatários específicos
  required_approvals?: number; // Quórum de aprovações de guardiões necessário para liberação (ex: 2/3)
  revealed_by?: string; // Usuário ou processo que acionou a revelação
  approval_status?: 'pending_quorum' | 'ready_to_reveal' | 'revealed';

  // Etapa 6: Conteúdo Protegido (Arquivo -> Criptografia -> Armazenamento -> Condição -> Descriptografia)
  protected_payload?: {
    id: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    cipherText: string;
    cipherAlg: 'AES-256-GCM';
    salt: string;
    iv: string;
    fingerprint: string;
    encryptedAt: string;
    isEncrypted: boolean;
    decryptedContent?: string;
  };

  // Etapa 7: Participação Pública & Meta de Apoios (Intent -> Apoios -> 10 / 100 -> 100 / 100 -> REVELAR)
  target_supports?: number; // Meta de apoios (ex: 100)
  current_supports?: number; // Apoios atuais acumulados (ex: 10)
  supporters?: Supporter[]; // Lista de apoiadores públicos

  // Etapa 8: Camada Social & Histórico (Intent, Histórico, Opinião, Concordo, Discordo, Comentário, Previsão)
  history_logs?: HistoryLogEntry[];
  social_interactions?: SocialInteraction[];
  agree_count?: number;
  disagree_count?: number;
  predictions_count?: number;
}

export type TimeOfDay = 'morning' | 'afternoon' | 'night';

export interface GreetingConfig {
  period: TimeOfDay;
  buttonText: string;
  heading: string;
  description: string;
  iconName: string;
  timeRange: string;
  accentColor: string;
  badgeBg: string;
}
