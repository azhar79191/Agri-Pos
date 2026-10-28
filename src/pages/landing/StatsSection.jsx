const capabilities = [
  ['Sell', 'Checkout, receipts and customer accounts'],
  ['Track', 'Stock, supplier balances and reservations'],
  ['Serve', 'Crop seasons, visits and farmer records'],
  ['Review', 'Reports and record-backed assistance'],
];
export default function StatsSection() {
  return <section aria-label="Product capabilities" className="border-y border-white/10"><div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">{capabilities.map(([title, description]) => <div key={title}><h2 className="text-3xl font-bold text-white">{title}</h2><p className="mt-2 text-sm text-slate-400">{description}</p></div>)}</div></section>;
}
