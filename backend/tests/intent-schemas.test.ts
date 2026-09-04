import { describe, expect, it } from 'vitest';
import { createIntentSchema } from '../src/domain/intent-schemas.js';

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
