import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  useEffect(() => {
    if (toasts.length === 0) return;

    const timers = toasts.map((toast) => {
      return setTimeout(() => {
        onDismiss(toast.id);
      }, toast.duration || 4500);
    });

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [toasts, onDismiss]);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => {
        let Icon = Info;
        let title = 'Information';
        if (toast.type === 'success') {
          Icon = CheckCircle2;
          title = toast.title || 'Success';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          title = toast.title || 'Error';
        }

        return (
          <div key={toast.id} className={`toast ${toast.type || 'info'}`} role="status">
            <Icon size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div className="toast-content">
              <div className="toast-title">{title}</div>
              <div className="toast-message">{toast.message}</div>
            </div>
            <button
              className="toast-close"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
