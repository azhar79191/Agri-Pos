import React, { useState } from "react";
import { WifiOff, Wifi, RefreshCw, X, Clock, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import useOfflineQueue from "../hooks/useOfflineQueue";

const OfflineBanner = () => {
  const { isOnline, pendingCount, queue, retrying, lastSynced, retryAll, removeFromQueue, clearAll } = useOfflineQueue();
  const [expanded, setExpanded] = useState(false);

  // Online + no pending = show nothing
  if (isOnline && pendingCount === 0) return null;

  return (
    <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm transition-all duration-300`}>
      {/* Main pill */}
      <div className={`rounded-2xl shadow-2xl border overflow-hidden ${
        isOnline
          ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700"
          : "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700"
      }`}>
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Icon */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            isOnline ? "bg-emerald-100 dark:bg-emerald-900/50" : "bg-red-100 dark:bg-red-900/50"
          }`}>
            {isOnline
              ? <Wifi className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              : <WifiOff className="w-4 h-4 text-red-600 dark:text-red-400 animate-pulse" />
            }
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${isOnline ? "text-emerald-800 dark:text-emerald-300" : "text-red-800 dark:text-red-300"}`}>
              {isOnline ? "Back Online" : "You're Offline"}
            </p>
            <p className={`text-xs ${isOnline ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
              {isOnline && pendingCount > 0
                ? `${pendingCount} action${pendingCount !== 1 ? "s" : ""} queued — syncing...`
                : isOnline
                ? lastSynced ? `Synced at ${lastSynced.toLocaleTimeString()}` : "All synced"
                : pendingCount > 0
                ? `${pendingCount} action${pendingCount !== 1 ? "s" : ""} will sync when reconnected`
                : "Actions will be queued until reconnected"
              }
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {isOnline && pendingCount > 0 && (
              <button
                onClick={retryAll}
                disabled={retrying}
                className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                title="Retry now"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${retrying ? "animate-spin" : ""}`} />
              </button>
            )}
            {pendingCount > 0 && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isOnline
                    ? "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
                    : "text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50"
                }`}
              >
                {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Expanded queue list */}
        {expanded && pendingCount > 0 && (
          <div className="border-t border-slate-200 dark:border-slate-700 max-h-48 overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Queued Actions</p>
              <button onClick={clearAll} className="text-[10px] text-red-500 hover:text-red-700 transition-colors flex items-center gap-1">
                <Trash2 className="w-3 h-3" /> Clear all
              </button>
            </div>
            {queue.map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{item.label}</p>
                  <p className="text-[10px] text-slate-400">
                    {new Date(item.queuedAt).toLocaleTimeString()} · {item.attempts > 0 ? `${item.attempts} attempt${item.attempts !== 1 ? "s" : ""}` : "Pending"}
                  </p>
                </div>
                <button onClick={() => removeFromQueue(item.id)} className="p-1 rounded text-slate-300 hover:text-red-400 transition-colors flex-shrink-0">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OfflineBanner;
