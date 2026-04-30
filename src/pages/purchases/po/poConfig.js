import { Edit2, Truck, Clock, CheckCircle } from "lucide-react";

export const STATUS_CFG = {
  Draft:               { cls: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",       icon: Edit2 },
  Sent:                { cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",         icon: Truck },
  "Partially Received":{ cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",    icon: Clock },
  Completed:           { cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400", icon: CheckCircle },
};

export const STATUSES = ["Draft", "Sent", "Partially Received", "Completed"];

export const EMPTY_ITEM = { productId: "", productName: "", quantity: 1, unitPrice: 0, unit: "" };
