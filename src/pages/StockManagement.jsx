import React, { useState, useEffect } from "react";
import { Package, Plus, Minus, Edit3, History, AlertTriangle, Lock } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useStock } from "../hooks/useStock";
import { useProducts } from "../context/ProductsContext";
import Card from "../components/ui/Card";

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
    fetchLevels().then((data) => { if (data) setStockLevels(data); }).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStockAdjustment = async () => {
    if (!isAdmin) {
      actions.showToast({ message: "Only admin can adjust stock", type: "error" });
      return;
    }
    if (!selectedProduct || !quantity || !reason) return;
    setSubmitting(true);
    try {
      await adjust({
        product: selectedProduct,
        action: adjustmentType,
        quantity: parseInt(quantity),
        reason,
      });
      actions.showToast({ message: "Stock adjusted successfully", type: "success" });
      fetchLogs();
      fetchAlerts();
      fetchLevels().then((data) => { if (data) setStockLevels(data); }).catch(() => {});
      setSelectedProduct(null);
      setQuantity("");
      setReason("");
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Adjustment failed", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const displayLevels = stockLevels.length > 0 ? stockLevels : products;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Stock Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1.5 flex items-center gap-2">
            <Package className="w-4 h-4" />
            <span>Monitor and adjust inventory levels</span>
            {!isAdmin && (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-sm">
                <Lock className="w-3 h-3" />
                View Only
              </span>
            )}
          </p>
        </div>
      </div>

      {!isAdmin && (
        <Card padding="md" className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-300">View Only Access</h3>
              <p className="text-sm text-amber-700 dark:text-amber-400">Only administrators can adjust stock levels. You can view current stock and history.</p>
            </div>
          </div>
        </Card>
      )}

      {alerts.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-medium text-red-800 dark:text-red-400">Low Stock Alert</h3>
          </div>
          <p className="text-red-700 dark:text-red-300 text-sm mb-3">
            {alerts.length} products are running low on stock
          </p>
          <div className="flex flex-wrap gap-2">
            {alerts.map((product) => (
              <span key={product._id} className="bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 px-2 py-1 rounded text-xs">
                {product.name} ({product.stock} left)
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isAdmin && (
          <Card padding="lg" className="shadow-xl">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-emerald-600" />
              Stock Adjustment
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Product</label>
                <select
                  value={selectedProduct || ""}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all"
                >
                  <option value="">Select Product</option>
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name} (Current: {product.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Action</label>
                <div className="flex gap-2">
                  {[
                    { value: "add", label: "Add Stock", icon: Plus },
                    { value: "remove", label: "Remove Stock", icon: Minus },
                    { value: "set", label: "Set Stock", icon: Edit3 },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setAdjustmentType(value)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        adjustmentType === value
                          ? "bg-emerald-500 text-white shadow-lg"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      <Icon className="w-4 h-4" />{label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  {adjustmentType === "set" ? "New Stock Level" : "Quantity"}
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="Enter quantity"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Reason</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="Enter reason for adjustment"
                />
              </div>

              <button
                onClick={handleStockAdjustment}
                disabled={!selectedProduct || !quantity || !reason || submitting}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-gray-300 disabled:to-gray-400 text-white py-2.5 px-4 rounded-xl font-medium transition-all shadow-lg disabled:shadow-none"
              >
                {submitting ? "Applying..." : "Apply Adjustment"}
              </button>
            </div>
          </Card>
        )}

        <Card padding="lg" className={`shadow-xl ${!isAdmin ? "lg:col-span-2" : ""}`}>
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Stock History</h2>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {loading ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">Loading...</p>
            ) : logs.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No stock history available</p>
            ) : (
              logs.slice(0, 10).map((entry, i) => (
                <div key={entry._id || i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{entry.productName || entry.product?.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {entry.type === "add" ? "Added" : entry.type === "remove" ? "Removed" : "Adjusted"} {entry.quantity} units
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{entry.reason} • {entry.createdAt?.split("T")[0]}</p>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    entry.type === "add"
                      ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-400"
                      : "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 dark:from-red-900/30 dark:to-rose-900/30 dark:text-red-400"
                  }`}>
                    {entry.type === "add" ? "+" : "-"}{entry.quantity}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card padding="lg" className="shadow-xl">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
          <Package className="w-5 h-5 text-emerald-600" />
          Current Stock Levels
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Product</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Current Stock</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Unit</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {displayLevels.map((product) => (
                <tr key={product._id || product.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{product.name}</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white font-semibold">{product.stock}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{product.unit}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      product.stock <= 5
                        ? "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 dark:from-red-900/30 dark:to-rose-900/30 dark:text-red-400 border border-red-200 dark:border-red-800"
                        : product.stock <= 20
                        ? "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 dark:from-amber-900/30 dark:to-orange-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                        : "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-400 border border-green-200 dark:border-green-800"
                    }`}>
                      {product.stock <= 5 ? "Low Stock" : product.stock <= 20 ? "Medium" : "Good Stock"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default StockManagement;
