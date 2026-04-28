import React, { useEffect } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useApp } from "../../context/AppContext";

const FIXED_COLORS = {
  error:   "#ef4444",
  warning: "#f59e0b",
  info:    "#3b82f6",
};

const Toast = ({ message, type = "info", onClose, duration = 3000, position = "bottom-right" }) => {
  const { state } = useApp();
  const tc = FIXED_COLORS[type] || (state.themeColor || "#10b981");

  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = { success: CheckCircle, error: XCircle, warning: AlertTriangle, info: Info };
  const positions = {
    "bottom-right": "fixed bottom-6 right-6 z-[9999]",
    "center": "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]"
  };
  const Icon = icons[type];

  return (
    <div className={`${positions[position]} animate-toast-in`}>
      <div
        className="flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl backdrop-blur-sm min-w-[320px] max-w-md text-white"
        style={{ background: `linear-gradient(135deg, ${tc}, ${tc}cc)` }}
      >
        <div className="p-2 bg-white/20 rounded-xl">
          <Icon className="w-5 h-5 flex-shrink-0" />
        </div>
        <p className="text-sm font-medium flex-1">{message}</p>
        <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Toast Container
export const ToastContainer = ({ toasts, onRemove }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          position={toast.position}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
};

export default Toast;
