export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  createdAt: string;
  lastLoginAt: string;
  avatarUrl?: string;
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

export type ConditionType = 'NONE' | 'TIME' | 'PEOPLE' | 'HYBRID';

export interface Intent {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  visibility: 'private' | 'public';
  
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
