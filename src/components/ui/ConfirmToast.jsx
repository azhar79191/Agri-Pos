import Modal from "./Modal";
import React from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, Check, X } from "lucide-react";

const ICONS = { success: CheckCircle, error: XCircle, warning: AlertTriangle, info: Info };

const STYLES = {
  success: { iconBg: "bg-emerald-50 dark:bg-emerald-900/20", iconColor: "text-emerald-500", btnBg: "bg-emerald-600 hover:bg-emerald-700" },
  error:   { iconBg: "bg-red-50 dark:bg-red-900/20",     iconColor: "text-red-500",     btnBg: "bg-red-600 hover:bg-red-700" },
  warning: { iconBg: "bg-amber-50 dark:bg-amber-900/20",   iconColor: "text-amber-500",   btnBg: "bg-amber-600 hover:bg-amber-700" },
  info:    { iconBg: "bg-blue-50 dark:bg-blue-900/20",    iconColor: "text-blue-500",    btnBg: "bg-blue-600 hover:bg-blue-700" },
};

const ConfirmToast = ({ message, type = "warning", onConfirm, onCancel }) => {
  const Icon = ICONS[type] || AlertTriangle;
  const style = STYLES[type] || STYLES.warning;

  return (
    <Modal
          isOpen
          onClose={onCancel}
          title={<>Confirm Action</>}
          size="xs"
          subtitle={<>Please confirm to proceed</>}
          icon={Icon}
          iconColor={type === "error" ? "red" : type === "warning" ? "amber" : "brand"}
          footer={<div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md font-medium text-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 text-white rounded-md font-medium text-sm transition-colors flex items-center justify-center gap-2 ${style.btnBg}`}
          >
            <Check className="w-4 h-4" />Confirm
          </button>
        </div>}><div className="space-y-4">

        {/* Body */}
        <div className="">
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{message}</p>
        </div>

      </div></Modal>
  );
};

export default ConfirmToast;
