import React, { useState } from 'react';
import { Home, Compass, PlusCircle, Inbox, Bell, LogOut, Trash2, User, ListChecks, Users, X, Code2, Zap, UserCheck, ChevronRight, MessageSquare, Settings } from 'lucide-react';
import { UserAccount } from '../types';
import { DevInspectorBadge } from './DevInspectorBadge';
import { PRESET_TEST_PERSONAS, createGuestUser, switchPersona, TestPersona } from '../utils/testPersonas';
import { getGlobalDevBadgesState, toggleGlobalDevBadges } from './DevInspectorBadge';

interface SidebarProps {
  user: UserAccount;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  onRequestDelete: () => void;
  onOpenChecklist?: () => void;
  onUserChanged: (newUser: UserAccount) => void;
}

export function Sidebar({ user, activeTab, onTabChange, onLogout, onRequestDelete, onOpenChecklist, onUserChanged }: SidebarProps) {
  const [showTesterPanel, setShowTesterPanel] = useState(false);
  const [devBadgesActive, setDevBadgesActive] = useState<boolean>(getGlobalDevBadgesState());

  const handleToggleBadges = () => {
    const newState = toggleGlobalDevBadges();
    setDevBadgesActive(newState);
  };

  const handleSwitchPersona = (persona: TestPersona) => {
    const updated = switchPersona(persona);
    onUserChanged(updated);
  };

  const handleNewGuest = () => {
    const guest = createGuestUser();
    onUserChanged(guest);
  };

  return (
    <>
      <aside
        id="app-sidebar"
        className="hidden md:flex w-24 bg-[#EBF2FC] border-r border-[#D9E5F5] flex-col items-center py-6 justify-between select-none shrink-0 min-h-screen relative z-40"
      >
        <DevInspectorBadge
          file="src/components/Sidebar.tsx"
          functionName="Sidebar"
          className="absolute top-1 left-1 max-w-[70px] text-[8px]"
        />
        {/* Top section: Logo + Navigation items */}
        <div className="flex flex-col items-center w-full gap-4">
          {/* Brand Logo */}
          <div 
            onClick={() => onTabChange('primeiro-acesso')}
            id="brand-logo" 
            className="text-[#0055FF] font-black text-2xl tracking-tighter mb-4 cursor-pointer hover:scale-105 transition-transform"
          >
            INTENT
          </div>

          {/* Nav item: Início */}
          <button
            id="nav-inicio"
            title="Início"
            onClick={() => onTabChange('inicio')}
            className={`w-16 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer ${
              activeTab === 'inicio' 
                ? 'bg-[#0055FF] text-white shadow-md' 
                : 'bg-white hover:bg-[#D6E6FD] text-[#4A6D9C] border border-[#D9E5F5]'
            }`}
          >
            <Home className="w-5 h-5 stroke-[2]" />
            <span className="text-[10px] font-bold">Início</span>
          </button>

          {/* Nav item: Explorar */}
          <button
            id="nav-explorar"
            title="Explorar"
            onClick={() => onTabChange('explorar')}
            className={`w-16 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer ${
              activeTab === 'explorar' 
                ? 'bg-[#0055FF] text-white shadow-md' 
                : 'bg-white hover:bg-[#D6E6FD] text-[#4A6D9C] border border-[#D9E5F5]'
            }`}
          >
            <Compass className="w-5 h-5 stroke-[2]" />
            <span className="text-[10px] font-bold">Explorar</span>
          </button>

          {/* Nav item: Criar (Highlighted Centered Button) */}
          <button
            id="nav-criar"
            title="Criar Nova Intent"
            onClick={() => onTabChange('criar')}
            className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer ${
              activeTab === 'criar' 
                ? 'bg-purple-600 text-white shadow-md scale-105' 
                : 'bg-gradient-to-br from-[#0055FF] to-blue-600 hover:opacity-90 text-white shadow-xs'
            }`}
          >
            <PlusCircle className="w-6 h-6 stroke-[2]" />
            <span className="text-[9px] font-black uppercase tracking-wider">Criar</span>
          </button>

          {/* Nav item: Mensagens */}
          <button
            id="nav-mensagens"
            title="Mensagens"
            onClick={() => onTabChange('mensagens')}
            className={`w-16 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer ${
              activeTab === 'mensagens' 
                ? 'bg-[#000666] text-white shadow-md' 
                : 'bg-white hover:bg-[#D6E6FD] text-[#4A6D9C] border border-[#D9E5F5]'
            }`}
          >
            <MessageSquare className="w-5 h-5 stroke-[2]" />
            <span className="text-[10px] font-bold">Chat</span>
          </button>

          {/* Nav item: Minhas Intents */}
          <button
            id="nav-minhas"
            title="Minhas Intents"
            onClick={() => onTabChange('minhas')}
            className={`w-16 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer ${
              activeTab === 'minhas' 
                ? 'bg-[#000666] text-white shadow-md' 
                : 'bg-white hover:bg-[#D6E6FD] text-[#4A6D9C] border border-[#D9E5F5]'
            }`}
          >
            <Inbox className="w-5 h-5 stroke-[2]" />
            <span className="text-[10px] font-bold">Minhas</span>
          </button>

          {/* Nav item: Perfil */}
          <button
            id="nav-perfil-tab"
            title="Meu Perfil"
            onClick={() => onTabChange('perfil')}
            className={`w-16 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer ${
              activeTab === 'perfil' 
                ? 'bg-[#000666] text-white shadow-md' 
                : 'bg-white hover:bg-[#D6E6FD] text-[#4A6D9C] border border-[#D9E5F5]'
            }`}
          >
            <User className="w-5 h-5 stroke-[2]" />
            <span className="text-[10px] font-bold">Perfil</span>
          </button>

          {/* Divider */}
          <div className="w-10 h-px bg-[#D9E5F5] my-1" />

          {/* Nav item: Perfis de Teste (Simulador) */}
          <button
            id="nav-personas"
            title="Perfis de Teste (Simulador)"
            onClick={() => setShowTesterPanel(!showTesterPanel)}
            className={`w-16 h-12 rounded-xl flex flex-col items-center justify-center transition-all active:scale-95 cursor-pointer border ${
              showTesterPanel 
                ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500 shadow-sm' 
                : 'bg-amber-50/80 hover:bg-amber-100 text-amber-700 border-amber-200'
            }`}
          >
            <Users className="w-4 h-4 mb-0.5" />
            <span className="text-[8px] font-black uppercase tracking-wider">Perfis</span>
          </button>

          {/* Nav item: Checklist das 8 Etapas */}
          <button
            id="nav-checklist"
            title="Checklist das 8 Etapas & Testes Concretos"
            onClick={onOpenChecklist}
            className="w-16 h-12 rounded-xl bg-cyan-950/90 border border-cyan-800 text-cyan-300 flex flex-col items-center justify-center hover:bg-cyan-900 transition-all cursor-pointer shadow-2xs"
          >
            <ListChecks className="w-4 h-4 text-cyan-400 mb-0.5" />
            <span className="text-[8px] font-black tracking-tighter">Etapas 1-8</span>
          </button>
        </div>

        {/* Bottom section: Notifications, User Avatar & Quick Actions */}
        <div className="flex flex-col items-center gap-4 w-full px-2">
          {/* Notification Bell */}
          <button
            id="notification-btn"
            title="Notificações"
            onClick={() => onTabChange('notificacoes')}
            className={`relative p-2.5 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'notificacoes' ? 'bg-[#000666] text-white shadow-xs' : 'text-[#3A5D8C] hover:bg-[#DCE7F8]'
            }`}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#006a62] rounded-full animate-pulse"></span>
          </button>

          {/* User Avatar with initials / profile icon */}
          <div className="group relative">
            <button
              id="user-avatar-btn"
              title={`Conectado como ${user.name}`}
              onClick={() => onTabChange('perfil')}
              className="w-10 h-10 rounded-full bg-[#152744] text-white flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm overflow-hidden hover:ring-2 hover:ring-[#0055FF] transition-all cursor-pointer"
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{user.name.slice(0, 2).toUpperCase()}</span>
              )}
            </button>

            {/* Quick Popover on Hover / Click */}
            <div className="absolute left-full bottom-0 ml-3 w-48 bg-white border border-[#D5E2F3] rounded-xl shadow-lg p-2.5 hidden group-hover:block z-50 animate-in fade-in zoom-in-95">
              <div className="px-2 py-1.5 border-b border-slate-100 mb-1.5">
                <p className="text-xs font-semibold text-slate-800 truncate">{user.name}</p>
                <p className="text-[10px] text-[#0055FF] font-mono font-bold truncate">{`@${(user.username || user.name.toLowerCase()).replace(/^@+/, '')}`}</p>
              </div>
              <button
                id="sidebar-profile-btn"
                onClick={() => onTabChange('perfil')}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-left"
              >
                <User className="w-3.5 h-3.5 text-blue-500" />
                <span>Perfil & Identidade</span>
              </button>
              <button
                id="sidebar-settings-btn"
                onClick={() => onTabChange('configuracoes')}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-left mt-1"
              >
                <Settings className="w-3.5 h-3.5 text-slate-500" />
                <span>Configurações</span>
              </button>
              <button
                id="sidebar-logout-btn"
                onClick={onLogout}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-left mt-1"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-500" />
                <span>Sair da conta</span>
              </button>
              <button
                id="sidebar-delete-btn"
                onClick={onRequestDelete}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-left mt-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Cancelar inscrição</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Flyout sliding drawer menu for Test Personas */}
      {showTesterPanel && (
        <div className="fixed inset-0 z-30 flex">
          {/* Backblur overlay */}
          <div 
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-xs transition-opacity" 
            onClick={() => setShowTesterPanel(false)}
          />

          {/* Drawer Body panel */}
          <div className="relative flex flex-col w-80 max-w-sm h-full bg-white shadow-2xl border-r border-[#BFD7FE] z-40 p-6 ml-24 justify-between animate-in slide-in-from-left duration-300">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm tracking-tight">Simulador de Perfis</h3>
                    <p className="text-[10px] text-slate-500">Troque de perfil em 1 clique</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowTesterPanel(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Dev Badges toggle */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-amber-500" />
                  <div>
                    <p className="text-[11px] font-bold text-slate-800">Rótulos de Engenharia</p>
                    <p className="text-[9px] text-slate-500">Identificação de arquivos</p>
                  </div>
                </div>
                <button
                  onClick={handleToggleBadges}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-black border transition-all cursor-pointer ${
                    devBadgesActive
                      ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                      : 'bg-slate-200 text-slate-600 border-slate-300'
                  }`}
                >
                  {devBadgesActive ? 'ATIVO ✓' : 'INATIVO'}
                </button>
              </div>

              {/* Connected status indicator */}
              <div className="mb-4">
                <p className="text-[10px] uppercase tracking-wider font-black text-slate-400 mb-1.5">Sessão Atual</p>
                <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                    {user.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                    <p className="text-[9px] font-mono text-emerald-700 truncate">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Persona List */}
              <div className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-270px)] pr-1">
                <p className="text-[10px] uppercase tracking-wider font-black text-slate-400 mb-1.5">Escolher Persona de Teste</p>
                
                {PRESET_TEST_PERSONAS.map((persona) => {
                  const isCurrent = user.email.toLowerCase() === persona.email.toLowerCase();
                  return (
                    <button
                      key={persona.id}
                      onClick={() => handleSwitchPersona(persona)}
                      className={`w-full p-2.5 rounded-xl text-left transition-all border flex items-center justify-between group cursor-pointer ${
                        isCurrent
                          ? 'bg-blue-50 border-blue-200 shadow-2xs text-blue-950'
                          : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="text-xs">
                          {persona.badge.split(' ')[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold truncate group-hover:text-blue-600 transition-colors">
                            {persona.name}
                          </p>
                          <p className="text-[9px] text-slate-500 truncate">
                            {persona.badge.split(' ').slice(1).join(' ')}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 text-slate-300 group-hover:translate-x-0.5 transition-transform ${isCurrent ? 'text-blue-500' : ''}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer with Guest button */}
            <div className="border-t border-slate-100 pt-4">
              <button
                onClick={handleNewGuest}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:opacity-95 active:scale-98 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-current text-amber-200" />
                <span>Criar Visitante Anônimo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

