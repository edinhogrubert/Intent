import { afterEach, describe, expect, it, vi } from 'vitest';
const {
  getIntentShareUrl,
  getUserProfileShareUrl,
  isValidUuid,
  parseInitialLocation, syncUrlLocation, copyToClipboard,
} = await import(new URL('../../src/utils/shareLink.ts', import.meta.url).href);

afterEach(() => vi.unstubAllGlobals());

describe('Utilitários de Links Compartilháveis (Etapa 25A)', () => {
  const validIntentId = '11111111-2222-4333-8444-555555555555';
  const validUserId = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';

  describe('isValidUuid', () => {
    it('reconhece UUIDs válidos nos formatos esperados', () => {
      expect(isValidUuid(validIntentId)).toBe(true);
      expect(isValidUuid(validUserId)).toBe(true);
      expect(isValidUuid('   ' + validIntentId + '   ')).toBe(true);
    });

    it('rejeita strings vazias, valores nulos ou formatos inválidos', () => {
      expect(isValidUuid(null)).toBe(false);
      expect(isValidUuid(undefined)).toBe(false);
      expect(isValidUuid('')).toBe(false);
      expect(isValidUuid('invalid-uuid')).toBe(false);
      expect(isValidUuid('@username')).toBe(false);
      expect(isValidUuid('12345')).toBe(false);
    });
  });

  describe('parseInitialLocation com Query Params', () => {
    it('extrai intentId a partir do parâmetro ?intent=', () => {
      const parsed = parseInitialLocation(`?intent=${validIntentId}`);
      expect(parsed).toEqual({ type: 'intent', id: validIntentId });
    });

    it('extrai intentId a partir do parâmetro alternativo ?intent_id=', () => {
      const parsed = parseInitialLocation(`?intent_id=${validIntentId}`);
      expect(parsed).toEqual({ type: 'intent', id: validIntentId });
    });

    it('extrai userId a partir do parâmetro ?user=', () => {
      const parsed = parseInitialLocation(`?user=${validUserId}`);
      expect(parsed).toEqual({ type: 'user', id: validUserId });
    });

    it('extrai userId a partir do parâmetro ?profile=', () => {
      const parsed = parseInitialLocation(`?profile=${validUserId}`);
      expect(parsed).toEqual({ type: 'user', id: validUserId });
    });

    it('ignora parâmetros que não são UUIDs válidos e retorna home', () => {
      const parsed = parseInitialLocation('?intent=not-a-uuid&user=malformed');
      expect(parsed).toEqual({ type: 'home' });
    });

    it('retorna home quando nenhum parâmetro relevante está presente', () => {
      const parsed = parseInitialLocation('?utm_source=social&tab=recent');
      expect(parsed).toEqual({ type: 'home' });
    });
  });

  describe('parseInitialLocation com Path Params', () => {
    it('não declara suporte a path de Intent sem validação do servidor', () => {
      const parsed = parseInitialLocation('', `/intent/${validIntentId}`);
      expect(parsed).toEqual({ type: 'home' });
    });

    it('não declara suporte a paths de perfil', () => {
      const parsedUser = parseInitialLocation('', `/user/${validUserId}`);
      expect(parsedUser).toEqual({ type: 'home' });

      const parsedProfile = parseInitialLocation('', `/profile/${validUserId}`);
      expect(parsedProfile).toEqual({ type: 'home' });
    });

    it('retorna home quando o caminho contém ID inválido', () => {
      const parsed = parseInitialLocation('', '/intent/invalid-id');
      expect(parsed).toEqual({ type: 'home' });
    });
  });

  describe('Geração de URLs compartilháveis', () => {
    it('gera formato relativo ou absoluto consistente para Intent', () => {
      const url = getIntentShareUrl(validIntentId);
      expect(url).toContain(`intent=${validIntentId}`);
    });

    it('gera formato relativo ou absoluto consistente para Perfil de Usuário', () => {
      const url = getUserProfileShareUrl(validUserId);
      expect(url).toContain(`user=${validUserId}`);
    });
  });
});

describe('regressões oficiais de links e histórico', () => {
  const id = '11111111-2222-4333-8444-555555555555';
  function browser(href = 'https://intent.example/?utm_source=test#section') {
    const state = { location: new URL(href), history: {
      pushState: vi.fn((_state: unknown, _title: string, url: string) => { state.location = new URL(url, state.location); }),
      replaceState: vi.fn((_state: unknown, _title: string, url: string) => { state.location = new URL(url, state.location); }),
    } };
    vi.stubGlobal('window', state);
    return state;
  }
  it('gera links canônicos sem path, parâmetros antigos ou hash', () => {
    browser(`https://intent.example/old-path?user=${id}#section`);
    expect(getIntentShareUrl(` ${id} `)).toBe(`https://intent.example/?intent=${id}`);
    expect(getUserProfileShareUrl(id)).toBe(`https://intent.example/?user=${id}`);
    expect(() => getIntentShareUrl('bad')).toThrow();
    expect(() => getUserProfileShareUrl('bad')).toThrow();
  });
  it('não duplica histórico quando há hash', () => {
    const state = browser();
    syncUrlLocation('detail', { intentId: id });
    syncUrlLocation('detail', { intentId: id });
    expect(state.history.pushState).toHaveBeenCalledTimes(1);
    expect(state.location.hash).toBe('#section');
    expect(state.location.searchParams.get('utm_source')).toBe('test');
  });
  it.each(['home', 'create', 'mine', 'profile', 'public-profile', 'detail'])(
    'reconstitui a tela %s pela URL, inclusive ao voltar/avançar', (view) => {
      browser();
      syncUrlLocation(view, { intentId: id, userId: id });
      const parsed = parseInitialLocation();
      expect(parsed.type).toBe(view === 'detail' ? 'intent' : view === 'public-profile' ? 'user' : view);
      if (['profile', 'public-profile', 'detail'].includes(view)) expect(parsed.id).toBe(id);
    });
  it('replace não acrescenta entrada; troca de recurso limpa aliases e view antigos', () => {
    const state = browser(`https://intent.example/?intent_id=${id}&view=mine`);
    syncUrlLocation('public-profile', { userId: id }, true);
    expect(state.history.pushState).not.toHaveBeenCalled();
    expect(state.history.replaceState).toHaveBeenCalledTimes(1);
    expect(state.location.search).toBe(`?user=${id}`);
  });
  it('navegar para início elimina o destino anterior', () => {
    browser(`https://intent.example/?intent=${id}`);
    syncUrlLocation('home');
    expect(parseInitialLocation()).toEqual({ type: 'home' });
  });
  it('usa clipboard nativo quando disponível', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    expect(await copyToClipboard('https://intent.example/')).toBe(true);
    expect(writeText).toHaveBeenCalledWith('https://intent.example/');
  });
  it.each(['success', 'denied', 'throws'])('fallback clipboard: %s e limpeza garantida', async (mode) => {
    vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } });
    const field = { style: {}, value: '', setAttribute: vi.fn(), focus: vi.fn(), select: vi.fn(), remove: vi.fn() };
    const previous = { focus: vi.fn() };
    const doc = { activeElement: previous, createElement: vi.fn(() => field), body: { appendChild: vi.fn() },
      execCommand: vi.fn(() => { if (mode === 'throws') throw new Error('blocked'); return mode === 'success'; }) };
    vi.stubGlobal('document', doc);
    expect(await copyToClipboard('link')).toBe(mode === 'success');
    expect(field.value).toBe('link');
    expect(field.remove).toHaveBeenCalledTimes(1);
    expect(previous.focus).toHaveBeenCalledTimes(1);
  });
});
