import { Intent, AudienceType, Participant, UserAccount } from '../types';

/**
 * Normaliza um objeto de Intent garantindo a separação conceitual da Etapa 2:
 * INTENT, CONTENT, CONDITIONS, CREATOR, AUDIENCE, PERMISSIONS, PARTICIPANTS, STATUS, HISTORY
 */
export function normalizeIntent(raw: Partial<Intent>, currentUser?: UserAccount): Intent {
  const creatorId = raw.creator_id || raw.creator?.id || currentUser?.id || 'usr-1';
  const creatorName = raw.creator?.name || (currentUser?.id === creatorId ? currentUser.name : 'Autor da Intent');
  const creatorUsername = raw.creator?.username || (currentUser?.id === creatorId ? currentUser.username : '@autor');
  const creatorEmail = raw.creator?.email || (currentUser?.id === creatorId ? currentUser.email : '');

  const title = raw.content?.title || raw.title || 'Sem título';
  const description = raw.content?.description || raw.description || '';
  const revealContent = raw.content?.reveal_content || raw.reveal_content || '';
  const protectedPayload = raw.content?.protected_payload || raw.protected_payload;

  const conditionType = raw.conditions?.condition_type || raw.condition_type || 'NONE';
  const operator = raw.conditions?.operator || '>=';
  const targetDate = raw.conditions?.target_date || raw.conditions?.value || raw.target_date;
  const expirationDate = raw.conditions?.expiration_date;
  const requiredApprovals = raw.conditions?.required_approvals ?? raw.required_approvals ?? 1;
  const targetSupports = raw.conditions?.target_supports ?? raw.target_supports ?? 100;
  const currentSupports = raw.conditions?.current_supports ?? raw.current_supports ?? 10;
  const isLocked = raw.conditions?.is_locked ?? raw.is_locked ?? true;

  const visibility = raw.audience?.visibility || raw.visibility || 'private';
  const audienceType: AudienceType =
    raw.audience?.type ||
    raw.audience_type ||
    (visibility === 'public' ? 'PUBLIC' : 'PRIVATE');

  const participants: Participant[] = raw.participants || [];
  
  // Etapa 4: Separação conceitual das 3 personas (Aprovadores, Destinatários, Participantes)
  const approvers = raw.people?.approvers || raw.approvers || participants.filter((p) => 
    p.role === 'approver' || p.role === 'guardian' || (p.roles && p.roles.includes('approver'))
  );
  
  const recipients = raw.people?.recipients || raw.recipients || raw.audience?.recipients || participants.filter((p) => 
    p.role === 'recipient' || (p.roles && p.roles.includes('recipient'))
  );

  const generalParticipants = raw.people?.participants || participants.filter((p) => 
    p.role === 'participant' || p.role === 'viewer' || (p.roles && p.roles.includes('participant'))
  );

  const peopleObj = {
    approvers,
    recipients,
    participants: generalParticipants.length > 0 ? generalParticipants : participants,
  };

  const creatorObj = {
    id: creatorId,
    name: creatorName,
    username: creatorUsername,
    email: creatorEmail,
    avatar_url: raw.creator?.avatar_url || currentUser?.avatarUrl,
  };

  const source = raw.content?.source || 'UPLOAD';
  const currentVersion = raw.content?.current_version || 1;
  const versions = raw.content?.versions || [
    {
      version: currentVersion,
      created_at: raw.created_at || new Date().toISOString(),
      source,
      author_or_system: creatorName,
      payload_summary: protectedPayload?.fileName || (revealContent ? 'Texto Seguro' : 'Intenção Inicial'),
    },
  ];
  const releaseStages = raw.content?.release_stages || [
    {
      stage_index: 1,
      title: 'Etapa Única / Inicial',
      description: 'Liberação de conteúdo da Intent.',
      status: raw.revealed_at ? 'revealed' : 'locked',
      content_version: currentVersion,
      revealed_at: raw.revealed_at,
    },
  ];

  const contentObj = {
    title,
    description,
    objective: raw.content?.objective || description,
    reveal_content: revealContent,
    source,
    current_version: currentVersion,
    versions,
    release_stages: releaseStages,
    protected_payload: protectedPayload,
  };

  const conditionsObj = {
    condition_type: conditionType,
    operator,
    value: targetDate ? new Date(targetDate).toISOString() : undefined,
    target_date: targetDate,
    expiration_date: expirationDate,
    required_approvals: requiredApprovals,
    target_supports: targetSupports,
    current_supports: currentSupports,
    is_locked: isLocked,
  };

  const audienceObj = {
    type: audienceType,
    visibility,
    recipients,
  };

  const permissionsObj = raw.permissions || {
    can_view: audienceType === 'PUBLIC' ? ['*'] : [creatorId, ...recipients.map((r) => r.id)],
    can_edit: [creatorId],
    can_reveal: [creatorId, ...approvers.map((g) => g.id)],
  };

  return {
    ...raw,
    id: raw.id || `intent-${Date.now()}`,
    creator_id: creatorId,
    title,
    description,
    status: raw.status || 'active',
    created_at: raw.created_at || new Date().toISOString(),
    visibility,
    audience_type: audienceType,
    
    // Sub-estruturas da Etapa 2, 3 & 4
    creator: creatorObj,
    content: contentObj,
    conditions: conditionsObj,
    audience: audienceObj,
    permissions: permissionsObj,
    people: peopleObj,

    // Compatibilidade com vias de atalho no topo do objeto
    condition_type: conditionType,
    target_date: targetDate,
    reveal_content: revealContent,
    is_locked: isLocked,
    participants,
    approvers,
    recipients,
    required_approvals: requiredApprovals,
    protected_payload: protectedPayload,
    target_supports: targetSupports,
    current_supports: currentSupports,
    supporters: raw.supporters || [],
    history_logs: raw.history_logs || [],
    social_interactions: raw.social_interactions || [],
  };
}

