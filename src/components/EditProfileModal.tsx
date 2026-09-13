import { useState, type FormEvent } from 'react';
import { AlertCircle, LoaderCircle, Save, X } from 'lucide-react';
import type { UserAccount } from '../types';
import { IntentApiError, updateUserProfile } from '../services/intentApi';

interface EditProfileModalProps {
  user: UserAccount;
  onClose: () => void;
  onSaved: (user: UserAccount) => void;
}

export function EditProfileModal({ user, onClose, onSaved }: EditProfileModalProps) {
  const [displayName, setDisplayName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    setSaving(true);
    setError('');
    try {
      const updated = await updateUserProfile({
        displayName: displayName.trim(),
        bio: bio.trim() || null,
        avatarUrl: avatarUrl.trim() || null,
      });
      onSaved(updated);
      onClose();
    } catch (caught) {
      setError(caught instanceof IntentApiError
        ? caught.message
        : 'Não foi possível salvar seu perfil. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  return <div className="fixed inset-0 z-50 bg-black/50 p-4 flex items-center justify-center" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="edit-profile-title" className="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[#e4e2de] flex items-center justify-between gap-4">
        <div>
          <h2 id="edit-profile-title" className="text-lg font-black">Editar perfil</h2>
          <p className="text-xs text-[#666] mt-1">Atualize as informações visíveis no seu perfil.</p>
        </div>
        <button type="button" onClick={onClose} disabled={saving} aria-label="Fechar" className="p-2 rounded-full text-[#666] hover:bg-[#f5f3ef] disabled:opacity-50"><X className="w-5 h-5"/></button>
      </div>

      <form onSubmit={(event) => void handleSubmit(event)} className="p-5 space-y-4">
        <div>
          <label htmlFor="profile-username" className="block text-sm font-bold mb-1.5">Username</label>
          <input id="profile-username" value={`@${user.username.replace(/^@+/, '')}`} readOnly aria-readonly="true" className="w-full rounded-xl border border-[#d6d4cf] bg-[#f5f3ef] px-3.5 py-2.5 text-sm text-[#666]"/>
          <p className="text-xs text-[#666] mt-1.5">O username não pode ser alterado nesta etapa.</p>
        </div>

        <div>
          <label htmlFor="profile-display-name" className="block text-sm font-bold mb-1.5">Nome de exibição</label>
          <input id="profile-display-name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} required minLength={2} maxLength={120} autoFocus className="w-full rounded-xl border border-[#c6c5d4] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#000666]"/>
        </div>

        <div>
          <label htmlFor="profile-bio" className="block text-sm font-bold mb-1.5">Bio</label>
          <textarea id="profile-bio" value={bio} onChange={(event) => setBio(event.target.value)} maxLength={500} rows={4} className="w-full resize-y rounded-xl border border-[#c6c5d4] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#000666]"/>
          <p className="text-xs text-[#666] text-right mt-1">{bio.length}/500</p>
        </div>

        <div>
          <label htmlFor="profile-avatar-url" className="block text-sm font-bold mb-1.5">URL do avatar</label>
          <input id="profile-avatar-url" type="url" value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} maxLength={2048} placeholder="https://exemplo.com/avatar.jpg" className="w-full rounded-xl border border-[#c6c5d4] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#000666]"/>
        </div>

        {error && <div role="alert" className="rounded-xl bg-[#ffdad6] p-3 text-sm text-[#8c1d18] flex items-start gap-2"><AlertCircle className="w-4 h-4 mt-0.5 shrink-0"/><span>{error}</span></div>}

        <div className="pt-2 flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={saving} className="px-4 py-2.5 rounded-xl border border-[#c6c5d4] text-sm font-bold disabled:opacity-50">Cancelar</button>
          <button type="submit" disabled={saving} className="px-4 py-2.5 rounded-xl bg-[#000666] text-white text-sm font-bold flex items-center gap-2 disabled:opacity-60">{saving ? <LoaderCircle className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>}{saving ? 'Salvando...' : 'Salvar perfil'}</button>
        </div>
      </form>
    </section>
  </div>;
}
