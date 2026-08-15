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
  Archive,
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
} from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType, signInAnonymously } from '../utils/firebase';
import { Intent, UserAccount } from '../types';

interface IntentManagerProps {
  user: UserAccount;
}

export function IntentManager({ user }: IntentManagerProps) {
  const [intents, setIntents] = useState<Intent[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State for Creating Intent
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newVisibility, setNewVisibility] = useState<'private' | 'public'>('private');
  const [newStatus, setNewStatus] = useState<'draft' | 'active'>('draft');
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
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Real-time listener on Firebase Firestore
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const setupListener = (uid: string) => {
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
            items.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

            setIntents(items);
            setLoading(false);
            setErrorMsg(null);
          },
          (err) => {
            console.error('Firestore listener error:', err);
            setErrorMsg('Erro ao carregar intents do banco de dados.');
            setLoading(false);
            try {
              handleFirestoreError(err, OperationType.LIST, 'intents');
            } catch {
              // error logged
            }
          }
        );
      } catch (err) {
        console.error('Failed to setup Firestore query:', err);
        setLoading(false);
      }
    };

    // Check if auth is already ready
    if (auth.currentUser) {
      setupListener(auth.currentUser.uid);
    } else {
      // Listen to auth state or sign in anonymously as fallback
      const authUnsub = auth.onAuthStateChanged(async (fbUser) => {
        if (fbUser) {
          setupListener(fbUser.uid);
        } else {
          try {
            const cred = await signInAnonymously(auth);
            setupListener(cred.user.uid);
          } catch (err) {
            console.error('Anonymous auth failed:', err);
            // If offline or rule blocked, stop loading so screen is never blank
            setLoading(false);
          }
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

  // Create new Intent
  const handleCreateIntent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    const uid = auth.currentUser?.uid || user.id;

    try {
      const intentData = {
        creator_id: uid,
        title: newTitle.trim(),
        description: newDescription.trim(),
        status: newStatus,
        created_at: new Date().toISOString(),
        visibility: newVisibility,
      };

      await addDoc(collection(db, 'intents'), intentData);

      // Reset form
      setNewTitle('');
      setNewDescription('');
      setNewStatus('draft');
      setNewVisibility('private');
      setIsCreating(false);
    } catch (err) {
      console.error('Error creating intent:', err);
      setErrorMsg('Não foi possível criar a Intent. Tente novamente.');
      try {
        handleFirestoreError(err, OperationType.CREATE, 'intents');
      } catch {
        // error logged
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open intent details
  const handleOpenDetails = (intent: Intent) => {
    setSelectedIntent(intent);
    setEditTitle(intent.title);
    setEditDescription(intent.description || '');
    setEditStatus(intent.status);
    setEditVisibility(intent.visibility || 'private');
    setIsEditing(false);
  };

  // Save edits
  const handleSaveEdit = async () => {
    if (!selectedIntent || !editTitle.trim()) return;
    setIsSubmitting(true);
    try {
      const intentRef = doc(db, 'intents', selectedIntent.id);
      await updateDoc(intentRef, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        status: editStatus,
        visibility: editVisibility,
      });

      setSelectedIntent({
        ...selectedIntent,
        title: editTitle.trim(),
        description: editDescription.trim(),
        status: editStatus,
        visibility: editVisibility,
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating intent:', err);
      setErrorMsg('Erro ao atualizar a Intent.');
      try {
        handleFirestoreError(err, OperationType.UPDATE, `intents/${selectedIntent.id}`);
      } catch {
        // logged
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Intent
  const handleDeleteIntent = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'intents', id));
      if (selectedIntent?.id === id) {
        setSelectedIntent(null);
      }
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Error deleting intent:', err);
      setErrorMsg('Erro ao excluir a Intent.');
      try {
        handleFirestoreError(err, OperationType.DELETE, `intents/${id}`);
      } catch {
        // logged
      }
    }
  };

  // Filtered intents
  const filteredIntents = intents.filter((intent) => {
    const matchesStatus = filterStatus === 'all' || intent.status === filterStatus;
    const matchesSearch =
      intent.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      intent.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: Intent['status']) => {
    switch (status) {
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            <span>Rascunho</span>
          </span>
        );
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#0055FF] border border-blue-200">
            <Sparkles className="w-3 h-3" />
            <span>Ativa</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Concluída</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-300">
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
      return 'Data não disponível';
    }
  };

  return (
    <div id="intent-manager-container" className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-6 border border-[#DCE7F6] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E2EDFF] text-[#0055FF] text-xs font-semibold mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Etapa 2 — Intent CRUD</span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Minhas Intenções (Intents)
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Crie, organize e gerencie os objetivos e mensagens da sua rede de intenções.
          </p>
        </div>

        <button
          id="btn-new-intent"
          type="button"
          onClick={() => {
            setIsCreating(!isCreating);
            setErrorMsg(null);
          }}
          className="px-5 py-3 rounded-2xl bg-[#0055FF] hover:bg-[#0047E0] active:scale-98 text-white text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isCreating ? 'Fechar Formulário' : 'Nova Intent'}</span>
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

      {/* Expandable Form: Nova Intent */}
      {isCreating && (
        <form
          id="form-create-intent"
          onSubmit={handleCreateIntent}
          className="bg-white rounded-3xl p-6 md:p-8 border-2 border-[#BFD7FE] shadow-md space-y-4 animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0055FF]" />
              <span>Definir Nova Intenção</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Título da Intent *
            </label>
            <input
              id="intent-title-input"
              type="text"
              required
              placeholder="Ex: Lançamento do MVP em Dezembro"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0055FF] focus:border-transparent transition-all placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Descrição / O que você pretende realizar?
            </label>
            <textarea
              id="intent-desc-input"
              rows={3}
              placeholder="Descreva o propósito, o contexto ou o conteúdo que fará parte desta intenção..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0055FF] focus:border-transparent transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Status Inicial
              </label>
              <select
                id="intent-status-select"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as 'draft' | 'active')}
                className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0055FF]"
              >
                <option value="draft">Rascunho (ainda elaborando)</option>
                <option value="active">Ativa (pronta para progresso)</option>
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
                className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0055FF]"
              >
                <option value="private">Privada (Apenas você)</option>
                <option value="public">Pública (Rede Intent)</option>
              </select>
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

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1 hidden sm:block" />
          {[
            { key: 'all', label: 'Todas', count: intents.length },
            { key: 'draft', label: 'Rascunhos', count: intents.filter((i) => i.status === 'draft').length },
            { key: 'active', label: 'Ativas', count: intents.filter((i) => i.status === 'active').length },
            { key: 'completed', label: 'Concluídas', count: intents.filter((i) => i.status === 'completed').length },
            { key: 'cancelled', label: 'Canceladas', count: intents.filter((i) => i.status === 'cancelled').length },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilterStatus(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
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
          <p className="text-xs text-slate-500">Sincronizando com o Firebase Firestore...</p>
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
              O modelo de Intent permite registrar suas intenções, metas e conteúdos que serão
              revelados futuramente.
            </p>
          </div>
          {!isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="px-5 py-2.5 rounded-xl bg-[#0055FF] text-white text-xs font-bold hover:bg-[#0047E0] transition-colors inline-flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Criar minha primeira Intent</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredIntents.map((intent) => (
            <div
              key={intent.id}
              id={`intent-card-${intent.id}`}
              className="bg-white rounded-2xl p-5 border border-[#DCE7F6] hover:border-[#94BFFF] hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  {getStatusBadge(intent.status)}
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
                    title="Visualizar Detalhes"
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
          ))}
        </div>
      )}

      {/* Modal: View & Edit Intent Details */}
      {selectedIntent && (
        <div
          id="intent-details-modal"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#EAF2FF] text-[#0055FF] flex items-center justify-center font-bold">
                  IT
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
                      rows={4}
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
                        className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0055FF]"
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
                        className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0055FF]"
                      >
                        <option value="private">Privada</option>
                        <option value="public">Pública</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <div className="space-y-4">
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
      )}

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
                Esta ação removerá permanentemente a intenção e seu registro no banco de dados.
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
