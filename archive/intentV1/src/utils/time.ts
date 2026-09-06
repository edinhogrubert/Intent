import { GreetingConfig, TimeOfDay } from '../types';

export function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 12) {
    return 'morning';
  } else if (hour >= 12 && hour < 18) {
    return 'afternoon';
  } else {
    return 'night';
  }
}

export function getGreetingConfig(hour: number): GreetingConfig {
  const period = getTimeOfDay(hour);

  switch (period) {
    case 'morning':
      return {
        period: 'morning',
        buttonText: 'Bom dia',
        heading: 'Bom dia',
        description: 'Tenha uma manhã produtiva e iluminada!',
        iconName: 'Sun',
        timeRange: '05:00 às 11:59',
        accentColor: '#0055FF',
        badgeBg: '#E2EDFF',
      };
    case 'afternoon':
      return {
        period: 'afternoon',
        buttonText: 'Boa tarde',
        heading: 'Boa tarde',
        description: 'Esperamos que sua tarde esteja sendo excelente!',
        iconName: 'SunMedium',
        timeRange: '12:00 às 17:59',
        accentColor: '#0055FF',
        badgeBg: '#E2EDFF',
      };
    case 'night':
      return {
        period: 'night',
        buttonText: 'Boa noite',
        heading: 'Boa noite',
        description: 'Aproveite para descansar e recarregar as energias.',
        iconName: 'Moon',
        timeRange: '18:00 às 04:59',
        accentColor: '#0055FF',
        badgeBg: '#E2EDFF',
      };
  }
}

export function formatCurrentDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatTime(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
}
