import React, { useState, useMemo } from 'react';
import {
  User,
  AtSign,
  Mail,
  ShieldCheck,
  Award,
  Users,
  UserCheck,
  FileCode,
  Inbox,
  History,
  Settings,
  X,
  CheckCircle2,
  Sparkles,
  Camera,
  Edit2,
  Lock,
  ChevronDown,
  ChevronUp,
  Activity,
  Database,
  Tag,
} from 'lucide-react';
import { UserAccount, Intent } from '../types';
import { updateUserProfile, getUserActivityFromStorage } from '../utils/storage';

interface UserProfileModalProps {
  isOpen: boolean;
  user: UserAccount;
  onClose: () => void;
  onUpdateUser: (updated: UserAccount) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  user,
  onClose,
  onUpdateUser,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username || `@${user.name.toLowerCase().replace(/\s+/g, '_')}`);
  const [bio, setBio] = useState(user.bio || 'Membro do Portal Intent e Guardião de Dados.');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [privacyLevel, setPrivacyLevel] = useState<'public' | 'private' | 'guardians_only'>(
    user.configuracoes?.privacyLevel || 'public'
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    user.configuracoes?.notificationsEnabled ?? true
  );
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Active Tab for viewing created vs participated intents in detail
  const [activeActivityTab, setActiveActivityTab] = useState<'criadas' | 'participadas'>('criadas');
  const [showActivityList, setShowActivityList] = useState(true);

  // Consumir resumo de atividades diretamente do storage da aplicação
  const activity = useMemo(() => {
    return getUserActivityFromStorage(user);
  }, [user, isOpen]);

  if (!isOpen) return null;

  const rel = user.relacionamentos || {
    intentsCriadasCount: activity.createdIntentsCount,
    intentsRecebidasCount: activity.receivedIntentsCount,
    intentsParticipadasCount: activity.participatedIntentsCount,
    historicoCount: activity.totalLogsCount,
    seguidoresCount: 4,
    seguindoCount: 5,
    seguidoresList: ['Dra. Helena Voss', 'Carlos Mendez', 'Dra. Amanda Ribeiro', 'Lucas M.'],
    seguindoList: ['Dra. Helena Voss', 'Carlos Mendez', 'Beatriz Costa', 'Gabriel Rocha', 'Marcio Silva'],
    reputacao: {
      pontos: 150,
      nivel: 'Membro Ativo — Nível 1',
      selo: '🛡️ Guardião Verificado',
    },
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.startsWith('@') ? username : `@${username}`;

    const updated = updateUserProfile(user.id, {
      name: name.trim() || user.name,
      username: cleanUsername,
      bio: bio.trim(),
      avatarUrl: avatarUrl.trim() || undefined,
      configuracoes: {
        ...user.configuracoes,
        privacyLevel,
        notificationsEnabled,
      },
      relacionamentos: {
        ...user.relacionamentos,
        intentsCriadasCount: activity.createdIntentsCount,
        intentsParticipadasCount: activity.participatedIntentsCount,
        intentsRecebidasCount: activity.receivedIntentsCount,
        historicoCount: activity.totalLogsCount,
      },
    });

    onUpdateUser(updated);
    setIsEditing(false);
    setSuccessMsg('Perfil e preferências de Identidade atualizados com sucesso!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div
      id="user-profile-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative my-8">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#152744] to-[#0D1B2E] p-6 text-white flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0055FF] text-white flex items-center justify-center font-black text-lg shadow-md">
              IT
            </div>
            <div>
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Etapa 1 — Gestão de Identidade</span>
              </span>
              <h2 className="text-xl font-black text-white tracking-tight">Identidade & Resumo de Atividade</h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Banner */}
        {successMsg && (
          <div className="bg-emerald-50 border-b border-emerald-200 p-3 px-6 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="p-6 md:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Identity Card Profile Header */}
          <div className="p-5 bg-[#F0F5FD] rounded-2xl border border-[#DCE7F6] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#152744] text-white flex items-center justify-center text-xl font-black border-2 border-white shadow-md relative overflow-hidden shrink-0">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{user.name.slice(0, 2).toUpperCase()}</span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900">{user.name}</h3>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {user.status === 'active' ? '✓ Ativo' : 'Inativo'}
                  </span>
                </div>
                <p className="text-xs font-mono font-bold text-[#0055FF]">{user.username}</p>
                <p className="text-xs text-slate-500 mt-1">{user.email}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#0055FF] border border-[#BFD7FE] text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Cancelar Edição' : 'Editar Identidade'}</span>
            </button>
          </div>

          {/* Edit Form */}
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="p-5 bg-white rounded-2xl border-2 border-[#0055FF]/40 space-y-4 shadow-sm">
              <h4 className="text-xs font-black text-[#0055FF] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Sparkles className="w-4 h-4 text-[#0055FF]" />
                <span>Atualizar Atributos do Usuário</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0055FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Username Único (@username)</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-xs font-mono font-bold text-[#0055FF] focus:outline-none focus:ring-2 focus:ring-[#0055FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bio / Apresentação</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0055FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">URL do Avatar (Foto de Perfil)</label>
                <input
                  type="text"
                  placeholder="https://exemplo.com/avatar.jpg"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0055FF]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nível de Privacidade</label>
                  <select
                    value={privacyLevel}
                    onChange={(e) => setPrivacyLevel(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0055FF]"
                  >
                    <option value="public">Público (Visível na comunidade)</option>
                    <option value="guardians_only">Apenas Guardiões Conectados</option>
                    <option value="private">Privado / Selado</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="notif-check"
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                    className="w-4 h-4 text-[#0055FF] rounded-md border-slate-300"
                  />
                  <label htmlFor="notif-check" className="text-xs font-semibold text-slate-700">
                    Receber alertas de aprovações por e-mail
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0055FF] hover:bg-[#0047E0] text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          ) : (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600">
              <span className="font-bold text-slate-800">Bio: </span>
              {user.bio || 'Sem biografia cadastrada ainda.'}
            </div>
          )}

          {/* DYNAMIC USER ACTIVITY SUMMARY (Direct from Storage) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#0055FF]" />
                <span>Resumo da Atividade do Usuário (Storage da Aplicação)</span>
              </h4>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-blue-50 text-[#0055FF] border border-blue-200 font-bold flex items-center gap-1">
                <Database className="w-3 h-3" />
                <span>Storage Sincronizado</span>
              </span>
            </div>

            {/* Metric Summary Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Intents Criadas */}
              <button
                type="button"
                onClick={() => {
                  setActiveActivityTab('criadas');
                  setShowActivityList(true);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  activeActivityTab === 'criadas' && showActivityList
                    ? 'bg-blue-50/80 border-[#0055FF] ring-1 ring-[#0055FF]'
                    : 'bg-white border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold">
                  <span className="flex items-center gap-1">
                    <FileCode className="w-3.5 h-3.5 text-blue-500" />
                    Intents Criadas
                  </span>
                  <span className="text-blue-600 font-mono text-base font-black">
                    {activity.createdIntentsCount}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Autoria própria gravada</p>
              </button>

              {/* Intents Participadas */}
              <button
                type="button"
                onClick={() => {
                  setActiveActivityTab('participadas');
                  setShowActivityList(true);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  activeActivityTab === 'participadas' && showActivityList
                    ? 'bg-emerald-50/80 border-emerald-500 ring-1 ring-emerald-500'
                    : 'bg-white border-slate-200 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold">
                  <span className="flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                    Intents Participadas
                  </span>
                  <span className="text-emerald-600 font-mono text-base font-black">
                    {activity.participatedIntentsCount}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Papel de Guardião / Voto</p>
              </button>

              {/* Intents Recebidas */}
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold">
                  <span className="flex items-center gap-1">
                    <Inbox className="w-3.5 h-3.5 text-indigo-500" />
                    Recebidas
                  </span>
                  <span className="text-indigo-600 font-mono text-base font-black">
                    {activity.receivedIntentsCount}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Destinado a você</p>
              </div>

              {/* Histórico Total */}
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold">
                  <span className="flex items-center gap-1">
                    <History className="w-3.5 h-3.5 text-amber-500" />
                    Histórico
                  </span>
                  <span className="text-amber-600 font-mono text-base font-black">
                    {activity.totalLogsCount}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Registros em timeline</p>
              </div>
            </div>

            {/* Detailed Activity Explorer Box */}
            <div className="bg-[#F8FAFC] rounded-2xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveActivityTab('criadas')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeActivityTab === 'criadas'
                        ? 'bg-[#0055FF] text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    📝 Criadas por Você ({activity.createdIntentsCount})
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveActivityTab('participadas')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeActivityTab === 'participadas'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🛡️ Participadas / Guardião ({activity.participatedIntentsCount})
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowActivityList(!showActivityList)}
                  className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 font-semibold"
                >
                  <span>{showActivityList ? 'Ocultar Detalhes' : 'Expandir Lista'}</span>
                  {showActivityList ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {showActivityList && (
                <div className="space-y-2 pt-1 animate-in fade-in duration-200">
                  {activeActivityTab === 'criadas' ? (
                    activity.createdIntentsList.length > 0 ? (
                      activity.createdIntentsList.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                        >
                          <div className="space-y-0.5">
                            <p className="font-bold text-slate-900">{item.title}</p>
                            <p className="text-[11px] text-slate-500 line-clamp-1">{item.description}</p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                                item.status === 'active'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : item.status === 'completed'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {item.status === 'active' ? '✓ Ativa' : item.status}
                            </span>
                            <span className="text-[10px] text-slate-400">{item.visibility}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center bg-white rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                        Nenhuma intent criada por este usuário foi encontrada no storage ainda.
                      </div>
                    )
                  ) : activity.participatedIntentsList.length > 0 ? (
                    activity.participatedIntentsList.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900">{item.title}</p>
                          <p className="text-[11px] text-slate-500">
                            Guardiões:{' '}
                            <span className="font-medium text-slate-700">
                              {item.participants?.map((p) => p.name).join(', ')}
                            </span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                            🛡️ Guardião Conectado
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center bg-white rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                      Este usuário participa como guardião das intents globais ativas.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Followers & Following Lists */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Seguidores */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-purple-600" />
                    Seguidores ({rel.seguidoresCount})
                  </span>
                  <span className="text-[10px] text-slate-400">Conexões recebidas</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {rel.seguidoresList?.map((name, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[11px] text-slate-700 font-medium shadow-2xs"
                    >
                      👤 {name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Seguindo */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    Seguindo ({rel.seguindoCount})
                  </span>
                  <span className="text-[10px] text-slate-400">Perfis acompanhados</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {rel.seguindoList?.map((name, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[11px] text-slate-700 font-medium shadow-2xs"
                    >
                      ⭐ {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Reputation Foundation (Prepared for Future as requested) */}
            <div className="p-4 bg-gradient-to-r from-slate-900 to-[#102038] rounded-2xl text-white space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                    Reputação (Estrutura Preparada — Etapa 1)
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {rel.reputacao?.selo || '🛡️ Guardião Verificado'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <p className="text-sm font-bold text-white">{rel.reputacao?.nivel}</p>
                  <p className="text-[11px] text-slate-400">
                    Pontuação base acumulada por ações de custódia e participações.
                  </p>
                </div>
                <span className="text-xl font-mono font-black text-amber-400">
                  {rel.reputacao?.pontos} pts
                </span>
              </div>

              <p className="text-[10px] text-slate-400 pt-1 border-t border-white/10 italic">
                ℹ️ Nota: A estrutura de dados de Reputação está pronta e acoplada ao usuário sem travar expansões futuras.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

