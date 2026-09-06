import React, { useState } from 'react';
import { Plus, MoreVertical, Lock, Users, Megaphone, CheckCircle2, Flame, Lightbulb, Sparkles } from 'lucide-react';
import { UserAccount } from '../types';

interface MyIntentsDashboardProps {
  currentUser: UserAccount;
  onCreateNew: () => void;
  onSelectIntent: (id: string) => void;
}

export function MyIntentsDashboard({ currentUser, onCreateNew, onSelectIntent }: MyIntentsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'ativas' | 'rascunhos' | 'concluidas' | 'participando'>('ativas');

  const intentsList = [
    {
      id: 'book-launch',
      title: 'Lançamento do Livro "Design Essencial"',
      status: 'Em Andamento',
      statusColor: 'bg-[#E0F2F1] text-[#006a62]',
      progress: 75,
      supporters: '1.2k',
      locked: true,
    },
    {
      id: 'ui-course',
      title: 'Curso Gratuito de UI Avançado',
      status: 'Em Andamento',
      statusColor: 'bg-[#E0F2F1] text-[#006a62]',
      progress: 42,
      supporters: '840',
      locked: true,
    },
    {
      id: 'template-pack',
      title: 'Template Social Media 2026',
      status: 'Estagnada',
      statusColor: 'bg-[#ffdad6] text-[#ba1a1a]',
      progress: 15,
      supporters: '150',
      locked: true,
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto bg-[#fbf9f5] min-h-screen py-4 px-4 sm:px-6 antialiased font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left/Center Feed Column */}
        <div className="lg:col-span-8 space-y-6">
          <div>
            <h2 className="text-2xl font-black text-[#000666] tracking-tight mb-1">
              Minhas Intents
            </h2>
            <p className="text-xs text-[#454652]">
              Gerencie suas expectativas e acompanhe o progresso da sua comunidade.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: 'ativas', label: 'Ativas' },
              { id: 'rascunhos', label: 'Rascunhos' },
              { id: 'concluidas', label: 'Concluídas' },
              { id: 'participando', label: 'Participando' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === t.id
                    ? 'bg-[#000666] text-white shadow-xs'
                    : 'bg-white text-[#454652] hover:bg-[#f5f3ef] border border-[#e4e2de]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {intentsList.map((intent) => (
              <article
                key={intent.id}
                onClick={() => onSelectIntent(intent.id)}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between border border-[#e4e2de] cursor-pointer group space-y-4"
              >
                <div className="flex justify-between items-start">
                  <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${intent.statusColor}`}>
                    {intent.status}
                  </span>
                  <button className="text-[#c6c5d4] hover:text-[#000666] transition-colors p-1">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#1b1c1a] group-hover:text-[#000666] transition-colors line-clamp-2">
                    {intent.title}
                  </h3>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-[#454652]">Progresso de Revelação</span>
                    <span className="text-[#006a62]">{intent.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-[#E0F2F1] rounded-full overflow-hidden">
                    <div className="h-full bg-[#006a62] rounded-full" style={{ width: `${intent.progress}%` }}></div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#f5f3ef] text-xs">
                  <div className="flex items-center gap-1.5 text-[#666666]">
                    <Users className="w-4 h-4" />
                    <span className="font-semibold">{intent.supporters} mobilizados</span>
                  </div>

                  <div className="w-7 h-7 rounded-lg bg-[#f5f3ef] flex items-center justify-center border border-[#e4e2de] text-[#666666]">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                </div>
              </article>
            ))}

            {/* Add New Intent Card */}
            <article
              onClick={onCreateNew}
              className="bg-[#f5f3ef]/60 rounded-2xl border-2 border-dashed border-[#c6c5d4] p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-[#f5f3ef] transition-colors min-h-[220px] text-center group"
            >
              <div className="w-12 h-12 rounded-full bg-[#000666] text-white flex items-center justify-center mb-1 group-hover:scale-105 transition-transform shadow-xs">
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-sm font-bold text-[#000666]">Criar Nova Intent</h3>
              <p className="text-xs text-[#454652] max-w-[200px]">
                Mobilize sua comunidade para alcançar um novo marco.
              </p>
            </article>
          </div>
        </div>

        {/* Right Column: Impact & Community Tip */}
        <aside className="hidden lg:block lg:col-span-4 space-y-6">
          {/* Your Impact Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e4e2de] space-y-5">
            <h3 className="text-base font-bold text-[#000666]">Seu Impacto</h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#81f3e5] text-[#00201d] flex items-center justify-center shrink-0">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-[#454652]">Total Mobilizado</p>
                  <p className="text-lg font-black text-[#1b1c1a]">
                    2.190 <span className="text-xs text-[#666666] font-normal">pessoas</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#e0e0ff] text-[#000767] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-[#454652]">Intents Concluídas</p>
                  <p className="text-lg font-black text-[#1b1c1a]">12</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#ffdbd0] text-[#3a0a00] flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-[#454652]">Taxa de Engajamento</p>
                  <p className="text-lg font-black text-[#1b1c1a]">8.4%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Community Tip Card */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#e4e2de]">
            <div className="h-20 bg-gradient-to-r from-[#1a237e] to-[#000666] p-4 flex items-center">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                <Lightbulb className="w-5 h-5" />
              </div>
            </div>
            <div className="p-5">
              <h4 className="text-sm font-bold text-[#1b1c1a] mb-1.5">Dica da Comunidade</h4>
              <p className="text-xs text-[#454652] leading-relaxed">
                Intents com metas intermediárias (milestones) engajam <strong>40% mais</strong> do que aquelas com apenas um objetivo final.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
