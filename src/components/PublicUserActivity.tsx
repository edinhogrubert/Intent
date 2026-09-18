import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Heart,
  LoaderCircle,
  MessageSquare,
  RefreshCw,
  Sparkles,
  ThumbsUp,
} from 'lucide-react';
import {
  listUserPublicActivity,
  IntentApiError,
  type ApiPublicActivityItem,
  type PublicActivityFilter,
} from '../services/intentApi';

interface PublicUserActivityProps {
  userId: string;
  displayName: string;
  onSelectIntent: (intentId: string) => void;
}

const ACTIVITY_FILTERS: Array<{
  type: PublicActivityFilter;
  label: string;
  description: string;
}> = [
  { type: 'ALL', label: 'Todos', description: 'Todos os eventos públicos.' },
  { type: 'INTENT_CREATED', label: 'Criadas', description: 'Intents criadas por este perfil.' },
  { type: 'INTENT_REALIZED_PARTICIPATION', label: 'Realizadas', description: 'Participações concluídas.' },
  { type: 'INTENT_SUPPORTED', label: 'Apoios', description: 'Apoios feitos em Intents públicas.' },
  { type: 'INTENT_REACTED', label: 'Reações', description: 'Reações registradas em Intents.' },
  { type: 'INTENT_COMMENTED', label: 'Comentários', description: 'Comentários feitos em Intents.' },
];

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Agora mesmo';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `Há ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Há ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Ontem';
    if (diffInDays < 30) return `Há ${diffInDays} dias`;
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `Há ${diffInMonths} ${diffInMonths === 1 ? 'mês' : 'meses'}`;

    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

function formatFullDate(dateString: string): string {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}

function emptyMessage(filter: PublicActivityFilter, displayName: string) {
  switch (filter) {
    case 'INTENT_CREATED':
      return { title: 'Nenhuma Intent criada ainda', description: `${displayName} ainda não criou Intents públicas.` };
    case 'INTENT_REALIZED_PARTICIPATION':
      return { title: 'Nenhuma realização pública ainda', description: 'As participações em Intents realizadas aparecerão aqui.' };
    case 'INTENT_SUPPORTED':
      return { title: 'Nenhum apoio público ainda', description: 'Os apoios em Intents públicas aparecerão aqui.' };
    case 'INTENT_REACTED':
      return { title: 'Nenhuma reação pública ainda', description: 'As reações em Intents públicas aparecerão aqui.' };
    case 'INTENT_COMMENTED':
      return { title: 'Nenhum comentário público ainda', description: 'Os comentários em Intents públicas aparecerão aqui.' };
    default:
      return { title: 'Nenhuma atividade pública registrada ainda', description: 'As criações de Intents, apoios, comentários e reações públicas aparecerão listadas aqui cronologicamente.' };
  }
}

