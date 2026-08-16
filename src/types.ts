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

export type ConditionType = 'NONE' | 'TIME' | 'PEOPLE' | 'APPROVAL' | 'PUBLIC_SUPPORT' | 'HYBRID';

export type QuorumMode = 'UNANIMOUS' | 'MAJORITY' | 'SUPERMAJORITY' | 'EXACT_N' | 'PERCENTAGE';

export type SocialOpinionType = 'AGREE' | 'DISAGREE' | 'COMMENT' | 'PREDICTION';

export type PostVisibility = 'public' | 'private' | 'followers';
export type PostCategory = 'GENERAL' | 'INTENT_OPINION' | 'PREDICTION' | 'DEBATE';

export interface SocialComment {
  id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  text: string;
  created_at: string;
  source_referrer?: string; // Causalidade de quem convidou/trouxe o comentarista
}

export interface PredictionDetail {
  intent_id: string;
  intent_title?: string;
  target_statement: string; // Ex: "A Intent não será concluída até sexta-feira."
  predicted_outcome: 'WILL_SUCCEED' | 'WILL_FAIL' | 'CUSTOM_DATE';
  predicted_date?: string;
  resolved_status: 'PENDING' | 'CORRECT' | 'INCORRECT';
  resolved_at?: string;
  confidence_level?: number; // 1-100%
  actual_outcome_summary?: string;
}

export interface CausalityAttribution {
  source_user_id?: string; // Quem convidou / originou a ação (ex: "Flávio")
  source_user_name?: string;
  invitation_code?: string;
  referral_depth?: number; // 1 = Direto, 2 = Indireto (2º grau)
  action_recorded: 'INTENT_CREATED' | 'SUPPORTED' | 'APPROVED' | 'PREDICTED' | 'COMMENTED' | 'REFERRED';
  target_intent_id?: string;
  recorded_at: string;
}

export interface SocialPost {
  id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  created_at: string;
  
  // POST core
  text: string;
  media_url?: string;
  media_type?: 'image' | 'link' | 'file';
  visibility: PostVisibility;
  
  // Referência opcional à Intent (Desacoplamento: Opinião NÃO altera a Intent)
  intent_id?: string;
  intent_title?: string;
  category: PostCategory;
  
  // Debate Social
  agree_count: number;
  disagree_count: number;
  agreed_user_ids?: string[];
  disagreed_user_ids?: string[];
  comments_count: number;
  comments?: SocialComment[];
  
  // Previsão Formal (opcional)
  prediction?: PredictionDetail;
  
  // Registro de Causalidade (Rastreamento de origem para futuro cálculo de impacto)
  causality?: CausalityAttribution;
}

export interface SocialInteraction {
  id: string;
  user_name: string;
  user_id?: string;
  user_avatar?: string;
  type: SocialOpinionType;
  text?: string;
  prediction_val?: string;
  created_at: string;
  source_referrer?: string; // Causalidade: quem indicou
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
  action_type: 'CREATED' | 'UPDATED' | 'ENCRYPTED' | 'GUARDIAN_APPROVED' | 'GUARDIAN_DECLINED' | 'SUPPORTED' | 'REVEALED' | 'SOCIAL_OPINION' | 'PREDICTION_MADE' | 'PREDICTION_RESOLVED' | IntentEventType;
  actor_name: string;
  actor_id?: string;
  description: string;
  badge?: string;
  event_type?: IntentEventType;
  source_referrer_id?: string; // Quem convidou/originou esta ação (Causalidade)
  source_referrer_name?: string;
  metadata?: Record<string, unknown>;
}

export interface Supporter {
  id: string;
  name: string;
  email?: string;
  avatar_url?: string;
  supported_at: string;
  comment?: string;
  source_user_id?: string; // Causalidade: quem convidou este apoiador (ex: "Flávio")
  source_user_name?: string;
  invitation_code?: string;
}

export type AudienceType = 'PRIVATE' | 'SELECTED' | 'PUBLIC' | 'FOLLOWERS' | 'LINK' | 'GROUP';

export interface IntentCreator {
  id: string;
  name: string;
  username?: string;
  email?: string;
  avatar_url?: string;
}

