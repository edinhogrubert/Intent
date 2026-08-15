import React, { useState } from 'react';
import { LogIn, UserPlus, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { UserAccount } from '../types';
import { loginUser, registerNewUser, getStoredUsers } from '../utils/storage';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isRegisterMode) {
        if (!name.trim()) {
          setErrorMsg('Por favor, informe seu nome.');
          return;
        }
        if (!email.trim()) {
          setErrorMsg('Por favor, informe seu e-mail.');
          return;
        }
        const user = registerNewUser(name, email, password);
        setSuccessMsg('Cadastro realizado com sucesso! Redirecionando...');
        setTimeout(() => {
          onAuthenticated(user);
        }, 400);
      } else {
        if (!email.trim()) {
          setErrorMsg('Por favor, informe seu e-mail cadastrado.');
          return;
        }
        const user = loginUser(email, password);
        setSuccessMsg('Login realizado com sucesso! Acessando...');
        setTimeout(() => {
          onAuthenticated(user);
        }, 400);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Ocorreu um erro. Tente novamente.');
      }
    }
  };

  const handleQuickDemoLogin = () => {
    setErrorMsg(null);
    const users = getStoredUsers();
    const demo = users[0] || registerNewUser('Rafael', 'rafael@exemplo.com', '123');
    const user = loginUser(demo.email, demo.password);
    onAuthenticated(user);
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
              <span>Saudação inteligente por horário</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0055FF]" />
              <span>Persistência contínua de sessão</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0055FF]" />
              <span>Opção de cancelamento a qualquer momento</span>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Form */}
        <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-center bg-white">
          {/* Tabs: Entrar vs Cadastrar */}
          <div className="flex bg-[#F0F5FD] p-1.5 rounded-2xl mb-8 border border-[#DCE7F6]">
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
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl font-medium flex items-center gap-2">
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
                Senha (opcional)
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
              className="w-full py-3.5 px-6 rounded-xl bg-[#0055FF] hover:bg-[#0047E0] text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-6 active:scale-[0.99] cursor-pointer"
            >
              <span>{isRegisterMode ? 'Concluir Cadastro e Entrar' : 'Entrar no Index'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Demo account quick login helper */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-400">Conta de demonstração:</span>
            <button
              id="quick-demo-btn"
              type="button"
              onClick={handleQuickDemoLogin}
              className="text-xs font-semibold text-[#0055FF] hover:text-[#0040CC] bg-[#EAF2FF] hover:bg-[#DCE9FF] px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Entrar como Rafael (Demonstração)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
