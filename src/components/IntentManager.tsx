import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import {
  PlusCircle,
  Trash2,
  Edit3,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Filter,
  Sparkles,
  Layers,
  Calendar,
  User,
  Shield,
  X,
  AlertTriangle,
  RefreshCw,
  Cloud,
  CloudOff,
  Lock,
  Unlock,
  Hourglass,
  Timer,
  Zap,
  EyeOff,
} from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType, signInWithPopup, googleProvider } from '../utils/firebase';
import { Intent, UserAccount, ConditionType } from '../types';
import {
  calculateTimeRemaining,
  formatTargetDateTime,
  TIME_PRESETS,
} from '../utils/timeCondition';

interface IntentManagerProps {
  user: UserAccount;
}

const LOCAL_STORAGE_INTENTS_KEY = 'portal_app_local_intents';

export function IntentManager({ user }: IntentManagerProps) {
  const [intents, setIntents] = useState<Intent[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);

  // Time ticker state to update active countdowns every second
  const [, setTicker] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTicker((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Form State for Creating Intent
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newVisibility, setNewVisibility] = useState<'private' | 'public'>('private');
  const [newStatus, setNewStatus] = useState<'draft' | 'active'>('active');

  // Etapa 3: Time condition states in creation form
  const [newConditionType, setNewConditionType] = useState<ConditionType>('NONE');
  const [newTargetDate, setNewTargetDate] = useState<string>('');
  const [newRevealContent, setNewRevealContent] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter & Search State
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State for Viewing / Editing
  const [selectedIntent, setSelectedIntent] = useState<Intent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState<'draft' | 'active' | 'completed' | 'cancelled'>('draft');
  const [editVisibility, setEditVisibility] = useState<'private' | 'public'>('private');
  const [editConditionType, setEditConditionType] = useState<ConditionType>('NONE');
  const [editTargetDate, setEditTargetDate] = useState<string>('');
  const [editRevealContent, setEditRevealContent] = useState<string>('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Helper: Local fallback
  const getLocalIntents = (): Intent[] => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_INTENTS_KEY);
      if (!raw) return [];
      const parsed: Intent[] = JSON.parse(raw);
      return parsed.filter(
        (i) =>
          !i.creator_id ||
          i.creator_id === user.id ||
          i.creator_id === 'usr-1' ||
          i.creator_id === user.email
      );
    } catch {
      return [];
    }
  };

  const saveLocalIntents = (updated: Intent[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_INTENTS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  };

  // Real-time listener on Firebase Firestore or Local fallback
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const setupFirestore = (uid: string) => {
      try {
        const intentsRef = collection(db, 'intents');
        const q = query(intentsRef, where('creator_id', '==', uid));

        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const items: Intent[] = snapshot.docs.map((docSnap) => ({
              id: docSnap.id,
              ...(docSnap.data() as Omit<Intent, 'id'>),
            }));

            // Sort by created_at descending
            items.sort(
              (a, b) =>
                new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
            );

            setIntents(items);
            setIsCloudSynced(true);
            setLoading(false);
            setErrorMsg(null);
          },
          (err) => {
            console.warn('Firestore fallback to local storage:', err);
            setIsCloudSynced(false);
            const local = getLocalIntents();
            setIntents(local);
            setLoading(false);
          }
        );
      } catch (err) {
        console.error('Failed to setup Firestore query:', err);
        setIsCloudSynced(false);
        const local = getLocalIntents();
        setIntents(local);
        setLoading(false);
      }
    };

    if (auth.currentUser) {
      setupFirestore(auth.currentUser.uid);
    } else {
      const authUnsub = auth.onAuthStateChanged((fbUser) => {
        if (fbUser) {
          setupFirestore(fbUser.uid);
        } else {
          setIsCloudSynced(false);
          const local = getLocalIntents();
          setIntents(local);
          setLoading(false);
        }
      });

      return () => {
        authUnsub();
        if (unsubscribe) unsubscribe();
      };
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user.id]);

  // Connect with Google to enable Firestore sync
  const handleConnectGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Google Sign In failed:', err);
    }
  };

  // Quick preset selection helper
  const handleApplyPreset = (getDate: () => string) => {
    const iso = getDate();
    setNewTargetDate(iso);
    setNewConditionType('TIME');
  };

  const handleApplyEditPreset = (getDate: () => string) => {
    const iso = getDate();
    setEditTargetDate(iso);
    setEditConditionType('TIME');
  };

  // Create new Intent
  const handleCreateIntent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    const isFirebase = !!auth.currentUser;
    const uid = auth.currentUser ? auth.currentUser.uid : user.id;

    const newIntent: Intent = {
      id: 'intent-' + Date.now(),
      creator_id: uid,
      title: newTitle.trim(),
      description: newDescription.trim(),
      status: newStatus,
      created_at: new Date().toISOString(),
      visibility: newVisibility,
      condition_type: newConditionType,
      target_date: newConditionType === 'TIME' ? newTargetDate : undefined,
      reveal_content: newConditionType === 'TIME' ? newRevealContent.trim() : undefined,
      is_locked: newConditionType === 'TIME' && !!newTargetDate,
    };

    if (isFirebase) {
      try {
        await addDoc(collection(db, 'intents'), {
          creator_id: uid,
          title: newIntent.title,
          description: newIntent.description,
          status: newIntent.status,
          created_at: newIntent.created_at,
          visibility: newIntent.visibility,
          condition_type: newIntent.condition_type || 'NONE',
          target_date: newIntent.target_date || null,
          reveal_content: newIntent.reveal_content || null,
          is_locked: newIntent.is_locked || false,
        });
      } catch (err) {
        console.error('Error creating intent in Firestore:', err);
        setErrorMsg('Erro ao salvar no Firestore. Salvo localmente.');
        const updated = [newIntent, ...intents];
        setIntents(updated);
        saveLocalIntents(updated);
        try {
          handleFirestoreError(err, OperationType.CREATE, 'intents');
        } catch {
          // logged
        }
      }
    } else {
      const updated = [newIntent, ...intents];
      setIntents(updated);
      saveLocalIntents(updated);
    }

    // Reset form
    setNewTitle('');
    setNewDescription('');
    setNewStatus('active');
    setNewVisibility('private');
    setNewConditionType('NONE');
    setNewTargetDate('');
    setNewRevealContent('');
    setIsCreating(false);
    setIsSubmitting(false);
  };

  // Open intent details
  const handleOpenDetails = (intent: Intent) => {
    setSelectedIntent(intent);
    setEditTitle(intent.title);
    setEditDescription(intent.description || '');
    setEditStatus(intent.status);
    setEditVisibility(intent.visibility || 'private');
    setEditConditionType(intent.condition_type || 'NONE');
    setEditTargetDate(intent.target_date || '');
    setEditRevealContent(intent.reveal_content || '');
    setIsEditing(false);
  };

  // Save edits
  const handleSaveEdit = async () => {
    if (!selectedIntent || !editTitle.trim()) return;
    setIsSubmitting(true);

    const isFirebase = !!auth.currentUser && !selectedIntent.id.startsWith('intent-');

    const updatedData: Partial<Intent> = {
      title: editTitle.trim(),
      description: editDescription.trim(),
      status: editStatus,
      visibility: editVisibility,
      condition_type: editConditionType,
      target_date: editConditionType === 'TIME' ? editTargetDate : undefined,
      reveal_content: editConditionType === 'TIME' ? editRevealContent.trim() : undefined,
      is_locked: editConditionType === 'TIME' && !!editTargetDate,
    };

    if (isFirebase) {
      try {
        const intentRef = doc(db, 'intents', selectedIntent.id);
        await updateDoc(intentRef, updatedData);
      } catch (err) {
        console.error('Error updating intent in Firestore:', err);
        setErrorMsg('Erro ao atualizar no Firestore.');
        try {
          handleFirestoreError(err, OperationType.UPDATE, `intents/${selectedIntent.id}`);
        } catch {
          // logged
        }
      }
    } else {
      const updated = intents.map((i) =>
        i.id === selectedIntent.id
          ? {
              ...i,
              ...updatedData,
            }
          : i
      );
      setIntents(updated);
      saveLocalIntents(updated);
    }

    setSelectedIntent({
      ...selectedIntent,
      ...updatedData,
    });
    setIsEditing(false);
    setIsSubmitting(false);
  };

  // Instant simulation helper: Trigger immediate reveal for testing
  const handleSimulateInstantReveal = async (intent: Intent) => {
    const isFirebase = !!auth.currentUser && !intent.id.startsWith('intent-');
    const pastDate = new Date(Date.now() - 1000).toISOString();

    if (isFirebase) {
      try {
        await updateDoc(doc(db, 'intents', intent.id), {
          target_date: pastDate,
          is_locked: false,
          revealed_at: new Date().toISOString(),
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      const updated = intents.map((i) =>
        i.id === intent.id
          ? {
              ...i,
              target_date: pastDate,
              is_locked: false,
              revealed_at: new Date().toISOString(),
            }
          : i
      );
      setIntents(updated);
      saveLocalIntents(updated);
    }

    if (selectedIntent && selectedIntent.id === intent.id) {
      setSelectedIntent({
        ...selectedIntent,
        target_date: pastDate,
        is_locked: false,
        revealed_at: new Date().toISOString(),
      });
    }
  };

  // Delete Intent
  const handleDeleteIntent = async (id: string) => {
    const isFirebase = !!auth.currentUser && !id.startsWith('intent-');

    if (isFirebase) {
      try {
        await deleteDoc(doc(db, 'intents', id));
      } catch (err) {
        console.error('Error deleting intent from Firestore:', err);
        try {
          handleFirestoreError(err, OperationType.DELETE, `intents/${id}`);
        } catch {
          // logged
        }
      }
    } else {
      const updated = intents.filter((i) => i.id !== id);
      setIntents(updated);
      saveLocalIntents(updated);
    }

    if (selectedIntent?.id === id) {
      setSelectedIntent(null);
    }
    setDeleteConfirmId(null);
  };

  // Filtered intents
  const filteredIntents = intents.filter((intent) => {
    let matchesStatus = true;
    if (filterStatus === 'time_locked') {
      matchesStatus =
        intent.condition_type === 'TIME' &&
        !calculateTimeRemaining(intent.created_at, intent.target_date).isMatured;
    } else if (filterStatus === 'time_revealed') {
      matchesStatus =
        intent.condition_type === 'TIME' &&
        calculateTimeRemaining(intent.created_at, intent.target_date).isMatured;
    } else if (filterStatus !== 'all') {
      matchesStatus = intent.status === filterStatus;
    }

    const matchesSearch =
      intent.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      intent.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      intent.reveal_content?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: Intent['status']) => {
    switch (status) {
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            <span>Rascunho</span>
          </span>
        );
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#0055FF] border border-blue-200">
            <Sparkles className="w-3 h-3" />
            <span>Ativa</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Concluída</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-300">
            <XCircle className="w-3 h-3" />
            <span>Cancelada</span>
          </span>
        );
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(dateStr));
    } catch {
      return 'Data recente';
    }
  };

  // Counts
  const totalLocked = intents.filter(
    (i) => i.condition_type === 'TIME' && !calculateTimeRemaining(i.created_at, i.target_date).isMatured
  ).length;

  const totalRevealed = intents.filter(
    (i) => i.condition_type === 'TIME' && calculateTimeRemaining(i.created_at, i.target_date).isMatured
  ).length;

  return (
    <div id="intent-manager-container" className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#DCE7F6] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E2EDFF] text-[#0055FF] text-xs font-bold">
              <Timer className="w-3.5 h-3.5" />
              <span>Etapa 3 — Condição Temporal (Tempo)</span>
            </div>

            {totalLocked > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                <Lock className="w-3 h-3 text-amber-600" />
                <span>{totalLocked} em contagem regressiva</span>
              </span>
            )}

            {isCloudSynced ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Cloud className="w-3 h-3" />
                <span>Nuvem Firestore</span>
              </span>
            ) : (
              <button
                onClick={handleConnectGoogle}
                title="Conecte com o Google para persistência no Firestore"
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <CloudOff className="w-3 h-3 text-slate-500" />
                <span>Modo Local (Conectar Google)</span>
              </button>
            )}
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Rede de Intenções com Gatilho Temporal
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            As intenções não revelam conteúdo sob demanda aleatória: elas aguardam a condição
            temporal estabelecida para revelar a mensagem no momento exato.
          </p>
        </div>

        <button
          id="btn-new-intent"
          type="button"
          onClick={() => {
            setIsCreating(!isCreating);
            setErrorMsg(null);
          }}
          className="px-6 py-3.5 rounded-2xl bg-[#0055FF] hover:bg-[#0047E0] active:scale-98 text-white text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isCreating ? 'Fechar Formulário' : 'Nova Intent com Tempo'}</span>
        </button>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-rose-500 hover:text-rose-800 text-xs font-bold"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Expandable Form: Nova Intent com suporte à Etapa 3 (Tempo) */}
      {isCreating && (
        <form
          id="form-create-intent"
          onSubmit={handleCreateIntent}
          className="bg-white rounded-3xl p-6 md:p-8 border-2 border-[#BFD7FE] shadow-lg space-y-6 animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#EAF2FF] text-[#0055FF] flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Criar Nova Intenção (Intent)
                </h3>
                <p className="text-xs text-slate-400">
                  Defina os objetivos e, se desejar, adicione uma trava temporal de revelação.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Column: Basic Information */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Título da Intent *
                </label>
                <input
                  id="intent-title-input"
                  type="text"
                  required
                  placeholder="Ex: Mensagem para o Lançamento do Produto"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0055FF] focus:border-transparent transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Descrição Pública / Contexto
                </label>
                <textarea
                  id="intent-desc-input"
                  rows={3}
                  placeholder="Descreva o propósito da intenção (visível antes da revelação)..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0055FF] focus:border-transparent transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Status Inicial
                  </label>
                  <select
                    id="intent-status-select"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as 'draft' | 'active')}
                    className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0055FF]"
                  >
                    <option value="active">Ativa (Em andamento)</option>
                    <option value="draft">Rascunho</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Visibilidade
                  </label>
                  <select
                    id="intent-visibility-select"
                    value={newVisibility}
                    onChange={(e) => setNewVisibility(e.target.value as 'private' | 'public')}
                    className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0055FF]"
                  >
                    <option value="private">Privada (Apenas você)</option>
                    <option value="public">Pública (Rede Intent)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right Column: Etapa 3 - Temporal Condition Box */}
            <div className="md:col-span-5 bg-[#F0F5FD] p-5 rounded-2xl border border-[#DCE7F6] space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-[#0055FF]" />
                    <span className="text-xs font-bold text-slate-800">
                      Condição de Tempo (Etapa 3)
                    </span>
                  </div>

                  {/* Toggle button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (newConditionType === 'TIME') {
                        setNewConditionType('NONE');
                        setNewTargetDate('');
                      } else {
                        setNewConditionType('TIME');
                        setNewTargetDate(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString());
                      }
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      newConditionType === 'TIME'
                        ? 'bg-[#0055FF] text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {newConditionType === 'TIME' ? 'Trava Ativada' : 'Sem Trava'}
                  </button>
                </div>

                {newConditionType === 'TIME' ? (
                  <div className="space-y-3.5">
                    {/* Quick Presets */}
                    <div>
                      <span className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                        Atalhos de Tempo (Presets):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {TIME_PRESETS.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleApplyPreset(preset.getDate)}
                            className="px-2.5 py-1 bg-white hover:bg-[#E2EDFF] text-[#0055FF] border border-[#BFD7FE] rounded-lg text-[10px] font-semibold transition-all"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* DateTime Input */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Data e Hora da Revelação:
                      </label>
                      <input
                        type="datetime-local"
                        value={
                          newTargetDate
                            ? new Date(new Date(newTargetDate).getTime() - new Date().getTimezoneOffset() * 60000)
                                .toISOString()
                                .slice(0, 16)
                            : ''
                        }
                        onChange={(e) => {
                          if (e.target.value) {
                            setNewTargetDate(new Date(e.target.value).toISOString());
                          } else {
                            setNewTargetDate('');
                          }
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-[#0055FF]"
                      />
                    </div>

                    {/* Protected Content to Reveal */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center justify-between">
                        <span>Conteúdo Protegido (Mensagem Selada):</span>
                        <Lock className="w-3 h-3 text-amber-600" />
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Mensagem, link ou código que será revelado somente quando a data/hora for atingida..."
                        value={newRevealContent}
                        onChange={(e) => setNewRevealContent(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-[#0055FF] placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 leading-relaxed py-2">
                    Ative a trava temporal para selar um conteúdo ou meta que só será desbloqueado
                    na data e hora estipuladas.
                  </p>
                )}
              </div>

              <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#0055FF]" />
                <span>O conteúdo protegido permanece oculto até o disparo temporal.</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              id="submit-intent-btn"
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#0055FF] hover:bg-[#0047E0] disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Salvar Intent</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-2xl p-4 border border-[#DCE7F6] flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="search-intent-input"
            type="text"
            placeholder="Buscar por título ou descrição..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0055FF]"
          />
        </div>

        {/* Status and Time Filters */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1 hidden sm:block" />
          {[
            { key: 'all', label: 'Todas', count: intents.length },
            { key: 'time_locked', label: '⏳ Trava de Tempo', count: totalLocked },
            { key: 'time_revealed', label: '✨ Reveladas', count: totalRevealed },
            { key: 'active', label: 'Ativas', count: intents.filter((i) => i.status === 'active').length },
            { key: 'draft', label: 'Rascunhos', count: intents.filter((i) => i.status === 'draft').length },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilterStatus(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                filterStatus === tab.key
                  ? 'bg-[#0055FF] text-white shadow-xs'
                  : 'bg-[#F0F5FD] text-slate-600 hover:bg-[#E2EDFF]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  filterStatus === tab.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Intents List */}
      {loading ? (
        <div className="bg-white rounded-3xl p-8 border border-[#DCE7F6] text-center space-y-4">
          <div className="w-8 h-8 border-3 border-[#0055FF] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500">Sincronizando intenções e condições temporais...</p>
        </div>
      ) : filteredIntents.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-[#DCE7F6] text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EAF2FF] text-[#0055FF] flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              {searchQuery || filterStatus !== 'all'
                ? 'Nenhuma Intent encontrada com estes filtros.'
                : 'Você ainda não possui nenhuma Intent criada.'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Experimente criar sua primeira Intent com condição temporal para testar o gatilho
              de tempo e a revelação automática.
            </p>
          </div>
          {!isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="px-5 py-2.5 rounded-xl bg-[#0055FF] text-white text-xs font-bold hover:bg-[#0047E0] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Criar Intent com Tempo</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredIntents.map((intent) => {
            const timeInfo = calculateTimeRemaining(intent.created_at, intent.target_date);
            const hasTimeLock = intent.condition_type === 'TIME' && !!intent.target_date;

            return (
              <div
                key={intent.id}
                id={`intent-card-${intent.id}`}
                className="bg-white rounded-2xl p-5 border border-[#DCE7F6] hover:border-[#94BFFF] hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5">
                      {getStatusBadge(intent.status)}
                      {hasTimeLock && (
                        timeInfo.isMatured ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <Unlock className="w-3 h-3 text-emerald-600" />
                            <span>Revelado!</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <Lock className="w-3 h-3 text-amber-600" />
                            <span>Selado</span>
                          </span>
                        )
                      )}
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(intent.created_at)}</span>
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-[#0055FF] transition-colors">
                    {intent.title}
                  </h4>

                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {intent.description || 'Sem descrição informada.'}
                  </p>

                  {/* Etapa 3 Time Condition Widget inside Card */}
                  {hasTimeLock && (
                    <div className="mt-3.5 p-3 rounded-xl bg-[#F0F5FD] border border-[#DCE7F6] space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <Timer className="w-3.5 h-3.5 text-[#0055FF]" />
                          <span>Gatilho Temporal:</span>
                        </span>
                        <span
                          className={`font-mono font-bold ${
                            timeInfo.isMatured ? 'text-emerald-600' : 'text-amber-700'
                          }`}
                        >
                          {timeInfo.formattedCountdown}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            timeInfo.isMatured ? 'bg-emerald-500' : 'bg-[#0055FF]'
                          }`}
                          style={{ width: `${timeInfo.progressPercent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>Alvo: {formatTargetDateTime(intent.target_date)}</span>
                        <span>{timeInfo.progressPercent}% decorrido</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-slate-400" />
                    <span>{intent.visibility === 'public' ? 'Pública' : 'Privada'}</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      title="Visualizar Detalhes e Condição de Tempo"
                      onClick={() => handleOpenDetails(intent)}
                      className="px-3 py-1.5 rounded-lg bg-[#F0F5FD] hover:bg-[#E2EDFF] text-[#0055FF] text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Abrir</span>
                    </button>

                    <button
                      type="button"
                      title="Excluir Intent"
                      onClick={() => setDeleteConfirmId(intent.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: View & Edit Intent Details (with full Etapa 3 Time Revelation support) */}
      {selectedIntent && (() => {
        const timeInfo = calculateTimeRemaining(selectedIntent.created_at, selectedIntent.target_date);
        const hasTimeLock = selectedIntent.condition_type === 'TIME' && !!selectedIntent.target_date;

        return (
          <div
            id="intent-details-modal"
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#EAF2FF] text-[#0055FF] flex items-center justify-center font-bold">
                    {hasTimeLock ? (
                      timeInfo.isMatured ? <Unlock className="w-5 h-5 text-emerald-600" /> : <Hourglass className="w-5 h-5 text-[#0055FF]" />
                    ) : (
                      <Layers className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {isEditing ? 'Editar Intent' : 'Detalhes da Intent'}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">ID: {selectedIntent.id}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedIntent(null);
                    setIsEditing(false);
                  }}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="py-5 space-y-4">
                {isEditing ? (
                  /* Edit Mode */
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Título</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0055FF]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição</label>
                      <textarea
                        rows={3}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0055FF]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                        <select
                          value={editStatus}
                          onChange={(e) =>
                            setEditStatus(e.target.value as 'draft' | 'active' | 'completed' | 'cancelled')
                          }
                          className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-[#0055FF]"
                        >
                          <option value="draft">Rascunho</option>
                          <option value="active">Ativa</option>
                          <option value="completed">Concluída</option>
                          <option value="cancelled">Cancelada</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Visibilidade</label>
                        <select
                          value={editVisibility}
                          onChange={(e) => setEditVisibility(e.target.value as 'private' | 'public')}
                          className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-[#0055FF]"
                        >
                          <option value="private">Privada</option>
                          <option value="public">Pública</option>
                        </select>
                      </div>
                    </div>

                    {/* Edit Time Condition */}
                    <div className="p-4 bg-[#F0F5FD] rounded-2xl border border-[#DCE7F6] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Timer className="w-4 h-4 text-[#0055FF]" />
                          <span>Condição Temporal:</span>
                        </span>

                        <select
                          value={editConditionType}
                          onChange={(e) => setEditConditionType(e.target.value as ConditionType)}
                          className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                        >
                          <option value="NONE">Sem Trava Temporal</option>
                          <option value="TIME">Com Trava Temporal (TIME)</option>
                        </select>
                      </div>

                      {editConditionType === 'TIME' && (
                        <div className="space-y-3 pt-2">
                          <div className="flex flex-wrap gap-1.5">
                            {TIME_PRESETS.map((preset, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleApplyEditPreset(preset.getDate)}
                                className="px-2 py-0.5 bg-white text-[#0055FF] border border-[#BFD7FE] rounded text-[10px] font-semibold"
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Data e Hora Alvo:
                            </label>
                            <input
                              type="datetime-local"
                              value={
                                editTargetDate
                                  ? new Date(new Date(editTargetDate).getTime() - new Date().getTimezoneOffset() * 60000)
                                      .toISOString()
                                      .slice(0, 16)
                                  : ''
                              }
                              onChange={(e) => {
                                if (e.target.value) {
                                  setEditTargetDate(new Date(e.target.value).toISOString());
                                }
                              }}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Conteúdo Selado para Revelação:
                            </label>
                            <textarea
                              rows={2}
                              value={editRevealContent}
                              onChange={(e) => setEditRevealContent(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div className="space-y-5">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        {getStatusBadge(selectedIntent.status)}
                        <span className="text-xs text-slate-400">
                          {selectedIntent.visibility === 'public' ? 'Visibilidade Pública' : 'Visibilidade Privada'}
                        </span>
                      </div>
                      <h4 className="text-xl font-extrabold text-slate-900 mt-2">{selectedIntent.title}</h4>
                      <p className="text-sm text-slate-600 mt-2 bg-[#F8FAFC] p-4 rounded-2xl border border-slate-100 whitespace-pre-wrap leading-relaxed">
                        {selectedIntent.description || 'Nenhuma descrição fornecida.'}
                      </p>
                    </div>

                    {/* Temporal Condition Revelation Panel (Etapa 3 Core) */}
                    {hasTimeLock ? (
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#F0F5FD] to-[#E5EFFF] border-2 border-[#BFD7FE] space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Timer className="w-5 h-5 text-[#0055FF]" />
                            <div>
                              <h5 className="text-sm font-bold text-slate-900">
                                Condição Temporal de Revelação
                              </h5>
                              <span className="text-[11px] text-slate-500">
                                Disparo programado: {formatTargetDateTime(selectedIntent.target_date)}
                              </span>
                            </div>
                          </div>

                          {timeInfo.isMatured ? (
                            <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-xs font-bold shadow-xs flex items-center gap-1">
                              <Unlock className="w-3.5 h-3.5" />
                              <span>Revelado!</span>
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-bold shadow-xs flex items-center gap-1 animate-pulse">
                              <Lock className="w-3.5 h-3.5" />
                              <span>Bloqueado</span>
                            </span>
                          )}
                        </div>

                        {/* Live Countdown Clock */}
                        <div className="bg-white p-4 rounded-xl border border-[#DCE7F6] flex flex-col items-center justify-center text-center">
                          <span className="text-xs font-semibold text-slate-400 mb-1">
                            Tempo Restante para Desbloqueio:
                          </span>
                          <span
                            className={`text-xl md:text-2xl font-black font-mono tracking-tight ${
                              timeInfo.isMatured ? 'text-emerald-600' : 'text-[#0055FF]'
                            }`}
                          >
                            {timeInfo.formattedCountdown}
                          </span>

                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
                            <div
                              className={`h-full transition-all duration-500 ${
                                timeInfo.isMatured ? 'bg-emerald-500' : 'bg-[#0055FF]'
                              }`}
                              style={{ width: `${timeInfo.progressPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Revealed Content vs Locked Sealed Content */}
                        {timeInfo.isMatured ? (
                          <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl space-y-2 animate-in fade-in zoom-in-95 duration-300">
                            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                              <Sparkles className="w-4 h-4 text-emerald-600" />
                              <span>CONTEÚDO REVELADO COM SUCESSO:</span>
                            </div>
                            <p className="text-sm font-semibold text-slate-800 bg-white p-3.5 rounded-xl border border-emerald-200 whitespace-pre-wrap">
                              {selectedIntent.reveal_content || 'Esta intenção atingiu seu momento de revelação.'}
                            </p>
                          </div>
                        ) : (
                          <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3 relative overflow-hidden">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                                <EyeOff className="w-4 h-4" />
                                <span>CONTEÚDO SELADO TEMPORALMENTE</span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">
                                Proteção Ativa
                              </span>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed">
                              O conteúdo configurado pelo criador está protegido e será liberado
                              automaticamente quando a data/hora definida for atingida.
                            </p>

                            {/* Instant Simulation Button for rapid testing */}
                            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                              <span className="text-[11px] text-slate-400">Deseja testar agora?</span>
                              <button
                                type="button"
                                onClick={() => handleSimulateInstantReveal(selectedIntent)}
                                className="px-3 py-1.5 bg-[#0055FF] hover:bg-[#0047E0] text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                              >
                                <Zap className="w-3.5 h-3.5 text-amber-300" />
                                <span>Simular Revelação Imediata</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-3.5 bg-[#F8FAFC] rounded-2xl border border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                        <span>Sem condição temporal configurada para esta Intent.</span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(true);
                            setEditConditionType('TIME');
                            setEditTargetDate(new Date(Date.now() + 2 * 60 * 1000).toISOString());
                          }}
                          className="text-[#0055FF] font-bold hover:underline"
                        >
                          Adicionar Trava de Tempo
                        </button>
                      </div>
                    )}

                    {/* Metadata Info */}
                    <div className="bg-[#F0F5FD] rounded-2xl p-4 border border-[#DCE7F6] space-y-2.5 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-medium text-slate-500">
                          <User className="w-3.5 h-3.5 text-[#0055FF]" />
                          <span>Criador:</span>
                        </span>
                        <span className="font-semibold text-slate-800">{user.name}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-medium text-slate-500">
                          <Calendar className="w-3.5 h-3.5 text-[#0055FF]" />
                          <span>Criada em:</span>
                        </span>
                        <span className="font-mono text-slate-800">{formatDate(selectedIntent.created_at)}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-medium text-slate-500">
                          <Shield className="w-3.5 h-3.5 text-[#0055FF]" />
                          <span>Controle de Acesso:</span>
                        </span>
                        <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          Autorizado (Proprietário)
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      disabled={isSubmitting}
                      className="px-5 py-2 rounded-xl bg-[#0055FF] text-white text-xs font-bold hover:bg-[#0047E0] transition-colors cursor-pointer"
                    >
                      {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(selectedIntent.id)}
                      className="px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedIntent(null)}
                        className="px-5 py-2 rounded-xl bg-[#0055FF] text-white text-xs font-bold hover:bg-[#0047E0] transition-colors cursor-pointer"
                      >
                        Fechar
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">Excluir esta Intent?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Esta ação removerá permanentemente a intenção e suas condições temporais.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDeleteIntent(deleteConfirmId)}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
