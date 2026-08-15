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

export type ParticipantRole = 'recipient' | 'guardian' | 'viewer';
export type ParticipantStatus = 'pending' | 'approved' | 'declined';

export interface Participant {
  id: string;
  name: string;
  email: string;
  role: ParticipantRole; // 'recipient' (Destinatário), 'guardian' (Guardião/Aprovador), 'viewer' (Observador)
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

export type IntentEventType =
  | 'INTENT_CREATED'
  | 'CONTENT_ATTACHED'
  | 'CONDITION_CREATED'
  | 'CONDITION_SATISFIED'
  | 'REVEAL_STARTED'
  | 'CONTENT_REVEALED'
  | 'REVEAL_EXPIRED'
  | 'SUPPORT_RECEIVED'
  | 'GUARDIAN_APPROVED'
  | 'GUARDIAN_DECLINED';

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
  
  // Etapa 3: Condições Temporais
  condition_type?: ConditionType;
  target_date?: string; // Data/hora do disparo/revelação (ISO string)
  reveal_content?: string; // Conteúdo protegido/revelado no momento definido
  is_locked?: boolean; // Se o conteúdo está atualmente bloqueado pela condição
  revealed_at?: string; // Timestamp em que a revelação ocorreu

  // Etapa 4 & 5: Pessoas, Guardiões, Quórum & Aprovação (Revelação)
  participants?: Participant[];
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
