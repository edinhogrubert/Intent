import React, { useState } from 'react';
import {
  Users,
  Shield,
  Send,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  Trash2,
  Sparkles,
  UserCheck,
  UserX,
  AlertCircle,
  Key,
} from 'lucide-react';
import { Participant, ParticipantRole, ParticipantStatus } from '../types';
import { SAMPLE_PEOPLE_PRESETS } from '../utils/conditionEvaluator';

interface ParticipantManagerProps {
  participants: Participant[];
  onChange: (updated: Participant[]) => void;
  requiredApprovals?: number;
  onRequiredApprovalsChange?: (num: number) => void;
  isReadOnly?: boolean;
  canSimulateSignatures?: boolean;
}

export function ParticipantManager({
  participants,
  onChange,
  requiredApprovals,
  onRequiredApprovalsChange,
  isReadOnly = false,
  canSimulateSignatures = true,
}: ParticipantManagerProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<ParticipantRole>('guardian');
  const [notes, setNotes] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const guardians = participants.filter((p) => p.role === 'guardian');
  const approvedGuardians = guardians.filter((g) => g.status === 'approved');
  const recipients = participants.filter((p) => p.role === 'recipient');
  const viewers = participants.filter((p) => p.role === 'viewer');

  const quorumNeeded = requiredApprovals !== undefined ? requiredApprovals : Math.max(1, guardians.length);
  const isQuorumReached = guardians.length === 0 || approvedGuardians.length >= quorumNeeded;

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

  const handleAddPreset = (preset: typeof SAMPLE_PEOPLE_PRESETS[0]) => {
    const newParticipant: Participant = {
      ...preset,
      id: 'p-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
    };
    onChange([...participants, newParticipant]);
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
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Shield className="w-3 h-3 text-amber-600" />
            <span>Guardião (Aprovador)</span>
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
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <Eye className="w-3 h-3 text-slate-500" />
            <span>Observador</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4" id="participant-manager-section">
      {/* Guardian Quorum Status Bar */}
      {guardians.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-white border border-[#DCE7F6] shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-[#0055FF]" />
              <span className="text-xs font-bold text-slate-800">
                Quórum de Guardiões (Assinaturas)
              </span>
            </div>
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                isQuorumReached
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              {approvedGuardians.length} de {quorumNeeded} aprovado(s)
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
                  quorumNeeded > 0 ? (approvedGuardians.length / quorumNeeded) * 100 : 100
                )}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>
              {isQuorumReached
                ? '✅ Quórum atingido! Condição de pessoas cumprida.'
                : `Aguardando ${Math.max(0, quorumNeeded - approvedGuardians.length)} assinatura(s) para liberar.`}
            </span>
            {onRequiredApprovalsChange && !isReadOnly && (
              <div className="flex items-center gap-1.5">
                <span>Quórum exigido:</span>
                <select
                  value={quorumNeeded}
                  onChange={(e) => onRequiredApprovalsChange(Number(e.target.value))}
                  className="bg-[#F8FAFC] border border-slate-200 rounded-md text-[11px] px-1.5 py-0.5 font-bold"
                >
                  {Array.from({ length: guardians.length || 1 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'Guardião' : 'Guardiões'}
                    </option>
                  ))}
                </select>
              </div>
            )}
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

        {participants.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
            <p className="text-xs text-slate-500">
              Nenhuma pessoa ou guardião vinculado a esta intenção.
            </p>
            {!isReadOnly && (
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400">Sugestões rápidas:</span>
                {SAMPLE_PEOPLE_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddPreset(p)}
                    className="px-2 py-0.5 bg-white hover:bg-[#E2EDFF] text-[#0055FF] border border-[#BFD7FE] rounded text-[10px] font-semibold transition-all cursor-pointer"
                  >
                    + {p.name} ({p.role === 'guardian' ? 'Guardião' : 'Destinatário'})
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {participants.map((p) => {
              const isApproved = p.status === 'approved';

              return (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-white border border-slate-200 hover:border-[#BFD7FE] transition-all flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        p.role === 'guardian'
                          ? 'bg-amber-100 text-amber-800'
                          : p.role === 'recipient'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {p.name}
                        </span>
                        {getRoleBadge(p.role)}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate font-mono">
                        {p.email}
                      </div>
                      {p.notes && (
                        <p className="text-[10px] text-slate-500 italic mt-0.5 truncate">
                          {p.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Status / Sign toggle */}
                    {p.role === 'guardian' && canSimulateSignatures && (
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(p.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          isApproved
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                        }`}
                        title={
                          isApproved
                            ? 'Clique para revogar assinatura (Simulação)'
                            : 'Clique para assinar como este Guardião (Simulação)'
                        }
                      >
                        {isApproved ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Assinado</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                            <span>Assinar</span>
                          </>
                        )}
                      </button>
                    )}

                    {p.role === 'recipient' && (
                      <span className="text-[11px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md font-medium border border-indigo-100">
                        Destinatário
                      </span>
                    )}

                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => handleRemove(p.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Remover pessoa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add New Participant Form */}
      {isAdding && !isReadOnly && (
        <div className="p-3.5 bg-[#F0F5FD] rounded-2xl border border-[#BFD7FE] space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#0055FF]" />
              <span>Vincular Nova Pessoa</span>
            </span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Gabriel Santos"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-[#0055FF]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                E-mail ou Identificador *
              </label>
              <input
                type="email"
                required
                placeholder="gabriel@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-[#0055FF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Papel na Intenção
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as ParticipantRole)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-[#0055FF]"
              >
                <option value="guardian">🛡️ Guardião (Aprovação obrigatória)</option>
                <option value="recipient">🎯 Destinatário (Recebe o conteúdo)</option>
                <option value="viewer">👁️ Observador (Acompanha status)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Anotação / Responsabilidade
              </label>
              <input
                type="text"
                placeholder="Ex: Confirmação jurídica ou entrega"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-[#0055FF]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex flex-wrap gap-1">
              {SAMPLE_PEOPLE_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setName(p.name);
                    setEmail(p.email);
                    setRole(p.role);
                    setNotes(p.notes || '');
                  }}
                  className="px-2 py-0.5 bg-white text-[#0055FF] border border-[#BFD7FE] rounded text-[10px] font-semibold hover:bg-[#E2EDFF]"
                >
                  Usar {p.name.split(' ')[0]}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => handleAddParticipant()}
              disabled={!name.trim() || !email.trim()}
              className="px-4 py-1.5 bg-[#0055FF] hover:bg-[#0047E0] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Adicionar Pessoa
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
