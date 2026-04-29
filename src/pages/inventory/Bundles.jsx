import React, { useState } from "react";
import { PackagePlus, Plus, Trash2, Package } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { formatCurrency } from "../../utils/helpers";
import EmptyState from "../../components/ui/EmptyState";
import ModernModal from "../../components/ui/ModernModal";

const MOCK = [
  { _id: "bn1", name: "Cotton Starter Kit", items: [{ name: "Imidacloprid", price: 650 }, { name: "Urea Fertilizer", price: 180 }, { name: "Hybrid Cotton Seeds", price: 1200 }], totalValue: 2030, bundlePrice: 1800, discount: 11.3 },
  { _id: "bn2", name: "Wheat Season Pack", items: [{ name: "2,4-D Herbicide", price: 290 }, { name: "DAP Fertilizer", price: 550 }, { name: "Mancozeb Fungicide", price: 340 }], totalValue: 1180, bundlePrice: 999, discount: 15.3 },
  { _id: "bn3", name: "Vegetable Care Bundle", items: [{ name: "Malathion Insecticide", price: 320 }, { name: "NPK 20-20-20", price: 420 }], totalValue: 740, bundlePrice: 650, discount: 12.2 },
];

const Bundles = () => {
  const { state, actions } = useApp();
  const { settings } = state;
  const [bundles, setBundles] = useState(MOCK);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", bundlePrice: "" });

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-glow-sm"><PackagePlus className="w-5 h-5 text-white" /></div>
          <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Product Bundles</h1><p className="text-sm text-slate-500 dark:text-slate-400">{bundles.length} bundles configured</p></div>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-glow-sm"><Plus className="w-4 h-4" />Create Bundle</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bundles.map(b => (
          <div key={b._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-premium overflow-hidden hover:shadow-premium-lg transition-all">
            <div className="h-1 w-full bg-gradient-to-r from-pink-500 to-rose-600" />
            <div className="p-5 space-y-3">
              <div className="flex items-start justify-between"><p className="font-bold text-slate-900 dark:text-white">{b.name}</p><span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">-{b.discount.toFixed(0)}%</span></div>
              <div className="space-y-1.5">{b.items.map((item, i) => <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-sm"><span className="text-slate-700 dark:text-slate-300">{item.name}</span><span className="text-slate-400">{formatCurrency(item.price, settings.currency)}</span></div>)}</div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <div><p className="text-xs text-slate-400 line-through">{formatCurrency(b.totalValue, settings.currency)}</p></div>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(b.bundlePrice, settings.currency)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {bundles.length === 0 && <EmptyState icon={Package} title="No bundles created" description="Create product bundles with discounted pricing" actionLabel="Create Bundle" onAction={() => setShowModal(true)} />}

      <ModernModal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Bundle" footer={<button onClick={() => { setShowModal(false); actions.showToast({ message: "Bundle created", type: "success" }); }} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold">Create</button>}>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Bundle Name</label><input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white" placeholder="e.g. Cotton Starter Kit" /></div>
          <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Bundle Price</label><input type="number" value={form.bundlePrice} onChange={e => setForm(p => ({ ...p, bundlePrice: e.target.value }))} className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white" placeholder="0" /></div>
          <p className="text-xs text-slate-400">Select products from the Products page to add to this bundle.</p>
        </div>
      </ModernModal>
    </div>
  );
};
export default Bundles;
