import API from './axios';
import { scopedStorageKey } from '../utils/browserScope';

const inFlight = new Map();
const notify = () => window.dispatchEvent(new Event('pending-commands-updated'));
export const commandIsRunning = key => inFlight.has(key);

// Keep the same identifier across ambiguous network failures and page reloads.
export async function financialCommand(method, path, data, { idField = 'clientPaymentId', label = 'payment' } = {}) {
  const key = scopedStorageKey(`financial-command:${method}:${path}`);
  const signature = JSON.stringify(data);
  const saved = JSON.parse(sessionStorage.getItem(key) || 'null');
  if (saved && saved.signature !== signature) {
    throw new Error(`A previous ${label} is unresolved. Recover its original details before recording another change.`);
  }
  if (inFlight.has(key)) return inFlight.get(key);
  const attempt = saved || { id: crypto.randomUUID(), signature, method, path, idField, label };
  sessionStorage.setItem(key, JSON.stringify(attempt));
  const clearAttempt = () => {
    if (JSON.parse(sessionStorage.getItem(key) || 'null')?.id === attempt.id) sessionStorage.removeItem(key);
  };
  const promise = (async () => {
    try {
      const response = await Promise.resolve().then(() => API.request({ method, url: path, data: { ...data, [idField]: attempt.id } }));
      clearAttempt();
      return response;
    } catch (error) {
      const status = error.response?.status;
      if (status >= 400 && status < 500 && ![408, 429].includes(status)) clearAttempt();
      throw error;
    } finally { inFlight.delete(key); notify(); }
  })();
  inFlight.set(key, promise);
  notify();
  return promise;
}
