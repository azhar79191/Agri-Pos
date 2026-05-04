import React from "react";
import { Edit2, Trash2, Phone, MapPin, Wallet, FileText } from "lucide-react";
import { formatCurrency } from "../../utils/helpers";

const avatarColors = [
  "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
  "bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
  "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
  "bg-rose-100 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400",
];

const getAvatarColor = (name = "") => avatarColors[name.charCodeAt(0) % avatarColors.length];

const CustomerRow = ({ customer, onEdit, onDelete, onViewStatement, currency }) => {
  return (
    <tr className="group hover:bg-blue-50/40 dark:hover:bg-blue-900/5 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg ${getAvatarColor(customer.name)} flex items-center justify-center flex-shrink-0`}>
            <span className="font-semibold text-xs">{customer.name?.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)}</span>
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white text-sm">{customer.name}</p>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" />{customer.phone}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-400 max-w-xs">
          <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-slate-400" />
          <span className="line-clamp-2">{customer.address || "—"}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        {(customer.walletBalance || 0) > 0 ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
            <Wallet className="w-3 h-3" />{formatCurrency(customer.walletBalance, currency)}
          </span>
        ) : <span className="text-xs text-slate-400">—</span>}
      </td>
      <td className="px-4 py-3">
        {(customer.creditBalance || 0) > 0 ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400">
            <Wallet className="w-3 h-3" />{formatCurrency(customer.creditBalance, currency)}
          </span>
        ) : <span className="text-xs text-slate-400">—</span>}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button onClick={() => onViewStatement(customer)} className="flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <FileText className="w-3.5 h-3.5" />Statement
          </button>
          <button onClick={() => onEdit(customer)} className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/15 transition-colors">
            <Edit2 size={14} />
          </button>
          <button onClick={() => onDelete(customer)} className="p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/15 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default React.memo(CustomerRow);
