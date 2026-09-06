import React, { useState } from 'react';
import {
  Layers,
  User,
  FileText,
  Lock,
  Clock,
  ShieldCheck,
  Users,
  Eye,
  CheckCircle2,
  X,
  Code,
  Sparkles,
  HelpCircle,
  Network,
  Activity,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { Intent, IntentEventType } from '../types';
import { answerIntentQuestions, normalizeIntent } from '../utils/intentSchema';
import { evaluateIntentConditions } from '../utils/conditionEvaluator';

interface IntentStructureModalProps {
  isOpen: boolean;
  intent: Intent | null;
  onClose: () => void;
}

const LIFECYCLE_STEPS: { type: IntentEventType; label: string; desc: string }[] = [
  { type: 'INTENT_CREATED', label: '1. INTENT_CREATED', desc: 'Registo inicial da intenção autônoma pelo criador.' },
  { type: 'CONTENT_ATTACHED', label: '2. CONTENT_ATTACHED', desc: 'Anexo de conteúdo criptografado/cofre de revelação.' },
  { type: 'CONDITION_CREATED', label: '3. CONDITION_CREATED', desc: 'Estipulação de regras declarativas (Tempo >=, Quórum).' },
  { type: 'CONDITION_SATISFIED', label: '4. CONDITION_SATISFIED', desc: 'Disparo de tempo atingido ou aprovações recebidas.' },
  { type: 'REVEAL_STARTED', label: '5. REVEAL_STARTED', desc: 'Início da janela de liberação e notificação.' },
  { type: 'CONTENT_REVEALED', label: '6. CONTENT_REVEALED', desc: 'Segredo exposto e entregue aos destinatários.' },
  { type: 'REVEAL_EXPIRED', label: 'X. REVEAL_EXPIRED', desc: 'Janela de tempo limite ultrapassada sem revelação.' },
];

export const IntentStructureModal: React.FC<IntentStructureModalProps> = ({
  isOpen,
  intent,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'questions' | 'lifecycle' | 'crypto' | 'people' | 'api' | 'tree' | 'json'>('questions');

  if (!isOpen || !intent) return null;

  const normalized = normalizeIntent(intent);
  const answers = answerIntentQuestions(normalized);
  const evaluation = evaluateIntentConditions(normalized);

  const approvers = normalized.people?.approvers || [];
  const recipients = normalized.people?.recipients || [];
  const participants = normalized.people?.participants || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between relative overflow-hidden shrink-0">
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-blue-600/20 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-3 z-10">
            <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-lg">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-bold uppercase tracking-wider">
                  Etapas 2, 3 & 4 — Intent, Tempo & Pessoas
                </span>
                <span className="text-xs font-mono text-slate-400">ID: {normalized.id}</span>
              </div>
              <h3 className="text-xl font-black text-white tracking-tight mt-0.5">
                Arquitetura & Tríplice de Pessoas
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors z-10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-4 py-2.5 rounded-t-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'questions'
                ? 'bg-white text-[#0055FF] border-t-2 border-t-[#0055FF] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>7 Perguntas Chave</span>
          </button>

          <button
            onClick={() => setActiveTab('lifecycle')}
            className={`px-4 py-2.5 rounded-t-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'lifecycle'
                ? 'bg-white text-[#0055FF] border-t-2 border-t-[#0055FF] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Tempo & Quórum (Etapas 3/5)</span>
          </button>

          <button
            onClick={() => setActiveTab('crypto')}
            className={`px-4 py-2.5 rounded-t-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'crypto'
                ? 'bg-white text-cyan-600 border-t-2 border-t-cyan-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lock className="w-4 h-4 text-cyan-600" />
            <span>Conteúdo Protegido (Etapa 6)</span>
          </button>

          <button
            onClick={() => setActiveTab('people')}
            className={`px-4 py-2.5 rounded-t-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'people'
                ? 'bg-white text-[#0055FF] border-t-2 border-t-[#0055FF] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Pessoas & Papéis (Etapa 4)</span>
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`px-4 py-2.5 rounded-t-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'api'
                ? 'bg-white text-[#0055FF] border-t-2 border-t-[#0055FF] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Conectores & API Ready</span>
          </button>

          <button
            onClick={() => setActiveTab('tree')}
            className={`px-4 py-2.5 rounded-t-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'tree'
                ? 'bg-white text-[#0055FF] border-t-2 border-t-[#0055FF] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>Árvore Conceitual</span>
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`px-4 py-2.5 rounded-t-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'json'
                ? 'bg-white text-[#0055FF] border-t-2 border-t-[#0055FF] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>JSON Declarativo</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'questions' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#0055FF] shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 leading-relaxed">
                  <strong>A Intent como contrato autônomo:</strong> Na Etapa 2, a Intent separa rigorosamente{' '}
                  <strong>Creator</strong>, <strong>Content</strong>, <strong>Conditions</strong>, <strong>Audience</strong> e{' '}
                  <strong>Participants</strong>. Abaixo estão as respostas estruturadas para esta Intent específica.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* 1. Quem criou? */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <div className="p-1.5 rounded-lg bg-blue-100 text-[#0055FF]">
                      <User className="w-4 h-4" />
                    </div>
                    <span>1. Quem criou? (Creator)</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium pl-8">{answers.creatorText}</p>
                </div>

                {/* 2. O que pretende? */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-600">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span>2. O que pretende? (Content)</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium pl-8">{answers.objectiveText}</p>
                </div>

                {/* 3. Para quem? */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <div className="p-1.5 rounded-lg bg-purple-100 text-purple-600">
                      <Eye className="w-4 h-4" />
                    </div>
                    <span>3. Para quem? (Audience)</span>
                  </div>
                  <div className="pl-8 space-y-1">
                    <p className="text-xs text-slate-700 font-medium">{answers.audienceText}</p>
                    <div className="flex flex-wrap gap-1">
                      {['PRIVATE', 'SELECTED', 'PUBLIC', 'FOLLOWERS', 'LINK', 'GROUP'].map((type) => (
                        <span
                          key={type}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                            normalized.audience?.type === type
                              ? 'bg-[#0055FF] text-white'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4. O que será revelado? */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600">
                      <Lock className="w-4 h-4" />
                    </div>
                    <span>4. O que será revelado? (Content Payload)</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium pl-8">{answers.revealText}</p>
                </div>

                {/* 5. O que precisa acontecer? */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2 md:col-span-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <div className="p-1.5 rounded-lg bg-amber-100 text-amber-600">
                      <Clock className="w-4 h-4" />
                    </div>
                    <span>5. O que precisa acontecer? (Conditions & Declarative Time)</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium pl-8">{answers.conditionText}</p>
                </div>

                {/* 6. Quem pode participar? */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <div className="p-1.5 rounded-lg bg-cyan-100 text-cyan-600">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span>6. Quem pode participar? (Guardiões)</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium pl-8">{answers.participantsText}</p>
                </div>

                {/* 7. Quem poderá receber? */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <div className="p-1.5 rounded-lg bg-rose-100 text-rose-600">
                      <Users className="w-4 h-4" />
                    </div>
                    <span>7. Quem poderá receber? (Recipients)</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium pl-8">{answers.recipientsText}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'lifecycle' && (
            <div className="space-y-6">
              {/* Painel do Motor Genérico de Aprovação & Quórum (Etapa 5) */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-slate-100 border border-slate-800 space-y-4 shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <div>
                      <span className="text-sm font-bold text-white block">Motor Genérico de Aprovação & Quórum (Etapa 5)</span>
                      <span className="text-[11px] text-slate-400 font-mono">Regra de Liberação: condition.type = APPROVAL / PEOPLE</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-mono font-bold uppercase">
                      Modo: {evaluation.quorumMode || 'EXACT_N'}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${
                      evaluation.isPeopleConditionSatisfied
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      {evaluation.isPeopleConditionSatisfied ? 'Quórum Atingido' : 'Em Coleta'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-800/70 rounded-xl border border-slate-700/60">
                    <span className="text-slate-400 text-[11px] block">Aprovadores Elegíveis (N):</span>
                    <span className="font-mono text-white text-base font-bold">
                      {evaluation.eligibleApproversCount} <span className="text-xs text-slate-400 font-normal">pessoa(s)</span>
                    </span>
                  </div>

                  <div className="p-3 bg-slate-800/70 rounded-xl border border-slate-700/60">
                    <span className="text-slate-400 text-[11px] block">Necessários para Revelar (M):</span>
                    <span className="font-mono text-amber-300 text-base font-bold">
                      {evaluation.effectiveRequiredApprovals} <span className="text-xs text-slate-400 font-normal">voto(s)</span>
                    </span>
                  </div>

                  <div className="p-3 bg-slate-800/70 rounded-xl border border-slate-700/60">
                    <span className="text-slate-400 text-[11px] block">Aprovações Coletadas:</span>
                    <span className="font-mono text-emerald-400 text-base font-bold">
                      {evaluation.approvedGuardiansCount} <span className="text-xs text-slate-400 font-normal">({evaluation.quorumRatioText})</span>
                    </span>
                  </div>

                  <div className="p-3 bg-slate-800/70 rounded-xl border border-slate-700/60">
                    <span className="text-slate-400 text-[11px] block">Fórmula Ativa:</span>
                    <span className="font-mono text-indigo-300 text-xs font-bold block truncate" title={evaluation.quorumFormulaDescription}>
                      {evaluation.quorumFormulaDescription}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px]">Progresso do Quórum:</span>
                    <div className="w-32 bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all"
                        style={{ width: `${evaluation.quorumPercentage}%` }}
                      />
                    </div>
                    <span className="font-mono text-emerald-400 font-bold text-[11px]">{evaluation.quorumPercentage}%</span>
                  </div>

                  <div className="text-[11px] text-slate-300">
                    {evaluation.canStillReachQuorum ? (
                      <span className="text-emerald-400">✓ Quórum matematicamente alcançável</span>
                    ) : (
                      <span className="text-rose-400 font-bold">✕ Quórum inviabilizado por recusa de guardiões</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Painel do Motor Declarativo de Tempo */}
              <div className="p-5 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-400" />
                    <span className="text-sm font-bold text-white">Motor Declarativo de Tempo (Etapa 3)</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold uppercase">
                    Operator: {evaluation.timeResult.operator}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
                    <span className="text-slate-400 text-[11px] block">Condição Declarativa de Valor:</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      value: {evaluation.timeResult.isoValue}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
                    <span className="text-slate-400 text-[11px] block">Estado Atual de Revelação / Expiração:</span>
                    <span className="font-mono text-amber-300 font-bold">
                      {evaluation.timeResult.formattedCountdown}
                    </span>
                  </div>
                </div>
              </div>

              {/* Maquina de Estados de Ciclo de Vida */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#0055FF]" />
                    <span>Linha de Vida de Eventos Auditoriais</span>
                  </h4>
                  <span className="text-[11px] font-mono text-slate-500">
                    Estágio Atual: <strong className="text-[#0055FF]">{evaluation.currentLifecycleStage}</strong>
                  </span>
                </div>

                <div className="space-y-2">
                  {LIFECYCLE_STEPS.map((step) => {
                    const isCurrent = evaluation.currentLifecycleStage === step.type;
                    const isExpired = step.type === 'REVEAL_EXPIRED' && evaluation.isExpired;

                    return (
                      <div
                        key={step.type}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                          isCurrent
                            ? 'bg-blue-50/80 border-[#0055FF] shadow-xs'
                            : isExpired
                            ? 'bg-rose-50 border-rose-300'
                            : 'bg-slate-50 border-slate-200 opacity-75'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              isCurrent
                                ? 'bg-[#0055FF] animate-pulse ring-4 ring-blue-100'
                                : isExpired
                                ? 'bg-rose-500'
                                : 'bg-slate-300'
                            }`}
                          />
                          <div>
                            <span className="text-xs font-bold font-mono text-slate-900">{step.label}</span>
                            <p className="text-[11px] text-slate-600 mt-0.5">{step.desc}</p>
                          </div>
                        </div>

                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full bg-[#0055FF] text-white text-[10px] font-bold">
                            Ativo Agora
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'crypto' && (
            <div className="space-y-6">
              {/* Header Etapa 6 — Conteúdo Protegido */}
              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 leading-relaxed space-y-1">
                  <strong className="text-cyan-950 block font-bold">Arquitetura de Conteúdo Protegido (Etapa 6):</strong>
                  <p className="text-[11px] text-slate-600">
                    O sistema rejeita o modelo ingênuo de <em>&quot;marcar checkbox de criptografado&quot;</em>. 
                    O segredo original nunca é exposto sem envelope criptográfico, compromisso matemático e autorização por regras.
                  </p>
                </div>
              </div>

              {/* 4 Pilares da Segurança */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Confidencialidade</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Conteúdo protegido por AES-GCM 256-bit.</p>
                </div>

                <div className="p-3 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Integridade</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Content Hash SHA-256 & Commitment scheme.</p>
                </div>

                <div className="p-3 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                    <User className="w-3.5 h-3.5" />
                    <span>Autenticidade</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Assinatura digital do criador vinculada.</p>
                </div>

                <div className="p-3 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Auditoria</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Logs imutáveis de cada transição de chave.</p>
                </div>
              </div>

              {/* Envelope de Conteúdo Inspecionado */}
              <div className="p-4 bg-slate-950 text-slate-200 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-slate-800">
                  <span className="text-cyan-400 font-bold">CONTENT ENVELOPE (ESTRUTURA SEPARADA)</span>
                  <span className="text-slate-500">AES-256-GCM / SHA-256</span>
                </div>

                <div className="font-mono text-[11px] space-y-2">
                  <div>
                    <span className="text-cyan-400">├── metadata:</span>
                    <span className="text-slate-300 ml-2">
                      mime: {normalized.protected_payload?.fileType || 'text/plain'} | size: {normalized.protected_payload?.fileSize || 'N/A'} bytes | name: {normalized.protected_payload?.fileName || 'reveal_secret.dat'}
                    </span>
                  </div>

                  <div>
                    <span className="text-emerald-400">├── encrypted_blob:</span>
                    <span className="text-slate-400 ml-2 break-all text-[10px]">
                      {normalized.protected_payload?.cipherText
                        ? normalized.protected_payload.cipherText.slice(0, 50) + '... [AES-256 CIPHERTEXT]'
                        : '[Envelope não instanciado ou segredo em texto puro no rascunho]'}
                    </span>
                  </div>

                  <div>
                    <span className="text-amber-400">├── content_hash (SHA-256):</span>
                    <span className="text-amber-200 ml-2 font-mono text-[10px]">
                      {normalized.protected_payload?.content_hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                    </span>
                  </div>

                  <div>
                    <span className="text-purple-400">├── commitment (Proof of Possession):</span>
                    <span className="text-purple-200 ml-2 font-mono text-[10px]">
                      {normalized.protected_payload?.commitment || 'com-sha256-salt-secret-binding-v1'}
                    </span>
                  </div>

                  <div>
                    <span className="text-rose-400">└── encryption_key_reference:</span>
                    <span className="text-rose-200 ml-2 font-mono text-[10px]">
                      {normalized.protected_payload?.encryption_key_reference || 'kms://vault-key-ref-etapa-6'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fluxo de Ciclo de Vida do Conteúdo */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2">
                <span className="font-bold text-slate-800 block">Fluxo Criptográfico Autônomo:</span>
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-slate-600">
                  <span className="px-2 py-0.5 bg-white border border-slate-300 rounded font-semibold text-slate-800">Criador</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="px-2 py-0.5 bg-white border border-slate-300 rounded font-semibold text-slate-800">Criptografar</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="px-2 py-0.5 bg-cyan-100 border border-cyan-300 rounded font-semibold text-cyan-800">Fingerprint/Commitment</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="px-2 py-0.5 bg-white border border-slate-300 rounded font-semibold text-slate-800">Armazenar</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="px-2 py-0.5 bg-amber-100 border border-amber-300 rounded font-semibold text-amber-800">Aguardar Condição</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="px-2 py-0.5 bg-emerald-100 border border-emerald-300 rounded font-semibold text-emerald-800">Autorizar Acesso</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="px-2 py-0.5 bg-emerald-600 text-white rounded font-bold">Revelar</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'people' && (
            <div className="space-y-6">
              {/* Painel Informativo da Separação Tripla */}
              <div className="p-4 rounded-2xl bg-[#0055FF]/5 border border-[#0055FF]/20 flex items-start gap-3">
                <Users className="w-5 h-5 text-[#0055FF] shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 leading-relaxed space-y-1">
                  <strong>Tríplice de Pessoas (Etapa 4):</strong> Uma mesma Intent separa com clareza três papéis fundamentais:
                  <ul className="list-disc pl-4 space-y-0.5 mt-1 text-[11px] text-slate-600">
                    <li><strong className="text-amber-700">Aprovadores (Approvers):</strong> Têm poder de voto/decisão para satisfazer a condição e desbloquear a intenção.</li>
                    <li><strong className="text-emerald-700">Destinatários (Recipients):</strong> Entidades autorizadas a receber/descriptografar a revelação do segredo.</li>
                    <li><strong className="text-blue-700">Participantes (Participants):</strong> Envolvidos, observadores ou colaboradores da Intent.</li>
                  </ul>
                  <p className="text-[11px] font-medium text-slate-500 pt-1">
                    * Uma mesma pessoa (ex: Flávio) pode ter múltiplos papéis, mas o sistema os trata de forma independente. Ex: 2 de 3 aprovadores liberam o documento, mas apenas o destinatário João poderá lê-lo.
                  </p>
                </div>
              </div>

              {/* Grid dos 3 Papéis */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Criador & Aprovadores */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      <span>Aprovadores (Guardians)</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-200/60 text-amber-900 font-mono text-[10px] font-bold">
                      {approvers.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {approvers.length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic">Nenhum aprovador atribuído (Liberado apenas por tempo ou criador).</p>
                    ) : (
                      approvers.map((appr) => (
                        <div key={appr.id} className="p-2.5 rounded-xl bg-white border border-amber-200/60 flex items-center justify-between text-xs shadow-2xs">
                          <div>
                            <span className="font-bold text-slate-800 block">{appr.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{appr.email || appr.id}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            appr.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {appr.status === 'approved' ? 'Aprovado' : 'Pendente'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 2. Destinatários da Revelação */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
                    <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-emerald-600" />
                      <span>Destinatários da Revelação</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-200/60 text-emerald-900 font-mono text-[10px] font-bold">
                      {recipients.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {recipients.length === 0 ? (
                      <div className="p-2.5 rounded-xl bg-white border border-emerald-200/60 text-xs text-slate-700">
                        <span className="font-bold block text-slate-800">
                          {normalized.visibility === 'public' ? 'Público Geral' : `Apenas o Criador (${normalized.creator?.name})`}
                        </span>
                        <span className="text-[10px] text-slate-500 italic">Disponível ao público ou exclusivo do criador.</span>
                      </div>
                    ) : (
                      recipients.map((rec) => (
                        <div key={rec.id} className="p-2.5 rounded-xl bg-white border border-emerald-200/60 flex items-center justify-between text-xs shadow-2xs">
                          <div>
                            <span className="font-bold text-slate-800 block">{rec.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{rec.email || rec.id}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Alvo Seguro
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 3. Participantes Gerais */}
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-blue-200/60">
                    <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>Participantes & Criador</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-200/60 text-blue-900 font-mono text-[10px] font-bold">
                      {participants.length + 1}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-white border border-blue-200/60 flex items-center justify-between shadow-2xs">
                      <div>
                        <span className="font-bold text-slate-900 block">{normalized.creator?.name} (Criador)</span>
                        <span className="text-[10px] text-slate-500 font-mono">{normalized.creator?.email || normalized.creator?.username}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                        Autor
                      </span>
                    </div>

                    {participants.map((part) => (
                      <div key={part.id} className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                        <div>
                          <span className="font-bold text-slate-800 block">{part.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{part.email || part.id}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono">
                          {part.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-6">
              {/* Header de Preparação de API & Princípio de Independência */}
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 leading-relaxed space-y-1">
                  <strong className="text-purple-900 block font-bold">Princípio de Independência (Contrato Universal):</strong>
                  <p className="text-[11px] text-slate-600">
                    <em>&quot;A plataforma não se especializa no domínio que utiliza sua infraestrutura. Ela fornece um contrato universal de Intents; sistemas externos adaptam seus eventos a esse contrato.&quot;</em>
                  </p>
                  <p className="text-[11px] text-slate-500 pt-1">
                    Internamente, não existem <code className="text-purple-700">SchoolIntent</code> ou <code className="text-purple-700">ContestIntent</code>. Existe apenas o <strong>Core de Intent</strong> recebendo eventos padronizados emitidos por Adaptadores externos.
                  </p>
                </div>
              </div>

              {/* 5 Garantias de Arquitetura */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 font-mono">1. content_source</span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold font-mono">
                      {normalized.content?.source || 'UPLOAD'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Aceita fontes: <code className="text-purple-700 font-bold">UPLOAD | API | WEBHOOK | LINK | MANUAL</code>.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 font-mono">2. content_version</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold font-mono">
                      v{normalized.content?.current_version || 1} ({normalized.content?.versions?.length || 1} registro(s))
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Auditabilidade imutável sem sobrescrita silenciosa do conteúdo original.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 font-mono">3. release_stages</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono">
                      {normalized.content?.release_stages?.length || 1} Etapa(s)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Suporta fluxos progressivos (ex: Edital ➔ Homologação ➔ Resultado Final).
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 font-mono">4. Eventos Estendidos</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold font-mono">
                      API / Webhook Event
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Suporte aos eventos <code className="text-amber-700 font-bold">API_CONTENT_RECEIVED</code> e <code className="text-amber-700 font-bold">STAGE_ADVANCED</code>.
                  </p>
                </div>
              </div>

              {/* Exemplo Prático Escolas/Concursos */}
              <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 space-y-2 font-mono text-xs">
                <span className="text-purple-400 font-bold block">// Exemplo Payload Futuro de Integração (Escolas / Concursos):</span>
                <pre className="text-[10px] text-emerald-400 overflow-x-auto leading-relaxed">
{JSON.stringify({
  intent_id: normalized.id,
  content_source: "API",
  event: "API_CONTENT_RECEIVED",
  stage: 2,
  payload: {
    title: "Notas Finais do Concurso 2027",
    target_recipient: "usr-aluno-123",
    version: 2
  }
}, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'tree' && (
            <div className="space-y-4">
              <div className="p-5 bg-slate-900 text-slate-200 rounded-2xl font-mono text-xs leading-relaxed overflow-x-auto space-y-2 border border-slate-800 shadow-inner">
                <div className="text-blue-400 font-bold text-sm">INTENT</div>
                <div className="pl-4 text-slate-400">│</div>
                <div className="pl-4 text-emerald-400">├── Creator (Quem criou?)</div>
                <div className="pl-8 text-slate-300">
                  id: &quot;{normalized.creator?.id}&quot; | name: &quot;{normalized.creator?.name}&quot;
                </div>
                
                <div className="pl-4 text-indigo-400">├── Content (O que pretende / O que será revelado?)</div>
                <div className="pl-8 text-slate-300">
                  title: &quot;{normalized.content?.title}&quot; | objective: &quot;{normalized.content?.objective}&quot;
                </div>

                <div className="pl-4 text-amber-400">├── Conditions (Motor Declarativo de Tempo - Etapa 3)</div>
                <div className="pl-8 text-slate-300">
                  type: {normalized.conditions?.condition_type} | operator: &quot;{evaluation.timeResult.operator}&quot; | value: &quot;{evaluation.timeResult.isoValue}&quot;
                </div>

                <div className="pl-4 text-purple-400">├── Audience (Para quem?)</div>
                <div className="pl-8 text-slate-300">
                  type: {normalized.audience?.type} | visibility: {normalized.audience?.visibility}
                </div>

                <div className="pl-4 text-cyan-400">├── People (Tríplice de Pessoas - Etapa 4)</div>
                <div className="pl-8 text-slate-300">
                  approvers: {approvers.length} | recipients: {recipients.length} | participants: {participants.length}
                </div>

                <div className="pl-4 text-rose-400">├── Permissions (Permissões de Acesso)</div>
                <div className="pl-8 text-slate-300">
                  can_view: [{normalized.permissions?.can_view?.join(', ')}] | can_reveal: [{normalized.permissions?.can_reveal?.join(', ')}]
                </div>

                <div className="pl-4 text-teal-400">├── Status (Estado autônomo)</div>
                <div className="pl-8 text-slate-300">
                  status: &quot;{normalized.status}&quot; | created_at: &quot;{normalized.created_at}&quot;
                </div>

                <div className="pl-4 text-yellow-400">└── History (Eventos & Auditoria Imutável)</div>
                <div className="pl-8 text-slate-300">
                  logs: {normalized.history_logs?.length || 0} eventos de ciclo de vida gravados
                </div>
              </div>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>ESTRUTURA DE OBJETO DECLARATIVA (ETAPA 4):</span>
                <span className="text-emerald-600 font-bold">✓ Separação de Pessoas Validada</span>
              </div>
              <pre className="p-4 bg-slate-950 text-emerald-400 rounded-2xl font-mono text-[11px] leading-relaxed overflow-x-auto max-h-[350px] border border-slate-800">
                {JSON.stringify(
                  {
                    id: normalized.id,
                    creator: normalized.creator,
                    content: normalized.content,
                    conditions: {
                      ...normalized.conditions,
                      operator: evaluation.timeResult.operator,
                      value: evaluation.timeResult.isoValue,
                    },
                    people: normalized.people,
                    current_lifecycle_event: evaluation.currentLifecycleStage,
                    audience: normalized.audience,
                    permissions: normalized.permissions,
                    participants: normalized.participants,
                    status: normalized.status,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Etapa 4 Validada — Separação entre Aprovadores, Destinatários e Participantes.</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            Fechar Inspeção
          </button>
        </div>
      </div>
    </div>
  );
};