export interface ProtectedPayload {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  cipherText: string;
  cipherAlg: 'AES-256-GCM';
  salt: string;
  iv: string;
  fingerprint: string; // SHA-256 checksum (prefix/display)
  content_hash: string; // SHA-256 integral do payload original (Integridade pós-revelação)
  commitment: string; // SHA-256 (Payload || Salt || Secret) - Prova pública imutável pré-revelação
  encryption_key_reference?: string; // Referência da chave de custódia / KMS
  creator_signature?: string; // Assinatura digital / identificador de autenticidade do criador
  key_status?: 'SEALED' | 'AUTHORIZED' | 'REVEALED';
  encryptedAt: string;
  isEncrypted: boolean;
  decryptedContent?: string;
  integrity_verified?: boolean; // Booleano indicando que o hash conferiu no momento da abertura
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
  protected_payload?: ProtectedPayload;
}

export interface PublicParticipationConfig {
  target_supports: number; // Meta de apoios (ex: 100)
  current_supports: number; // Apoios atuais (ex: 73)
  supporters: Supporter[]; // Lista de apoiadores com registro imutável
  support_threshold_met?: boolean; // Flag se atingiu a meta
}

export interface RevealWindowConfig {
  has_expiration: boolean; // Se true, o segredo possui janela finita de acesso (ex: 24h)
  duration_hours: number; // Duração da janela em horas após a revelação (ex: 24h, 48h, 7d)
  reveal_started_at?: string; // Timestamp exato em que a revelação foi disparada
  expires_at?: string; // reveal_started_at + duration_hours
  is_expired?: boolean; // Se o prazo da janela encerrou
}

export interface IntentConditions {
  condition_type: ConditionType;
  operator?: TimeOperator; // '>=' | '<=' | 'BETWEEN'
  value?: string; // ISO string UTC do alvo (ex: 2030-12-25T00:00:00.000Z)
  target_date?: string; // Data/hora do disparo/revelação (ISO string)
  expiration_date?: string; // Data limite de expiração da janela de revelação
  
  // Etapa 5: Generic Approval & Quorum Engine
  quorum_mode?: QuorumMode; // 'UNANIMOUS' | 'MAJORITY' | 'SUPERMAJORITY' | 'EXACT_N' | 'PERCENTAGE'
  required_approvals?: number; // M de N (ex: 2)
  eligible_approvers?: number; // N (total de aprovadores elegíveis, ex: 3)
  quorum_percentage?: number; // Se percentual (ex: 66 para 66%)

  // Etapa 7: Public Support & Ephemeral Reveal Window
  target_supports?: number; // Meta de apoios (ex: 100)
  current_supports?: number; // Apoios acumulados (ex: 73)
  public_participation?: PublicParticipationConfig;
  reveal_window?: RevealWindowConfig;

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
  quorum_mode?: QuorumMode; // 'UNANIMOUS' | 'MAJORITY' | 'SUPERMAJORITY' | 'EXACT_N' | 'PERCENTAGE'
  required_approvals?: number; // Quórum de aprovações de guardiões necessário para liberação (ex: 2/3)
  revealed_by?: string; // Usuário ou processo que acionou a revelação
  approval_status?: 'pending_quorum' | 'ready_to_reveal' | 'revealed';

  // Etapa 6: Conteúdo Protegido (Confidencialidade, Integridade, Autenticidade, Auditoria)
  protected_payload?: ProtectedPayload;

  // Etapa 7: Participação Pública, Meta de Apoios & Janela de Revelação Efêmera (CONDITION -> REVEAL_WINDOW -> EXPIRATION)
  target_supports?: number; // Meta de apoios (ex: 100)
  current_supports?: number; // Apoios atuais acumulados (ex: 73)
  supporters?: Supporter[]; // Lista de apoiadores públicos (anti-duplicação)
  public_participation?: PublicParticipationConfig;
  reveal_window?: RevealWindowConfig;
  reveal_window_hours?: number; // Ex: 24 (horas disponíveis pós-revelação)
  expires_at?: string; // Timestamp em que o conteúdo revelado expira e é bloqueado/destruído
  is_expired?: boolean; // Se a janela expirou

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
