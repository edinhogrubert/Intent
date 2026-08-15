import { UserAccount } from '../types';

const STORAGE_USERS_KEY = 'portal_app_users';
const STORAGE_CURRENT_USER_KEY = 'portal_app_current_user';

export function getStoredUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      const defaultUser: UserAccount = {
        id: 'usr-1',
        name: 'Rafael',
        email: 'rafael@exemplo.com',
        password: '123',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify([defaultUser]));
      return [defaultUser];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function getCurrentSessionUser(): UserAccount | null {
  try {
    const raw = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCurrentSessionUser(user: UserAccount | null): void {
  if (user) {
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(user));
    const users = getStoredUsers();
    const existingIndex = users.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase() || u.id === user.id);
    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...user, lastLoginAt: new Date().toISOString() };
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } else {
    localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
  }
}

export function registerNewUser(name: string, email: string, password?: string, firebaseUid?: string): UserAccount {
  const users = getStoredUsers();
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  
  if (existing) {
    throw new Error('Já existe uma conta cadastrada com este e-mail.');
  }

  const newUser: UserAccount = {
    id: firebaseUid || 'usr-' + Date.now(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: password || '123',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  setCurrentSessionUser(newUser);
  return newUser;
}

export function loginUser(email: string, password?: string, firebaseUid?: string): UserAccount {
  const users = getStoredUsers();
  const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  
  if (!found) {
    // If not found, automatically register for a smooth dev experience
    const newUser: UserAccount = {
      id: firebaseUid || 'usr-' + Date.now(),
      name: email.split('@')[0] || 'Usuário',
      email: email.trim().toLowerCase(),
      password: password || '123',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    users.push(newUser);
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
    setCurrentSessionUser(newUser);
    return newUser;
  }

  if (password && found.password && found.password !== password) {
    throw new Error('Senha incorreta.');
  }

  const updatedUser = {
    ...found,
    id: firebaseUid || found.id,
    lastLoginAt: new Date().toISOString(),
  };
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
