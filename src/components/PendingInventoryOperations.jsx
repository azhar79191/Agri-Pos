import { useEffect, useState } from 'react';
import { financialCommand, commandIsRunning } from '../api/financialCommand';
import { scopedStorageKey } from '../utils/browserScope';

function loadPending(pathPrefix) {
  const scopeSuffix = scopedStorageKey('');
  const entries = [];
  for (let index = 0; index < sessionStorage.length; index++) {
    const key = sessionStorage.key(index);
    if (!key.startsWith('financial-command:') || !key.endsWith(scopeSuffix)) continue;
    try {
      const item = JSON.parse(sessionStorage.getItem(key));
      if (['clientOperationId', 'clientSaleId'].includes(item.idField) && item.path?.startsWith(pathPrefix) && /^\/(products|invoices|stock\/adjust|purchase-returns|suppliers|loyalty|farmer-workspace|dealer-records|customer-orders|dealer-network)(\/|$)/.test(item.path)) entries.push({ ...item, key });
    } catch { /* Keep unreadable recovery records for manual investigation. */ }
  }
  return entries;
}

export default function PendingInventoryOperations({ pathPrefix, onRecovered }) {
  const [pending, setPending] = useState(() => loadPending(pathPrefix));
  const [message, setMessage] = useState('');
  useEffect(() => {
    const reload = () => setPending(loadPending(pathPrefix));
    window.addEventListener('pending-commands-updated', reload);
    window.addEventListener('storage', reload);
    return () => { window.removeEventListener('pending-commands-updated', reload); window.removeEventListener('storage', reload); };
  }, [pathPrefix]);
  const recover = async item => {
    let confirmed = false;
    try {
      await financialCommand(item.method, item.path, JSON.parse(item.signature), { idField: item.idField, label: item.label });
      confirmed = true;
      setMessage('Original change confirmed. It has not been applied twice.');
      await onRecovered?.();
    } catch (error) {
      setMessage(confirmed ? 'Change confirmed. Refresh this page to load the latest data.' : error.response?.data?.message || error.message || 'Recovery could not be confirmed. The original request is retained.');
    }
  };
  if (!pending.length && !message) return null;
  return <section aria-label="Operation recovery" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
    {pending.length > 0 && <><h2 className="font-semibold">Changes awaiting confirmation</h2><p className="mt-1 text-sm">Recover the original request before entering a replacement.</p></>}
    {pending.map(item => <div key={item.key} className="mt-3 flex flex-wrap items-center justify-between gap-3">
      <span className="text-sm capitalize">{item.label}</span>
      <button type="button" disabled={commandIsRunning(item.key)} onClick={() => recover(item)} className="min-h-11 rounded-lg bg-amber-900 px-4 text-sm font-semibold text-white disabled:opacity-50">{commandIsRunning(item.key) ? 'Confirming...' : 'Recover original change'}</button>
    </div>)}
    {message && <p role="status" className="mt-2 text-sm">{message}</p>}
  </section>;
}
