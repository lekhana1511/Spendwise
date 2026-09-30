import React from 'react';
import { useApp } from '../../store/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { state, dispatch } = useApp();
  const toast = state.ui.toast;

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-600 shrink-0" />
  };

  const borders = {
    success: 'border-emerald-200 bg-white shadow-emerald-900/5',
    warning: 'border-amber-200 bg-white shadow-amber-900/5',
    error: 'border-rose-200 bg-white shadow-rose-900/5',
    info: 'border-blue-200 bg-white shadow-blue-900/5'
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className={`p-4 rounded-xl border shadow-lg flex items-start gap-3 ${borders[toast.type]}`}>
        {icons[toast.type]}
        <div className="flex-1 pr-2">
          <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
          {toast.message && (
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{toast.message}</p>
          )}
        </div>
        <button
          onClick={() => dispatch({ type: 'SET_TOAST', payload: null })}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
