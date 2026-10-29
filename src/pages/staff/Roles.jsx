import { usePageUnsaved } from '../../context/UnsavedChangesContext';
import { confirmAction } from "../../utils/feedback";
import PageHeader from "../../components/ui/PageHeader";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Select from "../../components/ui/Select";
import { useEffect, useState } from 'react';
import API from '../../api/axios';
import { useApp } from '../../context/AppContext';

const input = 'mt-1 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white';
export default function Roles() {
  const { state } = useApp();
  const [data, setData] = useState({ roles: [], users: [], permissions: [] });
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [selected, setSelected] = useState([]);
  const [staff, setStaff] = useState('');
  const [roleId, setRoleId] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const isOwner = state.currentUser?.role === 'admin';
  const load = async () => { const response = await API.get('/roles'); setData(response.data.data); };
  useEffect(() => { if (isOwner) load().catch(e => setError(e.response?.data?.message || 'Unable to load roles')); }, [isOwner]);
  const run = async work => {
    setBusy(true); setError(''); setMessage('');
    try { await work(); await load(); setStaff('');setRoleId('');setMessage('Access settings saved.'); return true; }
    catch (e) { setError(e.response?.data?.message || 'Role change could not be confirmed. Refresh before retrying.'); return false; }
    finally { setBusy(false); }
  };
  const reset = () => { setEditing(null); setName(''); setSelected([]); };
  const originalRole=data.roles.find(role=>role._id===editing);
  usePageUnsaved({dirty:name!==(originalRole?.name||'')||JSON.stringify([...selected].sort())!==JSON.stringify([...(originalRole?.permissions||[])].sort())||!!staff||!!roleId,busy,onDiscard:()=>{reset();setStaff('');setRoleId('');}});
  if (!isOwner) return <div role="alert" className="card-base p-6">Only the shop administrator can create and assign roles.</div>;
  const groups = [...new Set(data.permissions.map(permission => permission.split(':')[0]))];
  return <div className="space-y-6">
    <PageHeader title={<>Roles and access</>} description={<>Manage roles and assign access to your team.</>}><p className="workspace-eyebrow">Staff & security</p></PageHeader>
    {error && <div role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-800">{error}<button type="button" onClick={() => load().catch(() => setError('Unable to refresh roles'))} className="ml-3 underline">Refresh</button></div>}
    {message && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">{message}</p>}
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <form className="card-base space-y-5 p-5" onSubmit={event => { event.preventDefault(); run(async () => { await API.request({ method: editing ? 'put' : 'post', url: editing ? `/roles/${editing}` : '/roles', data: { name, permissions: selected } }); reset(); }); }}>
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">{editing ? 'Edit role' : 'Create role'}</h2><button type="button" onClick={reset} disabled={busy} className="ui-button-secondary inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-sm"><Plus className="h-3.5 w-3.5" />New role</button></div>
        <label className="block text-sm font-medium">Role name<input required maxLength={60} className={input} value={name} onChange={event => setName(event.target.value)} placeholder="e.g. Inventory assistant" /></label>
        <p className="text-sm text-slate-500">Choose the actions this role can perform.</p>
        <div className="grid gap-3 sm:grid-cols-2">{groups.map(group => <fieldset key={group} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"><legend className="px-2 text-sm font-semibold capitalize">{group}</legend>{data.permissions.filter(permission => permission.startsWith(`${group}:`)).map(permission => <label key={permission} className="flex min-h-10 items-center gap-3 text-sm"><input type="checkbox" className="h-4 w-4 accent-emerald-700" checked={selected.includes(permission)} onChange={event => setSelected(current => event.target.checked ? [...current, permission] : current.filter(p => p !== permission))} />{permission.split(':')[1]}</label>)}</fieldset>)}</div>
        <p className="text-xs text-slate-500">Selected permissions apply throughout this workspace. Account administration stays with the owner.</p>
        <button disabled={busy} className="ui-button-primary min-h-11 rounded-xl px-5 font-semibold">{busy ? 'Saving…' : editing ? 'Save role' : 'Create role'}</button>
      </form>
      <aside className="space-y-5">
        <section className="card-base space-y-4 p-5"><h2 className="text-lg font-semibold">Assign to staff</h2><Select label="Staff member" aria-label="Staff member" placeholder="Select staff" disabled={busy} value={staff} onChange={event => setStaff(event.target.value)} options={data.users.map(user => ({ value: user._id, label: `${user.name} (${user.email})` }))} /><Select label="Access role" aria-label="Access role" placeholder="Select role" disabled={busy} value={roleId} onChange={event => setRoleId(event.target.value)} options={data.roles.map(role => ({ value: role._id, label: role.name }))} /><button type="button" disabled={busy || !staff || !roleId} onClick={() => run(() => API.post(`/roles/${roleId}/assign`, { userId: staff }))} className="ui-button-primary min-h-11 w-full rounded-xl px-4 font-semibold disabled:opacity-40">Assign role</button><p className="text-xs text-slate-500">Assigning replaces previous overrides and manager privileges. Admin accounts cannot be assigned a custom role.</p></section>
        <section className="card-base space-y-3 p-5"><h2 className="text-lg font-semibold">Your roles</h2>{data.roles.length === 0 && <p className="text-sm text-slate-500">No custom roles yet.</p>}{data.roles.map(role => <article key={role._id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"><h3 className="font-semibold">{role.name}</h3><p className="mt-1 text-xs text-slate-500">{role.permissions.length} permissions · {data.users.filter(user => user.customRoleId === role._id).length} assigned staff</p><div className="mt-2 flex gap-3"><button type="button" disabled={busy} onClick={() => { setEditing(role._id); setName(role.name); setSelected(role.permissions); }} className="ui-button-secondary inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-xs"><Pencil className="h-3.5 w-3.5" />Edit</button><button type="button" disabled={busy} onClick={async () => { if ((await confirmAction(`Delete unused role ${role.name}?`))) run(() => API.delete(`/roles/${role._id}`)); }} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-red-200 px-3 text-xs text-red-700"><Trash2 className="h-3.5 w-3.5" />Delete</button></div></article>)}</section>
        {data.users.filter(user => user.customRoleId).map(user => <div key={user._id} className="card-base p-4"><p className="text-sm font-semibold">{user.name}</p><button type="button" disabled={busy} onClick={async () => { if ((await confirmAction(`Restore standard cashier permissions for ${user.name}?`))) run(() => API.post(`/roles/${user.customRoleId}/unassign`, { userId: user._id })); }} className="mt-2 min-h-11 text-sm underline">Restore standard cashier role</button></div>)}
      </aside>
    </div>
  </div>;
}
