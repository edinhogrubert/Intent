import React, { useState, useEffect } from 'react';
import { Code2 } from 'lucide-react';

interface DevInspectorBadgeProps {
  file: string; // e.g. "src/components/IntentManager.tsx"
  functionName?: string; // e.g. "renderIntentCard()" or "IntentCard"
  className?: string;
}

// Global state / listener for dev mode toggle so all badges update live
let globalShowDevBadges = true;
const listeners = new Set<(show: boolean) => void>();

export const toggleGlobalDevBadges = (val?: boolean) => {
  globalShowDevBadges = val !== undefined ? val : !globalShowDevBadges;
  try {
    localStorage.setItem('intent_os_dev_badges_active', globalShowDevBadges ? 'true' : 'false');
  } catch {}
  listeners.forEach((fn) => fn(globalShowDevBadges));
  return globalShowDevBadges;
};

export const getGlobalDevBadgesState = (): boolean => {
  try {
    const saved = localStorage.getItem('intent_os_dev_badges_active');
    if (saved !== null) {
      return saved === 'true';
    }
  } catch {}
  return true; // Default to ON so user sees badges right away
};

export const DevInspectorBadge: React.FC<DevInspectorBadgeProps> = ({
  file,
  functionName,
  className = '',
}) => {
  const [visible, setVisible] = useState<boolean>(getGlobalDevBadgesState());

  useEffect(() => {
    const handler = (show: boolean) => setVisible(show);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      title={`Arquivo: ${file}${functionName ? ` | Função: ${functionName}` : ''}`}
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-900/90 text-amber-300 font-mono text-[9px] font-semibold border border-amber-400/40 shadow-xs z-20 pointer-events-auto select-none ${className}`}
    >
      <Code2 className="w-2.5 h-2.5 text-amber-400 shrink-0" />
      <span className="truncate max-w-[220px]">
        {file}
        {functionName ? ` › ${functionName}` : ''}
      </span>
    </div>
  );
};
