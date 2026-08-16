import React, { useState } from 'react';
import {
  Users,
  Shield,
  Send,
  Eye,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Sparkles,
  Key,
} from 'lucide-react';
import { Participant, ParticipantRole, ParticipantStatus, QuorumMode } from '../types';
import { calculateEffectiveRequiredApprovals } from '../utils/conditionEvaluator';

import { DevInspectorBadge } from './DevInspectorBadge';

interface ParticipantManagerProps {
  participants: Participant[];
  onChange: (updated: Participant[]) => void;
  requiredApprovals?: number;
  onRequiredApprovalsChange?: (num: number) => void;
  quorumMode?: QuorumMode;
  onQuorumModeChange?: (mode: QuorumMode) => void;
  isReadOnly?: boolean;
  canSimulateSignatures?: boolean;
}

export function ParticipantManager({
  participants,
  onChange,
  requiredApprovals,
  onRequiredApprovalsChange,
  quorumMode = 'EXACT_N',
  onQuorumModeChange,
  isReadOnly = false,
  canSimulateSignatures = true,
}: ParticipantManagerProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<ParticipantRole>('guardian');
  const [notes, setNotes] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const guardians = participants.filter((p) => p.role === 'guardian' || p.role === 'approver');
  const approvedGuardians = guardians.filter((g) => g.status === 'approved');
  const declinedGuardians = guardians.filter((g) => g.status === 'declined');

  // Generic calculation of required quorum
  const { required: effectiveQuorum, description: quorumFormulaDesc } =
    calculateEffectiveRequiredApprovals(guardians.length, quorumMode, requiredApprovals);

  const isQuorumReached = guardians.length === 0 || approvedGuardians.length >= effectiveQuorum;

  const handleAddParticipant = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const newParticipant: Participant = {
      id: 'p-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      status: 'pending',
      notes: notes.trim() || undefined,
    };

    onChange([...participants, newParticipant]);
    setName('');
    setEmail('');
    setNotes('');
    setIsAdding(false);
  };

  const handleLoadPresetCase = (type: '2_OF_2' | '2_OF_3' | '3_OF_5' | '4_OF_5') => {
    if (type === '2_OF_2') {
      const p1: Participant = {
        id: 'app-flavio',
        name: 'Flávio',
        email: 'flavio@conselho.org',
        role: 'approver',
        status: 'approved',
        approved_at: new Date().toISOString(),
        notes: 'Aprovador #1 (✓)',
      };
      const p2: Participant = {
        id: 'app-fernando',
        name: 'Fernando',
        email: 'fernando@conselho.org',
        role: 'approver',
        status: 'approved',
        approved_at: new Date().toISOString(),
        notes: 'Aprovador #2 (✓)',
      };
      onChange([p1, p2]);
      if (onQuorumModeChange) onQuorumModeChange('UNANIMOUS');
      if (onRequiredApprovalsChange) onRequiredApprovalsChange(2);
    } else if (type === '2_OF_3') {
      const p1: Participant = {
        id: 'app-flavio',
        name: 'Flávio',
        email: 'flavio@conselho.org',
        role: 'approver',
        status: 'approved',
        approved_at: new Date().toISOString(),
        notes: 'Aprovador #1 (✓ Aprovado)',
      };
      const p2: Participant = {
        id: 'app-fernando',
        name: 'Fernando',
        email: 'fernando@conselho.org',
        role: 'approver',
        status: 'approved',
        approved_at: new Date().toISOString(),
        notes: 'Aprovador #2 (✓ Aprovado)',
      };
      const p3: Participant = {
        id: 'app-maria',
        name: 'Maria',
        email: 'maria@conselho.org',
        role: 'approver',
        status: 'pending',
        notes: 'Aprovadora #3 (— Pendente)',
      };
      onChange([p1, p2, p3]);
      if (onQuorumModeChange) onQuorumModeChange('MAJORITY');
      if (onRequiredApprovalsChange) onRequiredApprovalsChange(2);
    } else if (type === '3_OF_5') {
      const names = ['Flávio', 'Fernando', 'Maria', 'Roberto', 'Helena'];
      const pList: Participant[] = names.map((n, idx) => ({
        id: `app-5-${idx + 1}`,
        name: n,
        email: `${n.toLowerCase()}@conselho.org`,
        role: 'approver',
        status: idx < 2 ? 'approved' : 'pending',
        approved_at: idx < 2 ? new Date().toISOString() : undefined,
        notes: `Conselheiro #${idx + 1}`,
      }));
      onChange(pList);
      if (onQuorumModeChange) onQuorumModeChange('EXACT_N');
      if (onRequiredApprovalsChange) onRequiredApprovalsChange(3);
    } else if (type === '4_OF_5') {
      const names = ['Flávio', 'Fernando', 'Maria', 'Roberto', 'Helena'];
      const pList: Participant[] = names.map((n, idx) => ({
        id: `app-5-${idx + 1}`,
        name: n,
        email: `${n.toLowerCase()}@conselho.org`,
        role: 'approver',
        status: idx < 3 ? 'approved' : 'pending',
        approved_at: idx < 3 ? new Date().toISOString() : undefined,
        notes: `Conselheiro #${idx + 1}`,
      }));
      onChange(pList);
      if (onQuorumModeChange) onQuorumModeChange('SUPERMAJORITY');
      if (onRequiredApprovalsChange) onRequiredApprovalsChange(4);
    }
  };

  const handleRemove = (id: string) => {
    onChange(participants.filter((p) => p.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    const updated = participants.map((p) => {
      if (p.id === id) {
        const nextStatus: ParticipantStatus =
          p.status === 'approved' ? 'pending' : 'approved';
        return {
          ...p,
          status: nextStatus,
          approved_at: nextStatus === 'approved' ? new Date().toISOString() : undefined,
        };
      }
      return p;
    });
    onChange(updated);
  };

  const getRoleBadge = (r: ParticipantRole) => {
    switch (r) {
      case 'guardian':
      case 'approver':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Shield className="w-3 h-3 text-amber-600" />
            <span>Aprovador / Guardião</span>
          </span>
        );
      case 'recipient':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
            <Send className="w-3 h-3 text-indigo-600" />
            <span>Destinatário Final</span>
          </span>
        );
      case 'viewer':
      case 'participant':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <Eye className="w-3 h-3 text-slate-500" />
            <span>Observador</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 relative" id="participant-manager-section">
      <DevInspectorBadge
        file="src/components/ParticipantManager.tsx"
        functionName="ParticipantManager"
        className="mb-1"
      />
      {/* Guardian Quorum Status Bar */}
      {guardians.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-white border border-[#DCE7F6] shadow-xs space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-[#0055FF]" />
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Motor de Aprovação & Quórum (Etapa 5)
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {quorumFormulaDesc}
                </span>
              </div>
            </div>
            <span
              className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
                isQuorumReached
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              {approvedGuardians.length} de {effectiveQuorum} aprovado(s)
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isQuorumReached ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{
                width: `${Math.min(
                  100,
                  effectiveQuorum > 0 ? (approvedGuardians.length / effectiveQuorum) * 100 : 100
                )}%`,
              }}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              {isQuorumReached ? (
                <span className="text-emerald-700 font-bold">
                  ✓ Quórum atingido ({approvedGuardians.length}/{effectiveQuorum})! Condição pronta para revelar.
                </span>
              ) : (
                <span className="text-amber-700 font-bold">
                  — Aguardando {Math.max(0, effectiveQuorum - approvedGuardians.length)} assinatura(s) para atingir {effectiveQuorum}/{guardians.length}.
                </span>
              )}
            </span>

            {/* Quorum Mode & Rule Selector */}
            {!isReadOnly && (
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="font-semibold text-slate-600">Regra:</span>
                <select
                  value={quorumMode}
                  onChange={(e) => {
                    const newM = e.target.value as QuorumMode;
                    if (onQuorumModeChange) onQuorumModeChange(newM);
                  }}
                  className="bg-[#F8FAFC] border border-slate-200 rounded-md text-[11px] px-2 py-0.5 font-bold text-[#0055FF]"
                >
                  <option value="UNANIMOUS">UNANIMIDADE (Todos)</option>
                  <option value="MAJORITY">MAIORIA SIMPLES (&gt;50%)</option>
                  <option value="SUPERMAJORITY">MAIORIA QUALIFICADA (2/3)</option>
                  <option value="EXACT_N">QUÓRUM M de N</option>
                </select>

                {quorumMode === 'EXACT_N' && onRequiredApprovalsChange && (
                  <select
                    value={requiredApprovals || effectiveQuorum}
                    onChange={(e) => onRequiredApprovalsChange(Number(e.target.value))}
                    className="bg-[#F8FAFC] border border-slate-200 rounded-md text-[11px] px-1.5 py-0.5 font-bold text-slate-700"
                  >
                    {Array.from({ length: guardians.length || 3 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n} de {guardians.length || 3}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preset Etapa 5 Rules Grid */}
      {!isReadOnly && (
        <div className="p-3 bg-[#F0F5FD] rounded-xl border border-[#DCE7F6] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#0055FF]" />
              <span>Presets da Etapa 5 (Carregamento Rápido):</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => handleLoadPresetCase('2_OF_2')}
              className="px-2 py-1.5 bg-white hover:bg-[#E2EDFF] text-[#0055FF] border border-[#BFD7FE] rounded-lg font-bold text-[11px] transition-all cursor-pointer text-left shadow-2xs"
            >
              <span className="block font-bold">2 de 2 (Unanimidade)</span>
              <span className="text-[10px] text-slate-500 font-normal">Flávio &amp; Fernando ✓✓</span>
            </button>

            <button
              type="button"
              onClick={() => handleLoadPresetCase('2_OF_3')}
              className="px-2 py-1.5 bg-white hover:bg-[#E2EDFF] text-[#0055FF] border border-[#BFD7FE] rounded-lg font-bold text-[11px] transition-all cursor-pointer text-left shadow-2xs"
            >
              <span className="block font-bold">2 de 3 (Maioria)</span>
              <span className="text-[10px] text-slate-500 font-normal">Flávio, Fernando, Maria</span>
            </button>

            <button
              type="button"
              onClick={() => handleLoadPresetCase('3_OF_5')}
              className="px-2 py-1.5 bg-white hover:bg-[#E2EDFF] text-[#0055FF] border border-[#BFD7FE] rounded-lg font-bold text-[11px] transition-all cursor-pointer text-left shadow-2xs"
            >
              <span className="block font-bold">3 de 5 (M de N)</span>
              <span className="text-[10px] text-slate-500 font-normal">5 Guardiões (Meta: 3)</span>
            </button>

            <button
              type="button"
              onClick={() => handleLoadPresetCase('4_OF_5')}
              className="px-2 py-1.5 bg-white hover:bg-[#E2EDFF] text-[#0055FF] border border-[#BFD7FE] rounded-lg font-bold text-[11px] transition-all cursor-pointer text-left shadow-2xs"
            >
              <span className="block font-bold">4 de 5 (Qualificada)</span>
              <span className="text-[10px] text-slate-500 font-normal">Super-maioria</span>
            </button>
          </div>
        </div>
      )}

      {/* Participants List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#0055FF]" />
            <span>Pessoas Vinculadas ({participants.length})</span>
          </span>
          {!isReadOnly && !isAdding && (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="text-[11px] text-[#0055FF] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Adicionar Pessoa</span>
            </button>
          )}
        </div>

        {isAdding && !isReadOnly && (
          <div className="p-3 bg-white rounded-xl border border-[#BFD7FE] space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                required
                placeholder="Nome da pessoa *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddParticipant();
                  }
                }}
                className="px-3 py-1.5 bg-[#F8FAFC] border border-slate-200 rounded-lg text-xs"
              />
              <input
                type="email"
                required
                placeholder="E-mail *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddParticipant();
                  }
                }}
                className="px-3 py-1.5 bg-[#F8FAFC] border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as ParticipantRole)}
                className="px-3 py-1.5 bg-[#F8FAFC] border border-slate-200 rounded-lg text-xs"
              >
                <option value="guardian">Guardião / Aprovador (Voto no Quórum)</option>
                <option value="recipient">Destinatário Final (Recebe Revelação)</option>
                <option value="viewer">Observador (Sem poder de voto)</option>
              </select>
              <input
                type="text"
                placeholder="Notas de contexto (opcional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddParticipant();
                  }
                }}
                className="px-3 py-1.5 bg-[#F8FAFC] border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1 border border-slate-200 rounded-lg text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleAddParticipant()}
                className="px-3 py-1 bg-[#0055FF] text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Adicionar
              </button>
            </div>
          </div>
        )}

        <div className="space-y-1.5 max-h-56 overflow-y-auto">
          {participants.length === 0 ? (
            <p className="text-xs text-slate-400 italic p-3 text-center bg-white rounded-xl border border-slate-100">
              Nenhuma pessoa vinculada. Adicione guardiões ou carregue um preset da Etapa 5 acima.
            </p>
          ) : (
            participants.map((p) => {
              const isGuardian = p.role === 'guardian' || p.role === 'approver';
              return (
                <div
                  key={p.id}
                  className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-2 text-xs hover:border-[#BFD7FE] transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800 truncate">{p.name}</span>
                        {getRoleBadge(p.role)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">{p.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isGuardian && canSimulateSignatures && (
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(p.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                          p.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                            : 'bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-800 border border-slate-200'
                        }`}
                        title="Simular assinatura/voto deste guardião"
                      >
                        {p.status === 'approved' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Aprovado</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>Pendente</span>
                          </>
                        )}
                      </button>
                    )}

                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => handleRemove(p.id)}
                        className="p-1 text-slate-300 hover:text-rose-500 transition-colors cursor-pointer"
                        title="Remover pessoa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
