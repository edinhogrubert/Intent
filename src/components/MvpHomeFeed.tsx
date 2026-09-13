import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AlertCircle, ArrowRight, Calendar, Lock, Plus, RefreshCw, Search, Users, Vote, X } from 'lucide-react';
import type { UserAccount } from '../types';
import {
  IntentApiError,
  listPublicIntents,
  searchIntentsAndUsers,
  type ApiIntent,
  type ApiSearchResults,
  type FeedScope,
  type IntentCategory,
} from '../services/intentApi';
import { APP_VERSION_CONTEXT, APP_VERSION_LABEL } from '../appVersion';

interface MvpHomeFeedProps {
  currentUser: UserAccount;
  onCreate: () => void;
  onSelectIntent: (id: string) => void;
  onSelectProfile: (id: string) => void;
}

const categoryLabels: Record<IntentCategory, string> = {
  SPORTS: 'Esportes', ENTERTAINMENT: 'Entretenimento', TECHNOLOGY: 'Tecnologia', EDUCATION: 'Educação',
  HEALTH_WELLNESS: 'Saúde e bem-estar', CAREER_BUSINESS: 'Carreira e negócios', COMMUNITY_CAUSES: 'Comunidade e causas',
  PERSONAL_LIFE: 'Vida pessoal', OTHER: 'Outros',
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

function ConditionLine({ intent }: { intent: ApiIntent }) {
  if (intent.conditionType === 'DATE') {
    return <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4"/>{intent.revealAt ? `Revela em ${formatDate(intent.revealAt)}` : 'Trava de tempo'}</span>;
  }
  if (intent.conditionType === 'GUARDIANS') {
    return <span className="flex items-center gap-1.5"><Vote className="w-4 h-4"/>{intent.guardianApprovals?.length ?? 0} de {intent.guardianApprovalGoal ?? 1} guardioes</span>;
  }
  return <span>{intent.supportCount} de {intent.supportGoal} apoios</span>;
}

export function MvpHomeFeed({ currentUser, onCreate, onSelectIntent, onSelectProfile }: MvpHomeFeedProps) {
  const [scope, setScope] = useState<FeedScope>('public');
  const [intents, setIntents] = useState<ApiIntent[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ApiSearchResults | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const loadGeneration = useRef(0);

  async function loadFeed(cursor?: string) {
    const generation = ++loadGeneration.current;
    cursor ? setLoadingMore(true) : setLoading(true);
    setError('');
    try {
      const page = await listPublicIntents(scope, cursor);
      if (generation !== loadGeneration.current) return;
      setIntents((current) => cursor ? [...current, ...page.items] : page.items);
      setNextCursor(page.nextCursor);
    } catch (caught) {
      if (generation === loadGeneration.current) {
        setError(caught instanceof IntentApiError ? caught.message : 'Não foi possível carregar o feed.');
      }
    } finally {
      if (generation === loadGeneration.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }

  useEffect(() => {
    setIntents([]);
    setNextCursor(null);
    void loadFeed();
  }, [scope]);

  async function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSearchError('Digite pelo menos 2 caracteres para buscar.');
      return;
    }
    setSearching(true);
    setSearchError('');
    setSearchResults(null);
    try {
      setSearchResults(await searchIntentsAndUsers(query));
    } catch (caught) {
      setSearchError(caught instanceof IntentApiError ? caught.message : 'Não foi possível realizar a busca.');
    } finally {
      setSearching(false);
    }
  }

  function clearSearch() {
    setSearchQuery('');
    setSearchResults(null);
    setSearchError('');
  }

  const isFollowingFeed = scope === 'following';

  return <div className="max-w-2xl mx-auto w-full px-4 py-6 sm:py-8">
    <section className="bg-white border border-[#e4e2de] rounded-2xl p-5 mb-6 shadow-sm">
      <p className="text-xs font-bold text-[#000666]">Olá, {currentUser.name.split(' ')[0]}</p>
      <div className="flex items-center justify-between gap-4 mt-2"><div><h1 className="text-xl sm:text-2xl font-black text-[#1b1c1a]">O que você quer fazer acontecer?</h1><p className="text-sm text-[#666] mt-1">Crie uma Intent ou acompanhe o que já está acontecendo.</p><span className="inline-flex items-center mt-3 px-2.5 py-1 rounded-full bg-[#f0efff] text-[#000666] text-[11px] font-bold">Versao {APP_VERSION_LABEL} · {APP_VERSION_CONTEXT}</span></div><button onClick={onCreate} className="shrink-0 w-11 h-11 rounded-full bg-[#000666] text-white flex items-center justify-center" aria-label="Criar Intent"><Plus className="w-5 h-5"/></button></div>
    </section>

    <section className="mb-6">
      <form onSubmit={(event) => void submitSearch(event)} className="flex gap-2" role="search">
        <label htmlFor="home-search" className="sr-only">Buscar Intents e pessoas</label>
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777]"/>
          <input id="home-search" type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Buscar Intents e pessoas" maxLength={80} className="w-full rounded-xl border border-[#c6c5d4] bg-white pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#000666]"/>
          {(searchQuery || searchResults) && <button type="button" onClick={clearSearch} aria-label="Limpar busca" className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#666]"><X className="w-4 h-4"/></button>}
        </div>
        <button type="submit" disabled={searching} className="px-5 py-3 rounded-xl bg-[#000666] text-white text-sm font-bold disabled:opacity-60">{searching ? 'Buscando...' : 'Buscar'}</button>
      </form>

      {searchError && <div role="alert" className="mt-3 rounded-xl bg-[#ffdad6] text-[#8c1d18] p-3 text-sm flex gap-2"><AlertCircle className="w-4 h-4 mt-0.5 shrink-0"/>{searchError}</div>}
      {searching && <div className="mt-4 rounded-2xl bg-white border border-[#e4e2de] p-7 text-center text-sm text-[#666]"><RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2"/>Buscando Intents e pessoas...</div>}
      {!searching && searchResults && <div className="mt-4 rounded-2xl bg-white border border-[#e4e2de] p-5 space-y-6">
        {searchResults.intents.length === 0 && searchResults.users.length === 0 && <div className="py-5 text-center"><Search className="w-7 h-7 text-[#777] mx-auto mb-2"/><p className="font-bold">Nenhum resultado encontrado.</p></div>}

        {searchResults.intents.length > 0 && <div><h2 className="font-black mb-3">Intents</h2><div className="space-y-2">{searchResults.intents.map((intent) => <button type="button" key={intent.id} onClick={() => onSelectIntent(intent.id)} className="w-full rounded-xl border border-[#e4e2de] p-3 text-left hover:border-[#000666] flex items-center justify-between gap-3"><div className="min-w-0"><p className="font-bold truncate">{intent.title}</p><p className="text-xs text-[#666] mt-1 truncate">{intent.creator.displayName} · @{intent.creator.username.replace(/^@+/, '')}</p></div><ArrowRight className="w-4 h-4 text-[#000666] shrink-0"/></button>)}</div></div>}

        {searchResults.users.length > 0 && <div><h2 className="font-black mb-3">Pessoas</h2><div className="space-y-2">{searchResults.users.map((user) => <button type="button" key={user.id} onClick={() => onSelectProfile(user.id)} className="w-full rounded-xl border border-[#e4e2de] p-3 text-left hover:border-[#000666] flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-[#e0e0ff] text-[#000666] overflow-hidden flex items-center justify-center font-black shrink-0">{user.avatarUrl ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover"/> : user.displayName.charAt(0).toUpperCase()}</div><div className="min-w-0"><p className="font-bold truncate">{user.displayName}</p><p className="text-xs text-[#666] truncate">@{user.username.replace(/^@+/, '')}{user.bio ? ` · ${user.bio}` : ''}</p></div></button>)}</div></div>}
      </div>}
    </section>

    <div className="flex items-end justify-between gap-4 mb-4"><div><h2 className="text-lg font-black">Acontecendo agora</h2><p className="text-xs text-[#666]">{isFollowingFeed ? 'Intents das pessoas que você segue' : 'Intents públicas reais'}</p></div><button onClick={() => void loadFeed()} className="p-2 rounded-full bg-white border border-[#e4e2de]" aria-label="Atualizar feed"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}/></button></div>

    <div className="grid grid-cols-2 gap-2 p-1 bg-[#efedf4] rounded-xl mb-5" role="tablist" aria-label="Escolher feed">
      <button type="button" role="tab" aria-selected={scope === 'public'} onClick={() => setScope('public')} className={`py-2.5 rounded-lg text-sm font-bold transition-colors ${scope === 'public' ? 'bg-white text-[#000666] shadow-sm' : 'text-[#666]'}`}>Para você</button>
      <button type="button" role="tab" aria-selected={scope === 'following'} onClick={() => setScope('following')} className={`py-2.5 rounded-lg text-sm font-bold transition-colors ${scope === 'following' ? 'bg-white text-[#000666] shadow-sm' : 'text-[#666]'}`}>Seguindo</button>
    </div>

    {loading && <div className="bg-white border border-[#e4e2de] rounded-2xl p-10 text-center text-sm text-[#666]">Carregando acontecimentos...</div>}
    {!loading && error && <div className="bg-[#ffdad6] text-[#8c1d18] rounded-2xl p-5 flex gap-3"><AlertCircle className="w-5 h-5 shrink-0"/><div><p className="font-bold">O feed não carregou</p><p className="text-sm mt-1">{error}</p><button onClick={() => void loadFeed()} className="text-sm font-bold underline mt-3">Tentar novamente</button></div></div>}
    {!loading && !error && intents.length === 0 && <div className="bg-white border-2 border-dashed border-[#c6c5d4] rounded-2xl p-10 text-center"><Users className="w-7 h-7 text-[#777] mx-auto"/><h3 className="font-bold mt-3">{isFollowingFeed ? 'Nada novo por aqui' : 'O feed está começando'}</h3><p className="text-sm text-[#666] mt-2">{isFollowingFeed ? 'Siga pessoas pelos perfis para acompanhar as Intents delas aqui.' : 'Ainda não existem Intents públicas. A primeira pode ser sua.'}</p>{!isFollowingFeed && <button onClick={onCreate} className="mt-5 px-5 py-3 bg-[#000666] text-white rounded-xl text-sm font-bold">Criar primeira Intent</button>}</div>}

    <div className="space-y-4">{!loading && !error && intents.map((intent) => {
      const progress = intent.conditionType === 'SUPPORT'
        ? Math.min(100, Math.round(intent.supportCount * 100 / intent.supportGoal))
        : intent.conditionType === 'GUARDIANS'
          ? Math.min(100, Math.round(((intent.guardianApprovals?.length ?? 0) * 100) / (intent.guardianApprovalGoal ?? 1)))
          : intent.status === 'REALIZED' ? 100 : 0;
      const isMine = intent.creator.id === currentUser.id;
      return <article key={intent.id} className="bg-white border border-[#e4e2de] rounded-2xl p-5 shadow-sm">
        <button type="button" onClick={() => onSelectProfile(intent.creator.id)} className="flex items-center gap-3 text-left max-w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-[#000666]"><div className="w-10 h-10 rounded-full bg-[#e0e0ff] text-[#000666] overflow-hidden flex items-center justify-center font-black">{intent.creator.avatarUrl ? <img src={intent.creator.avatarUrl} alt="" className="w-full h-full object-cover"/> : intent.creator.displayName.charAt(0).toUpperCase()}</div><div className="min-w-0"><p className="text-sm font-bold truncate">{intent.creator.displayName}{isMine && <span className="ml-2 text-[10px] text-[#000666] bg-[#e0e0ff] px-2 py-0.5 rounded-full">Você</span>}</p><p className="text-xs text-[#666]">@{intent.creator.username.replace(/^@+/, '')} · {formatDate(intent.createdAt)}</p></div></button>
        <div className="flex flex-wrap items-center gap-2 mt-4"><span className="inline-block px-2.5 py-1 rounded-full bg-[#f0efff] text-[#000666] text-[11px] font-bold">{categoryLabels[intent.category] || 'Outros'}</span>{intent.visibility === 'FOLLOWERS' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#e8f5e9] text-[#28642f] text-[11px] font-bold"><Users className="w-3 h-3"/>Seguidores</span>}</div>
        <h3 className="text-lg font-black mt-3">{intent.title}</h3><p className="text-sm text-[#454652] mt-2 whitespace-pre-wrap">{intent.story}</p>
        <div className="mt-5"><div className="flex justify-between text-xs font-bold"><ConditionLine intent={intent} /><span>{progress}%</span></div><div className="h-2 bg-[#E0F2F1] rounded-full overflow-hidden mt-2"><div className="h-full bg-[#006a62]" style={{ width: `${progress}%` }}/></div></div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#f0efec]"><span className="text-xs text-[#666] flex items-center gap-1.5">{intent.status === 'REALIZED' ? <><Users className="w-4 h-4"/>Realizada</> : <><Lock className="w-4 h-4"/>Revelação protegida</>}</span><button onClick={() => onSelectIntent(intent.id)} className="text-sm font-bold text-[#000666] flex items-center gap-1">Abrir<ArrowRight className="w-4 h-4"/></button></div>
      </article>;
    })}</div>

    {!loading && !error && nextCursor && <button type="button" onClick={() => void loadFeed(nextCursor)} disabled={loadingMore} className="w-full mt-5 py-3 rounded-xl border border-[#c6c5d4] text-sm font-bold text-[#000666] disabled:opacity-60">{loadingMore ? 'Carregando...' : 'Carregar mais'}</button>}
  </div>;
}
