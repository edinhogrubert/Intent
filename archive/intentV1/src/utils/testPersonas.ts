import { UserAccount } from '../types';
import { createDefaultUserFields, setCurrentSessionUser } from './storage';

export interface TestPersona {
  id: string;
  name: string;
  email: string;
  roleDescription: string;
  badge: string;
  avatarColor: string;
}

export const PRESET_TEST_PERSONAS: TestPersona[] = [
  {
    id: 'usr-1',
    name: 'Rafael Silva',
    email: 'rafael@exemplo.com',
    roleDescription: 'Criador Padrão do Sistema',
    badge: '👑 Autor',
    avatarColor: 'bg-blue-600',
  },
  {
    id: 'rec-1',
    name: 'João Silva',
    email: 'joao@silva.com',
    roleDescription: 'Destinatário Exclusivo (Documento do Conselho)',
    badge: '🎯 Destinatário',
    avatarColor: 'bg-emerald-600',
  },
  {
    id: 'app-1',
    name: 'Flávio',
    email: 'flavio@conselho.org',
    roleDescription: 'Conselheiro (Aprovador #1)',
    badge: '🛡️ Aprovador 1',
    avatarColor: 'bg-amber-600',
  },
  {
    id: 'app-2',
    name: 'Fernando',
    email: 'fernando@conselho.org',
    roleDescription: 'Compliance (Aprovador #2)',
    badge: '🛡️ Aprovador 2',
    avatarColor: 'bg-indigo-600',
  },
  {
    id: 'app-3',
    name: 'Maria',
    email: 'maria@conselho.org',
    roleDescription: 'Jurídica (Aprovadora #3)',
    badge: '🛡️ Aprovador 3',
    avatarColor: 'bg-purple-600',
  },
  {
    id: 'usr-escola',
    name: 'Escola / Banca de Concurso',
    email: 'escola@concurso.org',
    roleDescription: 'Instituição / Emissora de Boletim e Edital',
    badge: '🎓 Instituição',
    avatarColor: 'bg-teal-600',
  },
];

export function createGuestUser(): UserAccount {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const guestId = 'usr-guest-' + Math.random().toString(36).substring(2, 9);
  const guestName = `Visitante Temporário #${randomNum}`;
  const guestEmail = `testador_${randomNum}@intent.app`;

  const guestUser = createDefaultUserFields({
    id: guestId,
    name: guestName,
    email: guestEmail,
    username: `@visitante_${randomNum}`,
    bio: 'Testador aleatório em sessão temporária instantânea (sem cadastro).',
  });

  setCurrentSessionUser(guestUser);
  return guestUser;
}

export function switchPersona(persona: TestPersona): UserAccount {
  const user = createDefaultUserFields({
    id: persona.id,
    name: persona.name,
    email: persona.email,
    username: '@' + persona.name.toLowerCase().replace(/\s+/g, '_'),
    bio: `${persona.roleDescription} (Sessão de Teste em 1 Clique).`,
  });

  setCurrentSessionUser(user);
  return user;
}
