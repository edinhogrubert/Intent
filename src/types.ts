export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  createdAt: string;
  lastLoginAt: string;
  avatarUrl?: string;
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
