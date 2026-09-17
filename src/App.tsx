import { useEffect, useRef, useState } from 'react';
import { Bell, Home, LogOut, Pencil, PlusCircle, Target, UserRound } from 'lucide-react';
import type { UserAccount } from './types';
import { AuthGate } from './components/AuthGate';
import { CreationWizard } from './components/CreationWizard';
import { MyIntentsDashboard } from './components/MyIntentsDashboard';
import { MvpHomeFeed } from './components/MvpHomeFeed';
import { MvpIntentDetail } from './components/MvpIntentDetail';
import { MvpSocialProfile } from './components/MvpSocialProfile';
import { PublicUserProfile } from './components/PublicUserProfile';
import { EditProfileModal } from './components/EditProfileModal';
import { NotificationsModal } from './components/NotificationsModal';
import { auth, onAuthStateChanged, signOut } from './utils/firebase';
import { logoutUser, setCurrentSessionUser } from './utils/storage';
import { getUnreadNotificationCount, syncAuthenticatedUser } from './services/intentApi';

import { parseInitialLocation, syncUrlLocation } from './utils/shareLink';

type View = 'home' | 'create' | 'mine' | 'detail' | 'profile' | 'public-profile';
type SessionStatus = 'checking' | 'unauthenticated' | 'authenticated' | 'error';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('checking');
  const [sessionError, setSessionError] = useState('');
  const [initialTarget] = useState(() => parseInitialLocation());
  const [view, setView] = useState<View>(() => initialTarget.type === 'intent' ? 'detail'
    : initialTarget.type === 'user' ? 'public-profile' : initialTarget.type);
  const [selectedIntentId, setSelectedIntentId] = useState<string | null>(initialTarget.type === 'intent' ? initialTarget.id! : null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    initialTarget.type === 'user' || initialTarget.type === 'profile' ? initialTarget.id! : null);

  const [toast, setToast] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number | null>(null);
  const [publicProfileEditorOpen, setPublicProfileEditorOpen] = useState(false);
  const [publicProfileRefreshKey, setPublicProfileRefreshKey] = useState(0);
  const manualAuthentication = useRef(false);

  async function synchronizeSession() {
    if (!auth.currentUser) {
      setCurrentSessionUser(null); setCurrentUser(null); setSessionStatus('unauthenticated'); return;
    }
    setSessionStatus('checking'); setSessionError('');
    try {
      const account = await syncAuthenticatedUser(auth.currentUser);
      setCurrentUser(account); setSessionStatus('authenticated');
    } catch {
      setCurrentUser(null); setSessionError('Sua identidade foi confirmada, mas o perfil não pôde ser carregado.'); setSessionStatus('error');
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (manualAuthentication.current) return;
      if (!firebaseUser) {
        setCurrentSessionUser(null); setCurrentUser(null); setSessionStatus('unauthenticated'); return;
      }
      await synchronizeSession();
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    let active = true;
    if (sessionStatus !== 'authenticated' || !currentUser) {
      setUnreadCount(null);
      return () => { active = false; };
    }
    void getUnreadNotificationCount()
      .then((count) => { if (active) setUnreadCount(count); })
      .catch(() => { if (active) setUnreadCount(null); });
    return () => { active = false; };
  }, [sessionStatus, currentUser?.id]);

  async function handleLogout() {
    await signOut(auth);
    logoutUser(); setCurrentUser(null); setUnreadCount(null); setNotificationsOpen(false); setPublicProfileEditorOpen(false); navigateToView('home'); setSessionStatus('unauthenticated');
  }

  async function openNotifications() {
    setNotificationsOpen(true);
    try { setUnreadCount(await getUnreadNotificationCount()); }
    catch { setUnreadCount(null); }
  }

  function navigateToView(nextView: View, id?: string) {
    if (nextView === 'detail') setSelectedIntentId(id ?? null);
    if (nextView === 'profile' || nextView === 'public-profile') setSelectedProfileId(id ?? null);
    setView(nextView);
    syncUrlLocation(nextView, { intentId: nextView === 'detail' ? id ?? null : null,
      userId: nextView === 'profile' || nextView === 'public-profile' ? id ?? null : null });
  }
  function selectIntent(id: string) { navigateToView('detail', id); }
  function selectProfile(id: string) { navigateToView('profile', id); }
  function selectPublicProfile(id: string) { navigateToView('public-profile', id); }

  useEffect(() => {
    function handlePopState() {
      const target = parseInitialLocation();
      setSelectedIntentId(target.type === 'intent' ? target.id! : null);
      setSelectedProfileId(target.type === 'user' || target.type === 'profile' ? target.id! : null);
      setView(target.type === 'intent' ? 'detail' : target.type === 'user' ? 'public-profile' : target.type);
      setNotificationsOpen(false);
      setPublicProfileEditorOpen(false);
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (sessionStatus === 'checking') return <div className="min-h-screen bg-[#f5f6fb] flex items-center justify-center"><div className="w-9 h-9 border-4 border-[#000666] border-t-transparent rounded-full animate-spin"/></div>;

  if (sessionStatus === 'error') return <div className="min-h-screen bg-[#f5f6fb] flex items-center justify-center p-4"><div className="max-w-md w-full bg-white border border-[#e4e2de] rounded-2xl p-6 text-center"><h1 className="font-black text-lg">Não foi possível abrir o Intent</h1><p className="text-sm text-[#666] mt-2">{sessionError}</p><button onClick={() => void synchronizeSession()} className="w-full mt-5 py-3 bg-[#000666] text-white rounded-xl text-sm font-bold">Tentar novamente</button><button onClick={() => void handleLogout()} className="mt-4 text-sm font-bold text-[#666]">Sair desta conta</button></div></div>;

  if (sessionStatus === 'unauthenticated' || !currentUser) return <AuthGate
    onAuthFlowStart={() => { manualAuthentication.current = true; }}
    onAuthFlowEnd={() => { manualAuthentication.current = false; }}
    onAuthenticated={(account) => { setCurrentUser(account); setSessionStatus('authenticated'); }}
  />;

  const items: Array<{ id: View; label: string; icon: typeof Home }> = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'create', label: 'Criar', icon: PlusCircle },
    { id: 'mine', label: 'Minhas Intents', icon: Target },
    { id: 'profile', label: 'Perfil', icon: UserRound },
  ];
  const isViewingOwnPublicProfile = view === 'public-profile' && selectedProfileId === currentUser.id;

  return <div className="min-h-screen bg-[#f7f6fc] text-[#1b1c1a]">
    <header className="sticky top-0 z-30 bg-white border-b border-[#e4e2de]"><div className="max-w-5xl mx-auto h-16 px-4 flex items-center justify-between"><button onClick={() => navigateToView('home')} className="text-xl font-black tracking-tight text-[#000666]">INTENT</button><nav className="hidden sm:flex items-center gap-1">{items.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => { navigateToView(id, id === 'profile' ? currentUser.id : undefined); }} className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${view === id ? 'bg-[#e0e0ff] text-[#000666]' : 'text-[#666] hover:bg-[#f5f3ef]'}`}><Icon className="w-4 h-4"/>{label}</button>)}</nav><div className="flex items-center gap-2"><button type="button" onClick={() => void openNotifications()} className="relative p-2 rounded-full hover:bg-[#f5f3ef] text-[#666]" aria-label={unreadCount && unreadCount > 0 ? `Abrir notificações: ${unreadCount} não lidas` : 'Abrir notificações'}><Bell className="w-5 h-5"/>{unreadCount !== null && unreadCount > 0 && <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-[#ba1a1a] text-white text-[10px] font-black flex items-center justify-center border-2 border-white">{unreadCount > 9 ? '9+' : unreadCount}</span>}</button><button onClick={() => selectProfile(currentUser.id)} className="hidden md:block text-right"><p className="text-xs font-bold">{currentUser.name}</p><p className="text-[11px] text-[#666]">@{currentUser.username.replace(/^@+/, '')}</p></button><button onClick={() => void handleLogout()} className="p-2 rounded-full hover:bg-[#f5f3ef] text-[#666]" aria-label="Sair"><LogOut className="w-5 h-5"/></button></div></div></header>

    <main className="pb-24 sm:pb-8">
      {view === 'home' && <MvpHomeFeed currentUser={currentUser} onCreate={() => navigateToView('create')} onSelectIntent={selectIntent} onSelectProfile={selectPublicProfile}/>}
      {view === 'public-profile' && selectedProfileId && <>
        {isViewingOwnPublicProfile && <div className="max-w-4xl mx-auto px-4 pt-6 -mb-2 flex justify-end"><button type="button" onClick={() => setPublicProfileEditorOpen(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#000666] text-sm font-bold border border-[#c6c5d4] hover:bg-[#f7f6fc] transition-colors min-h-[44px]"><Pencil className="w-4 h-4"/>Editar perfil</button></div>}
        <PublicUserProfile key={`${selectedProfileId}:${publicProfileRefreshKey}`} userId={selectedProfileId} onBack={() => navigateToView('home')} onSelectIntent={selectIntent}/>
      </>}
      {view === 'create' && <CreationWizard currentUser={currentUser} onCancel={() => navigateToView('home')} onComplete={(created) => { setToast('Intent publicada com sucesso.'); selectIntent(created.id); }}/>}
      {view === 'mine' && <MyIntentsDashboard currentUser={currentUser} onCreateNew={() => navigateToView('create')} onSelectIntent={selectIntent}/>}
      {view === 'detail' && selectedIntentId && <MvpIntentDetail intentId={selectedIntentId} currentUser={currentUser} onBack={() => navigateToView('home')}/>}
      {view === 'profile' && <MvpSocialProfile
        userId={selectedProfileId || currentUser.id}
        currentUser={currentUser}
        onBack={() => navigateToView('home')}
        onSelectIntent={selectIntent}
        onSelectProfile={selectProfile}
        onCurrentUserUpdated={setCurrentUser}
      />}
    </main>

    <nav className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-[#e4e2de] px-2 py-2 flex justify-around">{items.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => { navigateToView(id, id === 'profile' ? currentUser.id : undefined); }} className={`min-w-16 py-1 flex flex-col items-center gap-1 text-[10px] font-bold ${view === id ? 'text-[#000666]' : 'text-[#777]'}`}><Icon className="w-5 h-5"/>{label}</button>)}</nav>
    {toast && <div role="status" className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#1b1c1a] text-white px-5 py-3 rounded-xl shadow-lg text-sm font-bold">{toast}</div>}
    {notificationsOpen && <NotificationsModal
      onClose={() => setNotificationsOpen(false)}
      onRead={() => setUnreadCount((count) => count === null ? null : Math.max(0, count - 1))}
      onAllRead={() => setUnreadCount(0)}
      onSelectIntent={selectIntent}
    />}
    {publicProfileEditorOpen && <EditProfileModal
      user={currentUser}
      onClose={() => setPublicProfileEditorOpen(false)}
      onSaved={(updated) => {
        setCurrentUser(updated);
        setPublicProfileRefreshKey((key) => key + 1);
      }}
    />}
  </div>;
}
