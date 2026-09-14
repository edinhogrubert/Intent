import { describe, expect, it } from 'vitest';
import { createCommentSchema } from '../src/domain/comment-schemas.js';

describe('createCommentSchema', () => {
  it('remove espaços externos e aceita de 1 a 500 caracteres úteis', () => {
    expect(createCommentSchema.parse({ body: '  comentário  ' })).toEqual({ body: 'comentário' });
    expect(createCommentSchema.parse({ body: 'x'.repeat(500) }).body).toHaveLength(500);
  });

  it.each([
    {},
    { body: '' },
    { body: '   ' },
    { body: 'x'.repeat(501) },
    { body: 'válido', authorId: '10000000-0000-4000-8000-000000000001' },
    { body: 'válido', intentId: '20000000-0000-4000-8000-000000000001' },
    { body: 'válido', extra: true },
  ])('rejeita payload inválido ou com campo externo: %j', (payload) => {
    expect(() => createCommentSchema.parse(payload)).toThrow();
  });
});
