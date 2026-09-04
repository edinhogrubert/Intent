import React, { useState } from 'react';
import { 
  CheckCircle2, Star, MapPin, Calendar, Lock, Users, 
  Settings, Mail, UserPlus, Edit3, Bookmark, Trophy, Shield 
} from 'lucide-react';
import { UserAccount } from '../types';

interface UserProfileViewProps {
  user: UserAccount;
  onEditProfile?: () => void;
  onSelectIntent: (id: string) => void;
}

export function UserProfileView({ user, onEditProfile, onSelectIntent }: UserProfileViewProps) {
  const [activeTab, setActiveTab] = useState<'ativas' | 'revelacoes' | 'atividade'>('ativas');
  const [isFollowing, setIsFollowing] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [publicProfile, setPublicProfile] = useState(true);

  return (
    <div className="w-full max-w-5xl mx-auto bg-[#fbf9f5] min-h-screen py-4 px-4 sm:px-6 antialiased font-sans">
      <div className="space-y-6">
        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[#e4e2de]">
          {/* Cover Photo */}
          <div className="h-36 sm:h-48 w-full bg-gradient-to-r from-[#1a237e] to-[#000666] relative">
            <img
              src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1000&auto=format&fit=crop&q=80"
              alt="Capa de perfil"
              className="w-full h-full object-cover opacity-70"
            />
          </div>

          <div className="px-6 pb-6 relative">
            {/* Avatar */}
            <div className="absolute -top-12 sm:-top-16 left-6 rounded-full border-4 border-white bg-white overflow-hidden w-24 h-24 sm:w-32 sm:h-32 shadow-md">
              <img
                src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end pt-4 gap-2">
              <button
                onClick={onEditProfile}
                className="px-4 py-2 rounded-xl border border-[#c6c5d4] text-[#1b1c1a] font-bold text-xs hover:bg-[#f5f3ef] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar Perfil</span>
              </button>
            </div>

            {/* Info */}
            <div className="mt-4 sm:mt-2 space-y-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#1b1c1a] flex items-center gap-2">
                  <span>{user.name}</span>
                  <CheckCircle2 className="w-5 h-5 text-[#006a62] fill-current text-white" />
                </h1>
                <p className="text-xs text-[#454652] font-mono font-semibold">
                  {`@${(user.username || user.name.toLowerCase().replace(/\s+/g, '')).replace(/^@+/, '')}`}
                </p>
              </div>

              <p className="text-xs sm:text-sm text-[#1b1c1a] max-w-2xl leading-relaxed">
                {user.bio || 'Designer de Produto. Entusiasta de corrida de rua e focando em aprender violão este ano. 🏃‍♂️🎸 #ConstruindoHábitos'}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-[#666666]">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> São Paulo, Brasil
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Membro desde Mai 2024
                </span>
              </div>

              {/* Stats Row */}
              <div className="flex gap-6 pt-4 border-t border-[#f5f3ef] text-center sm:text-left">
                <div>
                  <span className="text-base font-black text-[#1b1c1a] block">12</span>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#666666]">Intents</span>
                </div>
                <div>
                  <span className="text-base font-black text-[#1b1c1a] block">450</span>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#666666]">Seguidores</span>
                </div>
                <div>
                  <span className="text-base font-black text-[#1b1c1a] block">320</span>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#666666]">Seguindo</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bento Stats & Ratings */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e4e2de] flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#e0e0ff] text-[#000767] flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-bold text-[#666666]">Intents Realizadas</p>
              <p className="text-xl font-black text-[#1b1c1a]">42</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e4e2de] flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#84f5e8] text-[#00201d] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-bold text-[#666666]">Mobilização</p>
              <p className="text-xl font-black text-[#1b1c1a]">8.5k <span className="text-xs text-[#006a62] font-bold">+12%</span></p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e4e2de] flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#ffdbd0] text-[#3a0a00] flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-bold text-[#666666]">Confiabilidade</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="flex text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                </div>
                <span className="text-xs font-black text-[#1b1c1a]">4.8</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content Tabs */}
        <div className="space-y-4">
          <div className="flex border-b border-[#e4e2de]">
            {[
              { id: 'ativas', label: 'Intents Ativas (3)' },
              { id: 'revelacoes', label: 'Revelações (42)' },
              { id: 'atividade', label: 'Atividade' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-6 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  activeTab === t.id
                    ? 'border-[#000666] text-[#000666]'
                    : 'border-transparent text-[#666666] hover:text-[#1b1c1a]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Active Intents Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <article
              onClick={() => onSelectIntent('read-books')}
              className="bg-white rounded-2xl p-5 shadow-sm border border-[#e4e2de] hover:shadow-md transition-all cursor-pointer space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-[#1b1c1a]">Ler 12 livros este ano</h3>
                  <p className="text-[11px] text-[#666666]">Público • Focado em hábito</p>
                </div>
                <span className="bg-[#E0F2F1] text-[#006a62] text-[10px] font-bold px-2 py-0.5 rounded-md">
                  Em andamento
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#454652]">Progresso</span>
                  <span className="text-[#000666]">5/12 (41%)</span>
                </div>
                <div className="h-2 w-full bg-[#eae8e4] rounded-full overflow-hidden">
                  <div className="h-full bg-[#000666] rounded-full" style={{ width: '41%' }}></div>
                </div>
              </div>

              <div className="h-20 bg-[#efeeea] rounded-xl flex items-center justify-center border border-[#c6c5d4]/40 text-xs text-[#454652] gap-1.5 font-bold">
                <Lock className="w-4 h-4 text-[#000666]" />
                <span>Conteúdo Restrito</span>
              </div>
            </article>

            <article
              onClick={() => onSelectIntent('half-marathon')}
              className="bg-white rounded-2xl p-5 shadow-sm border border-[#e4e2de] hover:shadow-md transition-all cursor-pointer space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-[#1b1c1a]">Meia Maratona 21km</h3>
                  <p className="text-[11px] text-[#666666]">Público • Treinos longos</p>
                </div>
                <span className="bg-[#84f5e8] text-[#00201d] text-[10px] font-bold px-2 py-0.5 rounded-md">
                  85% concluído
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#454652]">Progresso</span>
                  <span className="text-[#006a62]">350/400km</span>
                </div>
                <div className="h-2 w-full bg-[#E0F2F1] rounded-full overflow-hidden">
                  <div className="h-full bg-[#006a62] rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>

              <div className="h-20 bg-[#efeeea] rounded-xl flex items-center justify-center border border-[#c6c5d4]/40 text-xs text-[#454652] gap-1.5 font-bold">
                <Lock className="w-4 h-4 text-[#000666]" />
                <span>Foto na Linha de Chegada</span>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}
