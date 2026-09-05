import { useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowLeft, ArrowRight, RefreshCw, UserCheck, Users } from 'lucide-react';
import { IntentApiError, listProfileFollowers, listProfileFollowing, type ApiSocialConnection } from '../services/intentApi';

interface MvpConnectionsListProps {
  profileId: string;
  mode: 'followers' | 'following';
  onBack: () => void;
  onSelectProfile: (id: string) => void;
}

export function MvpConnectionsList({ profileId, mode, onBack, onSelectProfile }: MvpConnectionsListProps) {
  const [items, setItems] = useState<ApiSocialConnection[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const loadGeneration = useRef(0);

  async function load(cursor?: string) {
    const generation = ++loadGeneration.current;
    cursor ? setLoadingMore(true) : setLoading(true);
    setError('');
    try {
      const page = mode === 'followers'
        ? await listProfileFollowers(profileId, cursor)
        : await listProfileFollowing(profileId, cursor);
      if (generation !== loadGeneration.current) return;
      setItems((current) => cursor ? [...current, ...page.items] : page.items);
      setNextCursor(page.nextCursor);
    } catch (caught) {
      if (generation === loadGeneration.current) {
        setError(caught instanceof IntentApiError ? caught.message : 'Não foi possível carregar esta lista.');
      }
    } finally {
      if (generation === loadGeneration.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }

  useEffect(() => {
    setItems([]);
    setNextCursor(null);
    void load();
  }, [profileId, mode]);

  const title = mode === 'followers' ? 'Seguidores' : 'Seguindo';

  return <div className="max-w-2xl mx-auto w-full px-4 py-6 sm:py-8">
    <button onClick={onBack} className="mb-5 text-sm font-bold text-[#000666] flex items-center gap-2"><ArrowLeft className="w-4 h-4"/>Voltar ao perfil</button>
    <div className="flex items-center gap-3 mb-5"><div className="w-11 h-11 rounded-2xl bg-[#e0e0ff] text-[#000666] flex items-center justify-center"><Users className="w-5 h-5"/></div><div><h1 className="text-2xl font-black">{title}</h1><p className="text-xs text-[#666]">Pessoas reais conectadas a este perfil</p></div></div>

    {loading && <div className="bg-white border border-[#e4e2de] rounded-2xl p-10 text-center text-sm text-[#666]"><RefreshCw className="w-5 h-5 animate-spin mx-auto mb-3"/>Carregando pessoas...</div>}
    {!loading && error && items.length === 0 && <div className="bg-[#ffdad6] text-[#8c1d18] rounded-2xl p-5"><AlertCircle className="w-5 h-5 mb-2"/><p className="font-bold">A lista não carregou</p><p className="text-sm mt-1">{error}</p><button onClick={() => void load()} className="mt-4 text-sm font-bold underline">Tentar novamente</button></div>}
    {!loading && !error && items.length === 0 && <div className="bg-white border-2 border-dashed border-[#c6c5d4] rounded-2xl p-9 text-center"><Users className="w-7 h-7 text-[#777] mx-auto"/><p className="font-bold mt-3">Nenhuma pessoa nesta lista</p><p className="text-sm text-[#666] mt-1">As conexões aparecerão aqui quando forem criadas.</p></div>}

    <div className="space-y-3">{items.map((person) => <button key={person.id} onClick={() => onSelectProfile(person.id)} className="w-full bg-white border border-[#e4e2de] rounded-2xl p-4 text-left flex items-center gap-3 hover:border-[#000666] focus:outline-none focus:ring-2 focus:ring-[#000666]">
      <div className="w-12 h-12 rounded-full bg-[#e0e0ff] text-[#000666] overflow-hidden flex items-center justify-center font-black shrink-0">{person.avatarUrl ? <img src={person.avatarUrl} alt="" className="w-full h-full object-cover"/> : person.displayName.charAt(0).toUpperCase()}</div>
      <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="font-bold truncate">{person.displayName}</p>{person.isMe && <span className="text-[10px] bg-[#e0e0ff] text-[#000666] rounded-full px-2 py-0.5 font-bold">Você</span>}</div><p className="text-xs text-[#666] truncate">@{person.username.replace(/^@+/, '')}</p>{person.bio && <p className="text-xs text-[#454652] truncate mt-1">{person.bio}</p>}</div>
      {person.isFollowing && !person.isMe && <span className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-[#28642f]"><UserCheck className="w-3.5 h-3.5"/>Você segue</span>}
      <ArrowRight className="w-5 h-5 text-[#000666] shrink-0"/>
    </button>)}</div>

    {error && items.length > 0 && <p className="mt-4 text-sm text-[#8c1d18]">{error}</p>}
    {nextCursor && <button onClick={() => void load(nextCursor)} disabled={loadingMore} className="w-full mt-5 py-3 rounded-xl border border-[#c6c5d4] text-sm font-bold text-[#000666] disabled:opacity-60">{loadingMore ? 'Carregando...' : 'Carregar mais'}</button>}
  </div>;
}
