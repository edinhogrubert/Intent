import { Home, Compass, PlusCircle, Inbox, Bell, LogOut, Trash2, User, ListChecks } from 'lucide-react';
import { UserAccount } from '../types';
import { DevInspectorBadge } from './DevInspectorBadge';

interface SidebarProps {
  user: UserAccount;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  onRequestDelete: () => void;
  onOpenChecklist?: () => void;
}

export function Sidebar({ user, activeTab, onTabChange, onLogout, onRequestDelete, onOpenChecklist }: SidebarProps) {
  return (
    <aside
      id="app-sidebar"
      className="hidden md:flex w-24 bg-[#EBF2FC] border-r border-[#D9E5F5] flex-col items-center py-6 justify-between select-none shrink-0 min-h-screen relative"
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

        {/* Nav item: Minhas Intents */}
        <button
          id="nav-minhas"
          title="Minhas Intents"
          onClick={() => onTabChange('minhas')}
          className={`w-16 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer ${
            activeTab === 'minhas' 
              ? 'bg-[#0055FF] text-white shadow-md' 
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
              ? 'bg-[#0055FF] text-white shadow-md' 
              : 'bg-white hover:bg-[#D6E6FD] text-[#4A6D9C] border border-[#D9E5F5]'
          }`}
        >
          <User className="w-5 h-5 stroke-[2]" />
          <span className="text-[10px] font-bold">Perfil</span>
        </button>

        {/* Divider */}
        <div className="w-10 h-px bg-[#D9E5F5] my-1" />

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
          className="relative p-2 rounded-xl text-[#3A5D8C] hover:bg-[#DCE7F8] transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#0055FF] rounded-full animate-pulse"></span>
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
              <p className="text-[10px] text-[#0055FF] font-mono font-bold truncate">{user.username || '@' + user.name.toLowerCase()}</p>
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
  );
}

