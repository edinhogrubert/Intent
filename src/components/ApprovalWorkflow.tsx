import React, { useState } from 'react';
import {
  Shield,
  Check,
  Minus,
  CheckCircle2,
  Lock,
  Unlock,
  Sparkles,
  ArrowDown,
  Users,
  AlertCircle,
  Key,
  Flame,
  Send,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { Participant, Intent } from '../types';
import { evaluateIntentConditions, calculateEffectiveRequiredApprovals } from '../utils/conditionEvaluator';
import { DevInspectorBadge } from './DevInspectorBadge';

interface ApprovalWorkflowProps {
  intent?: Intent;
  participants: Participant[];
  requiredApprovals: number;
  onToggleParticipantStatus?: (participantId: string) => void;
  onReveal?: () => void;
  onRequiredApprovalsChange?: (num: number) => void;
  isReadOnly?: boolean;
  canSimulateSignatures?: boolean;
  isRevealed?: boolean;
  revealContent?: string;
  variant?: 'full' | 'compact' | 'interactive_hero';
}

export function ApprovalWorkflow({
  intent,
  participants,
  requiredApprovals,
  onToggleParticipantStatus,
  onReveal,
  onRequiredApprovalsChange,
  isReadOnly = false,
  canSimulateSignatures = true,
  isRevealed = false,
  revealContent,
  variant = 'full',
}: ApprovalWorkflowProps) {
  const [isRevealingAnim, setIsRevealingAnim] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const guardians = participants.filter((p) => p.role === 'guardian' || p.role === 'approver');
  const approvedGuardians = guardians.filter((g) => g.status === 'approved');
  const effectiveGuardians = guardians.length > 0 ? guardians : participants;
  
  const { required: quorumTarget, description: quorumFormulaDesc } = calculateEffectiveRequiredApprovals(
    effectiveGuardians.length,
    intent?.quorum_mode || 'EXACT_N',
    requiredApprovals
  );
  const approvedCount = approvedGuardians.length;
  const isQuorumReached = approvedCount >= quorumTarget;
  const isCurrentlyRevealed = isRevealed || (intent && !!intent.revealed_at);

  const handleTriggerReveal = () => {
    if (!isQuorumReached && !isCurrentlyRevealed) return;
    setIsRevealingAnim(true);
    setShowCelebration(true);
    
    setTimeout(() => {
      setIsRevealingAnim(false);
      if (onReveal) {
        onReveal();
      }
    }, 600);
  };

  // Compact card view (for Intent List cards)
  if (variant === 'compact') {
    return (
      <div className="p-3.5 rounded-2xl bg-white border border-[#DCE7F6] shadow-xs space-y-2.5 relative">
        <DevInspectorBadge
          file="src/components/ApprovalWorkflow.tsx"
          functionName="ApprovalWorkflow (compact)"
          className="mb-1"
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#0055FF]" />
            <span className="text-xs font-bold text-slate-800">
              Etapa 5 — Aprovação ({effectiveGuardians.length} pessoas)
            </span>
          </div>
          <span
            className={`font-mono text-xs font-black px-2 py-0.5 rounded-full ${
              isQuorumReached
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {approvedCount}/{quorumTarget}
          </span>
        </div>

        {/* Mini 3-Person Icons Row: ✓ ✓ — */}
        <div className="flex items-center justify-between bg-[#F8FAFC] p-2 rounded-xl border border-slate-100">
          <div className="flex items-center gap-2">
            {effectiveGuardians.slice(0, 5).map((p) => {
              const isApproved = p.status === 'approved';
              return (
                <div
                  key={p.id}
                  onClick={() => canSimulateSignatures && onToggleParticipantStatus && onToggleParticipantStatus(p.id)}
                  title={`${p.name}: ${isApproved ? 'Aprovado (✓)' : 'Pendente (—)'} ${
                    canSimulateSignatures ? '- Clique para alternar' : ''
                  }`}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
                    isApproved
                      ? 'bg-emerald-500 text-white shadow-2xs'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  {isApproved ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Minus className="w-3.5 h-3.5 stroke-[3]" />}
                  <span className="text-[11px] truncate max-w-[65px]">{p.name.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
            <ArrowDown className="w-3 h-3 text-[#0055FF] animate-bounce" />
          </div>
        </div>

        {/* Reveal button or State */}
        {isCurrentlyRevealed ? (
          <div className="py-1.5 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>REVELADO</span>
          </div>
        ) : (
          <button
            type="button"
            disabled={!isQuorumReached}
            onClick={handleTriggerReveal}
            className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              isQuorumReached
                ? 'bg-[#0055FF] hover:bg-[#0047E0] text-white shadow-sm hover:shadow-md'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isQuorumReached ? (
              <>
                <Unlock className="w-3.5 h-3.5" />
                <span>REVELAR ({approvedCount}/{quorumTarget})</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>REVELAR (Requer {quorumTarget - approvedCount} aprovações)</span>
              </>
            )}
          </button>
        )}
      </div>
    );
  }

  // Full & Interactive Hero / Modal View
  return (
    <div
      id="approval-workflow-container"
      className="p-5 md:p-6 rounded-3xl bg-gradient-to-b from-white to-[#F9FBFF] border-2 border-[#BFD7FE] shadow-sm space-y-6 relative"
    >
      <DevInspectorBadge
        file="src/components/ApprovalWorkflow.tsx"
        functionName="ApprovalWorkflow"
        className="mb-1"
      />
      {/* Stage 5 Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#E2EDFF] text-[#0055FF] flex items-center justify-center font-black">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0055FF] bg-[#EAF2FF] px-2.5 py-0.5 rounded-full">
                Etapa 5 — Aprovação
              </span>
              <span className="text-xs font-bold text-slate-500">
                {effectiveGuardians.length} {effectiveGuardians.length === 1 ? 'pessoa' : 'pessoas'}
              </span>
              <span className="text-[11px] font-mono text-[#0055FF] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 font-semibold">
                {quorumFormulaDesc}
              </span>
            </div>
            <h4 className="text-base font-extrabold text-slate-900 mt-0.5">
              Quórum de Consenso & Cerimônia de Revelação
            </h4>
          </div>
        </div>

        {/* Quorum selector if editable */}
        {onRequiredApprovalsChange && !isReadOnly && (
          <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-600 font-semibold">Meta de Quórum:</span>
            <select
              value={quorumTarget}
              onChange={(e) => onRequiredApprovalsChange(Number(e.target.value))}
              className="bg-white border border-slate-300 rounded-lg text-xs font-bold px-2 py-0.5 text-[#0055FF]"
            >
              {Array.from({ length: effectiveGuardians.length || 3 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}/{effectiveGuardians.length || 3} ({n === (effectiveGuardians.length || 3) ? 'Unânime' : `${n} aprovações`})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 3 People (or N) Visual Approval Checklist: ✓ ✓ — */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#0055FF]" />
            <span>Painel de Assinaturas dos Guardiões</span>
          </span>
          <span className="text-[11px] text-slate-400">
            {canSimulateSignatures ? 'Clique no botão para aprovar/revogar' : 'Status em tempo real'}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {effectiveGuardians.map((p, idx) => {
            const isApproved = p.status === 'approved';

            return (
              <div
                key={p.id || idx}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isApproved
                    ? 'bg-emerald-50/60 border-emerald-200 shadow-2xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Left: Indicator (✓ or —) + Person Details */}
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Status Indicator Icon (✓ / —) */}
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center text-sm font-black transition-transform ${
                      isApproved
                        ? 'bg-emerald-500 text-white shadow-xs scale-105'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {isApproved ? (
                      <Check className="w-5 h-5 stroke-[3]" />
                    ) : (
                      <Minus className="w-5 h-5 stroke-[3]" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900 truncate">{p.name}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.2 rounded-md ${
                          p.role === 'guardian'
                            ? 'bg-amber-100 text-amber-800'
                            : p.role === 'recipient'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {p.role === 'guardian'
                          ? 'Guardião'
                          : p.role === 'recipient'
                          ? 'Destinatário'
                          : 'Observador'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 truncate">{p.email}</div>
                    
                    {p.approved_at && (
                      <div className="text-[10px] text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Aprovado em {new Date(p.approved_at).toLocaleTimeString('pt-BR')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Signature Toggle Button */}
                {canSimulateSignatures && onToggleParticipantStatus && !isReadOnly && (
                  <button
                    type="button"
                    onClick={() => onToggleParticipantStatus(p.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      isApproved
                        ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 hover:bg-[#E2EDFF] text-slate-700 hover:text-[#0055FF] border border-slate-200'
                    }`}
                  >
                    {isApproved ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>✓ Aprovado</span>
                      </>
                    ) : (
                      <>
                        <Minus className="w-4 h-4 text-slate-400" />
                        <span>— Pendente (Assinar)</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Central Quórum Indicator: 2/3 and Arrow Down (↓) */}
      <div className="flex flex-col items-center justify-center pt-2 space-y-2">
        {/* Fraction Badge: 2/3 */}
        <div className="flex items-center gap-3">
          <div
            className={`px-6 py-2.5 rounded-2xl font-mono text-xl md:text-2xl font-black border-2 transition-all flex items-center gap-2.5 shadow-sm ${
              isQuorumReached
                ? 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-200'
                : 'bg-white text-slate-800 border-[#BFD7FE] shadow-[#0055ff0f]'
            }`}
          >
            <Key className="w-5 h-5" />
            <span>
              {approvedCount}/{quorumTarget}
            </span>
          </div>

          <div className="text-xs font-semibold text-slate-600">
            {isQuorumReached ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Quórum Atingido ({approvedCount} de {quorumTarget})
              </span>
            ) : (
              <span className="text-slate-500">
                Faltam {quorumTarget - approvedCount} aprovação(ões)
              </span>
            )}
          </div>
        </div>

        {/* Down Arrow ↓ */}
        <div className="py-1 text-[#0055FF] flex flex-col items-center">
          <span className="text-2xl font-black leading-none animate-bounce">↓</span>
        </div>
      </div>

      {/* Bottom Action: REVELAR Button & Unlocked Payload Area */}
      <div className="pt-2">
        {isCurrentlyRevealed ? (
          <div className="p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-300 rounded-3xl space-y-3 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                  <Unlock className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-sm font-black text-emerald-900">
                    CONTEÚDO REVELADO COM SUCESSO
                  </h5>
                  <p className="text-xs text-emerald-700">
                    Quórum de {approvedCount}/{quorumTarget} guardiões validado.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-200 text-emerald-800 rounded-full text-xs font-bold">
                ✓ Desbloqueado
              </span>
            </div>

            {revealContent && (
              <div className="p-4 bg-white rounded-2xl border border-emerald-200 shadow-2xs">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                  Conteúdo Secreto Protegido:
                </span>
                <p className="text-sm text-slate-800 font-medium whitespace-pre-wrap leading-relaxed">
                  {revealContent}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <button
              id="btn-revelar-action"
              type="button"
              disabled={!isQuorumReached || isRevealingAnim}
              onClick={handleTriggerReveal}
              className={`w-full py-4 px-6 rounded-2xl font-black text-sm md:text-base uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 shadow-md cursor-pointer ${
                isQuorumReached
                  ? 'bg-gradient-to-r from-[#0055FF] via-[#0047E0] to-[#0039B8] hover:from-[#0047E0] hover:to-[#002FA3] active:scale-98 text-white shadow-blue-300 ring-4 ring-blue-100'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              }`}
            >
              {isRevealingAnim ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Desbloqueando Conteúdo...</span>
                </>
              ) : isQuorumReached ? (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                  <span>REVELAR</span>
                  <Unlock className="w-5 h-5" />
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 text-slate-400" />
                  <span>REVELAR (Aguardando {quorumTarget - approvedCount} aprovações)</span>
                </>
              )}
            </button>

            {!isQuorumReached && canSimulateSignatures && (
              <p className="text-xs text-center text-slate-400">
                💡 Dica: Clique nos botões <strong>— Pendente (Assinar)</strong> acima para simular as assinaturas dos guardiões e habilitar o botão <strong>REVELAR</strong>.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
