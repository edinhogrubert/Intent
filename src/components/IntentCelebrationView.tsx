import React, { useState } from 'react';
import { ArrowLeft, Sparkles, CheckCircle2, Copy, Check, Share2, Flame, Heart, PartyPopper, MessageCircle, Send } from 'lucide-react';

interface IntentCelebrationViewProps {
  onBack: () => void;
}

export function IntentCelebrationView({ onBack }: IntentCelebrationViewProps) {
  const [copied, setCopied] = useState(false);
  const [reactions, setReactions] = useState({ fire: 450, party: 820, heart: 315 });
  const [userReacted, setUserReacted] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([
    {
      id: '1',
      author: 'Marina Silva',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      text: 'Finalmente! Não acredito que vamos ter aquela banda de fora. Já garanti meu ingresso! 🎫✨',
      time: 'Há 10 min',
    },
    {
      id: '2',
      author: 'Lucas Costa',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      text: 'Melhor cupom impossível, valeu a pena a espera da revelação! 🔥',
      time: 'Há 15 min',
    }
  ]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText('INTENTFEST30');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleReaction = (type: 'fire' | 'party' | 'heart') => {
    if (userReacted === type) {
      setUserReacted(null);
      setReactions((prev) => ({ ...prev, [type]: prev[type] - 1 }));
    } else {
      setUserReacted(type);
      setReactions((prev) => ({ ...prev, [type]: prev[type] + 1 }));
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
    <div className="w-full max-w-4xl mx-auto bg-[#fbf9f5] min-h-screen py-4 px-4 sm:px-6 antialiased font-sans relative overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#e4e2de]">
        <button
          onClick={onBack}
          className="flex items-center gap-2 p-2 rounded-xl hover:bg-[#eae8e4] text-[#454652] hover:text-[#000666] transition-colors cursor-pointer font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>
        <span className="text-xs font-bold text-[#006a62] bg-[#84f5e8] px-3 py-1 rounded-full">
          Intent 100% Desbloqueada
        </span>
      </div>

      {/* Celebration Header */}
      <div className="text-center py-6 animate-fade-up">
        <div className="w-16 h-16 rounded-full bg-[#84f5e8] text-[#00201d] flex items-center justify-center mx-auto mb-3 shadow-md">
          <PartyPopper className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#000666] tracking-tight">
          Aconteceu!
        </h1>
        <p className="text-sm text-[#454652] mt-1">
          A meta foi atingida com sucesso por <strong className="text-[#1b1c1a]">1.240 participantes</strong>.
        </p>
      </div>

      <div className="space-y-6">
        {/* Revealed Content Card */}
        <article className="bg-white rounded-2xl shadow-md border border-[#e4e2de] overflow-hidden animate-fade-up">
          <div className="relative h-64 sm:h-72 w-full">
            <img
              className="w-full h-full object-cover"
              src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1000&auto=format&fit=crop&q=80"
              alt="Line-up revelado"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-6 sm:p-8">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-[#84f5e8] block mb-1">
                  Resultado Oficial Desbloqueado
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  Line-up Completo Liberado 🎉
                </h2>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#006a62]">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-xs font-bold">Meta Atingida (100%)</span>
              </div>
              <span className="text-xs text-[#666666]">Há 2 horas</span>
            </div>

            <p className="text-sm text-[#1b1c1a] leading-relaxed">
              Vocês conseguiram! O mistério acabou. Confira agora todas as atrações confirmadas para o festival deste ano e garanta seu lugar com o cupom exclusivo de comunidade.
            </p>

            {/* Exclusive Coupon Box */}
            <div className="bg-[#f5f3ef] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#e4e2de]">
              <div>
                <span className="block text-[11px] font-bold text-[#666666] uppercase tracking-wider mb-0.5">
                  Cupom Exclusivo (30% OFF)
                </span>
                <span className="text-xl font-mono font-black text-[#000666] tracking-wider">
                  INTENTFEST30
                </span>
              </div>
              <button
                onClick={handleCopyCode}
                className="bg-[#006a62] text-white px-6 py-2.5 rounded-xl font-bold text-xs hover:bg-[#005049] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98 w-full sm:w-auto"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copiado!' : 'Copiar Código'}</span>
              </button>
            </div>

            <button className="w-full border-2 border-[#000666] text-[#000666] font-bold text-xs py-3.5 rounded-xl hover:bg-[#e0e0ff]/30 transition-colors flex items-center justify-center gap-2 cursor-pointer">
              <Share2 className="w-4 h-4" />
              <span>Compartilhar Resultado</span>
            </button>
          </div>
        </article>

        {/* Community Reactions & Comments */}
        <section className="bg-white rounded-2xl shadow-sm border border-[#e4e2de] p-6 sm:p-8 space-y-6">
          <h3 className="text-base font-bold text-[#1b1c1a]">Reações da Comunidade</h3>

          <div className="flex flex-wrap items-center gap-3 pb-6 border-b border-[#e4e2de]">
            <button
              onClick={() => handleReaction('fire')}
              className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                userReacted === 'fire' ? 'bg-[#ffdbd0] text-[#3a0a00] border-[#f96b3f]' : 'bg-[#fbf9f5] border-[#e4e2de] text-[#454652]'
              }`}
            >
              <Flame className="w-4 h-4 text-orange-500" />
              <span>{reactions.fire}</span>
            </button>

            <button
              onClick={() => handleReaction('party')}
              className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                userReacted === 'party' ? 'bg-[#84f5e8] text-[#00201d] border-[#006a62]' : 'bg-[#fbf9f5] border-[#e4e2de] text-[#454652]'
              }`}
            >
              <PartyPopper className="w-4 h-4 text-[#006a62]" />
              <span>{reactions.party}</span>
            </button>

            <button
              onClick={() => handleReaction('heart')}
              className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                userReacted === 'heart' ? 'bg-rose-100 text-rose-800 border-rose-400' : 'bg-[#fbf9f5] border-[#e4e2de] text-[#454652]'
              }`}
            >
              <Heart className="w-4 h-4 text-rose-500 fill-current" />
              <span>{reactions.heart}</span>
            </button>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 text-xs">
                <img src={comment.avatar} alt={comment.author} className="w-9 h-9 rounded-full object-cover shrink-0" />
                <div className="flex-1 bg-[#f5f3ef] p-3.5 rounded-2xl rounded-tl-none">
                  <div className="flex justify-between font-bold text-[#1b1c1a] mb-1">
                    <span>{comment.author}</span>
                    <span className="text-[10px] text-[#666666] font-normal">{comment.time}</span>
                  </div>
                  <p className="text-[#454652] leading-relaxed">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Deixe seu comentário sobre a revelação..."
              className="flex-1 bg-[#fbf9f5] border border-[#c6c5d4] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[#000666]"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-[#000666] text-white rounded-xl text-xs font-bold hover:bg-[#1a237e] transition-colors cursor-pointer flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Comentar</span>
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
