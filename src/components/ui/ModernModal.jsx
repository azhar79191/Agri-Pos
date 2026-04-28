import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import ModernButton from "./ModernButton";

const ModernModal = ({
  isOpen, onClose, title, subtitle, children, footer = null,
  size = "md", showCloseButton = true,
  closeOnOverlayClick = true, closeOnEsc = true,
  icon: Icon = null, iconColor = "emerald",
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape" && closeOnEsc) onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [isOpen, closeOnEsc, onClose]);

  if (!isOpen) return null;

  const sizes = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl", "2xl": "max-w-6xl", full: "max-w-full mx-4" };
  const iconColors = {
    emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    blue:    "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    amber:   "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    red:     "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    purple:  "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={closeOnOverlayClick ? onClose : undefined}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className={`relative z-[10000] w-full ${sizes[size]} max-h-[90vh] flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-[#0d1f14] shadow-2xl border border-slate-200/80 dark:border-emerald-900/20 animate-scale-in`}
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-slate-100 dark:border-emerald-900/15 flex-shrink-0">
          <div className="flex items-center gap-4">
            {Icon && (
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColors[iconColor]}`}>
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              {title && <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>}
              {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
            {showCloseButton && (
              <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#122b1c] rounded-xl transition-all flex-shrink-0">
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
        <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-emerald-900/15 bg-slate-50/50 dark:bg-[#0a1a0e]/50 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export const ConfirmModal = ({
  isOpen, onClose, onConfirm,
  title = "Confirm Action", message = "Are you sure?",
  confirmText = "Confirm", cancelText = "Cancel",
  confirmVariant = "danger", loading = false,
  icon: Icon = null, iconColor = "red",
}) => (
  <ModernModal isOpen={isOpen} onClose={onClose} title={title} size="sm" icon={Icon} iconColor={iconColor}
    footer={
      <div className="flex justify-end gap-3">
        <ModernButton variant="secondary" onClick={onClose} disabled={loading}>{cancelText}</ModernButton>
        <ModernButton variant={confirmVariant} onClick={onConfirm} loading={loading}>{confirmText}</ModernButton>
      </div>
    }
  >
    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{message}</p>
  </ModernModal>
);

export default ModernModal;
