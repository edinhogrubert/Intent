import React, { useState, useEffect } from 'react';
import {
  FileText,
  Lock,
  Unlock,
  Cpu,
  Database,
  CheckCircle2,
  Upload,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  Download,
} from 'lucide-react';
import {
  ProtectedPayload,
  encryptPayload,
  decryptPayload,
  readFileAsTextOrDataUrl,
  SAMPLE_PROTECTED_FILES,
} from '../utils/cryptoVault';
import { Intent } from '../types';
import { evaluateIntentConditions } from '../utils/conditionEvaluator';
import { DevInspectorBadge } from './DevInspectorBadge';

interface ProtectedVaultPipelineProps {
  intent?: Intent;
  isConditionSatisfied?: boolean;
  onPayloadEncrypted?: (payload: ProtectedPayload) => void;
  onPayloadDecrypted?: (decryptedText: string) => void;
  variant?: 'full_pipeline' | 'compact_card' | 'uploader_only';
}

export function ProtectedVaultPipeline({
  intent,
  isConditionSatisfied = true,
  onPayloadEncrypted,
  onPayloadDecrypted,
  variant = 'full_pipeline',
}: ProtectedVaultPipelineProps) {
  const [inputFileName, setInputFileName] = useState<string>(
    intent?.protected_payload?.fileName || SAMPLE_PROTECTED_FILES[0].name
  );
  const [inputFileType, setInputFileType] = useState<string>(
    intent?.protected_payload?.fileType || SAMPLE_PROTECTED_FILES[0].type
  );
  const [inputFileSize, setInputFileSize] = useState<number>(
    intent?.protected_payload?.fileSize || SAMPLE_PROTECTED_FILES[0].size
  );
  const [rawContent, setRawContent] = useState<string>(
    intent?.reveal_content || SAMPLE_PROTECTED_FILES[0].content
  );

  const [payload, setPayload] = useState<ProtectedPayload | null>(
    (intent?.protected_payload as ProtectedPayload) || null
  );
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedResult, setDecryptedResult] = useState<string | null>(
    intent?.revealed_at && intent?.reveal_content ? intent.reveal_content : null
  );
  const [integrityVerified, setIntegrityVerified] = useState<boolean | null>(
    intent?.revealed_at ? true : null
  );
  const [recalculatedHash, setRecalculatedHash] = useState<string | null>(null);
  const [activePipelineStep, setActivePipelineStep] = useState<number>(
    payload ? (decryptedResult ? 5 : 3) : 1
  );
  const [copied, setCopied] = useState(false);
  const [passphrase] = useState<string>('INTENT_VAULT_DEFAULT_SECRET_KEY_2026');
  const [simulatedConditionOverride, setSimulatedConditionOverride] = useState<boolean | null>(null);

  const condEval = intent ? evaluateIntentConditions(intent) : null;
  const effectiveConditionSatisfied =
    simulatedConditionOverride !== null
      ? simulatedConditionOverride
      : condEval
      ? condEval.isConditionSatisfied
      : isConditionSatisfied;

  const lastLoadedIntentIdRef = React.useRef<string | null>(null);

  useEffect(() => {
    if (intent && intent.id !== lastLoadedIntentIdRef.current) {
      lastLoadedIntentIdRef.current = intent.id;
      if (intent.protected_payload) {
        setPayload(intent.protected_payload as ProtectedPayload);
        setInputFileName(intent.protected_payload.fileName || 'arquivo_protegido.txt');
        setInputFileType(intent.protected_payload.fileType || 'text/plain');
        setInputFileSize(intent.protected_payload.fileSize || 1024);
        setActivePipelineStep(intent.revealed_at ? 5 : 3);
      }
      if (intent.revealed_at && intent.reveal_content) {
        setDecryptedResult(intent.reveal_content);
        setIntegrityVerified(true);
      }
    }
  }, [intent]);

  const handleSelectPreset = (preset: (typeof SAMPLE_PROTECTED_FILES)[0]) => {
    setInputFileName(preset.name);
    setInputFileType(preset.type);
    setInputFileSize(preset.size);
    setRawContent(preset.content);
    setPayload(null);
    setDecryptedResult(null);
    setIntegrityVerified(null);
    setActivePipelineStep(1);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setInputFileName(file.name);
    setInputFileType(file.type || 'text/plain');
    setInputFileSize(file.size);

    const result = await readFileAsTextOrDataUrl(file);
    setRawContent(result.content);
    setPayload(null);
    setDecryptedResult(null);
    setIntegrityVerified(null);
    setActivePipelineStep(1);
  };

  const handleRunEncryption = async () => {
    if (!rawContent) return;
    setIsEncrypting(true);
    try {
      const encPayload = await encryptPayload(
        rawContent,
        inputFileName,
        inputFileType,
        passphrase
      );
      setPayload(encPayload);
      setActivePipelineStep(3);
      if (onPayloadEncrypted) {
        onPayloadEncrypted(encPayload);
      }
    } catch (err) {
      console.error('Encryption failed:', err);
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleRunDecryption = async () => {
    if (!payload) return;
    setIsDecrypting(true);
    try {
      const decResult = await decryptPayload(payload, passphrase);
      setDecryptedResult(decResult.decryptedText);
      setIntegrityVerified(decResult.isIntegrityValid);
      setRecalculatedHash(decResult.recalculatedHash);
      setActivePipelineStep(5);
      if (onPayloadDecrypted) {
        onPayloadDecrypted(decResult.decryptedText);
      }
    } catch (err) {
      console.error('Decryption failed:', err);
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleCopyDecrypted = () => {
    if (decryptedResult) {
      navigator.clipboard.writeText(decryptedResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (variant === 'compact_card') {
    return (
      <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200 shadow-2xs space-y-2 relative">
        <DevInspectorBadge
          file="src/components/ProtectedVaultPipeline.tsx"
          functionName="ProtectedVaultPipeline (compact)"
          className="mb-1"
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#0055FF]" />
            <span className="text-xs font-bold text-slate-800">
              Etapa 6 — Cofre AES-256
            </span>
          </div>
          <span
            className={`font-mono text-xs font-bold px-2 py-0.5 rounded-full ${
              payload ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {payload ? 'Protegido ✓' : 'Pendente'}
          </span>
        </div>
        <div className="text-[11px] font-mono text-slate-500 truncate">
          {inputFileName} • {(inputFileSize / 1024).toFixed(1)} KB
        </div>
      </div>
    );
  }

  return (
    <div
      id="protected-vault-pipeline"
      className="p-6 md:p-8 rounded-3xl bg-white text-slate-800 border border-[#DCE7F6] shadow-xs space-y-6 relative"
    >
      <DevInspectorBadge
        file="src/components/ProtectedVaultPipeline.tsx"
        functionName="ProtectedVaultPipeline"
        className="mb-1"
      />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#EAF2FF] text-[#0055FF] flex items-center justify-center font-bold shadow-2xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#0055FF] bg-[#EAF2FF] px-2.5 py-0.5 rounded-full">
                Etapa 6 — Conteúdo Protegido
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                AES-256-GCM Vault
              </span>
            </div>
            <h3 className="text-lg md:text-xl font-black text-slate-900 mt-0.5 tracking-tight">
              Pipeline de Criptografia, Armazenamento & Revelação
            </h3>
          </div>
        </div>

        {payload && (
          <button
            type="button"
            onClick={() => {
              setPayload(null);
              setDecryptedResult(null);
              setActivePipelineStep(1);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reiniciar Pipeline</span>
          </button>
        )}
      </div>

      {/* 5-Step Visual Stepper */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 p-3 rounded-2xl bg-[#F8FAFC] border border-slate-200">
        {[
          { num: 1, label: '1. Arquivo', icon: FileText, desc: 'Entrada de dados' },
          { num: 2, label: '2. Criptografia', icon: Cpu, desc: 'AES-256-GCM' },
          { num: 3, label: '3. Armazenamento', icon: Database, desc: 'Cofre Selado' },
          { num: 4, label: '4. Condição', icon: CheckCircle2, desc: isConditionSatisfied ? 'Satisfeita ✓' : 'Pendente' },
          { num: 5, label: '5. Revelação', icon: Unlock, desc: 'Descriptografia' },
        ].map((step) => {
          const StepIcon = step.icon;
          const isActive = activePipelineStep === step.num;
          const isPassed = activePipelineStep > step.num;

          return (
            <button
              key={step.num}
              type="button"
              onClick={() => setActivePipelineStep(step.num)}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                isActive
                  ? 'bg-[#EAF2FF] border-[#0055FF] text-[#0055FF]'
                  : isPassed
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-white border-slate-200 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold">
                  {step.num <= 4 ? 'ETAPA' : 'FINAL'}
                </span>
                <StepIcon className="w-4 h-4" />
              </div>
              <div className="mt-2">
                <p className="text-xs font-bold truncate">
                  {step.label}
                </p>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">{step.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase">
                <FileText className="w-4 h-4 text-[#0055FF]" />
                <span>1. Arquivo ou Mensagem Secreta</span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {(inputFileSize / 1024).toFixed(1)} KB
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-[10px] text-slate-500 font-bold shrink-0">Modelos:</span>
              {SAMPLE_PROTECTED_FILES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                    inputFileName === preset.name
                      ? 'bg-[#0055FF] text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {preset.name.split('_')[0]}
                </button>
              ))}
            </div>

            <div>
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                id="vault-file-input"
              />
              <label
                htmlFor="vault-file-input"
                className="w-full p-2.5 rounded-xl bg-white border border-dashed border-slate-300 hover:border-[#0055FF] text-slate-600 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Upload className="w-4 h-4 text-[#0055FF]" />
                <span>Carregar Arquivo Local</span>
              </label>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Conteúdo do Arquivo:</label>
              <textarea
                value={rawContent}
                onChange={(e) => {
                  setRawContent(e.target.value);
                  setPayload(null);
                  setDecryptedResult(null);
                  setActivePipelineStep(1);
                }}
                rows={3}
                placeholder="Insira o texto confidencial..."
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-mono resize-none focus:outline-hidden focus:ring-2 focus:ring-[#0055FF]"
              />
            </div>

            <button
              type="button"
              disabled={!rawContent || isEncrypting || !!payload}
              onClick={handleRunEncryption}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                payload
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                  : 'bg-[#0055FF] hover:bg-[#0047E0] text-white shadow-xs'
              }`}
            >
              {isEncrypting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Executando AES-256...</span>
                </>
              ) : payload ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>2. Criptografia AES-256 Concluída ✓</span>
                </>
              ) : (
                <>
                  <Cpu className="w-4 h-4" />
                  <span>Criptografar AES-256 →</span>
                </>
              )}
            </button>
          </div>

          {payload && (
            <div className="p-4 rounded-2xl bg-[#EAF2FF] border border-[#BFD7FE] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0055FF] flex items-center gap-1.5 uppercase">
                  <Lock className="w-3.5 h-3.5" />
                  <span>3. Envelope Criptográfico</span>
                </span>
                <span className="text-[10px] font-mono bg-white text-[#0055FF] border border-[#BFD7FE] px-2 py-0.5 rounded-md font-bold">
                  {payload.cipherAlg}
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 font-mono text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span>SHA-256 Content Hash:</span>
                  <span className="text-emerald-700 font-bold truncate max-w-[180px]">
                    {payload.content_hash || payload.fingerprint}
                  </span>
                </div>
                <div className="pt-1 border-t border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Encrypted Blob:</span>
                  <p className="text-[10px] text-slate-500 break-all bg-[#F8FAFC] p-2 rounded-lg max-h-12 overflow-y-auto">
                    {payload.cipherText}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                <span>4. Checagem de Condição</span>
              </span>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  effectiveConditionSatisfied
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {effectiveConditionSatisfied ? '✓ Satisfeita' : '⏳ Aguardando'}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {condEval
                ? condEval.statusSummary
                : effectiveConditionSatisfied
                ? 'Condição satisfeita. Descriptografia e revelação autorizadas pelo protocolo.'
                : 'O conteúdo permanece criptografado no cofre até que a condição seja cumprida.'}
            </p>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() =>
                  setSimulatedConditionOverride((prev) => (prev === true ? null : true))
                }
                className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 inline mr-1" />
                <span>
                  {simulatedConditionOverride === true
                    ? 'Simulação Ativa (Restaurar)'
                    : 'Simular Condição Cumprida'}
                </span>
              </button>
            </div>

            <button
              type="button"
              disabled={!payload || !effectiveConditionSatisfied || isDecrypting || !!decryptedResult}
              onClick={handleRunDecryption}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                decryptedResult
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                  : effectiveConditionSatisfied && payload
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              }`}
            >
              {isDecrypting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Descriptografando...</span>
                </>
              ) : decryptedResult ? (
                <>
                  <Unlock className="w-4 h-4 text-emerald-600" />
                  <span>5. Revelação Concluída ✓</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Descriptografar & Revelar →</span>
                </>
              )}
            </button>
          </div>

          {decryptedResult ? (
            <div className="p-4 rounded-2xl bg-white border border-emerald-300 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold text-emerald-900 uppercase">
                  5. Conteúdo Descriptografado
                </h5>
                <button
                  type="button"
                  onClick={handleCopyDecrypted}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold cursor-pointer"
                >
                  {copied ? 'Copiado' : 'Copiar'}
                </button>
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-200 text-xs font-mono text-slate-800 max-h-36 overflow-y-auto leading-relaxed">
                {decryptedResult}
              </div>

              <a
                href={
                  decryptedResult.startsWith('data:')
                    ? decryptedResult
                    : `data:${inputFileType || 'text/plain'};charset=utf-8,${encodeURIComponent(decryptedResult)}`
                }
                download={inputFileName || 'arquivo_revelado.txt'}
                className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar {inputFileName}</span>
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
