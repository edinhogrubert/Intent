import { TrendingUp, UserCheck, Shield, LogOut, Trash2 } from 'lucide-react';
import { UserAccount } from '../types';

interface AccountStatusCardProps {
  user: UserAccount;
  onLogout: () => void;
  onRequestDelete: () => void;
}

export function AccountStatusCard({
  user,
  onLogout,
  onRequestDelete,
}: AccountStatusCardProps) {
  const formattedCreationDate = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(user.createdAt || Date.now()));

  return (
    <div
      id="account-status-card"
      className="bg-[#152744] text-white rounded-3xl p-6 md:p-7 shadow-lg flex flex-col justify-between"
    >
      {/* Card Header matching screenshot's "Seus objetivos" */}
      <div>
        <div className="flex items-center gap-2 text-slate-300 text-sm font-semibold mb-6">
          <TrendingUp className="w-4 h-4 text-[#4A8DFF]" />
          <span>Sua Conta & Sessão</span>
        </div>

        {/* Metric Rows */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-xs text-slate-300 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Status do Usuário</span>
            </span>
            <span className="text-sm font-bold text-white bg-blue-500/20 px-2.5 py-0.5 rounded-full border border-blue-400/30">
              Ativo
            </span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-xs text-slate-300 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>Continuidade</span>
            </span>
            <span className="text-xs font-semibold text-emerald-400">
              Salva (não reinicia)
            </span>
          </div>

          <div className="flex items-center justify-between pb-1">
            <span className="text-xs text-slate-300">Cadastro</span>
            <span className="text-xs text-slate-200 font-mono">
              {formattedCreationDate}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="mt-8 pt-4 border-t border-white/10 space-y-2">
        <button
          id="account-logout-btn"
          type="button"
          onClick={onLogout}
          className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 active:scale-98 text-xs font-semibold text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 text-blue-300" />
          <span>Sair da conta</span>
        </button>

        <button
          id="account-delete-btn"
          type="button"
          onClick={onRequestDelete}
          className="w-full py-2 px-4 rounded-xl hover:bg-rose-500/20 active:scale-98 text-xs font-medium text-rose-300 hover:text-rose-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
          <span>Cancelar inscrição / Descadastrar</span>
        </button>
      </div>
    </div>
  );
}
