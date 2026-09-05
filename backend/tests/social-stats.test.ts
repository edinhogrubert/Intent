import { describe, expect, it } from 'vitest';
import { calculateRealizationRate } from '../src/services/social-service.js';

describe('calculateRealizationRate', () => {
  it('returns zero when the user has not created intents', () => {
    expect(calculateRealizationRate(0, 0)).toBe(0);
  });

  it('calculates a rounded percentage from real totals', () => {
    expect(calculateRealizationRate(3, 2)).toBe(67);
  });

  it('returns one hundred when every intent was realized', () => {
    expect(calculateRealizationRate(4, 4)).toBe(100);
  });
});
