import React, { useState } from 'react';
import {
  History,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  Clock,
  Send,
  Lock,
  User,
  Heart,
  BarChart2,
  CheckCircle2,
  Share2,
  Network,
  Flame,
  Filter,
  X,
} from 'lucide-react';
import {
  Intent,
  SocialInteraction,
  SocialPost,
  PostCategory,
  PostVisibility,
} from '../types';

interface SocialHistoryWorkflowProps {
  intent: Intent;
  onAddInteraction?: (
    intentId: string,
    interaction: Omit<SocialInteraction, 'id' | 'created_at'>
  ) => void;
  onAddPost?: (post: Omit<SocialPost, 'id' | 'created_at'>) => void;
  variant?: 'interactive_hero' | 'card_compact';
}

const DEFAULT_SAMPLE_POSTS: SocialPost[] = [
  {
    id: 'post-1',
    author_id: 'usr-maria',
    author_name: 'Maria Oliveira',
    created_at: 'Há 15 min',
    text: 'Não acredito que essa meta de 100 apoios será atingida no prazo estipulado. O quórum atual está evoluindo devagar.',
    visibility: 'public',
    category: 'INTENT_OPINION',
    intent_id: 'intent-stage7-public-support-demo',
    intent_title: 'Etapa 7 — Participação Pública & Janela Efêmera',
    agree_count: 183,
    disagree_count: 241,
    comments_count: 42,
    comments: [
      {
        id: 'c-1',
        author_id: 'usr-carlos',
        author_name: 'Carlos Mendes',
        text: 'Discordo! Já compartilhei em 3 grupos da comunidade e mais de 20 pessoas já apoiaram.',
        created_at: 'Há 10 min',
      },
      {
        id: 'c-2',
        author_id: 'usr-flavio',
        author_name: 'Flávio Santos',
        text: 'Acabei de convidar o Fernando para apoiar também.',
        created_at: 'Há 5 min',
      },
    ],
    causality: {
      source_user_name: 'Flávio Santos',
      action_recorded: 'COMMENTED',
      recorded_at: new Date().toISOString(),
    },
  },
  {
    id: 'post-2',
    author_id: 'usr-pedro',
    author_name: 'Pedro Alcantara',
    created_at: 'Há 45 min',
    text: 'Hoje aconteceu uma situação interessante: conseguimos selar um termo de auditoria independente utilizando a trava temporal da Intent.',
    visibility: 'public',
    category: 'GENERAL',
    agree_count: 54,
    disagree_count: 3,
    comments_count: 8,
  },
  {
    id: 'post-3',
    author_id: 'usr-beatriz',
    author_name: 'Beatriz Costa',
    created_at: 'Há 2 horas',
    text: 'Acompanhando a auditoria da Intent. Minha estimativa é positiva para a conclusão!',
    visibility: 'public',
    category: 'PREDICTION',
    intent_id: 'intent-stage7-public-support-demo',
    intent_title: 'Etapa 7 — Participação Pública & Janela Efêmera',
    agree_count: 92,
    disagree_count: 14,
    comments_count: 19,
    prediction: {
      intent_id: 'intent-stage7-public-support-demo',
      target_statement: 'A meta de 100 apoios será atingida antes das 18h de amanhã.',
      predicted_outcome: 'WILL_SUCCEED',
      predicted_date: 'Amanhã às 18:00',
      resolved_status: 'PENDING',
      confidence_level: 85,
    },
    causality: {
      source_user_name: 'João Fundador',
      action_recorded: 'PREDICTED',
      recorded_at: new Date().toISOString(),
    },
  },
];

