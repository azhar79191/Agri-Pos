import DataTable from "../components/ui/DataTable";
import { useEffect, useRef, useState } from 'react';
import API from '../api/axios';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/helpers';

const field = 'mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white';
function Result({ result, currency }) {
  const entries = Object.entries(result.data);
  const amount = (key, value) => ['price', 'balance', 'outstanding', 'creditBalance', 'invoiceTotal'].includes(key) ? formatCurrency(value, currency) : String(value ?? '');
  return <div className="space-y-3"><p className="text-sm">{result.message}</p>{entries.map(([key, value]) => Array.isArray(value) ? <div key={key} className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700"><DataTable searchable className="w-full text-left text-sm"><caption className="p-3 text-left font-semibold capitalize">{key.replace(/_/g, ' ')}</caption><thead><tr>{Object.keys(value[0] || {}).filter(key => key !== '_id').map(key => <th key={key} className="p-3">{key}</th>)}</tr></thead><tbody>{value.map((row, index) => <tr key={row._id || index} className="border-t border-slate-100 dark:border-slate-700">{Object.entries(row).filter(([key]) => key !== '_id').map(([key, item]) => <td key={key} className="p-3">{amount(key, item)}</td>)}</tr>)}</tbody></DataTable></div> : <p key={key} className="break-words text-sm"><span className="font-semibold">{key}: </span>{amount(key, value)}</p>)}<p className="text-xs text-slate-500">Source: {result.tool} | Read at {new Date(result.generatedAt).toLocaleString()} | No changes posted</p></div>;
}
export default function BusinessAssistant() {
  const { state, actions } = useApp();
  const [question, setQuestion] = useState(''), [messages, setMessages] = useState([]), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [tools, setTools] = useState([]), [ai, setAi] = useState(false), [connections, setConnections] = useState([]);
  const [label, setLabel] = useState(''), [acknowledge, setAcknowledge] = useState(false), [token, setToken] = useState('');
  const generation = useRef(0);
  const canConnect = actions.hasPermission('integrations:manage');
  const loadConnections = async () => { const stamp = generation.current; if (canConnect) { const response = await API.get('/assistant/connections'); if (stamp === generation.current) setConnections(response.data.data.connections); } };
  useEffect(() => {
    const stamp = generation.current;
    API.get('/assistant/tools').then(response => { if (stamp !== generation.current) return; setTools(response.data.data.tools); setAi(response.data.data.aiPlanningEnabled); }).catch(e => { if (stamp === generation.current) setError(e.response?.data?.message || 'Assistant tools could not be loaded'); });
    loadConnections().catch(() => {});
    const reset = () => { generation.current += 1; setMessages([]); setToken(''); setQuestion(''); setTools([]); setConnections([]); setLabel(''); setAcknowledge(false); setAi(false); setError(''); setBusy(false); };
    window.addEventListener('business-session-reset', reset);
    return () => { generation.current += 1; window.removeEventListener('business-session-reset', reset); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const ask = async event => {
    event.preventDefault(); if (!question.trim() || busy) return;
    const stamp = generation.current;
    const current = question; setBusy(true); setError('');
    try { const response = await API.post('/assistant/chat', { question: current }); if (stamp !== generation.current) return; setMessages(previous => [...previous, { question: current, result: response.data.data }].slice(-10)); setQuestion(''); }
    catch (e) { if (stamp !== generation.current) return; setError(e.response?.data?.message || 'The assistant could not answer. Your question is retained.'); }
    finally { if (stamp === generation.current) setBusy(false); }
  };
  const connect = async event => {
    event.preventDefault(); const stamp = generation.current; setBusy(true); setError('');
    try { const response = await API.post('/assistant/connections', { label, acknowledge }); if (stamp !== generation.current) return; setToken(response.data.data.token); await loadConnections(); }
    catch (e) { if (stamp !== generation.current) return; setError(e.response?.data?.message || 'Connection could not be created'); }
    finally { if (stamp === generation.current) setBusy(false); }
  };
  return <div className="space-y-6">
    <header className="workspace-hero"><p className="workspace-eyebrow">Company intelligence</p><h1>Business assistant</h1><p>Explore permitted shop records. Stock, payments, prices and accounts stay unchanged. {ai ? 'AI planning is enabled: your question is sent to the configured provider.' : 'Guided mode is active. Suggested questions work without an AI provider.'}</p></header>
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:bg-red-950 dark:text-red-100">{error}</p>}
    <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="min-w-0 space-y-4" aria-label="Assistant conversation">
        {!messages.length && <div className="card-base space-y-4 p-5"><h2 className="text-lg font-semibold">What would you like to check?</h2><div className="flex flex-wrap gap-2">{[['shop_overview', 'Show my shop overview'], ['stock_alerts', 'Which items have low stock?'], ['customer_dues', 'Which customers owe money?'], ['supplier_balances', 'Show supplier payables'], ['sales_summary', 'Summarize sales']].filter(([tool]) => tools.some(item => item.name === tool)).map(([tool, text]) => <button key={tool} type="button" onClick={() => setQuestion(text)} className="min-h-11 rounded-xl border border-slate-200 px-3 text-left text-sm dark:border-slate-600">{text}</button>)}</div><p className="text-xs text-slate-500">This assistant does not prescribe crop treatments or provide a reconciled accounting statement.</p></div>}
        {messages.map((message, index) => <article key={index} className="card-base space-y-4 p-5"><p className="rounded-xl bg-blue-50 p-3 font-medium text-blue-900 dark:bg-blue-900/30 dark:text-blue-100">{message.question}</p><Result result={message.result} currency={state.settings.currency} /></article>)}
        <form onSubmit={ask} className="card-base space-y-3 p-5"><label className="block text-sm font-semibold">Ask about your business<textarea aria-label="Ask about your business" maxLength={2000} required rows={3} className={field} value={question} onChange={event => setQuestion(event.target.value)} /></label><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-slate-500">Only your current company and role permissions are used.</p><button disabled={busy || !question.trim()} className="ui-button-primary min-h-11 rounded-xl px-5 font-semibold disabled:opacity-40">{busy ? 'Working...' : 'Ask assistant'}</button></div></form>
      </section>
      <aside className="min-w-0 space-y-5"><section className="card-base space-y-3 p-5"><h2 className="text-lg font-semibold">Available tools</h2>{tools.map(tool => <div key={tool.name} className="border-t border-slate-100 pt-3 dark:border-slate-700"><p className="text-sm font-semibold">{tool.name.replace(/_/g, ' ')}</p><p className="mt-1 text-xs leading-relaxed text-slate-500">{tool.description}</p></div>)}</section>
        {canConnect && <section className="card-base space-y-4 p-5"><h2 className="text-lg font-semibold">MCP connections</h2><p className="text-xs leading-relaxed text-slate-500">Use the read-only MCP bridge with a compatible client such as Gemini CLI. Keys expire after one hour. ChatGPT remote setup additionally needs supported authentication and a reachable HTTPS deployment.</p><form onSubmit={connect} className="space-y-3"><label className="block text-sm">Connection name<input required maxLength={80} className={field} value={label} onChange={event => setLabel(event.target.value)} /></label><label className="flex items-start gap-2 text-xs"><input type="checkbox" required checked={acknowledge} onChange={event => setAcknowledge(event.target.checked)} className="mt-1 h-4 w-4" />I understand this lets my chosen external AI client read records allowed by my current role.</label><button disabled={busy || !acknowledge} className="min-h-11 rounded-xl border px-3 text-sm font-semibold disabled:opacity-40">Create one-hour connection</button></form>{token && <div className="space-y-2 rounded-xl border border-amber-200 p-3"><label className="block text-xs font-semibold">New connection token<textarea aria-label="New connection token" readOnly className={`${field} break-all font-mono text-xs`} value={token} /></label><p className="text-xs text-slate-500">Shown only now. Store in your MCP client's secret environment, never a public repository.</p><button type="button" onClick={() => setToken('')} className="min-h-11 text-sm underline">Hide token</button></div>}{connections.map(connection => <div key={connection._id} className="border-t border-slate-100 pt-3 dark:border-slate-700"><p className="break-words text-sm font-semibold">{connection.label}</p><p className="text-xs text-slate-500">{connection.revokedAt ? 'Revoked' : `Expires ${new Date(connection.expiresAt).toLocaleString()}`}</p>{!connection.revokedAt && <button type="button" disabled={busy} onClick={async () => { const stamp = generation.current; setBusy(true); try { await API.delete(`/assistant/connections/${connection._id}`); if (stamp === generation.current) await loadConnections(); } catch { if (stamp === generation.current) setError('Connection could not be revoked'); } finally { if (stamp === generation.current) setBusy(false); } }} className="min-h-11 text-sm text-red-700 underline">Revoke</button>}</div>)}</section>}
      </aside>
    </div>
  </div>;
}
