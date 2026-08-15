import { useState, useEffect } from 'react';
import { UserAccount } from './types';
import { getCurrentSessionUser, logoutUser, deleteUserAccount } from './utils/storage';
import { getGreetingConfig, getTimeOfDay, formatCurrentDate } from './utils/time';
import { AuthGate } from './components/AuthGate';
import { IntentManager } from './components/IntentManager';
import { Sidebar } from './components/Sidebar';
import { DynamicGreetingCard } from './components/DynamicGreetingCard';
import { AccountStatusCard } from './components/AccountStatusCard';
import { BottomCardsRow } from './components/BottomCardsRow';
import { DeleteAccountModal } from './components/DeleteAccountModal';
import { Flame } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentHour, setCurrentHour] = useState(new Date().getHours());

  // Load session on startup
  useEffect(() => {
    const user = getCurrentSessionUser();
    setCurrentUser(user);
    setIsLoaded(true);

    const interval = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  const handleConfirmDeleteAccount = () => {
    if (currentUser) {
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
    <div className="min-h-screen w-full bg-[#F4F7FC] flex flex-row overflow-x-hidden font-sans text-slate-900">
      {/* Left Navigation Sidebar */}
      <Sidebar
        user={currentUser}
        onLogout={handleLogout}
        onRequestDelete={() => setShowDeleteModal(true)}
      />

      {/* Main Content View (Index) */}
      <main className="flex-1 flex flex-col p-6 md:p-10 max-w-7xl mx-auto overflow-y-auto">
        {/* Top Greeting Header matching the screenshot ("Bom dia, Rafael.") */}
        <header className="mb-8">
          <h1
            id="page-title"
            className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight"
          >
            {greetingConfig.heading}, {currentUser.name}.
          </h1>
          <p className="text-sm md:text-base text-slate-500 mt-1.5 flex items-center gap-2">
            <span>Hoje é {formatCurrentDate()}</span>
            <span className="inline-block w-1 h-1 rounded-full bg-slate-400"></span>
            <span>Sua sessão está ativa e sincronizada.</span>
          </p>
        </header>

        {/* Section Header */}
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-4">
          <Flame className="w-4 h-4 text-[#0055FF]" />
          <span>Painel Principal</span>
        </div>

        {/* Primary Bento / Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <IntentManager />
          </div>
          {/* Side Card */}
          <div className="lg:col-span-4">
            <AccountStatusCard
              user={currentUser}
              onLogout={handleLogout}
              onRequestDelete={() => setShowDeleteModal(true)}
            />
          </div>
        </div>

        {/* Bottom Cards Row */}
        <BottomCardsRow user={currentUser} />
      </main>

      {/* Account Deletion / Unsubscription Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        user={currentUser}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDeleteAccount}
      />
    </div>
  );
}
