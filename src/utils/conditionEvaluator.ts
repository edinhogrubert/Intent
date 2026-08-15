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

  // Etapa 7: Public Support stats
  currentSupports: number;
  targetSupports: number;
  supportPercentage: number;
  isSupportConditionSatisfied: boolean;
  
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

  // Etapa 7 Public Support calculations
  const currentSupports = intent.current_supports ?? 10;
  const targetSupports = intent.target_supports ?? 100;
  const supportPercentage = Math.min(100, Math.round((currentSupports / targetSupports) * 100));
  const isSupportConditionSatisfied = currentSupports >= targetSupports;

  const timeResult = calculateTimeRemaining(intent.created_at, intent.target_date);

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

    case 'PUBLIC_SUPPORT':
      isConditionSatisfied = isSupportConditionSatisfied;
      if (isSupportConditionSatisfied) {
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
      if (isConditionSatisfied) {
        statusSummary = 'Tempo, quórum de guardiões e meta de apoios públicos atingidos.';
        badgeLabel = 'Condições Cumpridas';
        badgeColor = 'emerald';
      } else {
        statusSummary = `Aguardando condições híbridas (Tempo: ${timeResult.isMatured ? '✓' : '⏳'}, Guardiões: ${isPeopleConditionSatisfied ? '✓' : '⏳'}, Apoios: ${currentSupports}/${targetSupports}).`;
        badgeLabel = 'Condições Múltiplas';
        badgeColor = 'amber';
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
    currentSupports,
    targetSupports,
    supportPercentage,
    isSupportConditionSatisfied,
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
