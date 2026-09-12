import { useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Calendar,
  Check,
  CheckCircle2,
  Compass,
  Cpu,
  Edit3,
  Film,
  Globe,
  GraduationCap,
  HandHeart,
  HeartPulse,
  Info,
  Lock,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Vote,
  X,
} from 'lucide-react';
import type { UserAccount } from '../types';
import { createSupportIntent, IntentApiError, type ApiIntent, type IntentCategory } from '../services/intentApi';

interface CreationWizardProps {
  currentUser: UserAccount;
  onCancel: () => void;
  onComplete: (createdIntent: ApiIntent) => void;
}

type IconComponent = typeof Trophy;
type VisibilityOption = 'PUBLIC' | 'FOLLOWERS' | 'PRIVATE';

interface CategoryOption {
  value: IntentCategory;
  label: string;
  icon: IconComponent;
  description: string;
  example: string;
}

interface VisibilityDetails {
  title: string;
  badge: string;
  shortDesc: string;
  feedImpact: string;
  supportImpact: string;
  icon: IconComponent;
  tone: string;
}

const categories: CategoryOption[] = [
  { value: 'SPORTS', label: 'Esportes', icon: Trophy, description: 'Palpites, desafios esportivos, metas de treino e competicoes.', example: 'Ex.: acertar o placar do classico ou completar 10 km em menos de 50 min.' },
  { value: 'ENTERTAINMENT', label: 'Entretenimento & Cultura', icon: Film, description: 'Filmes, series, musica, games, eventos e cultura pop.', example: 'Ex.: teoria sobre uma temporada ou critica guardada para depois da estreia.' },
  { value: 'TECHNOLOGY', label: 'Tecnologia & Criacao', icon: Cpu, description: 'Projetos de software, IA, hardware e lancamentos digitais.', example: 'Ex.: publicar uma versao do app ou revelar uma previsao tecnica.' },
  { value: 'EDUCATION', label: 'Educacao & Aprendizado', icon: GraduationCap, description: 'Cursos, leituras, certificacoes e metas de estudo.', example: 'Ex.: terminar um modulo, passar em uma prova ou entregar um trabalho.' },
  { value: 'HEALTH_WELLNESS', label: 'Saude & Bem-estar', icon: HeartPulse, description: 'Habitos saudaveis, treino, nutricao e equilibrio pessoal.', example: 'Ex.: 30 dias de caminhada ou manter uma rotina matinal.' },
  { value: 'CAREER_BUSINESS', label: 'Carreira & Negocios', icon: Briefcase, description: 'Metas de trabalho, vendas, carreira, startups e networking.', example: 'Ex.: conseguir os primeiros clientes ou concluir uma transicao de carreira.' },
  { value: 'COMMUNITY_CAUSES', label: 'Comunidade & Causas', icon: HandHeart, description: 'Campanhas, voluntariado, arrecadacoes e impacto coletivo.', example: 'Ex.: arrecadar doacoes ou organizar um mutirao local.' },
  { value: 'PERSONAL_LIFE', label: 'Vida Pessoal', icon: Compass, description: 'Planos pessoais, viagens, promessas e desafios de vida.', example: 'Ex.: aprender violao, fazer uma viagem ou guardar uma mensagem futura.' },
  { value: 'OTHER', label: 'Outros', icon: Sparkles, description: 'Ideias criativas que nao cabem nas outras categorias.', example: 'Ex.: uma aposta divertida ou experimento social com amigos.' },
];

const visibilityConfig: Record<VisibilityOption, VisibilityDetails> = {
  PUBLIC: {
    title: 'Publica',
    badge: 'Feed Para voce',
    shortDesc: 'Visivel para toda a rede.',
    feedImpact: 'Aparece no feed "Para voce".',
    supportImpact: 'Qualquer pessoa autenticada pode ver e apoiar.',
    icon: Globe,
    tone: 'bg-[#e0e0ff] text-[#000666]',
  },
  FOLLOWERS: {
    title: 'Somente seguidores',
    badge: 'Feed Seguindo',
    shortDesc: 'Exclusiva para quem segue seu perfil.',
    feedImpact: 'Aparece no feed "Seguindo" dos seus seguidores.',
    supportImpact: 'Quem deixar de seguir perde o acesso.',
    icon: Users,
    tone: 'bg-[#e8f5e9] text-[#2e7d32]',
  },
  PRIVATE: {
    title: 'Privada',
    badge: 'Cofre pessoal',
    shortDesc: 'Aparece somente para voce em Minhas Intents.',
    feedImpact: 'Nao aparece no feed publico nem no feed Seguindo.',
    supportImpact: 'Outras pessoas nao podem ver nem apoiar.',
    icon: Lock,
    tone: 'bg-[#fff3e0] text-[#e65100]',
  },
};

