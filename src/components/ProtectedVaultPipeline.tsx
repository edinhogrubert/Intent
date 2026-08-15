import React, { useState, useEffect } from 'react';
import {
  FileText,
  Lock,
  Unlock,
  ShieldAlert,
  Cpu,
  Database,
  CheckCircle2,
  KeyRound,
  Download,
  Upload,
  Sparkles,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Eye,
  FileCheck,
  Copy,
  Check,
  Layers,
  AlertCircle,
} from 'lucide-react';
import {
  ProtectedPayload,
  encryptPayload,
  decryptPayload,
  readFileAsTextOrDataUrl,
  SAMPLE_PROTECTED_FILES,
} from '../utils/cryptoVault';
import { Intent } from '../types';

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
  // Input File / Raw Text State
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

  // Pipeline Engine State
  const [payload, setPayload] = useState<ProtectedPayload | null>(
    intent?.protected_payload as ProtectedPayload || null
  );
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedResult, setDecryptedResult] = useState<string | null>(
    intent?.revealed_at && intent?.reveal_content ? intent.reveal_content : null
  );
  const [activePipelineStep, setActivePipelineStep] = useState<number>(
    payload ? (decryptedResult ? 5 : 3) : 1
  );
  const [copied, setCopied] = useState(false);
  const [passphrase, setPassphrase] = useState<string>('INTENT_VAULT_DEFAULT_SECRET_KEY_2026');

  // Sync if intent changes
  useEffect(() => {
    if (intent?.protected_payload) {
      setPayload(intent.protected_payload as ProtectedPayload);
      if (intent.revealed_at && intent.reveal_content) {
        setDecryptedResult(intent.reveal_content);
        setActivePipelineStep(5);
      } else {
        setActivePipelineStep(3);
      }
    }
  }, [intent]);

  // Step 1 -> Step 2 -> Step 3: Trigger Real AES-256 Encryption
  const handleRunEncryption = async () => {
    if (!rawContent) return;
    setIsEncrypting(true);
    setActivePipelineStep(2);

    try {
      const encResult = await encryptPayload(
        rawContent,
        inputFileName,
        inputFileType,
        passphrase
      );

      setTimeout(() => {
        setPayload(encResult);
        setIsEncrypting(false);
        setActivePipelineStep(3); // Armazenamento
        if (onPayloadEncrypted) {
          onPayloadEncrypted(encResult);
        }
      }, 600);
    } catch (err) {
      console.error(err);
      setIsEncrypting(false);
    }
  };

  // Step 4 -> Step 5: Trigger Decryption upon Condition Satisfaction
  const handleRunDecryption = async () => {
    if (!payload) return;
    setIsDecrypting(true);
    setActivePipelineStep(4);

    try {
      const decText = await decryptPayload(payload, passphrase);
      setTimeout(() => {
        setDecryptedResult(decText);
        setIsDecrypting(false);
        setActivePipelineStep(5); // Descriptografia/revelação autorizada
        if (onPayloadDecrypted) {
          onPayloadDecrypted(decText);
        }
      }, 700);
    } catch (err) {
      console.error(err);
      setIsDecrypting(false);
    }
  };

  // Custom file upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await readFileAsTextOrDataUrl(file);
      setInputFileName(res.name);
      setInputFileType(res.type);
      setInputFileSize(res.size);
      setRawContent(res.content);
      setDecryptedResult(null);
      setPayload(null);
      setActivePipelineStep(1);
    } catch (err) {
      console.error('File read error:', err);
    }
  };

  // Preset file selection
  const handleSelectPreset = (preset: typeof SAMPLE_PROTECTED_FILES[0]) => {
    setInputFileName(preset.name);
    setInputFileType(preset.type);
    setInputFileSize(preset.size);
    setRawContent(preset.content);
    setDecryptedResult(null);
    setPayload(null);
    setActivePipelineStep(1);
  };

  const handleCopyDecrypted = () => {
    if (!decryptedResult) return;
    navigator.clipboard.writeText(decryptedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Compact Card View (For list items or summary cards)
  if (variant === 'compact_card') {
    return (
      <div className="p-4 rounded-2xl bg-[#0F172A] text-white border border-slate-800 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#38BDF8]" />
            <span className="text-xs font-bold text-slate-200">
              Etapa 6 — Conteúdo Criptografado
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold bg-slate-800 text-[#38BDF8] px-2.5 py-0.5 rounded-full border border-slate-700">
            {payload?.cipherAlg || 'AES-256-GCM'}
          </span>
        </div>

        {/* File pill */}
        <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-200 truncate">{inputFileName}</p>
              <p className="text-[10px] text-slate-500 font-mono">
                {payload ? `Hash: ${payload.fingerprint}` : `${(inputFileSize / 1024).toFixed(1)} KB`}
              </p>
            </div>
          </div>
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md shrink-0 ${
            decryptedResult
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : payload
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'bg-slate-800 text-slate-400'
          }`}>
            {decryptedResult ? '✓ REVELADO' : payload ? '🔒 CRIPTOGRAFADO' : '📝 EM MÃO'}
          </span>
        </div>

        {/* Single Line Flow Indicator */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
          <span className={activePipelineStep >= 1 ? 'text-blue-400 font-bold' : ''}>Arquivo</span>
          <span>→</span>
          <span className={activePipelineStep >= 2 ? 'text-indigo-400 font-bold' : ''}>Criptografia</span>
          <span>→</span>
          <span className={activePipelineStep >= 3 ? 'text-purple-400 font-bold' : ''}>Armazenamento</span>
          <span>→</span>
          <span className={isConditionSatisfied ? 'text-emerald-400 font-bold' : 'text-slate-500'}>Condição</span>
          <span>→</span>
          <span className={activePipelineStep >= 5 ? 'text-emerald-300 font-black' : ''}>Revelação</span>
        </div>
      </div>
    );
  }

  // Full Pipeline Display
  return (
    <div
      id="protected-vault-pipeline"
      className="p-5 md:p-6 rounded-3xl bg-slate-950 text-slate-100 border-2 border-slate-800 shadow-xl space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0055FF] to-[#38BDF8] text-white flex items-center justify-center font-black shadow-lg shadow-blue-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#38BDF8] bg-blue-950/60 border border-blue-800/50 px-2.5 py-0.5 rounded-full">
                Etapa 6 — Conteúdo Protegido
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                AES-256-GCM Vault
              </span>
            </div>
            <h3 className="text-lg md:text-xl font-black text-white mt-0.5 tracking-tight">
              Pipeline de Criptografia, Armazenamento & Revelação
            </h3>
          </div>
        </div>

        {/* Quick Reset or Status Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {payload && (
            <button
              type="button"
              onClick={() => {
                setPayload(null);
                setDecryptedResult(null);
                setActivePipelineStep(1);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reiniciar Pipeline</span>
            </button>
          )}
        </div>
      </div>

      {/* 5-Step Visual Pipeline Stepper: Arquivo ➔ Criptografia ➔ Armazenamento ➔ Condição ➔ Descriptografia */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80">
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
            <div
              key={step.num}
              className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-blue-950/80 border-[#0055FF] shadow-md shadow-blue-500/10 ring-1 ring-[#0055FF]'
                  : isPassed
                  ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-200'
                  : 'bg-slate-900/40 border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono font-black ${
                  isActive ? 'text-[#38BDF8]' : isPassed ? 'text-emerald-400' : 'text-slate-600'
                }`}>
                  {step.num <= 4 ? 'ETAPA' : 'FINAL'}
                </span>
                <StepIcon className={`w-4 h-4 ${
                  isActive ? 'text-[#38BDF8] animate-pulse' : isPassed ? 'text-emerald-400' : 'text-slate-600'
                }`} />
              </div>
              <div className="mt-2">
                <p className={`text-xs font-black truncate ${
                  isActive ? 'text-white' : isPassed ? 'text-emerald-300' : 'text-slate-400'
                }`}>
                  {step.label}
                </p>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Interactive Stage Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Stage 1 (Arquivo) & Stage 2 (Criptografia) */}
        <div className="space-y-4">
          
          {/* Stage 1: Arquivo Input */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#38BDF8] flex items-center gap-1.5 uppercase tracking-wider">
                <FileText className="w-4 h-4 text-[#38BDF8]" />
                <span>1. Arquivo ou Mensagem Secreta</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {(inputFileSize / 1024).toFixed(1)} KB
              </span>
            </div>

            {/* Presets buttons */}
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
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {preset.name.split('_')[0]}
                </button>
              ))}
            </div>

            {/* Custom file upload input */}
            <div className="relative">
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                id="vault-file-input"
              />
              <label
                htmlFor="vault-file-input"
                className="w-full p-3 rounded-xl bg-slate-950 border border-dashed border-slate-700 hover:border-[#0055FF] text-slate-400 hover:text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Upload className="w-4 h-4 text-[#38BDF8]" />
                <span>Carregar Arquivo do Computador</span>
              </label>
            </div>

            {/* Raw Text / Secret Content Field */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400">Conteúdo do Arquivo:</label>
              <textarea
                value={rawContent}
                onChange={(e) => {
                  setRawContent(e.target.value);
                  setPayload(null);
                  setDecryptedResult(null);
                  setActivePipelineStep(1);
                }}
                rows={3}
                placeholder="Insira o texto do arquivo, chave privada ou mensagem confidencial..."
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-[#0055FF] resize-none"
              />
            </div>

            {/* Encryption Action Trigger */}
            <button
              type="button"
              disabled={!rawContent || isEncrypting || !!payload}
              onClick={handleRunEncryption}
              className={`w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                payload
                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 cursor-default'
                  : 'bg-[#0055FF] hover:bg-[#0047E0] text-white shadow-lg shadow-blue-500/20 active:scale-98'
              }`}
            >
              {isEncrypting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#38BDF8]" />
                  <span>Executando Criptografia AES-256...</span>
                </>
              ) : payload ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>2. Criptografia AES-256 Concluída ✓</span>
                </>
              ) : (
                <>
                  <Cpu className="w-4 h-4 text-cyan-300" />
                  <span>Executar Criptografia AES-256 →</span>
                </>
              )}
            </button>
          </div>

          {/* Stage 2 & 3: Details of Encrypted Cipher Payload */}
          {payload && (
            <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-800/60 space-y-2.5 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-cyan-300 flex items-center gap-1.5 uppercase">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>3. Armazenado no Cofre Criptografado</span>
                </span>
                <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/50 px-2 py-0.5 rounded-md">
                  {payload.cipherAlg}
                </span>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>SHA-256 Fingerprint:</span>
                  <span className="text-cyan-300 font-bold">{payload.fingerprint}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>IV (Nonce):</span>
                  <span className="text-slate-300">{payload.iv}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Salt Derivado:</span>
                  <span className="text-slate-300">{payload.salt.slice(0, 16)}...</span>
                </div>
                <div className="pt-1 border-t border-slate-800">
                  <span className="text-slate-500 block mb-0.5">Ciphertext Base64/Hex Payload:</span>
                  <p className="text-[10px] text-slate-400 break-all bg-slate-900 p-2 rounded-lg max-h-16 overflow-y-auto">
                    {payload.cipherText}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Stage 4 (Condição Satisfeita) & Stage 5 (Descriptografia & Revelação) */}
        <div className="space-y-4">
          
          {/* Stage 4: Condition Check Status */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>4. Checagem de Condição</span>
              </span>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  isConditionSatisfied
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {isConditionSatisfied ? '✓ Satisfeita' : '⏳ Aguardando'}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {isConditionSatisfied
                ? 'Condição temporal e/ou quórum de guardiões atingido. Descriptografia e revelação autorizadas pelo protocolo.'
                : 'O conteúdo permanece criptografado no cofre até que o quórum de guardiões ou o tempo estipulado seja atingido.'}
            </p>

            {/* Decryption Action Trigger */}
            <button
              type="button"
              disabled={!payload || !isConditionSatisfied || isDecrypting || !!decryptedResult}
              onClick={handleRunDecryption}
              className={`w-full py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                decryptedResult
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 cursor-default'
                  : isConditionSatisfied && payload
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 active:scale-98'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              {isDecrypting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-300" />
                  <span>Descriptografando Payload via WebCrypto...</span>
                </>
              ) : decryptedResult ? (
                <>
                  <Unlock className="w-4 h-4 text-emerald-400" />
                  <span>5. Revelação Autorizada Concluída ✓</span>
                </>
              ) : isConditionSatisfied ? (
                <>
                  <Unlock className="w-4 h-4 text-white" />
                  <span>Descriptografar & Revelar Conteúdo →</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-slate-500" />
                  <span>Aguardando Cumprimento de Condição</span>
                </>
              )}
            </button>
          </div>

          {/* Stage 5: Unlocked & Decrypted Final Payload View */}
          {decryptedResult ? (
            <div className="p-4 rounded-2xl bg-gradient-to-b from-emerald-950/60 to-slate-900 border-2 border-emerald-500/50 space-y-3 animate-in zoom-in-95 duration-300 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-emerald-300 uppercase tracking-wider">
                      5. Conteúdo Descriptografado com Sucesso
                    </h5>
                    <p className="text-[10px] text-emerald-400/80">
                      Integridade validada por Hash SHA-256
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyDecrypted}
                  className="px-2.5 py-1 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-emerald-300" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>

              {/* Decrypted Payload Content */}
              <div className="p-3 bg-slate-950 rounded-xl border border-emerald-800/80 text-xs text-emerald-100 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed shadow-inner">
                {decryptedResult}
              </div>

              {/* Download simulated file button */}
              <a
                href={`data:${inputFileType};charset=utf-8,${encodeURIComponent(decryptedResult)}`}
                download={inputFileName}
                className="w-full py-2 px-3 rounded-xl bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-200 border border-emerald-700/60 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Baixar {inputFileName}</span>
              </a>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center space-y-2">
              <Lock className="w-8 h-8 text-slate-700 mx-auto" />
              <p className="text-xs font-bold text-slate-500">
                Aguardando Execução da Descriptografia Autorizada
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
