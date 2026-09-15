import { useEffect, useState } from 'react';
import { AlertCircle, Bell, Check, CheckCheck, Heart, LoaderCircle, MessageSquare, ShieldCheck, Sparkles, UserPlus, X } from 'lucide-react';
import {
  IntentApiError,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type ApiNotification,
} from '../services/intentApi';

interface NotificationsModalProps {
  onClose: () => void;
  onRead: () => void;
  onAllRead?: () => void;
  onSelectIntent?: (intentId: string) => void;
}

type NotificationFilter = 'all' | 'unread' | 'read';

const notificationFilters: Array<{ value: NotificationFilter; label: string }> = [
  { value: 'all', label: 'Todas' },
  { value: 'unread', label: 'Não lidas' },
  { value: 'read', label: 'Lidas' },
];

const emptyMessages: Record<NotificationFilter, string> = {
  all: 'Nenhuma notificação.',
  unread: 'Nenhuma notificação não lida.',
  read: 'Nenhuma notificação lida.',
};

function notificationText(notification: ApiNotification): string {
  const actor = notification.actor.displayName;
  const intentTitle = notification.intent?.title ? ` "${notification.intent.title}"` : '';
  switch (notification.type) {
    case 'INTENT_REACTION_RECEIVED': return `${actor} reagiu à sua Intent${intentTitle}.`;
    case 'INTENT_COMMENT_RECEIVED': return `${actor} comentou na sua Intent${intentTitle}.`;
    case 'USER_FOLLOWED':
    case 'FOLLOW_RECEIVED': return `${actor} começou a seguir você.`;
    case 'INTENT_REALIZED': return `Sua Intent${intentTitle} foi realizada com sucesso!`;
    case 'GUARDIAN_ACTION':
    case 'GUARDIAN_APPROVAL_RECEIVED': return `${actor} aprovou sua Intent${intentTitle}.`;
    case 'SUPPORT_RECEIVED': return `${actor} apoiou sua Intent${intentTitle}.`;
    default: return 'Você recebeu uma nova notificação.';
  }
}

function NotificationTypeIcon({ type }: { type: string }) {
  switch (type) {
    case 'INTENT_REACTION_RECEIVED': return <Heart className="w-3.5 h-3.5 text-[#ba1a1a]"/>;
    case 'INTENT_COMMENT_RECEIVED': return <MessageSquare className="w-3.5 h-3.5 text-[#000666]"/>;
    case 'USER_FOLLOWED':
    case 'FOLLOW_RECEIVED': return <UserPlus className="w-3.5 h-3.5 text-[#006e1c]"/>;
    case 'INTENT_REALIZED': return <Sparkles className="w-3.5 h-3.5 text-[#8f4e00]"/>;
    case 'GUARDIAN_ACTION':
    case 'GUARDIAN_APPROVAL_RECEIVED': return <ShieldCheck className="w-3.5 h-3.5 text-[#4e58a9]"/>;
    default: return <Bell className="w-3.5 h-3.5 text-[#000666]"/>;
  }
}

