import React, { useState } from 'react';
import {
  History,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  Clock,
  Send,
  Shield,
  Sparkles,
  CheckCircle2,
  Lock,
  Unlock,
  User,
  Heart,
  BarChart2,
  FileCode,
  Zap,
} from 'lucide-react';
import { Intent, SocialInteraction, HistoryLogEntry, SocialOpinionType } from '../types';

interface SocialHistoryWorkflowProps {
  intent: Intent;
  onAddInteraction?: (
    intentId: string,
    interaction: Omit<SocialInteraction, 'id' | 'created_at'>
  ) => void;
  variant?: 'interactive_hero' | 'card_compact';
}

export const SocialHistoryWorkflow: React.FC<SocialHistoryWorkflowProps> = ({
  intent,
  onAddInteraction,
  variant = 'interactive_hero',
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'opinions' | 'predictions'>('history');
  const [newOpinionType, setNewOpinionType] = useState<SocialOpinionType>('AGREE');
  const [commentText, setCommentText] = useState('');
  const [predictionVal, setPredictionVal] = useState('');
  const [userName, setUserName] = useState('Anônimo Conectado');
  const [showForm, setShowForm] = useState(false);

  // Fallback default sample data if intent doesn't have logs/interactions yet
  const historyLogs: HistoryLogEntry[] = intent.history_logs && intent.history_logs.length > 0
    ? intent.history_logs
    : [
        {
          id: 'log-1',
          timestamp: 'Hoje, 09:15',
          action_type: 'CREATED',
          actor_name: 'Criador da Intent',
          description: 'Intenção registrada e selada na rede.',
          badge: 'Etapa 2 — Intent',
        },
        {
          id: 'log-2',
          timestamp: 'Hoje, 09:18',
          action_type: 'ENCRYPTED',
          actor_name: 'Cofre AES-256',
          description: 'Payload criptografado com chave e IV derivado.',
          badge: 'Etapa 6 — Criptografia',
        },
        {
          id: 'log-3',
          timestamp: 'Hoje, 10:30',
          action_type: 'GUARDIAN_APPROVED',
          actor_name: 'Dra. Helena Voss',
          description: 'Aprovação de guardião registrada com sucesso.',
          badge: 'Etapa 5 — Quórum',
        },
        {
          id: 'log-4',
          timestamp: 'Hoje, 11:05',
          action_type: 'SUPPORTED',
          actor_name: 'Comunidade',
          description: 'Mobilização pública com 10 novos apoios.',
          badge: 'Etapa 7 — Apoio',
        },
      ];

  const socialInteractions: SocialInteraction[] = intent.social_interactions && intent.social_interactions.length > 0
    ? intent.social_interactions
    : [
        {
          id: 'soc-1',
          user_name: 'Marcio Silva',
          type: 'AGREE',
          text: 'Totalmente alinhado com os termos da transparência pública.',
          created_at: 'Há 20 min',
        },
        {
          id: 'soc-2',
          user_name: 'Beatriz Costa',
          type: 'PREDICTION',
          prediction_val: 'Quórum atinge 100% de aprovação até amanhã!',
          text: 'Acompanhando a auditoria.',
          created_at: 'Há 1 hora',
        },
        {
          id: 'soc-3',
          user_name: 'Gabriel Rocha',
          type: 'DISAGREE',
          text: 'Acho que o prazo temporal deveria ser estendido para mais análises.',
          created_at: 'Há 2 horas',
        },
      ];

  const agreeCount = intent.agree_count ?? socialInteractions.filter((s) => s.type === 'AGREE').length;
  const disagreeCount = intent.disagree_count ?? socialInteractions.filter((s) => s.type === 'DISAGREE').length;
  const predictionsCount = intent.predictions_count ?? socialInteractions.filter((s) => s.type === 'PREDICTION').length;
  const totalVotes = agreeCount + disagreeCount;
  const agreePercentage = totalVotes > 0 ? Math.round((agreeCount / totalVotes) * 100) : 50;

  const handleSubmitSocial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() && newOpinionType !== 'AGREE' && newOpinionType !== 'DISAGREE') return;

    if (onAddInteraction) {
      onAddInteraction(intent.id, {
        user_name: userName.trim() || 'Usuário do Sistema',
        type: newOpinionType,
        text: commentText,
        prediction_val: newOpinionType === 'PREDICTION' ? predictionVal : undefined,
      });
    }

    setCommentText('');
    setPredictionVal('');
    setShowForm(false);
  };

  const getActionIcon = (type: HistoryLogEntry['action_type']) => {
    switch (type) {
      case 'CREATED':
        return <FileCode className="w-3.5 h-3.5 text-blue-400" />;
      case 'ENCRYPTED':
        return <Lock className="w-3.5 h-3.5 text-indigo-400" />;
      case 'GUARDIAN_APPROVED':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'GUARDIAN_DECLINED':
        return <Shield className="w-3.5 h-3.5 text-rose-400" />;
      case 'SUPPORTED':
        return <Heart className="w-3.5 h-3.5 text-pink-400" />;
      case 'REVEALED':
        return <Unlock className="w-3.5 h-3.5 text-amber-400" />;
      case 'SOCIAL_OPINION':
        return <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />;
      default:
        return <Zap className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div
      id="etapa-8-social-history-container"
      className="bg-slate-950 rounded-3xl p-6 md:p-8 border border-slate-800 text-slate-100 shadow-xl space-y-6 relative overflow-hidden"
    >
      {/* Background Accent Gradient */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-black uppercase tracking-wider">
              <History className="w-3.5 h-3.5 text-cyan-400" />
              <span>Etapa 8 — Histórico & Camada Social</span>
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
              Interação Auditável
            </span>
          </div>

          <h3 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Histórico da Intent & Opinião Pública</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Acompanhe a linha do tempo completa dos eventos da Intent e participe com opiniões (Concordo/Discordo), comentários e previsões.
          </p>
        </div>

        {/* Quick Social Sentiment Metric */}
        <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800/80 space-y-1.5 min-w-[200px]">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-bold flex items-center gap-1">
              <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
              Consenso Social:
            </span>
            <span className="font-mono font-bold text-emerald-400">{agreePercentage}% Concordam</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
            <div className="bg-emerald-500 h-full transition-all" style={{ width: `${agreePercentage}%` }} />
            <div className="bg-rose-500 h-full transition-all" style={{ width: `${100 - agreePercentage}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-0.5">
            <span className="text-emerald-400 font-bold">👍 {agreeCount} Concordo</span>
            <span className="text-rose-400 font-bold">👎 {disagreeCount} Discordo</span>
          </div>
        </div>
      </div>

      {/* Action Bar: Quick Interactions & New Opinion Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          {/* Concordo Button */}
          <button
            type="button"
            onClick={() => {
              setNewOpinionType('AGREE');
              setShowForm(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800/60 text-emerald-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Concordo ({agreeCount})</span>
          </button>

          {/* Discordo Button */}
          <button
            type="button"
            onClick={() => {
              setNewOpinionType('DISAGREE');
              setShowForm(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/60 text-rose-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <ThumbsDown className="w-3.5 h-3.5 text-rose-400" />
            <span>Discordo ({disagreeCount})</span>
          </button>

          {/* Comentar Button */}
          <button
            type="button"
            onClick={() => {
              setNewOpinionType('COMMENT');
              setShowForm(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-800/60 text-cyan-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            <span>Comentar</span>
          </button>

          {/* Previsão Button */}
          <button
            type="button"
            onClick={() => {
              setNewOpinionType('PREDICTION');
              setShowForm(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-800/60 text-indigo-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
            <span>Fazer Previsão ({predictionsCount})</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer px-2 py-1"
        >
          {showForm ? 'Cancelar' : '+ Registra Opinião'}
        </button>
      </div>

      {/* Expandable Social Opinion Form */}
      {showForm && (
        <form
          onSubmit={handleSubmitSocial}
          className="p-4 rounded-2xl bg-slate-900 border-2 border-cyan-500/40 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-black text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Registrar Opinião & Histórico na Intent</span>
            </span>
            <span className="text-[11px] text-slate-500">Etapa 8 — Social</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Seu Nome / Apelido</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Ex: Ana Silva"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Tipo de Interação</label>
              <select
                value={newOpinionType}
                onChange={(e) => setNewOpinionType(e.target.value as SocialOpinionType)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="AGREE">👍 Concordo com a Intent</option>
                <option value="DISAGREE">👎 Discordo / Ressalva</option>
                <option value="COMMENT">💬 Comentário / Opinião</option>
                <option value="PREDICTION">🔮 Previsão / Palpite de Resultado</option>
              </select>
            </div>
          </div>

          {newOpinionType === 'PREDICTION' && (
            <div>
              <label className="block text-[11px] font-bold text-indigo-300 mb-1">
                Sua Previsão / Palpite (ex: "Revela em 15 dias", "Atinge quórum em 24h")
              </label>
              <input
                type="text"
                value={predictionVal}
                onChange={(e) => setPredictionVal(e.target.value)}
                placeholder="Ex: Quórum de guardiões será atingido antes do prazo temporal"
                className="w-full px-3 py-2 rounded-xl bg-indigo-950/40 border border-indigo-700/60 text-indigo-200 text-xs focus:outline-none focus:border-indigo-400"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">
              {newOpinionType === 'PREDICTION' ? 'Justificativa da Previsão' : 'Mensagem / Comentário'}
            </label>
            <textarea
              rows={2}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Escreva sua opinião, análise ou comentário..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publicar na Intent</span>
            </button>
          </div>
        </form>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'history'
              ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <History className="w-3.5 h-3.5 text-cyan-400" />
          <span>Histórico Auditável ({historyLogs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('opinions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'opinions'
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
          <span>Opiniões & Comentários ({socialInteractions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('predictions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'predictions'
              ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/80'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
          <span>Previsões ({predictionsCount})</span>
        </button>
      </div>

      {/* TAB 1: Audit History Timeline */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Trilha Imutável de Eventos Registrados na Intent</span>
            <span className="font-mono text-[10px] text-slate-500">Hash & Audit Ready</span>
          </div>

          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {historyLogs.map((log) => (
              <div key={log.id} className="relative group">
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                  {getActionIcon(log.action_type)}
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{log.actor_name}</span>
                      {log.badge && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700 font-mono">
                          {log.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300">{log.description}</p>
                  </div>

                  <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3 text-slate-600" />
                    {log.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Social Opinions & Comments */}
      {activeTab === 'opinions' && (
        <div className="space-y-3">
          {socialInteractions.map((soc) => (
            <div
              key={soc.id}
              className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300 uppercase">
                    {soc.user_name.charAt(0)}
                  </div>
                  <span className="text-xs font-bold text-white">{soc.user_name}</span>
                </div>

                <div className="flex items-center gap-2">
                  {soc.type === 'AGREE' && (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3 text-emerald-400" />
                      <span>Concordo</span>
                    </span>
                  )}
                  {soc.type === 'DISAGREE' && (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-800/60 flex items-center gap-1">
                      <ThumbsDown className="w-3 h-3 text-rose-400" />
                      <span>Discordo</span>
                    </span>
                  )}
                  {soc.type === 'COMMENT' && (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-cyan-400" />
                      <span>Comentário</span>
                    </span>
                  )}
                  {soc.type === 'PREDICTION' && (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-indigo-400" />
                      <span>Previsão</span>
                    </span>
                  )}
                  <span className="text-[10px] text-slate-500 font-mono">{soc.created_at}</span>
                </div>
              </div>

              {soc.prediction_val && (
                <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/50 text-indigo-200 text-xs font-mono">
                  🔮 <strong>Previsão:</strong> {soc.prediction_val}
                </div>
              )}

              {soc.text && <p className="text-xs text-slate-300 leading-relaxed pl-1">{soc.text}</p>}
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Predictions List */}
      {activeTab === 'predictions' && (
        <div className="space-y-3">
          <div className="p-3 bg-indigo-950/40 border border-indigo-800/50 rounded-2xl text-xs text-indigo-200 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              Previsões da comunidade sobre cumprimento de quórum, desfecho e estimativas de data da revelação da Intent.
            </span>
          </div>

          {socialInteractions.filter((s) => s.type === 'PREDICTION' || s.prediction_val).length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              Nenhuma previsão registrada ainda. Seja o primeiro a registrar um palpite!
            </div>
          ) : (
            socialInteractions
              .filter((s) => s.type === 'PREDICTION' || s.prediction_val)
              .map((soc) => (
                <div
                  key={soc.id}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-900/50 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-indigo-400" />
                      {soc.user_name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{soc.created_at}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-800/60 text-indigo-200 text-xs font-mono font-bold">
                    🔮 {soc.prediction_val || soc.text}
                  </div>

                  {soc.prediction_val && soc.text && (
                    <p className="text-xs text-slate-300 leading-relaxed">{soc.text}</p>
                  )}
                </div>
              ))
          )}
        </div>
      )}
    </div>
  );
};
