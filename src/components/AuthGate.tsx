import { useState, type FormEvent } from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, LogIn, ShieldCheck, UserPlus } from 'lucide-react';
import type { UserAccount } from '../types';
import { auth, createUserWithEmailAndPassword, googleProvider, signInWithEmailAndPassword, signInWithPopup, updateProfile } from '../utils/firebase';
import { IntentApiError, syncAuthenticatedUser } from '../services/intentApi';

interface AuthGateProps {
  onAuthenticated: (user: UserAccount) => void;
  onAuthFlowStart: () => void;
  onAuthFlowEnd: () => void;
}

function authMessage(error: unknown) {
  if (error instanceof IntentApiError) return error.message;
  const code = typeof error === 'object' && error !== null && 'code' in error ? String((error as { code?: unknown }).code) : '';
  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'Este e-mail já possui uma conta.',
    'auth/invalid-credential': 'E-mail ou senha inválidos.',
    'auth/invalid-email': 'Informe um e-mail válido.',
    'auth/popup-blocked': 'O navegador bloqueou a janela do Google.',
    'auth/popup-closed-by-user': 'A janela do Google foi fechada antes da conclusão.',
    'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos.',
    'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
  };
  return messages[code] || 'Não foi possível concluir o acesso. Tente novamente.';
}

export function AuthGate({ onAuthenticated, onAuthFlowStart, onAuthFlowEnd }: AuthGateProps) {
  const [register, setRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function finish(firebaseUser: Parameters<typeof syncAuthenticatedUser>[0]) {
    onAuthenticated(await syncAuthenticatedUser(firebaseUser));
  }

  async function googleLogin() {
    setLoading(true); setError(''); onAuthFlowStart();
    try { await finish((await signInWithPopup(auth, googleProvider)).user); }
    catch (caught) { setError(authMessage(caught)); }
    finally { onAuthFlowEnd(); setLoading(false); }
  }

  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError(''); onAuthFlowStart();
    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (register) {
        if (name.trim().length < 2) throw new Error('INVALID_NAME');
        const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
        await updateProfile(credential.user, { displayName: name.trim() });
        await credential.user.getIdToken(true);
        await finish(credential.user);
      } else {
        await finish((await signInWithEmailAndPassword(auth, normalizedEmail, password)).user);
      }
    } catch (caught) {
      setError(caught instanceof Error && caught.message === 'INVALID_NAME' ? 'Informe seu nome.' : authMessage(caught));
    } finally { onAuthFlowEnd(); setLoading(false); }
  }

  return <div className="min-h-screen bg-[#f5f6fb] flex items-center justify-center p-4"><div className="w-full max-w-md bg-white border border-[#e4e2de] rounded-3xl shadow-lg p-7 sm:p-9">
    <div className="w-12 h-12 rounded-2xl bg-[#000666] text-white flex items-center justify-center font-black mb-6">IT</div>
    <p className="text-xs font-bold text-[#000666] flex items-center gap-2"><ShieldCheck className="w-4 h-4"/>Acesso protegido</p><h1 className="text-2xl font-black mt-3">O que você quer fazer acontecer?</h1><p className="text-sm text-[#666] mt-2">Entre para criar, apoiar e acompanhar Intents reais.</p>
    <button onClick={() => void googleLogin()} disabled={loading} className="w-full mt-7 py-3.5 rounded-xl border border-[#c6c5d4] text-sm font-bold disabled:opacity-50">Continuar com Google</button>
    <div className="flex items-center gap-3 my-5"><div className="h-px bg-[#e4e2de] flex-1"/><span className="text-[11px] text-[#777]">OU</span><div className="h-px bg-[#e4e2de] flex-1"/></div>
    <div className="flex bg-[#f5f3ef] p-1 rounded-xl mb-5"><button type="button" onClick={() => { setRegister(false); setError(''); }} className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 ${!register ? 'bg-white text-[#000666] shadow-sm' : 'text-[#666]'}`}><LogIn className="w-4 h-4"/>Entrar</button><button type="button" onClick={() => { setRegister(true); setError(''); }} className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 ${register ? 'bg-white text-[#000666] shadow-sm' : 'text-[#666]'}`}><UserPlus className="w-4 h-4"/>Criar conta</button></div>
    {error && <div role="alert" className="mb-4 p-3 bg-[#ffdad6] text-[#8c1d18] rounded-xl text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0"/>{error}</div>}
    <form onSubmit={submit} className="space-y-4">{register && <label className="block"><span className="block text-xs font-bold mb-1.5">Nome</span><input required minLength={2} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-[#fbf9f5] border border-[#c6c5d4] rounded-xl text-sm outline-none focus:border-[#000666]"/></label>}<label className="block"><span className="block text-xs font-bold mb-1.5">E-mail</span><input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-[#fbf9f5] border border-[#c6c5d4] rounded-xl text-sm outline-none focus:border-[#000666]"/></label><label className="block"><span className="block text-xs font-bold mb-1.5">Senha</span><input required minLength={6} type="password" autoComplete={register ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-[#fbf9f5] border border-[#c6c5d4] rounded-xl text-sm outline-none focus:border-[#000666]"/></label><button disabled={loading} className="w-full py-3.5 rounded-xl bg-[#000666] text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60">{loading ? 'Validando...' : register ? 'Criar conta' : 'Entrar'}<ArrowRight className="w-4 h-4"/></button></form>
    <p className="mt-5 text-[11px] text-[#666] flex items-center justify-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5"/>Sua senha não é armazenada pelo Intent.</p>
  </div></div>;
}
