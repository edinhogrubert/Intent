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
  Users,
  Key,
  UserCheck,
  Send,
  Sliders,
} from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType, signInWithPopup, googleProvider } from '../utils/firebase';
import { Intent, UserAccount, ConditionType, Participant, QuorumMode } from '../types';
import {
  calculateTimeRemaining,
  formatTargetDateTime,
  TIME_PRESETS,
} from '../utils/timeCondition';
import { evaluateIntentConditions, SAMPLE_PEOPLE_PRESETS } from '../utils/conditionEvaluator';
import { ParticipantManager } from './ParticipantManager';
import { ApprovalWorkflow } from './ApprovalWorkflow';
import { ProtectedVaultPipeline } from './ProtectedVaultPipeline';
import { PublicSupportWorkflow } from './PublicSupportWorkflow';
import { SocialHistoryWorkflow } from './SocialHistoryWorkflow';
import { IntentStructureModal } from './IntentStructureModal';
import { normalizeIntent } from '../utils/intentSchema';
import { ProtectedPayload, SAMPLE_PROTECTED_FILES } from '../utils/cryptoVault';

interface IntentManagerProps {
  user: UserAccount;
}

const LOCAL_STORAGE_INTENTS_KEY = 'portal_app_local_intents';

export function IntentManager({ user }: IntentManagerProps) {
  const [intents, setIntents] = useState<Intent[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);
  const [inspectingIntent, setInspectingIntent] = useState<Intent | null>(null);

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

  // Condition State (Etapa 3 Tempo + Etapa 4 Pessoas + Etapa 5 Aprovação)
  const [newConditionType, setNewConditionType] = useState<ConditionType>('PEOPLE');
  const [newTargetDate, setNewTargetDate] = useState<string>('');
  const [newRevealContent, setNewRevealContent] = useState<string>('🔑 PROTOCOLO ALFA DESBLOQUEADO: Acesso ao cofre concedido com sucesso após quórum de guardiões.');
  const [newParticipants, setNewParticipants] = useState<Participant[]>([
    {
      id: 'p-init-1',
      name: 'Dra. Helena Voss',
      email: 'helena.voss@curadoria.org',
      role: 'guardian',
      status: 'approved',
      approved_at: new Date().toISOString(),
      notes: 'Guardiã Institucional (✓ Aprovado)',
    },
    {
      id: 'p-init-2',
      name: 'Carlos Mendez',
      email: 'carlos.m@fintech.io',
      role: 'guardian',
      status: 'approved',
      approved_at: new Date().toISOString(),
      notes: 'Co-fundador & Testemunha (✓ Aprovado)',
    },
    {
      id: 'p-init-3',
      name: 'Dra. Amanda Ribeiro',
      email: 'amanda.ribeiro@conselho.gov',
      role: 'guardian',
      status: 'pending',
      notes: 'Compliance (— Pendente)',
    },
  ]);
  const [newRequiredApprovals, setNewRequiredApprovals] = useState<number>(2);
  const [newQuorumMode, setNewQuorumMode] = useState<QuorumMode>('EXACT_N');
  const [newProtectedPayload, setNewProtectedPayload] = useState<ProtectedPayload | null>(null);
  const [showCreateEncryptionPipeline, setShowCreateEncryptionPipeline] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter & Search State
  const [activeViewTab, setActiveViewTab] = useState<'overview' | 'social' | 'approvals' | 'public_support' | 'vault'>('overview');
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
  const [editParticipants, setEditParticipants] = useState<Participant[]>([]);
  const [editRequiredApprovals, setEditRequiredApprovals] = useState<number>(1);
  const [editQuorumMode, setEditQuorumMode] = useState<QuorumMode>('EXACT_N');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Helper: Default preset intents for Etapa 4 & 5
  const getInitialDefaultIntents = (): Intent[] => [
    {
      id: 'intent-stage5-flavio-fernando-2of2',
      creator_id: user.id || user.email || 'usr-1',
      title: 'Etapa 5 — Aprovação Simples (2/2 Unanimidade: Flávio & Fernando)',
      description: 'Flávio → Aprovar (✓) | Fernando → Aprovar (✓). Quando todos aprovarem (2 / 2) ➔ REVELAR.',
      status: 'active',
      visibility: 'private',
      condition_type: 'PEOPLE',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      reveal_content: '🔓 CONTRATO BILATERAL REVELADO COM SUCESSO:\n• Condição: Unanimidade (2 de 2)\n• Aprovado por: Flávio (✓) e Fernando (✓)\n• Protocolo: 0x2OF2_UNANIMOUS_APPROVED',
      is_locked: true,
      quorum_mode: 'UNANIMOUS',
      required_approvals: 2,
      people: {
        approvers: [
          {
            id: 'app-flavio',
            name: 'Flávio',
            email: 'flavio@conselho.org',
            role: 'approver',
            status: 'approved',
            approved_at: new Date(Date.now() - 3600000 * 2).toISOString(),
            notes: 'Aprovador #1 (✓ Aprovado)',
          },
          {
            id: 'app-fernando',
            name: 'Fernando',
            email: 'fernando@conselho.org',
            role: 'approver',
            status: 'approved',
            approved_at: new Date(Date.now() - 3600000).toISOString(),
            notes: 'Aprovador #2 (✓ Aprovado)',
          },
        ],
        recipients: [],
        participants: [],
      },
      participants: [
        {
          id: 'app-flavio',
          name: 'Flávio',
          email: 'flavio@conselho.org',
          role: 'guardian',
          status: 'approved',
          approved_at: new Date(Date.now() - 3600000 * 2).toISOString(),
          notes: 'Aprovador #1 (✓ Aprovado)',
        },
        {
          id: 'app-fernando',
          name: 'Fernando',
          email: 'fernando@conselho.org',
          role: 'guardian',
          status: 'approved',
          approved_at: new Date(Date.now() - 3600000).toISOString(),
          notes: 'Aprovador #2 (✓ Aprovado)',
        },
      ],
    },
    {
      id: 'intent-stage5-majority-2of3',
      creator_id: user.id || user.email || 'usr-1',
      title: 'Etapa 5 — Quórum por Maioria (2 de 3: Flávio, Fernando, Maria)',
      description: 'Motor genérico de regras: condition = { type: "APPROVAL", required: 2, eligible: 3 }. Flávio já aprovou (1/2), aguardando Fernando ou Maria para REVELAR.',
      status: 'active',
      visibility: 'private',
      condition_type: 'PEOPLE',
      created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
      reveal_content: '🔒 COFRE DO PROJETO BETA LIBERADO:\n• Chave de Acesso: 0x99BETA_QUORUM_REACHED\n• Quórum de Maioria Atingido (2 de 3)',
      is_locked: true,
      quorum_mode: 'MAJORITY',
      required_approvals: 2,
      people: {
        approvers: [
          {
            id: 'app-flavio',
            name: 'Flávio',
            email: 'flavio@conselho.org',
            role: 'approver',
            status: 'approved',
            approved_at: new Date(Date.now() - 3600000).toISOString(),
            notes: 'Aprovador #1 (✓ Aprovado)',
          },
          {
            id: 'app-fernando',
            name: 'Fernando',
            email: 'fernando@conselho.org',
            role: 'approver',
            status: 'pending',
            notes: 'Aprovador #2 (— Aguardando)',
          },
          {
            id: 'app-maria',
            name: 'Maria',
            email: 'maria@conselho.org',
            role: 'approver',
            status: 'pending',
            notes: 'Aprovadora #3 (— Aguardando)',
          },
        ],
        recipients: [],
        participants: [],
      },
      participants: [
        {
          id: 'app-flavio',
          name: 'Flávio',
          email: 'flavio@conselho.org',
          role: 'guardian',
          status: 'approved',
          approved_at: new Date(Date.now() - 3600000).toISOString(),
          notes: 'Aprovador #1 (✓ Aprovado)',
        },
        {
          id: 'app-fernando',
          name: 'Fernando',
          email: 'fernando@conselho.org',
          role: 'guardian',
          status: 'pending',
          notes: 'Aprovador #2 (— Aguardando)',
        },
        {
          id: 'app-maria',
          name: 'Maria',
          email: 'maria@conselho.org',
          role: 'guardian',
          status: 'pending',
          notes: 'Aprovadora #3 (— Aguardando)',
        },
      ],
    },
    {
      id: 'intent-stage5-exact-3of5',
      creator_id: user.id || user.email || 'usr-1',
      title: 'Etapa 5 — Quórum Numérico M de N (3 de 5 Guardiões)',
      description: 'Regra de liberação: 3 aprovações necessárias de 5 elegíveis (Flávio, Fernando, Maria, Roberto, Helena).',
      status: 'active',
      visibility: 'private',
      condition_type: 'PEOPLE',
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      reveal_content: '🔒 COFRE DO CONSELHO LIBERADO:\n• 3 de 5 assinaturas validadas pelo motor genérico.',
      is_locked: true,
      quorum_mode: 'EXACT_N',
      required_approvals: 3,
      participants: [
        {
          id: 'app-5-1',
          name: 'Flávio',
          email: 'flavio@conselho.org',
          role: 'guardian',
          status: 'approved',
          approved_at: new Date().toISOString(),
          notes: 'Aprovador #1 (✓)',
        },
        {
          id: 'app-5-2',
          name: 'Fernando',
          email: 'fernando@conselho.org',
          role: 'guardian',
          status: 'approved',
          approved_at: new Date().toISOString(),
          notes: 'Aprovador #2 (✓)',
        },
        {
          id: 'app-5-3',
          name: 'Maria',
          email: 'maria@conselho.org',
          role: 'guardian',
          status: 'pending',
          notes: 'Aprovadora #3 (—)',
        },
        {
          id: 'app-5-4',
          name: 'Roberto',
          email: 'roberto@conselho.org',
          role: 'guardian',
          status: 'pending',
          notes: 'Aprovador #4 (—)',
        },
        {
          id: 'app-5-5',
          name: 'Helena',
          email: 'helena@conselho.org',
          role: 'guardian',
          status: 'pending',
          notes: 'Aprovadora #5 (—)',
        },
      ],
    },
    {
      id: 'intent-stage4-joao-conselho-demo',
      creator_id: user.id || user.email || 'usr-1',
      title: 'Etapa 4 — Documento Privado com Quórum de Aprovadores (Caso João & Conselho)',
      description: '2 de 3 Aprovadores (Flávio, Fernando, Maria) autorizam a liberação, mas a revelação é direcionada estritamente ao Destinatário (João).',
      status: 'active',
      visibility: 'private',
      condition_type: 'PEOPLE',
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
      reveal_content: '🔒 REVELAÇÃO EXCLUSIVA DE JOÃO:\n• Documento de Concessão & Cláusulas Restritas\n• Aprovado por: Flávio (✓) e Fernando (✓)\n• Destinatário Autorizado a Leitura: João (joao@silva.com)',
      is_locked: true,
      quorum_mode: 'MAJORITY',
      required_approvals: 2,
      people: {
        approvers: [
          {
            id: 'app-1',
            name: 'Flávio',
            email: 'flavio@conselho.org',
            role: 'approver',
            status: 'approved',
            approved_at: new Date(Date.now() - 3600000 * 2).toISOString(),
            notes: 'Aprovador do Conselho (✓ Aprovado)',
          },
          {
            id: 'app-2',
            name: 'Fernando',
            email: 'fernando@conselho.org',
            role: 'approver',
            status: 'approved',
            approved_at: new Date(Date.now() - 3600000).toISOString(),
            notes: 'Aprovador de Compliance (✓ Aprovado)',
          },
          {
            id: 'app-3',
            name: 'Maria',
            email: 'maria@conselho.org',
            role: 'approver',
            status: 'pending',
            notes: 'Aprovadora Jurídica (— Pendente)',
          },
        ],
        recipients: [
          {
            id: 'rec-1',
            name: 'João Silva',
            email: 'joao@silva.com',
            role: 'recipient',
            status: 'pending',
            notes: 'Destinatário Exclusivo do Conteúdo Revelado',
          },
        ],
        participants: [],
      },
      participants: [
        {
          id: 'app-1',
          name: 'Flávio',
          email: 'flavio@conselho.org',
          role: 'guardian',
          status: 'approved',
          approved_at: new Date(Date.now() - 3600000 * 2).toISOString(),
          notes: 'Aprovador do Conselho (✓ Aprovado)',
        },
        {
          id: 'app-2',
          name: 'Fernando',
          email: 'fernando@conselho.org',
          role: 'guardian',
          status: 'approved',
          approved_at: new Date(Date.now() - 3600000).toISOString(),
          notes: 'Aprovador de Compliance (✓ Aprovado)',
        },
        {
          id: 'app-3',
          name: 'Maria',
          email: 'maria@conselho.org',
          role: 'guardian',
          status: 'pending',
          notes: 'Aprovadora Jurídica (— Pendente)',
        },
        {
          id: 'rec-1',
          name: 'João Silva',
          email: 'joao@silva.com',
          role: 'recipient',
          status: 'pending',
          notes: 'Destinatário Exclusivo do Conteúdo Revelado',
        },
      ],
    },
    {
      id: 'intent-stage7-public-support-demo',
      creator_id: user.id || user.email || 'usr-1',
      title: 'Etapa 7 — Participação Pública & Janela Efêmera (100 Apoios ➔ 24h Revelado)',
      description: 'Intenção com ciclo de mobilização pública e janela de revelação: 100 apoios ➔ Revela ➔ 24 horas disponível ➔ Expira.',
      status: 'active',
      visibility: 'public',
      condition_type: 'PUBLIC_SUPPORT',
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
      target_supports: 100,
      current_supports: 10,
      reveal_window_hours: 24,
      reveal_window: {
        duration_hours: 24,
        has_expiration: true,
      },
      public_participation: {
        target_supports: 100,
        current_supports: 10,
        supporters: [],
      },
      reveal_content: '🔓 RELATÓRIO PÚBLICO REVELADO (JANELA DE 24 HORAS):\n• Meta Coletiva de 100/100 Apoios Atingida!\n• Chave de Acesso Comunitária: 0xCOMMUNITY_MANIFESTO_2026\n• Este conteúdo ficará disponível durante 24 horas antes de expirar.',
      is_locked: true,
      supporters: [
        {
          id: 'sup-1',
          name: 'Ana Souza',
          supported_at: new Date(Date.now() - 60000 * 12).toISOString(),
          comment: 'Causa essencial! Total apoio para revelação dos dados.',
        },
        {
          id: 'sup-2',
          name: 'Lucas Viana',
          supported_at: new Date(Date.now() - 60000 * 35).toISOString(),
          comment: 'Assinado e compartilhado com a rede.',
        },
        {
          id: 'sup-3',
          name: 'Beatriz Lima',
          supported_at: new Date(Date.now() - 60000 * 120).toISOString(),
          comment: 'Pela transparência e impacto comunitário!',
        },
      ],
    },
    {
      id: 'intent-time-demo',
      creator_id: user.id || user.email || 'usr-1',
      title: 'Distribuição de Dividendos e Relatório Trimestral',
      description: 'Trava temporal agendada para distribuição de demonstrativos contábeis aos acionistas.',
      status: 'active',
      visibility: 'private',
      condition_type: 'TIME',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      target_date: new Date(Date.now() + 86400000 * 2).toISOString(),
      reveal_content: 'LINK DE ACESSO AO RELATÓRIO: https://relatorio.portal.app/q3-2026-audit.pdf',
      is_locked: true,
      participants: [
        {
          id: 'p-rec-1',
          name: 'Mariana Duarte',
          email: 'mariana.duarte@equipe.com',
          role: 'recipient',
          status: 'pending',
          notes: 'Diretoria Financeira',
        },
      ],
    },
  ];

  // Helper: Local fallback
  const getLocalIntents = (): Intent[] => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_INTENTS_KEY);
      let listToReturn: Intent[] = [];
      if (!raw) {
        const defaults = getInitialDefaultIntents();
        saveLocalIntents(defaults);
        listToReturn = defaults;
      } else {
        const parsed: Intent[] = JSON.parse(raw);
        if (parsed.length === 0) {
          const defaults = getInitialDefaultIntents();
          saveLocalIntents(defaults);
          listToReturn = defaults;
        } else {
          listToReturn = parsed.filter(
            (i) =>
              !i.creator_id ||
              i.creator_id === user.id ||
              i.creator_id === 'usr-1' ||
              i.creator_id === user.email
          );
        }
      }
      return listToReturn.map((item) => normalizeIntent(item, user));
    } catch {
      return getInitialDefaultIntents().map((item) => normalizeIntent(item, user));
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
            const items: Intent[] = snapshot.docs.map((docSnap) =>
              normalizeIntent(
                {
                  id: docSnap.id,
                  ...(docSnap.data() as Omit<Intent, 'id'>),
                },
                user
              )
            );

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
    if (newConditionType === 'NONE') {
      setNewConditionType('TIME');
    }
  };

  const handleApplyEditPreset = (getDate: () => string) => {
    const iso = getDate();
    setEditTargetDate(iso);
    if (editConditionType === 'NONE') {
      setEditConditionType('TIME');
    }
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
      target_date:
        newConditionType === 'TIME' || newConditionType === 'HYBRID'
          ? newTargetDate
          : undefined,
      reveal_content:
        newConditionType !== 'NONE' ? newRevealContent.trim() : undefined,
      is_locked: newConditionType !== 'NONE',
      quorum_mode: newQuorumMode,
      participants:
        newConditionType === 'PEOPLE' || newConditionType === 'HYBRID'
          ? newParticipants
          : [],
      required_approvals:
        newConditionType === 'PEOPLE' || newConditionType === 'HYBRID'
          ? newRequiredApprovals
          : undefined,
      protected_payload: newProtectedPayload || undefined,
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
          quorum_mode: newIntent.quorum_mode || 'EXACT_N',
          participants: newIntent.participants || [],
          required_approvals: newIntent.required_approvals || null,
          protected_payload: newIntent.protected_payload || null,
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
    setNewConditionType('PEOPLE');
    setNewTargetDate('');
    setNewRevealContent('');
    setNewProtectedPayload(null);
    setShowCreateEncryptionPipeline(false);
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
    setEditParticipants(intent.participants || []);
    setEditRequiredApprovals(intent.required_approvals || 1);
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
      target_date:
        editConditionType === 'TIME' || editConditionType === 'HYBRID'
          ? editTargetDate
          : undefined,
      reveal_content:
        editConditionType !== 'NONE' ? editRevealContent.trim() : undefined,
      participants:
        editConditionType === 'PEOPLE' || editConditionType === 'HYBRID'
          ? editParticipants
          : [],
      required_approvals:
        editConditionType === 'PEOPLE' || editConditionType === 'HYBRID'
          ? editRequiredApprovals
          : undefined,
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

  // Participant updates in Modal (live signature simulation or editing participants)
  const handleUpdateParticipantsOnIntent = async (updatedParticipants: Participant[]) => {
    if (!selectedIntent) return;

    const isFirebase = !!auth.currentUser && !selectedIntent.id.startsWith('intent-');
    const updatedIntent: Intent = {
      ...selectedIntent,
      participants: updatedParticipants,
    };

    if (isFirebase) {
      try {
        await updateDoc(doc(db, 'intents', selectedIntent.id), {
          participants: updatedParticipants,
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      const updated = intents.map((i) =>
        i.id === selectedIntent.id ? updatedIntent : i
      );
      setIntents(updated);
      saveLocalIntents(updated);
    }

    setSelectedIntent(updatedIntent);
  };

  // Etapa 5: Toggle single participant status (✓ vs —) directly on any intent
  const handleToggleParticipantStatusOnIntent = async (intentId: string, participantId: string) => {
    const targetIntent = intents.find((i) => i.id === intentId) || (selectedIntent?.id === intentId ? selectedIntent : null);
    if (!targetIntent) return;

    const currentParticipants = targetIntent.participants || [];
    const updatedParticipants = currentParticipants.map((p) => {
      if (p.id === participantId) {
        const isApproved = p.status === 'approved';
        return {
          ...p,
          status: (isApproved ? 'pending' : 'approved') as 'approved' | 'pending',
          approved_at: isApproved ? undefined : new Date().toISOString(),
        };
      }
      return p;
    });

    const isFirebase = !!auth.currentUser && !targetIntent.id.startsWith('intent-');
    if (isFirebase) {
      try {
        await updateDoc(doc(db, 'intents', targetIntent.id), {
          participants: updatedParticipants,
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      const updated = intents.map((i) =>
        i.id === targetIntent.id ? { ...i, participants: updatedParticipants } : i
      );
      setIntents(updated);
      saveLocalIntents(updated);
    }

    if (selectedIntent && selectedIntent.id === targetIntent.id) {
      setSelectedIntent({
        ...selectedIntent,
        participants: updatedParticipants,
      });
    }
  };

  // Etapa 7: Update supports or add new supporter on intent
  const handleUpdateSupportsOnIntent = async (
    intentId: string,
    newSupportsCount: number,
    supporterName?: string,
    comment?: string
  ) => {
    const targetIntent = intents.find((i) => i.id === intentId) || (selectedIntent?.id === intentId ? selectedIntent : null);
    if (!targetIntent) return;

    const currentSupporters = targetIntent.supporters || [];
    let updatedSupporters = [...currentSupporters];

    if (supporterName) {
      updatedSupporters.unshift({
        id: 'sup-' + Date.now(),
        name: supporterName,
        supported_at: new Date().toISOString(),
        comment,
      });
    }

    const updatedFields: Partial<Intent> = {
      current_supports: Math.max(0, newSupportsCount),
      supporters: updatedSupporters,
    };

    const isFirebase = !!auth.currentUser && !targetIntent.id.startsWith('intent-');
    if (isFirebase) {
      try {
        await updateDoc(doc(db, 'intents', targetIntent.id), updatedFields);
      } catch (e) {
        console.error(e);
      }
    } else {
      const updated = intents.map((i) =>
        i.id === targetIntent.id ? { ...i, ...updatedFields } : i
      );
      setIntents(updated);
      saveLocalIntents(updated);
    }

    if (selectedIntent && selectedIntent.id === targetIntent.id) {
      setSelectedIntent({
        ...selectedIntent,
        ...updatedFields,
      });
    }
  };

  // Etapa 8: Add social opinion/comment/prediction/agree/disagree to intent
  const handleAddSocialInteractionOnIntent = async (
    intentId: string,
    interaction: {
      user_name: string;
      type: 'AGREE' | 'DISAGREE' | 'COMMENT' | 'PREDICTION';
      text?: string;
      prediction_val?: string;
    }
  ) => {
    const targetIntent = intents.find((i) => i.id === intentId) || (selectedIntent?.id === intentId ? selectedIntent : null);
    if (!targetIntent) return;

    const currentInteractions = targetIntent.social_interactions || [];
    const currentLogs = targetIntent.history_logs || [];

    const newSocialItem = {
      id: 'soc-' + Date.now(),
      user_name: interaction.user_name,
      type: interaction.type,
      text: interaction.text,
      prediction_val: interaction.prediction_val,
      created_at: 'Agora',
    };

    const actionLabel =
      interaction.type === 'AGREE'
        ? 'Registrou voto [Concordo]'
        : interaction.type === 'DISAGREE'
        ? 'Registrou voto [Discordo]'
        : interaction.type === 'PREDICTION'
        ? `Registrou Previsão: "${interaction.prediction_val || interaction.text}"`
        : 'Registrou um Comentário';

    const newLogItem = {
      id: 'log-' + Date.now(),
      timestamp: 'Agora',
      action_type: 'SOCIAL_OPINION' as const,
      actor_name: interaction.user_name,
      description: actionLabel,
      badge: 'Etapa 8 — Social',
    };

    const updatedInteractions = [newSocialItem, ...currentInteractions];
    const updatedLogs = [newLogItem, ...currentLogs];

    let newAgree = targetIntent.agree_count ?? currentInteractions.filter((s) => s.type === 'AGREE').length;
    let newDisagree = targetIntent.disagree_count ?? currentInteractions.filter((s) => s.type === 'DISAGREE').length;
    let newPredictions = targetIntent.predictions_count ?? currentInteractions.filter((s) => s.type === 'PREDICTION').length;

    if (interaction.type === 'AGREE') newAgree += 1;
    if (interaction.type === 'DISAGREE') newDisagree += 1;
    if (interaction.type === 'PREDICTION') newPredictions += 1;

    const updatedFields: Partial<Intent> = {
      social_interactions: updatedInteractions,
      history_logs: updatedLogs,
      agree_count: newAgree,
      disagree_count: newDisagree,
      predictions_count: newPredictions,
    };

    const isFirebase = !!auth.currentUser && !targetIntent.id.startsWith('intent-');
    if (isFirebase) {
      try {
        await updateDoc(doc(db, 'intents', targetIntent.id), updatedFields);
      } catch (e) {
        console.error(e);
      }
    } else {
      const updated = intents.map((i) =>
        i.id === targetIntent.id ? { ...i, ...updatedFields } : i
      );
      setIntents(updated);
      saveLocalIntents(updated);
    }

    if (selectedIntent && selectedIntent.id === targetIntent.id) {
      setSelectedIntent({
        ...selectedIntent,
        ...updatedFields,
      });
    }
  };

  // Etapa 5 & Etapa 7: Reveal Ceremony Trigger (Sets reveal timestamp and calculates reveal window expiration)
  const handleRevealIntent = async (targetIntent: Intent) => {
    const isFirebase = !!auth.currentUser && !targetIntent.id.startsWith('intent-');
    const nowIso = new Date().toISOString();
    const windowHours = targetIntent.reveal_window?.duration_hours || targetIntent.reveal_window_hours || 24;
    const expiresAtIso = new Date(Date.now() + windowHours * 3600 * 1000).toISOString();

    const updatedFields: Partial<Intent> = {
      is_locked: false,
      revealed_at: nowIso,
      revealed_by: user.name || user.email || 'Usuário Autorizado',
      status: 'completed',
      reveal_window_hours: windowHours,
      expires_at: expiresAtIso,
      reveal_window: {
        duration_hours: windowHours,
        reveal_started_at: nowIso,
        expires_at: expiresAtIso,
        has_expiration: true,
      },
    };

    if (isFirebase) {
      try {
        await updateDoc(doc(db, 'intents', targetIntent.id), updatedFields);
      } catch (e) {
        console.error(e);
      }
    } else {
      const updated = intents.map((i) =>
        i.id === targetIntent.id ? { ...i, ...updatedFields } : i
      );
      setIntents(updated);
      saveLocalIntents(updated);
    }

    if (selectedIntent && selectedIntent.id === targetIntent.id) {
      setSelectedIntent({
        ...selectedIntent,
        ...updatedFields,
      });
    }
  };

  // Instant simulation helper: Trigger immediate reveal for testing
  const handleSimulateInstantReveal = async (intent: Intent) => {
    const isFirebase = !!auth.currentUser && !intent.id.startsWith('intent-');
    const pastDate = new Date(Date.now() - 1000).toISOString();
    const approvedParticipants = (intent.participants || []).map((p) =>
      p.role === 'guardian'
        ? { ...p, status: 'approved' as const, approved_at: new Date().toISOString() }
        : p
    );

    const updatedFields: Partial<Intent> = {
      target_date: pastDate,
      is_locked: false,
      revealed_at: new Date().toISOString(),
      participants: approvedParticipants,
    };

    if (isFirebase) {
      try {
        await updateDoc(doc(db, 'intents', intent.id), updatedFields);
      } catch (e) {
        console.error(e);
      }
    } else {
      const updated = intents.map((i) =>
        i.id === intent.id
          ? {
              ...i,
              ...updatedFields,
            }
          : i
      );
      setIntents(updated);
      saveLocalIntents(updated);
    }

    if (selectedIntent && selectedIntent.id === intent.id) {
      setSelectedIntent({
        ...selectedIntent,
        ...updatedFields,
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
    const evalResult = evaluateIntentConditions(intent);

    let matchesStatus = true;
    if (filterStatus === 'time_locked') {
      matchesStatus =
        intent.condition_type === 'TIME' ||
        (intent.condition_type === 'HYBRID' && !evalResult.timeResult.isMatured);
    } else if (filterStatus === 'people_locked') {
      matchesStatus =
        (intent.condition_type === 'PEOPLE' || intent.condition_type === 'HYBRID') &&
        !evalResult.isPeopleConditionSatisfied;
    } else if (filterStatus === 'revealed') {
      matchesStatus = evalResult.isConditionSatisfied && intent.condition_type !== 'NONE';
    } else if (filterStatus !== 'all') {
      matchesStatus = intent.status === filterStatus;
    }

    const matchesSearch =
      intent.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      intent.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      intent.reveal_content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (intent.participants || []).some(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.email.toLowerCase().includes(searchQuery.toLowerCase())
      );

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
  const totalWithPeople = intents.filter(
    (i) => (i.participants && i.participants.length > 0) || i.condition_type === 'PEOPLE' || i.condition_type === 'HYBRID'
  ).length;

  const totalAwaitingSignatures = intents.filter((i) => {
    const res = evaluateIntentConditions(i);
    return (i.condition_type === 'PEOPLE' || i.condition_type === 'HYBRID') && !res.isPeopleConditionSatisfied;
  }).length;

  return (
    <div id="intent-manager-container" className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#DCE7F6] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E2EDFF] text-[#0055FF] text-xs font-black">
              <Shield className="w-3.5 h-3.5" />
              <span>Etapas 1 a 8 — Sistema Operacional</span>
            </div>

            {totalAwaitingSignatures > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                <span>{totalAwaitingSignatures} quórum pendente</span>
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
            Gerenciador de Intenções & Protocolos
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Painel simplificado para criação, verificação e revelação descentralizada com regras de tempo, guardiões, apoio coletivo e cofre seguro.
          </p>
        </div>

        <button
          id="btn-new-intent"
          type="button"
          onClick={() => {
            setIsCreating(!isCreating);
            setErrorMsg(null);
            if (!isCreating) setActiveViewTab('overview');
          }}
          className="px-6 py-3.5 rounded-2xl bg-[#0055FF] hover:bg-[#0047E0] active:scale-98 text-white text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isCreating ? 'Fechar Formulário' : 'Nova Intent'}</span>
        </button>
      </div>

      {/* Segmented Workspace Navigation Tab Bar */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-[#DCE7F6] overflow-x-auto shadow-2xs">
        {[
          { key: 'overview', label: 'Minhas Intenções', count: intents.length, icon: Layers },
          { key: 'social', label: 'Histórico & Feed Social', count: 'Etapa 8', icon: Users },
          { key: 'approvals', label: 'Quórum & Guardiões', count: 'Etapa 5', icon: Shield },
          { key: 'public_support', label: 'Participação Coletiva', count: 'Etapa 7', icon: Sparkles },
          { key: 'vault', label: 'Cofre AES-256', count: 'Etapa 6', icon: Lock },
        ].map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeViewTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveViewTab(tab.key as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-[#0055FF] text-white shadow-xs'
                  : 'bg-transparent text-slate-600 hover:bg-[#F0F5FD] hover:text-[#0055FF]'
              }`}
            >
              <TabIcon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20 text-white font-bold' : 'bg-slate-100 text-slate-500 font-semibold'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Dedicated Workspace Views */}
      {activeViewTab === 'social' && intents.length > 0 && (
        <SocialHistoryWorkflow
          intent={intents[0]}
          onAddInteraction={(intentId, interaction) =>
            handleAddSocialInteractionOnIntent(intentId, interaction)
          }
          variant="interactive_hero"
        />
      )}

      {activeViewTab === 'approvals' && intents.length > 0 && (() => {
        const peopleIntent = intents.find((i) => (i.participants && i.participants.length > 0) || i.condition_type === 'PEOPLE') || intents[0];
        return (
          <ApprovalWorkflow
            intent={peopleIntent}
            participants={peopleIntent.participants || []}
            requiredApprovals={peopleIntent.required_approvals || 2}
            onToggleParticipantStatus={(participantId) =>
              handleToggleParticipantStatusOnIntent(peopleIntent.id, participantId)
            }
            onReveal={() => handleRevealIntent(peopleIntent)}
            isRevealed={!!peopleIntent.revealed_at}
            revealContent={peopleIntent.reveal_content}
            variant="interactive_hero"
          />
        );
      })()}

      {activeViewTab === 'public_support' && intents.length > 0 && (() => {
        const publicIntent = intents.find((i) => i.condition_type === 'PUBLIC_SUPPORT') || intents[0];
        return (
          <PublicSupportWorkflow
            intent={publicIntent}
            currentSupports={publicIntent.current_supports ?? 10}
            targetSupports={publicIntent.target_supports ?? 100}
            supporters={publicIntent.supporters}
            onAddSupport={(amount, name, comment) =>
              handleUpdateSupportsOnIntent(
                publicIntent.id,
                (publicIntent.current_supports ?? 10) + amount,
                name,
                comment
              )
            }
            onSetSupports={(val) => handleUpdateSupportsOnIntent(publicIntent.id, val)}
            onReveal={() => handleRevealIntent(publicIntent)}
            isRevealed={!!publicIntent.revealed_at}
            revealContent={publicIntent.reveal_content}
            variant="interactive_hero"
          />
        );
      })()}

      {activeViewTab === 'vault' && intents.length > 0 && (
        <ProtectedVaultPipeline
          intent={intents[0]}
          isConditionSatisfied={evaluateIntentConditions(intents[0]).isConditionSatisfied}
          onPayloadEncrypted={(payload) => {
            const updatedIntents = intents.map((i) =>
              i.id === intents[0].id ? { ...i, protected_payload: payload } : i
            );
            setIntents(updatedIntents);
            saveLocalIntents(updatedIntents);
          }}
        />
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-rose-500 hover:text-rose-800 text-xs font-bold cursor-pointer"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Expandable Form: Nova Intent com suporte à Etapa 4 (Pessoas e Guardiões) */}
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
                  Criar Nova Intenção com Guardiões e Destinatários
                </h3>
                <p className="text-xs text-slate-400">
                  Configure o título, o tipo de condição de disparo e as pessoas associadas.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Basic Information */}
            <div className="lg:col-span-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Título da Intent *
                </label>
                <input
                  id="intent-title-input"
                  type="text"
                  required
                  placeholder="Ex: Acordo de Liberação de Chave de Acesso"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0055FF] focus:border-transparent transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Descrição Pública / Propósito
                </label>
                <textarea
                  id="intent-desc-input"
                  rows={2}
                  placeholder="Descreva o propósito da intenção (visível aos participantes)..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0055FF] focus:border-transparent transition-all placeholder:text-slate-400"
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
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0055FF]"
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
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0055FF]"
                  >
                    <option value="private">Privada (Apenas envolvidos)</option>
                    <option value="public">Pública (Rede Intent)</option>
                  </select>
                </div>
              </div>

              {/* Protected Content Area (Etapa 6: Envelope Criptográfico & Prova) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Conteúdo Selado / Segredo:</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCreateEncryptionPipeline(!showCreateEncryptionPipeline)}
                    className="text-[11px] font-bold text-[#0055FF] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Shield className="w-3 h-3 text-[#0055FF]" />
                    <span>{showCreateEncryptionPipeline ? 'Ocultar Pipeline Cripto' : 'Criptografar Arquivo / Payload'}</span>
                  </button>
                </div>

                {!showCreateEncryptionPipeline ? (
                  <textarea
                    rows={2}
                    placeholder="Mensagem, credenciais, contrato ou instrução confidencial que só será liberada aos destinatários..."
                    value={newRevealContent}
                    onChange={(e) => setNewRevealContent(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-[#0055FF] placeholder:text-slate-400"
                  />
                ) : (
                  <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                    <ProtectedVaultPipeline
                      intent={null}
                      isConditionSatisfied={false}
                      onPayloadEncrypted={(payload) => {
                        setNewProtectedPayload(payload);
                        setNewRevealContent(payload.fileName || 'Arquivo Criptografado');
                      }}
                      variant="full_pipeline"
                    />
                  </div>
                )}

                {newProtectedPayload && (
                  <div className="p-2.5 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-[#0055FF]" />
                      <span className="font-mono text-slate-700">
                        Payload AES-256 Selado: <strong>{newProtectedPayload.fileName}</strong> ({newProtectedPayload.fingerprint})
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#0055FF] text-white text-[10px] font-bold">
                      Pronto
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Conditions & People Box */}
            <div className="lg:col-span-6 bg-[#F0F5FD] p-5 rounded-2xl border border-[#DCE7F6] space-y-4">
              {/* Condition Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-[#0055FF]" />
                  <span>Tipo de Trava / Condição:</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { id: 'NONE', label: 'Sem Trava', icon: Sparkles },
                    { id: 'TIME', label: 'Tempo', icon: Timer },
                    { id: 'PEOPLE', label: 'Pessoas / Guardiões', icon: Users },
                    { id: 'HYBRID', label: 'Tempo + Pessoas', icon: Shield },
                  ].map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setNewConditionType(t.id as ConditionType)}
                        className={`p-2 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                          newConditionType === t.id
                            ? 'bg-[#0055FF] text-white shadow-xs'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="text-center">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Configuration if TIME or HYBRID */}
              {(newConditionType === 'TIME' || newConditionType === 'HYBRID') && (
                <div className="p-3.5 bg-white rounded-xl border border-[#BFD7FE] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Timer className="w-3.5 h-3.5 text-[#0055FF]" />
                      <span>Configuração Temporal (Etapa 3)</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {TIME_PRESETS.slice(0, 3).map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyPreset(p.getDate)}
                        className="px-2 py-0.5 bg-[#F0F5FD] hover:bg-[#E2EDFF] text-[#0055FF] border border-[#BFD7FE] rounded text-[10px] font-semibold"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
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
                    className="w-full px-3 py-1.5 bg-[#F8FAFC] border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              )}

              {/* People & Guardians Configuration if PEOPLE or HYBRID */}
              {(newConditionType === 'PEOPLE' || newConditionType === 'HYBRID') && (
                <ParticipantManager
                  participants={newParticipants}
                  onChange={setNewParticipants}
                  requiredApprovals={newRequiredApprovals}
                  onRequiredApprovalsChange={setNewRequiredApprovals}
                  canSimulateSignatures={true}
                />
              )}
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
                  <span>Salvando Intent...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Salvar Intent com Pessoas</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Overview Tab Content: Search, Filters & Intent Cards Grid */}
      {activeViewTab === 'overview' && (
        <>
          {/* Filter and Search Controls */}
          <div className="bg-white rounded-2xl p-4 border border-[#DCE7F6] flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="search-intent-input"
            type="text"
            placeholder="Buscar título, guardião ou destinatário..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0055FF]"
          />
        </div>

        {/* Status, Time and People Filters */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1 hidden sm:block" />
          {[
            { key: 'all', label: 'Todas', count: intents.length },
            { key: 'people_locked', label: '🛡️ Aguardando Guardiões', count: totalAwaitingSignatures },
            { key: 'time_locked', label: '⏳ Trava de Tempo', count: intents.filter((i) => i.condition_type === 'TIME' || i.condition_type === 'HYBRID').length },
            { key: 'revealed', label: '✨ Condições Cumpridas', count: intents.filter((i) => evaluateIntentConditions(i).isConditionSatisfied && i.condition_type !== 'NONE').length },
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
          <p className="text-xs text-slate-500">Sincronizando intenções, guardiões e quóruns...</p>
        </div>
      ) : filteredIntents.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-[#DCE7F6] text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EAF2FF] text-[#0055FF] flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              {searchQuery || filterStatus !== 'all'
                ? 'Nenhuma Intent encontrada com estes filtros.'
                : 'Você ainda não possui nenhuma Intent com pessoas configurada.'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Experimente criar sua primeira Intent adicionando guardiões para aprovação descentralizada
              e destinatários.
            </p>
          </div>
          {!isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="px-5 py-2.5 rounded-xl bg-[#0055FF] text-white text-xs font-bold hover:bg-[#0047E0] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Criar Intent com Pessoas & Guardiões</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredIntents.map((intent) => {
            const evalResult = evaluateIntentConditions(intent);
            const conditionType = intent.condition_type || 'NONE';
            const hasGuardians = evalResult.totalGuardians > 0;

            return (
              <div
                key={intent.id}
                id={`intent-card-${intent.id}`}
                className="bg-white rounded-2xl p-5 border border-[#DCE7F6] hover:border-[#94BFFF] hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {getStatusBadge(intent.status)}

                      {/* Condition Badge */}
                      {conditionType !== 'NONE' && (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            evalResult.isConditionSatisfied
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {evalResult.isConditionSatisfied ? (
                            <Unlock className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Lock className="w-3 h-3 text-amber-600" />
                          )}
                          <span>{evalResult.badgeLabel}</span>
                        </span>
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

                  {/* Etapa 7: Public Support Workflow on Card if condition is PUBLIC_SUPPORT */}
                  {conditionType === 'PUBLIC_SUPPORT' ? (
                    <div className="mt-3.5">
                      <PublicSupportWorkflow
                        intent={intent}
                        currentSupports={intent.current_supports ?? 10}
                        targetSupports={intent.target_supports ?? 100}
                        supporters={intent.supporters}
                        onAddSupport={(amount, name, comment) =>
                          handleUpdateSupportsOnIntent(
                            intent.id,
                            (intent.current_supports ?? 10) + amount,
                            name,
                            comment
                          )
                        }
                        onSetSupports={(val) => handleUpdateSupportsOnIntent(intent.id, val)}
                        onReveal={() => handleRevealIntent(intent)}
                        isRevealed={!!intent.revealed_at}
                        revealContent={intent.reveal_content}
                        variant="compact"
                      />
                    </div>
                  ) : evalResult.totalGuardians > 0 ? (
                    <div className="mt-3.5">
                      <ApprovalWorkflow
                        intent={intent}
                        participants={intent.participants || []}
                        requiredApprovals={intent.required_approvals || 2}
                        onToggleParticipantStatus={(participantId) =>
                          handleToggleParticipantStatusOnIntent(intent.id, participantId)
                        }
                        onReveal={() => handleRevealIntent(intent)}
                        isRevealed={!!intent.revealed_at}
                        revealContent={intent.reveal_content}
                        variant="compact"
                      />
                    </div>
                  ) : evalResult.totalParticipants > 0 ? (
                    <div className="mt-3.5 p-3 rounded-xl bg-[#F0F5FD] border border-[#DCE7F6] space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-[#0055FF]" />
                          <span className="font-semibold text-slate-700">
                            {evalResult.recipients.length} Destinatário(s)
                          </span>
                        </div>
                      </div>

                      {/* Small avatar row */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        {(intent.participants || []).slice(0, 4).map((p) => (
                          <div
                            key={p.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium bg-indigo-50 text-indigo-800 border border-indigo-200"
                            title={`${p.name} (${p.role})`}
                          >
                            <Send className="w-2.5 h-2.5 text-indigo-600" />
                            <span className="truncate max-w-[80px]">{p.name.split(' ')[0]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* Time Condition summary if configured */}
                  {(conditionType === 'TIME' || conditionType === 'HYBRID') && intent.target_date && (
                    <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-slate-600">
                        <Timer className="w-3 h-3 text-[#0055FF]" />
                        <span>Alvo: {formatTargetDateTime(intent.target_date)}</span>
                      </span>
                      <span className="font-mono font-bold text-amber-700">
                        {evalResult.timeResult.formattedCountdown}
                      </span>
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
                      title="Inspecionar Separação Arquitetural da Intent (Etapa 2)"
                      onClick={() => setInspectingIntent(intent)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5 text-blue-600" />
                      <span className="hidden sm:inline">Etapa 2</span>
                    </button>

                    <button
                      type="button"
                      title="Visualizar Detalhes, Pessoas e Assinaturas"
                      onClick={() => handleOpenDetails(intent)}
                      className="px-3 py-1.5 rounded-lg bg-[#F0F5FD] hover:bg-[#E2EDFF] text-[#0055FF] text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Abrir Detalhes</span>
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
        </>
      )}

      {/* Modal: View & Edit Intent Details (with full Etapa 5 Approval & Reveal support) */}
      {selectedIntent && (() => {
        const evalResult = evaluateIntentConditions(selectedIntent);
        const conditionType = selectedIntent.condition_type || 'NONE';

        return (
          <div
            id="intent-details-modal"
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#EAF2FF] text-[#0055FF] flex items-center justify-center font-bold">
                    {evalResult.isConditionSatisfied ? (
                      <Unlock className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Lock className="w-5 h-5 text-amber-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {isEditing ? 'Editar Intenção' : selectedIntent.title}
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
              <div className="space-y-5">
                {isEditing ? (
                  /* Edit Mode */
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Título</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-[#0055FF]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição</label>
                      <textarea
                        rows={3}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-[#0055FF]"
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

                    {/* Condition Type */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tipo de Trava / Condição
                      </label>
                      <select
                        value={editConditionType}
                        onChange={(e) => setEditConditionType(e.target.value as ConditionType)}
                        className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-[#0055FF]"
                      >
                        <option value="NONE">Sem Trava (Livre)</option>
                        <option value="TIME">Trava de Tempo (Etapa 3)</option>
                        <option value="PEOPLE">Pessoas & Guardiões (Etapa 4)</option>
                        <option value="HYBRID">Híbrido (Tempo + Guardiões)</option>
                      </select>
                    </div>

                    {/* Protected Content */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                        <span>Conteúdo Selado (Mensagem / Código):</span>
                        <Lock className="w-3.5 h-3.5 text-amber-600" />
                      </label>
                      <textarea
                        rows={2}
                        value={editRevealContent}
                        onChange={(e) => setEditRevealContent(e.target.value)}
                        className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-slate-800"
                      />
                    </div>

                    {/* People section in edit */}
                    <div className="p-4 bg-[#F0F5FD] rounded-2xl border border-[#DCE7F6]">
                      <ParticipantManager
                        participants={editParticipants}
                        onChange={setEditParticipants}
                        requiredApprovals={editRequiredApprovals}
                        onRequiredApprovalsChange={setEditRequiredApprovals}
                        canSimulateSignatures={true}
                      />
                    </div>
                  </div>
                ) : (
                  /* View Mode with Etapa 5 Workflow */
                  <div className="space-y-6">
                    {/* Status overview bar */}
                    <div className="flex items-center justify-between gap-2 p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(selectedIntent.status)}
                        <span className="text-xs text-slate-500 font-medium">
                          {selectedIntent.visibility === 'public' ? 'Pública' : 'Privada'}
                        </span>
                      </div>

                      <span className="text-xs text-slate-400">
                        Criada em {formatDate(selectedIntent.created_at)}
                      </span>
                    </div>

                    {/* Description */}
                    <div>
                      <h5 className="text-xs font-bold text-slate-700 mb-1">Descrição / Contexto:</h5>
                      <p className="text-sm text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed">
                        {selectedIntent.description || 'Nenhuma descrição adicionada.'}
                      </p>
                    </div>

                    {/* Etapa 7: Public Support Workflow in Modal */}
                    {conditionType === 'PUBLIC_SUPPORT' && (
                      <PublicSupportWorkflow
                        intent={selectedIntent}
                        currentSupports={selectedIntent.current_supports ?? 10}
                        targetSupports={selectedIntent.target_supports ?? 100}
                        supporters={selectedIntent.supporters}
                        onAddSupport={(amount, name, comment) =>
                          handleUpdateSupportsOnIntent(
                            selectedIntent.id,
                            (selectedIntent.current_supports ?? 10) + amount,
                            name,
                            comment
                          )
                        }
                        onSetSupports={(val) => handleUpdateSupportsOnIntent(selectedIntent.id, val)}
                        onReveal={() => handleRevealIntent(selectedIntent)}
                        isRevealed={!!selectedIntent.revealed_at}
                        revealContent={selectedIntent.reveal_content}
                        variant="full"
                      />
                    )}

                    {/* Etapa 5: Full Approval Workflow Component */}
                    <ApprovalWorkflow
                      intent={selectedIntent}
                      participants={selectedIntent.participants || []}
                      requiredApprovals={selectedIntent.required_approvals || 2}
                      onToggleParticipantStatus={(participantId) =>
                        handleToggleParticipantStatusOnIntent(selectedIntent.id, participantId)
                      }
                      onReveal={() => handleRevealIntent(selectedIntent)}
                      isRevealed={!!selectedIntent.revealed_at}
                      revealContent={selectedIntent.reveal_content}
                      variant="full"
                    />

                    {/* Etapa 6: Protected Content Vault Pipeline */}
                    <ProtectedVaultPipeline
                      intent={selectedIntent}
                      isConditionSatisfied={evalResult.isConditionSatisfied}
                      onPayloadEncrypted={async (payload) => {
                        const updatedIntent: Intent = {
                          ...selectedIntent,
                          protected_payload: payload,
                        };
                        setSelectedIntent(updatedIntent);
                        const updatedIntents = intents.map((i) =>
                          i.id === selectedIntent.id ? updatedIntent : i
                        );
                        setIntents(updatedIntents);
                        saveLocalIntents(updatedIntents);

                        // Persist to Firestore if synced
                        const isFirebase = !!auth.currentUser && !selectedIntent.id.startsWith('intent-');
                        if (isFirebase) {
                          try {
                            await updateDoc(doc(db, 'intents', selectedIntent.id), {
                              protected_payload: payload,
                            });
                          } catch (e) {
                            console.error('Failed to sync encrypted payload to Firestore:', e);
                          }
                        }
                      }}
                    />

                    {/* Etapa 8: Histórico & Camada Social */}
                    <SocialHistoryWorkflow
                      intent={selectedIntent}
                      onAddInteraction={(intentId, interaction) =>
                        handleAddSocialInteractionOnIntent(intentId, interaction)
                      }
                      variant="interactive_hero"
                    />

                    {/* Participant Configuration Manager */}
                    <div className="p-4 bg-[#F0F5FD] rounded-2xl border border-[#DCE7F6] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-[#0055FF]" />
                          <span>Gerenciar Participantes & Guardiões</span>
                        </span>
                      </div>

                      <ParticipantManager
                        participants={selectedIntent.participants || []}
                        onChange={handleUpdateParticipantsOnIntent}
                        requiredApprovals={selectedIntent.required_approvals}
                        canSimulateSignatures={true}
                        isReadOnly={false}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleSaveEdit}
                      className="px-5 py-2 rounded-xl bg-[#0055FF] text-white text-xs font-bold hover:bg-[#0047E0] transition-colors"
                    >
                      {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(selectedIntent.id)}
                      className="px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
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

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h4 className="text-base font-bold text-slate-900">Excluir esta Intenção?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Esta ação removerá a intent e desvinculará todos os guardiões e destinatários
                associados. Esta operação não pode ser desfeita.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDeleteIntent(deleteConfirmId)}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Etapa 2 — Intent Conceptual Architecture Inspector */}
      <IntentStructureModal
        isOpen={!!inspectingIntent}
        intent={inspectingIntent}
        onClose={() => setInspectingIntent(null)}
      />
    </div>
  );
}
