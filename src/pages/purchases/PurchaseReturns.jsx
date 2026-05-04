import React, { useState, useCallback, useEffect } from "react";
import { RotateCcw, Plus, X, Loader2, CheckCircle, Clock, XCircle, Package, Eye, AlertCircle, Edit2, Trash2 } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { formatCurrency, formatDate } from "../../utils/helpers";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import FilterBar from "../../components/ui/FilterBar";
import { usePaginatedApi } from "../../hooks/usePaginatedApi";
import { getPurchaseReturns, createPurchaseReturn, updatePurchaseReturn, updateReturnStatus, deletePurchaseReturn, getSupplierProducts } from "../../api/purchaseReturnsApi";
import { getSuppliers } from "../../api/suppliersApi";
import ModernModal from "../../components/ui/ModernModal";

const LIMIT = 15;

const statusCfg = {
  Pending:   { cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",   icon: Clock, desc: "Awaiting approval" },
  Approved:  { cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", icon: CheckCircle, desc: "Stock & amount adjusted" },
  Rejected:  { cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",           icon: XCircle, desc: "Return rejected" },
  Completed: { cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",        icon: CheckCircle, desc: "Fully processed" },
};

const emptyForm = { supplierId: "", reason: "", notes: "", items: [{ product: "", productName: "", quantity: 1, unitCost: 0 }] };

const PurchaseReturns = () => {
  const { state, actions } = useApp();
  const { settings } = state;
  const isAdmin = state.currentUser?.role === "admin" || state.currentUser?.role === "manager";

  const { data: returns, loading, page, totalPages, total, filters, setFilter, setFilters, setPage, refresh } =
    usePaginatedApi(getPurchaseReturns, { search: "", status: "" }, LIMIT);

  const [suppliers, setSuppliers] = useState([]);
  const [supplierProducts, setSupplierProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [editingReturn, setEditingReturn] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [updatingId, setUpdatingId] = useState(null);

  const loadSuppliers = useCallback(async () => {
    if (suppliers.length > 0) return;
    try { const res = await getSuppliers({ limit: 100 }); setSuppliers(res.data.data.suppliers || []); } catch {}
  }, [suppliers.length]);

  const loadSupplierProducts = useCallback(async (supplierId) => {
    if (!supplierId) { setSupplierProducts([]); return; }
    try { 
      const res = await getSupplierProducts(supplierId); 
      setSupplierProducts(res.data.data.products || []); 
    } catch (err) {
      actions.showToast({ message: "Failed to load supplier products", type: "error" });
      setSupplierProducts([]);
    }
  }, [actions]);

  useEffect(() => {
    if (form.supplierId) {
      loadSupplierProducts(form.supplierId);
    }
  }, [form.supplierId, loadSupplierProducts]);

  const openModal = () => { loadSuppliers(); setForm(emptyForm); setEditingReturn(null); setShowModal(true); };
  const openEditModal = (returnItem) => { 
    loadSuppliers();
    setEditingReturn(returnItem);
    setForm({
      supplierId: returnItem.supplier?._id || returnItem.supplier,
      reason: returnItem.reason,
      notes: returnItem.notes || "",
      items: returnItem.items.map(i => ({
        product: i.product?._id || i.product,
        productName: i.productName,
        quantity: i.quantity,
        unitCost: i.unitCost
      }))
    });
    setShowModal(true);
  };
  const openDetailsModal = (returnItem) => { setSelectedReturn(returnItem); setShowDetailsModal(true); };

  const addItem = () => setForm(p => ({ ...p, items: [...p.items, { product: "", productName: "", quantity: 1, unitCost: 0 }] }));
  const removeItem = (i) => setForm(p => ({ ...p, items: p.items.filter((_, idx) => idx !== i) }));
  const updateItem = (i, key, val) => {
    if (key === 'product') {
      const product = supplierProducts.find(p => p._id === val);
      setForm(p => ({ ...p, items: p.items.map((item, idx) => idx === i ? { 
        ...item, 
        product: val, 
        productName: product?.name || "",
        unitCost: product?.costPrice || 0 
      } : item) }));
    } else {
      setForm(p => ({ ...p, items: p.items.map((item, idx) => idx === i ? { ...item, [key]: val } : item) }));
    }
  };

  const handleCreate = async () => {
    if (!form.supplierId) { actions.showToast({ message: "Select a supplier", type: "error" }); return; }
    if (!form.reason.trim()) { actions.showToast({ message: "Reason is required", type: "error" }); return; }
    if (form.items.some(i => !i.product)) { actions.showToast({ message: "All items need a product selected", type: "error" }); return; }
    setSaving(true);
    try {
      const items = form.items.map(i => ({ 
        product: i.product,
        productName: i.productName, 
        quantity: parseInt(i.quantity) || 1, 
        unitCost: parseFloat(i.unitCost) || 0, 
        total: (parseInt(i.quantity) || 1) * (parseFloat(i.unitCost) || 0) 
      }));
      
      if (editingReturn) {
        await updatePurchaseReturn(editingReturn._id, { supplierId: form.supplierId, reason: form.reason, notes: form.notes, items });
        actions.showToast({ message: "Purchase return updated", type: "success" });
      } else {
        await createPurchaseReturn({ supplierId: form.supplierId, reason: form.reason, notes: form.notes, items });
        actions.showToast({ message: "Purchase return created", type: "success" });
      }
      setShowModal(false);
      refresh();
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Failed to save return", type: "error" });
    } finally { setSaving(false); }
  };

  const handleStatusUpdate = async (id, status) => {
    const returnItem = returns.find(r => r._id === id);
    
    if (status === "Approved") {
      const totalAmount = returnItem.total || returnItem.items?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
      const confirmMsg = `Approving this return will:\n\n` +
        `• Reduce stock for ${returnItem.items?.length || 0} item(s)\n` +
        `• Deduct ${formatCurrency(totalAmount, settings.currency)} from supplier balance\n\n` +
        `This action cannot be undone. Continue?`;
      
      if (!window.confirm(confirmMsg)) return;
    }
    
    setUpdatingId(id);
    try {
      await updateReturnStatus(id, status);
      const msg = status === "Approved" 
        ? "Return approved. Stock reduced and amount deducted from supplier."
        : `Return ${status.toLowerCase()}`;
      actions.showToast({ message: msg, type: "success" });
      refresh();
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to update status";
      actions.showToast({ message: errMsg, type: "error" });
    } finally { setUpdatingId(null); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this return? This action cannot be undone.')) return;
    setUpdatingId(id);
    try {
      await deletePurchaseReturn(id);
      actions.showToast({ message: "Return deleted successfully", type: "success" });
      refresh();
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Failed to delete return", type: "error" });
    } finally { setUpdatingId(null); }
  };

  const totalReturns = returns.reduce((s, r) => s + (r.total || 0), 0);

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-sm flex-shrink-0">
            <RotateCcw className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Purchase Returns</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{total} returns · Total: {formatCurrency(totalReturns, settings.currency)}</p>
          </div>
        </div>
        {isAdmin && (
          <button onClick={openModal} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-semibold shadow-sm transition-all hover:opacity-90" style={{ background: "var(--pos-primary)" }}>
            <Plus className="w-4 h-4" />New Return
          </button>
        )}
      </div>

      {/* Filters */}
      <FilterBar
        filters={[
          { type: 'search', key: 'search', placeholder: 'Search by return # or supplier...' },
          { type: 'select', key: 'status', placeholder: 'All Status', options: [
            { value: 'Pending', label: 'Pending' },
            { value: 'Approved', label: 'Approved' },
            { value: 'Rejected', label: 'Rejected' },
            { value: 'Completed', label: 'Completed' },
          ]},
        ]}
        values={filters}
        onChange={setFilter}
        onClear={() => setFilters({ search: '', status: '' })}
        total={total}
      />

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 shadow-premium overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading...</span>
          </div>
        ) : returns.length === 0 ? (
          <EmptyState icon={RotateCcw} title="No purchase returns" description="Create a return when you need to send goods back to a supplier" actionLabel={isAdmin ? "New Return" : undefined} onAction={isAdmin ? openModal : undefined} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-premium">
              <thead>
                <tr>
                  {["Return #", "Supplier", "Reason", "Items", "Total", "Status", "Date", isAdmin ? "Actions" : ""].filter(Boolean).map(h => (
                    <th key={h} className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-700/50">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {returns.map(r => {
                  const sc = statusCfg[r.status] || statusCfg.Pending;
                  const SIcon = sc.icon;
                  return (
                    <tr key={r._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg">{r.returnNumber}</span>
                      </td>
                      <td className="px-4 py-3.5 text-sm font-medium text-slate-900 dark:text-white">{r.supplierName}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-500 max-w-[160px] truncate">{r.reason}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-500">{r.items?.length || 0} items</td>
                      <td className="px-4 py-3.5 text-sm font-bold text-red-600 dark:text-red-400">{formatCurrency(r.total, settings.currency)}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${sc.cls} w-fit`}>
                            <SIcon className="w-3 h-3" />{r.status}
                          </span>
                          {r.status === "Approved" && r.stockAdjusted && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">✓ Processed</span>
                          )}
                          {r.status === "Approved" && !r.stockAdjusted && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">⚠ Pending adjustment</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-500">{formatDate(r.createdAt?.split?.("T")[0] || r.createdAt)}</td>
                      {isAdmin && (
                        <td className="px-4 py-3.5">
                          <div className="flex gap-1.5">
                            <button onClick={() => openDetailsModal(r)} className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors" title="View Details">
                              <Eye className="w-3 h-3" />
                            </button>
                            {r.status === "Pending" && (
                              <>
                                <button onClick={() => openEditModal(r)} className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 transition-colors" title="Edit">
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button onClick={() => handleStatusUpdate(r._id, "Approved")} disabled={updatingId === r._id}
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 transition-colors disabled:opacity-50" title="Approve">
                                  {updatingId === r._id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Approve"}
                                </button>
                                <button onClick={() => handleStatusUpdate(r._id, "Rejected")} disabled={updatingId === r._id}
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 transition-colors disabled:opacity-50" title="Reject">
                                  Reject
                                </button>
                              </>
                            )}
                            {r.status === "Rejected" && (
                              <button onClick={() => handleDelete(r._id)} disabled={updatingId === r._id} className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 transition-colors disabled:opacity-50" title="Delete">
                                {updatingId === r._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} total={total} limit={LIMIT} onPageChange={setPage} />
      </div>

      {/* Create/Edit Modal */}
      <ModernModal isOpen={showModal} onClose={() => setShowModal(false)} title={editingReturn ? "Edit Purchase Return" : "New Purchase Return"} size="lg"
        footer={
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
            <button onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors order-2 sm:order-1">Cancel</button>
            <button onClick={handleCreate} disabled={saving} className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 order-1 sm:order-2" style={{ background: "var(--pos-primary)" }}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
              {editingReturn ? "Update Return" : "Create Return"}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Supplier <span className="text-red-500">*</span></label>
              <select value={form.supplierId} onChange={e => setForm(p => ({ ...p, supplierId: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[var(--pos-primary)]/20 focus:border-[var(--pos-primary)] transition-all">
                <option value="">Select Supplier</option>
                {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Reason <span className="text-red-500">*</span></label>
              <input value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
                placeholder="e.g. Damaged goods, Wrong product"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[var(--pos-primary)]/20 focus:border-[var(--pos-primary)] transition-all" />
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Return Items</label>
              <button onClick={addItem} className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <Plus className="w-3 h-3" />Add Item
              </button>
            </div>
            <div className="space-y-2">
              {form.items.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <select value={item.product} onChange={e => updateItem(i, 'product', e.target.value)}
                    className="col-span-12 sm:col-span-5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[var(--pos-primary)]/20 focus:border-[var(--pos-primary)] transition-all">
                    <option value="">Select Product</option>
                    {supplierProducts.map(p => <option key={p._id} value={p._id}>{p.name} (Stock: {p.stock})</option>)}
                  </select>
                  <input type="number" min="1" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)}
                    placeholder="Qty" className="col-span-5 sm:col-span-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white text-center focus:ring-2 focus:ring-[var(--pos-primary)]/20 focus:border-[var(--pos-primary)] transition-all" />
                  <input type="number" min="0" step="0.01" value={item.unitCost} onChange={e => updateItem(i, 'unitCost', e.target.value)}
                    placeholder="Unit cost" className="col-span-6 sm:col-span-4 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[var(--pos-primary)]/20 focus:border-[var(--pos-primary)] transition-all" />
                  <button onClick={() => removeItem(i)} disabled={form.items.length === 1} className="col-span-1 flex items-center justify-center text-slate-400 hover:text-red-500 disabled:opacity-30 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {!form.supplierId && (
                <p className="text-xs text-amber-600 dark:text-amber-400">⚠ Select a supplier first to see available products</p>
              )}
              {form.supplierId && supplierProducts.length === 0 && (
                <p className="text-xs text-slate-500 dark:text-slate-400">No products found for this supplier</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white resize-none focus:ring-2 focus:ring-[var(--pos-primary)]/20 focus:border-[var(--pos-primary)] transition-all"
              placeholder="Optional notes..." />
          </div>
        </div>
      </ModernModal>

      {/* Details Modal */}
      <ModernModal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} title="Return Details" size="lg">
        {selectedReturn && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Return Number</p>
                <p className="font-mono text-sm font-bold text-red-600 dark:text-red-400">{selectedReturn.returnNumber}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Status</p>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusCfg[selectedReturn.status]?.cls}`}>
                  {selectedReturn.status}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Supplier</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedReturn.supplierName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Amount</p>
                <p className="text-sm font-bold text-red-600 dark:text-red-400">{formatCurrency(selectedReturn.total, settings.currency)}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Reason</p>
              <p className="text-sm text-slate-900 dark:text-white">{selectedReturn.reason}</p>
            </div>

            {selectedReturn.notes && (
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Notes</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{selectedReturn.notes}</p>
              </div>
            )}

            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Items</p>
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400">Product</th>
                      <th className="text-center px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400">Qty</th>
                      <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400">Unit Cost</th>
                      <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedReturn.items?.map((item, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 text-slate-900 dark:text-white">{item.productName}</td>
                        <td className="px-3 py-2 text-center text-slate-600 dark:text-slate-400">{item.quantity}</td>
                        <td className="px-3 py-2 text-right text-slate-600 dark:text-slate-400">{formatCurrency(item.unitCost, settings.currency)}</td>
                        <td className="px-3 py-2 text-right font-medium text-slate-900 dark:text-white">{formatCurrency(item.total, settings.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedReturn.status === "Approved" && (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-300 mb-2">Processing Status</p>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        {selectedReturn.stockAdjusted ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        )}
                        <span className="text-xs text-emerald-800 dark:text-emerald-300">
                          Stock reduced from inventory
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedReturn.amountAdjusted ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        )}
                        <span className="text-xs text-emerald-800 dark:text-emerald-300">
                          Amount deducted from supplier balance
                        </span>
                      </div>
                    </div>
                    {selectedReturn.processedAt && (
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-2">
                        Processed on {formatDate(selectedReturn.processedAt)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Created</p>
                <p className="text-sm text-slate-900 dark:text-white">{formatDate(selectedReturn.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Updated</p>
                <p className="text-sm text-slate-900 dark:text-white">{formatDate(selectedReturn.updatedAt)}</p>
              </div>
            </div>
          </div>
        )}
      </ModernModal>
    </div>
  );
};

export default PurchaseReturns;
