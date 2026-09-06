import React from 'react';
import { Target, ArrowRight, Play, Lock, Heart, MessageCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { UserAccount } from '../types';

interface LandingHeroViewProps {
  onStart: () => void;
  onExplore: () => void;
  onViewDemo: () => void;
}

export function LandingHeroView({ onStart, onExplore, onViewDemo }: LandingHeroViewProps) {
  return (
    <div className="w-full bg-[#fbf9f5] text-[#1b1c1a] min-h-[calc(100vh-5rem)] flex flex-col justify-center font-sans antialiased selection:bg-[#e0e0ff] selection:text-[#000767]">
      <main className="flex-1 flex flex-col lg:flex-row w-full max-w-[1200px] mx-auto items-center justify-between px-4 sm:px-8 py-8 lg:py-12 gap-8">
        {/* Left Column: Content & CTAs */}
        <section className="w-full lg:w-5/12 flex flex-col justify-center z-10 relative">
          {/* Brand Anchor */}
          <div className="flex items-center gap-3 mb-6 animate-fade-up">
            <div className="w-12 h-12 bg-[#000666] rounded-2xl flex items-center justify-center shadow-lg shadow-[#000666]/20">
              <Target className="text-white w-7 h-7 stroke-[2.5]" />
            </div>
            <h1 className="text-3xl font-black text-[#000666] tracking-tight">Intent</h1>
          </div>

          {/* Messaging */}
          <div className="mb-8">
            <h2 className="text-4xl sm:text-5xl font-black text-[#1b1c1a] mb-3 leading-[1.1] animate-fade-up">
              Faça acontecer.<br />
              <span className="text-[#000666]">Juntos.</span>
            </h2>
            <p className="text-lg text-[#454652] max-w-md leading-relaxed animate-fade-up">
              A rede social de expectativas. Transforme suas intenções em realidade com o apoio, acompanhamento e celebração da sua comunidade.
            </p>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-up">
            <button
              onClick={onStart}
              className="bg-[#000666] text-white font-bold text-sm px-8 py-3.5 rounded-full hover:bg-[#1a237e] hover:shadow-xl hover:shadow-[#000666]/20 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Criar conta</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onExplore}
              className="bg-white text-[#000666] border border-[#c6c5d4] font-bold text-sm px-8 py-3.5 rounded-full hover:bg-[#f5f3ef] hover:border-[#000666] transition-all duration-300 flex items-center justify-center cursor-pointer shadow-xs"
            >
              Explorar Feed
            </button>
          </div>

          <button
            onClick={onViewDemo}
            className="flex items-center gap-2 text-[#454652] hover:text-[#000666] transition-colors font-bold text-sm w-fit group animate-fade-up cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-[#eae8e4] flex items-center justify-center group-hover:bg-[#e0e0ff] transition-colors">
              <Play className="w-4 h-4 text-[#1b1c1a] group-hover:text-[#000666] fill-current" />
            </div>
            <span>Ver demonstração da Intent</span>
          </button>
        </section>

        {/* Right Column: Visual Preview & Abstract Graphic */}
        <section className="w-full lg:w-7/12 relative min-h-[440px] flex items-center justify-center p-4 lg:p-0 overflow-hidden">
          {/* Abstract Background Shapes for Depth */}
          <div className="absolute top-1/4 right-0 w-[450px] h-[450px] bg-[#bdc2ff] rounded-full mix-blend-multiply filter blur-[90px] opacity-60"></div>
          <div className="absolute bottom-1/4 left-1/4 w-[350px] h-[350px] bg-[#81f3e5] rounded-full mix-blend-multiply filter blur-[80px] opacity-40"></div>

          {/* Bento-style UI Mockup Container */}
          <div className="relative w-full max-w-md animate-float">
            {/* Main Feed Card */}
            <div className="bg-white/95 rounded-2xl p-6 shadow-[0_20px_40px_rgba(26,35,126,0.08)] border border-[#e4e2de] relative z-20 backdrop-blur-sm">
              {/* User Header */}
              <div className="flex items-center gap-3.5 mb-4">
                <img
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                  alt="Mariana Silva"
                />
                <div>
                  <p className="font-bold text-sm text-[#1b1c1a]">Mariana Silva</p>
                  <p className="text-xs text-[#454652] flex items-center gap-1">
                    <span>Público</span> • <span>Há 2h</span>
                  </p>
                </div>
                <button
                  onClick={onViewDemo}
                  className="ml-auto text-[#000666] font-bold text-xs bg-[#e0e0ff] px-3.5 py-1.5 rounded-full hover:bg-[#bdc2ff] transition-colors cursor-pointer"
                >
                  Acompanhar
                </button>
              </div>

              {/* Intent Title */}
              <h3 className="text-base font-bold text-[#1b1c1a] mb-3">
                Concluir certificação UX e lançar portfólio
              </h3>

              {/* Progress Section */}
              <div className="mb-4">
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-xs font-semibold text-[#006a62]">Fase: Portfólio</span>
                  <span className="text-[11px] font-bold text-[#00201d] bg-[#84f5e8] px-2 py-0.5 rounded-md">65% concluído</span>
                </div>
                <div className="w-full bg-[#E0F2F1] rounded-full h-2.5 overflow-hidden">
                  <div className="bg-[#006a62] h-full rounded-full w-[65%] transition-all duration-1000 ease-out"></div>
                </div>
              </div>

              {/* Blurred Content Preview (The 'Reveal' mechanic) */}
              <div
                onClick={onViewDemo}
                className="h-32 bg-[#efeeea] rounded-xl overflow-hidden relative group cursor-pointer border border-[#c6c5d4]/40"
              >
                <div className="absolute inset-0 backdrop-blur-md bg-white/40 flex flex-col items-center justify-center z-10 transition-all duration-300 group-hover:bg-white/20">
                  <Lock className="w-6 h-6 text-[#000666] mb-1" />
                  <span className="text-xs font-bold text-[#000666]">Conteúdo desbloqueia em 100%</span>
                </div>
                <img
                  className="w-full h-full object-cover opacity-60"
                  src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&auto=format&fit=crop&q=80"
                  alt="Prévia protegida"
                />
              </div>

              {/* Interaction Bar */}
              <div className="flex items-center gap-5 mt-4 pt-3.5 border-t border-[#e4e2de]">
                <div className="flex items-center gap-1.5 text-[#454652] hover:text-[#000666] cursor-pointer transition-colors">
                  <Heart className="w-4 h-4" />
                  <span className="text-xs font-bold">24</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#454652] hover:text-[#000666] cursor-pointer transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-xs font-bold">5</span>
                </div>
                {/* Avatars of supporters */}
                <div className="ml-auto flex -space-x-2">
                  <img
                    className="w-7 h-7 rounded-full border-2 border-white object-cover"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                    alt="Apoiador 1"
                  />
                  <img
                    className="w-7 h-7 rounded-full border-2 border-white object-cover"
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                    alt="Apoiador 2"
                  />
                  <div className="w-7 h-7 rounded-full border-2 border-white bg-[#e4e2de] flex items-center justify-center text-[9px] font-bold text-[#1b1c1a]">
                    +12
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Card Peeking Behind */}
            <div className="absolute -bottom-6 -right-6 w-64 bg-white rounded-xl p-3.5 shadow-[0_10px_30px_rgba(26,35,126,0.05)] border border-[#e4e2de] z-10 opacity-90 transform rotate-3">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-7 h-7 rounded-full bg-[#ffdbd0] flex items-center justify-center text-[#3a0a00] font-bold text-xs">
                  R
                </div>
                <p className="text-xs font-bold text-[#1b1c1a]">Rafael concluiu um marco!</p>
              </div>
              <p className="text-[11px] text-[#454652] truncate">"Primeiro rascunho do livro enviado..."</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
