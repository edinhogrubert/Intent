import { UserAccount } from '../types';
import { PRESET_TEST_PERSONAS, createGuestUser, switchPersona, TestPersona } from '../utils/testPersonas';
import { Zap, Users, UserCheck } from 'lucide-react';

interface TesterProfileSwitcherBarProps {
  currentUser: UserAccount;
  onUserChanged: (newUser: UserAccount) => void;
}

export function TesterProfileSwitcherBar({ currentUser, onUserChanged }: TesterProfileSwitcherBarProps) {
  const handleSwitchPersona = (persona: TestPersona) => {
    const updated = switchPersona(persona);
    onUserChanged(updated);
  };

  const handleNewGuest = () => {
    const guest = createGuestUser();
    onUserChanged(guest);
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-[#BFD7FE] p-3 shadow-xs space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-2xs">
            <Users className="w-3 h-3" />
            <span>Sessão & Perfis de Teste</span>
          </span>
          <span className="text-slate-600 text-[11px] font-medium hidden sm:inline">
            Troque de usuário com 1 clique para testar as permissões e quóruns da Etapa 4:
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 text-[11px]">Logado como:</span>
          <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 text-xs flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{currentUser.name}</span>
            <span className="text-[10px] font-mono text-emerald-600 font-normal">({currentUser.email})</span>
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <button
          onClick={handleNewGuest}
          className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-[11px] transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
          title="Criar novo visitante temporário sem cadastro"
        >
          <Zap className="w-3 h-3 fill-current" />
          <span>+ Criar Visitante Anônimo</span>
        </button>

        <span className="text-slate-300 mx-1">|</span>

        {PRESET_TEST_PERSONAS.map((persona) => {
          const isCurrent = currentUser.email.toLowerCase() === persona.email.toLowerCase();
          return (
            <button
              key={persona.id}
              onClick={() => handleSwitchPersona(persona)}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                isCurrent
                  ? 'bg-[#0055FF] text-white border-[#0055FF] shadow-2xs'
                  : 'bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border-slate-200'
              }`}
            >
              <span>{persona.badge}</span>
              <span>{persona.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
