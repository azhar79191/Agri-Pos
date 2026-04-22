import React, { useState, useEffect } from "react";
import { Package, Plus, Minus, Edit3, History, AlertTriangle, Lock, TrendingUp, TrendingDown, BarChart2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useStock } from "../hooks/useStock";
import { useProducts } from "../context/ProductsContext";

const StockManagement = () => {
  const { actions, state } = useApp();
  const { currentUser } = state;
  const { products, fetchProducts } = useProducts();
  const { logs, alerts, loading, fetchLogs, fetchAlerts, fetchLevels, adjust } = useStock();

  const isAdmin = currentUser?.role === "admin";

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustmentType, setAdjustmentType] = useState("add");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [stockLevels, setStockLevels] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchLogs();
    fetchAlerts();
    fetchLevels().then(data => { if (data) setStockLevels(data); }).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStockAdjustment = async () => {
    if (!isAdmin) { actions.showToast({ message: "Only admin can adjust stock", type: "error" }); return; }
    if (!selectedProduct || !quantity || !reason) return;
    setSubmitting(true);
    try {
      await adjust({ product: selectedProduct, action: adjustmentType, quantity: parseInt(quantity), reason });
      actions.showToast({ message: "Stock adjusted successfully", type: "success" });
      fetchLogs(); fetchAlerts();
      fetchLevels().then(data => { if (data) setStockLevels(data); }).catch(() => {});
      setSelectedProduct(null); setQuantity(""); setReason("");
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Adjustment failed", type: "error" });
    } finally { setSubmitting(false); }
  };

  const displayLevels = stockLevels.length > 0 ? stockLevels : products;

  const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all";

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-glow-sm">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Stock Management</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
              Monitor and adjust inventory levels
              {!isAdmin && <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400"><Lock className="w-3 h-3" />View Only</span>}
            </p>
          </div>
        </div>
      </div>

      {/* View-only notice */}
      {!isAdmin && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
            <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="font-semibold text-amber-900 dark:text-amber-300 text-sm">View Only Access</p>
            <p className="text-xs text-amber-700 dark:text-amber-400">Only administrators can adjust stock levels.</p>
          </div>
        </div>
      )}

      {/* Low stock alerts */}
      {alerts.length > 0 && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <p className="font-semibold text-red-800 dark:text-red-300 text-sm">{alerts.length} products running low on stock</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {alerts.map(product => (
              <span key={product._id} className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                {product.name} ({product.stock} left)
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Adjustment Panel */}
        {isAdmin && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-premium p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Edit3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Stock Adjustment</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Product</label>
                <select value={selectedProduct || ""} onChange={e => setSelectedProduct(e.target.value)} className={inputCls}>
                  <option value="">Select Product</option>
                  {products.map(p => <option key={p._id} value={p._id}>{p.name} (Current: {p.stock})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Action</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "add", label: "Add Stock", icon: Plus, color: "emerald" },
                    { value: "remove", label: "Remove", icon: Minus, color: "red" },
                    { value: "set", label: "Set Level", icon: Edit3, color: "blue" },
                  ].map(({ value, label, icon: Icon, color }) => (
                    <button key={value} onClick={() => setAdjustmentType(value)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-semibold transition-all ${
                        adjustmentType === value
                          ? color === "emerald" ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                          : color === "red" ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                          : "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                      }`}>
                      <Icon className="w-4 h-4" />{label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">
                  {adjustmentType === "set" ? "New Stock Level" : "Quantity"}
                </label>
                <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} className={inputCls} placeholder="Enter quantity" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Reason</label>
                <input type="text" value={reason} onChange={e => setReason(e.target.value)} className={inputCls} placeholder="Enter reason for adjustment" />
              </div>

              <button
                onClick={handleStockAdjustment}
                disabled={!selectedProduct || !quantity || !reason || submitting}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all shadow-glow-sm disabled:shadow-none"
              >
                {submitting ? "Applying..." : "Apply Adjustment"}
              </button>
            </div>
          </div>
        )}

        {/* Stock History */}
        <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-premium p-6 ${!isAdmin ? "lg:col-span-2" : ""}`}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <History className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Stock History</h2>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {loading ? (
              <p className="text-slate-500 dark:text-slate-400 text-center py-8 text-sm">Loading...</p>
            ) : logs.length === 0 ? (
              <div className="text-center py-10">
                <History className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-slate-500 dark:text-slate-400 text-sm">No stock history available</p>
              </div>
            ) : (
              logs.slice(0, 10).map((entry, i) => (
                <div key={entry._id || i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${entry.type === "add" ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
                      {entry.type === "add" ? <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">{entry.productName || entry.product?.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{entry.reason} · {entry.createdAt?.split("T")[0]}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${entry.type === "add" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                    {entry.type === "add" ? "+" : "-"}{entry.quantity}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Stock Levels Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-premium overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h2 className="font-bold text-slate-900 dark:text-white text-sm">Current Stock Levels</h2>
          <span className="ml-auto text-xs text-slate-400">{displayLevels.length} products</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-premium">
            <thead>
              <tr>
                {["Product", "Current Stock", "Unit", "Status"].map(h => (
                  <th key={h} className="text-left px-4 py-3.5 text-xs font-700 text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-700/50">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {displayLevels.map(product => {
                const status = product.stock <= 5 ? "low" : product.stock <= 20 ? "medium" : "good";
                return (
                  <tr key={product._id || product.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-white text-sm">{product.name}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">{product.stock}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-500 dark:text-slate-400">{product.unit}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        status === "low" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                        status === "medium" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status === "low" ? "bg-red-500" : status === "medium" ? "bg-amber-500" : "bg-emerald-500"}`} />
                        {status === "low" ? "Low Stock" : status === "medium" ? "Medium" : "Good Stock"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockManagement;
