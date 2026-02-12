import React from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, Check, X } from "lucide-react";

const ConfirmToast = ({ message, type = "warning", onConfirm, onCancel }) => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info
  };

  const styles = {
    success: "from-emerald-500 to-teal-600",
    error: "from-red-500 to-rose-600",
    warning: "from-amber-500 to-orange-600",
    info: "from-blue-500 to-indigo-600"
  };

  const Icon = icons[type];

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
        {/* Header with gradient */}
        <div className={`bg-gradient-to-r ${styles[type]} p-6 text-white`}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Icon className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Confirmation Required</h3>
              <p className="text-sm text-white/90 mt-1">Please confirm your action</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-6 py-3 bg-gradient-to-r ${styles[type]} text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2`}
          >
            <Check className="w-4 h-4" />
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmToast;
