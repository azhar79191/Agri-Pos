import React, { useState } from "react";
import { Package, Plus, Minus, AlertTriangle, History, RotateCcw } from "lucide-react";
import ModernModal from "./ui/ModernModal";
import ModernButton from "./ui/ModernButton";
import { formatDate } from "../utils/helpers";

const StockManagementModal = ({ isOpen, onClose, product, stockHistory, onAddStock, onRemoveStock, onAdjustStock }) => {
  const [activeTab, setActiveTab] = useState("manage"); // "manage" or "history"
  const [operation, setOperation] = useState("add"); // "add", "remove", "adjust"
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [newStockValue, setNewStockValue] = useState("");

  if (!product) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const qty = parseInt(quantity) || 0;
    const finalReason = reason || (operation === "add" ? "Purchase" : operation === "remove" ? "Damage" : "Adjustment");
    
    if (operation === "add" && qty > 0) {
      onAddStock(product.id, qty, finalReason);
      resetForm();
      onClose();
    } else if (operation === "remove" && qty > 0) {
      onRemoveStock(product.id, qty, finalReason);
      resetForm();
      onClose();
    } else if (operation === "adjust") {
      const newStock = parseInt(newStockValue);
      if (!isNaN(newStock) && newStock >= 0) {
        onAdjustStock(product.id, newStock, finalReason);
        resetForm();
        onClose();
      }
    }
  };

  const resetForm = () => {
    setQuantity("");
    setNewStockValue("");
    setReason("");
    setOperation("add");
  };

  // Filter history for this product
  const productHistory = stockHistory.filter(h => h.productId === product.id);

  const operationButtons = [
    { id: "add", label: "Add Stock", icon: Plus, color: "success" },
    { id: "remove", label: "Remove Stock", icon: Minus, color: "danger" },
    { id: "adjust", label: "Adjust Stock", icon: RotateCcw, color: "info" }
  ];

  const reasonOptions = {
    add: ["Purchase", "Return", "Found", "Other"],
    remove: ["Damage", "Expired", "Lost", "Sale", "Other"],
    adjust: ["Inventory Count", "System Error", "Other"]
  };

  return (
    <ModernModal
      isOpen={isOpen}
      onClose={onClose}
      title="Stock Management"
      subtitle={product.name}
      size="lg"
      icon={Package}
      iconColor="emerald"
    >
      {/* Tabs */}
      <div className="flex gap-2 mb-6 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
        <button
          onClick={() => setActiveTab("manage")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === "manage"
              ? "bg-white dark:bg-gray-600 text-emerald-600 dark:text-emerald-400 shadow-sm"
              : "text-gray-600 dark:text-gray-400"
          }`}
        >
          <Package className="w-4 h-4" />
          Manage Stock
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === "history"
              ? "bg-white dark:bg-gray-600 text-emerald-600 dark:text-emerald-400 shadow-sm"
              : "text-gray-600 dark:text-gray-400"
          }`}
        >
          <History className="w-4 h-4" />
          History ({productHistory.length})
        </button>
      </div>

      {activeTab === "manage" ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Current Stock Display */}
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">Current Stock</p>
                <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">
                  {product.stock} <span className="text-lg">{product.unit}</span>
                </p>
              </div>
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                <Package className="w-7 h-7 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Operation Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Operation
            </label>
            <div className="grid grid-cols-3 gap-2">
              {operationButtons.map((op) => (
                <button
                  key={op.id}
                  type="button"
                  onClick={() => setOperation(op.id)}
                  className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                    operation === op.id
                      ? `border-${op.color}-500 bg-${op.color}-50 dark:bg-${op.color}-900/20`
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
                >
                  <op.icon className={`w-5 h-5 mb-1 ${
                    operation === op.id ? `text-${op.color}-600` : "text-gray-500"
                  }`} />
                  <span className={`text-xs font-medium ${
                    operation === op.id ? `text-${op.color}-600` : "text-gray-600"
                  }`}>
                    {op.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Input */}
          {operation !== "adjust" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(0, (parseInt(quantity) || 0) - 1))}
                  className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="flex-1 px-4 py-3 text-center rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-lg font-semibold"
                  placeholder="0"
                />
                <button
                  type="button"
                  onClick={() => setQuantity((parseInt(quantity) || 0) + 1)}
                  className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Stock Value
              </label>
              <input
                type="number"
                min="0"
                value={newStockValue}
                onChange={(e) => setNewStockValue(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-lg font-semibold"
                placeholder={`Current: ${product.stock}`}
              />
              <p className="text-xs text-gray-500 mt-1">
                This will set the stock to the exact value entered
              </p>
            </div>
          )}

          {/* Reason Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            >
              <option value="">Select a reason...</option>
              {reasonOptions[operation].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Preview */}
          {quantity && operation !== "adjust" && (
            <div className={`p-4 rounded-xl ${
              operation === "add" 
                ? "bg-green-50 dark:bg-green-900/20 border border-green-200" 
                : "bg-red-50 dark:bg-red-900/20 border border-red-200"
            }`}>
              <p className="text-sm text-gray-600 dark:text-gray-400">New stock will be:</p>
              <p className={`text-xl font-bold ${
                operation === "add" ? "text-green-600" : "text-red-600"
              }`}>
                {operation === "add" 
                  ? product.stock + parseInt(quantity || 0)
                  : Math.max(0, product.stock - parseInt(quantity || 0))
                } {product.unit}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <ModernButton
            type="submit"
            variant={operation === "add" ? "success" : operation === "remove" ? "danger" : "info"}
            className="w-full"
            disabled={
              operation === "adjust" 
                ? !newStockValue 
                : !quantity || parseInt(quantity) <= 0
            }
          >
            {operation === "add" && <Plus className="w-5 h-5 mr-2" />}
            {operation === "remove" && <Minus className="w-5 h-5 mr-2" />}
            {operation === "adjust" && <RotateCcw className="w-5 h-5 mr-2" />}
            {operation === "add" && "Add to Stock"}
            {operation === "remove" && "Remove from Stock"}
            {operation === "adjust" && "Adjust Stock"}
          </ModernButton>
        </form>
      ) : (
        /* History Tab */
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {productHistory.length === 0 ? (
            <div className="text-center py-8">
              <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No stock history yet</p>
            </div>
          ) : (
            productHistory.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    entry.type === "IN" || entry.type === "ADJUST_IN"
                      ? "bg-green-100 dark:bg-green-900/30 text-green-600"
                      : "bg-red-100 dark:bg-red-900/30 text-red-600"
                  }`}>
                    {entry.type === "IN" || entry.type === "ADJUST_IN" ? <Plus className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {entry.type === "IN" && "Stock Added"}
                      {entry.type === "OUT" && "Stock Removed"}
                      {entry.type === "ADJUST_IN" && "Stock Adjusted (+)"}
                      {entry.type === "ADJUST_OUT" && "Stock Adjusted (-)"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {entry.reason} • {entry.user}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${
                    entry.type === "IN" || entry.type === "ADJUST_IN"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}>
                    {entry.type === "IN" || entry.type === "ADJUST_IN" ? "+" : "-"}{entry.quantity}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(entry.date)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </ModernModal>
  );
};

export default StockManagementModal;