function notificationDate(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function NotificationsModal({ onClose, onRead, onAllRead, onSelectIntent }: NotificationsModalProps) {
  const [items, setItems] = useState<ApiNotification[]>([]);
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState('');

  const unreadCount = items.filter((notification) => notification.readAt === null).length;

  const visibleItems = items.filter((notification) => {
    if (filter === 'unread') return notification.readAt === null;
    if (filter === 'read') return notification.readAt !== null;
    return true;
  });

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
      onRead();
    } catch (caught) {
      setError(caught instanceof IntentApiError
        ? caught.message
        : 'Não foi possível marcar a notificação como lida.');
    } finally {
      setMarkingId(null);
    }
  }

  async function handleNotificationClick(notification: ApiNotification) {
    if (!notification.intent?.id) return;
    const targetIntentId = notification.intent.id;
    if (!notification.readAt) {
      try {
        await markNotificationRead(notification.id);
        onRead();
      } catch {
        // Falha de leitura não deve decrementar o contador.
      }
    }
    onSelectIntent?.(targetIntentId);
    onClose();
  }

  async function handleMarkAllAsRead() {
    if (markingAll || unreadCount === 0) return;
    setMarkingAll(true);
    setError('');
    try {
      await markAllNotificationsRead();
      const now = new Date().toISOString();
      setItems((current) => current.map((item) => ({ ...item, readAt: item.readAt || now })));
      onAllRead?.();
    } catch (caught) {
      setError(caught instanceof IntentApiError
        ? caught.message
        : 'Não foi possível marcar todas as notificações como lidas.');
    } finally {
      setMarkingAll(false);
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

      <div className="px-5 py-3 border-b border-[#e4e2de] flex items-center justify-between gap-2 flex-wrap" aria-label="Filtrar notificações">
        <div className="flex gap-2">
        {notificationFilters.map((option) => <button
          key={option.value}
          type="button"
          aria-pressed={filter === option.value}
          onClick={() => setFilter(option.value)}
          className={`px-3 py-1.5 rounded-full text-sm font-bold transition-colors ${filter === option.value ? 'bg-[#000666] text-white' : 'bg-[#f5f3ef] text-[#555] hover:bg-[#e9e7e2]'}`}
        >{option.label}{option.value === 'unread' && unreadCount > 0 && <span className="ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full bg-[#ba1a1a] text-white">{unreadCount}</span>}</button>)}
        </div>
        {unreadCount > 0 && <button
          type="button"
          onClick={() => void handleMarkAllAsRead()}
          disabled={markingAll}
          className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#000666] hover:bg-[#f0efff] transition-colors flex items-center gap-1.5 disabled:opacity-50"
        >{markingAll ? <LoaderCircle className="w-3.5 h-3.5 animate-spin"/> : <CheckCheck className="w-3.5 h-3.5"/>}Marcar todas como lidas</button>}
      </div>

      <div className="overflow-y-auto">
        {loading && <div className="p-10 text-center text-sm text-[#666]"><LoaderCircle className="w-6 h-6 animate-spin mx-auto mb-3"/>Carregando notificações...</div>}
        {!loading && error && items.length === 0 && <div role="alert" className="m-5 rounded-xl bg-[#ffdad6] p-4 text-sm text-[#8c1d18] flex gap-2"><AlertCircle className="w-4 h-4 mt-0.5 shrink-0"/>{error}</div>}
        {!loading && !error && visibleItems.length === 0 && <div className="p-10 text-center"><Bell className="w-8 h-8 text-[#8b8994] mx-auto mb-3"/><p className="font-bold">{emptyMessages[filter]}</p><p className="text-sm text-[#666] mt-1">As novas atividades aparecerão aqui.</p></div>}
        {error && items.length > 0 && <div role="alert" className="m-4 rounded-xl bg-[#ffdad6] p-3 text-sm text-[#8c1d18]">{error}</div>}
        <div className="divide-y divide-[#e4e2de]">{visibleItems.map((notification) => <article
          key={notification.id}
          {...(notification.intent?.id ? {
            role: 'button',
            tabIndex: 0,
            onClick: () => void handleNotificationClick(notification),
            onKeyDown: (event: React.KeyboardEvent) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                void handleNotificationClick(notification);
              }
            },
            'aria-label': `Abrir Intent ${notification.intent.title ? `"${notification.intent.title}"` : ''}`.trim(),
          } : {})}
          className={`p-4 flex gap-3 ${notification.intent?.id
            ? `cursor-pointer transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#000666] focus-visible:ring-inset ${notification.readAt ? 'bg-white hover:bg-[#f7f6fc]' : 'bg-[#f0efff] hover:bg-[#e4e2fc]'}`
            : notification.readAt ? 'bg-white' : 'bg-[#f0efff]'}`}
        >
          <div className="relative shrink-0">
          <div className="w-10 h-10 rounded-full bg-[#e0e0ff] text-[#000666] overflow-hidden flex items-center justify-center font-black">
            {notification.actor.avatarUrl ? <img src={notification.actor.avatarUrl} alt="" className="w-full h-full object-cover"/> : notification.actor.displayName.charAt(0).toUpperCase()}
          </div>
          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border border-[#e4e2de] shadow-xs flex items-center justify-center"><NotificationTypeIcon type={notification.type}/></span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm leading-relaxed">{notificationText(notification)}</p>
            <p className="text-xs text-[#666] mt-1">{notificationDate(notification.createdAt)}</p>
          </div>
          {notification.readAt
            ? <span className="text-[#28642f]" title="Lida"><Check className="w-4 h-4"/></span>
            : <button type="button" onClick={(event) => { event.stopPropagation(); void markAsRead(notification); }} onKeyDown={(event) => event.stopPropagation()} disabled={markingId !== null} className="self-center px-3 py-2 rounded-xl text-xs font-bold text-[#000666] border border-[#b8b7d8] bg-white disabled:opacity-50">{markingId === notification.id ? <LoaderCircle className="w-4 h-4 animate-spin"/> : 'Marcar como lida'}</button>}
        </article>)}</div>
      </div>
    </section>
  </div>;
}