const SAMPLE_CAUSALITY_CHAIN = [
  {
    step: 1,
    actor: 'João (Criador)',
    role: 'Origem da Intent',
    action: 'Criou a Intent com meta de 100 apoios',
    directImpact: 'Origem Primária',
    badge: 'Criador',
    time: 'Hoje, 08:30',
  },
  {
    step: 2,
    actor: 'Flávio',
    role: 'Apoiador Direto',
    action: 'Apoiou a Intent (+1)',
    directImpact: '1 Apoio Direto',
    badge: 'Apoiador',
    time: 'Hoje, 09:15',
  },
  {
    step: 3,
    actor: 'Flávio ➔ Fernando',
    role: 'Convite Causal (Referral)',
    action: 'Flávio gerou link de convite e enviou para Fernando',
    directImpact: 'source = Flávio',
    badge: 'Causalidade',
    time: 'Hoje, 09:40',
  },
  {
    step: 4,
    actor: 'Fernando',
    role: 'Apoiador Referenciado',
    action: 'Fernando entrou via Flávio e apoiou (+1)',
    directImpact: 'Impacto Atribuído a Flávio',
    badge: 'Apoio Causal',
    time: 'Hoje, 10:05',
  },
  {
    step: 5,
    actor: 'Comunidade Mobilizada',
    role: 'Meta Coletiva',
    action: '100 / 100 apoios atingidos ➔ Janela de 24h aberta',
    directImpact: 'Intent Desbloqueada',
    badge: 'Maturidade',
    time: 'Hoje, 11:00',
  },
];

