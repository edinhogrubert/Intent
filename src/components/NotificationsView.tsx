import React, { useState } from 'react';
import { 
  Users, UserPlus, Flag, PartyPopper, Flame, ArrowRight, CheckCircle2, Check 
} from 'lucide-react';

interface NotificationsViewProps {
  onViewReveal: () => void;
}

export function NotificationsView({ onViewReveal }: NotificationsViewProps) {
  const [activeTab, setActiveTab] = useState<'todas' | 'importantes'>('todas');
  const [inviteStatus, setInviteStatus] = useState<string | null>(null);
  const [followedBack, setFollowedBack] = useState(false);

  return (
    <div className="w-full max-w-5xl mx-auto bg-[#fbf9f5] min-h-screen py-4 px-4 sm:px-6 antialiased font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Notifications Column */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#e4e2de]">
            <h2 className="text-2xl font-black text-[#000666] tracking-tight">Notificações</h2>
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('todas')}
                className={`text-xs font-bold pb-2 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'todas' ? 'border-[#000666] text-[#000666]' : 'border-transparent text-[#666666]'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setActiveTab('importantes')}
                className={`text-xs font-bold pb-2 border-b-2 transition-all cursor-pointer relative ${
                  activeTab === 'importantes' ? 'border-[#000666] text-[#000666]' : 'border-transparent text-[#666666]'
                }`}
              >
                <span>Importantes</span>
                <span className="absolute top-0 -right-2 w-1.5 h-1.5 bg-[#006a62] rounded-full"></span>
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#e4e2de] divide-y divide-[#f5f3ef] overflow-hidden">
            {/* 1. Group Invite */}
            <article className="p-4 sm:p-5 hover:bg-[#fbf9f5] transition-colors flex gap-4">
              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-2xl bg-[#e0e0ff] text-[#000767] flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#000666] rounded-full flex items-center justify-center text-white text-[9px]">
                  +
                </span>
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-xs sm:text-sm text-[#1b1c1a] leading-relaxed">
                  O grupo <strong className="font-bold">Maratona SP 2026</strong> convidou você para participar da meta <strong>"Treino de Base 10km"</strong>.
                </p>
                <span className="text-[10px] text-[#666666] block">Há 10 minutos</span>

                <div className="flex gap-2 pt-1">
                  {inviteStatus === 'accepted' ? (
                    <span className="text-xs font-bold text-[#006a62] flex items-center gap-1">
                      <Check className="w-4 h-4" /> Convite aceito!
                    </span>
                  ) : inviteStatus === 'declined' ? (
                    <span className="text-xs font-semibold text-[#666666]">Convite recusado</span>
                  ) : (
                    <>
                      <button
                        onClick={() => setInviteStatus('accepted')}
                        className="bg-[#000666] text-white text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-[#1a237e] transition-colors cursor-pointer"
                      >
                        Participar
                      </button>
                      <button
                        onClick={() => setInviteStatus('declined')}
                        className="bg-[#f5f3ef] border border-[#e4e2de] text-[#454652] text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-[#eae8e4] transition-colors cursor-pointer"
                      >
                        Recusar
                      </button>
                    </>
                  )}
                </div>
              </div>
            </article>

            {/* 2. Goal Progress Milestone */}
            <article className="p-4 sm:p-5 hover:bg-[#fbf9f5] transition-colors flex gap-4">
              <div className="w-11 h-11 rounded-2xl bg-[#84f5e8] text-[#00201d] flex items-center justify-center shrink-0">
                <Flag className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-xs sm:text-sm text-[#1b1c1a] leading-relaxed">
                  Parabéns! Você atingiu <span className="text-[#006a62] font-bold">50%</span> da sua meta <strong>"Ler 12 livros este ano"</strong>.
                </p>
                <span className="text-[10px] text-[#666666] block">Há 2 horas</span>
                <div className="w-full max-w-sm h-1.5 bg-[#eae8e4] rounded-full overflow-hidden">
                  <div className="h-full bg-[#006a62] rounded-full w-1/2"></div>
                </div>
              </div>
            </article>

            {/* 3. Reveal Completed */}
            <article className="p-4 sm:p-5 hover:bg-[#fbf9f5] transition-colors flex gap-4">
              <div className="relative shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                  alt="João Pedro"
                  className="w-11 h-11 rounded-full object-cover"
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#84f5e8] text-[#00201d] rounded-full flex items-center justify-center shadow-xs">
                  <PartyPopper className="w-3 h-3" />
                </span>
              </div>
              <div className="flex-1 flex flex-col sm:flex-row justify-between gap-3">
                <div>
                  <p className="text-xs sm:text-sm text-[#1b1c1a] leading-relaxed">
                    <strong>João Pedro</strong> concluiu a meta <strong>"Viagem Surpresa"</strong> e revelou o conteúdo final!
                  </p>
                  <span className="text-[10px] text-[#666666] block mt-1">Ontem, 19:30</span>
                  <button
                    onClick={onViewReveal}
                    className="text-xs font-bold text-[#000666] hover:underline flex items-center gap-1 mt-2 cursor-pointer"
                  >
                    <span>Ver revelação</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#e4e2de] shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&auto=format&fit=crop&q=80"
                    alt="Praia revelada"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </article>

            {/* 4. New Follower */}
            <article className="p-4 sm:p-5 hover:bg-[#fbf9f5] transition-colors flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Ana Silva"
                  className="w-11 h-11 rounded-full object-cover"
                />
                <div>
                  <p className="text-xs sm:text-sm text-[#1b1c1a]">
                    <strong>Ana Silva</strong> começou a acompanhar suas metas.
                  </p>
                  <span className="text-[10px] text-[#666666]">Ontem, 14:15</span>
                </div>
              </div>

              <button
                onClick={() => setFollowedBack(!followedBack)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  followedBack ? 'bg-[#000666] text-white' : 'bg-[#f5f3ef] text-[#1b1c1a] hover:bg-[#eae8e4]'
                }`}
              >
                {followedBack ? 'Acompanhando' : 'Acompanhar'}
              </button>
            </article>

            {/* 5. Gaining Traction */}
            <article className="p-4 sm:p-5 hover:bg-[#fbf9f5] transition-colors flex gap-4">
              <div className="w-11 h-11 rounded-2xl bg-[#ffdbd0] text-[#3a0a00] flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-[#1b1c1a] leading-relaxed">
                  Sua intent <strong>"Aprender Francês"</strong> está ganhando tração! 5 novas pessoas começaram a apoiar esta semana.
                </p>
                <span className="text-[10px] text-[#666666] block mt-1">2 de Outubro</span>
              </div>
            </article>
          </div>
        </div>

        {/* Right Suggestions Column */}
        <aside className="hidden lg:block lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e4e2de] space-y-4">
            <h3 className="text-sm font-bold text-[#000666]">Sugestões para você</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
                    alt="Carlos Eduardo"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold text-[#1b1c1a]">Carlos Eduardo</p>
                    <p className="text-[11px] text-[#666666]">Focado em carreira</p>
                  </div>
                </div>
                <button className="text-xs font-bold text-[#000666] hover:underline cursor-pointer">
                  Seguir
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#81f3e5] text-[#00201d] flex items-center justify-center font-bold text-xs">
                    🏃
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1b1c1a]">Clube de Corrida</p>
                    <p className="text-[11px] text-[#666666]">Comunidade de 320 membros</p>
                  </div>
                </div>
                <button className="text-xs font-bold text-[#000666] hover:underline cursor-pointer">
                  Ver
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
