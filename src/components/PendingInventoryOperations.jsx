import { useEffect, useState } from 'react';
import { financialCommand, commandIsRunning } from '../api/financialCommand';
import { readRecoveryCommands } from '../utils/recoveryCommands';

function loadPending(pathPrefix) { return readRecoveryCommands().filter(item=>item.replayable && !commandIsRunning(item.key) && item.idField==='clientOperationId' && item.path.startsWith(pathPrefix)); }

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
