import React, { useState, useMemo, useEffect } from "react";
import { Building2, Plus, Search, Phone, MapPin, Wallet, Loader2 } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { formatCurrency } from "../../utils/helpers";
import EmptyState from "../../components/ui/EmptyState";
import ModernModal from "../../components/ui/ModernModal";
import { getSuppliers, createSupplier, deleteSupplier } from "../../api/suppliersApi";

const MOCK = [];

const Suppliers = () => {
  const { state, actions } = useApp();
  const { settings } = state;
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", contact: "", phone: "", email: "", address: "", paymentTerms: "Net 30" });

  useEffect(() => {
    getSuppliers()
      .then(res => setSuppliers(res.data.data.suppliers))
      .catch(() => setSuppliers(MOCK))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.contact || "").toLowerCase().includes(search.toLowerCase())
  ), [suppliers, search]);

  const totalOutstanding = suppliers.reduce((s, sup) => s + (sup.outstanding || 0), 0);

  const handleAdd = async () => {
    if (!form.name) { actions.showToast({ message: "Supplier name required", type: "error" }); return; }
    setSaving(true);
    try {
      const res = await createSupplier(form);
      setSuppliers(prev => [...prev, res.data.data.supplier]);
      setShowModal(false);
      setForm({ name: "", contact: "", phone: "", email: "", address: "", paymentTerms: "Net 30" });
      actions.showToast({ message: "Supplier added", type: "success" });
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Failed to add supplier", type: "error" });
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-glow-sm"><Building2 className="w-5 h-5 text-white" /></div>
          <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Suppliers</h1><p className="text-sm text-slate-500 dark:text-slate-400">{suppliers.length} suppliers · Outstanding: {formatCurrency(totalOutstanding, settings.currency)}</p></div>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-glow-sm"><Plus className="w-4 h-4" />Add Supplier</button>
      </div>

      <div className="relative"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search suppliers..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white" /></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(s => (
          <div key={s._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-premium p-5 space-y-3 hover:shadow-premium-lg transition-all">
            <div className="flex items-start justify-between">
              <div><p className="font-bold text-slate-900 dark:text-white">{s.name}</p><p className="text-xs text-slate-400">{s.contact} · {s.paymentTerms}</p></div>
              {s.outstanding > 0 && <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Due: {formatCurrency(s.outstanding, settings.currency)}</span>}
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{s.phone}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{s.address}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-400">Total Purchases: <span className="font-bold text-emerald-600">{formatCurrency(s.totalPurchases, settings.currency)}</span></span>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && <EmptyState icon={Building2} title="No suppliers found" actionLabel="Add Supplier" onAction={() => setShowModal(true)} />}

      <ModernModal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Supplier" footer={<button onClick={handleAdd} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold">Add Supplier</button>}>
        <div className="space-y-4">
          {[{ l: "Company Name *", k: "name" }, { l: "Contact Person", k: "contact" }, { l: "Phone", k: "phone" }, { l: "Email", k: "email" }, { l: "Address", k: "address" }].map(({ l, k }) => (
            <div key={k}><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{l}</label><input value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white" /></div>
          ))}
        </div>
      </ModernModal>
    </div>
  );
};
export default Suppliers;
