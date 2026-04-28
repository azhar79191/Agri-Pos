import React from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, Check, X } from "lucide-react";

const ICONS  = { success: CheckCircle, error: XCircle, warning: AlertTriangle, info: Info };
const STYLES = {
  success: "from-emerald-500 to-teal-600",
  error:   "from-red-500 to-rose-600",
  warning: "from-amber-500 to-orange-600",
  info:    "from-blue-500 to-indigo-600",
};

const ConfirmToast = ({ message, type = "warning", onConfirm, onCancel }) => {
  const Icon = ICONS[type];
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#0d1f14] rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-scale-in border border-slate-200/80 dark:border-emerald-900/20">
        <div className={`bg-gradient-to-r ${STYLES[type]} p-5 text-white`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold">Confirm Action</h3>
              <p className="text-xs text-white/80 mt-0.5">Please confirm to proceed</p>
            </div>
          </div>
        </div>
        <div className="p-5">
          <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-3 px-5 pb-5">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-[#122b1c] text-slate-700 dark:text-slate-300 rounded-xl font-medium text-sm hover:bg-slate-200 dark:hover:bg-[#163320] transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 bg-gradient-to-r ${STYLES[type]} text-white rounded-xl font-medium text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2`}
          >
            <Check className="w-4 h-4" />Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmToast;
