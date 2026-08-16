import { Intent, Participant, IntentEventType, QuorumMode } from '../types';
import { calculateTimeRemaining, TimeRemainingResult } from './timeCondition';

export interface ConditionEvaluationResult {
  isConditionSatisfied: boolean;
  timeResult: TimeRemainingResult;
  isExpired: boolean;
  currentLifecycleStage: IntentEventType;
  
  // People stats & Etapa 5 Generic Approval Quorum
  totalParticipants: number;
  totalGuardians: number;
  approvedGuardiansCount: number;
  pendingGuardiansCount: number;
  declinedGuardiansCount: number;
  requiredApprovals: number;
  effectiveRequiredApprovals: number;
  eligibleApproversCount: number;
  quorumMode: QuorumMode;
  canStillReachQuorum: boolean;
  quorumFormulaDescription: string;
  isPeopleConditionSatisfied: boolean;

  // Etapa 7: Public Support stats & Ephemeral Reveal Window
  currentSupports: number;
  targetSupports: number;
  supportPercentage: number;
  isSupportConditionSatisfied: boolean;
  hasRevealWindow: boolean; // Se possui janela efêmera (ex: 24h)
  revealWindowHours: number; // Duração da janela
  revealStartedAt?: string; // Momento que disparou a revelação
  revealExpiresAt?: string; // Timestamp de expiração
  isRevealWindowExpired: boolean; // Se o prazo da janela pós-revelação expirou
  formattedRevealWindowCountdown: string; // Ex: "18h 42m restantes"
  
  // Etapa 5 Revelation state
  isReadyToReveal: boolean; // Quórum, tempo ou apoios públicos atingidos, pronto para disparar revelação
  isRevealed: boolean; // Se o conteúdo já foi ativamente revelado
  quorumRatioText: string; // "2/3"
  quorumPercentage: number; // 67%
  
  // Lists
  recipients: Participant[];
  guardians: Participant[];
  viewers: Participant[];
  
  // Human readable description
  statusSummary: string;
  badgeLabel: string;
  badgeColor: 'amber' | 'emerald' | 'blue' | 'slate' | 'rose' | 'indigo';
}

/**
 * Motor Genérico de Cálculo de Quórum (Etapa 5)
 * Calcula a meta de aprovações requeridas baseando-se no QuorumMode e no número de elegíveis.
 */
export function calculateEffectiveRequiredApprovals(
  eligibleCount: number,
  mode: QuorumMode = 'EXACT_N',
  explicitRequired?: number,
  percentage?: number
): { required: number; description: string } {
  const count = Math.max(0, eligibleCount);
  
  if (count === 0) {
    return { required: 1, description: 'Sem aprovadores cadastrados (1 padrão)' };
  }

  switch (mode) {
    case 'UNANIMOUS': {
      return {
        required: count,
        description: `Unanimidade (${count}/${count})`,
      };
    }
    case 'MAJORITY': {
      // Maioria Simples: > 50% (ex: 2 de 3, 3 de 5, 4 de 7)
      const majority = Math.floor(count / 2) + 1;
      return {
        required: majority,
        description: `Maioria Simples (${majority} de ${count})`,
      };
    }
    case 'SUPERMAJORITY': {
      // Maioria Qualificada 2/3 (ex: 2 de 3, 4 de 5, 4 de 6)
      const superMajority = Math.ceil((count * 2) / 3);
      return {
        required: superMajority,
        description: `Maioria Qualificada 2/3 (${superMajority} de ${count})`,
      };
    }
    case 'PERCENTAGE': {
      const pct = Math.max(1, Math.min(100, percentage || 60));
      const needed = Math.max(1, Math.ceil(count * (pct / 100)));
      return {
        required: needed,
        description: `Quórum de ${pct}% (${needed} de ${count})`,
      };
    }
    case 'EXACT_N':
    default: {
      const req = explicitRequired !== undefined && explicitRequired > 0
        ? Math.min(explicitRequired, count)
        : count;
      return {
        required: Math.max(1, req),
        description: req === count ? `Unanimidade (${req}/${count})` : `Quórum M de N (${req} de ${count})`,
      };
    }
  }
}

