import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PauseCircle, PlayCircle, Trash2, X, ShoppingCart } from "lucide-react";
import { formatCurrency } from "../../utils/helpers";

const STORAGE_KEY = "pos_held_sales";

export const getHeldSales = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
};

export const holdSale = (cart, customerName, discount) => {
  const held = getHeldSales();
  const sale = {
    id: Date.now(),
    label: customerName || `Sale #${held.length + 1}`,
    cart,
    discount,
    heldAt: new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" }),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...held, sale]));
  return sale;
};

export const removeHeldSale = (id) => {
  const held = getHeldSales().filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(held));
};

const HeldSalesModal = ({ isOpen, onClose, onRecall, currency }) => {
  const [held, setHeld] = useState([]);

  useEffect(() => {
    if (isOpen) setHeld(getHeldSales());
  }, [isOpen]);

  const handleRecall = (sale) => {
    onRecall(sale);
    removeHeldSale(sale.id);
    onClose();
  };

  const handleDelete = (id) => {
    removeHeldSale(id);
    setHeld(prev => prev.filter(s => s.id !== id));
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10000 w-full max-w-md bg-white dark:bg-slate-900 rounded-lg shadow-2xl border border-slate-200/80 dark:border-slate-700 animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <PauseCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Held Sales</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{held.length} sale{held.length !== 1 ? "s" : ""} on hold</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
          {held.length === 0 ? (
            <div className="text-center py-10">
              <ShoppingCart className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400">No held sales</p>
              <p className="text-xs text-slate-400 mt-1">Hold a sale to serve another customer</p>
            </div>
          ) : (
            held.map(sale => {
              const total = sale.cart.reduce((s, i) => s + i.price * i.quantity, 0);
              return (
                <div key={sale.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{sale.label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {sale.cart.length} item{sale.cart.length !== 1 ? "s" : ""} · {formatCurrency(total, currency)} · {sale.heldAt}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRecall(sale)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />Recall
                  </button>
                  <button
                    onClick={() => handleDelete(sale.id)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default HeldSalesModal;
