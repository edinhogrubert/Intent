import { AlertTriangle, X } from 'lucide-react';
import { UserAccount } from '../types';

interface DeleteAccountModalProps {
  isOpen: boolean;
  user: UserAccount;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteAccountModal({
  isOpen,
  user,
  onClose,
  onConfirm,
}: DeleteAccountModalProps) {
  if (!isOpen) return null;

  return (
    <div
      id="delete-account-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        id="delete-account-modal-dialog"
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative"
      >
        <button
          id="close-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Cancelar inscrição / Excluir conta
            </h3>
            <p className="text-xs text-slate-500">
              Esta ação removerá todos os seus dados.
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Tem certeza de que deseja cancelar sua inscrição para a conta{' '}
          <strong className="text-slate-900">{user.email}</strong>? Ao confirmar,
          você será descadastrado da plataforma e precisará criar uma nova conta se quiser
          voltar no futuro.
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            id="cancel-delete-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Voltar e manter conta
          </button>
          <button
            id="confirm-delete-btn"
            type="button"
            onClick={onConfirm}
            className="px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-colors"
          >
            Sim, cancelar inscrição
          </button>
        </div>
      </div>
    </div>
  );
}
