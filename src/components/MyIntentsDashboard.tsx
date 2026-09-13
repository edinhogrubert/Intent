import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Calendar, Globe, Lock, Plus, RefreshCw, Users, Vote } from 'lucide-react';
import type { UserAccount } from '../types';
import { IntentApiError, listGuardianRequests, listMyIntents, type ApiIntent, type IntentCategory } from '../services/intentApi';

interface MyIntentsDashboardProps { currentUser: UserAccount; onCreateNew: () => void; onSelectIntent: (id: string) => void }

const categoryLabels: Record<IntentCategory, string> = {
  SPORTS: 'Esportes', ENTERTAINMENT: 'Entretenimento', TECHNOLOGY: 'Tecnologia', EDUCATION: 'Educação',
  HEALTH_WELLNESS: 'Saúde e bem-estar', CAREER_BUSINESS: 'Carreira e negócios', COMMUNITY_CAUSES: 'Comunidade e causas',
  PERSONAL_LIFE: 'Vida pessoal', OTHER: 'Outros',
};

function VisibilityBadge({ visibility }: { visibility: ApiIntent['visibility'] }) {
  if (visibility === 'PRIVATE') {
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#fff3e0] text-[#e65100] text-[11px] font-bold"><Lock className="w-3 h-3" />Privada</span>;
  }
  if (visibility === 'FOLLOWERS') {
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#e8f5e9] text-[#2e7d32] text-[11px] font-bold"><Users className="w-3 h-3" />Seguidores</span>;
  }
  return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#e0e0ff] text-[#000666] text-[11px] font-bold"><Globe className="w-3 h-3" />Publica</span>;
}

function ConditionLine({ intent }: { intent: ApiIntent }) {
  if (intent.conditionType === 'DATE') {
    return <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4"/>{intent.revealAt ? new Date(intent.revealAt).toLocaleString('pt-BR') : 'Data'}</span>;
  }
  if (intent.conditionType === 'GUARDIANS') {
    return <span className="flex items-center gap-1.5"><Vote className="w-4 h-4"/>{intent.guardianApprovals?.length ?? 0} de {intent.guardianApprovalGoal ?? 1} guardioes</span>;
  }
  return <span className="flex items-center gap-1.5"><Users className="w-4 h-4"/>{intent.supportCount} de {intent.supportGoal} apoios</span>;
}