export function PublicUserActivity({ userId, displayName, onSelectIntent }: PublicUserActivityProps) {
  const [items, setItems] = useState<ApiPublicActivityItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<PublicActivityFilter>('ALL');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const requestIdRef = useRef(0);

  const loadInitialActivity = (filter: PublicActivityFilter = activeFilter) => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setLoading(true);
    setError('');
    setItems([]);
    setNextCursor(null);

    listUserPublicActivity(userId, undefined, 15, filter)
      .then((res) => {
        if (requestIdRef.current === requestId) {
          setItems(res.items);
          setNextCursor(res.nextCursor);
        }
      })
      .catch((caught) => {
        if (requestIdRef.current === requestId) {
          setError(
            caught instanceof IntentApiError
              ? caught.message
              : 'Não foi possível carregar a atividade pública deste perfil.',
          );
        }
      })
      .finally(() => {
        if (requestIdRef.current === requestId) setLoading(false);
      });
  };

  useEffect(() => {
    loadInitialActivity(activeFilter);
  }, [userId, activeFilter]);

  const handleFilterChange = (filter: PublicActivityFilter) => {
    if (filter === activeFilter) return;
    setActiveFilter(filter);
  };

  const handleLoadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);

    try {
      const res = await listUserPublicActivity(userId, nextCursor, 15, activeFilter);
      setItems((prev) => [...prev, ...res.items]);
      setNextCursor(res.nextCursor);
    } catch (caught) {
      setError(
        caught instanceof IntentApiError
          ? caught.message
          : 'Não foi possível carregar mais atividades.',
      );
    } finally {
      setLoadingMore(false);
    }
  };

  const getEventDetails = (item: ApiPublicActivityItem) => {
    switch (item.type) {
      case 'INTENT_CREATED':
        return {
          icon: <Sparkles className="w-4 h-4 text-[#000666]" />,
          badgeBg: 'bg-[#e0e0ff] text-[#000666] border-[#c4c4ff]',
          titleText: `${displayName} criou uma Intent`,
          actionVerb: 'Criação de Intent',
        };
      case 'INTENT_SUPPORTED':
        return {
          icon: <Heart className="w-4 h-4 text-rose-600" />,
          badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
          titleText: `${displayName} apoiou uma Intent`,
          actionVerb: 'Apoio manifestado',
        };
      case 'INTENT_REALIZED_PARTICIPATION':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
          badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          titleText: `${displayName} participou de uma Intent realizada`,
          actionVerb: 'Realização alcançada',
        };
      case 'INTENT_REACTED': {
        const rType = item.metadata?.reactionType;
        let reactionLabel = 'Reagiu';
        let reactionIcon = <ThumbsUp className="w-4 h-4 text-amber-600" />;
        if (rType === 'LOVE') {
          reactionLabel = 'Amou';
          reactionIcon = <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />;
        } else if (rType === 'CELEBRATE') {
          reactionLabel = 'Celebrou';
          reactionIcon = <Sparkles className="w-4 h-4 text-emerald-600" />;
        }
        return {
          icon: reactionIcon,
          badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
          titleText: `${displayName} reagiu (${reactionLabel}) a uma Intent`,
          actionVerb: `Reação: ${reactionLabel}`,
        };
      }
      case 'INTENT_COMMENTED':
        return {
          icon: <MessageSquare className="w-4 h-4 text-indigo-600" />,
          badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          titleText: `${displayName} comentou em uma Intent`,
          actionVerb: 'Comentário público',
        };
      default:
        return {
          icon: <Sparkles className="w-4 h-4 text-[#000666]" />,
          badgeBg: 'bg-slate-100 text-[#333] border-slate-200',
          titleText: `${displayName} participou de um acontecimento`,
          actionVerb: 'Atividade',
        };
    }
  };

  const empty = emptyMessage(activeFilter, displayName);

  return (
    <section aria-labelledby="public-activity-heading" className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="public-activity-heading" className="text-xl font-black text-[#1b1c1a]">
            Atividade pública
          </h2>
          <p className="text-xs text-[#666]">
            Linha do tempo cronológica de ações e participações públicas de {displayName}
          </p>
        </div>
      </div>

      <div role="tablist" aria-label="Filtrar atividade pública" className="flex gap-2 overflow-x-auto pb-1">
        {ACTIVITY_FILTERS.map((filter) => {
          const selected = activeFilter === filter.type;
          return (
            <button
              key={filter.type}
              type="button"
              role="tab"
              aria-selected={selected}
              title={filter.description}
              onClick={() => handleFilterChange(filter.type)}
              className={`shrink-0 min-h-[44px] px-4 py-2 rounded-xl text-xs font-extrabold border transition-colors ${
                selected
                  ? 'bg-[#000666] text-white border-[#000666] shadow-sm'
                  : 'bg-white text-[#454652] border-[#e4e2de] hover:bg-[#f7f6fc] hover:text-[#000666]'
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {loading && (
        <div role="status" aria-label="Carregando atividades" className="py-12 text-center space-y-3">
          <LoaderCircle className="w-6 h-6 animate-spin text-[#000666] mx-auto" />
          <p className="text-sm font-medium text-[#666]">Carregando linha de atividade pública...</p>
        </div>
      )}

      {error && !loading && (
        <div
          role="alert"
          className="rounded-2xl border border-[#ffb4ab] bg-[#fff8f7] p-5 text-center space-y-3 max-w-md mx-auto"
        >
          <div className="w-10 h-10 rounded-full bg-[#ffdad6] text-[#8c1d18] flex items-center justify-center mx-auto">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#3b0907]">Falha ao carregar atividades</h3>
            <p className="text-xs text-[#772b27] mt-1">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => loadInitialActivity(activeFilter)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#000666] text-white text-xs font-bold hover:bg-[#1b237b] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Tentar novamente</span>
          </button>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="rounded-3xl border border-[#e4e2de] bg-white p-8 sm:p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#f7f6fc] text-[#000666] flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base text-[#1b1c1a]">
            {empty.title}
          </h3>
          <p className="text-sm text-[#666] max-w-md mx-auto">
            {empty.description}
          </p>
          {activeFilter !== 'ALL' && (
            <button
              type="button"
              onClick={() => handleFilterChange('ALL')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f7f6fc] text-[#000666] text-xs font-bold hover:bg-[#e0e0ff] transition-colors"
            >
              Ver todos os eventos
            </button>
          )}
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="space-y-3">
          {items.map((item) => {
            const details = getEventDetails(item);
            const isRealized = item.intent.status === 'REALIZED';

            return (
              <article
                key={item.id}
                className="rounded-2xl border border-[#e4e2de] bg-white p-4 sm:p-5 shadow-sm hover:border-[#000666]/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${details.badgeBg}`}
                    >
                      {details.icon}
                      <span>{details.actionVerb}</span>
                    </span>

                    <span
                      title={formatFullDate(item.occurredAt)}
                      className="text-xs font-semibold text-[#777]"
                    >
                      {formatRelativeTime(item.occurredAt)}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-extrabold text-[#1b1c1a]">
                      {details.titleText}
                    </h3>
                    <p className="text-sm font-semibold text-[#000666] mt-0.5 break-words line-clamp-1">
                      &ldquo;{item.intent.title}&rdquo;
                    </p>
                  </div>

                  {item.type === 'INTENT_COMMENTED' && item.metadata?.commentSnippet && (
                    <blockquote className="text-xs text-[#555] bg-[#f7f6fc] border-l-2 border-[#000666]/40 px-3 py-1.5 rounded-r-lg italic break-words line-clamp-2">
                      &ldquo;{item.metadata.commentSnippet}&rdquo;
                    </blockquote>
                  )}

                  {item.type === 'INTENT_REALIZED_PARTICIPATION' && item.metadata?.realizedAt && (
                    <p className="text-[11px] text-emerald-700 font-medium">
                      Concluída em {formatFullDate(item.metadata.realizedAt)}
                    </p>
                  )}
                </div>

                <div className="shrink-0 flex sm:flex-col items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#f0eee9]">
                  {isRealized && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3 h-3" />
                      Realizada
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onSelectIntent(item.intent.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#f7f6fc] text-[#000666] text-xs font-bold hover:bg-[#e0e0ff] transition-colors min-h-[38px] self-end"
                  >
                    <span>Ver Intent</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            );
          })}

          {nextCursor && (
            <div className="pt-4 text-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#000666] text-white text-xs font-bold hover:bg-[#1b237b] transition-all min-h-[44px] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? (
                  <>
                    <LoaderCircle className="w-4 h-4 animate-spin" />
                    <span>Carregando mais atividades...</span>
                  </>
                ) : (
                  <span>Carregar mais atividades</span>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
