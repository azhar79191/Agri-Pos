import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const Modal = ({
  isOpen, onClose, title, children, footer = null,
  size = "md", showCloseButton = true,
  closeOnOverlayClick = true, closeOnEsc = true,
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

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={closeOnOverlayClick ? onClose : undefined}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className={`relative z-[10000] w-full ${sizes[size]} max-h-[90vh] flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-[#0d1f14] shadow-2xl border border-slate-200/80 dark:border-emerald-900/20 animate-scale-in`}
        onClick={e => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-emerald-900/15 flex-shrink-0">
            {title && <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>}
            {showCloseButton && (
              <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#122b1c] rounded-xl transition-all">
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
        <div className="px-6 py-4 overflow-y-auto flex-1">{children}</div>
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

export default Modal;
