import { useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowRight, Lock, Plus, RefreshCw, Users } from 'lucide-react';
import type { UserAccount } from '../types';
import {
  IntentApiError,
  listPublicIntents,
  type ApiIntent,
  type FeedScope,
  type IntentCategory,
} from '../services/intentApi';

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

export function MvpHomeFeed({ currentUser, onCreate, onSelectIntent, onSelectProfile }: MvpHomeFeedProps) {
  const [scope, setScope] = useState<FeedScope>('public');
  const [intents, setIntents] = useState<ApiIntent[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
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

  const isFollowingFeed = scope === 'following';

  return <div className="max-w-2xl mx-auto w-full px-4 py-6 sm:py-8">
    <section className="bg-white border border-[#e4e2de] rounded-2xl p-5 mb-6 shadow-sm">
      <p className="text-xs font-bold text-[#000666]">Olá, {currentUser.name.split(' ')[0]}</p>
      <div className="flex items-center justify-between gap-4 mt-2"><div><h1 className="text-xl sm:text-2xl font-black text-[#1b1c1a]">O que você quer fazer acontecer?</h1><p className="text-sm text-[#666] mt-1">Crie uma Intent ou acompanhe o que já está acontecendo.</p></div><button onClick={onCreate} className="shrink-0 w-11 h-11 rounded-full bg-[#000666] text-white flex items-center justify-center" aria-label="Criar Intent"><Plus className="w-5 h-5"/></button></div>
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
      const progress = Math.min(100, Math.round(intent.supportCount * 100 / intent.supportGoal));
      const isMine = intent.creator.id === currentUser.id;
      return <article key={intent.id} className="bg-white border border-[#e4e2de] rounded-2xl p-5 shadow-sm">
        <button type="button" onClick={() => onSelectProfile(intent.creator.id)} className="flex items-center gap-3 text-left max-w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-[#000666]"><div className="w-10 h-10 rounded-full bg-[#e0e0ff] text-[#000666] overflow-hidden flex items-center justify-center font-black">{intent.creator.avatarUrl ? <img src={intent.creator.avatarUrl} alt="" className="w-full h-full object-cover"/> : intent.creator.displayName.charAt(0).toUpperCase()}</div><div className="min-w-0"><p className="text-sm font-bold truncate">{intent.creator.displayName}{isMine && <span className="ml-2 text-[10px] text-[#000666] bg-[#e0e0ff] px-2 py-0.5 rounded-full">Você</span>}</p><p className="text-xs text-[#666]">@{intent.creator.username.replace(/^@+/, '')} · {formatDate(intent.createdAt)}</p></div></button>
        <div className="flex flex-wrap items-center gap-2 mt-4"><span className="inline-block px-2.5 py-1 rounded-full bg-[#f0efff] text-[#000666] text-[11px] font-bold">{categoryLabels[intent.category] || 'Outros'}</span>{intent.visibility === 'FOLLOWERS' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#e8f5e9] text-[#28642f] text-[11px] font-bold"><Users className="w-3 h-3"/>Seguidores</span>}</div>
        <h3 className="text-lg font-black mt-3">{intent.title}</h3><p className="text-sm text-[#454652] mt-2 whitespace-pre-wrap">{intent.story}</p>
        <div className="mt-5"><div className="flex justify-between text-xs font-bold"><span>{intent.supportCount} de {intent.supportGoal} apoios</span><span>{progress}%</span></div><div className="h-2 bg-[#E0F2F1] rounded-full overflow-hidden mt-2"><div className="h-full bg-[#006a62]" style={{ width: `${progress}%` }}/></div></div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#f0efec]"><span className="text-xs text-[#666] flex items-center gap-1.5">{intent.status === 'REALIZED' ? <><Users className="w-4 h-4"/>Realizada</> : <><Lock className="w-4 h-4"/>Revelação protegida</>}</span><button onClick={() => onSelectIntent(intent.id)} className="text-sm font-bold text-[#000666] flex items-center gap-1">Abrir<ArrowRight className="w-4 h-4"/></button></div>
      </article>;
    })}</div>

    {!loading && !error && nextCursor && <button type="button" onClick={() => void loadFeed(nextCursor)} disabled={loadingMore} className="w-full mt-5 py-3 rounded-xl border border-[#c6c5d4] text-sm font-bold text-[#000666] disabled:opacity-60">{loadingMore ? 'Carregando...' : 'Carregar mais'}</button>}
  </div>;
}
