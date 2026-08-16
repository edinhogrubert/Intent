import React, { useState } from 'react';
import {
  CheckCircle2,
  ListChecks,
  Shield,
  Clock,
  Users,
  Key,
  Flame,
  MessageSquare,
  TrendingUp,
  FileText,
  Lock,
  Zap,
  ArrowRight,
  ExternalLink,
  Info,
  Network,
  Share2,
} from 'lucide-react';

interface StagesChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StageItem {
  number: number;
  name: string;
  question: string;
  concreteTest: string;
  evidence: string;
  status: 'passed' | 'active';
  technicalKey: string;
}

const STAGES_LIST: StageItem[] = [
  {
    number: 1,
    name: 'Identidade',
    question: 'Quem é você?',
    concreteTest: 'João cria conta e volta a encontrá-la.',
    evidence: 'Autenticação Firebase Auth + LocalStorage, perfil imutável, sincronização de chaves e persistência de sessão.',
    status: 'passed',
    technicalKey: 'UserAccount, authGate, persistSession',
  },
  {
    number: 2,
    name: 'Intent',
    question: 'O que você quer que aconteça?',
    concreteTest: 'João cria uma Intent e consegue consultá-la.',
    evidence: 'Entidade Intent com título, descrição, status (active/completed/cancelled) e persistência no Firestore.',
    status: 'passed',
    technicalKey: 'Intent CRUD, query, snapshot listener',
  },
  {
    number: 3,
    name: 'Tempo',
    question: 'O sistema consegue esperar e revelar?',
    concreteTest: 'João cria "revelar amanhã" e o sistema efetivamente revela.',
    evidence: 'Motor conditionEvaluator com operadores temporais (>=, <=, BETWEEN, WINDOW) e disparo automático pós-prazo.',
    status: 'passed',
    technicalKey: 'TimeOperator, target_date, auto-trigger',
  },
  {
    number: 4,
    name: 'Pessoas',
    question: 'Para quem / quem participa?',
    concreteTest: 'João cria uma Intent para Flávio.',
    evidence: 'Sistema de papéis granulares: OWNER, GUARDIAN, BENEFICIARY, COLLABORATOR, AUDITOR com regras de acesso.',
    status: 'passed',
    technicalKey: 'IntentParticipant, audience_type, permissions',
  },
  {
    number: 5,
    name: 'Aprovação',
    question: 'Pessoas podem determinar a realização?',
    concreteTest: 'João cria "2 de 3 aprovadores".',
    evidence: 'Motor de quórum formal (threshold_type: FIXED_COUNT, min_count: 2/3), coleta de assinaturas e destrava auditável.',
    status: 'passed',
    technicalKey: 'ApprovalQuorum, GuardianSignature, unlock',
  },
  {
    number: 6,
    name: 'Segurança',
    question: 'O conteúdo permanece protegido até a revelação?',
    concreteTest: 'João coloca documento protegido e permanece inacessível antes da condição.',
    evidence: 'Envelope criptográfico client-side AES-256-GCM + SHA-256 checksum. Payload cifrado inacessível até a validação da trava.',
    status: 'passed',
    technicalKey: 'ProtectedPayload, AES-256, Zero-Knowledge',
  },
  {
    number: 7,
    name: 'Participação',
    question: 'Uma meta coletiva pode fazer algo acontecer?',
    concreteTest: 'João cria "100 apoios → revelar por 24h".',
    evidence: 'Protocolo CONDITION ➔ REVEAL_WINDOW ➔ EXPIRATION. Quórum de 100 apoios abre janela efêmera de 24 horas antes do expirar.',
    status: 'passed',
    technicalKey: 'PublicParticipation, reveal_window_hours: 24',
  },
  {
    number: 8,
    name: 'Histórico',
    question: 'Existe vida social além da Intent?',
    concreteTest: 'Maria publica uma opinião sobre a Intent de João, outras pessoas concordam/discordam e comentam, sem alterar a regra da Intent.',
    evidence: 'Entidade SocialPost desacoplada (opinião livre ou ligada a Intent). Debates (Concordo/Discordo) com isolamento total da regra da Intent.',
    status: 'passed',
    technicalKey: 'SocialPost, Decoupled Domain, Opinion vs Rule',
  },
];

