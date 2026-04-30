import React, { useState, useMemo, useEffect } from "react";
import { Package, AlertTriangle, Clock, Calendar, Filter, Search, ChevronDown, Plus, Edit2, Trash2 } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { formatCurrency, formatDate } from "../../utils/helpers";
import EmptyState from "../../components/ui/EmptyState";
import ModernModal from "../../components/ui/ModernModal";
import { getBatches, createBatch } from "../../api/batchesApi";

const MOCK_BATCHES = [
  { _id: "b1", productName: "Roundup Herbicide", batchNo: "LOT-2025-001", mfgDate: "2025-01-15", expiryDate: "2026-08-15", quantity: 12, remaining: 8, costPrice: 350, status: "active" },
  { _id: "b2", productName: "Malathion Insecticide", batchNo: "LOT-2025-002", mfgDate: "2025-03-10", expiryDate: "2026-06-20", quantity: 20, remaining: 5, costPrice: 280, status: "active" },
  { _id: "b3", productName: "Dithane Fungicide", batchNo: "LOT-2024-015", mfgDate: "2024-06-01", expiryDate: "2025-12-10", quantity: 15, remaining: 3, costPrice: 220, status: "expiring_soon" },
  { _id: "b4", productName: "Hybrid Tomato Seeds", batchNo: "LOT-2024-008", mfgDate: "2024-02-20", expiryDate: "2025-10-30", quantity: 25, remaining: 0, costPrice: 700, status: "expired" },
  { _id: "b5", productName: "Urea Fertilizer", batchNo: "LOT-2025-010", mfgDate: "2025-06-01", expiryDate: "2027-01-01", quantity: 50, remaining: 42, costPrice: 140, status: "active" },
  { _id: "b6", productName: "Imidacloprid Insecticide", batchNo: "LOT-2025-003", mfgDate: "2025-02-14", expiryDate: "2026-02-14", quantity: 10, remaining: 6, costPrice: 520, status: "expiring_soon" },
];

