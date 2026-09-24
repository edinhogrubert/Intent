import { describe, expect, it } from 'vitest';
import { deriveAchievements } from '../src/services/public-profile-service.js';

describe('Bloco 37A — conquistas objetivas', () => {
  it('não cria conquistas sem atividade pública', () => {
    expect(deriveAchievements({ intentsCreated: 0, intentsRealized: 0, realizedParticipationsCount: 0 })).toEqual([]);
  });

  it('deriva marcos estáveis sem inventar datas', () => {
    const achievements = deriveAchievements({ intentsCreated: 10, intentsRealized: 10, realizedParticipationsCount: 1 });
    expect(achievements.map(({ id }) => id)).toEqual([
      'first-intent-created',
      'first-intent-realized',
      'five-intents-realized',
      'ten-intents-realized',
      'first-realized-participation',
    ]);
    expect(achievements.every((achievement) => !('achievedAt' in achievement))).toBe(true);
  });
});
