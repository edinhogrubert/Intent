import type { User as FirebaseUser } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { createDefaultUserFields, getCurrentSessionUser, setCurrentSessionUser } from '../utils/storage';
import type { UserAccount } from '../types';

const API_PREFIX = '/api';

interface ApiEnvelope<T> { data: T }
interface ApiErrorEnvelope { error?: { code?: string; message?: string; requestId?: string } }

interface ApiUser {
  id: string;
  firebaseUid: string;
  email: string | null;
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export type IntentCategory =
  | 'SPORTS'
  | 'ENTERTAINMENT'
  | 'TECHNOLOGY'
  | 'EDUCATION'
  | 'HEALTH_WELLNESS'
  | 'CAREER_BUSINESS'
  | 'COMMUNITY_CAUSES'
  | 'PERSONAL_LIFE'
  | 'OTHER';

export interface ApiIntent {
  id: string;
  type: 'SUPPORT_REVEAL';
  status: 'PUBLISHED' | 'REALIZED';
  visibility: 'PUBLIC' | 'FOLLOWERS' | 'PRIVATE';
  category: IntentCategory;
  title: string;
  story: string;
  supportGoal: number;
  supportCount: number;
  publishedAt: string;
  realizedAt: string | null;
  createdAt: string;
  creator: { id: string; username: string; displayName: string; avatarUrl: string | null };
}

export interface CreateSupportIntentInput {
  title: string;
  story: string;
  category: IntentCategory;
  supportGoal: number;
  revealContent: string;
  visibility: 'PUBLIC' | 'FOLLOWERS';
}

export class IntentApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly code: string, public readonly requestId?: string) {
    super(message);
    this.name = 'IntentApiError';
  }
}

async function authenticatedRequest<T>(path: string, init: RequestInit = {}, firebaseUser: FirebaseUser | null = auth.currentUser): Promise<T> {
  if (!firebaseUser) throw new IntentApiError('Entre na sua conta para continuar.', 401, 'AUTH_REQUIRED');

  const token = await firebaseUser.getIdToken();
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);
  headers.set('Accept', 'application/json');
  if (init.body !== undefined && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  const response = await fetch(`${API_PREFIX}${path}`, { ...init, headers });
  if (!response.ok) {
    let payload: ApiErrorEnvelope = {};
    try { payload = await response.json() as ApiErrorEnvelope; } catch { /* resposta não JSON */ }
    throw new IntentApiError(
      payload.error?.message || 'Não foi possível comunicar com o Intent.',
      response.status,
      payload.error?.code || 'API_ERROR',
      payload.error?.requestId,
    );
  }
  return response.json() as Promise<T>;
}

function mapApiUser(user: ApiUser): UserAccount {
  const cached = getCurrentSessionUser();
  const status: UserAccount['status'] = user.status === 'SUSPENDED' ? 'suspended' : user.status === 'INACTIVE' ? 'inactive' : 'active';
  return createDefaultUserFields({
    ...(cached?.id === user.id ? cached : {}),
    id: user.id,
    name: user.displayName,
    username: user.username.replace(/^@+/, ''),
    email: user.email || '',
    avatarUrl: user.avatarUrl || undefined,
    bio: user.bio || undefined,
    createdAt: user.createdAt,
    status,
  });
}

export async function syncAuthenticatedUser(firebaseUser: FirebaseUser | null = auth.currentUser): Promise<UserAccount> {
  const result = await authenticatedRequest<ApiEnvelope<ApiUser>>('/v1/users/me/sync', { method: 'POST' }, firebaseUser);
  const account = mapApiUser(result.data);
  setCurrentSessionUser(account);
  return account;
}

export async function getAuthenticatedProfile(): Promise<UserAccount> {
  const result = await authenticatedRequest<ApiEnvelope<ApiUser>>('/v1/users/me');
  const account = mapApiUser(result.data);
  setCurrentSessionUser(account);
  return account;
}

export async function createSupportIntent(input: CreateSupportIntentInput): Promise<ApiIntent> {
  const result = await authenticatedRequest<ApiEnvelope<ApiIntent>>('/v1/intents', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return result.data;
}

export async function listMyIntents(): Promise<{ items: ApiIntent[]; nextCursor: string | null }> {
  const result = await authenticatedRequest<ApiEnvelope<{ items: ApiIntent[]; nextCursor: string | null }>>('/v1/intents/mine');
  return result.data;
}

export { authenticatedRequest };
