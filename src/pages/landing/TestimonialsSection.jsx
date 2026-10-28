const workflows = [
  ['At the counter', 'Record a sale, confirm the payment method and keep the farmer account connected to the invoice.'],
  ['Before the season', 'Review crop budgets, reserve available inputs and compare supplier offers using explicit pack sizes.'],
  ['After the visit', 'Assign follow-ups, record laboratory reports and keep complaints and human reviews in the company record.'],
];
export default function TestimonialsSection() {
  return <section id="testimonials" className="border-t border-white/10"><div className="mx-auto max-w-7xl px-6 py-24"><h2 className="text-center text-4xl font-bold text-white">Built around dealer workflows</h2><p className="mx-auto mt-5 max-w-2xl text-center text-slate-400">Explore these workflows with your own team during an assisted pilot.</p><div className="mt-12 grid gap-6 md:grid-cols-3">{workflows.map(([title, text]) => <article key={title} className="rounded-2xl border border-white/10 p-7"><h3 className="text-xl font-semibold text-white">{title}</h3><p className="mt-4 leading-relaxed text-slate-400">{text}</p></article>)}</div></div></section>;
}
