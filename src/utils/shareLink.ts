/**
 * Utilitários para geração de links compartilháveis, sincronização de URL
 * e cópia para a área de transferência no Intent OS.
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface ParsedLocationTarget {
  type: 'intent' | 'user' | 'home' | 'create' | 'mine' | 'profile';
  id?: string;
}

/**
 * Valida se uma string possui o formato UUID aceito (versões 1 a 5).
 */
export function isValidUuid(value: string | null | undefined): boolean {
  if (!value || typeof value !== 'string') return false;
  return UUID_REGEX.test(value.trim());
}

/**
 * Gera a URL absoluta e compartilhável para uma Intent específica.
 */
export function getIntentShareUrl(intentId: string): string {
  return shareUrl('intent', intentId);
}

export function getUserProfileShareUrl(userId: string): string {
  return shareUrl('user', userId);
}

function shareUrl(key: 'intent' | 'user', id: string): string {
  if (!isValidUuid(id)) throw new Error('Identificador inválido para compartilhamento.');
  const query = `/?${key}=${encodeURIComponent(id.trim().toLowerCase())}`;
  return typeof window === 'undefined' ? query : `${window.location.origin}${query}`;
}

/**
 * Analisa os parâmetros da URL atual para identificar se há
 * uma Intent ou Usuário especificado para carregamento direto.
 */
export function parseInitialLocation(searchString?: string, pathnameString?: string): ParsedLocationTarget {
  if (typeof window === 'undefined' && !searchString && !pathnameString) {
    return { type: 'home' };
  }

  const search = searchString ?? (typeof window !== 'undefined' ? window.location.search : '');

  // 1. Verificação por parâmetros de busca (Query Params)
  const params = new URLSearchParams(search);
  const intentQuery = params.get('intent') || params.get('intent_id') || params.get('intentId');
  if (intentQuery && isValidUuid(intentQuery)) {
    return { type: 'intent', id: intentQuery.trim().toLowerCase() };
  }

  const userQuery = params.get('user') || params.get('user_id') || params.get('userId') || params.get('profile') || params.get('profile_id');
  if (userQuery && isValidUuid(userQuery)) {
    return { type: params.get('view') === 'profile' ? 'profile' : 'user', id: userQuery.trim().toLowerCase() };
  }

  // Canonical query links reload through the existing root document. Path aliases
  // are deliberately unsupported: no server/reverse-proxy changes are required.
  const view = params.get('view');
  if (view === 'create' || view === 'mine') return { type: view };

  return { type: 'home' };
}

/**
 * Atualiza a URL do navegador no histórico sem disparar recarregamento de página.
 */
export function syncUrlLocation(
  view: 'home' | 'create' | 'mine' | 'detail' | 'profile' | 'public-profile',
  params?: { intentId?: string | null; userId?: string | null },
  replace = false,
) {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);

  // Limpar parâmetros anteriores de navegação
  url.pathname = '/';
  url.searchParams.delete('view');
  url.searchParams.delete('intent');
  url.searchParams.delete('intent_id');
  url.searchParams.delete('intentId');
  url.searchParams.delete('user');
  url.searchParams.delete('user_id');
  url.searchParams.delete('userId');
  url.searchParams.delete('profile');
  url.searchParams.delete('profile_id');

  if (view === 'detail' && params?.intentId && isValidUuid(params.intentId)) {
    url.searchParams.set('intent', params.intentId.trim().toLowerCase());
  } else if ((view === 'public-profile' || view === 'profile') && params?.userId && isValidUuid(params.userId)) {
    url.searchParams.set('user', params.userId.trim().toLowerCase());
    if (view === 'profile') url.searchParams.set('view', 'profile');
  }

  if (view === 'create' || view === 'mine') url.searchParams.set('view', view);

  const newUrl = url.pathname + (url.searchParams.toString() ? `?${url.searchParams.toString()}` : '') + url.hash;

  if (window.location.pathname + window.location.search + window.location.hash !== newUrl) {
    if (replace) {
      window.history.replaceState({ view, ...params }, '', newUrl);
    } else {
      window.history.pushState({ view, ...params }, '', newUrl);
    }
  }
}

/**
 * Copia um texto para a área de transferência com suporte a fallback.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // 1. Tentar Clipboard API nativa
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Falhou ou permissão negada no iframe, prosseguir para o fallback
    }
  }

  // Restore focus and remove the temporary element even if execCommand throws.
  if (typeof document === 'undefined') return false;
  const previousFocus = document.activeElement as HTMLElement | null;
  const textArea = document.createElement('textarea');
  try {
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    textArea.remove();
    previousFocus?.focus();
  }
}