function createClientIdempotencyKey() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `intent-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function CreationWizard({ currentUser, onCancel, onComplete }: CreationWizardProps) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [category, setCategory] = useState<IntentCategory>('SPORTS');
  const [supportGoal, setSupportGoal] = useState(1);
  const [revealContent, setRevealContent] = useState('');
  const [visibility, setVisibility] = useState<VisibilityOption>('PUBLIC');
  const [error, setError] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [publishedSuccess, setPublishedSuccess] = useState<ApiIntent | null>(null);
  const idempotencyKeyRef = useRef<string | null>(null);

  const selectedCategory = useMemo(() => categories.find((item) => item.value === category) || categories[0], [category]);
  const selectedVisibility = visibilityConfig[visibility];
  const SelectedCategoryIcon = selectedCategory.icon;
  const SelectedVisibilityIcon = selectedVisibility.icon;

  function validateCurrentStep() {
    const cleanTitle = title.trim();
    const cleanStory = story.trim();
    const cleanReveal = revealContent.trim();

    if (step === 1) {
      if (cleanTitle.length < 3) return 'Informe um titulo com pelo menos 3 caracteres.';
      if (cleanTitle.length > 160) return 'O titulo nao pode ter mais de 160 caracteres.';
      if (cleanStory.length < 3) return 'Conte um pouco mais sobre o que voce quer fazer acontecer.';
      if (cleanStory.length > 5000) return 'A historia nao pode ter mais de 5.000 caracteres.';
    }

    if (step === 2) {
      if (!Number.isInteger(supportGoal) || supportGoal < 1) return 'A meta deve ser um numero inteiro a partir de 1.';
      if (supportGoal > 1_000_000) return 'A meta nao pode exceder 1.000.000 apoios.';
      if (!cleanReveal) return 'Conte o que sera revelado quando a meta for alcancada.';
      if (cleanReveal.length > 10000) return 'A revelacao nao pode ter mais de 10.000 caracteres.';
    }

    return '';
  }

  async function handleNext() {
    const validationError = validateCurrentStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');

    if (step < 3) {
      setStep((value) => value + 1);
      return;
    }

    setPublishing(true);
    idempotencyKeyRef.current ||= createClientIdempotencyKey();
    try {
      const created = await createSupportIntent({
        title: title.trim(),
        story: story.trim(),
        category,
        supportGoal,
        revealContent: revealContent.trim(),
        visibility,
      }, idempotencyKeyRef.current);
      setPublishedSuccess(created);
      window.setTimeout(() => onComplete(created), 800);
    } catch (caught) {
      if (caught instanceof IntentApiError) {
        setError(caught.status === 401 || caught.code === 'AUTH_REQUIRED'
          ? 'Sua sessao expirou. Entre novamente para publicar.'
          : caught.message || 'Nao foi possivel publicar a Intent.');
      } else {
        setError('Nao foi possivel comunicar com o servidor. Tente novamente.');
      }
      setPublishing(false);
    }
  }

  function handleBack() {
    setError('');
    if (step === 1) onCancel();
    else setStep((value) => value - 1);
  }

  if (publishedSuccess) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl border border-[#e4e2de] shadow-lg p-8 my-10 text-center">
        <div className="w-16 h-16 bg-[#e8f5e9] text-[#2e7d32] rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-[#1b1c1a]">Intent criada com sucesso</h2>
        <p className="text-sm text-[#454652] mt-2 max-w-md mx-auto">Sua Intent foi registrada e sera exibida conforme a visibilidade escolhida.</p>
        <div className="mt-6 p-4 rounded-2xl bg-[#f7f6fc] border border-[#e4e2de] text-left max-w-md mx-auto">
          <p className="text-xs font-bold text-[#000666] uppercase tracking-wider">{selectedCategory.label}</p>
          <p className="font-bold text-base mt-1 text-[#1b1c1a]">{publishedSuccess.title}</p>
          <p className="text-xs text-[#666] mt-2">Visibilidade: {visibilityConfig[publishedSuccess.visibility].title}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto bg-[#fbf9f5] min-h-[85vh] flex flex-col py-4 px-4 sm:px-6 antialiased font-sans">
      <header className="flex items-center justify-between pb-4 mb-5 border-b border-[#e4e2de]">
        <button onClick={handleBack} disabled={publishing} className="p-2 rounded-full hover:bg-[#eae8e4] text-[#454652] disabled:opacity-50" aria-label="Voltar"><ArrowLeft className="w-5 h-5" /></button>
        <div className="text-center"><h2 className="text-base font-bold text-[#000666]">Nova Intent</h2><span className="text-xs text-[#666]">Etapa {step} de 3</span></div>
        <button onClick={onCancel} disabled={publishing} className="p-2 rounded-full hover:bg-[#eae8e4] text-[#454652] disabled:opacity-50" aria-label="Fechar"><X className="w-5 h-5" /></button>
      </header>

      <div className="w-full max-w-md mx-auto mb-8">
        <div className="flex justify-between text-xs font-bold text-[#666] mb-2 px-1">
          <span className={step >= 1 ? 'text-[#000666]' : ''}>1. Ideia</span>
          <span className={step >= 2 ? 'text-[#000666]' : ''}>2. Meta</span>
          <span className={step >= 3 ? 'text-[#000666]' : ''}>3. Revisao</span>
        </div>
        <div className="h-2 w-full bg-[#e4e2de] rounded-full overflow-hidden"><div className="h-full bg-[#000666] transition-all" style={{ width: `${(step * 100) / 3}%` }} /></div>
      </div>

      {step === 1 && (
        <section className="space-y-6">
          <div className="text-center"><h1 className="text-2xl sm:text-3xl font-black text-[#1b1c1a]">O que voce quer fazer acontecer?</h1><p className="text-sm text-[#454652] mt-2">Comece simples. A Intent pode ser um palpite, desafio, promessa ou cofre pessoal.</p></div>
          <div className="bg-white rounded-2xl border border-[#e4e2de] shadow-sm p-6 space-y-5">
            <label className="block">
              <span className="flex justify-between text-xs font-bold mb-2"><span>Titulo</span><span className="text-[#888]">{title.length}/160</span></span>
              <input value={title} maxLength={160} onChange={(event) => setTitle(event.target.value)} placeholder="Ex.: Vou acertar o placar do jogo do meu time" className="w-full bg-[#fbf9f5] border border-[#c6c5d4] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#000666]" />
            </label>
            <label className="block">
              <span className="flex justify-between text-xs font-bold mb-2"><span>Conte a historia</span><span className="text-[#888]">{story.length}/5000</span></span>
              <textarea value={story} maxLength={5000} onChange={(event) => setStory(event.target.value)} rows={4} placeholder="O que voce pretende fazer e por que isso importa?" className="w-full bg-[#fbf9f5] border border-[#c6c5d4] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#000666] resize-none" />
            </label>
            <div>
              <div className="flex items-center justify-between mb-3"><span className="text-xs font-bold">Categoria</span><span className="text-xs text-[#000666] font-bold flex items-center gap-1"><SelectedCategoryIcon className="w-3.5 h-3.5" /> {selectedCategory.label}</span></div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {categories.map((item) => {
                  const Icon = item.icon;
                  const selected = category === item.value;
                  return <button key={item.value} type="button" onClick={() => setCategory(item.value)} className={`flex items-center gap-2 p-3 rounded-xl text-left border text-xs font-bold transition-colors ${selected ? 'bg-[#000666] text-white border-[#000666]' : 'bg-[#f5f3ef] text-[#454652] border-[#e4e2de] hover:bg-white'}`}><Icon className="w-4 h-4 shrink-0" /><span className="truncate">{item.label}</span></button>;
                })}
              </div>
              <div className="mt-3 p-3 rounded-xl bg-[#f0efff] border border-[#d2d1ff] text-xs text-[#1e1f4b] flex gap-2"><Info className="w-4 h-4 shrink-0 text-[#000666]" /><p><strong>{selectedCategory.description}</strong> {selectedCategory.example}</p></div>
            </div>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-6">
          <div className="text-center"><h2 className="text-2xl font-black text-[#1b1c1a]">Quando ela sera revelada?</h2><p className="text-sm text-[#454652] mt-2">No MVP, a condicao ativa e atingir uma meta de apoios.</p></div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="bg-white border-2 border-[#000666] rounded-2xl p-4"><Users className="w-5 h-5 text-[#000666]" /><p className="font-bold text-sm mt-3">Quantidade de apoios</p><p className="text-xs text-[#666] mt-1">Disponivel agora</p></div>
            <div className="bg-[#f5f3ef] border border-[#e4e2de] rounded-2xl p-4 opacity-65"><Calendar className="w-5 h-5" /><p className="font-bold text-sm mt-3">Data</p><p className="text-xs text-[#666] mt-1">Em breve</p></div>
            <div className="bg-[#f5f3ef] border border-[#e4e2de] rounded-2xl p-4 opacity-65"><Vote className="w-5 h-5" /><p className="font-bold text-sm mt-3">Guardioes</p><p className="text-xs text-[#666] mt-1">Em breve</p></div>
          </div>
          <div className="bg-white rounded-2xl border border-[#e4e2de] shadow-sm p-6 space-y-5">
            <div>
              <span className="block text-xs font-bold mb-2">Quantos apoios sao necessarios?</span>
              <div className="flex flex-wrap gap-2 mb-3">{[1, 3, 5, 10, 25].map((value) => <button key={value} type="button" onClick={() => setSupportGoal(value)} className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border ${supportGoal === value ? 'bg-[#000666] text-white border-[#000666]' : 'bg-[#fbf9f5] text-[#454652] border-[#e4e2de]'}`}>{value}</button>)}</div>
              <input type="number" inputMode="numeric" min={1} step={1} value={supportGoal} onChange={(event) => setSupportGoal(Number(event.target.value))} className="w-full bg-[#fbf9f5] border border-[#c6c5d4] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#000666]" />
              <span className="block text-xs text-[#666] mt-2">Pode ser 1, 6, 10 ou qualquer numero inteiro.</span>
            </div>
            <label className="block">
              <span className="flex justify-between text-xs font-bold mb-2"><span className="flex items-center gap-2"><Lock className="w-4 h-4" />O que sera revelado?</span><span className="text-[#888]">{revealContent.length}/10000</span></span>
              <textarea value={revealContent} maxLength={10000} onChange={(event) => setRevealContent(event.target.value)} rows={4} placeholder="Ex.: Meu palpite foi 2 a 1. Este conteudo fica protegido ate a meta." className="w-full bg-[#fbf9f5] border border-[#c6c5d4] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#000666] resize-none" />
            </label>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-6">
          <div className="text-center"><h2 className="text-2xl font-black text-[#1b1c1a]">Tudo pronto?</h2><p className="text-sm text-[#454652] mt-2">Escolha quem pode ver e confira antes de publicar.</p></div>
          <div className="grid sm:grid-cols-3 gap-3">
            {(Object.keys(visibilityConfig) as VisibilityOption[]).map((key) => {
              const config = visibilityConfig[key];
              const Icon = config.icon;
              const selected = visibility === key;
              return <button key={key} type="button" aria-pressed={selected} onClick={() => setVisibility(key)} className={`text-left rounded-2xl border p-4 transition-colors focus:outline-none focus:ring-2 focus:ring-[#000666] ${selected ? 'border-[#000666] bg-white ring-2 ring-[#000666]/10' : 'border-[#e4e2de] bg-[#f5f3ef] hover:bg-white'}`}><div className="flex items-center justify-between gap-2"><span className="flex items-center gap-2 font-bold text-sm"><Icon className="w-4 h-4 text-[#000666]" />{config.title}</span>{selected && <Check className="w-4 h-4 text-[#000666]" />}</div><span className={`inline-block mt-3 px-2 py-0.5 rounded-full text-[10px] font-bold ${config.tone}`}>{config.badge}</span><p className="text-xs text-[#666] mt-2">{config.shortDesc}</p></button>;
            })}
          </div>
          <div className="flex gap-2 text-xs text-[#454652] bg-[#f0efff] border border-[#d2d1ff] rounded-xl p-3"><SelectedVisibilityIcon className="w-4 h-4 shrink-0 text-[#000666]" /><span><strong>{selectedVisibility.title}:</strong> {selectedVisibility.feedImpact} {selectedVisibility.supportImpact}</span></div>
          <article className="bg-white rounded-2xl border border-[#e4e2de] shadow-sm p-6">
            <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-[#e0e0ff] flex items-center justify-center font-bold text-[#000666]">{currentUser.name.charAt(0).toUpperCase()}</div><div><p className="font-bold text-sm">{currentUser.name}</p><p className="text-xs text-[#666]">Agora mesmo · {selectedVisibility.title}</p></div></div>
            <div className="flex flex-wrap gap-2 mt-5"><span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#e0e0ff] text-[#000666] text-xs font-bold"><SelectedCategoryIcon className="w-3 h-3" /> {selectedCategory.label}</span><span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${selectedVisibility.tone}`}><SelectedVisibilityIcon className="w-3 h-3" /> {selectedVisibility.badge}</span></div>
            <h3 className="text-xl font-black mt-3">{title || 'Titulo da Intent'}</h3><p className="text-sm text-[#454652] mt-2 whitespace-pre-wrap">{story || 'Descricao da Intent'}</p>
            <div className="mt-5 rounded-xl bg-[#f5f3ef] p-4 flex items-center gap-3"><Lock className="w-5 h-5 text-[#000666]" /><div><p className="text-sm font-bold">0 de {supportGoal} apoios</p><p className="text-xs text-[#666]">A revelacao permanece protegida ate a meta.</p></div></div>
            <div className="grid sm:grid-cols-3 gap-3 mt-4 text-xs"><button type="button" onClick={() => setStep(1)} className="flex items-center justify-center gap-1 p-2 rounded-lg border border-[#e4e2de] font-bold text-[#000666]"><Edit3 className="w-3 h-3" />Editar ideia</button><button type="button" onClick={() => setStep(2)} className="flex items-center justify-center gap-1 p-2 rounded-lg border border-[#e4e2de] font-bold text-[#000666]"><Edit3 className="w-3 h-3" />Editar meta</button><span className="flex items-center justify-center gap-1 p-2 rounded-lg bg-[#e8f5e9] text-[#2e7d32] font-bold"><ShieldCheck className="w-3 h-3" />Pronto para publicar</span></div>
          </article>
        </section>
      )}

      {error && <div role="alert" className="mt-6 bg-[#ffdad6] text-[#8c1d18] rounded-xl px-4 py-3 text-sm font-semibold flex gap-2"><X className="w-4 h-4 shrink-0 mt-0.5 cursor-pointer" onClick={() => setError('')} /><span>{error}</span></div>}
      <footer className="mt-auto pt-8 flex items-center justify-between">
        <button onClick={handleBack} disabled={publishing} className="px-5 py-3 rounded-xl text-sm font-bold text-[#454652] hover:bg-[#eae8e4] disabled:opacity-50">{step === 1 ? 'Cancelar' : 'Voltar'}</button>
        <button onClick={handleNext} disabled={publishing} className="px-6 py-3 rounded-xl bg-[#000666] text-white text-sm font-bold flex items-center gap-2 hover:bg-[#000880] disabled:opacity-60">{publishing ? <><Sparkles className="w-4 h-4 animate-pulse" />Publicando...</> : step === 3 ? <><Check className="w-4 h-4" />Publicar Intent</> : <>Continuar<ArrowRight className="w-4 h-4" /></>}</button>
      </footer>
    </div>
  );
}
