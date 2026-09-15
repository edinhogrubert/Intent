import { useEffect, useState } from 'react';
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import { getPublicUserProfile, IntentApiError, type ApiPublicUserProfile } from '../services/intentApi';

interface Props {
  userId: string;
  onBack: () => void;
  onSelectIntent: (id: string) => void;
}

export function PublicUserProfile({ userId, onBack, onSelectIntent }: Props) {
  const [profile, setProfile] = useState<ApiPublicUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    setLoading(true); setError(''); setProfile(null);
    void getPublicUserProfile(userId)
      .then((value) => { if (active) setProfile(value); })
      .catch((caught) => { if (active) setError(caught instanceof IntentApiError
        ? caught.message : 'Não foi possível carregar este perfil.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [userId]);

  return <section className="max-w-3xl mx-auto px-4 py-6">
    <button type="button" onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-[#000666] mb-5"><ArrowLeft className="w-4 h-4"/>Voltar ao início</button>
    {loading && <p role="status" className="p-8 text-center"><LoaderCircle className="w-6 h-6 animate-spin mx-auto mb-2"/>Carregando perfil...</p>}
    {error && <p role="alert" className="p-4 rounded-xl bg-[#ffdad6] text-[#8c1d18]">{error}</p>}
    {!loading && profile && <>
      <header className="rounded-3xl border border-[#e4e2de] bg-white p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#e0e0ff] overflow-hidden flex items-center justify-center text-2xl font-black text-[#000666] shrink-0">
            {profile.avatarUrl ? <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover"/> : profile.displayName.charAt(0).toUpperCase()}
          </div>
          <div><h1 className="text-2xl font-black">{profile.displayName}</h1><p className="text-sm text-[#666]">@{profile.username}</p></div>
        </div>
        <p className="mt-4 text-xs text-[#666]">Membro desde {new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(profile.createdAt))}</p>
        {profile.bio && <p className="mt-3 whitespace-pre-wrap break-words text-sm">{profile.bio}</p>}
        <h2 className="mt-6 font-bold">Histórico público de acontecimentos</h2>
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
          {([
            ['Intents públicas', profile.stats.publicIntentsCount],
            ['Realizações', profile.stats.intentsRealized],
            ['Apoios recebidos', profile.stats.totalSupportReceived],
            ['Reações recebidas', profile.stats.totalReactionsReceived],
            ['Comentários recebidos', profile.stats.totalCommentsReceived],
          ] as const).map(([label, value]) => <div key={label} className="rounded-xl bg-[#f7f6fc] p-3"><dt className="text-xs text-[#666]">{label}</dt><dd className="text-xl font-black text-[#000666]">{value}</dd></div>)}
        </dl>
      </header>
      <h2 className="text-lg font-black mt-6 mb-3">Intents públicas recentes</h2>
      {profile.intents.length === 0 && <p className="bg-white rounded-xl p-6 text-[#666]">Nenhuma Intent pública ainda.</p>}
      <div className="space-y-3">{profile.intents.map((intent) => <article key={intent.id} className="rounded-2xl border border-[#e4e2de] bg-white p-5">
        <p className="text-xs font-bold text-[#000666]">{intent.status === 'REALIZED' ? 'Realizada' : 'Em andamento'} · {intent.supportCount} apoios</p>
        <h3 className="font-black mt-2 break-words">{intent.title}</h3>
        <p className="text-sm text-[#666] mt-2 whitespace-pre-wrap break-words line-clamp-3">{intent.story}</p>
        <button type="button" onClick={() => onSelectIntent(intent.id)} className="mt-4 text-sm font-bold text-[#000666]">Abrir Intent</button>
      </article>)}</div>
    </>}
  </section>;
}