export const SocialHistoryWorkflow: React.FC<SocialHistoryWorkflowProps> = ({
  intent,
  onAddPost,
}) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'intent_debate' | 'predictions' | 'causality'>('feed');
  const [postFilter, setPostFilter] = useState<'ALL' | 'GENERAL' | 'INTENT_OPINION' | 'PREDICTION'>('ALL');
  const [posts, setPosts] = useState<SocialPost[]>(DEFAULT_SAMPLE_POSTS);

  // Form State
  const [newPostText, setNewPostText] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<PostCategory>('INTENT_OPINION');
  const [newPostVisibility, setNewPostVisibility] = useState<PostVisibility>('public');
  const [newPostAuthor, setNewPostAuthor] = useState('Maria Oliveira');
  const [newReferrerName, setNewReferrerName] = useState('Flávio Santos');
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);

  // Prediction State
  const [isFormalPrediction, setIsFormalPrediction] = useState(false);
  const [predictionOutcome, setPredictionOutcome] = useState<'WILL_SUCCEED' | 'WILL_FAIL'>('WILL_FAIL');
  const [predictionStatement, setPredictionStatement] = useState('Não acredito que a meta de 100 apoios será atingida no prazo.');

  // Quick vote
  const handleVote = (postId: string, voteType: 'AGREE' | 'DISAGREE') => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        if (voteType === 'AGREE') {
          return { ...p, agree_count: p.agree_count + 1 };
        } else {
          return { ...p, disagree_count: p.disagree_count + 1 };
        }
      })
    );
  };

  // Add Comment
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');

  const handleAddComment = (postId: string) => {
    if (!commentInput.trim()) return;
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const newC = {
          id: `c-${Date.now()}`,
          author_id: 'usr-current',
          author_name: newPostAuthor || 'Usuário Conectado',
          text: commentInput.trim(),
          created_at: 'Agora',
        };
        return {
          ...p,
          comments_count: p.comments_count + 1,
          comments: [...(p.comments || []), newC],
        };
      })
    );
    setCommentInput('');
    setActiveCommentPostId(null);
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const newPost: SocialPost = {
      id: `post-${Date.now()}`,
      author_id: 'usr-current',
      author_name: newPostAuthor.trim() || 'Usuário Anônimo',
      created_at: 'Agora',
      text: newPostText.trim(),
      visibility: newPostVisibility,
      category: isFormalPrediction ? 'PREDICTION' : newPostCategory,
      intent_id: newPostCategory !== 'GENERAL' ? intent.id : undefined,
      intent_title: newPostCategory !== 'GENERAL' ? intent.title : undefined,
      agree_count: 1,
      disagree_count: 0,
      comments_count: 0,
      comments: [],
      prediction: isFormalPrediction
        ? {
            intent_id: intent.id,
            intent_title: intent.title,
            target_statement: predictionStatement || newPostText.trim(),
            predicted_outcome: predictionOutcome,
            resolved_status: 'PENDING',
            confidence_level: 80,
          }
        : undefined,
      causality: newReferrerName
        ? {
            source_user_name: newReferrerName,
            action_recorded: isFormalPrediction ? 'PREDICTED' : 'COMMENTED',
            recorded_at: new Date().toISOString(),
          }
        : undefined,
    };

    setPosts([newPost, ...posts]);
    if (onAddPost) {
      onAddPost(newPost);
    }

    setNewPostText('');
    setIsFormalPrediction(false);
    setShowCreatePostModal(false);
  };

  const filteredPosts = posts.filter((p) => {
    if (postFilter === 'ALL') return true;
    return p.category === postFilter;
  });

  return (
    <div
      id="etapa-8-social-history-container"
      className="bg-white rounded-3xl p-6 md:p-8 border border-[#DCE7F6] text-slate-800 shadow-xs space-y-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF2FF] text-[#0055FF] text-xs font-bold">
              <History className="w-3.5 h-3.5" />
              <span>Etapa 8 — Histórico & Camada Social</span>
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              Desacoplado da Intent
            </span>
          </div>

          <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Histórico, Opinião, Previsão & Causalidade
          </h3>
          <p className="text-xs md:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Publicações com ou sem Intent, debates públicos (Concordo / Discordo), previsões para futura reputação e rastreamento de origem.
          </p>
        </div>

        {/* Action Button: Criar Publicação */}
        <button
          type="button"
          onClick={() => setShowCreatePostModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-[#0055FF] hover:bg-[#0047E0] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <Send className="w-4 h-4" />
          <span>Criar Publicação / Opinião</span>
        </button>
      </div>

      {/* Principle of Decoupling Banner */}
      <div className="p-4 rounded-2xl bg-[#F0F5FD] border border-[#BFD7FE] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-white border border-[#BFD7FE] text-[#0055FF] flex items-center justify-center font-bold shrink-0 mt-0.5 shadow-2xs">
            <Lock className="w-4 h-4" />
          </div>
          <div className="text-xs space-y-1">
            <h5 className="font-bold text-slate-900 flex items-center gap-2">
              <span>Princípio de Isolamento: Opinião vs. Condição</span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Regra Inviolável
              </span>
            </h5>
            <p className="text-slate-600 leading-relaxed">
              <strong>A interação social NÃO altera as travas da Intent.</strong> Se Maria opinar que a meta não será atingida (ou a comunidade votar discordo), a trava criptográfica permanece intacta.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-600 shrink-0 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[#0055FF] font-bold">HISTÓRICO</span>
          <span>≠</span>
          <span className="text-emerald-700 font-bold">INTENT</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
        {[
          { id: 'feed', label: 'Histórico & Feed Social', icon: MessageSquare, badge: posts.length },
          { id: 'intent_debate', label: 'Debate da Intent (Maria vs Carlos)', icon: ThumbsUp, badge: '183 / 241' },
          { id: 'predictions', label: 'Previsões Formais (Etapa 9 Prep)', icon: TrendingUp, badge: 'Reputação' },
          { id: 'causality', label: 'Causalidade (Flávio ➔ Fernando)', icon: Network, badge: 'Atribuição' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-[#EAF2FF] text-[#0055FF] border border-[#BFD7FE]'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white text-slate-600 border border-slate-200">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: FEED & PUBLICAÇÕES */}
      {activeTab === 'feed' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F8FAFC] p-3 rounded-2xl border border-slate-200 text-xs">
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <Filter className="w-3.5 h-3.5 text-[#0055FF]" />
              <span>Filtrar:</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'ALL', label: 'Todas' },
                { id: 'GENERAL', label: 'Sem Intent ("Hoje aconteceu...")' },
                { id: 'INTENT_OPINION', label: 'Sobre a Intent' },
                { id: 'PREDICTION', label: 'Previsões' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setPostFilter(f.id as typeof postFilter)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    postFilter === f.id
                      ? 'bg-[#0055FF] text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Posts List */}
          <div className="space-y-3">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-2xs transition-all space-y-3"
              >
                {/* Post Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#0055FF] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      {post.author_name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{post.author_name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{post.created_at}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {post.category === 'GENERAL' ? (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Histórico sem Intent
                          </span>
                        ) : post.category === 'PREDICTION' ? (
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            <span>Previsão Formal</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-[#0055FF] bg-[#EAF2FF] px-2 py-0.5 rounded border border-[#BFD7FE]">
                            Opinião sobre Intent
                          </span>
                        )}
                        {post.intent_title && (
                          <span className="text-[10px] text-slate-500 truncate max-w-xs">
                            ↳ {post.intent_title}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {post.causality && (
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl font-bold">
                      source = {post.causality.source_user_name}
                    </span>
                  )}
                </div>

                {/* Post Body Text */}
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {post.text}
                </p>

                {/* Prediction Formal Card if available */}
                {post.prediction && (
                  <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-purple-800 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Previsão Registrada no Histórico:</span>
                      </span>
                      <span className="text-[10px] font-mono bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold">
                        Pendente
                      </span>
                    </div>
                    <p className="text-xs font-mono text-purple-900 font-semibold">
                      &quot;{post.prediction.target_statement}&quot;
                    </p>
                  </div>
                )}

                {/* Debate Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleVote(post.id, 'AGREE')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Concordo {post.agree_count}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleVote(post.id, 'DISAGREE')}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <ThumbsDown className="w-3.5 h-3.5 text-rose-600" />
                      <span>Discordo {post.disagree_count}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setActiveCommentPostId(
                          activeCommentPostId === post.id ? null : post.id
                        )
                      }
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#0055FF]" />
                      <span>💬 {post.comments_count} comentários</span>
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono">
                    Visibilidade: {post.visibility}
                  </span>
                </div>

                {/* Inline Comment Thread */}
                {activeCommentPostId === post.id && (
                  <div className="pt-3 space-y-2.5 border-t border-slate-100 animate-in fade-in">
                    <div className="space-y-2">
                      {(post.comments || []).map((c) => (
                        <div
                          key={c.id}
                          className="p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-xs space-y-1"
                        >
                          <div className="flex justify-between items-center text-[10px] text-slate-500">
                            <span className="font-bold text-slate-900">{c.author_name}</span>
                            <span className="font-mono">{c.created_at}</span>
                          </div>
                          <p className="text-slate-700">{c.text}</p>
                        </div>
                      ))}
                    </div>

                    {/* Comment Input */}
                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Deixe um comentário no debate..."
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddComment(post.id);
                        }}
                        className="flex-1 px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0055FF]"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddComment(post.id)}
                        className="px-3.5 py-2 bg-[#0055FF] hover:bg-[#0047E0] text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Enviar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: DEBATE ESPECÍFICO DA INTENT */}
      {activeTab === 'intent_debate' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-[#0055FF]" />
                <span>Termômetro do Debate Social</span>
              </span>
              <span className="text-xs font-mono text-slate-500 font-bold">
                183 Concordam vs 241 Discordam
              </span>
            </div>

            {/* Split Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden flex border border-slate-300">
                <div
                  className="bg-emerald-500 h-full flex items-center justify-center text-[10px] font-black text-white"
                  style={{ width: '43%' }}
                >
                  43% (183)
                </div>
                <div
                  className="bg-rose-500 h-full flex items-center justify-center text-[10px] font-black text-white"
                  style={{ width: '57%' }}
                >
                  57% (241)
                </div>
              </div>
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-emerald-700 font-bold">👍 Concordo com a meta</span>
                <span className="text-rose-700 font-bold">👎 Discordo da viabilidade</span>
              </div>
            </div>

            {/* Example Case from user specification */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#0055FF] text-white flex items-center justify-center font-bold text-xs">
                  M
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900">Maria: </span>
                  <span className="text-xs text-slate-600 italic">
                    &quot;Não acho que essa meta será atingida.&quot;
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 pl-9">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                  [Concordo 183]
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold">
                  [Discordo 241]
                </span>
                <span className="text-[11px] text-slate-500 font-mono">💬 42 comentários</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PREVISÕES FORMAIS */}
      {activeTab === 'predictions' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-purple-50 border border-purple-200 space-y-3">
            <h4 className="text-sm font-bold text-purple-900 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span>Ciclo de Previsão Formal & Futura Reputação</span>
            </h4>
            <p className="text-xs text-purple-800 leading-relaxed">
              O usuário pode transformar sua opinião em uma previsão formal registrada no histórico. Quando a Intent terminar, o sistema confronta:
            </p>

            <div className="p-3 bg-white rounded-xl border border-purple-200 font-mono text-xs text-purple-900 text-center flex items-center justify-center gap-3 shadow-2xs font-bold">
              <span className="text-[#0055FF]">PREVISÃO</span>
              <span>➔</span>
              <span className="text-amber-700">RESULTADO REAL</span>
              <span>➔</span>
              <span className="text-emerald-700">ACERTO / ERRO</span>
            </div>

            <div className="p-3 bg-white rounded-xl text-xs space-y-1 border border-purple-200">
              <span className="text-amber-700 font-bold">⚠️ Diretriz da Etapa 8:</span>
              <p className="text-slate-600">
                Ainda não calculamos pontuações de reputação ou ranking nesta etapa. Registramos todos os dados com integridade absoluta para fundamentar a Etapa 9.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REGISTRO DE CAUSALIDADE */}
      {activeTab === 'causality' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#F0FDF4] border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Network className="w-5 h-5 text-emerald-600" />
                <h4 className="text-sm font-bold text-emerald-900 uppercase tracking-wider">
                  Cadeia de Causalidade & Proveniência
                </h4>
              </div>
              <span className="text-[11px] font-mono text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded font-bold">
                Base da Etapa 9
              </span>
            </div>

            <p className="text-xs text-emerald-900 leading-relaxed">
              Não basta saber que Fernando participou. O sistema registra que <strong>Fernando source = Flávio</strong>, comprovando quem mobilizou a participação.
            </p>

            {/* Timeline */}
            <div className="space-y-2.5 pt-2">
              {SAMPLE_CAUSALITY_CHAIN.map((item) => (
                <div
                  key={item.step}
                  className="p-3.5 rounded-xl bg-white border border-emerald-200 flex items-center justify-between gap-4 shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-mono font-bold text-xs shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{item.actor}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({item.role})</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{item.action}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-mono font-bold text-emerald-700 block">
                      {item.directImpact}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Criar Publicação */}
      {showCreatePostModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-[#0055FF]" />
                <span>Nova Publicação no Histórico</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowCreatePostModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Seu Nome de Autor:
                </label>
                <input
                  type="text"
                  value={newPostAuthor}
                  onChange={(e) => setNewPostAuthor(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tipo de Publicação:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewPostCategory('INTENT_OPINION');
                      setIsFormalPrediction(false);
                    }}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      newPostCategory === 'INTENT_OPINION' && !isFormalPrediction
                        ? 'bg-[#EAF2FF] border-[#0055FF] text-[#0055FF]'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Opinião sobre Intent
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewPostCategory('GENERAL');
                      setIsFormalPrediction(false);
                    }}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      newPostCategory === 'GENERAL'
                        ? 'bg-[#EAF2FF] border-[#0055FF] text-[#0055FF]'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Sem Intent (Livre)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mensagem / Posicionamento:
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Escreva sua opinião, acontecimento ou análise..."
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreatePostModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0055FF] text-white text-xs font-bold hover:bg-[#0047E0] transition-colors cursor-pointer"
                >
                  Publicar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
