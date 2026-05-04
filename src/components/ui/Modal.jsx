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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4" onClick={closeOnOverlayClick ? onClose : undefined}>
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
      <div
        className={`relative z-10000 w-full ${sizes[size]} max-h-[96vh] sm:max-h-[92vh] flex flex-col overflow-hidden rounded-lg sm:rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 animate-scale-in`}
        onClick={e => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-3 sm:px-5 py-3 sm:py-3.5 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
            {title && <h3 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-white truncate pr-2">{title}</h3>}
            {showCloseButton && (
              <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors flex-shrink-0">
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}
          </div>
        )}
        <div className="px-3 sm:px-5 py-3 sm:py-4 overflow-y-auto flex-1 modal-content-scroll">{children}</div>
        {footer && (
          <div className="px-3 sm:px-5 py-3 sm:py-3.5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
