import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  LogIn,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import type { UserAccount } from '../types';
import {
  auth,
  createUserWithEmailAndPassword,
  googleProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from '../utils/firebase';
import { syncAuthenticatedUser } from '../services/intentApi';

interface AuthGateProps {
  onAuthenticated: (user: UserAccount) => void;
}

function getAuthErrorMessage(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code)
      : '';

  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'Este e-mail já possui uma conta.',
    'auth/invalid-credential': 'E-mail ou senha inválidos.',
    'auth/invalid-email': 'Informe um endereço de e-mail válido.',
    'auth/operation-not-allowed': 'Este método de acesso ainda não foi habilitado no Firebase.',
    'auth/popup-blocked': 'O navegador bloqueou a janela do Google. Permita pop-ups e tente novamente.',
    'auth/popup-closed-by-user': 'A janela do Google foi fechada antes da conclusão.',
    'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
    'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
  };

  if (code in messages) {
    return messages[code];
  }

  if (error instanceof Error && error.message.includes('Failed to fetch')) {
    return 'Não foi possível acessar a API do Intent. Verifique a conexão.';
  }

  return 'Não foi possível concluir a autenticação. Tente novamente.';
}

export function AuthGate({ onAuthenticated }: AuthGateProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const beginRequest = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);
  };

  const finishAuthentication = async (firebaseUser: Parameters<typeof syncAuthenticatedUser>[0]) => {
    const account = await syncAuthenticatedUser(firebaseUser);
    setSuccessMsg('Acesso confirmado com segurança.');
    onAuthenticated(account);
  };

  const handleGoogleSignIn = async () => {
    beginRequest();
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      await finishAuthentication(credential.user);
    } catch (error: unknown) {
      setErrorMsg(getAuthErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    beginRequest();

    try {
      const normalizedEmail = email.trim().toLowerCase();

      if (!normalizedEmail) {
        throw new Error('Informe seu e-mail.');
      }

      if (password.length < 6) {
        setErrorMsg('A senha precisa ter pelo menos 6 caracteres.');
        return;
      }

      if (isRegisterMode) {
        const displayName = name.trim();
        if (displayName.length < 2) {
          setErrorMsg('Informe seu nome.');
          return;
        }

        const credential = await createUserWithEmailAndPassword(
          auth,
          normalizedEmail,
          password,
        );
        await updateProfile(credential.user, { displayName });
        await finishAuthentication(credential.user);
        return;
      }

      const credential = await signInWithEmailAndPassword(
        auth,
        normalizedEmail,
        password,
      );
      await finishAuthentication(credential.user);
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'Informe seu e-mail.') {
        setErrorMsg(error.message);
      } else {
        setErrorMsg(getAuthErrorMessage(error));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const changeMode = (register: boolean) => {
    setIsRegisterMode(register);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#F0F5FD] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-[#DCE7F6] overflow-hidden grid md:grid-cols-12 min-h-[580px]">
        <section className="md:col-span-5 bg-gradient-to-br from-[#152744] via-[#102038] to-[#0A1628] p-8 md:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-[#0055FF]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-[#0055FF]/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-[#0055FF] flex items-center justify-center font-black text-xl shadow-md">
                IT
              </div>
              <span className="text-xl font-bold tracking-tight">Intent</span>
            </div>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs text-blue-200 border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Acesso protegido pelo Firebase</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold leading-tight tracking-tight">
                O que você quer fazer acontecer?
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                Entre para criar, apoiar e acompanhar acontecimentos com identidade verificada.
              </p>
            </div>
          </div>

          <div className="relative mt-8 pt-6 border-t border-white/10 space-y-3 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              <span>Login por e-mail ou Google</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              <span>Token validado pela API do Intent</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              <span>Perfil protegido no PostgreSQL</span>
            </div>
          </div>
        </section>

        <section className="md:col-span-7 p-8 md:p-12 flex flex-col justify-center bg-white">
          <button
            id="google-signin-btn"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3.5 px-4 mb-6 rounded-xl border-2 border-[#BFD7FE] bg-[#F4F8FF] hover:bg-[#EAF2FF] text-[#0047E0] font-bold text-sm transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Continuar com Google
          </button>

          <div className="relative flex items-center mb-6">
            <div className="grow border-t border-slate-200" />
            <span className="mx-4 text-xs text-slate-400 font-medium uppercase tracking-wider">
              ou com e-mail
            </span>
            <div className="grow border-t border-slate-200" />
          </div>

          <div className="flex bg-[#F0F5FD] p-1.5 rounded-2xl mb-6 border border-[#DCE7F6]">
            <button
              type="button"
              onClick={() => changeMode(false)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 ${
                !isRegisterMode ? 'bg-white text-[#0055FF] shadow-xs' : 'text-slate-500'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Entrar
            </button>
            <button
              type="button"
              onClick={() => changeMode(true)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 ${
                isRegisterMode ? 'bg-white text-[#0055FF] shadow-xs' : 'text-slate-500'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Cadastrar
            </button>
          </div>

          {errorMsg && (
            <div role="alert" className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegisterMode && (
              <div>
                <label htmlFor="input-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nome
                </label>
                <input
                  id="input-name"
                  type="text"
                  autoComplete="name"
                  required
                  minLength={2}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0055FF]"
                />
              </div>
            )}

            <div>
              <label htmlFor="input-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                E-mail
              </label>
              <input
                id="input-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0055FF]"
              />
            </div>

            <div>
              <label htmlFor="input-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Senha
              </label>
              <input
                id="input-password"
                type="password"
                autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0055FF]"
              />
              {isRegisterMode && (
                <p className="mt-1.5 text-[11px] text-slate-500">Use pelo menos 6 caracteres.</p>
              )}
            </div>

            <button
              id="submit-auth-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl bg-[#0055FF] hover:bg-[#0047E0] disabled:opacity-60 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>
                {isLoading ? 'Validando...' : isRegisterMode ? 'Criar conta' : 'Entrar'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="mt-6 text-center text-[11px] text-slate-500">
            O Intent não armazena sua senha. A autenticação é processada pelo Firebase.
          </p>
        </section>
      </div>
    </div>
  );
}
