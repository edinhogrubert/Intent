import { Intent, Participant } from '../types';
import { calculateTimeRemaining, TimeRemainingResult } from './timeCondition';

export interface ConditionEvaluationResult {
  isConditionSatisfied: boolean;
  timeResult: TimeRemainingResult;
  
  // People stats & Etapa 5 Quorum
  totalParticipants: number;
  totalGuardians: number;
  approvedGuardiansCount: number;
  pendingGuardiansCount: number;
  declinedGuardiansCount: number;
  requiredApprovals: number;
  isPeopleConditionSatisfied: boolean;
  
  // Etapa 5 Revelation state
  isReadyToReveal: boolean; // Quórum e/ou tempo atingido, pronto para disparar revelação
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
  badgeColor: 'amber' | 'emerald' | 'blue' | 'slate' | 'rose';
}

export function evaluateIntentConditions(intent: Intent): ConditionEvaluationResult {
  const conditionType = intent.condition_type || 'NONE';
  const participants = intent.participants || [];
  
  const recipients = participants.filter((p) => p.role === 'recipient');
  const guardians = participants.filter((p) => p.role === 'guardian');
  const viewers = participants.filter((p) => p.role === 'viewer');
  
  const approvedGuardians = guardians.filter((g) => g.status === 'approved');
  const pendingGuardians = guardians.filter((g) => g.status === 'pending');
  const declinedGuardians = guardians.filter((g) => g.status === 'declined');
  
  const totalGuardians = guardians.length;
  const approvedGuardiansCount = approvedGuardians.length;
  const pendingGuardiansCount = pendingGuardians.length;
  const declinedGuardiansCount = declinedGuardians.length;
  
  const requiredApprovals =
    intent.required_approvals !== undefined && intent.required_approvals > 0
      ? intent.required_approvals
      : Math.max(1, totalGuardians);

  const isPeopleConditionSatisfied =
    totalGuardians === 0 || approvedGuardiansCount >= requiredApprovals;

  const timeResult = calculateTimeRemaining(intent.created_at, intent.target_date);

  let isConditionSatisfied = false;
  let statusSummary = '';
  let badgeLabel = 'Sem trava';
  let badgeColor: 'amber' | 'emerald' | 'blue' | 'slate' | 'rose' = 'slate';

  switch (conditionType) {
    case 'NONE':
      isConditionSatisfied = true;
      statusSummary = 'Sem condições de trava. Conteúdo liberado.';
      badgeLabel = 'Livre';
      badgeColor = 'slate';
      break;

    case 'TIME':
      isConditionSatisfied = timeResult.isMatured;
      if (timeResult.isMatured) {
        statusSummary = 'Condição de tempo atingida. Conteúdo desbloqueado.';
        badgeLabel = 'Tempo Atingido';
        badgeColor = 'emerald';
      } else {
        statusSummary = `Bloqueado por tempo (${timeResult.formattedCountdown} restantes).`;
        badgeLabel = 'Trava de Tempo';
        badgeColor = 'amber';
      }
      break;

    case 'PEOPLE':
      isConditionSatisfied = isPeopleConditionSatisfied;
      if (isPeopleConditionSatisfied) {
        statusSummary = `Quórum de aprovação atingido (${approvedGuardiansCount}/${requiredApprovals} guardiões). Pronto para revelar.`;
        badgeLabel = `Quórum Atingido (${approvedGuardiansCount}/${requiredApprovals})`;
        badgeColor = 'emerald';
      } else {
        const remaining = Math.max(0, requiredApprovals - approvedGuardiansCount);
        statusSummary = `Aguardando ${remaining} assinatura(s) de guardiões (${approvedGuardiansCount}/${requiredApprovals} aprovados).`;
        badgeLabel = `Aprovação (${approvedGuardiansCount}/${requiredApprovals})`;
        badgeColor = 'blue';
      }
      break;

    case 'HYBRID':
      isConditionSatisfied = timeResult.isMatured && isPeopleConditionSatisfied;
      if (isConditionSatisfied) {
        statusSummary = 'Tempo decorrido e quórum de guardiões atingido.';
        badgeLabel = 'Condições Cumpridas';
        badgeColor = 'emerald';
      } else if (!timeResult.isMatured && !isPeopleConditionSatisfied) {
        statusSummary = `Aguardando tempo (${timeResult.formattedCountdown}) e guardiões (${approvedGuardiansCount}/${requiredApprovals}).`;
        badgeLabel = 'Tempo + Guardiões';
        badgeColor = 'amber';
      } else if (!timeResult.isMatured) {
        statusSummary = `Guardiões aprovaram! Aguardando apenas o tempo (${timeResult.formattedCountdown}).`;
        badgeLabel = 'Aguardando Tempo';
        badgeColor = 'amber';
      } else {
        statusSummary = `Tempo atingido! Aguardando guardiões (${approvedGuardiansCount}/${requiredApprovals}).`;
        badgeLabel = 'Aguardando Guardiões';
        badgeColor = 'blue';
      }
      break;
  }

  const isRevealed = !!intent.revealed_at || (conditionType === 'NONE' && !intent.is_locked);
  const isReadyToReveal = isConditionSatisfied && !isRevealed;
  const quorumRatioText = `${approvedGuardiansCount}/${requiredApprovals}`;
  const quorumPercentage =
    requiredApprovals > 0 ? Math.min(100, Math.round((approvedGuardiansCount / requiredApprovals) * 100)) : 100;

  return {
    isConditionSatisfied,
    timeResult,
    totalParticipants: participants.length,
    totalGuardians,
    approvedGuardiansCount,
    pendingGuardiansCount,
    declinedGuardiansCount,
    requiredApprovals,
    isPeopleConditionSatisfied,
    isReadyToReveal,
    isRevealed,
    quorumRatioText,
    quorumPercentage,
    recipients,
    guardians,
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
