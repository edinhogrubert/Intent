import React, { useState } from 'react';
import { 
  Search, SlidersHorizontal, Flame, Lock, Trophy, PiggyBank, 
  Sparkles, CheckCircle2, UserPlus, TrendingUp, Compass, BookOpen 
} from 'lucide-react';

interface ExploreFeedViewProps {
  onSelectIntent: (id: string) => void;
}

export function ExploreFeedView({ onSelectIntent }: ExploreFeedViewProps) {
  const [activeFilter, setActiveFilter] = useState('Em alta');
  const [searchQuery, setSearchQuery] = useState('');
  const [followingCreators, setFollowingCreators] = useState<string[]>([]);

  const filters = ['Em alta', 'Recentes', 'Desafios', 'Ofertas', 'Família'];

  const creators = [
    {
      id: '1',
      name: 'Carlos Mendes',
      role: 'Finanças Pessoais',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: '2',
      name: 'Ana Costa',
      role: 'Estilo de Vida',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: '3',
      name: 'Helena Silva',
      role: 'Bem-estar',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
    },
  ];

  const toggleFollow = (id: string) => {
    if (followingCreators.includes(id)) {
      setFollowingCreators(followingCreators.filter((c) => c !== id));
    } else {
      setFollowingCreators([...followingCreators, id]);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-[#fbf9f5] min-h-screen py-4 px-4 sm:px-6 antialiased font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Explore Content (Left/Center) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Search Header */}
          <div className="sticky top-0 z-20 pt-2 pb-1 bg-[#fbf9f5]/90 backdrop-blur-md space-y-4">
            <h2 className="text-2xl font-black text-[#1b1c1a] tracking-tight">
              Descubra novas expectativas
            </h2>

            <div className="relative group">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#666666] group-focus-within:text-[#000666] transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por intents, pessoas ou tópicos..."
                className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-white border border-[#e4e2de] focus:border-[#000666] focus:ring-1 focus:ring-[#000666] outline-none text-sm text-[#1b1c1a] shadow-xs transition-all placeholder:text-[#666666]"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-[#f5f3ef] flex items-center justify-center hover:bg-[#eae8e4] text-[#454652] transition-colors">
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Chips */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`shrink-0 whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeFilter === filter
                      ? 'bg-[#000666] text-white shadow-xs'
                      : 'bg-white text-[#454652] hover:bg-[#f5f3ef] border border-[#e4e2de]'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Explore Grid (Bento style) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Card 1: Trending Intent (Spans 2 cols) */}
            <article
              onClick={() => onSelectIntent('reading-50')}
              className="sm:col-span-2 bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-[#e4e2de] cursor-pointer flex flex-col gap-4 group relative overflow-hidden"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <img
                    className="w-11 h-11 rounded-full object-cover border border-[#e4e2de]"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                    alt="Marina Silva"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-[#1b1c1a]">Marina Silva</h3>
                    <p className="text-[11px] text-[#666666]">Há 2 horas • Meta de Leitura</p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#ffdbd0] text-[#3a0a00] font-bold text-[10px] uppercase tracking-wider">
                  <Flame className="w-3.5 h-3.5 text-orange-600" /> Trending
                </span>
              </div>

              <div>
                <h4 className="text-lg font-bold text-[#1b1c1a] group-hover:text-[#000666] transition-colors mb-1">
                  Ler 50 livros até o fim do ano 📚
                </h4>
                <p className="text-xs text-[#454652] line-clamp-2 leading-relaxed">
                  Acompanhem minha jornada de leitura deste ano. Vou compartilhar resenhas e insights a cada marco atingido. O próximo livro é uma surpresa!
                </p>
              </div>

              {/* Progress Section */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-bold">
                  <span className="text-[#000666]">22/50 Livros</span>
                  <span className="text-[#666666]">44% Completo</span>
                </div>
                <div className="w-full h-2 bg-[#E0F2F1] rounded-full overflow-hidden">
                  <div className="h-full bg-[#006a62] rounded-full" style={{ width: '44%' }}></div>
                </div>
              </div>

              {/* Blurred Preview */}
              <div className="relative h-28 rounded-xl overflow-hidden bg-[#efeeea] flex items-center justify-center border border-[#c6c5d4]/40">
                <div className="absolute inset-0 bg-cover bg-center blur-xs opacity-50" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80)' }}></div>
                <span className="relative z-10 px-4 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-[#1b1c1a] flex items-center gap-2 shadow-xs">
                  <Lock className="w-3.5 h-3.5 text-[#000666]" /> Conteúdo Restrito
                </span>
              </div>
            </article>

            {/* Card 2: Challenge */}
            <article
              onClick={() => onSelectIntent('sugar-free')}
              className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all border border-[#e4e2de] cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-[#ffdbd0] flex items-center justify-center text-[#3a0a00]">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#666666]">Desafio</span>
                </div>
                <h4 className="text-sm font-bold text-[#1b1c1a] group-hover:text-[#000666] transition-colors mb-2">
                  30 Dias sem Açúcar 🥑
                </h4>
                <p className="text-xs text-[#454652] line-clamp-2">
                  Construção coletiva de hábito saudável com receitas diárias.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-4 mt-4 border-t border-[#f5f3ef]">
                <div className="flex -space-x-2">
                  <img className="w-6 h-6 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="Avatar" />
                  <img className="w-6 h-6 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" alt="Avatar" />
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-[#eae8e4] flex items-center justify-center text-[9px] font-bold text-[#1b1c1a]">
                    +12
                  </div>
                </div>
                <span className="text-[11px] text-[#666666]">participando</span>
              </div>
            </article>

            {/* Card 3: Collective Goal */}
            <article
              onClick={() => onSelectIntent('trip-fund')}
              className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all border border-[#e4e2de] cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-[#81f3e5] flex items-center justify-center text-[#00201d]">
                    <PiggyBank className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#666666]">Meta Coletiva</span>
                </div>
                <h4 className="text-sm font-bold text-[#1b1c1a] group-hover:text-[#000666] transition-colors mb-2">
                  Fundo para Viagem Comunitária ✈️
                </h4>
                <p className="text-xs text-[#454652] line-clamp-2">
                  Arrecadação comunitária para intercâmbio de estudantes.
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#f5f3ef]">
                <div className="w-full h-2 bg-[#eae8e4] rounded-full overflow-hidden mb-1">
                  <div className="h-full bg-[#000666] rounded-full" style={{ width: '75%' }}></div>
                </div>
                <p className="text-[11px] text-right text-[#666666] font-bold">Faltam 25%</p>
              </div>
            </article>

            {/* Collection Banner */}
            <article className="sm:col-span-2 h-36 rounded-2xl overflow-hidden relative shadow-sm border border-[#e4e2de] flex items-center justify-center cursor-pointer group">
              <img
                src="https://images.unsplash.com/photo-1519750783826-e2420f4d687f?w=1000&auto=format&fit=crop&q=80"
                alt="Coleção"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-[#000666]/70 backdrop-blur-2xs"></div>
              <div className="relative z-10 text-center px-6">
                <h3 className="text-xl font-black text-white mb-2">Explore o Inesperado</h3>
                <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-white border border-white/30 hover:bg-white/30 transition-colors inline-block">
                  Ver Coleção de Destaques
                </span>
              </div>
            </article>
          </div>
        </div>

        {/* Right Sidebar: Trusted Creators & Topics */}
        <aside className="hidden lg:block lg:col-span-4 space-y-6">
          {/* Trusted Creators */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e4e2de] space-y-4">
            <h3 className="text-sm font-bold text-[#1b1c1a] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#000666]" />
              <span>Criadores Confiáveis</span>
            </h3>

            <div className="space-y-4">
              {creators.map((creator) => {
                const isFollowing = followingCreators.includes(creator.id);
                return (
                  <div key={creator.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={creator.avatar} alt={creator.name} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <p className="text-xs font-bold text-[#1b1c1a]">{creator.name}</p>
                        <p className="text-[11px] text-[#666666]">{creator.role}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleFollow(creator.id)}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                        isFollowing
                          ? 'bg-[#000666] text-white'
                          : 'bg-[#e0e0ff] text-[#000767] hover:bg-[#bdc2ff]'
                      }`}
                    >
                      {isFollowing ? 'Seguindo' : 'Seguir'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trending Topics */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e4e2de] space-y-3">
            <h3 className="text-sm font-bold text-[#1b1c1a] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#006a62]" />
              <span>Tópicos Populares</span>
            </h3>

            <div className="flex flex-wrap gap-2">
              {['#Sustentabilidade', '#Maratona2026', '#DIY', '#Leitura', '#Tecnologia', '#Hábitos'].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 bg-[#fbf9f5] border border-[#e4e2de] rounded-xl text-xs font-medium text-[#454652] hover:text-[#000666] hover:border-[#000666] cursor-pointer transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
