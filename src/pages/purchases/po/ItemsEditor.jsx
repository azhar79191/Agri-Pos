import React, { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Search } from "lucide-react";
import { getProducts } from "../../../api/productApi";
import { EMPTY_ITEM } from "./poConfig";

const ItemRow = ({ item, index, onChange, onRemove }) => (
  <div className="grid grid-cols-12 gap-2 items-center">
    <div className="col-span-5 text-sm text-slate-800 dark:text-slate-200 truncate px-2 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
      {item.productName || <span className="text-slate-400">—</span>}
    </div>
    <input
      type="number" min="1"
      value={item.quantity}
      onChange={e => onChange(index, "quantity", Math.max(1, Number(e.target.value)))}
      className="col-span-2 px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white text-center"
    />
    <input
      type="number" min="0" step="0.01"
      value={item.unitPrice}
      onChange={e => onChange(index, "unitPrice", Math.max(0, Number(e.target.value)))}
      className="col-span-3 px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white text-right"
    />
    <div className="col-span-1 text-right text-xs font-semibold text-emerald-600 dark:text-emerald-400">
      {(item.quantity * item.unitPrice).toFixed(0)}
    </div>
    <button onClick={() => onRemove(index)} className="col-span-1 flex justify-center text-red-400 hover:text-red-600 transition-colors">
      <Trash2 className="w-4 h-4" />
    </button>
  </div>
);

const ItemsEditor = ({ items, setItems }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const debounce = useRef(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await getProducts({ search: query, limit: 8 });
        const d = res.data.data;
        setResults(d.products ?? d.items ?? d.data ?? []);
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 300);
  }, [query]);

  const addProduct = (p) => {
    const already = items.find(i => i.productId === p._id);
    if (already) {
      setItems(prev => prev.map(i => i.productId === p._id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setItems(prev => [...prev, { ...EMPTY_ITEM, productId: p._id, productName: p.name, unitPrice: p.purchasePrice ?? p.price ?? 0, unit: p.unit ?? "" }]);
    }
    setQuery(""); setResults([]);
  };

  const onChange = (idx, field, val) => setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: val } : it));
  const onRemove = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));

  const total = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  return (
    <div className="space-y-3">
      {/* Product search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search product to add..."
          className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
        />
        {(results.length > 0 || searching) && (
          <div className="absolute z-50 top-full mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {searching && <p className="px-3 py-2 text-xs text-slate-400">Searching...</p>}
            {results.map(p => (
              <button key={p._id} onClick={() => addProduct(p)}
                className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-left transition-colors">
                <span className="text-sm text-slate-800 dark:text-slate-200 truncate">{p.name}</span>
                <span className="text-xs text-slate-400 ml-2 shrink-0">{p.unit}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Column headers */}
      {items.length > 0 && (
        <div className="grid grid-cols-12 gap-2 px-0.5">
          <span className="col-span-5 text-xs font-medium text-slate-500">Product</span>
          <span className="col-span-2 text-xs font-medium text-slate-500 text-center">Qty</span>
          <span className="col-span-3 text-xs font-medium text-slate-500 text-right">Unit Price</span>
          <span className="col-span-1 text-xs font-medium text-slate-500 text-right">Total</span>
          <span className="col-span-1" />
        </div>
      )}

      {/* Rows */}
      <div className="space-y-2">
        {items.map((item, i) => (
          <ItemRow key={i} item={item} index={i} onChange={onChange} onRemove={onRemove} />
        ))}
      </div>

      {items.length === 0 && (
        <p className="text-center text-xs text-slate-400 py-4 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
          Search and add products above
        </p>
      )}

      {items.length > 0 && (
        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            Total: <span className="text-emerald-600 dark:text-emerald-400">{total.toFixed(2)}</span>
          </span>
        </div>
      )}
    </div>
  );
};

export default ItemsEditor;
