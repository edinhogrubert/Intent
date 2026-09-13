import { useEffect, useState } from 'react';
import { AlertCircle, Bell, Check, LoaderCircle, X } from 'lucide-react';
import {
  IntentApiError,
  listNotifications,
  markNotificationRead,
  type ApiNotification,
} from '../services/intentApi';

interface NotificationsModalProps {
  onClose: () => void;
}

function notificationText(notification: ApiNotification): string {
  const actor = notification.actor.displayName;
  if (notification.type === 'FOLLOW_RECEIVED') return `${actor} começou a seguir você.`;
  if (notification.type === 'SUPPORT_RECEIVED') return `${actor} apoiou sua Intent ${notification.intent?.title ?? ''}.`;
  return `${actor} aprovou sua Intent ${notification.intent?.title ?? ''}.`;
}

function notificationDate(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function NotificationsModal({ onClose }: NotificationsModalProps) {
  const [items, setItems] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    void listNotifications()
      .then((notifications) => { if (active) setItems(notifications); })
      .catch((caught) => {
        if (active) setError(caught instanceof IntentApiError
          ? caught.message
          : 'Não foi possível carregar as notificações.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function markAsRead(notification: ApiNotification) {
    if (notification.readAt || markingId) return;
    setMarkingId(notification.id);
    setError('');
    try {
      const updated = await markNotificationRead(notification.id);
      setItems((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (caught) {
      setError(caught instanceof IntentApiError
        ? caught.message
        : 'Não foi possível marcar a notificação como lida.');
    } finally {
      setMarkingId(null);
    }
  }

  return <div className="fixed inset-0 z-50 bg-black/50 p-4 flex items-center justify-center" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="notifications-title" className="w-full max-w-xl max-h-[85vh] rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col">
      <header className="px-5 py-4 border-b border-[#e4e2de] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-[#e0e0ff] text-[#000666] flex items-center justify-center"><Bell className="w-5 h-5"/></span>
          <div><h2 id="notifications-title" className="text-lg font-black">Notificações</h2><p className="text-xs text-[#666]">Atividades recentes da sua conta.</p></div>
        </div>
        <button type="button" onClick={onClose} aria-label="Fechar" className="p-2 rounded-full text-[#666] hover:bg-[#f5f3ef]"><X className="w-5 h-5"/></button>
      </header>

      <div className="overflow-y-auto">
        {loading && <div className="p-10 text-center text-sm text-[#666]"><LoaderCircle className="w-6 h-6 animate-spin mx-auto mb-3"/>Carregando notificações...</div>}
        {!loading && error && items.length === 0 && <div role="alert" className="m-5 rounded-xl bg-[#ffdad6] p-4 text-sm text-[#8c1d18] flex gap-2"><AlertCircle className="w-4 h-4 mt-0.5 shrink-0"/>{error}</div>}
        {!loading && !error && items.length === 0 && <div className="p-10 text-center"><Bell className="w-8 h-8 text-[#8b8994] mx-auto mb-3"/><p className="font-bold">Nenhuma notificação</p><p className="text-sm text-[#666] mt-1">As novas atividades aparecerão aqui.</p></div>}
        {error && items.length > 0 && <div role="alert" className="m-4 rounded-xl bg-[#ffdad6] p-3 text-sm text-[#8c1d18]">{error}</div>}
        <div className="divide-y divide-[#e4e2de]">{items.map((notification) => <article key={notification.id} className={`p-4 flex gap-3 ${notification.readAt ? 'bg-white' : 'bg-[#f0efff]'}`}>
          <div className="w-10 h-10 rounded-full bg-[#e0e0ff] text-[#000666] overflow-hidden flex items-center justify-center font-black shrink-0">
            {notification.actor.avatarUrl ? <img src={notification.actor.avatarUrl} alt="" className="w-full h-full object-cover"/> : notification.actor.displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm leading-relaxed">{notificationText(notification)}</p>
            <p className="text-xs text-[#666] mt-1">{notificationDate(notification.createdAt)}</p>
          </div>
          {notification.readAt
            ? <span className="text-[#28642f]" title="Lida"><Check className="w-4 h-4"/></span>
            : <button type="button" onClick={() => void markAsRead(notification)} disabled={markingId !== null} className="self-center px-3 py-2 rounded-xl text-xs font-bold text-[#000666] border border-[#b8b7d8] bg-white disabled:opacity-50">{markingId === notification.id ? <LoaderCircle className="w-4 h-4 animate-spin"/> : 'Marcar como lida'}</button>}
        </article>)}</div>
      </div>
    </section>
  </div>;
}
