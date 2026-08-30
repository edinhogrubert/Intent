import { Home, Compass, PlusCircle, Inbox, User } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function MobileBottomNav({ activeTab, onTabChange }: MobileBottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#D9E5F5] flex items-center justify-around px-2 z-50 md:hidden select-none shadow-lg">
      {/* 1. Início */}
      <button
        onClick={() => onTabChange('inicio')}
        className={`flex flex-col items-center justify-center gap-0.5 w-12 h-12 rounded-xl transition-all ${
          activeTab === 'inicio' ? 'text-[#0055FF] font-bold' : 'text-[#4A6D9C]'
        }`}
      >
        <Home className={`w-5 h-5 ${activeTab === 'inicio' ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span className="text-[9px]">Início</span>
      </button>

      {/* 2. Explorar */}
      <button
        onClick={() => onTabChange('explorar')}
        className={`flex flex-col items-center justify-center gap-0.5 w-12 h-12 rounded-xl transition-all ${
          activeTab === 'explorar' ? 'text-[#0055FF] font-bold' : 'text-[#4A6D9C]'
        }`}
      >
        <Compass className={`w-5 h-5 ${activeTab === 'explorar' ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span className="text-[9px]">Explorar</span>
      </button>

      {/* 3. Criar (Central button highlighted) */}
      <button
        onClick={() => onTabChange('criar')}
        className="relative -top-3 w-14 h-14 rounded-full bg-gradient-to-br from-[#0055FF] to-blue-600 text-white flex flex-col items-center justify-center gap-0.5 shadow-md active:scale-95 transition-all"
      >
        <PlusCircle className="w-6 h-6 stroke-[2.5]" />
        <span className="text-[8px] font-black uppercase tracking-wider">Criar</span>
      </button>

      {/* 4. Minhas */}
      <button
        onClick={() => onTabChange('minhas')}
        className={`flex flex-col items-center justify-center gap-0.5 w-12 h-12 rounded-xl transition-all ${
          activeTab === 'minhas' ? 'text-[#0055FF] font-bold' : 'text-[#4A6D9C]'
        }`}
      >
        <Inbox className={`w-5 h-5 ${activeTab === 'minhas' ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span className="text-[9px]">Minhas</span>
      </button>

      {/* 5. Perfil */}
      <button
        onClick={() => onTabChange('perfil')}
        className={`flex flex-col items-center justify-center gap-0.5 w-12 h-12 rounded-xl transition-all ${
          activeTab === 'perfil' ? 'text-[#0055FF] font-bold' : 'text-[#4A6D9C]'
        }`}
      >
        <User className={`w-5 h-5 ${activeTab === 'perfil' ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span className="text-[9px]">Perfil</span>
      </button>
    </nav>
  );
}