export function evaluateIntentConditions(intent: Intent): ConditionEvaluationResult {
  const conditionType = intent.conditions?.condition_type || intent.condition_type || 'NONE';
  const operator = intent.conditions?.operator || '>=';
  const targetDateStr = intent.conditions?.target_date || intent.conditions?.value || intent.target_date;
  const expirationDateStr = intent.conditions?.expiration_date;

  const participants = intent.people?.participants || intent.participants || [];
  
  const approvers = intent.people?.approvers || intent.approvers || participants.filter((p) => 
    p.role === 'approver' || p.role === 'guardian' || (p.roles && p.roles.includes('approver'))
  );

  const recipients = intent.people?.recipients || intent.recipients || intent.audience?.recipients || participants.filter((p) => 
    p.role === 'recipient' || (p.roles && p.roles.includes('recipient'))
  );

  const viewers = participants.filter((p) => 
    p.role === 'viewer' || p.role === 'participant' || (p.roles && p.roles.includes('participant'))
  );
  
  const approvedGuardians = approvers.filter((g) => g.status === 'approved');
  const pendingGuardians = approvers.filter((g) => g.status === 'pending');
  const declinedGuardians = approvers.filter((g) => g.status === 'declined');
  
  const totalGuardians = approvers.length;
  const approvedGuardiansCount = approvedGuardians.length;
  const pendingGuardiansCount = pendingGuardians.length;
  const declinedGuardiansCount = declinedGuardians.length;
  
  // Etapa 5: Quorum Mode e cálculo genérico
  const quorumMode: QuorumMode = intent.conditions?.quorum_mode || intent.quorum_mode || 'EXACT_N';
  const explicitRequired = intent.conditions?.required_approvals ?? intent.required_approvals;
  const explicitPercentage = intent.conditions?.quorum_percentage;

  const { required: effectiveRequiredApprovals, description: quorumFormulaDescription } =
    calculateEffectiveRequiredApprovals(
      totalGuardians,
      quorumMode,
      explicitRequired,
      explicitPercentage
    );

  const requiredApprovals = effectiveRequiredApprovals;
  const eligibleApproversCount = totalGuardians;

  // Verificação de viabilidade matemática de alcançar o quórum
  const canStillReachQuorum = (approvedGuardiansCount + pendingGuardiansCount) >= effectiveRequiredApprovals;

  const isPeopleConditionSatisfied =
    totalGuardians === 0 || approvedGuardiansCount >= effectiveRequiredApprovals;

  // Etapa 7: Public Support calculations & Reveal Window
  const currentSupports = intent.conditions?.current_supports ?? intent.current_supports ?? 10;
  const targetSupports = intent.conditions?.target_supports ?? intent.target_supports ?? 100;
  const supportPercentage = Math.min(100, Math.round((currentSupports / targetSupports) * 100));
  const isSupportConditionSatisfied = currentSupports >= targetSupports;

  // Reveal Window (Ex: 24h pós-revelação)
  const hasRevealWindow = !!(intent.reveal_window?.has_expiration || intent.reveal_window_hours || intent.conditions?.reveal_window?.has_expiration);
  const revealWindowHours = intent.reveal_window?.duration_hours || intent.reveal_window_hours || intent.conditions?.reveal_window?.duration_hours || 24;
  const revealStartedAt = intent.reveal_window?.reveal_started_at || intent.revealed_at;
  
  let revealExpiresAt = intent.reveal_window?.expires_at || intent.expires_at || intent.conditions?.reveal_window?.expires_at;
  if (!revealExpiresAt && revealStartedAt && hasRevealWindow) {
    const startMs = new Date(revealStartedAt).getTime();
    if (!isNaN(startMs)) {
      revealExpiresAt = new Date(startMs + revealWindowHours * 3600 * 1000).toISOString();
    }
  }

  let isRevealWindowExpired = false;
  let formattedRevealWindowCountdown = 'Sem expiração efêmera';
  if (hasRevealWindow && revealExpiresAt) {
    const expMs = new Date(revealExpiresAt).getTime();
    const nowMs = Date.now();
    if (!isNaN(expMs)) {
      if (nowMs >= expMs) {
        isRevealWindowExpired = true;
        formattedRevealWindowCountdown = 'Janela de 24h Expirada';
      } else {
        const diffSec = Math.floor((expMs - nowMs) / 1000);
        const remHours = Math.floor(diffSec / 3600);
        const remMinutes = Math.floor((diffSec % 3600) / 60);
        const remSeconds = diffSec % 60;
        formattedRevealWindowCountdown = `${remHours}h ${remMinutes.toString().padStart(2, '0')}m ${remSeconds.toString().padStart(2, '0')}s restantes`;
      }
    }
  }

  const timeResult = calculateTimeRemaining(intent.created_at, targetDateStr, operator, expirationDateStr);

  let isConditionSatisfied = false;
  let statusSummary = '';
  let badgeLabel = 'Sem trava';
  let badgeColor: 'amber' | 'emerald' | 'blue' | 'slate' | 'rose' | 'indigo' = 'slate';

  switch (conditionType) {
    case 'NONE':
      isConditionSatisfied = true;
      statusSummary = 'Sem condições de trava. Conteúdo liberado.';
      badgeLabel = 'Livre';
      badgeColor = 'slate';
      break;

    case 'TIME':
      isConditionSatisfied = timeResult.isMatured;
      if (timeResult.isExpired || isRevealWindowExpired) {
        statusSummary = 'A janela de revelação expirou. Conteúdo bloqueado permanentemente.';
        badgeLabel = 'Janela Expirada';
        badgeColor = 'rose';
      } else if (timeResult.isMatured) {
        statusSummary = 'Condição de tempo declarativa atingida (operator: ' + operator + '). Conteúdo pronto para revelar.';
        badgeLabel = 'Tempo Atingido';
        badgeColor = 'emerald';
      } else {
        statusSummary = `Bloqueado por tempo (${operator} ${timeResult.formattedCountdown} restantes).`;
        badgeLabel = `Tempo (${operator})`;
        badgeColor = 'amber';
      }
      break;

    case 'PEOPLE':
    case 'APPROVAL':
      isConditionSatisfied = isPeopleConditionSatisfied;
      if (!canStillReachQuorum && !isPeopleConditionSatisfied) {
        statusSummary = `Quórum inviabilizado por recusas (${declinedGuardiansCount} recusa(s)). Necessário: ${effectiveRequiredApprovals} de ${totalGuardians}.`;
        badgeLabel = `Quórum Recusado (${approvedGuardiansCount}/${effectiveRequiredApprovals})`;
        badgeColor = 'rose';
      } else if (isPeopleConditionSatisfied) {
        statusSummary = `Regra de aprovação cumprida: ${quorumFormulaDescription} (${approvedGuardiansCount}/${effectiveRequiredApprovals} assinaturas). Pronto para revelar.`;
        badgeLabel = `Aprovado (${approvedGuardiansCount}/${effectiveRequiredApprovals})`;
        badgeColor = 'emerald';
      } else {
        const remaining = Math.max(0, effectiveRequiredApprovals - approvedGuardiansCount);
        statusSummary = `Aguardando ${remaining} assinatura(s) [${quorumFormulaDescription}] — Atual: ${approvedGuardiansCount}/${effectiveRequiredApprovals}.`;
        badgeLabel = `Aprovação (${approvedGuardiansCount}/${effectiveRequiredApprovals})`;
        badgeColor = 'blue';
      }
      break;

    case 'PUBLIC_SUPPORT':
      isConditionSatisfied = isSupportConditionSatisfied;
      if (isRevealWindowExpired) {
        statusSummary = `A janela de visualização pública expirou (${revealWindowHours}h decorridas). Conteúdo fechado.`;
        badgeLabel = 'Janela Expirada';
        badgeColor = 'rose';
      } else if (isSupportConditionSatisfied) {
        statusSummary = `Meta de apoio público atingida (${currentSupports}/${targetSupports} apoios). Desbloqueio autorizado!`;
        badgeLabel = `Meta Cumprida (${currentSupports}/${targetSupports})`;
        badgeColor = 'emerald';
      } else {
        const remaining = targetSupports - currentSupports;
        statusSummary = `Faltam ${remaining} apoio(s) público(s) para atingir a meta (${currentSupports}/${targetSupports}).`;
        badgeLabel = `Apoios (${currentSupports}/${targetSupports})`;
        badgeColor = 'indigo';
      }
      break;

    case 'HYBRID':
      isConditionSatisfied = timeResult.isMatured && isPeopleConditionSatisfied && isSupportConditionSatisfied;
      if (timeResult.isExpired || isRevealWindowExpired) {
        statusSummary = 'Janela expirada no ciclo híbrido.';
        badgeLabel = 'Expirado';
        badgeColor = 'rose';
      } else if (isConditionSatisfied) {
        statusSummary = 'Tempo, quórum de guardiões e meta de apoios públicos atingidos.';
        badgeLabel = 'Condições Cumpridas';
        badgeColor = 'emerald';
      } else {
        statusSummary = `Aguardando condições híbridas (Tempo: ${timeResult.isMatured ? '✓' : '⏳'}, Aprovação: ${isPeopleConditionSatisfied ? '✓' : '⏳'}, Apoios: ${currentSupports}/${targetSupports}).`;
        badgeLabel = 'Condições Múltiplas';
        badgeColor = 'amber';
      }
      break;
  }

  const isRevealed = (!!intent.revealed_at && !isRevealWindowExpired) || (conditionType === 'NONE' && !intent.is_locked);
  const isReadyToReveal = isConditionSatisfied && !intent.revealed_at && !timeResult.isExpired && !isRevealWindowExpired;
  const quorumRatioText = `${approvedGuardiansCount}/${effectiveRequiredApprovals}`;
  const quorumPercentage =
    effectiveRequiredApprovals > 0 ? Math.min(100, Math.round((approvedGuardiansCount / effectiveRequiredApprovals) * 100)) : 100;

  // Mapeamento do estágio atual do ciclo de vida de eventos (Lifecycle Motor: CONDITION -> REVEAL_WINDOW -> EXPIRATION)
  let currentLifecycleStage: IntentEventType = 'CONDITION_CREATED';
  if (timeResult.isExpired || isRevealWindowExpired) {
    currentLifecycleStage = 'REVEAL_EXPIRED';
  } else if (isRevealed) {
    currentLifecycleStage = 'CONTENT_REVEALED';
  } else if (isReadyToReveal) {
    currentLifecycleStage = 'REVEAL_STARTED';
  } else if (isConditionSatisfied) {
    currentLifecycleStage = 'CONDITION_SATISFIED';
  } else if (intent.content?.protected_payload || intent.reveal_content) {
    currentLifecycleStage = 'CONTENT_ATTACHED';
  } else {
    currentLifecycleStage = 'INTENT_CREATED';
  }

  return {
    isConditionSatisfied,
    timeResult,
    isExpired: timeResult.isExpired || isRevealWindowExpired,
    currentLifecycleStage,
    totalParticipants: participants.length,
    totalGuardians,
    approvedGuardiansCount,
    pendingGuardiansCount,
    declinedGuardiansCount,
    requiredApprovals: effectiveRequiredApprovals,
    effectiveRequiredApprovals,
    eligibleApproversCount,
    quorumMode,
    canStillReachQuorum,
    quorumFormulaDescription,
    isPeopleConditionSatisfied,
    currentSupports,
    targetSupports,
    supportPercentage,
    isSupportConditionSatisfied,
    hasRevealWindow,
    revealWindowHours,
    revealStartedAt,
    revealExpiresAt,
    isRevealWindowExpired,
    formattedRevealWindowCountdown,
    isReadyToReveal,
    isRevealed,
    quorumRatioText,
    quorumPercentage,
    recipients,
    guardians: approvers,
    viewers,
    statusSummary,
    badgeLabel,
    badgeColor,
  };
}

export const SAMPLE_PEOPLE_PRESETS: Omit<Participant, 'id'>[] = [
  {
    name: 'Dra. Helena Voss',
    email: 'helena.voss@curadoria.org',
    role: 'guardian',
    status: 'approved',
    approved_at: new Date().toISOString(),
    notes: 'Guardiã Institucional & Validação',
  },
  {
    name: 'Carlos Mendez',
    email: 'carlos.m@fintech.io',
    role: 'guardian',
    status: 'approved',
    approved_at: new Date().toISOString(),
    notes: 'Co-fundador e Testemunha',
  },
  {
    name: 'Dra. Amanda Ribeiro',
    email: 'amanda.ribeiro@conselho.gov',
    role: 'guardian',
    status: 'pending',
    notes: 'Representante de Compliance',
  },
  {
    name: 'Mariana Duarte',
    email: 'mariana.duarte@equipe.com',
    role: 'recipient',
    status: 'pending',
    notes: 'Destinatária da Entrega Final',
  },
];
