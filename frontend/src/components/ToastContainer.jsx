import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        let Icon = Info;
        let borderClass = 'border-blue-400';
        let bgClass = 'bg-blue-50 text-blue-900';

        if (toast.type === 'success') {
          Icon = CheckCircle2;
          borderClass = 'border-emerald-400';
          bgClass = 'bg-emerald-50 text-emerald-950';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          borderClass = 'border-amber-400';
          bgClass = 'bg-amber-50 text-amber-950';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          borderClass = 'border-rose-400';
          bgClass = 'bg-rose-50 text-rose-950';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl nm-card border-l-4 ${borderClass} ${bgClass} shadow-xl animate-in fade-in slide-in-from-right-4 duration-200`}
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs font-medium leading-relaxed">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 shrink-0 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
