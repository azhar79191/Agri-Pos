import React, { useState } from "react";
import { Package, Plus, Minus, Edit3, History, AlertTriangle } from "lucide-react";
import { useApp } from "../context/AppContext";

const StockManagement = () => {
  const { state, actions } = useApp();
  const { products, stockHistory } = state;
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustmentType, setAdjustmentType] = useState("add");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");

  const lowStockProducts = products.filter(p => p.stock <= 5);

  const handleStockAdjustment = () => {
    if (!selectedProduct || !quantity || !reason) return;
    
    const qty = parseInt(quantity);
    if (adjustmentType === "add") {
      actions.addStock(selectedProduct.id, qty, reason);
    } else if (adjustmentType === "remove") {
      actions.removeStock(selectedProduct.id, qty, reason);
    } else {
      actions.adjustStock(selectedProduct.id, qty, reason);
    }
    
    setSelectedProduct(null);
    setQuantity("");
    setReason("");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Stock Management</h1>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-medium text-red-800 dark:text-red-400">Low Stock Alert</h3>
          </div>
          <p className="text-red-700 dark:text-red-300 text-sm mb-3">
            {lowStockProducts.length} products are running low on stock
          </p>
          <div className="flex flex-wrap gap-2">
            {lowStockProducts.map(product => (
              <span key={product.id} className="bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 px-2 py-1 rounded text-xs">
                {product.name} ({product.stock} left)
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Adjustment */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Stock Adjustment</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Product</label>
              <select
                value={selectedProduct?.id || ""}
                onChange={(e) => setSelectedProduct(products.find(p => p.id === parseInt(e.target.value)))}
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Select Product</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
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
                  { value: "adjust", label: "Set Stock", icon: Edit3 }
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setAdjustmentType(value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      adjustmentType === value
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                {adjustmentType === "adjust" ? "New Stock Level" : "Quantity"}
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter quantity"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Reason</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter reason for adjustment"
              />
            </div>

            <button
              onClick={handleStockAdjustment}
              disabled={!selectedProduct || !quantity || !reason}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Apply Adjustment
            </button>
          </div>
        </div>

        {/* Stock History */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Stock History</h2>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {stockHistory.slice(0, 10).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{entry.productName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {entry.type === "IN" ? "Added" : entry.type === "OUT" ? "Removed" : "Adjusted"} {entry.quantity} units
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{entry.reason} • {entry.date}</p>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  entry.type === "IN" || entry.type === "ADJUST_IN" 
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                }`}>
                  {entry.type.includes("IN") ? "+" : "-"}{entry.quantity}
                </div>
              </div>
            ))}
            {stockHistory.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No stock history available</p>
            )}
          </div>
        </div>
      </div>

      {/* Current Stock Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Current Stock Levels</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-2 text-gray-700 dark:text-gray-300">Product</th>
                <th className="text-left py-2 text-gray-700 dark:text-gray-300">Current Stock</th>
                <th className="text-left py-2 text-gray-700 dark:text-gray-300">Unit</th>
                <th className="text-left py-2 text-gray-700 dark:text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b dark:border-gray-700">
                  <td className="py-2 text-gray-900 dark:text-white">{product.name}</td>
                  <td className="py-2 text-gray-900 dark:text-white">{product.stock}</td>
                  <td className="py-2 text-gray-600 dark:text-gray-400">{product.unit}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      product.stock <= 5 
                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        : product.stock <= 20
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    }`}>
                      {product.stock <= 5 ? "Low" : product.stock <= 20 ? "Medium" : "Good"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockManagement;