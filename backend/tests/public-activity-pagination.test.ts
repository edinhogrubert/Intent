import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Lightweight hook harness for the actual component; no new production dependency.
const harness = vi.hoisted(() => ({ slots: [] as any[], cursor: 0, effects: [] as Array<() => void>, api: vi.fn() }));
vi.mock('react', async (original) => ({
  ...await original<any>(),
  useState: (initial: unknown) => {
    const index = harness.cursor++;
    if (!(index in harness.slots)) harness.slots[index] = initial;
    return [harness.slots[index], (value: any) => {
      harness.slots[index] = typeof value === 'function' ? value(harness.slots[index]) : value;
    }];
  },
  useRef: (initial: unknown) => {
    const index = harness.cursor++;
    return harness.slots[index] ??= { current: initial };
  },
  useEffect: (effect: () => undefined | (() => void), deps: unknown[]) => {
    const index = harness.cursor++;
    const old = harness.slots[index];
    if (!old || deps.some((value, i) => value !== old.deps[i])) {
      harness.effects.push(() => { old?.cleanup?.(); harness.slots[index] = { deps, cleanup: effect() }; });
    }
  },
}));
vi.mock('../../src/services/intentApi', () => ({ listUserPublicActivity: harness.api, IntentApiError: Error }));
const { PublicUserActivity } = await import(new URL('../../src/components/PublicUserActivity.tsx', import.meta.url).href);

const filters = ['ALL', 'INTENT_CREATED', 'INTENT_SUPPORTED', 'INTENT_REACTED', 'INTENT_COMMENTED', 'INTENT_REALIZED_PARTICIPATION'];
const labels = ['Todos', 'Criadas', 'Apoios', 'Reações', 'Comentários', 'Realizadas'];
const item = (id: string, type = 'INTENT_CREATED') => ({ id, type, occurredAt: '2026-09-01T00:00:00.000Z',
  intent: { id, title: id, status: 'PUBLISHED' } });
function deferred() {
  let resolve!: (value: any) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function render() {
  harness.cursor = 0;
  const tree = PublicUserActivity({ userId: 'viewer', displayName: 'Viewer', onSelectIntent: vi.fn() });
  harness.effects.splice(0).forEach((effect) => effect());
  return tree;
}
function text(node: any): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(text).join('');
  return text(node.props?.children);
}
function button(node: any, label: string): any {
  if (!node) return undefined;
  if (Array.isArray(node)) return node.map((child) => button(child, label)).find(Boolean);
  if (node.type === 'button' && text(node) === label) return node;
  return button(node.props?.children, label);
}
function click(label: string) {
  const target = button(render(), label);
  expect(target, `button ${label}`).toBeTruthy();
  return target.props.onClick();
}
async function settle() { await new Promise((resolve) => setTimeout(resolve, 0)); render(); }
const state = () => ({ items: harness.slots[0], cursor: harness.slots[1], loadingMore: harness.slots[4], error: harness.slots[5] });
beforeEach(() => { harness.slots = []; harness.cursor = 0; harness.effects = []; harness.api.mockReset(); });
afterEach(() => { harness.slots.forEach((slot) => slot?.cleanup?.()); });

async function initial() {
  harness.api.mockResolvedValueOnce({ items: [item('all')], nextCursor: 'all-cursor' });
  render(); await settle();
}

describe('isolamento da paginação no componente de atividade', () => {
  it.each(filters)('pagina o filtro %s com seu cursor', async (filter) => {
    await initial();
    if (filter !== 'ALL') {
      harness.api.mockResolvedValueOnce({ items: [item('first', filter)], nextCursor: 'filter-cursor' });
      click(labels[filters.indexOf(filter)]!); render(); await settle();
    }
    harness.api.mockResolvedValueOnce({ items: [item('second', filter === 'ALL' ? 'INTENT_SUPPORTED' : filter)], nextCursor: 'next' });
    await click('Carregar mais atividades'); render();
    expect(harness.api).toHaveBeenLastCalledWith('viewer', filter === 'ALL' ? 'all-cursor' : 'filter-cursor', 15, filter);
    expect(state().items).toHaveLength(2);
    expect(state().cursor).toBe('next');
    expect(state().loadingMore).toBe(false);
  });

  it.each(['resolve', 'reject'])('resposta antiga (%s) não altera lista, cursor, erro ou loadingMore do novo filtro', async (outcome) => {
    await initial();
    const old = deferred();
    harness.api.mockReturnValueOnce(old.promise);
    const oldRequest = click('Carregar mais atividades');
    harness.api.mockResolvedValueOnce({ items: [item('created')], nextCursor: 'created-cursor' });
    click('Criadas');
    expect(state().items).toEqual([]);
    expect(state().cursor).toBeNull();
    render(); await settle();
    const current = deferred();
    harness.api.mockReturnValueOnce(current.promise);
    const currentRequest = click('Carregar mais atividades');
    const before = state();
    expect(before.loadingMore).toBe(true);
    if (outcome === 'resolve') old.resolve({ items: [item('old-support', 'INTENT_SUPPORTED')], nextCursor: 'wrong-cursor' });
    else old.reject(new Error('old-error'));
    await oldRequest; render();
    expect(state()).toEqual(before);
    current.resolve({ items: [item('created-more')], nextCursor: null });
    await currentRequest; render();
    expect(state().items.map((entry: any) => entry.id)).toEqual(['created', 'created-more']);
    expect(harness.api).toHaveBeenLastCalledWith('viewer', 'created-cursor', 15, 'INTENT_CREATED');
  });

  it('erro antigo não sobrescreve erro atual; retorno ao mesmo filtro não revalida a requisição antiga', async () => {
    await initial();
    const old = deferred(); harness.api.mockReturnValueOnce(old.promise);
    const oldRequest = click('Carregar mais atividades');
    harness.api.mockResolvedValueOnce({ items: [], nextCursor: null });
    click('Apoios'); render(); await settle();
    harness.api.mockRejectedValueOnce(new Error('current-error'));
    click('Todos'); render(); await settle();
    const before = state(); expect(before.error).toBe('current-error');
    old.reject(new Error('old-error')); await oldRequest; render();
    expect(state()).toEqual(before);
  });

  it('desmontagem invalida paginação pendente', async () => {
    await initial();
    const old = deferred(); harness.api.mockReturnValueOnce(old.promise);
    const pending = click('Carregar mais atividades');
    harness.slots.forEach((slot) => slot?.cleanup?.());
    const before = state();
    old.resolve({ items: [item('late')], nextCursor: 'late' }); await pending;
    expect(state()).toEqual(before);
  });
});
