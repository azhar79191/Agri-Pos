import SharedButton from "../ui/Button";
import Modal from "../ui/Modal";
import { scopedStorageKey } from "../../utils/browserScope";
import React, { useState, useEffect } from "react";
import { PauseCircle, PlayCircle, Trash2, ShoppingCart } from "lucide-react";
import { formatCurrency } from "../../utils/helpers";

const storageKey = () => scopedStorageKey("pos_held_sales");

export const getHeldSales = () => {
  try { return JSON.parse(localStorage.getItem(storageKey()) || "[]"); } catch { return []; }
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
  localStorage.setItem(storageKey(), JSON.stringify([...held, sale]));
  return sale;
};

export const removeHeldSale = (id) => {
  const held = getHeldSales().filter(s => s.id !== id);
  localStorage.setItem(storageKey(), JSON.stringify(held));
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

  return (
    <Modal
          isOpen
          onClose={onClose}
          title={<>Held Sales</>}
          size="sm"
          subtitle={<>{held.length} sale{held.length !== 1 ? "s" : ""} on hold</>}
          icon={PauseCircle}><div className="space-y-4">


        <div className="space-y-2">
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
                  <SharedButton
                    onClick={() => handleRecall(sale)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />Recall
                  </SharedButton>
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
      </div></Modal>
  );
};

export default HeldSalesModal;
