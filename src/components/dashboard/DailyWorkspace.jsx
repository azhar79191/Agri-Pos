import { ArrowUpRight, Package, Wallet, Sprout } from 'lucide-react';

export default function DailyWorkspace({ hasPermission, onNavigate, lowStock, available }) {
  const tasks = [
    { permission: 'products', icon: Package, title: 'Keep stock ready', detail: available ? `${lowStock} products below their stock threshold. Review quantities before ordering.` : 'Review stock levels and plan your next supplier order.', path: '/stock', action: 'Review stock' },
    { permission: 'customers', icon: Wallet, title: 'Follow up on credit', detail: 'Review customer dues and record collections against the correct account.', path: '/customers/workspace', action: 'Open farmer workspace' },
    { permission: 'products', icon: Sprout, title: 'Support the next crop visit', detail: 'Review the farmer’s advisory history before preparing a recommendation.', path: '/recommendations/history', action: 'Review advisory history' },
  ].filter(task => hasPermission(task.permission));
  if (!tasks.length) return null;
  return <section aria-labelledby="daily-workspace-title" className="overflow-hidden rounded-2xl border border-emerald-200 bg-white dark:border-emerald-900 dark:bg-slate-900">
    <div className="border-b border-emerald-100 bg-emerald-50 px-5 py-4 dark:border-emerald-900 dark:bg-emerald-950/40">
      <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">Daily workspace</p>
      <h2 id="daily-workspace-title" className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">Turn today’s priorities into action</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Stock, collections, and farmer relationships in one place.</p>
    </div>
    <div className="grid gap-4 p-4 md:grid-cols-3">
      {tasks.map(({ icon: Icon, title, detail, path, action }) => <div key={path} className="flex flex-col rounded-xl border border-slate-200 p-4 dark:border-slate-700">
        <Icon aria-hidden="true" className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        <h3 className="mt-3 font-semibold text-slate-900 dark:text-white">{title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{detail}</p>
        <button type="button" onClick={() => onNavigate(path)} className="mt-4 flex min-h-11 items-center justify-between gap-2 rounded-lg px-3 text-left text-sm font-semibold text-emerald-800 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:text-emerald-300 dark:hover:bg-emerald-950">
          {action}<ArrowUpRight aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>)}
    </div>
  </section>;
}