const getExpiryStatus = (expiryDate) => {
  const now = new Date();
  const exp = new Date(expiryDate);
  const days = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
  if (days <= 0) return { label: "Expired", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", dot: "bg-red-500", days };
  if (days <= 30) return { label: "< 30 days", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", dot: "bg-red-500", days };
  if (days <= 60) return { label: "< 60 days", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", dot: "bg-orange-500", days };
  if (days <= 90) return { label: "< 90 days", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", dot: "bg-amber-500", days };
  return { label: "Good", color: "bg-emerald-100 text-emerald-700 dark:bg-blue-900/20 dark:text-emerald-400", dot: "bg-emerald-500", days };
};

const BatchExpiry = () => {
  const { state, actions } = useApp();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ productName: "", batchNo: "", mfgDate: "", expiryDate: "", quantity: "", costPrice: "" });

  useEffect(() => {
    getBatches()
      .then(res => setBatches(res.data.data.batches))
      .catch(() => setBatches(MOCK_BATCHES))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => batches.filter(b => {
    const matchSearch = b.productName.toLowerCase().includes(search.toLowerCase()) || b.batchNo.toLowerCase().includes(search.toLowerCase());
    if (filterStatus === "all") return matchSearch;
    if (filterStatus === "expiring") return matchSearch && getExpiryStatus(b.expiryDate).days <= 90 && getExpiryStatus(b.expiryDate).days > 0;
    if (filterStatus === "expired") return matchSearch && getExpiryStatus(b.expiryDate).days <= 0;
    return matchSearch;
  }), [batches, search, filterStatus]);

  const stats = useMemo(() => ({
    total: batches.length,
    expiring30: batches.filter(b => { const d = getExpiryStatus(b.expiryDate).days; return d > 0 && d <= 30; }).length,
    expiring60: batches.filter(b => { const d = getExpiryStatus(b.expiryDate).days; return d > 30 && d <= 60; }).length,
    expired: batches.filter(b => getExpiryStatus(b.expiryDate).days <= 0).length,
  }), [batches]);

  const handleAdd = async () => {
    if (!form.productName || !form.batchNo || !form.expiryDate) { actions.showToast({ message: "Fill required fields", type: "error" }); return; }
    setSaving(true);
    try {
      const res = await createBatch({ ...form, quantity: parseInt(form.quantity) || 0, costPrice: parseFloat(form.costPrice) || 0 });
      setBatches(prev => [...prev, res.data.data.batch]);
      setShowModal(false);
      setForm({ productName: "", batchNo: "", mfgDate: "", expiryDate: "", quantity: "", costPrice: "" });
      actions.showToast({ message: "Batch added successfully", type: "success" });
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Failed to add batch", type: "error" });
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-sm"><Calendar className="w-5 h-5 text-white" /></div>
          <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Batch & Expiry</h1><p className="text-sm text-slate-500 dark:text-slate-400">Track batches, lots, and expiry dates</p></div>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-sm"><Plus className="w-4 h-4" />Add Batch</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Batches", value: stats.total, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30", icon: Package },
          { label: "Expiring < 30d", value: stats.expiring30, color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30", icon: AlertTriangle },
          { label: "Expiring < 60d", value: stats.expiring60, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-100 dark:bg-orange-900/30", icon: Clock },
          { label: "Expired", value: stats.expired, color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30", icon: AlertTriangle },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className="stat-card-premium"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}><Icon className={`w-5 h-5 ${color}`} /></div><div><p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p><p className={`text-xl font-bold mt-0.5 ${color}`}>{value}</p></div></div></div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by product or batch #..." className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all" /></div>
        <div className="relative"><select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="appearance-none pl-3.5 pr-9 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm cursor-pointer"><option value="all">All Batches</option><option value="expiring">Expiring Soon</option><option value="expired">Expired</option></select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" /></div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-premium">
            <thead><tr>{["Product", "Batch/Lot #", "Mfg Date", "Expiry Date", "Qty", "Remaining", "Status"].map(h => <th key={h} className="text-left px-4 py-3.5 text-xs font-700 text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-700/50">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(batch => {
                const expiry = getExpiryStatus(batch.expiryDate);
                return (
                  <tr key={batch._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-white text-sm">{batch.productName}</td>
                    <td className="px-4 py-3.5"><span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg">{batch.batchNo}</span></td>
                    <td className="px-4 py-3.5 text-sm text-slate-500">{formatDate(batch.mfgDate)}</td>
                    <td className="px-4 py-3.5 text-sm font-medium text-slate-700 dark:text-slate-300">{formatDate(batch.expiryDate)}</td>
                    <td className="px-4 py-3.5 text-sm font-bold text-slate-900 dark:text-white">{batch.quantity}</td>
                    <td className="px-4 py-3.5 text-sm font-bold text-slate-900 dark:text-white">{batch.remaining}</td>
                    <td className="px-4 py-3.5"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${expiry.color}`}><span className={`w-1.5 h-1.5 rounded-full ${expiry.dot}`} />{expiry.label} {expiry.days > 0 ? `(${expiry.days}d)` : ""}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <EmptyState icon={Package} title="No batches found" description="Add batch tracking to your products" />}
        </div>
      </div>

      <ModernModal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Batch" footer={<button onClick={handleAdd} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors">Add Batch</button>}>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Product Name *</label><input value={form.productName} onChange={e => setForm(p => ({ ...p, productName: e.target.value }))} className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm" placeholder="Product name" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Batch/Lot # *</label><input value={form.batchNo} onChange={e => setForm(p => ({ ...p, batchNo: e.target.value }))} className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Quantity</label><input type="number" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Mfg Date</label><input type="date" value={form.mfgDate} onChange={e => setForm(p => ({ ...p, mfgDate: e.target.value }))} className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Expiry Date *</label><input type="date" value={form.expiryDate} onChange={e => setForm(p => ({ ...p, expiryDate: e.target.value }))} className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm" /></div>
          </div>
          <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Cost Price</label><input type="number" value={form.costPrice} onChange={e => setForm(p => ({ ...p, costPrice: e.target.value }))} className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm" placeholder="0" /></div>
        </div>
      </ModernModal>
    </div>
  );
};

export default BatchExpiry;
