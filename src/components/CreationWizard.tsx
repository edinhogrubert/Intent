import React, { useState } from 'react';
import { 
  X, ArrowLeft, ArrowRight, Rocket, Users, Calendar, Vote, Plus, 
  Image as ImageIcon, Lock, Sparkles, Info, Check, Shield, CheckCircle2 
} from 'lucide-react';
import { UserAccount } from '../types';

interface CreationWizardProps {
  currentUser: UserAccount;
  onCancel: () => void;
  onComplete: (createdIntent: any) => void;
}

export function CreationWizard({ currentUser, onCancel, onComplete }: CreationWizardProps) {
  const [step, setStep] = useState<number>(1);
  const totalSteps = 5;

  // Form State
  const [templateType, setTemplateType] = useState<string>('PEOPLE');
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>('Saúde & Bem-estar');
  const [description, setDescription] = useState<string>('');
  const [revealContent, setRevealContent] = useState<string>('');
  const [conditionTab, setConditionTab] = useState<'PEOPLE' | 'TIME' | 'APPROVAL'>('PEOPLE');
  const [participantGoal, setParticipantGoal] = useState<number>(50);
  const [targetDate, setTargetDate] = useState<string>('2026-12-31');
  const [requiredApprovals, setRequiredApprovals] = useState<number>(3);
  const [visibility, setVisibility] = useState<'public' | 'followers' | 'chosen' | 'private'>('public');
  const [selectedFriends, setSelectedFriends] = useState<string[]>(['Carlos B.']);

  const categories = ['Saúde & Bem-estar', 'Carreira', 'Viagens', 'Arte & Criatividade', 'Educação', 'Finanças'];

  const friendsList = [
    { id: '1', name: 'Ana Silva', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
    { id: '2', name: 'Carlos B.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
    { id: '3', name: 'Mariana', initial: 'M' },
    { id: '4', name: 'João Pedro', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' },
  ];

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Publish
      const newIntent = {
        id: `intent-${Date.now()}`,
        title: title || 'Minha Nova Intent',
        description: description || 'Meta criada no Intent OS',
        category,
        creator: {
          id: currentUser.id,
          name: currentUser.name,
          username: currentUser.username || `@${currentUser.name.toLowerCase().replace(/\s+/g, '')}`,
          avatarUrl: currentUser.avatarUrl,
        },
        condition: {
          type: conditionTab,
          targetSupports: participantGoal,
          currentSupports: 0,
          targetDate: targetDate,
          requiredApprovals: requiredApprovals,
        },
        visibility,
        revealSecret: revealContent || 'Conteúdo exclusivo desbloqueado!',
        isUnlocked: false,
        createdAt: new Date().toISOString(),
      };
      onComplete(newIntent);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onCancel();
    }
  };

  const toggleFriend = (name: string) => {
    if (selectedFriends.includes(name)) {
      setSelectedFriends(selectedFriends.filter((f) => f !== name));
    } else {
      setSelectedFriends([...selectedFriends, name]);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-[#fbf9f5] min-h-[85vh] flex flex-col justify-between py-4 px-4 sm:px-6 antialiased font-sans">
      {/* Top Header */}
      <div>
        <header className="flex items-center justify-between pb-4 mb-6 border-b border-[#e4e2de]">
          <button
            onClick={handleBack}
            className="p-2 rounded-full hover:bg-[#eae8e4] text-[#454652] hover:text-[#000666] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h2 className="text-base font-bold text-[#000666]">Nova Intent</h2>
            <span className="text-xs text-[#666666]">Etapa {step} de {totalSteps}</span>
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-full hover:bg-[#eae8e4] text-[#454652] hover:text-[#000666] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Progress Bar */}
        <div className="w-full max-w-md mx-auto mb-8">
          <div className="h-2 w-full bg-[#e4e2de] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#000666] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* STEP 1: MODELO / FUNDAÇÃO */}
        {step === 1 && (
          <section className="animate-fade-up">
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-black text-[#1b1c1a] mb-2">
                O que você quer fazer acontecer?
              </h1>
              <p className="text-sm text-[#454652]">
                Escolha o modelo que melhor se adapta à sua nova expectativa.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => { setTemplateType('PEOPLE'); setConditionTab('PEOPLE'); }}
                className={`p-6 rounded-2xl border text-left transition-all cursor-pointer ${
                  templateType === 'PEOPLE'
                    ? 'bg-white border-[#000666] shadow-md ring-2 ring-[#000666]/10'
                    : 'bg-white/80 border-[#e4e2de] hover:border-[#000666]/40 hover:bg-white shadow-xs'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-[#e0e0ff] text-[#000767] flex items-center justify-center mb-4 shadow-xs">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#1b1c1a] mb-1">Meta com pessoas</h3>
                <p className="text-xs text-[#454652] leading-relaxed">
                  Um objetivo colaborativo. Defina participantes e alcancem juntos através de apoios.
                </p>
              </button>

              <button
                onClick={() => { setTemplateType('TIME'); setConditionTab('TIME'); }}
                className={`p-6 rounded-2xl border text-left transition-all cursor-pointer ${
                  templateType === 'TIME'
                    ? 'bg-white border-[#000666] shadow-md ring-2 ring-[#000666]/10'
                    : 'bg-white/80 border-[#e4e2de] hover:border-[#000666]/40 hover:bg-white shadow-xs'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-[#81f3e5] text-[#00201d] flex items-center justify-center mb-4 shadow-xs">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#1b1c1a] mb-1">Data específica</h3>
                <p className="text-xs text-[#454652] leading-relaxed">
                  Focado em um deadline. Ideal para eventos, contagens regressivas ou lançamentos.
                </p>
              </button>

              <button
                onClick={() => { setTemplateType('APPROVAL'); setConditionTab('APPROVAL'); }}
                className={`p-6 rounded-2xl border text-left transition-all cursor-pointer ${
                  templateType === 'APPROVAL'
                    ? 'bg-white border-[#000666] shadow-md ring-2 ring-[#000666]/10'
                    : 'bg-white/80 border-[#e4e2de] hover:border-[#000666]/40 hover:bg-white shadow-xs'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-[#ffdbd0] text-[#3a0a00] flex items-center justify-center mb-4 shadow-xs">
                  <Vote className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#1b1c1a] mb-1">Aprovação de grupo</h3>
                <p className="text-xs text-[#454652] leading-relaxed">
                  A conclusão depende do consenso ou validação (quórum de guardiões).
                </p>
              </button>

              <button
                onClick={() => { setTemplateType('CUSTOM'); }}
                className={`p-6 rounded-2xl border text-left transition-all cursor-pointer ${
                  templateType === 'CUSTOM'
                    ? 'bg-white border-[#000666] shadow-md ring-2 ring-[#000666]/10'
                    : 'bg-white/80 border-[#e4e2de] hover:border-[#000666]/40 hover:bg-white shadow-xs'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-[#eae8e4] text-[#1b1c1a] flex items-center justify-center mb-4 shadow-xs">
                  <Plus className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#1b1c1a] mb-1">Começar do zero</h3>
                <p className="text-xs text-[#454652] leading-relaxed">
                  Crie regras personalizadas e combine diferentes condições para sua Intent.
                </p>
              </button>
            </div>
          </section>
        )}

        {/* STEP 2: A HISTÓRIA & A REVELAÇÃO */}
        {step === 2 && (
          <section className="animate-fade-up space-y-6">
            {/* Story Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e4e2de] space-y-4">
              <div>
                <h2 className="text-xl font-black text-[#1b1c1a]">A História</h2>
                <p className="text-xs text-[#454652]">Defina a jornada pública que sua rede irá acompanhar e apoiar.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1b1c1a] mb-1.5">Título da Intent</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Aprender a tocar piano em 6 meses"
                  className="w-full bg-[#fbf9f5] border border-[#c6c5d4] rounded-xl px-4 py-3 text-sm focus:border-[#000666] focus:ring-1 focus:ring-[#000666] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1b1c1a] mb-1.5">Categoria</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        category === cat
                          ? 'bg-[#000666] text-white shadow-xs'
                          : 'bg-[#f5f3ef] text-[#454652] hover:bg-[#eae8e4] border border-[#e4e2de]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1b1c1a] mb-1.5">Descrição</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Conte o porquê desta meta ser importante para você e como planeja alcançá-la..."
                  className="w-full bg-[#fbf9f5] border border-[#c6c5d4] rounded-xl px-4 py-3 text-sm focus:border-[#000666] focus:ring-1 focus:ring-[#000666] outline-none transition-all resize-none"
                />
              </div>
            </div>

            {/* Reveal Section */}
            <div className="bg-gradient-to-br from-white to-[#E0F2F1]/40 rounded-2xl p-6 shadow-sm border border-[#006a62]/20 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#006a62]/10 text-[#006a62] flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1b1c1a]">O que será revelado?</h3>
                  <p className="text-xs text-[#454652]">O conteúdo secreto bloqueado que é desbloqueado no final.</p>
                </div>
              </div>

              <div className="bg-white/80 rounded-xl p-3.5 border border-[#006a62]/20 text-xs text-[#454652] flex items-start gap-2.5">
                <Info className="w-4 h-4 text-[#006a62] shrink-0 mt-0.5" />
                <p>
                  A mecânica da Intent separa a <strong>jornada</strong> do <strong>destino</strong>. Este campo ficará protegido sob um visual embaçado para seus seguidores e só será desbloqueado quando as condições forem atingidas.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1b1c1a] mb-1.5">A Recompensa / O Resultado</label>
                <textarea
                  rows={2}
                  value={revealContent}
                  onChange={(e) => setRevealContent(e.target.value)}
                  placeholder="Ex: O vídeo gravado tocando a música completa, o certificado de conclusão ou o link do arquivo..."
                  className="w-full bg-white border border-[#006a62]/30 rounded-xl px-4 py-3 text-sm focus:border-[#006a62] focus:ring-1 focus:ring-[#006a62] outline-none transition-all resize-none"
                />
              </div>
            </div>
          </section>
        )}

        {/* STEP 3: QUAL A CONDIÇÃO? */}
        {step === 3 && (
          <section className="animate-fade-up space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-[#1b1c1a] mb-1">Qual a condição?</h2>
              <p className="text-xs text-[#454652]">Defina o gatilho que fará sua Intent acontecer e ser revelada a todos.</p>
            </div>

            {/* Segmented Control */}
            <div className="flex p-1 bg-[#eae8e4] rounded-xl max-w-md mx-auto">
              <button
                type="button"
                onClick={() => setConditionTab('PEOPLE')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  conditionTab === 'PEOPLE' ? 'bg-white text-[#000666] shadow-xs' : 'text-[#454652]'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Pessoas</span>
              </button>
              <button
                type="button"
                onClick={() => setConditionTab('TIME')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  conditionTab === 'TIME' ? 'bg-white text-[#000666] shadow-xs' : 'text-[#454652]'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Data</span>
              </button>
              <button
                type="button"
                onClick={() => setConditionTab('APPROVAL')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  conditionTab === 'APPROVAL' ? 'bg-white text-[#000666] shadow-xs' : 'text-[#454652]'
                }`}
              >
                <Vote className="w-4 h-4" />
                <span>Aprovação</span>
              </button>
            </div>

            {/* Slider or Field depending on Condition Tab */}
            {conditionTab === 'PEOPLE' && (
              <div className="bg-white rounded-2xl p-8 border border-[#e4e2de] shadow-sm text-center max-w-md mx-auto space-y-6">
                <span className="text-[11px] uppercase tracking-wider font-bold text-[#000666]">Meta de Apoiadores</span>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-black text-[#000666]">{participantGoal}</span>
                  <span className="text-base text-[#666666] font-semibold">pessoas</span>
                </div>

                <input
                  type="range"
                  min="5"
                  max="500"
                  step="5"
                  value={participantGoal}
                  onChange={(e) => setParticipantGoal(Number(e.target.value))}
                  className="w-full accent-[#000666] h-2 bg-[#e4e2de] rounded-lg cursor-pointer"
                />

                <div className="flex justify-between text-[11px] text-[#666666] font-bold">
                  <span>5 min</span>
                  <span>500 max</span>
                </div>
              </div>
            )}

            {conditionTab === 'TIME' && (
              <div className="bg-white rounded-2xl p-8 border border-[#e4e2de] shadow-sm text-center max-w-md mx-auto space-y-4">
                <span className="text-[11px] uppercase tracking-wider font-bold text-[#000666]">Data de Liberação</span>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-[#fbf9f5] border border-[#c6c5d4] rounded-xl px-4 py-3 text-sm focus:border-[#000666] outline-none"
                />
              </div>
            )}

            {conditionTab === 'APPROVAL' && (
              <div className="bg-white rounded-2xl p-8 border border-[#e4e2de] shadow-sm text-center max-w-md mx-auto space-y-4">
                <span className="text-[11px] uppercase tracking-wider font-bold text-[#000666]">Quórum de Guardiões</span>
                <div className="flex items-center justify-center gap-3">
                  {[1, 2, 3, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setRequiredApprovals(num)}
                      className={`w-12 h-12 rounded-xl font-black text-sm transition-all cursor-pointer ${
                        requiredApprovals === num
                          ? 'bg-[#000666] text-white shadow-sm'
                          : 'bg-[#f5f3ef] text-[#454652] hover:bg-[#eae8e4]'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-[#666666]">Requer aprovação de {requiredApprovals} guardiões para revelar.</p>
              </div>
            )}

            {/* Dynamic Summary Phrase */}
            <div className="bg-[#efeeea] p-4 rounded-xl max-w-md mx-auto flex items-start gap-3 border border-[#c6c5d4]/40">
              <Sparkles className="w-5 h-5 text-[#000666] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-[#1b1c1a] mb-0.5">Resumo da Condição</h4>
                <p className="text-xs text-[#454652]">
                  Esta Intent acontecerá quando{' '}
                  <strong className="text-[#000666]">
                    {conditionTab === 'PEOPLE'
                      ? `${participantGoal} pessoas apoiarem`
                      : conditionTab === 'TIME'
                      ? `chegar a data ${targetDate}`
                      : `${requiredApprovals} guardiões aprovarem`}
                  </strong>.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* STEP 4: VISIBILIDADE / PÚBLICO */}
        {step === 4 && (
          <section className="animate-fade-up space-y-4">
            <div className="mb-4">
              <h2 className="text-xl font-black text-[#1b1c1a] mb-1">Visibilidade</h2>
              <p className="text-xs text-[#454652]">Defina quem poderá acompanhar o progresso e ver o resultado final.</p>
            </div>

            <div className="space-y-3">
              <label
                onClick={() => setVisibility('public')}
                className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer ${
                  visibility === 'public'
                    ? 'bg-white border-[#000666] shadow-sm ring-1 ring-[#000666]'
                    : 'bg-white/80 border-[#e4e2de] hover:bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="vis"
                  checked={visibility === 'public'}
                  onChange={() => setVisibility('public')}
                  className="mt-1 text-[#000666] focus:ring-[#000666]"
                />
                <div>
                  <h4 className="text-sm font-bold text-[#1b1c1a]">Público</h4>
                  <p className="text-xs text-[#454652]">Qualquer pessoa na rede pode acompanhar o progresso e o resultado final.</p>
                </div>
              </label>

              <label
                onClick={() => setVisibility('followers')}
                className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer ${
                  visibility === 'followers'
                    ? 'bg-white border-[#000666] shadow-sm ring-1 ring-[#000666]'
                    : 'bg-white/80 border-[#e4e2de] hover:bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="vis"
                  checked={visibility === 'followers'}
                  onChange={() => setVisibility('followers')}
                  className="mt-1 text-[#000666] focus:ring-[#000666]"
                />
                <div>
                  <h4 className="text-sm font-bold text-[#1b1c1a]">Seguidores</h4>
                  <p className="text-xs text-[#454652]">Apenas as pessoas que te seguem poderão acompanhar o progresso e o resultado.</p>
                </div>
              </label>

              <label
                onClick={() => setVisibility('chosen')}
                className={`flex flex-col gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                  visibility === 'chosen'
                    ? 'bg-white border-[#000666] shadow-sm ring-1 ring-[#000666]'
                    : 'bg-white/80 border-[#e4e2de] hover:bg-white'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <input
                    type="radio"
                    name="vis"
                    checked={visibility === 'chosen'}
                    onChange={() => setVisibility('chosen')}
                    className="mt-1 text-[#000666] focus:ring-[#000666]"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-[#1b1c1a]">Pessoas Escolhidas</h4>
                    <p className="text-xs text-[#454652]">Selecione amigos específicos para compartilhar essa jornada mais íntima.</p>
                  </div>
                </div>

                {visibility === 'chosen' && (
                  <div className="pt-2 pl-7 border-t border-[#e4e2de] mt-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#666666] block mb-2">
                      Seus Amigos
                    </span>
                    <div className="flex gap-3 overflow-x-auto pb-1">
                      {friendsList.map((friend) => {
                        const isSelected = selectedFriends.includes(friend.name);
                        return (
                          <button
                            key={friend.id}
                            type="button"
                            onClick={(e) => { e.stopPropagation(); toggleFriend(friend.name); }}
                            className="flex flex-col items-center gap-1 min-w-[60px] group cursor-pointer"
                          >
                            <div className={`w-11 h-11 rounded-full overflow-hidden border-2 transition-all relative ${
                              isSelected ? 'border-[#000666] ring-2 ring-[#000666]/30' : 'border-transparent'
                            }`}>
                              {friend.avatar ? (
                                <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-[#eae8e4] flex items-center justify-center font-bold text-xs text-[#000666]">
                                  {friend.initial}
                                </div>
                              )}
                              {isSelected && (
                                <div className="absolute inset-0 bg-[#000666]/30 flex items-center justify-center text-white">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </div>
                              )}
                            </div>
                            <span className="text-[10px] font-semibold text-[#1b1c1a] truncate max-w-[60px]">
                              {friend.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </label>

              <label
                onClick={() => setVisibility('private')}
                className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer ${
                  visibility === 'private'
                    ? 'bg-white border-[#000666] shadow-sm ring-1 ring-[#000666]'
                    : 'bg-white/80 border-[#e4e2de] hover:bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="vis"
                  checked={visibility === 'private'}
                  onChange={() => setVisibility('private')}
                  className="mt-1 text-[#000666] focus:ring-[#000666]"
                />
                <div>
                  <h4 className="text-sm font-bold text-[#1b1c1a]">Privado</h4>
                  <p className="text-xs text-[#454652]">Apenas você verá essa Intent. O resultado não será publicado na rede.</p>
                </div>
              </label>
            </div>
          </section>
        )}

        {/* STEP 5: REVISAR */}
        {step === 5 && (
          <section className="animate-fade-up space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-[#1b1c1a] mb-1">Tudo pronto?</h2>
              <p className="text-xs text-[#454652]">Confira como sua Intent aparecerá para seus amigos no feed.</p>
            </div>

            {/* Preview Card */}
            <article className="bg-white rounded-2xl p-6 shadow-md border border-[#e4e2de] max-w-md mx-auto space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full object-cover border border-[#e4e2de]"
                />
                <div>
                  <h4 className="text-sm font-bold text-[#1b1c1a]">{currentUser.name}</h4>
                  <p className="text-[11px] text-[#666666]">Agora mesmo • {visibility === 'public' ? 'Público' : 'Amigos'}</p>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#1b1c1a]">{title || 'Minha Nova Intent'}</h3>
                <p className="text-xs text-[#454652] mt-1">{description || 'Sem descrição informada.'}</p>
              </div>

              {/* Progress 0% */}
              <div className="bg-[#fbf9f5] p-3 rounded-xl border border-[#e4e2de]">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-bold text-[#000666]">0 de {participantGoal} apoios</span>
                  <span className="text-[#666666] font-bold">0%</span>
                </div>
                <div className="w-full bg-[#E0F2F1] rounded-full h-2 overflow-hidden">
                  <div className="bg-[#006a62] h-full rounded-full w-[2%]"></div>
                </div>
              </div>

              {/* Blurred Locked Box */}
              <div className="h-28 bg-[#efeeea] rounded-xl overflow-hidden relative flex flex-col items-center justify-center border border-[#c6c5d4]/40">
                <Lock className="w-6 h-6 text-[#000666] mb-1" />
                <span className="text-xs font-bold text-[#000666]">Conteúdo Restrito</span>
                <span className="text-[10px] text-[#666666]">Desbloqueado ao atingir a meta</span>
              </div>
            </article>
          </section>
        )}
      </div>

      {/* Sticky Bottom Actions */}
      <footer className="pt-6 mt-8 border-t border-[#e4e2de] flex items-center justify-between gap-3">
        <button
          onClick={handleBack}
          className="px-6 py-3 rounded-xl border border-[#c6c5d4] text-[#454652] hover:bg-[#eae8e4] font-bold text-xs transition-colors cursor-pointer"
        >
          {step === 1 ? 'Cancelar' : 'Voltar'}
        </button>

        <button
          onClick={handleNext}
          className="px-8 py-3 rounded-xl bg-[#000666] text-white hover:bg-[#1a237e] font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98"
        >
          <span>{step === totalSteps ? 'Publicar Intent' : 'Continuar'}</span>
          {step === totalSteps ? <Rocket className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
        </button>
      </footer>
    </div>
  );
}
