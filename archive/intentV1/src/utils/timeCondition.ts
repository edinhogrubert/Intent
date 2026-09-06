import { TimeOperator } from '../types';

export interface TimeRemainingResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isMatured: boolean;
  isExpired: boolean;
  totalSecondsRemaining: number;
  progressPercent: number;
  formattedCountdown: string;
  formattedExpiration: string;
  operator: TimeOperator;
  isoValue: string;
}

export function calculateTimeRemaining(
  createdDateStr?: string,
  targetDateStr?: string,
  operator: TimeOperator = '>=',
  expirationDateStr?: string
): TimeRemainingResult {
  if (!targetDateStr) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isMatured: true,
      isExpired: false,
      totalSecondsRemaining: 0,
      progressPercent: 100,
      formattedCountdown: 'Sem trava de tempo',
      formattedExpiration: 'Sem expiração',
      operator: '>=',
      isoValue: new Date().toISOString(),
    };
  }

  const now = Date.now();
  const targetDateObj = new Date(targetDateStr);
  const target = targetDateObj.getTime();
  const created = createdDateStr ? new Date(createdDateStr).getTime() : now;
  const isoValue = isNaN(target) ? targetDateStr : targetDateObj.toISOString();

  // Verificar se a intenção expirou por extrapolar a janela de revelação (ex: expirationDateStr)
  let isExpired = false;
  let formattedExpiration = 'Sem expiração estipulada';
  if (expirationDateStr) {
    const expiration = new Date(expirationDateStr).getTime();
    if (!isNaN(expiration) && now > expiration) {
      isExpired = true;
      formattedExpiration = 'REVEAL_EXPIRED (Janela Expirada)';
    } else if (!isNaN(expiration)) {
      const expDiffSec = Math.floor((expiration - now) / 1000);
      const expDays = Math.floor(expDiffSec / (3600 * 24));
      const expHours = Math.floor((expDiffSec % (3600 * 24)) / 3600);
      formattedExpiration = `Expira em ${expDays}d ${expHours}h (${new Date(expirationDateStr).toLocaleDateString('pt-BR')})`;
    }
  }

  const diffMs = target - now;
  let isMatured = false;

  // Avaliação baseada no operador declarativo
  if (operator === '>=') {
    isMatured = diffMs <= 0;
  } else if (operator === '<=') {
    isMatured = diffMs >= 0;
  } else {
    isMatured = diffMs <= 0;
  }

  if (isMatured) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isMatured: true,
      isExpired,
      totalSecondsRemaining: 0,
      progressPercent: 100,
      formattedCountdown: isExpired ? 'EXPIRADO (Janela Ultrapassada)' : 'CONDIÇÃO SATISFEITA (Tempo Atingido)',
      formattedExpiration,
      operator,
      isoValue,
    };
  }

  const totalDuration = Math.max(1000, target - created);
  const elapsed = Math.max(0, now - created);
  const progressPercent = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));

  const totalSecondsRemaining = Math.floor(Math.abs(diffMs) / 1000);
  const days = Math.floor(totalSecondsRemaining / (3600 * 24));
  const hours = Math.floor((totalSecondsRemaining % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSecondsRemaining % 3600) / 60);
  const seconds = Math.floor(totalSecondsRemaining % 60);

  let formatted = '';
  if (days > 0) {
    formatted = `${days}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`;
  } else if (hours > 0) {
    formatted = `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  } else {
    formatted = `${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  }

  return {
    days,
    hours,
    minutes,
    seconds,
    isMatured: false,
    isExpired,
    totalSecondsRemaining,
    progressPercent,
    formattedCountdown: formatted,
    formattedExpiration,
    operator,
    isoValue,
  };
}

export function formatTargetDateTime(dateStr?: string): string {
  if (!dateStr) return 'Não definida';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export interface TimePreset {
  label: string;
  getDate: () => string;
}

export const TIME_PRESETS: TimePreset[] = [
  {
    label: '+2 minutos (Teste Rápido)',
    getDate: () => new Date(Date.now() + 2 * 60 * 1000).toISOString(),
  },
  {
    label: '+1 hora',
    getDate: () => new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  },
  {
    label: 'Amanhã (24h)',
    getDate: () => new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    label: 'Em 7 dias',
    getDate: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    label: 'Em 30 dias',
    getDate: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
