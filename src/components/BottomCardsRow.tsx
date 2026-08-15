import { Flame, Clock, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { UserAccount } from '../types';

interface BottomCardsRowProps {
  user: UserAccount;
}

export function BottomCardsRow({ user }: BottomCardsRowProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
      {/* Left Item: Matches "Próximos - Contrato Empresa XP" */}
      <div className="lg:col-span-5">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3">
          <Clock className="w-4 h-4 text-[#0055FF]" />
          <span>Próximos passos</span>
        </div>

        <div
          id="next-step-card"
          className="bg-white border border-[#D8E6F8] hover:border-[#94BFFF] rounded-2xl p-4 flex items-center justify-between shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#E8F1FC] text-[#0055FF] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#0055FF] transition-colors">
                Permanência Ativada
              </h4>
              <p className="text-xs text-slate-500">
                Pode fechar e voltar amanhã sem perder a sessão
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* Right Items: Matches "Revelados hoje" (3 cards with light badges) */}
      <div className="lg:col-span-7">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3">
          <Sparkles className="w-4 h-4 text-[#8A4FFF]" />
          <span>Informações do Dia</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Card 1 */}
          <div className="bg-white/80 border border-[#DCE7F6] rounded-2xl p-4 flex flex-col items-center text-center shadow-2xs hover:shadow-xs transition-all">
            <div className="w-9 h-9 rounded-xl bg-[#E2EDFF] text-[#0055FF] flex items-center justify-center mb-2">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800 truncate w-full">
              Horário Ativo
            </span>
            <span className="text-[11px] text-emerald-600 font-medium mt-0.5">
              Sincronizado
            </span>
          </div>

          {/* Card 2 */}
          <div className="bg-white/80 border border-[#DCE7F6] rounded-2xl p-4 flex flex-col items-center text-center shadow-2xs hover:shadow-xs transition-all">
            <div className="w-9 h-9 rounded-xl bg-[#F1E8FF] text-[#8A4FFF] flex items-center justify-center mb-2">
              <Flame className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800 truncate w-full">
              Acesso Index
            </span>
            <span className="text-[11px] text-[#8A4FFF] font-medium mt-0.5">
              Liberado ({user.name})
            </span>
          </div>

          {/* Card 3 */}
          <div className="bg-white/80 border border-[#DCE7F6] rounded-2xl p-4 flex flex-col items-center text-center shadow-2xs hover:shadow-xs transition-all">
            <div className="w-9 h-9 rounded-xl bg-[#E2F5EC] text-[#12B76A] flex items-center justify-center mb-2">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800 truncate w-full">
              Status Geral
            </span>
            <span className="text-[11px] text-slate-500 font-medium mt-0.5">
              100% Operacional
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
