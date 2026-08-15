import React, { useState } from 'react';
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
  UserPlus,
  ArrowRight,
  ShieldCheck,
  Share2,
  ThumbsUp,
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

  const supportsCount = intent.current_supports ?? currentSupports;
  const targetCount = intent.target_supports ?? targetSupports;
  const isTargetReached = supportsCount >= targetCount;
  const percentage = Math.min(100, Math.round((supportsCount / targetCount) * 100));

  // Determine current active step in user's sequence: Intent ➔ Apoios ➔ 10/100 ➔ 100/100 ➔ REVELAR
  let activeStep = 1; // 1: Intent
  if (supportsCount > 0 && supportsCount < targetCount) activeStep = 3; // 10/100
  if (supportsCount >= targetCount) activeStep = 4; // 100/100
  if (isRevealed || intent.revealed_at) activeStep = 5; // REVELAR

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

  // Compact Variant for cards
  if (variant === 'compact') {
    return (
      <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-indigo-950">
          <div className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-indigo-600 fill-indigo-500" />
            <span>Participação Pública</span>
          </div>
          <span className="font-mono font-black text-indigo-700">
            {supportsCount} / {targetCount} apoios ({percentage}%)
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-indigo-200/80 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isTargetReached ? 'bg-emerald-500' : 'bg-indigo-600'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => handleSupportClick(1)}
            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <ThumbsUp className="w-3 h-3" />
            <span>Apoiar (+1)</span>
          </button>

          {isTargetReached && !isRevealed && onReveal && (
            <button
              type="button"
              onClick={onReveal}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-black transition-all flex items-center gap-1 animate-pulse cursor-pointer"
            >
              <Unlock className="w-3 h-3" />
              <span>REVELAR</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      id="public-support-workflow-hero"
      className="p-5 md:p-7 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white border-2 border-indigo-500/30 shadow-2xl space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-indigo-900/40">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-black shadow-lg shadow-indigo-500/20 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-300 bg-indigo-900/60 border border-indigo-700/50 px-2.5 py-0.5 rounded-full">
                Etapa 7 — Participação Pública
              </span>
              <span className="text-[11px] font-mono text-indigo-400">
                Meta Coletiva
              </span>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-white mt-1 tracking-tight">
              Mobilização & Engajamento de Apoios
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleResetToTen}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-indigo-900/60 text-xs font-bold transition-all cursor-pointer"
          >
            Resetar (10 / 100)
          </button>
          <button
            type="button"
            onClick={handleSimulateTarget}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-yellow-300" />
            <span>Simular 100 / 100</span>
          </button>
        </div>
      </div>

      {/* 5-Step Sequence Progression Bar (Intent ➔ Apoios ➔ 10 / 100 ➔ 100 / 100 ➔ REVELAR) */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-900/50 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-indigo-200">
          <span>Sequência da Etapa 7:</span>
          <span className="text-indigo-400 font-mono">
            {activeStep === 5
              ? 'Status: REVELADO ✓'
              : activeStep === 4
              ? 'Status: 100 / 100 — Pronto para REVELAR!'
              : `Status: ${supportsCount} / ${targetCount} Apoios`}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2 text-center text-[11px] font-mono">
          {[
            { step: 1, label: 'Intent', desc: 'Intenção' },
            { step: 2, label: 'Apoios', desc: 'Engajamento' },
            { step: 3, label: '10 / 100', desc: 'Progresso' },
            { step: 4, label: '100 / 100', desc: 'Meta' },
            { step: 5, label: 'REVELAR', desc: 'Desbloqueio' },
          ].map((item) => {
            const isCurrent = activeStep === item.step;
            const isCompleted = activeStep > item.step;

            return (
              <div
                key={item.step}
                className={`p-2.5 rounded-xl border transition-all flex flex-col items-center justify-center ${
                  isCurrent
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-500/30 font-black ring-2 ring-indigo-400'
                    : isCompleted
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60 font-bold'
                    : 'bg-slate-950/40 text-slate-500 border-slate-800'
                }`}
              >
                <span className="text-xs font-black tracking-wider uppercase">{item.label}</span>
                <span className="text-[9px] opacity-80 mt-0.5">{item.desc}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Counter & Progress Visual Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Left: Huge Interactive Support Counter */}
        <div className="md:col-span-7 p-6 rounded-3xl bg-slate-900/80 border border-indigo-900/40 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5 uppercase">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Contador Coletivo de Apoios</span>
            </span>
            <span
              className={`text-xs font-black px-3 py-1 rounded-full ${
                isTargetReached
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
              }`}
            >
              {percentage}% Concluído
            </span>
          </div>

          {/* Big Number Display: 10 / 100 or 100 / 100 */}
          <div className="flex items-baseline justify-between py-2">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl md:text-6xl font-black text-white tracking-tight font-mono">
                  {supportsCount}
                </span>
                <span className="text-2xl md:text-3xl font-bold text-indigo-400 font-mono">
                  / {targetCount}
                </span>
              </div>
              <p className="text-xs text-indigo-300/80 mt-1 font-medium">
                {isTargetReached
                  ? '🎉 Meta de 100 apoios atingida! Botão REVELAR liberado.'
                  : `Faltam apenas ${targetCount - supportsCount} apoios para a liberação.`}
              </p>
            </div>

            <Heart
              className={`w-12 h-12 transition-all duration-300 ${
                justSupported
                  ? 'scale-125 text-rose-500 fill-rose-500 animate-bounce'
                  : isTargetReached
                  ? 'text-emerald-400 fill-emerald-400'
                  : 'text-indigo-400 fill-indigo-500/30'
              }`}
            />
          </div>

          {/* Large Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className={`h-full transition-all duration-700 rounded-full ${
                  isTargetReached
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-lg shadow-emerald-500/50'
                    : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-indigo-300">
              <span>0 Apoios</span>
              <span className="font-bold">10 Apoios (Inicial)</span>
              <span className="font-black text-white">100 Apoios (Meta)</span>
            </div>
          </div>

          {/* Action Support Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => handleSupportClick(1)}
              className="py-3 px-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <ThumbsUp className="w-4 h-4 text-indigo-200" />
              <span>+1 Apoiar</span>
            </button>

            <button
              type="button"
              onClick={() => handleSupportClick(10)}
              className="py-3 px-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Heart className="w-4 h-4 text-purple-200 fill-purple-200" />
              <span>+10 Apoios</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAddModal(!showAddModal)}
              className="col-span-2 sm:col-span-1 py-3 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-indigo-200 text-xs font-bold border border-indigo-800/60 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-indigo-300" />
              <span>Comentários</span>
            </button>
          </div>
        </div>

        {/* Right: Reveal Ceremony Trigger & Status */}
        <div className="md:col-span-5 p-6 rounded-3xl bg-slate-900/90 border border-indigo-900/50 space-y-4 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h4 className="text-sm font-black text-white uppercase tracking-wider">
                Desbloqueio por Apoio Público
              </h4>
            </div>
            <p className="text-xs text-indigo-200/80 leading-relaxed">
              Ao atingir <strong>100 / 100 apoios</strong>, a trava de mobilização pública é automaticamente liberada, permitindo a execução do botão <strong>REVELAR</strong>.
            </p>
          </div>

          {/* Main REVELAR Trigger */}
          <div className="space-y-3 pt-2">
            {isRevealed || intent.revealed_at ? (
              <div className="p-4 rounded-2xl bg-emerald-950/80 border-2 border-emerald-500/80 text-center space-y-2 animate-in zoom-in-95">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h5 className="text-sm font-black text-emerald-200 uppercase">
                  CONTEÚDO REVELADO COM SUCESSO!
                </h5>
                <p className="text-xs font-mono text-emerald-300/90 bg-slate-950 p-2.5 rounded-xl border border-emerald-800/60 text-left whitespace-pre-wrap">
                  {revealContent || intent.reveal_content || '🔓 Segredo revelado após a mobilização pública de 100 apoios.'}
                </p>
              </div>
            ) : (
              <button
                type="button"
                disabled={!isTargetReached}
                onClick={onReveal}
                className={`w-full py-4 px-5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl ${
                  isTargetReached
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-emerald-500/30 animate-pulse ring-2 ring-emerald-300 active:scale-95'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                }`}
              >
                {isTargetReached ? (
                  <>
                    <Unlock className="w-5 h-5 text-slate-950" />
                    <span>REVELAR CONTEÚDO (100 / 100) →</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 text-slate-500" />
                    <span>Aguardando Meta ({supportsCount} / {targetCount})</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Supporter Feed & Custom Support Form Modal */}
      {showAddModal && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-indigo-700/60 space-y-3 animate-in fade-in">
          <h5 className="text-xs font-black text-indigo-300 uppercase">Deixar Apoio Registrado</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Seu nome"
              value={newSupporterName}
              onChange={(e) => setNewSupporterName(e.target.value)}
              className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              placeholder="Comentário opcional de apoio"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="button"
            onClick={() => handleSupportClick(1)}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Confirmar Apoio Público
          </button>
        </div>
      )}

      {/* Recent Supporters Avatars & List */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-indigo-900/30 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
          <span className="flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
            <span>Últimos Apoiadores Registrados ({supporters.length})</span>
          </span>
          <span className="text-[11px] font-mono text-indigo-400">Comunidade Ativa</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          {supporters.slice(0, 3).map((sup) => (
            <div
              key={sup.id}
              className="p-2.5 rounded-xl bg-slate-950/80 border border-indigo-900/40 text-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3 text-indigo-400" />
                  <span>{sup.name}</span>
                </span>
                <span className="text-[9px] text-slate-500">Recente</span>
              </div>
              {sup.comment && (
                <p className="text-[11px] text-indigo-200/80 italic truncate">{sup.comment}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
