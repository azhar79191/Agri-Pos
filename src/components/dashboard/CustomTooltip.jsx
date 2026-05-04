import { formatCurrency } from "../../utils/helpers";

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null;
  
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 shadow-premium-lg">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</p>
      <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{formatCurrency(payload[0].value, currency)}</p>
    </div>
  );
};

export default CustomTooltip;
