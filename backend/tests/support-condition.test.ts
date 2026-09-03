import { describe, expect, it } from 'vitest';
import { isSupportConditionSatisfied } from '../src/domain/support-condition.js';

describe('support condition', () => {
  it('não realiza antes da meta', () => {
    expect(isSupportConditionSatisfied(9, 10)).toBe(false);
  });

  it('realiza ao alcançar a meta', () => {
    expect(isSupportConditionSatisfied(10, 10)).toBe(true);
  });

  it('permanece satisfeita acima da meta', () => {
    expect(isSupportConditionSatisfied(11, 10)).toBe(true);
  });

  it('rejeita meta inválida', () => {
    expect(() => isSupportConditionSatisfied(0, 0)).toThrow();
  });
});
