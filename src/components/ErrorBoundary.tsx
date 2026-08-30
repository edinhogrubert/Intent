import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#F4F7FC] flex items-center justify-center p-6 text-slate-900">
          <div className="w-full max-w-md bg-white rounded-3xl border border-[#DCE7F6] p-8 shadow-xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-2xs">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-900">Recuperando Aplicação</h2>
              <p className="text-xs text-slate-500 mt-1">
                Ocorreu uma inconsistência temporária durante a renderização. A interface foi isolada com segurança.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-left font-mono text-[11px] text-slate-700 overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full py-3 px-4 bg-[#0055FF] hover:bg-[#0047E0] text-white rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reiniciar Sessão Segura</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
