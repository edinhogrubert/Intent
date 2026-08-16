import React, { useState, useEffect } from 'react';
import {
  Users,
  Heart,
  Sparkles,
  Unlock,
  Lock,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
  Zap,
  ThumbsUp,
  Clock,
  EyeOff,
  UserPlus,
  X,
} from 'lucide-react';
import { Intent, Supporter } from '../types';

interface PublicSupportWorkflowProps {
  intent: Intent;
  currentSupports?: number;
  targetSupports?: number;
  supporters?: Supporter[];
  onAddSupport?: (amount: number, supporterName?: string, comment?: string) => void;
  onSetSupports?: (amount: number) => void;
  onReveal?: () => void;
  isRevealed?: boolean;
  revealContent?: string;
  variant?: 'interactive_hero' | 'compact' | 'full';
}

const DEFAULT_SAMPLE_SUPPORTERS: Supporter[] = [
  {
    id: 'sup-1',
    name: 'Ana Souza',
    supported_at: new Date(Date.now() - 60000 * 12).toISOString(),
    comment: 'Causa essencial! Total apoio para revelação dos dados.',
  },
  {
    id: 'sup-2',
    name: 'Lucas Viana',
    supported_at: new Date(Date.now() - 60000 * 35).toISOString(),
    comment: 'Assinado e compartilhado com a rede.',
  },
  {
    id: 'sup-3',
    name: 'Beatriz Lima',
    supported_at: new Date(Date.now() - 60000 * 120).toISOString(),
    comment: 'Pela transparência e impacto comunitário!',
  },
];

