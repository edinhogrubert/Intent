import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Calendar, Check, Lock, ShieldCheck, Sparkles, Users, Vote, X } from 'lucide-react';
import type { UserAccount } from '../types';
import { createSupportIntent, IntentApiError, type ApiIntent, type IntentCategory } from '../services/intentApi';

interface CreationWizardProps {
  currentUser: UserAccount;
  onCancel: () => void;
  onComplete: (createdIntent: ApiIntent) => void;
}

const categories: Array<{ value: IntentCategory; label: string }> = [
  { value: 'SPORTS', label: 'Esportes' },
  { value: 'ENTERTAINMENT', label: 'Entretenimento' },
  { value: 'TECHNOLOGY', label: 'Tecnologia' },
  { value: 'EDUCATION', label: 'Educação' },
  { value: 'HEALTH_WELLNESS', label: 'Saúde e bem-estar' },
  { value: 'CAREER_BUSINESS', label: 'Carreira e negócios' },
  { value: 'COMMUNITY_CAUSES', label: 'Comunidade e causas' },
  { value: 'PERSONAL_LIFE', label: 'Vida pessoal' },
  { value: 'OTHER', label: 'Outros' },
];

export function CreationWizard({ currentUser, onCancel, onComplete }: CreationWizardProps) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [category, setCategory] = useState<IntentCategory>('SPORTS');
  const [supportGoal, setSupportGoal] = useState(1);
  const [revealContent, setRevealContent] = useState('');
  const visibility = 'PUBLIC' as const;
  const [error, setError] = useState('');
  const [publishing, setPublishing] = useState(false);

  const categoryLabel = useMemo(() => categories.find((item) => item.value === category)?.label || 'Outros', [category]);

  function validateCurrentStep() {
    if (step === 1 && (title.trim().length < 3 || story.trim().length < 3)) {
      return 'Informe um título e uma descrição com pelo menos 3 caracteres.';
    }
    if (step === 2 && (!Number.isInteger(supportGoal) || supportGoal < 1)) {
      return 'A meta deve ser um número inteiro a partir de 1.';
    }
    if (step === 2 && !revealContent.trim()) return 'Conte o que será revelado quando a meta for alcançada.';
    return '';
  }

  async function handleNext() {
    const validationError = validateCurrentStep();
    if (validationError) { setError(validationError); return; }
    setError('');
    if (step < 3) { setStep((value) => value + 1); return; }

    setPublishing(true);
    try {
      const created = await createSupportIntent({
        title: title.trim(), story: story.trim(), category, supportGoal,
        revealContent: revealContent.trim(), visibility,
      });
      onComplete(created);
    } catch (caught) {
      setError(caught instanceof IntentApiError ? caught.message : 'Não foi possível publicar. Tente novamente.');
    } finally {
      setPublishing(false);
    }
  }

  function handleBack() {
    setError('');
    if (step === 1) onCancel(); else setStep((value) => value - 1);
  }

  return (
    <div className="w-full max-w-3xl mx-auto bg-[#fbf9f5] min-h-[85vh] flex flex-col py-4 px-4 sm:px-6 antialiased font-sans">
      <header className="flex items-center justify-between pb-4 mb-5 border-b border-[#e4e2de]">
        <button onClick={handleBack} className="p-2 rounded-full hover:bg-[#eae8e4] text-[#454652]" aria-label="Voltar"><ArrowLeft className="w-5 h-5" /></button>
        <div className="text-center"><h2 className="text-base font-bold text-[#000666]">Nova Intent</h2><span className="text-xs text-[#666]">Etapa {step} de 3</span></div>
        <button onClick={onCancel} className="p-2 rounded-full hover:bg-[#eae8e4] text-[#454652]" aria-label="Fechar"><X className="w-5 h-5" /></button>
      </header>

      <div className="h-2 w-full max-w-md mx-auto bg-[#e4e2de] rounded-full overflow-hidden mb-8"><div className="h-full bg-[#000666] transition-all" style={{ width: `${step * 100 / 3}%` }} /></div>

      {step === 1 && <section className="space-y-6">
        <div className="text-center"><h1 className="text-2xl sm:text-3xl font-black text-[#1b1c1a]">O que você quer fazer acontecer?</h1><p className="text-sm text-[#454652] mt-2">Conte de forma simples. Você poderá evoluir a Intent depois.</p></div>
        <div className="bg-white rounded-2xl border border-[#e4e2de] shadow-sm p-6 space-y-5">
          <label className="block"><span className="block text-xs font-bold mb-2">Título</span><input value={title} maxLength={160} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Vou acertar o placar do jogo do meu time" className="w-full bg-[#fbf9f5] border border-[#c6c5d4] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#000666]" /></label>
          <label className="block"><span className="block text-xs font-bold mb-2">Conte a história</span><textarea value={story} maxLength={5000} onChange={(e) => setStory(e.target.value)} rows={4} placeholder="O que você pretende fazer e por que isso importa?" className="w-full bg-[#fbf9f5] border border-[#c6c5d4] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#000666] resize-none" /></label>
          <div><span className="block text-xs font-bold mb-2">Assunto</span><div className="flex flex-wrap gap-2">{categories.map((item) => <button key={item.value} type="button" onClick={() => setCategory(item.value)} className={`px-3.5 py-2 rounded-full text-xs font-bold border ${category === item.value ? 'bg-[#000666] text-white border-[#000666]' : 'bg-[#f5f3ef] text-[#454652] border-[#e4e2de]'}`}>{item.label}</button>)}</div></div>
        </div>
      </section>}

      {step === 2 && <section className="space-y-6">
        <div className="text-center"><h2 className="text-2xl font-black text-[#1b1c1a]">Quando ela será revelada?</h2><p className="text-sm text-[#454652] mt-2">No MVP, a condição disponível é atingir apoios.</p></div>
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="bg-white border-2 border-[#000666] rounded-2xl p-4"><Users className="w-5 h-5 text-[#000666]"/><p className="font-bold text-sm mt-3">Quantidade de apoios</p><p className="text-xs text-[#666] mt-1">Disponível agora</p></div>
          <div className="bg-[#f5f3ef] border border-[#e4e2de] rounded-2xl p-4 opacity-65"><Calendar className="w-5 h-5"/><p className="font-bold text-sm mt-3">Data</p><p className="text-xs text-[#666] mt-1">Em breve</p></div>
          <div className="bg-[#f5f3ef] border border-[#e4e2de] rounded-2xl p-4 opacity-65"><Vote className="w-5 h-5"/><p className="font-bold text-sm mt-3">Guardiões</p><p className="text-xs text-[#666] mt-1">Em breve, com seleção real</p></div>
        </div>
        <div className="bg-white rounded-2xl border border-[#e4e2de] shadow-sm p-6 space-y-5">
          <label className="block"><span className="block text-xs font-bold mb-2">Quantos apoios são necessários?</span><input type="number" inputMode="numeric" min={1} step={1} value={supportGoal} onChange={(e) => setSupportGoal(Number(e.target.value))} className="w-full bg-[#fbf9f5] border border-[#c6c5d4] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#000666]" /><span className="block text-xs text-[#666] mt-2">Pode ser 1, 6, 10 ou qualquer número inteiro.</span></label>
          <label className="block"><span className="flex items-center gap-2 text-xs font-bold mb-2"><Lock className="w-4 h-4"/>O que será revelado?</span><textarea value={revealContent} maxLength={10000} onChange={(e) => setRevealContent(e.target.value)} rows={4} placeholder="Ex.: Meu palpite foi 2 a 1. Este conteúdo fica protegido até a meta." className="w-full bg-[#fbf9f5] border border-[#c6c5d4] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#000666] resize-none" /></label>
        </div>
      </section>}

      {step === 3 && <section className="space-y-6">
        <div className="text-center"><h2 className="text-2xl font-black text-[#1b1c1a]">Tudo pronto?</h2><p className="text-sm text-[#454652] mt-2">Confira antes de publicar.</p></div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="text-left rounded-2xl border border-[#000666] bg-white ring-2 ring-[#000666]/10 p-4"><p className="font-bold text-sm">Pública</p><p className="text-xs text-[#666] mt-1">Aparece no feed e pode ser apoiada por todos.</p></div>
          <div className="text-left rounded-2xl border border-[#e4e2de] bg-[#f5f3ef] p-4 opacity-65"><p className="font-bold text-sm">Seguidores e grupos</p><p className="text-xs text-[#666] mt-1">Em breve, quando as relações sociais estiverem ativas.</p></div>
        </div>
        <article className="bg-white rounded-2xl border border-[#e4e2de] shadow-sm p-6">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-[#e0e0ff] flex items-center justify-center font-bold text-[#000666]">{currentUser.name.charAt(0).toUpperCase()}</div><div><p className="font-bold text-sm">{currentUser.name}</p><p className="text-xs text-[#666]">Agora mesmo · Pública</p></div></div>
          <span className="inline-block mt-5 px-2.5 py-1 rounded-full bg-[#e0e0ff] text-[#000666] text-xs font-bold">{categoryLabel}</span>
          <h3 className="text-xl font-black mt-3">{title}</h3><p className="text-sm text-[#454652] mt-2 whitespace-pre-wrap">{story}</p>
          <div className="mt-5 rounded-xl bg-[#f5f3ef] p-4 flex items-center gap-3"><Lock className="w-5 h-5 text-[#000666]"/><div><p className="text-sm font-bold">0 de {supportGoal} apoios</p><p className="text-xs text-[#666]">A revelação permanece protegida até a meta.</p></div></div>
        </article>
        <div className="flex gap-2 text-xs text-[#454652] bg-[#e8f5e9] border border-[#a5d6a7] rounded-xl p-3"><ShieldCheck className="w-4 h-4 shrink-0 text-[#2e7d32]"/>A publicação será gravada no PostgreSQL. Se houver erro, você continuará nesta tela.</div>
      </section>}

      {error && <div role="alert" className="mt-6 bg-[#ffdad6] text-[#8c1d18] rounded-xl px-4 py-3 text-sm font-semibold">{error}</div>}
      <footer className="mt-auto pt-8 flex items-center justify-between">
        <button onClick={handleBack} disabled={publishing} className="px-5 py-3 rounded-xl text-sm font-bold text-[#454652] hover:bg-[#eae8e4] disabled:opacity-50">Voltar</button>
        <button onClick={handleNext} disabled={publishing} className="px-6 py-3 rounded-xl bg-[#000666] text-white text-sm font-bold flex items-center gap-2 hover:bg-[#000880] disabled:opacity-60">{publishing ? <><Sparkles className="w-4 h-4 animate-pulse"/>Publicando...</> : step === 3 ? <><Check className="w-4 h-4"/>Publicar Intent</> : <>Continuar<ArrowRight className="w-4 h-4"/></>}</button>
      </footer>
    </div>
  );
}
