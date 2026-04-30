import React, { useState, useEffect } from "react";
import { ShoppingBag } from "lucide-react";
import ModernModal from "../../../components/ui/ModernModal";
import ItemsEditor from "./ItemsEditor";
import { getSuppliers } from "../../../api/suppliersApi";
import { createPurchaseOrder } from "../../../api/purchaseOrdersApi";
import { useApp } from "../../../context/AppContext";

const INIT_FORM = { supplierId: "", expectedDate: "", notes: "" };

const CreatePOModal = ({ isOpen, onClose, onCreated }) => {
  const { actions } = useApp();
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState(INIT_FORM);
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    getSuppliers({ limit: 200 })
      .then(r => {
        const d = r.data.data;
        setSuppliers(d.suppliers ?? d.items ?? d.data ?? []);
      })
      .catch(() => {});
  }, [isOpen]);

  const reset = () => { setForm(INIT_FORM); setItems([]); };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async () => {
    if (!form.supplierId) { actions.showToast({ message: "Supplier is required", type: "error" }); return; }
    if (items.length === 0) { actions.showToast({ message: "Add at least one item", type: "error" }); return; }
    setSaving(true);
    try {
      const payload = { ...form, items: items.map(i => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice })) };
      const res = await createPurchaseOrder(payload);
      const order = res.data.data.order ?? res.data.data;
      actions.showToast({ message: `${order.poNumber} created successfully`, type: "success" });
      onCreated(order);
      handleClose();
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Failed to create PO", type: "error" });
    } finally { setSaving(false); }
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <ModernModal
      isOpen={isOpen} onClose={handleClose}
      title="Create Purchase Order" size="lg"
      icon={ShoppingBag} iconColor="blue"
      footer={
        <div className="flex justify-end gap-3">
          <button onClick={handleClose} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors">
            {saving ? "Creating..." : "Create PO"}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Supplier */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Supplier *</label>
          <select value={form.supplierId} onChange={e => f("supplierId", e.target.value)}
            className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white">
            <option value="">Select Supplier</option>
            {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>

        {/* Expected date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Expected Delivery Date</label>
          <input type="date" value={form.expectedDate} onChange={e => f("expectedDate", e.target.value)}
            className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white" />
        </div>

        {/* Items */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Items *</label>
          <ItemsEditor items={items} setItems={setItems} />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Notes</label>
          <textarea value={form.notes} onChange={e => f("notes", e.target.value)} rows={2}
            className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white resize-none" />
        </div>
      </div>
    </ModernModal>
  );
};

export default CreatePOModal;