export function MyIntentsDashboard({ currentUser, onCreateNew, onSelectIntent }: MyIntentsDashboardProps) {
  const [intents, setIntents] = useState<ApiIntent[]>([]);
  const [guardianRequests, setGuardianRequests] = useState<ApiIntent[]>([]);
  const [filter, setFilter] = useState<'active' | 'realized' | 'approvals'>('active');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadIntents() {
    setLoading(true); setError('');
    try {
      const [mine, approvals] = await Promise.all([listMyIntents(), listGuardianRequests()]);
      setIntents(mine.items);
      setGuardianRequests(approvals.items);
    }
    catch (caught) { setError(caught instanceof IntentApiError ? caught.message : 'Não foi possível carregar suas Intents.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { void loadIntents(); }, []);
  const visible = useMemo(() => {
    if (filter === 'approvals') return guardianRequests;
    return intents.filter((intent) => filter === 'active' ? intent.status === 'PUBLISHED' : intent.status === 'REALIZED');
  }, [guardianRequests, intents, filter]);
  const totalSupports = intents.reduce((sum, intent) => sum + intent.supportCount, 0);

  return <div className="w-full max-w-6xl mx-auto bg-[#fbf9f5] min-h-screen py-4 px-4 sm:px-6 antialiased font-sans">
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6"><div><h2 className="text-2xl font-black text-[#000666]">Minhas Intents</h2><p className="text-sm text-[#454652] mt-1">Acompanhe o progresso do que você colocou em movimento.</p></div><button onClick={onCreateNew} className="px-5 py-3 bg-[#000666] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2"><Plus className="w-4 h-4"/>Criar nova</button></div>
    <div className="grid sm:grid-cols-4 gap-3 mb-6"><div className="bg-white border border-[#e4e2de] rounded-2xl p-4"><p className="text-xs text-[#666]">Intents publicadas</p><p className="text-2xl font-black mt-1">{intents.length}</p></div><div className="bg-white border border-[#e4e2de] rounded-2xl p-4"><p className="text-xs text-[#666]">Apoios recebidos</p><p className="text-2xl font-black mt-1">{totalSupports}</p></div><div className="bg-white border border-[#e4e2de] rounded-2xl p-4"><p className="text-xs text-[#666]">Realizadas</p><p className="text-2xl font-black mt-1">{intents.filter((item) => item.status === 'REALIZED').length}</p></div><div className="bg-white border border-[#e4e2de] rounded-2xl p-4"><p className="text-xs text-[#666]">Para aprovar</p><p className="text-2xl font-black mt-1">{guardianRequests.filter((item) => item.status === 'PUBLISHED' && !item.viewerHasApprovedAsGuardian).length}</p></div></div>
    <div className="flex gap-2 mb-5 overflow-x-auto pb-1"><button onClick={() => setFilter('active')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${filter === 'active' ? 'bg-[#000666] text-white' : 'bg-white border border-[#e4e2de]'}`}>Ativas</button><button onClick={() => setFilter('realized')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${filter === 'realized' ? 'bg-[#000666] text-white' : 'bg-white border border-[#e4e2de]'}`}>Realizadas</button><button onClick={() => setFilter('approvals')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${filter === 'approvals' ? 'bg-[#000666] text-white' : 'bg-white border border-[#e4e2de]'}`}>Para aprovar</button><button onClick={() => void loadIntents()} className="ml-auto p-2 rounded-full bg-white border border-[#e4e2de] shrink-0" aria-label="Atualizar"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}/></button></div>
    {loading && <div className="bg-white border border-[#e4e2de] rounded-2xl p-10 text-center text-sm text-[#666]">Carregando suas Intents...</div>}
    {!loading && error && <div className="bg-[#ffdad6] text-[#8c1d18] rounded-2xl p-5 flex items-start gap-3"><AlertCircle className="w-5 h-5 shrink-0"/><div><p className="font-bold">Não foi possível carregar</p><p className="text-sm mt-1">{error}</p><button onClick={() => void loadIntents()} className="mt-3 underline text-sm font-bold">Tentar novamente</button></div></div>}
    {!loading && !error && visible.length === 0 && <div className="bg-white border-2 border-dashed border-[#c6c5d4] rounded-2xl p-10 text-center"><div className="w-12 h-12 rounded-full bg-[#e0e0ff] text-[#000666] flex items-center justify-center mx-auto"><Plus className="w-6 h-6"/></div><h3 className="font-bold mt-4">{filter === 'active' ? 'Nenhuma Intent ativa' : filter === 'approvals' ? 'Nenhuma Intent para aprovar' : 'Nenhuma Intent realizada ainda'}</h3><p className="text-sm text-[#666] mt-2">{filter === 'approvals' ? 'Quando alguém escolher você como guardião, a Intent aparecerá aqui.' : `${currentUser.name}, crie uma Intent simples e acompanhe os apoios aqui.`}</p>{filter === 'active' && <button onClick={onCreateNew} className="mt-5 px-5 py-3 bg-[#000666] text-white rounded-xl text-sm font-bold">Criar minha primeira Intent</button>}</div>}
    {!loading && !error && visible.length > 0 && <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{visible.map((intent) => {
      const progress = intent.conditionType === 'SUPPORT'
        ? Math.min(100, Math.round(intent.supportCount * 100 / intent.supportGoal))
        : intent.conditionType === 'GUARDIANS'
          ? Math.min(100, Math.round(((intent.guardianApprovals?.length ?? 0) * 100) / (intent.guardianApprovalGoal ?? 1)))
          : intent.status === 'REALIZED' ? 100 : 0;
      return <article key={intent.id} onClick={() => onSelectIntent(intent.id)} className="bg-white rounded-2xl border border-[#e4e2de] shadow-sm hover:shadow-md p-5 cursor-pointer">
        <div className="flex justify-between items-center gap-2"><span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${intent.status === 'REALIZED' ? 'bg-[#e8f5e9] text-[#2e7d32]' : 'bg-[#e0e0ff] text-[#000666]'}`}>{intent.status === 'REALIZED' ? 'Realizada' : 'Em andamento'}</span><span className="text-xs text-[#666]">{categoryLabels[intent.category] || 'Outros'}</span></div>
        <div className="mt-3"><VisibilityBadge visibility={intent.visibility} /></div>
        <h3 className="font-bold mt-4 line-clamp-2">{intent.title}</h3><p className="text-sm text-[#666] mt-2 line-clamp-2">{intent.story}</p>
        <div className="mt-5"><div className="flex justify-between text-xs font-bold"><ConditionLine intent={intent} /><span className="text-[#006a62]">{progress}%</span></div><div className="h-2 bg-[#E0F2F1] rounded-full overflow-hidden mt-2"><div className="h-full bg-[#006a62]" style={{ width: `${progress}%` }}/></div></div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#f0efec] text-xs text-[#666]"><span className="flex items-center gap-1.5"><Users className="w-4 h-4"/>{filter === 'approvals' ? 'Você é guardião' : `${intent.supportCount} mobilizados`}</span><span className="flex items-center gap-1.5"><Lock className="w-4 h-4"/>{intent.status === 'REALIZED' ? 'Revelada' : intent.viewerHasApprovedAsGuardian ? 'Aprovada por você' : 'Protegida'}</span></div>
      </article>;
    })}</div>}
  </div>;
}
