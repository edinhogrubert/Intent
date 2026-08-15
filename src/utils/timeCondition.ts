export interface TimeRemainingResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isMatured: boolean;
  totalSecondsRemaining: number;
  progressPercent: number;
  formattedCountdown: string;
}

export function calculateTimeRemaining(
  createdDateStr?: string,
  targetDateStr?: string
): TimeRemainingResult {
  if (!targetDateStr) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isMatured: true,
      totalSecondsRemaining: 0,
      progressPercent: 100,
      formattedCountdown: 'Sem trava de tempo',
    };
  }

  const now = new Date().getTime();
  const target = new Date(targetDateStr).getTime();
  const created = createdDateStr ? new Date(createdDateStr).getTime() : now;

  const diffMs = target - now;

  if (diffMs <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isMatured: true,
      totalSecondsRemaining: 0,
      progressPercent: 100,
      formattedCountdown: 'Condição de Tempo Atingida (Revelado)',
    };
  }

  const totalDuration = Math.max(1000, target - created);
  const elapsed = Math.max(0, now - created);
  const progressPercent = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));

  const totalSecondsRemaining = Math.floor(diffMs / 1000);
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
    totalSecondsRemaining,
    progressPercent,
    formattedCountdown: formatted,
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
