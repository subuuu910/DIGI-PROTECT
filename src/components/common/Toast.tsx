import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let borderClass = 'border-slate-200 bg-white text-slate-800';
        let Icon = Info;
        let iconClass = 'text-cyan-700';

        if (toast.type === 'success') {
          borderClass = 'border-emerald-200 bg-emerald-50/95 text-emerald-950';
          Icon = CheckCircle2;
          iconClass = 'text-emerald-700';
        } else if (toast.type === 'warning') {
          borderClass = 'border-amber-200 bg-amber-50/95 text-amber-950';
          Icon = AlertCircle;
          iconClass = 'text-amber-700';
        } else if (toast.type === 'error') {
          borderClass = 'border-rose-200 bg-rose-50/95 text-rose-950';
          Icon = AlertCircle;
          iconClass = 'text-rose-700';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto border rounded-lg p-3.5 shadow-md flex items-start gap-3 transition-all ${borderClass}`}
          >
            <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${iconClass}`} />
            <div className="flex-1 text-xs">
              <p className="font-semibold">{toast.title}</p>
              {toast.message && <p className="mt-0.5 opacity-90 leading-relaxed">{toast.message}</p>}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-700 transition-colors p-0.5"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
