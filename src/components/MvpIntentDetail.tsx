import { useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, Calendar, CheckCircle2, Globe, Heart, LoaderCircle, Lock, MessageCircle, Sparkles, ThumbsUp, Users, Vote } from 'lucide-react';
import type { UserAccount } from '../types';
import {
  approveGuardianIntent,
  createIntentComment,
  getIntent,
  IntentApiError,
  listIntentComments,
  removeIntentReaction,
  removeIntentSupport,
  setIntentReaction,
  supportIntent,
  type ApiIntent,
  type ApiIntentComment,
  type IntentCategory,
  type ReactionType,
} from '../services/intentApi';

interface MvpIntentDetailProps { intentId: string; currentUser: UserAccount; onBack: () => void }

const categoryLabels: Record<IntentCategory, string> = {
  SPORTS: 'Esportes', ENTERTAINMENT: 'Entretenimento', TECHNOLOGY: 'Tecnologia', EDUCATION: 'Educação',
  HEALTH_WELLNESS: 'Saúde e bem-estar', CAREER_BUSINESS: 'Carreira e negócios', COMMUNITY_CAUSES: 'Comunidade e causas',
  PERSONAL_LIFE: 'Vida pessoal', OTHER: 'Outros',
};

function VisibilityBadge({ visibility }: { visibility: ApiIntent['visibility'] }) {
  if (visibility === 'PRIVATE') {
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#fff3e0] text-[#e65100] text-xs font-bold"><Lock className="w-3 h-3" />Privada</span>;
  }
  if (visibility === 'FOLLOWERS') {
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#e8f5e9] text-[#2e7d32] text-xs font-bold"><Users className="w-3 h-3" />Seguidores</span>;
  }
  return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#e0e0ff] text-[#000666] text-xs font-bold"><Globe className="w-3 h-3" />Publica</span>;
}

function ConditionStatus({ intent }: { intent: ApiIntent }) {
  if (intent.conditionType === 'DATE') {
    return <div className="mt-6 bg-[#f5f3ef] rounded-2xl p-5 flex gap-3"><Calendar className="w-5 h-5 text-[#000666] shrink-0"/><div><p className="font-bold text-sm">Revela por data</p><p className="text-xs text-[#666] mt-1">{intent.revealAt ? `Revelacao programada para ${new Date(intent.revealAt).toLocaleString('pt-BR')}.` : 'Data de revelacao nao informada.'}</p></div></div>;
  }
  if (intent.conditionType === 'GUARDIANS') {
    const approvals = intent.guardianApprovals?.length ?? 0;
    const goal = intent.guardianApprovalGoal ?? 1;
    return <div className="mt-6 bg-[#f5f3ef] rounded-2xl p-5 flex gap-3"><Vote className="w-5 h-5 text-[#000666] shrink-0"/><div><p className="font-bold text-sm">Aguardando guardioes</p><p className="text-xs text-[#666] mt-1">{approvals} de {goal} aprovacao(oes). A revelacao abre quando atingir o quorum.</p></div></div>;
  }
  const progress = Math.min(100, Math.round(intent.supportCount * 100 / intent.supportGoal));
  return <div className="mt-6"><div className="flex justify-between text-sm font-bold"><span>{intent.supportCount} de {intent.supportGoal} apoios</span><span>{progress}%</span></div><div className="h-3 bg-[#E0F2F1] rounded-full overflow-hidden mt-2"><div className="h-full bg-[#006a62]" style={{ width: `${progress}%` }}/></div></div>;
}

