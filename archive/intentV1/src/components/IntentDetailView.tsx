import React, { useState } from 'react';
import { ArrowLeft, Clock, Rocket, Lock, CheckCircle2, Edit3, Send, Heart, Share2, Sparkles } from 'lucide-react';
import { UserAccount } from '../types';

interface IntentDetailViewProps {
  onBack: () => void;
  onCelebrationView?: () => void;
}

export function IntentDetailView({ onBack, onCelebrationView }: IntentDetailViewProps) {
  const [supported, setSupported] = useState(false);
  const [supportCount, setSupportCount] = useState(42);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([
    {
      id: '1',
      author: 'Ana Silva',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      text: 'Você vai conseguir! Acompanhando cada treino longo.',
      time: 'Há 2h',
    },
    {
      id: '2',
      author: 'Carlos Mendes',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      text: 'Sensacional essa dedicação. Quero ver a foto da chegada!',
      time: 'Ontem',
    }
  ]);

  const handleSupport = () => {
    if (!supported) {
      setSupported(true);
      setSupportCount((c) => c + 1);
    } else {
      setSupported(false);
      setSupportCount((c) => c - 1);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setComments([
      ...comments,
      {
        id: String(Date.now()),
        author: 'Você',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        text: commentText,
        time: 'Agora mesmo',
      }
    ]);
    setCommentText('');
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-[#fbf9f5] min-h-screen py-4 px-4 sm:px-6 antialiased font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#e4e2de]">
        <button
          onClick={onBack}
          className="flex items-center gap-2 p-2 rounded-xl hover:bg-[#eae8e4] text-[#454652] hover:text-[#000666] transition-colors cursor-pointer font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Feed</span>
        </button>

        {onCelebrationView && (
          <button
            onClick={onCelebrationView}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#84f5e8] text-[#00201d] font-bold text-xs hover:bg-[#66d9cc] transition-colors cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simular Revelação (100%)</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar: Creator Profile Summary */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e4e2de] space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
                alt="Lucas Moura"
                className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-xs"
              />
              <div>
                <h3 className="text-base font-bold text-[#1b1c1a]">Lucas Moura</h3>
                <p className="text-xs text-[#454652]">@lucasm</p>
              </div>
            </div>

            <p className="text-xs text-[#454652] leading-relaxed">
              Praticante de corrida de rua, desenvolvedor e focado em transformar desafios pessoais em hábitos consistentes.
            </p>

            <div className="space-y-2 pt-2 border-t border-[#e4e2de] text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#454652]">Intents Criadas</span>
                <span className="font-bold text-[#1b1c1a]">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#454652]">Intents Cumpridas</span>
                <span className="font-bold text-[#006a62]">8</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Hero Card */}
          <article className="bg-white rounded-2xl shadow-sm border border-[#e4e2de] p-6 sm:p-8 space-y-6">
            {/* Header info */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-[#e0e0ff] text-[#000767] px-3 py-1 rounded-full text-xs font-bold">
                  Desafio Pessoal
                </span>
                <span className="flex items-center gap-1 text-xs text-[#454652] font-semibold">
                  <Clock className="w-3.5 h-3.5" /> Faltam 14 dias
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-[#1b1c1a] leading-tight mb-2">
                Completar minha primeira Meia Maratona (21km)
              </h1>
              <p className="text-sm text-[#454652] leading-relaxed">
                Treinando há 4 meses para este momento. Quero provar para mim mesmo que a consistência vence o talento. Acompanhem essa reta final, preciso da energia de vocês nos treinos longos do fim de semana!
              </p>
            </div>

            {/* Giant Progress Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center bg-[#fbf9f5] rounded-2xl p-6 border border-[#e4e2de]">
              {/* Circular Progress */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" fill="none" r="42" stroke="#E0F2F1" strokeWidth="8" />
                    <circle
                      cx="50"
                      cy="50"
                      fill="none"
                      r="42"
                      stroke="#006a62"
                      strokeWidth="8"
                      strokeDasharray="264"
                      strokeDashoffset="40"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-[#006a62]">85%</span>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#454652]">Concluído</span>
                  </div>
                </div>
                <p className="text-xs text-[#454652] mt-2 text-center">350km de 400km de treino realizados.</p>
              </div>

              {/* Supporters and Actions */}
              <div className="flex flex-col justify-center space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-[#1b1c1a] mb-2">Apoiadores da Intent</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Avatar" />
                      <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="Avatar" />
                      <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" alt="Avatar" />
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-[#eae8e4] flex items-center justify-center text-[10px] font-bold text-[#1b1c1a]">
                        +{supportCount}
                      </div>
                    </div>
                    <span className="text-xs text-[#454652]">estão torcendo</span>
                  </div>
                </div>

                <button
                  onClick={handleSupport}
                  className={`w-full py-3.5 px-6 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-98 ${
                    supported
                      ? 'bg-[#006a62] text-white shadow-[#006a62]/20'
                      : 'bg-[#000666] text-white hover:bg-[#1a237e] shadow-[#000666]/20'
                  }`}
                >
                  <Rocket className="w-4 h-4" />
                  <span>{supported ? 'Você está apoiando! ✓' : 'Participar & Apoiar'}</span>
                </button>
              </div>
            </div>

            {/* Blurred Reward Section */}
            <div className="relative rounded-2xl overflow-hidden bg-white border border-[#e4e2de]">
              <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                <Lock className="w-8 h-8 text-[#000666] mb-2" />
                <h3 className="text-base font-bold text-[#1b1c1a] mb-1">Recompensa Exclusiva</h3>
                <p className="text-xs text-[#454652] max-w-sm">
                  Alcance 100% ou participe ativamente para desbloquear a foto da linha de chegada e o percurso completo do GPS.
                </p>
              </div>
              <div className="h-44 bg-[#eae8e4] opacity-40 blur-xs">
                <img
                  className="w-full h-full object-cover"
                  src="https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800&auto=format&fit=crop&q=80"
                  alt="Corrida protegida"
                />
              </div>
            </div>
          </article>

          {/* Updates & Timeline Section */}
          <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#e4e2de] space-y-6">
            <h3 className="text-lg font-black text-[#1b1c1a] pb-3 border-b border-[#e4e2de]">
              Atualizações do Desafio (2)
            </h3>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#84f5e8] text-[#00201d] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1 bg-[#fbf9f5] p-4 rounded-xl border border-[#e4e2de]">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-xs font-bold text-[#1b1c1a]">Treino Longão: 18km concluídos!</h4>
                    <span className="text-[10px] text-[#666666]">Ontem</span>
                  </div>
                  <p className="text-xs text-[#454652]">
                    Ritmo constante de 5:30/km. O joelho aguentou bem. Próximo passo é só manter na semana da prova.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#eae8e4] text-[#454652] flex items-center justify-center shrink-0 mt-0.5">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div className="flex-1 bg-[#fbf9f5] p-4 rounded-xl border border-[#e4e2de]">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-xs font-bold text-[#1b1c1a]">Inscrição confirmada</h4>
                    <span className="text-[10px] text-[#666666]">Há 2 semanas</span>
                  </div>
                  <p className="text-xs text-[#454652]">
                    Kit retirado! Número de peito 4592. O frio na barriga já começou.
                  </p>
                </div>
              </div>
            </div>

            {/* Comments Thread */}
            <div className="pt-4 border-t border-[#e4e2de] space-y-4">
              <h4 className="text-sm font-bold text-[#1b1c1a]">Comentários ({comments.length})</h4>

              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 text-xs">
                    <img src={comment.avatar} alt={comment.author} className="w-8 h-8 rounded-full object-cover shrink-0" />
                    <div className="flex-1 bg-[#f5f3ef] p-3 rounded-xl">
                      <div className="flex justify-between font-bold text-[#1b1c1a] mb-0.5">
                        <span>{comment.author}</span>
                        <span className="text-[10px] text-[#666666] font-normal">{comment.time}</span>
                      </div>
                      <p className="text-[#454652]">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Deixe uma mensagem de apoio..."
                  className="flex-1 bg-[#fbf9f5] border border-[#c6c5d4] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[#000666]"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#000666] text-white rounded-xl text-xs font-bold hover:bg-[#1a237e] transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar</span>
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
