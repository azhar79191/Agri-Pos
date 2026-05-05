import { CheckCircle, Clock, AlertCircle, Banknote, CreditCard, Smartphone } from "lucide-react";

export const STATUS_CFG = {
  Completed: { icon: CheckCircle, cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400", dot: "bg-emerald-500", border: "border-emerald-200 dark:border-emerald-800" },
  Pending:   { icon: Clock,       cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",         dot: "bg-amber-500",  border: "border-amber-200 dark:border-amber-800" },
  Cancelled: { icon: AlertCircle, cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",                 dot: "bg-red-500",    border: "border-red-200 dark:border-red-800" },
};

export const PAY_CFG = {
  Cash:              { cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400", icon: Banknote },
  Credit:            { cls: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",    icon: CreditCard },
  "Online Transfer": { cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",            icon: Smartphone },
  Card:              { cls: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",    icon: CreditCard },
};

export const CHART_COLORS = ["#2563eb", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];
