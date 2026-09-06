import { useState, useEffect } from 'react';
import { Sparkles, Sun, SunMedium, Moon, Clock, Check, RefreshCw } from 'lucide-react';
import { UserAccount, TimeOfDay } from '../types';
import { getGreetingConfig, getTimeOfDay, formatTime } from '../utils/time';
import { DevInspectorBadge } from './DevInspectorBadge';

interface DynamicGreetingCardProps {
  user: UserAccount;
}

export function DynamicGreetingCard({ user }: DynamicGreetingCardProps) {
  // Mode: null means real-time device clock; otherwise a simulated hour (e.g. 9 for morning, 15 for afternoon, 21 for night)
  const [simulatedHour, setSimulatedHour] = useState<number | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [buttonClickedMessage, setButtonClickedMessage] = useState<string | null>(null);
  const [clickCount, setClickCount] = useState(0);

  // Update clock every second when in real-time mode
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeHour = simulatedHour !== null ? simulatedHour : currentDate.getHours();
  const greeting = getGreetingConfig(activeHour);
  const currentPeriod = getTimeOfDay(activeHour);

  // Calculate day progress percentage (0 to 100%)
  const minutesIntoDay = activeHour * 60 + currentDate.getMinutes();
  const dayProgressPercent = Math.min(100, Math.max(0, Math.round((minutesIntoDay / 1440) * 100)));

  const handleDynamicButtonClick = () => {
    setClickCount((prev) => prev + 1);
    let msg = '';
    if (greeting.period === 'morning') {
      msg = `Tenha um excelente e produtivo dia, ${user.name}! ☀️`;
    } else if (greeting.period === 'afternoon') {
      msg = `Ótima tarde para você, ${user.name}! Continue com tudo! 🌤️`;
    } else {
      msg = `Uma noite tranquila e revigorante para você, ${user.name}! 🌙`;
    }
    setButtonClickedMessage(msg);
    setTimeout(() => {
      setButtonClickedMessage(null);
    }, 4000);
  };

  const getGreetingIcon = (period: TimeOfDay) => {
    switch (period) {
      case 'morning':
        return <Sun className="w-5 h-5 text-amber-500" />;
      case 'afternoon':
        return <SunMedium className="w-5 h-5 text-orange-500" />;
      case 'night':
        return <Moon className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div
      id="main-greeting-card"
      className="bg-white rounded-3xl border border-dashed border-[#94BFFF] p-6 md:p-8 shadow-xs relative flex flex-col justify-between"
    >
      <DevInspectorBadge
        file="src/components/DynamicGreetingCard.tsx"
        functionName="DynamicGreetingCard"
        className="mb-1"
      />
      {/* Top Header Row in Card */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E2EDFF] text-[#0055FF] text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Saudação Dinâmica</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{greeting.heading}</span>
            {getGreetingIcon(currentPeriod)}
          </h2>
          <p className="text-sm text-slate-500 mt-1">{greeting.description}</p>
        </div>

        {/* Right side metric (matches 98% Progresso from screenshot) */}
        <div className="text-right">
          <div className="text-3xl md:text-4xl font-extrabold text-[#0055FF] tracking-tight">
            {simulatedHour !== null
              ? `${String(simulatedHour).padStart(2, '0')}:00`
              : formatTime(currentDate).slice(0, 5)}
          </div>
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            {simulatedHour !== null ? 'Horário Simulado' : 'Horário Atual'}
          </div>
        </div>
      </div>

      {/* Center Row: Day Progress indicator matching the blue bar from the screenshot */}
      <div className="my-4">
        <div className="flex justify-between text-xs text-slate-500 mb-2 font-medium">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Período ativo: {greeting.timeRange}</span>
          </span>
          <span className="text-slate-400">Ciclo do dia: {dayProgressPercent}%</span>
        </div>

        <div className="w-full h-2 bg-[#E9F1FC] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0055FF] rounded-full transition-all duration-700 ease-out"
            style={{ width: `${dayProgressPercent}%` }}
          />
        </div>
      </div>

      {/* Interactive Feedback Message Banner when button is clicked */}
      {buttonClickedMessage && (
        <div className="my-3 p-3.5 bg-[#EAF2FF] border border-[#BFD7FE] text-[#0047E0] text-sm rounded-xl font-medium flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#0055FF] shrink-0" />
            <span>{buttonClickedMessage}</span>
          </div>
          <span className="text-xs text-blue-500 font-semibold bg-white/70 px-2 py-0.5 rounded-md">
            Clique #{clickCount}
          </span>
        </div>
      )}

      {/* Bottom Row: Time Switcher / Tester on Left & The Requested Dynamic Button on Right */}
      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-2">
        {/* Quick Period Tester (Allows instantaneous verification of Manhã / Tarde / Noite) */}
        <div className="flex items-center gap-1.5 bg-[#F0F5FD] p-1 rounded-xl border border-[#DCE7F6]">
          <button
            id="time-auto-btn"
            type="button"
            title="Usar horário real do seu dispositivo"
            onClick={() => setSimulatedHour(null)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              simulatedHour === null
                ? 'bg-white text-[#0055FF] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <RefreshCw className="w-3 h-3" />
            <span>Tempo Real</span>
          </button>
          <button
            id="time-morning-btn"
            type="button"
            title="Simular 09:00 (Manhã)"
            onClick={() => setSimulatedHour(9)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              simulatedHour === 9
                ? 'bg-white text-[#0055FF] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Manhã
          </button>
          <button
            id="time-afternoon-btn"
            type="button"
            title="Simular 15:00 (Tarde)"
            onClick={() => setSimulatedHour(15)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              simulatedHour === 15
                ? 'bg-white text-[#0055FF] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Tarde
          </button>
          <button
            id="time-night-btn"
            type="button"
            title="Simular 21:00 (Noite)"
            onClick={() => setSimulatedHour(21)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              simulatedHour === 21
                ? 'bg-white text-[#0055FF] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Noite
          </button>
        </div>

        {/* THE MAIN DYNAMIC BUTTON REQUESTED BY USER */}
        <button
          id="dynamic-greeting-btn"
          type="button"
          onClick={handleDynamicButtonClick}
          className="px-8 py-3 rounded-xl bg-[#0055FF] hover:bg-[#0047E0] active:scale-95 text-white font-bold text-base shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{greeting.buttonText}</span>
          <Sparkles className="w-4 h-4 text-blue-200" />
        </button>
      </div>
    </div>
  );
}
