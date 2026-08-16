import { TrendingUp, UserCheck, Shield, LogOut, Trash2, User, Sparkles, CheckCircle2 } from 'lucide-react';
import { UserAccount } from '../types';
import { DevInspectorBadge } from './DevInspectorBadge';

interface AccountStatusCardProps {
  user: UserAccount;
  onLogout: () => void;
  onRequestDelete: () => void;
  onOpenProfile?: () => void;
}

export function AccountStatusCard({
  user,
  onLogout,
  onRequestDelete,
  onOpenProfile,
}: AccountStatusCardProps) {
  const formattedCreationDate = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(user.createdAt || Date.now()));

  return (
    <div
      id="account-status-card"
      className="bg-white border border-[#DCE7F6] rounded-3xl p-6 md:p-7 shadow-xs flex flex-col justify-between relative"
    >
      <DevInspectorBadge
        file="src/components/AccountStatusCard.tsx"
        functionName="AccountStatusCard"
        className="mb-1"
      />
      {/* Card Header */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 text-slate-700 text-sm font-bold">
            <TrendingUp className="w-4 h-4 text-[#0055FF]" />
            <span>Sua Conta & Sessão</span>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#EAF2FF] text-[#0055FF] border border-[#BFD7FE] font-bold">
            Etapa 1 — Identidade
          </span>
        </div>

        {/* User Identity Info */}
        <div className="mb-4 p-3.5 bg-[#F8FAFC] rounded-2xl border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0055FF] text-white flex items-center justify-center font-bold text-sm shadow-xs overflow-hidden">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{user.name.slice(0, 2).toUpperCase()}</span>
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 leading-tight">{user.name}</p>
              <p className="text-xs font-mono text-[#0055FF] font-semibold">
                {user.username || '@' + user.name.toLowerCase().replace(/\s+/g, '')}
              </p>
            </div>
          </div>
          {onOpenProfile && (
            <button
              type="button"
              onClick={onOpenProfile}
              className="px-3 py-1.5 rounded-xl bg-[#EAF2FF] hover:bg-[#D6E6FF] text-[#0055FF] text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>
          )}
        </div>

        {/* Metric Rows */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs text-slate-500 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#0055FF]" />
              <span>Status do Usuário</span>
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Ativo</span>
            </span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs text-slate-500 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#0055FF]" />
              <span>Sessão Persistente</span>
            </span>
            <span className="text-xs font-semibold text-slate-700">
              Salva (não reinicia)
            </span>
          </div>

          <div className="flex items-center justify-between pb-1">
            <span className="text-xs text-slate-500">Membro desde</span>
            <span className="text-xs text-slate-700 font-mono font-medium">
              {formattedCreationDate}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
        {onOpenProfile && (
          <button
            id="account-profile-btn"
            type="button"
            onClick={onOpenProfile}
            className="w-full py-2.5 px-4 rounded-xl bg-[#F0F5FD] hover:bg-[#E2EDFF] border border-[#BFD7FE] text-xs font-bold text-[#0055FF] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0055FF]" />
            <span>Gerenciar Identidade & Perfis</span>
          </button>
        )}

        <div className="flex items-center gap-2 pt-1">
          <button
            id="account-logout-btn"
            type="button"
            onClick={onLogout}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-500" />
            <span>Sair</span>
          </button>

          <button
            id="account-delete-btn"
            type="button"
            onClick={onRequestDelete}
            className="py-2 px-3 rounded-xl hover:bg-rose-50 border border-transparent hover:border-rose-200 text-xs font-medium text-rose-600 transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            <span>Excluir</span>
          </button>
        </div>
      </div>
    </div>
  );
}
