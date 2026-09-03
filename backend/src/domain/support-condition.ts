export function isSupportConditionSatisfied(currentSupports: number, supportGoal: number): boolean {
  if (!Number.isInteger(supportGoal) || supportGoal < 1) {
    throw new Error('A meta de apoios deve ser um inteiro maior que zero.');
  }

  if (!Number.isInteger(currentSupports) || currentSupports < 0) {
    throw new Error('A quantidade atual de apoios não pode ser negativa.');
  }

  return currentSupports >= supportGoal;
}
