import React, { useState, useMemo, useEffect } from "react";
import { ShoppingBag, Plus, Search, ChevronDown, Eye, Edit2, Package, Clock, CheckCircle, Truck, Loader2 } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { formatCurrency, formatDate } from "../../utils/helpers";
import EmptyState from "../../components/ui/EmptyState";
import ModernModal from "../../components/ui/ModernModal";
import { getPurchaseOrders, createPurchaseOrder } from "../../api/purchaseOrdersApi";
import { getSuppliers } from "../../api/suppliersApi";

const MOCK_POS = [
  { _id: "po1", poNumber: "PO-2604-001", supplier: "Syngenta Pakistan", status: "Completed", items: 5, total: 45000, createdAt: "2026-04-15", expectedDate: "2026-04-22", receivedDate: "2026-04-20" },
  { _id: "po2", poNumber: "PO-2604-002", supplier: "Bayer CropScience", status: "Sent", items: 3, total: 28500, createdAt: "2026-04-20", expectedDate: "2026-04-30", receivedDate: null },
  { _id: "po3", poNumber: "PO-2604-003", supplier: "FMC Corporation", status: "Draft", items: 8, total: 72000, createdAt: "2026-04-25", expectedDate: "2026-05-05", receivedDate: null },
  { _id: "po4", poNumber: "PO-2604-004", supplier: "BASF Pakistan", status: "Partially Received", items: 4, total: 35000, createdAt: "2026-04-10", expectedDate: "2026-04-18", receivedDate: null },
];

const statusCfg = {
  Draft: { cls: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400", icon: Edit2 },
  Sent: { cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: Truck },
  "Partially Received": { cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: Clock },
  Completed: { cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", icon: CheckCircle },
};

const PurchaseOrders = () => {
  const { state, actions } = useApp();
  const { settings } = state;
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ supplierId: "", expectedDate: "", notes: "" });

  useEffect(() => {
    Promise.all([getPurchaseOrders(), getSuppliers()])
      .then(([poRes, supRes]) => {
        setOrders(poRes.data.data.orders);
        setSuppliers(supRes.data.data.suppliers);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => orders.filter(o => {
    const m = (o.poNumber || "").toLowerCase().includes(search.toLowerCase()) || (o.supplierName || "").toLowerCase().includes(search.toLowerCase());
    return m && (filterStatus === "all" || o.status === filterStatus);
  }), [orders, search, filterStatus]);

  const handleCreate = async () => {
    if (!form.supplierId) { actions.showToast({ message: "Supplier is required", type: "error" }); return; }
    setSaving(true);
    try {
      const res = await createPurchaseOrder(form);
      setOrders(prev => [res.data.data.order, ...prev]);
      setShowModal(false);
      setForm({ supplierId: "", expectedDate: "", notes: "" });
      actions.showToast({ message: `Purchase Order ${res.data.data.order.poNumber} created`, type: "success" });
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Failed to create PO", type: "error" });
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-glow-sm"><ShoppingBag className="w-5 h-5 text-white" /></div>
          <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Purchase Orders</h1><p className="text-sm text-slate-500 dark:text-slate-400">{orders.length} orders</p></div>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-glow-sm"><Plus className="w-4 h-4" />New PO</button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by PO # or supplier..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white" /></div>
        <div className="relative"><select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="appearance-none pl-3.5 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300 cursor-pointer"><option value="all">All Status</option><option value="Draft">Draft</option><option value="Sent">Sent</option><option value="Partially Received">Partially Received</option><option value="Completed">Completed</option></select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" /></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(po => {
          const sc = statusCfg[po.status] || statusCfg.Draft;
          const SIcon = sc.icon;
          return (
            <div key={po._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-premium hover:shadow-premium-lg hover:-translate-y-0.5 transition-all overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-600" />
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div><p className="font-bold text-slate-900 dark:text-white text-sm">{po.poNumber}</p><p className="text-xs text-slate-400 mt-0.5">{formatDate(po.createdAt)}</p></div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${sc.cls}`}><SIcon className="w-3 h-3" />{po.status}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60"><p className="font-semibold text-slate-900 dark:text-white text-sm">{po.supplierName || po.supplier}</p><p className="text-xs text-slate-400 mt-0.5">Expected: {formatDate(po.expectedDate)}</p></div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{po.items} items</span>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(po.total, settings.currency)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {filtered.length === 0 && <EmptyState icon={ShoppingBag} title="No purchase orders" description="Create your first purchase order" actionLabel="New PO" onAction={() => setShowModal(true)} />}

      <ModernModal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Purchase Order" footer={<button onClick={handleCreate} disabled={saving} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors">{saving ? "Creating..." : "Create PO"}</button>}>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Supplier *</label><select value={form.supplierId} onChange={e => setForm(p => ({ ...p, supplierId: e.target.value }))} className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"><option value="">Select Supplier</option>{suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Expected Delivery Date</label><input type="date" value={form.expectedDate} onChange={e => setForm(p => ({ ...p, expectedDate: e.target.value }))} className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white" /></div>
          <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Notes</label><textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white resize-none" /></div>
        </div>
      </ModernModal>
    </div>
  );
};

export default PurchaseOrders;
