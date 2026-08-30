import { useState, useEffect } from 'react';
import { UserAccount } from './types';
import { getCurrentSessionUser, logoutUser, deleteUserAccount, createDefaultUserFields } from './utils/storage';
import { getGreetingConfig, formatCurrentDate } from './utils/time';
import { AuthGate } from './components/AuthGate';
import { IntentManager } from './components/IntentManager';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { DeleteAccountModal } from './components/DeleteAccountModal';
import { UserProfileModal } from './components/UserProfileModal';
import { StagesChecklistModal } from './components/StagesChecklistModal';
import { LandingHeroView } from './components/LandingHeroView';
import { ExploreFeedView } from './components/ExploreFeedView';
import { CreationWizard } from './components/CreationWizard';
import { MyIntentsDashboard } from './components/MyIntentsDashboard';
import { IntentDetailView } from './components/IntentDetailView';
import { IntentCelebrationView } from './components/IntentCelebrationView';
import { NotificationsView } from './components/NotificationsView';
import { MessagesView } from './components/MessagesView';
import { UserProfileView } from './components/UserProfileView';
import { SettingsView } from './components/SettingsView';
import { auth, signOut, onAuthStateChanged } from './utils/firebase';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  
  // Custom navigation state (Feed, Explorar, Criar, Minhas, Perfil, etc.)
  const [activeTab, setActiveTab] = useState<string>('inicio');

  // Load session & sync with Firebase Auth
  useEffect(() => {
    // 1. Check local session
    const stored = getCurrentSessionUser();
    if (stored) {
      setCurrentUser(stored);
    }

    // 2. Listen to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // Firebase user authenticated
        if (stored) {
          setCurrentUser({
            ...stored,
            id: fbUser.uid,
          });
        } else {
          const autoUser = createDefaultUserFields({
            id: fbUser.uid,
            name: fbUser.displayName || 'Usuário Intent',
            email: fbUser.email || 'usuario@intent.app',
            avatarUrl: fbUser.photoURL || undefined,
          });
          setCurrentUser(autoUser);
        }
      }
      setIsLoaded(true);
    });

    const interval = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 10000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    logoutUser();
    setCurrentUser(null);
  };

  const handleConfirmDeleteAccount = async () => {
    if (currentUser) {
      try {
        await signOut(auth);
      } catch {
        // ignore
      }
      deleteUserAccount(currentUser.id);
      setCurrentUser(null);
      setShowDeleteModal(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen w-full bg-[#F4F7FC] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#0055FF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If user is not logged in, render the Auth Gate (nobody accesses index without login/cadastrar)
  if (!currentUser) {
    return <AuthGate onAuthenticated={(user) => setCurrentUser(user)} />;
  }

  const greetingConfig = getGreetingConfig(currentHour);

  return (
    <div className="min-h-screen w-full bg-[#F4F7FC] flex flex-row overflow-x-hidden font-sans text-slate-900 pb-16 md:pb-0">
      {/* Left Navigation Sidebar */}
      <Sidebar
        user={currentUser}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        onRequestDelete={() => setShowDeleteModal(true)}
        onOpenChecklist={() => setShowChecklistModal(true)}
        onUserChanged={(newUser) => setCurrentUser(newUser)}
      />

      {/* Main Content View */}
      <main className="flex-1 flex flex-col p-3 sm:p-6 md:p-8 max-w-7xl mx-auto overflow-y-auto w-full">
        {/* Route: Landing / Primeiro Acesso */}
        {activeTab === 'primeiro-acesso' && (
          <LandingHeroView
            onStart={() => setActiveTab('inicio')}
            onExplore={() => setActiveTab('explorar')}
            onViewDemo={() => setActiveTab('detalhe')}
          />
        )}

        {/* Route: Explorar Feed */}
        {activeTab === 'explorar' && (
          <ExploreFeedView
            onSelectIntent={(_id) => setActiveTab('detalhe')}
          />
        )}

        {/* Route: Criar Nova Intent */}
        {activeTab === 'criar' && (
          <CreationWizard
            currentUser={currentUser}
            onCancel={() => setActiveTab('inicio')}
            onComplete={(_created) => setActiveTab('minhas')}
          />
        )}

        {/* Route: Minhas Intents Dashboard */}
        {activeTab === 'minhas' && (
          <MyIntentsDashboard
            currentUser={currentUser}
            onCreateNew={() => setActiveTab('criar')}
            onSelectIntent={(_id) => setActiveTab('detalhe')}
          />
        )}

        {/* Route: Detalhes da Intent em Andamento */}
        {activeTab === 'detalhe' && (
          <IntentDetailView
            onBack={() => setActiveTab('inicio')}
            onCelebrationView={() => setActiveTab('celebracao')}
          />
        )}

        {/* Route: Revelação & Celebração (100% Desbloqueado) */}
        {activeTab === 'celebracao' && (
          <IntentCelebrationView
            onBack={() => setActiveTab('detalhe')}
          />
        )}

        {/* Route: Mensagens / Chat Direto */}
        {activeTab === 'mensagens' && (
          <MessagesView
            currentUser={currentUser}
            onOpenIntent={(_id) => setActiveTab('detalhe')}
          />
        )}

        {/* Route: Notificações */}
        {activeTab === 'notificacoes' && (
          <NotificationsView
            onViewReveal={() => setActiveTab('celebracao')}
          />
        )}

        {/* Route: Perfil do Usuário */}
        {activeTab === 'perfil' && (
          <UserProfileView
            user={currentUser}
            onEditProfile={() => setActiveTab('configuracoes')}
            onSelectIntent={(_id) => setActiveTab('detalhe')}
          />
        )}

        {/* Route: Configurações */}
        {activeTab === 'configuracoes' && (
          <SettingsView
            currentUser={currentUser}
            onUpdateUser={(updated) =>
              setCurrentUser((prev) => (prev ? { ...prev, ...updated } : prev))
            }
          />
        )}

        {/* Route: Início & Stage Workflows (IntentManager) */}
        {activeTab === 'inicio' || activeTab.startsWith('etapa') ? (
          <section id="intent-section" className="w-full">
            <IntentManager
              user={currentUser}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </section>
        ) : null}
      </main>

      {/* Sticky Mobile Bottom Navigation Bar */}
      <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* User Profile & Identity Management Modal (Etapa 1) */}
      <UserProfileModal
        isOpen={showProfileModal}
        user={currentUser}
        onClose={() => setShowProfileModal(false)}
        onUpdateUser={(updated) => setCurrentUser(updated)}
      />

      {/* Account Deletion / Unsubscription Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        user={currentUser}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDeleteAccount}
      />

      {/* Architectural Checklist & Concrete Tests Modal (Etapas 1 a 8) */}
      <StagesChecklistModal
        isOpen={showChecklistModal}
        onClose={() => setShowChecklistModal(false)}
      />
    </div>
  );
}

