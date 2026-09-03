import { describe, expect, it } from 'vitest';
import { openReveal, sealReveal } from '../src/domain/reveal-crypto.js';

describe('reveal crypto', () => {
  const key = Buffer.alloc(32, 7);

  it('cifra e recupera o conteúdo com o mesmo contexto', () => {
    const sealed = sealReveal('resultado secreto', key, 'intent:1:reveal:v1');
    expect(sealed.ciphertext).not.toContain('resultado secreto');
    expect(openReveal(sealed, key, 'intent:1:reveal:v1')).toBe('resultado secreto');
  });

  it('rejeita abertura em outro contexto', () => {
    const sealed = sealReveal('resultado secreto', key, 'intent:1:reveal:v1');
    expect(() => openReveal(sealed, key, 'intent:2:reveal:v1')).toThrow();
  });
});
