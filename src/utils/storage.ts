import { Intent, UserAccount } from '../types';

export const STORAGE_USERS_KEY = 'portal_app_users';
export const STORAGE_CURRENT_USER_KEY = 'portal_app_current_user';
export const LOCAL_STORAGE_INTENTS_KEY = 'portal_app_local_intents';

export interface UserActivitySummary {
  createdIntentsCount: number;
  participatedIntentsCount: number;
  receivedIntentsCount: number;
  totalLogsCount: number;
  createdIntentsList: Intent[];
  participatedIntentsList: Intent[];
}

export function getUserActivityFromStorage(user: UserAccount): UserActivitySummary {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_INTENTS_KEY);
    let allIntents: Intent[] = [];
    if (raw) {
      allIntents = JSON.parse(raw);
    }

    const userId = user.id;
    const userNameLower = (user.name || '').toLowerCase();
    const userEmailLower = (user.email || '').toLowerCase();

    // Intents criadas pelo usuário
    const createdIntentsList = allIntents.filter((intent) => {
      if (!intent.creator_id) return false;
      return (
        intent.creator_id === userId ||
        (userEmailLower && intent.creator_id.toLowerCase() === userEmailLower)
      );
    });

    // Intents onde o usuário participa (como Guardião, destinatário ou participante)
    const participatedIntentsList = allIntents.filter((intent) => {
      const allParticipants = [
        ...(intent.participants || []),
        ...(intent.people?.approvers || []),
        ...(intent.people?.recipients || []),
        ...(intent.people?.participants || []),
      ];
      if (allParticipants.length === 0) return false;
      return allParticipants.some((p) => {
        const nameMatch = p.name && p.name.toLowerCase() === userNameLower;
        const emailMatch = p.email && p.email.toLowerCase() === userEmailLower;
        const idMatch = p.id === userId;
        return nameMatch || emailMatch || idMatch;
      });
    });

    // Intents recebidas (papel de recipient)
    const receivedIntentsList = allIntents.filter((intent) => {
      const allParticipants = [
        ...(intent.participants || []),
        ...(intent.people?.recipients || []),
      ];
      return allParticipants.some((p) => {
        const isRecipient = p.role === 'recipient';
        const nameMatch = p.name && p.name.toLowerCase() === userNameLower;
        const emailMatch = p.email && p.email.toLowerCase() === userEmailLower;
        const idMatch = p.id === userId;
        return isRecipient && (nameMatch || emailMatch || idMatch);
      });
    });

    const totalLogsCount = allIntents.reduce(
      (acc, curr) => acc + (curr.history_logs?.length || 0),
      0
    );

    // Se a lista no storage estiver vazia (primeira execução), fornecer contagens padrão consistentes
    const finalCreatedCount = Math.max(createdIntentsList.length, raw ? createdIntentsList.length : 3);
    const finalParticipatedCount = Math.max(participatedIntentsList.length, raw ? participatedIntentsList.length : 3);

    return {
      createdIntentsCount: finalCreatedCount,
      participatedIntentsCount: finalParticipatedCount,
      receivedIntentsCount: Math.max(receivedIntentsList.length, raw ? receivedIntentsList.length : 1),
      totalLogsCount: Math.max(totalLogsCount, 8),
      createdIntentsList,
      participatedIntentsList,
    };
  } catch (e) {
    console.error('Erro ao recuperar atividade do storage:', e);
    return {
      createdIntentsCount: 3,
      participatedIntentsCount: 3,
      receivedIntentsCount: 1,
      totalLogsCount: 8,
      createdIntentsList: [],
      participatedIntentsList: [],
    };
  }
}

export function createDefaultUserFields(
  base: Partial<UserAccount> & { id: string; name: string; email: string }
): UserAccount {
  const cleanName = base.name.trim();
  const defaultUsername = base.username
    ? base.username
    : '@' + cleanName.toLowerCase().replace(/\s+/g, '_');

  return {
    id: base.id,
    name: cleanName,
    username: defaultUsername,
    email: base.email.trim().toLowerCase(),
    password: base.password || '123',
    avatarUrl: base.avatarUrl || undefined,
    bio: base.bio || 'Membro do Portal Intent e Guardião de Dados.',
    createdAt: base.createdAt || new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    status: base.status || 'active',
    configuracoes: base.configuracoes || {
      theme: 'light',
      notificationsEnabled: true,
      privacyLevel: 'public',
      emailAlerts: true,
    },
    relacionamentos: base.relacionamentos || {
      intentsCriadasCount: 2,
      intentsRecebidasCount: 1,
      intentsParticipadasCount: 3,
      historicoCount: 8,
      seguidoresCount: 4,
      seguindoCount: 5,
      seguidoresList: ['Dra. Helena Voss', 'Carlos Mendez', 'Dra. Amanda Ribeiro', 'Lucas M.'],
      seguindoList: ['Dra. Helena Voss', 'Carlos Mendez', 'Beatriz Costa', 'Gabriel Rocha', 'Marcio Silva'],
      reputacao: {
        pontos: 150,
        nivel: 'Membro Ativo — Nível 1',
        selo: '🛡️ Guardião Verificado',
      },
    },
  };
}

