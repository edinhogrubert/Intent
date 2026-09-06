import React, { useState } from 'react';
import { Camera, Check, Shield, Bell, Lock, User, Save } from 'lucide-react';
import { UserAccount } from '../types';

interface SettingsViewProps {
  currentUser: UserAccount;
  onUpdateUser: (updatedUser: Partial<UserAccount>) => void;
}

export function SettingsView({ currentUser, onUpdateUser }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<'conta' | 'privacidade' | 'notificacoes' | 'seguranca'>('conta');
  const [name, setName] = useState(currentUser.name || 'Mariana Silva');
  const [username, setUsername] = useState(currentUser.username || '@mariana_ux');
  const [email, setEmail] = useState(currentUser.email || 'mariana.silva@exemplo.com');
  const [bio, setBio] = useState(currentUser.bio || 'Designer de Produto. Entusiasta de corrida de rua e focando em aprender violão este ano.');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({ name, username, email, bio });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#fbf9f5] min-h-screen py-4 px-4 sm:px-6 antialiased font-sans">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-[#000666] tracking-tight mb-1">Configurações</h2>
          <p className="text-xs text-[#454652]">Gerencie seus dados pessoais, preferências de privacidade e conta.</p>
        </div>

        {/* Settings Navigation Tabs */}
        <div className="flex border-b border-[#e4e2de] gap-6 overflow-x-auto no-scrollbar">
          {[
            { id: 'conta', label: 'Conta', icon: User },
            { id: 'privacidade', label: 'Privacidade', icon: Shield },
            { id: 'notificacoes', label: 'Notificações', icon: Bell },
            { id: 'seguranca', label: 'Segurança', icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-[#000666] text-[#000666]'
                    : 'border-transparent text-[#666666] hover:text-[#1b1c1a]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Tab: Conta */}
        {activeTab === 'conta' && (
          <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#e4e2de] space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-[#f5f3ef]">
              <div className="relative">
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={currentUser.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-[#e4e2de]"
                />
                <button
                  type="button"
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#000666] text-white flex items-center justify-center shadow-md hover:bg-[#1a237e] transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-center sm:text-left">
                <h4 className="text-sm font-bold text-[#1b1c1a]">Foto de Perfil</h4>
                <p className="text-xs text-[#666666]">Recomendado formato quadrado JPG ou PNG, min 400x400px.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1b1c1a] mb-1.5">Nome Completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#fbf9f5] border border-[#c6c5d4] rounded-xl px-4 py-2.5 text-xs text-[#1b1c1a] focus:border-[#000666] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1b1c1a] mb-1.5">Nome de Usuário (@handle)</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#fbf9f5] border border-[#c6c5d4] rounded-xl px-4 py-2.5 text-xs text-[#1b1c1a] focus:border-[#000666] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1b1c1a] mb-1.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#fbf9f5] border border-[#c6c5d4] rounded-xl px-4 py-2.5 text-xs text-[#1b1c1a] focus:border-[#000666] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1b1c1a] mb-1.5">Biografia</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-[#fbf9f5] border border-[#c6c5d4] rounded-xl px-4 py-2.5 text-xs text-[#1b1c1a] focus:border-[#000666] outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#f5f3ef]">
              {savedSuccess && (
                <span className="text-xs font-bold text-[#006a62] flex items-center gap-1">
                  <Check className="w-4 h-4" /> Alterações salvas com sucesso!
                </span>
              )}
              {!savedSuccess && <span></span>}

              <button
                type="submit"
                className="px-6 py-2.5 bg-[#000666] text-white text-xs font-bold rounded-xl hover:bg-[#1a237e] transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab: Privacidade */}
        {activeTab === 'privacidade' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#e4e2de] space-y-6">
            <h3 className="text-base font-bold text-[#1b1c1a]">Privacidade & Visibilidade</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#fbf9f5] border border-[#e4e2de]">
                <div>
                  <h4 className="text-xs font-bold text-[#1b1c1a]">Perfil Público</h4>
                  <p className="text-[11px] text-[#666666]">Permitir que qualquer pessoa veja suas intents públicas na aba Explorar.</p>
                </div>
                <input type="checkbox" defaultChecked className="accent-[#000666] w-4 h-4 cursor-pointer" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#fbf9f5] border border-[#e4e2de]">
                <div>
                  <h4 className="text-xs font-bold text-[#1b1c1a]">Modo Foco</h4>
                  <p className="text-[11px] text-[#666666]">Ocultar contadores de visualizações e métricas secundárias do seu feed.</p>
                </div>
                <input type="checkbox" className="accent-[#000666] w-4 h-4 cursor-pointer" />
              </div>
            </div>
          </div>
        )}

        {/* Tab: Notificacoes */}
        {activeTab === 'notificacoes' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#e4e2de] space-y-6">
            <h3 className="text-base font-bold text-[#1b1c1a]">Preferências de Notificações</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#fbf9f5] border border-[#e4e2de]">
                <div>
                  <h4 className="text-xs font-bold text-[#1b1c1a]">Apoiadores e Novos Participantes</h4>
                  <p className="text-[11px] text-[#666666]">Receber aviso quando alguém apoiar uma de suas Intents.</p>
                </div>
                <input type="checkbox" defaultChecked className="accent-[#000666] w-4 h-4 cursor-pointer" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#fbf9f5] border border-[#e4e2de]">
                <div>
                  <h4 className="text-xs font-bold text-[#1b1c1a]">Revelações Desbloqueadas</h4>
                  <p className="text-[11px] text-[#666666]">Receber notificação quando uma Intent que você apoia atingir 100%.</p>
                </div>
                <input type="checkbox" defaultChecked className="accent-[#000666] w-4 h-4 cursor-pointer" />
              </div>
            </div>
          </div>
        )}

        {/* Tab: Seguranca */}
        {activeTab === 'seguranca' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#e4e2de] space-y-6">
            <h3 className="text-base font-bold text-[#1b1c1a]">Segurança & Autenticação</h3>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#fbf9f5] border border-[#e4e2de] flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-[#1b1c1a]">Autenticação em 2 Etapas (2FA)</h4>
                  <p className="text-[11px] text-[#666666]">Proteja sua conta com verificação por código SMS ou App.</p>
                </div>
                <button className="px-4 py-1.5 rounded-xl bg-[#000666] text-white text-xs font-bold">Ativar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
