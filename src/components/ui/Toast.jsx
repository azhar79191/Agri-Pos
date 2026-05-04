import React, { useEffect } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useApp } from "../../context/AppContext";

const TOAST_STYLES = {
  success: { bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800", icon: "text-emerald-500", text: "text-emerald-800 dark:text-emerald-300" },
  error:   { bg: "bg-red-50 dark:bg-red-900/20",     border: "border-red-200 dark:border-red-800",     icon: "text-red-500",     text: "text-red-800 dark:text-red-300" },
  warning: { bg: "bg-amber-50 dark:bg-amber-900/20",   border: "border-amber-200 dark:border-amber-800",   icon: "text-amber-500",   text: "text-amber-800 dark:text-amber-300" },
  info:    { bg: "bg-blue-50 dark:bg-blue-900/20",    border: "border-blue-200 dark:border-blue-800",    icon: "text-blue-500",    text: "text-blue-800 dark:text-blue-300" },
};

const ICONS = { success: CheckCircle, error: XCircle, warning: AlertTriangle, info: Info };

const Toast = ({ message, type = "info", onClose, duration = 3000, position = "bottom-right" }) => {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const style = TOAST_STYLES[type] || TOAST_STYLES.info;
  const Icon = ICONS[type] || Info;

  const positions = {
    "bottom-right": "fixed bottom-6 right-6 z-9999",
    "center": "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-9999",
  };

  return (
    <div className={`${positions[position]} animate-slide-in-right`}>
      <div className={`flex items-center gap-3 px-4 py-3.5 rounded-lg border shadow-premium-lg min-w-[320px] max-w-md ${style.bg} ${style.border}`}>
        <Icon className={`w-5 h-5 flex-shrink-0 ${style.icon}`} />
        <p className={`text-sm font-medium flex-1 ${style.text}`}>{message}</p>
        <button onClick={onClose} className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors">
          <X className={`w-4 h-4 ${style.text} opacity-60`} />
        </button>
      </div>
    </div>
  );
};

// Toast Container
export const ToastContainer = ({ toasts, onRemove }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-9999 flex flex-col gap-3">
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