export function MvpIntentDetail({ intentId, currentUser, onBack }: MvpIntentDetailProps) {
  const [intent, setIntent] = useState<ApiIntent | null>(null);
  const [loading, setLoading] = useState(true);
  const [supporting, setSupporting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [comments, setComments] = useState<ApiIntentComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentBody, setCommentBody] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [reactionPending, setReactionPending] = useState(false);
  const [reactionError, setReactionError] = useState('');

  async function load() {
    setLoading(true); setError('');
    try { setIntent(await getIntent(intentId)); }
    catch (caught) { setError(caught instanceof IntentApiError ? caught.message : 'Não foi possível abrir esta Intent.'); }
    finally { setLoading(false); }
  }

  async function loadComments() {
    setComments([]); setCommentsLoading(true); setCommentError('');
    try { setComments(await listIntentComments(intentId)); }
    catch (caught) { setCommentError(caught instanceof IntentApiError ? caught.message : 'Não foi possível carregar os comentários.'); }
    finally { setCommentsLoading(false); }
  }

  useEffect(() => { void load(); void loadComments(); }, [intentId]);

  async function handleComment() {
    const body = commentBody.trim();
    if (!body || commentSubmitting) return;
    setCommentSubmitting(true); setCommentError('');
    try {
      const comment = await createIntentComment(intentId, body);
      setComments((current) => [...current, comment]);
      setCommentBody('');
    } catch (caught) {
      setCommentError(caught instanceof IntentApiError ? caught.message : 'Não foi possível publicar o comentário.');
    } finally { setCommentSubmitting(false); }
  }

  async function handleSupport() {
    setSupporting(true); setError(''); setNotice('');
    try {
      const result = intent?.viewerHasSupported
        ? await removeIntentSupport(intentId)
        : await supportIntent(intentId);
      setNotice(result.realizedNow ? 'Você realizou esta Intent!' : result.supported ? 'Seu apoio foi registrado.' : 'Seu apoio foi retirado.');
      setIntent(await getIntent(intentId));
    } catch (caught) {
      setError(caught instanceof IntentApiError ? caught.message : 'Não foi possível registrar o apoio.');
    } finally { setSupporting(false); }
  }

  async function handleGuardianApproval() {
    setSupporting(true); setError(''); setNotice('');
    try {
      const result = await approveGuardianIntent(intentId);
      setNotice(result.realizedNow ? 'Sua aprovação realizou esta Intent!' : 'Sua aprovação foi registrada.');
      setIntent(await getIntent(intentId));
    } catch (caught) {
      setError(caught instanceof IntentApiError ? caught.message : 'Não foi possível registrar a aprovação.');
    } finally { setSupporting(false); }
  }

  async function handleReaction(type: ReactionType) {
    if (reactionPending || !intent) return;
    setReactionPending(true);
    setReactionError('');
    try {
      const isCurrent = intent.viewerReaction === type;
      const result = isCurrent
        ? await removeIntentReaction(intent.id)
        : await setIntentReaction(intent.id, type);
      setIntent((prev) => prev ? {
        ...prev,
        viewerReaction: result.viewerReaction,
        reactionCounts: result.reactionCounts,
      } : prev);
    } catch (caught) {
      setReactionError(caught instanceof IntentApiError ? caught.message : 'Não foi possível atualizar a reação.');
    } finally {
      setReactionPending(false);
    }
  }

  return <div className="max-w-2xl mx-auto w-full px-4 py-6 sm:py-8">
    <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-[#000666] mb-5"><ArrowLeft className="w-4 h-4"/>Voltar</button>
    {loading && <div className="bg-white border border-[#e4e2de] rounded-2xl p-10 text-center text-sm text-[#666]">Carregando Intent...</div>}
    {!loading && error && !intent && <div className="bg-[#ffdad6] text-[#8c1d18] rounded-2xl p-5 flex gap-3"><AlertCircle className="w-5 h-5"/><div><p className="font-bold">Não foi possível abrir</p><p className="text-sm mt-1">{error}</p></div></div>}
    {intent && (() => {
      const isMine = intent.creator.id === currentUser.id;
      return <article className="bg-white border border-[#e4e2de] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3"><div className="w-11 h-11 rounded-full bg-[#e0e0ff] text-[#000666] flex items-center justify-center font-black">{intent.creator.displayName.charAt(0).toUpperCase()}</div><div><p className="font-bold">{intent.creator.displayName}</p><p className="text-xs text-[#666]">@{intent.creator.username.replace(/^@+/, '')}</p></div></div>
        <div className="flex flex-wrap gap-2 mt-5">
          <span className="inline-block px-2.5 py-1 rounded-full bg-[#f0efff] text-[#000666] text-xs font-bold">{categoryLabels[intent.category] || 'Outros'}</span>
          <VisibilityBadge visibility={intent.visibility} />
        </div>
        <h1 className="text-2xl font-black mt-3">{intent.title}</h1><p className="text-sm text-[#454652] mt-3 whitespace-pre-wrap">{intent.story}</p>
        <ConditionStatus intent={intent} />

        {notice && <div className="mt-5 p-4 bg-[#e8f5e9] text-[#2e7d32] rounded-xl flex items-center gap-2 text-sm font-bold"><CheckCircle2 className="w-5 h-5"/>{notice}</div>}
        {error && <div className="mt-5 p-4 bg-[#ffdad6] text-[#8c1d18] rounded-xl flex items-center gap-2 text-sm"><AlertCircle className="w-5 h-5"/>{error}</div>}

        {intent.status === 'REALIZED' ? <div className="mt-6 bg-[#e8f5e9] border border-[#a5d6a7] rounded-2xl p-5"><p className="text-xs font-bold text-[#2e7d32] flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/>INTENT REALIZADA</p><h2 className="font-black mt-3">A revelação</h2><p className="text-sm mt-2 whitespace-pre-wrap">{intent.revealContent || 'Conteúdo revelado.'}</p></div> : <div className="mt-6 bg-[#f5f3ef] rounded-2xl p-5 flex gap-3"><Lock className="w-5 h-5 text-[#000666] shrink-0"/><div><p className="font-bold text-sm">Revelação protegida</p><p className="text-xs text-[#666] mt-1">Será aberta automaticamente quando a condição for cumprida.</p></div></div>}

        <div className="mt-6 pt-5 border-t border-[#e4e2de]">
          {isMine && <p className="text-sm text-[#666] text-center">Esta Intent é sua. Você acompanha a realização por aqui.</p>}
          {!isMine && intent.status === 'PUBLISHED' && intent.conditionType === 'SUPPORT' && <button onClick={() => void handleSupport()} disabled={supporting} aria-pressed={Boolean(intent.viewerHasSupported)} className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 ${intent.viewerHasSupported ? 'bg-[#e8f5e9] border border-[#2e7d32] text-[#28642f]' : 'bg-[#000666] text-white'}`}>{intent.viewerHasSupported ? <CheckCircle2 className="w-4 h-4"/> : <Users className="w-4 h-4"/>}{supporting ? 'Atualizando...' : intent.viewerHasSupported ? 'Apoiado — clicar para retirar' : 'Apoiar esta Intent'}</button>}
          {!isMine && intent.status === 'PUBLISHED' && intent.conditionType === 'GUARDIANS' && intent.viewerIsGuardian && <button onClick={() => void handleGuardianApproval()} disabled={supporting || intent.viewerHasApprovedAsGuardian} className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 bg-[#000666] text-white"><Vote className="w-4 h-4"/>{intent.viewerHasApprovedAsGuardian ? 'Aprovação registrada' : supporting ? 'Aprovando...' : 'Aprovar revelação'}</button>}
          {!isMine && intent.status === 'PUBLISHED' && intent.conditionType === 'DATE' && <p className="text-sm text-[#666] text-center">Esta Intent será aberta automaticamente na data definida.</p>}
          {!isMine && intent.status === 'REALIZED' && <p className="text-sm text-[#2e7d32] font-bold text-center">{intent.viewerHasSupported ? 'Seu apoio está confirmado e registrado nesta realização.' : 'Esta Intent já foi realizada.'}</p>}
        </div>

        <div className="mt-6 pt-5 border-t border-[#e4e2de]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#666]">Reações sociais</h3>
            <span className="text-xs text-[#888]">Interação social leve (não é apoio)</span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => void handleReaction('LIKE')}
              disabled={reactionPending}
              aria-pressed={intent.viewerReaction === 'LIKE'}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border disabled:opacity-60 ${
                intent.viewerReaction === 'LIKE'
                  ? 'bg-[#e0e0ff] border-[#000666] text-[#000666]'
                  : 'bg-[#fbf9f5] border-[#e4e2de] text-[#454652] hover:bg-[#f5f3ef]'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>Curtir</span>
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-black/5 text-[10px]">
                {intent.reactionCounts?.LIKE ?? 0}
              </span>
            </button>

            <button
              type="button"
              onClick={() => void handleReaction('LOVE')}
              disabled={reactionPending}
              aria-pressed={intent.viewerReaction === 'LOVE'}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border disabled:opacity-60 ${
                intent.viewerReaction === 'LOVE'
                  ? 'bg-[#ffebee] border-[#c62828] text-[#c62828]'
                  : 'bg-[#fbf9f5] border-[#e4e2de] text-[#454652] hover:bg-[#f5f3ef]'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Amar</span>
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-black/5 text-[10px]">
                {intent.reactionCounts?.LOVE ?? 0}
              </span>
            </button>

            <button
              type="button"
              onClick={() => void handleReaction('CELEBRATE')}
              disabled={reactionPending}
              aria-pressed={intent.viewerReaction === 'CELEBRATE'}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border disabled:opacity-60 ${
                intent.viewerReaction === 'CELEBRATE'
                  ? 'bg-[#fff8e1] border-[#f57f17] text-[#f57f17]'
                  : 'bg-[#fbf9f5] border-[#e4e2de] text-[#454652] hover:bg-[#f5f3ef]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Celebrar</span>
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-black/5 text-[10px]">
                {intent.reactionCounts?.CELEBRATE ?? 0}
              </span>
            </button>
          </div>
          {reactionError && (
            <div role="alert" className="mt-2 text-xs text-[#8c1d18]">
              {reactionError}
            </div>
          )}
        </div>

        <section className="mt-6 pt-6 border-t border-[#e4e2de]" aria-labelledby="comments-title">
          <h2 id="comments-title" className="font-black flex items-center gap-2"><MessageCircle className="w-5 h-5 text-[#000666]"/>Comentários</h2>

          {commentsLoading && <div className="py-8 text-center text-sm text-[#666]"><LoaderCircle className="w-5 h-5 animate-spin mx-auto mb-2"/>Carregando comentários...</div>}
          {!commentsLoading && comments.length === 0 && !commentError && <p className="py-8 text-center text-sm text-[#666]">Nenhum comentário ainda.</p>}
          {commentError && <div role="alert" className="mt-4 p-3 bg-[#ffdad6] text-[#8c1d18] rounded-xl text-sm flex gap-2"><AlertCircle className="w-4 h-4 mt-0.5 shrink-0"/>{commentError}</div>}

          {!commentsLoading && comments.length > 0 && <div className="mt-4 divide-y divide-[#e4e2de]">{comments.map((comment) => <article key={comment.id} className="py-4 flex gap-3">
            <div className="w-9 h-9 rounded-full bg-[#e0e0ff] text-[#000666] overflow-hidden flex items-center justify-center font-black shrink-0">
              {comment.author.avatarUrl ? <img src={comment.author.avatarUrl} alt="" className="w-full h-full object-cover"/> : comment.author.displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1"><div className="flex flex-wrap items-baseline gap-x-2"><p className="text-sm font-bold">{comment.author.displayName}</p><p className="text-xs text-[#666]">@{comment.author.username.replace(/^@+/, '')}</p></div><p className="mt-1 text-sm text-[#454652] whitespace-pre-wrap break-words">{comment.body}</p><time className="mt-1 block text-xs text-[#777]" dateTime={comment.createdAt}>{new Date(comment.createdAt).toLocaleString('pt-BR')}</time></div>
          </article>)}</div>}

          <form className="mt-5" onSubmit={(event) => { event.preventDefault(); void handleComment(); }}>
            <label htmlFor="intent-comment" className="text-sm font-bold">Novo comentário</label>
            <textarea id="intent-comment" value={commentBody} maxLength={500} onChange={(event) => setCommentBody(event.target.value)} rows={3} placeholder="Escreva um comentário..." className="mt-2 w-full resize-none rounded-xl border border-[#c6c5d4] bg-[#fbf9f5] px-4 py-3 text-sm outline-none focus:border-[#000666]"/>
            <div className="mt-2 flex items-center justify-between gap-4"><span className="text-xs text-[#666]">{commentBody.length}/500</span><button type="submit" disabled={commentSubmitting || commentBody.trim().length === 0} className="px-5 py-2.5 rounded-xl bg-[#000666] text-white text-sm font-bold disabled:opacity-50">{commentSubmitting ? 'Publicando...' : 'Comentar'}</button></div>
          </form>
        </section>
      </article>;
    })()}
  </div>;
}
