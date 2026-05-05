import { useState, useEffect, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { getBundles, createBundle, updateBundle, deleteBundle } from "../api/bundlesApi";

const LIMIT = 12;
const EMPTY_FORM = { name: "", description: "", bundlePrice: "", items: [] };

/**
 * useBundles — manages bundle list, pagination, and CRUD for the Bundles page.
 */
export function useBundles() {
  const { actions }               = useApp();
  const [bundles, setBundles]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]         = useState(0);
  const [search, setSearch]       = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [productSearch, setProductSearch] = useState("");
  const [deleting, setDeleting]   = useState(null);

  const load = useCallback(async (p = 1, q = search) => {
    setLoading(true);
    try {
      const params = { page: p, limit: LIMIT };
      if (q) params.search = q;
      const res = await getBundles(params);
      const d   = res.data.data;
      setBundles(d.bundles || []);
      setTotal(d.pagination?.total || 0);
      setTotalPages(d.pagination?.pages || 1);
    } catch { setBundles([]); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(1, search); }, 300);
    return () => clearTimeout(t);
  }, [search]); // eslint-disable-line

  useEffect(() => { load(page, search); }, [page]); // eslint-disable-line

  const openCreate = useCallback(() => { setEditing(null); setForm(EMPTY_FORM); setProductSearch(""); setShowModal(true); }, []);

  const openEdit = useCallback((b) => {
    setEditing(b);
    setForm({ name: b.name, description: b.description || "", bundlePrice: b.bundlePrice, items: b.items.map((i) => ({ product: i.product?._id || i.product, productName: i.productName, price: i.price, quantity: i.quantity || 1 })) });
    setProductSearch("");
    setShowModal(true);
  }, []);

  const addItem = useCallback((product) => {
    if (form.items.find((i) => i.product === product._id)) return;
    setForm((p) => ({ ...p, items: [...p.items, { product: product._id, productName: product.name, price: product.price, quantity: 1 }] }));
  }, [form.items]);

  const removeItem = useCallback((productId) => setForm((p) => ({ ...p, items: p.items.filter((i) => i.product !== productId) })), []);

  const updateQty = useCallback((productId, qty) =>
    setForm((p) => ({ ...p, items: p.items.map((i) => i.product === productId ? { ...i, quantity: Math.max(1, parseInt(qty) || 1) } : i) })),
  []);

  const handleSave = useCallback(async () => {
    if (!form.name.trim()) { actions.showToast({ message: "Bundle name required", type: "error" }); return; }
    if (!form.bundlePrice || parseFloat(form.bundlePrice) <= 0) { actions.showToast({ message: "Bundle price required", type: "error" }); return; }
    if (form.items.length === 0) { actions.showToast({ message: "Add at least one product", type: "error" }); return; }
    setSaving(true);
    try {
      const payload = { ...form, bundlePrice: parseFloat(form.bundlePrice) };
      if (editing) {
        const res = await updateBundle(editing._id, payload);
        setBundles((prev) => prev.map((b) => b._id === editing._id ? res.data.data.bundle : b));
        actions.showToast({ message: "Bundle updated", type: "success" });
      } else {
        await createBundle(payload);
        actions.showToast({ message: "Bundle created", type: "success" });
        load(1, search);
      }
      setShowModal(false);
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Failed to save bundle", type: "error" });
    } finally { setSaving(false); }
  }, [form, editing, actions, load, search]);

  const handleDelete = useCallback(async (id) => {
    setDeleting(id);
    try {
      await deleteBundle(id);
      setBundles((prev) => prev.filter((b) => b._id !== id));
      setTotal((t) => t - 1);
      actions.showToast({ message: "Bundle deleted", type: "success" });
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Failed to delete", type: "error" });
    } finally { setDeleting(null); }
  }, [actions]);

  const totalValue = form.items.reduce((s, i) => s + i.price * (i.quantity || 1), 0);
  const discount   = totalValue > 0 && form.bundlePrice ? parseFloat(((totalValue - parseFloat(form.bundlePrice)) / totalValue * 100).toFixed(1)) : 0;

  return {
    bundles, loading, page, setPage, totalPages, total,
    search, setSearch,
    showModal, setShowModal,
    editing, saving, deleting,
    form, setForm,
    productSearch, setProductSearch,
    totalValue, discount,
    openCreate, openEdit,
    addItem, removeItem, updateQty,
    handleSave, handleDelete,
  };
}