export interface IntentAnswers {
  creatorText: string;
  objectiveText: string;
  audienceText: string;
  revealText: string;
  conditionText: string;
  participantsText: string;
  recipientsText: string;
}

/**
 * Responde às 7 perguntas chave conceituais da ETAPA 2 sobre qualquer Intent
 */
export function answerIntentQuestions(intent: Intent): IntentAnswers {
  const norm = normalizeIntent(intent);

  const creatorText = norm.creator
    ? `${norm.creator.name} (${norm.creator.username || norm.creator.email || norm.creator.id})`
    : norm.creator_id;

  const objectiveText = norm.content?.title
    ? `Title: "${norm.content.title}" — ${norm.content.description || 'Sem descrição'}`
    : norm.title;

  const audienceText = `Audiência: ${norm.audience?.type || norm.audience_type} (Visibilidade: ${norm.visibility})`;

  const revealText = norm.content?.protected_payload
    ? `Arquivo Protegido: ${norm.content.protected_payload.fileName} (${norm.content.protected_payload.cipherAlg})`
    : norm.content?.reveal_content || norm.reveal_content || 'Conteúdo de texto protegido';

  let conditionText = 'Sem condição especial (Liberação Imediata)';
  if (norm.conditions?.condition_type === 'TIME') {
    conditionText = `Condição de Tempo: Disparo programado para ${norm.conditions.target_date || 'Data futura'}`;
  } else if (norm.conditions?.condition_type === 'PEOPLE') {
    conditionText = `Condição de Pessoas: Requer quórum de ${norm.conditions.required_approvals} guardião(ões)`;
  } else if (norm.conditions?.condition_type === 'PUBLIC_SUPPORT') {
    conditionText = `Condição de Apoio Público: Meta de ${norm.conditions.target_supports} apoios (Atuais: ${norm.conditions.current_supports})`;
  } else if (norm.conditions?.condition_type === 'HYBRID') {
    conditionText = `Condição Híbrida: Tempo + Guardiões (${norm.conditions.required_approvals} aprovações até ${norm.conditions.target_date || 'data alvo'})`;
  }

  const approvers = norm.people?.approvers || norm.approvers || norm.participants?.filter((p) => p.role === 'approver' || p.role === 'guardian') || [];
  const participantsText = approvers.length > 0
    ? `${approvers.length} Aprovador(es) / Guardião(ões): ${approvers.map((g) => g.name).join(', ')}`
    : 'Nenhum aprovador estipulado';

  const recipients = norm.people?.recipients || norm.recipients || norm.audience?.recipients || norm.participants?.filter((p) => p.role === 'recipient') || [];
  const recipientsText = recipients.length > 0
    ? `${recipients.length} Destinatário(s) da Revelação: ${recipients.map((r) => r.name).join(', ')}`
    : norm.visibility === 'public' ? 'Público Geral' : `Apenas o Criador (${norm.creator?.name || norm.creator_id})`;

  return {
    creatorText,
    objectiveText,
    audienceText,
    revealText,
    conditionText,
    participantsText,
    recipientsText,
  };
}