export function getStoredUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      const defaultUser = createDefaultUserFields({
        id: 'usr-1',
        name: 'Rafael',
        email: 'rafael@exemplo.com',
        password: '123',
      });
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify([defaultUser]));
      return [defaultUser];
    }
    const parsed: UserAccount[] = JSON.parse(raw);
    return parsed.map((u) => createDefaultUserFields(u));
  } catch {
    return [];
  }
}

export function getCurrentSessionUser(): UserAccount | null {
  try {
    const raw = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return createDefaultUserFields(parsed);
  } catch {
    return null;
  }
}

export function setCurrentSessionUser(user: UserAccount | null): void {
  if (user) {
    const enriched = createDefaultUserFields(user);
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(enriched));
    const users = getStoredUsers();
    const existingIndex = users.findIndex(
      (u) => u.email.toLowerCase() === enriched.email.toLowerCase() || u.id === enriched.id
    );
    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...enriched, lastLoginAt: new Date().toISOString() };
    } else {
      users.push(enriched);
    }
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } else {
    localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
  }
}

export function updateUserProfile(userId: string, updates: Partial<UserAccount>): UserAccount {
  const current = getCurrentSessionUser();
  const users = getStoredUsers();

  const userIndex = users.findIndex((u) => u.id === userId);
  const existing = userIndex >= 0 ? users[userIndex] : current;

  if (!existing) {
    throw new Error('Usuário não encontrado para atualização.');
  }

  const updated: UserAccount = createDefaultUserFields({
    ...existing,
    ...updates,
    configuracoes: {
      ...existing.configuracoes,
      ...updates.configuracoes,
    },
    relacionamentos: {
      ...existing.relacionamentos,
      ...updates.relacionamentos,
    },
  });

  if (userIndex >= 0) {
    users[userIndex] = updated;
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  }

  if (current && current.id === userId) {
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(updated));
  }

  return updated;
}

export function registerNewUser(
  name: string,
  email: string,
  password?: string,
  firebaseUid?: string,
  username?: string,
  bio?: string
): UserAccount {
  const users = getStoredUsers();
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (existing) {
    throw new Error('Já existe uma conta cadastrada com este e-mail.');
  }

  const newUser = createDefaultUserFields({
    id: firebaseUid || 'usr-' + Date.now(),
    name: name.trim(),
    username: username || '@' + name.trim().toLowerCase().replace(/\s+/g, '_'),
    email: email.trim().toLowerCase(),
    password: password || '123',
    bio: bio || 'Novo participante do Portal Intent.',
  });

  users.push(newUser);
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  setCurrentSessionUser(newUser);
  return newUser;
}

export function loginUser(email: string, password?: string, firebaseUid?: string): UserAccount {
  const users = getStoredUsers();
  const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

  if (!found) {
    const newUser = createDefaultUserFields({
      id: firebaseUid || 'usr-' + Date.now(),
      name: email.split('@')[0] || 'Usuário',
      email: email.trim().toLowerCase(),
      password: password || '123',
    });
    users.push(newUser);
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
    setCurrentSessionUser(newUser);
    return newUser;
  }

  if (password && found.password && found.password !== password) {
    throw new Error('Senha incorreta.');
  }

  const updatedUser = createDefaultUserFields({
    ...found,
    id: firebaseUid || found.id,
    lastLoginAt: new Date().toISOString(),
  });
  setCurrentSessionUser(updatedUser);
  return updatedUser;
}

export function logoutUser(): void {
  setCurrentSessionUser(null);
}

export function deleteUserAccount(userId: string): void {
  const users = getStoredUsers();
  const filtered = users.filter((u) => u.id !== userId);
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(filtered));
  setCurrentSessionUser(null);
}

