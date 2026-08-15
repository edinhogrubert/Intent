import React, { useState } from 'react';
import { LogIn, UserPlus, ArrowRight, ShieldCheck, Sparkles, CheckCircle2, AlertCircle, UserCheck, Zap } from 'lucide-react';
import { UserAccount } from '../types';
import { auth, googleProvider, signInWithPopup } from '../utils/firebase';
import { setCurrentSessionUser, registerNewUser, loginUser, getStoredUsers, createDefaultUserFields } from '../utils/storage';
import { PRESET_TEST_PERSONAS, createGuestUser, switchPersona, TestPersona } from '../utils/testPersonas';

interface AuthGateProps {
  onAuthenticated: (user: UserAccount) => void;
}

export function AuthGate({ onAuthenticated }: AuthGateProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const userAccount = createDefaultUserFields({
        id: fbUser.uid,
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Usuário Intent',
        email: fbUser.email || 'usuario@google.com',
        avatarUrl: fbUser.photoURL || undefined,
      });
      setCurrentSessionUser(userAccount);
      setSuccessMsg('Autenticado com Google com sucesso!');
      setTimeout(() => {
        onAuthenticated(userAccount);
      }, 400);
    } catch (err: unknown) {
      console.error('Google Sign In Error:', err);
      setErrorMsg('Não foi possível conectar com o Google. Verifique a janela de login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstantGuestLogin = () => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const guest = createGuestUser();
      setSuccessMsg(`Sessão Temporária ativada! Acessando como ${guest.name}...`);
      setTimeout(() => {
        onAuthenticated(guest);
      }, 300);
    } catch (err) {
      console.error(err);
      setErrorMsg('Erro ao iniciar sessão temporária.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPersona = (persona: TestPersona) => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const user = switchPersona(persona);
      setSuccessMsg(`Acessando como ${persona.name} (${persona.badge})...`);
      setTimeout(() => {
        onAuthenticated(user);
      }, 300);
    } catch (err) {
      console.error(err);
      setErrorMsg('Erro ao selecionar perfil.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (isRegisterMode) {
        if (!name.trim()) {
          setErrorMsg('Por favor, informe seu nome.');
          setIsLoading(false);
          return;
        }
        if (!email.trim()) {
          setErrorMsg('Por favor, informe seu e-mail.');
          setIsLoading(false);
          return;
        }
        const user = registerNewUser(name, email, password);
        setSuccessMsg('Cadastro realizado com sucesso! Redirecionando...');
        setTimeout(() => {
          onAuthenticated(user);
        }, 300);
      } else {
        if (!email.trim()) {
          setErrorMsg('Por favor, informe seu e-mail cadastrado.');
          setIsLoading(false);
          return;
        }
        const user = loginUser(email, password);
        setSuccessMsg('Login realizado com sucesso! Acessando...');
        setTimeout(() => {
          onAuthenticated(user);
        }, 300);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Ocorreu um erro. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = () => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const users = getStoredUsers();
      const demo = users[0] || registerNewUser('Rafael', 'rafael@exemplo.com', '123');
      setCurrentSessionUser(demo);
      onAuthenticated(demo);
    } catch (err) {
      console.error(err);
      setErrorMsg('Erro ao iniciar demonstração.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="auth-gate-container"
      className="min-h-screen w-full bg-[#F0F5FD] flex items-center justify-center p-4 md:p-8"
    >
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-[#DCE7F6] overflow-hidden grid md:grid-cols-12 min-h-[580px]">
        {/* Left Side: Brand Visual & Instructions */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#152744] via-[#102038] to-[#0A1628] p-8 md:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-[#0055FF]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-[#0055FF]/30 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-[#0055FF] text-white flex items-center justify-center font-black text-xl tracking-tight shadow-md">
                IT
              </div>
              <span className="text-xl font-bold tracking-tight text-white">Portal Intent</span>
            </div>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs text-blue-200 backdrop-blur-xs border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Acesso Protegido</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold leading-tight tracking-tight">
                {isRegisterMode ? 'Crie sua conta para começar' : 'Acesse o conteúdo do index'}
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                Ninguém acessa o index sem estar autenticado. Uma vez cadastrado, você continua
                de onde parou quando retornar.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 space-y-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0055FF]" />
              <span>Sincronização com Firebase Firestore</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0055FF]" />
              <span>Saudação inteligente por horário</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0055FF]" />
              <span>Persistência contínua de sessão</span>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Form */}
        <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-center bg-white">
          {/* Instant Guest / Anonymous Test Button (1 Click, No Registration) */}
          <div className="mb-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-slate-900 block">Sessão Temporária para Testadores</span>
                <span className="text-[11px] text-slate-600 block">Acesso imediato em 1 clique sem criar conta ou senha.</span>
              </div>
            </div>
            <button
              id="instant-guest-btn"
              type="button"
              onClick={handleInstantGuestLogin}
              disabled={isLoading}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Entrar Sem Cadastro</span>
            </button>
          </div>

          {/* Google Sign In Quick Button */}
          <button
            id="google-signin-btn"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3.5 px-4 mb-6 rounded-xl border-2 border-[#BFD7FE] bg-[#F4F8FF] hover:bg-[#EAF2FF] text-[#0047E0] font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-3 cursor-pointer hover:border-[#0055FF] active:scale-[0.99] disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continuar com Google (Recomendado)</span>
          </button>

          <div className="relative flex py-2 items-center mb-6">
            <div className="grow border-t border-slate-200"></div>
            <span className="shrink mx-4 text-xs text-slate-400 font-medium uppercase tracking-wider">ou com e-mail</span>
            <div className="grow border-t border-slate-200"></div>
          </div>

          {/* Tabs: Entrar vs Cadastrar */}
          <div className="flex bg-[#F0F5FD] p-1.5 rounded-2xl mb-6 border border-[#DCE7F6]">
            <button
              id="tab-login"
              type="button"
              onClick={() => {
                setIsRegisterMode(false);
                setErrorMsg(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                !isRegisterMode
                  ? 'bg-white text-[#0055FF] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Entrar</span>
            </button>
            <button
              id="tab-register"
              type="button"
              onClick={() => {
                setIsRegisterMode(true);
                setErrorMsg(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                isRegisterMode
                  ? 'bg-white text-[#0055FF] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Cadastrar</span>
            </button>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegisterMode && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nome Completo
                </label>
                <input
                  id="input-name"
                  type="text"
                  placeholder="Ex: Rafael Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0055FF] focus:border-transparent transition-all placeholder:text-slate-400"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                E-mail
              </label>
              <input
                id="input-email"
                type="email"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0055FF] focus:border-transparent transition-all placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Senha (opcional para teste)
              </label>
              <input
                id="input-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0055FF] focus:border-transparent transition-all placeholder:text-slate-400"
              />
            </div>

            <button
              id="submit-auth-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl bg-[#0055FF] hover:bg-[#0047E0] disabled:opacity-60 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-6 active:scale-[0.99] cursor-pointer"
            >
              <span>{isLoading ? 'Conectando...' : isRegisterMode ? 'Concluir Cadastro e Entrar' : 'Entrar no Index'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Test Persona Quick Access Grid */}
          <div className="mt-6 pt-4 border-t border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#0055FF]" />
                <span>Alternar Perfil em 1 Clique (Etapa 4):</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Sem Senha</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {PRESET_TEST_PERSONAS.map((persona) => (
                <button
                  key={persona.id}
                  type="button"
                  onClick={() => handleSelectPersona(persona)}
                  disabled={isLoading}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-left transition-all cursor-pointer group disabled:opacity-50"
                >
                  <span className="text-[10px] font-bold text-blue-700 block group-hover:text-blue-900">
                    {persona.badge}
                  </span>
                  <span className="text-xs font-bold text-slate-800 block truncate">
                    {persona.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
