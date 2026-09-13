import { describe, expect, it } from 'vitest';
import { createIntentSchema, updateProfileSchema } from '../src/domain/intent-schemas.js';

const validIntent = {
  title: 'Palpite para o jogo',
  story: 'Vou revelar meu palpite quando a meta for atingida.',
  category: 'SPORTS',
  supportGoal: 6,
  revealContent: 'Meu palpite foi 2 a 1.',
  visibility: 'PUBLIC',
};

describe('createIntentSchema', () => {
  it('aceita qualquer meta inteira positiva, inclusive 1 e 6', () => {
    expect(createIntentSchema.parse({ ...validIntent, supportGoal: 1 }).supportGoal).toBe(1);
    expect(createIntentSchema.parse({ ...validIntent, supportGoal: 6 }).supportGoal).toBe(6);
  });

  it('aceita a categoria Esportes', () => {
    expect(createIntentSchema.parse(validIntent).category).toBe('SPORTS');
  });

  it('recusa zero, frações e categorias desconhecidas', () => {
    expect(createIntentSchema.safeParse({ ...validIntent, supportGoal: 0 }).success).toBe(false);
    expect(createIntentSchema.safeParse({ ...validIntent, supportGoal: 1.5 }).success).toBe(false);
    expect(createIntentSchema.safeParse({ ...validIntent, category: 'INVALID' }).success).toBe(false);
  });
});

describe('updateProfileSchema', () => {
  it('aceita somente os três campos editáveis do perfil', () => {
    expect(updateProfileSchema.parse({
      displayName: 'Nome público',
      bio: 'Uma bio curta.',
      avatarUrl: 'https://example.com/avatar.png',
    })).toEqual({
      displayName: 'Nome público',
      bio: 'Uma bio curta.',
      avatarUrl: 'https://example.com/avatar.png',
    });
  });

  it.each(['username', 'email', 'status', 'passwordHash', 'firebaseUid', 'metrics', 'id', 'userId'])(
    'rejeita o campo protegido %s',
    (field) => {
      expect(updateProfileSchema.safeParse({ [field]: 'valor' }).success).toBe(false);
    },
  );

  it('rejeita payload vazio e rejeita por inteiro payload misto', () => {
    expect(updateProfileSchema.safeParse({}).success).toBe(false);
    expect(updateProfileSchema.safeParse({ displayName: 'Novo nome', username: 'novo_username' }).success).toBe(false);
  });
});
