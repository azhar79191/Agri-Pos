import { Inbox, Plus, SearchX } from "lucide-react";

export default function EmptyState({ icon: Icon = Inbox, title = "No records yet", description = "Your records will appear here once added.", actionLabel, onAction, filtered = false, onClear, className = "" }) {
  const Symbol = filtered ? SearchX : Icon;
  return <div role="status" className={`empty-state ${className}`}>
    <div className="empty-state__illustration" aria-hidden="true"><span /><div><Symbol className="h-7 w-7" strokeWidth={1.5} /></div><i /></div>
    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
    {description && <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>}
    {(actionLabel && onAction || onClear) && <div className="mt-5 flex flex-wrap justify-center gap-2">
      {actionLabel && onAction && <button type="button" onClick={onAction} className="empty-state__action"><Plus className="h-4 w-4" aria-hidden="true" />{actionLabel}</button>}
      {onClear && <button type="button" onClick={onClear} className="empty-state__clear">Clear filters</button>}
    </div>}
  </div>;
}