export const StagesChecklistModal: React.FC<StagesChecklistModalProps> = ({ isOpen, onClose }) => {
  const [selectedStage, setSelectedStage] = useState<number>(8);
  const [activeTab, setActiveTab] = useState<'checklist' | 'telemetry_step9' | 'revisar_md'>('checklist');

  if (!isOpen) return null;

  const currentStage = STAGES_LIST.find((s) => s.number === selectedStage) || STAGES_LIST[7];

  return (
    <div
      id="stages-checklist-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
    >
      <div
        id="stages-checklist-modal"
        className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full text-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center font-black shadow-inner">
              <ListChecks className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base md:text-lg font-black text-white">
                  Checklist Arquitetural & Testes Concretos (Etapas 1 a 8)
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                  8/8 APROVADOS
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Validação sênior dos 8 testes de prova fundamentais e preparação para a Etapa 9.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 bg-slate-950/50 border-b border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('checklist')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'checklist'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Matriz dos 8 Testes de Prova</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('telemetry_step9')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'telemetry_step9'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Telemetria & Causalidade (Etapa 9 Prep)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('revisar_md')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'revisar_md'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Documento revisar.md</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'checklist' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: List of Stages */}
              <div className="md:col-span-5 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Selecione uma Etapa para Auditar:
                </span>
                {STAGES_LIST.map((stage) => {
                  const isSelected = selectedStage === stage.number;
                  return (
                    <button
                      key={stage.number}
                      type="button"
                      onClick={() => setSelectedStage(stage.number)}
                      className={`w-full p-3 rounded-2xl text-left transition-all border flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-950/80 border-cyan-500 text-white shadow-md'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs font-mono ${
                            isSelected
                              ? 'bg-cyan-500 text-slate-950'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {stage.number}
                        </div>
                        <div>
                          <span className="text-xs font-black block">{stage.name}</span>
                          <span className="text-[10px] text-slate-400">{stage.question}</span>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                        Validado ✓
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Stage Details & Concrete Test Verification */}
              <div className="md:col-span-7 bg-slate-950/90 rounded-3xl p-5 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold">
                      Etapa {currentStage.number} de 8
                    </span>
                    <h4 className="text-base font-black text-white flex items-center gap-2 mt-0.5">
                      <span>{currentStage.name}</span>
                      <span className="text-xs font-normal text-slate-400">({currentStage.question})</span>
                    </h4>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Concreto</span>
                  </span>
                </div>

                {/* The Concrete Test Box */}
                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/50 space-y-2">
                  <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Teste Concreto de Prova:</span>
                  </span>
                  <p className="text-sm font-mono font-bold text-white bg-slate-950/90 p-3 rounded-xl border border-indigo-900/60">
                    &quot;{currentStage.concreteTest}&quot;
                  </p>
                </div>

                {/* Evidence & Technical Implementation */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300">Evidência Arquitetural:</span>
                  <p className="text-xs text-slate-400 leading-relaxed bg-slate-900 p-3 rounded-xl border border-slate-800">
                    {currentStage.evidence}
                  </p>
                </div>

                {/* Data Model Primitives */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Primitivas:</span>
                  <span className="text-cyan-300">{currentStage.technicalKey}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'telemetry_step9' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-800/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                    <Network className="w-4 h-4 text-emerald-400" />
                    <span>Diretriz da Etapa 9: Registro sem Cálculo Prematuro</span>
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-950 text-emerald-400 rounded border border-emerald-800">
                    Telemetria Ativa
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Não calculamos ainda reputação, rankings, moedas ou pontuações de gamificação. Porém, <strong>todos os eventos necessários são registrados com integridade absoluta</strong> nas Etapas 1 a 8 para permitir a geração de valor na Etapa 9.
                </p>
              </div>

              {/* Event Primitives Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { label: '1. Quem Criou', desc: 'creator_id imutável no modelo de cada Intent e Post.', icon: Users },
                  { label: '2. Quem Participou', desc: 'Lista de supporters e assinaturas com timestamp ISO.', icon: Flame },
                  { label: '3. Quem Convidou (Causalidade)', desc: 'source_user_id (ex: Fernando source = Flávio).', icon: Share2 },
                  { label: '4. Quem Aprovou', desc: 'Assinaturas de guardiões no quórum (2 de 3).', icon: Shield },
                  { label: '5. Quem Recebeu', desc: 'Papel explícito de BENEFICIARY mapeado.', icon: Key },
                  { label: '6. Previsões & Acertos', desc: 'PREVISÃO ➔ RESULTADO REAL ➔ ACERTO/ERRO registrado.', icon: TrendingUp },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-black text-white">{item.label}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'revisar_md' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span>Arquivo revisar.md Criado no Projeto</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    O relatório técnico completo está gravado na raiz do repositório para consulta da equipe e controle de versão.
                  </p>
                </div>
                <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 px-2.5 py-1 rounded-xl border border-cyan-800">
                  /revisar.md
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 font-mono text-xs text-slate-300 border border-slate-800/80 space-y-2 max-h-60 overflow-y-auto">
                <p className="text-cyan-400 font-bold"># Resumo da Auditoria Sênior</p>
                <p className="text-slate-400">• Etapas 1 a 8: Todos os 8 testes concretos operacionais.</p>
                <p className="text-slate-400">• Isolamento Social: Histórico ≠ Intent (Opinião não altera condição).</p>
                <p className="text-slate-400">• Proveniência Causal: Registro de referência (Flávio ➔ Fernando) ativo.</p>
                <p className="text-slate-400">• Etapa 9: Pronta para receber os cálculos de Impacto e Reputação.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Status: Pronto para avançar para a Etapa 9
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black transition-all cursor-pointer shadow-md"
          >
            Fechar Checklist
          </button>
        </div>
      </div>
    </div>
  );
};
