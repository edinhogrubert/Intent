import { Home, Compass, PlusCircle, Inbox, Bell, LogOut, Trash2 } from 'lucide-react';
import { UserAccount } from '../types';

interface SidebarProps {
  user: UserAccount;
  onLogout: () => void;
  onRequestDelete: () => void;
}

export function Sidebar({ user, onLogout, onRequestDelete }: SidebarProps) {
  return (
    <aside
      id="app-sidebar"
      className="w-20 md:w-24 bg-[#EBF2FC] border-r border-[#D9E5F5] flex flex-col items-center py-6 justify-between select-none shrink-0 min-h-screen"
    >
      {/* Top section: Logo + Navigation items */}
      <div className="flex flex-col items-center w-full gap-5">
        {/* Brand Logo */}
        <div id="brand-logo" className="text-[#0055FF] font-black text-xl tracking-tighter mb-2">
          IT
        </div>

        {/* Nav item: Início (Active) */}
        <button
          id="nav-inicio"
          title="Início"
          className="w-14 h-14 rounded-2xl bg-[#D6E6FD] text-[#0055FF] flex flex-col items-center justify-center gap-1 shadow-xs transition-transform active:scale-95"
        >
          <Home className="w-5 h-5 stroke-[2.5]" />
          <span className="text-[10px] font-semibold tracking-tight">Início</span>
        </button>

        {/* Nav item: Explorar */}
        <div
          id="nav-explorar"
          title="Explorar"
          className="w-14 h-14 rounded-2xl border border-dashed border-[#94BFFF] text-[#4A6D9C] flex flex-col items-center justify-center gap-1 opacity-70 hover:opacity-100 hover:bg-[#E2EDFC] transition-all cursor-pointer"
        >
          <Compass className="w-4 h-4 stroke-[2]" />
          <span className="text-[9px] font-medium">Explorar</span>
        </div>

        {/* Nav item: Criar */}
        <div
          id="nav-criar"
          title="Criar"
          className="w-14 h-14 rounded-2xl border border-dashed border-[#94BFFF] text-[#4A6D9C] flex flex-col items-center justify-center gap-1 opacity-70 hover:opacity-100 hover:bg-[#E2EDFC] transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 stroke-[2]" />
          <span className="text-[9px] font-medium">Criar</span>
        </div>

        {/* Nav item: Caixa */}
        <div
          id="nav-caixa"
          title="Caixa"
          className="w-14 h-14 rounded-2xl border border-dashed border-[#94BFFF] text-[#4A6D9C] flex flex-col items-center justify-center gap-1 opacity-70 hover:opacity-100 hover:bg-[#E2EDFC] transition-all cursor-pointer"
        >
          <Inbox className="w-4 h-4 stroke-[2]" />
          <span className="text-[9px] font-medium">Caixa</span>
        </div>
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
            className="w-10 h-10 rounded-full bg-[#152744] text-white flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm overflow-hidden hover:ring-2 hover:ring-[#0055FF] transition-all"
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
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
            </div>
            <button
              id="sidebar-logout-btn"
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-left"
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
