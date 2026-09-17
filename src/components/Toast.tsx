import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast, hideToast } = useAuth();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      hideToast();
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast, hideToast]);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-3 px-5 py-3 rounded-full shadow-xl text-sm font-medium transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 border backdrop-blur-sm"
      style={{
        backgroundColor:
          toast.type === 'success'
            ? '#d4e8da'
            : toast.type === 'error'
              ? '#f5ddd9'
              : '#fdfaf6',
        borderColor:
          toast.type === 'success'
            ? '#a8cdb4'
            : toast.type === 'error'
              ? '#e4a09a'
              : '#d4cdc4',
        color:
          toast.type === 'success'
            ? '#1e3828'
            : toast.type === 'error'
              ? '#7a1e1e'
              : '#1a1410',
      }}
    >
      {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#2a4a35] shrink-0" />}
      {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-[#9b2c2c] shrink-0" />}
      {toast.type === 'info' && <Info className="w-4 h-4 text-[#8a6f5a] shrink-0" />}
      <span className="font-sans">{toast.message}</span>
      <button
        onClick={hideToast}
        aria-label="Dismiss toast"
        className="p-1 rounded-full hover:bg-black/5 text-current/60 hover:text-current transition-colors ml-1"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
