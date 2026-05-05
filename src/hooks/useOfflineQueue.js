import { useState, useEffect, useRef, useCallback } from "react";
import { useOnlineStatus } from "./useOnlineStatus";

const QUEUE_KEY = "agrinest_offline_queue";

const loadQueue  = () => { try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]"); } catch { return []; } };
const saveQueue  = (q) => localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
const clearQueue = ()  => localStorage.removeItem(QUEUE_KEY);

/**
 * useOfflineQueue
 *
 * Usage:
 *   const { enqueue, pendingCount } = useOfflineQueue();
 *   // Instead of calling API directly:
 *   enqueue({ label: "Checkout Sale", fn: () => createInvoice(payload) });
 *
 * When offline  → stores the action in localStorage queue + shows toast.
 * When back online → auto-retries all queued actions in order.
 */
const useOfflineQueue = () => {
  const isOnline                  = useOnlineStatus();
  const [queue, setQueue]         = useState(loadQueue);
  const [retrying, setRetrying]   = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const processingRef             = useRef(false);

  // Persist queue to localStorage whenever it changes
  useEffect(() => { saveQueue(queue); }, [queue]);

  // Auto-retry when coming back online
  useEffect(() => {
    if (isOnline && queue.length > 0 && !processingRef.current) {
      retryAll();
    }
  }, [isOnline]); // eslint-disable-line

  const enqueue = useCallback((action) => {
    // action = { label: string, fn: () => Promise, onSuccess?: () => void, onError?: () => void }
    const item = {
      id:        Date.now() + Math.random(),
      label:     action.label,
      payload:   action.payload || null,   // serialisable data for display
      queuedAt:  new Date().toISOString(),
      attempts:  0,
    };
    // Store the fn reference in memory (can't serialise functions)
    item._fn        = action.fn;
    item._onSuccess = action.onSuccess;
    item._onError   = action.onError;

    setQueue((prev) => [...prev, item]);
    return item.id;
  }, []);

  const retryAll = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;
    setRetrying(true);

    const current = loadQueue();
    const failed  = [];

    for (const item of current) {
      if (!item._fn) continue; // fn lost on page reload — skip
      try {
        await item._fn();
        item._onSuccess?.();
      } catch {
        item.attempts = (item.attempts || 0) + 1;
        if (item.attempts < 3) failed.push(item); // retry up to 3 times
        item._onError?.();
      }
    }

    setQueue(failed);
    setLastSynced(new Date());
    setRetrying(false);
    processingRef.current = false;
  }, []);

  const removeFromQueue = useCallback((id) => {
    setQueue((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setQueue([]);
    clearQueue();
  }, []);

  return {
    isOnline,
    pendingCount: queue.length,
    queue,
    retrying,
    lastSynced,
    enqueue,
    retryAll,
    removeFromQueue,
    clearAll,
  };
};

export default useOfflineQueue;