export function PublicSupportWorkflow({
  intent,
  currentSupports = 10,
  targetSupports = 100,
  supporters = DEFAULT_SAMPLE_SUPPORTERS,
  onAddSupport,
  onSetSupports,
  onReveal,
  isRevealed = false,
  revealContent,
  variant = 'interactive_hero',
}: PublicSupportWorkflowProps) {
  const [newSupporterName, setNewSupporterName] = useState('');
  const [newComment, setNewComment] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [justSupported, setJustSupported] = useState(false);
  const [revealWindowHours, setRevealWindowHours] = useState<number>(
    intent.reveal_window?.duration_hours || intent.reveal_window_hours || 24
  );

  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const supportsCount = intent.current_supports ?? currentSupports;
  const targetCount = intent.target_supports ?? targetSupports;
  const isTargetReached = supportsCount >= targetCount;
  const percentage = Math.min(100, Math.round((supportsCount / targetCount) * 100));

  const isActuallyRevealed = isRevealed || !!intent.revealed_at;
  const revealStartTime = intent.reveal_window?.reveal_started_at || intent.revealed_at;
  
  let expiresAtTimestamp: number | null = null;
  if (intent.reveal_window?.expires_at || intent.expires_at) {
    expiresAtTimestamp = new Date(intent.reveal_window?.expires_at || intent.expires_at!).getTime();
  } else if (revealStartTime) {
    expiresAtTimestamp = new Date(revealStartTime).getTime() + revealWindowHours * 3600 * 1000;
  }

  const isWindowExpired = !!(expiresAtTimestamp && currentTime >= expiresAtTimestamp);

  let formattedWindowCountdown = `${revealWindowHours}h 00m (após revelar)`;
  let windowProgress = 0;
  if (revealStartTime && expiresAtTimestamp) {
    const totalMs = revealWindowHours * 3600 * 1000;
    const startMs = new Date(revealStartTime).getTime();
    const elapsedMs = Math.max(0, currentTime - startMs);
    windowProgress = Math.min(100, Math.round((elapsedMs / totalMs) * 100));

    if (isWindowExpired) {
      formattedWindowCountdown = 'EXPIRADO (00h 00m)';
    } else {
      const remainingSec = Math.floor((expiresAtTimestamp - currentTime) / 1000);
      const h = Math.floor(remainingSec / 3600);
      const m = Math.floor((remainingSec % 3600) / 60);
      const s = remainingSec % 60;
      formattedWindowCountdown = `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
    }
  }

  let activeStep = 1;
  if (isTargetReached && !isActuallyRevealed) activeStep = 2;
  if (isActuallyRevealed && !isWindowExpired) activeStep = 3;
  if (isWindowExpired) activeStep = 4;

  const handleSupportClick = (amount = 1) => {
    if (onAddSupport) {
      onAddSupport(amount, newSupporterName || undefined, newComment || undefined);
    } else if (onSetSupports) {
      onSetSupports(supportsCount + amount);
    }
    setJustSupported(true);
    setTimeout(() => setJustSupported(false), 1200);
    setNewSupporterName('');
    setNewComment('');
    setShowAddModal(false);
  };

  const handleSimulateTarget = () => {
    if (onSetSupports) {
      onSetSupports(targetCount);
    } else if (onAddSupport) {
      onAddSupport(targetCount - supportsCount);
    }
    setJustSupported(true);
    setTimeout(() => setJustSupported(false), 1200);
  };

  const handleResetToTen = () => {
    if (onSetSupports) {
      onSetSupports(10);
    }
  };

  if (variant === 'compact') {
    return (
      <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
          <div className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-[#0055FF] fill-[#0055FF]/20" />
            <span>Participação Pública</span>
          </div>
          <span className="font-mono font-bold text-[#0055FF]">
            {supportsCount} / {targetCount} ({percentage}%)
          </span>
        </div>

        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isTargetReached ? 'bg-emerald-500' : 'bg-[#0055FF]'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-0.5">
          <span className="flex items-center gap-1 text-amber-700 font-bold">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Janela: {revealWindowHours}h pós-revelação</span>
          </span>
          {isActuallyRevealed && (
            <span className={`font-bold ${isWindowExpired ? 'text-rose-600' : 'text-emerald-700'}`}>
              {formattedWindowCountdown}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => handleSupportClick(1)}
            disabled={isWindowExpired}
            className="px-2.5 py-1 bg-[#0055FF] hover:bg-[#0047E0] disabled:opacity-50 text-white rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <ThumbsUp className="w-3 h-3" />
            <span>Apoiar (+1)</span>
          </button>

          {isTargetReached && !isActuallyRevealed && onReveal && (
            <button
              type="button"
              onClick={onReveal}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <Unlock className="w-3 h-3" />
              <span>REVELAR ({revealWindowHours}h)</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      id="public-support-workflow-hero"
      className="p-6 md:p-8 rounded-3xl bg-white text-slate-800 border border-[#DCE7F6] shadow-xs space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#EAF2FF] text-[#0055FF] flex items-center justify-center font-bold shadow-2xs shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#0055FF] bg-[#EAF2FF] px-2.5 py-0.5 rounded-full">
                Etapa 7 — Participação Pública
              </span>
              <span className="text-[11px] font-mono text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1 font-bold">
                <Clock className="w-3 h-3" />
                <span>Janela: {revealWindowHours}h</span>
              </span>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 mt-1 tracking-tight">
              Mobilização de Apoios & Revelação Efêmera
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleResetToTen}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            Resetar (10 / 100)
          </button>
          <button
            type="button"
            onClick={handleSimulateTarget}
            className="px-3.5 py-1.5 rounded-xl bg-[#0055FF] hover:bg-[#0047E0] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-yellow-300" />
            <span>Simular 100 / 100</span>
          </button>
        </div>
      </div>

      {/* Triad of State: CONDITION ➔ REVEAL_WINDOW (24h) ➔ EXPIRATION */}
      <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Fluxo da Intenção Pública (Etapa 7):</span>
          <span className="font-mono text-[11px] text-slate-500 font-bold">
            {isWindowExpired
              ? 'Status: JANELA EXPIRADA ✕'
              : isActuallyRevealed
              ? `Status: REVELADO (${formattedWindowCountdown})`
              : isTargetReached
              ? 'Status: 100 / 100 — Pronto para revelar!'
              : `Status: ${supportsCount} / ${targetCount} Apoios`}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-[11px] font-mono">
          {[
            { step: 1, label: '1. Condição', desc: `${targetCount} Apoios`, icon: Users },
            { step: 2, label: '2. Satisfeita', desc: 'Meta Atingida', icon: CheckCircle2 },
            { step: 3, label: '3. Janela 24h', desc: 'Revelação Ativa', icon: Clock },
            { step: 4, label: '4. Expiração', desc: 'Conteúdo Fecha', icon: EyeOff },
          ].map((item) => {
            const isCurrent = activeStep === item.step;
            const isCompleted = activeStep > item.step;
            const Icon = item.icon;

            return (
              <div
                key={item.step}
                className={`p-3 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 ${
                  isCurrent
                    ? item.step === 4
                      ? 'bg-rose-50 text-rose-700 border-rose-300 font-bold'
                      : 'bg-[#EAF2FF] text-[#0055FF] border-[#0055FF] font-bold'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold'
                    : 'bg-white text-slate-400 border-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs font-bold uppercase">{item.label}</span>
                <span className="text-[10px] opacity-80">{item.desc}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Counter & Progress */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        <div className="md:col-span-7 p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase">
                <TrendingUp className="w-4 h-4 text-[#0055FF]" />
                <span>Contador Coletivo de Apoios</span>
              </span>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  isTargetReached
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-[#EAF2FF] text-[#0055FF]'
                }`}
              >
                {percentage}% da Meta
              </span>
            </div>

            <div className="flex items-baseline justify-between py-3">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-mono">
                    {supportsCount}
                  </span>
                  <span className="text-xl md:text-2xl font-bold text-slate-400 font-mono">
                    / {targetCount}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  {isTargetReached
                    ? `🎉 Meta atingida! Ao clicar em Revelar, o conteúdo fica aberto por ${revealWindowHours}h.`
                    : `Faltam ${targetCount - supportsCount} apoios para destrancar a janela.`}
                </p>
              </div>

              <Heart
                className={`w-10 h-10 transition-all duration-300 ${
                  justSupported
                    ? 'scale-125 text-rose-500 fill-rose-500'
                    : isTargetReached
                    ? 'text-emerald-500 fill-emerald-500/20'
                    : 'text-slate-400'
                }`}
              />
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-700 rounded-full ${
                    isTargetReached ? 'bg-emerald-500' : 'bg-[#0055FF]'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-slate-500">
                <span>0</span>
                <span className="font-bold">Meta: {targetCount} Apoios</span>
                <span className="font-bold text-amber-700">Janela: {revealWindowHours}h</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3">
            <button
              type="button"
              disabled={isWindowExpired}
              onClick={() => handleSupportClick(1)}
              className="py-2.5 px-3 rounded-xl bg-[#0055FF] hover:bg-[#0047E0] disabled:opacity-40 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>+1 Apoiar</span>
            </button>

            <button
              type="button"
              disabled={isWindowExpired}
              onClick={() => handleSupportClick(10)}
              className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Users className="w-4 h-4 text-[#0055FF]" />
              <span>+10 Mobilizar</span>
            </button>

            <button
              type="button"
              disabled={isWindowExpired}
              onClick={() => setShowAddModal(true)}
              className="col-span-2 sm:col-span-1 py-2.5 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-slate-500" />
              <span>Comentar</span>
            </button>
          </div>
        </div>

        {/* Right: Ephemeral Window Simulator */}
        <div className="md:col-span-5 p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Janela Efêmera ({revealWindowHours}h)</span>
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isWindowExpired
                    ? 'bg-rose-100 text-rose-800'
                    : isActuallyRevealed
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {isWindowExpired
                  ? 'Expirada'
                  : isActuallyRevealed
                  ? 'Ativa'
                  : 'Aguardando Meta'}
              </span>
            </div>

            <div className="py-3">
              <div className="text-2xl md:text-3xl font-black text-slate-900 font-mono tracking-tight">
                {formattedWindowCountdown}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {isWindowExpired
                  ? 'A janela de 24 horas encerrou. O segredo foi re-selado.'
                  : isActuallyRevealed
                  ? 'O conteúdo está revelado neste momento. O cronômetro regride em tempo real.'
                  : 'Ao bater 100 apoios, a revelação tem duração máxima de 24h.'}
              </p>
            </div>

            {isActuallyRevealed && !isWindowExpired && (
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>Tempo decorrido</span>
                  <span>{windowProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${windowProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            {isTargetReached && !isActuallyRevealed && onReveal && (
              <button
                type="button"
                onClick={onReveal}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Unlock className="w-4 h-4" />
                <span>Disparar Revelação Efêmera ({revealWindowHours}h)</span>
              </button>
            )}

            {isActuallyRevealed && (
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 shadow-2xs">
                <span className="font-bold text-emerald-700 block mb-1">
                  ✓ Conteúdo Revelado:
                </span>
                <p className="font-mono text-slate-600 line-clamp-2">
                  {revealContent || intent.reveal_content || 'Documento confidencial liberado temporariamente.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Adicionar Apoio com Comentário */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#0055FF]" />
                <span>Apoiar esta Intenção Pública</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Seu Nome:
                </label>
                <input
                  type="text"
                  placeholder="Ex: Carlos Silva"
                  value={newSupporterName}
                  onChange={(e) => setNewSupporterName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Comentário / Mensagem de Apoio:
                </label>
                <textarea
                  rows={3}
                  placeholder="Por que você apoia a revelação desta Intent?"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleSupportClick(1)}
                className="px-5 py-2 rounded-xl bg-[#0055FF] text-white text-xs font-bold hover:bg-[#0047E0] transition-colors cursor-pointer"
              >
                Confirmar Apoio (+1)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
