import React, { useState, useMemo } from "react";
import { ShoppingCart, Plus, Minus, Trash2, Receipt, X, Package, Zap, AlertTriangle } from "lucide-react";
import { DEMO_PRODUCTS, DEMO_CUSTOMERS, DEMO_SETTINGS, disableDemoMode } from "../data/demoData";
import { formatCurrency } from "../utils/helpers";
import { normalizeInvoiceItems } from "../utils/normalizeInvoiceItems";
import { useNavigate } from "react-router-dom";

const DemoBanner = () => (
  <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-500 text-white text-sm font-semibold">
    <Zap className="w-4 h-4 flex-shrink-0" />
    <span>DEMO MODE — All actions are simulated. No data is saved to the database.</span>
    <button onClick={() => { disableDemoMode(); window.location.href = "/"; }}
      className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-xs font-bold">
      <X className="w-3.5 h-3.5" /> Exit Demo
    </button>
  </div>
);

const DemoPOS = () => {
  const navigate = useNavigate();
  const [cart, setCart]           = useState([]);
  const [search, setSearch]       = useState("");
  const [cashReceived, setCash]   = useState("");
  const [receipt, setReceipt]     = useState(null);
  const [invoiceCount, setCount]  = useState(3);

  const currency = DEMO_SETTINGS.currency;

  const filtered = useMemo(() =>
    DEMO_PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    ), [search]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === product._id);
      if (existing) return prev.map(i => i.productId === product._id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { productId: product._id, name: product.name, price: product.price, quantity: 1, unit: product.unit }];
    });
  };

  const updateQty = (id, qty) => {
    if (qty <= 0) setCart(prev => prev.filter(i => i.productId !== id));
    else setCart(prev => prev.map(i => i.productId === id ? { ...i, quantity: qty } : i));
  };

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax      = (subtotal * DEMO_SETTINGS.taxRate) / 100;
  const total    = subtotal + tax;
  const change   = parseFloat(cashReceived) - total;

  const checkout = () => {
    if (cart.length === 0) return;
    const num = `INV-DEMO-00${invoiceCount}`;
    setCount(c => c + 1);
    setReceipt({
      invoiceNumber: num,
      date: new Date().toLocaleDateString("en-PK"),
      time: new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" }),
      customerName: "Walk-in Customer",
      paymentMethod: "Cash",
      status: "Completed",
      items: cart.map(i => ({ name: i.name, quantity: i.quantity, price: i.price, total: i.price * i.quantity })),
      subtotal, tax, grandTotal: total,
      cashReceived: parseFloat(cashReceived) || total,
      change: Math.max(0, change),
    });
    setCart([]);
    setCash("");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <DemoBanner />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        {/* Products */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">Demo POS</h1>
              <p className="text-xs text-slate-500">{DEMO_PRODUCTS.length} demo products</p>
            </div>
            <button onClick={() => navigate("/")} className="ml-auto text-xs text-slate-400 hover:text-slate-600 transition-colors">← Back to Landing</button>
          </div>

          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filtered.map(product => {
              const inCart = cart.find(i => i.productId === product._id);
              const isLow  = product.stock <= product.minStockLevel;
              return (
                <div key={product._id} className={`bg-white dark:bg-slate-900 rounded-xl border overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg ${inCart ? "border-emerald-300 dark:border-emerald-700" : "border-slate-200 dark:border-slate-700"}`}>
                  <div className="h-20 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center relative">
                    <Package className="w-8 h-8 text-blue-400" />
                    {isLow && <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-white">LOW</span>}
                    {inCart && <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500 text-white">×{inCart.quantity}</span>}
                  </div>
                  <div className="p-3">
                    <p className="font-bold text-slate-900 dark:text-white text-xs leading-tight line-clamp-2">{product.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{product.category}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="font-black text-emerald-600 dark:text-emerald-400 text-sm">{formatCurrency(product.price, currency)}</p>
                      {inCart ? (
                        <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-0.5 border border-emerald-200 dark:border-emerald-800">
                          <button onClick={() => updateQty(product._id, inCart.quantity - 1)} className="w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:text-red-500 transition-colors"><Minus className="w-3 h-3" /></button>
                          <span className="w-5 text-center text-xs font-bold text-emerald-700 dark:text-emerald-400">{inCart.quantity}</span>
                          <button onClick={() => updateQty(product._id, inCart.quantity + 1)} className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center text-white hover:bg-emerald-600 transition-colors"><Plus className="w-3 h-3" /></button>
                        </div>
                      ) : (
                        <button onClick={() => addToCart(product)} className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold transition-colors">Add</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl flex flex-col overflow-hidden">
          <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/60 dark:to-slate-900">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900 dark:text-white text-sm">Order Summary</h2>
              {cart.length > 0 && (
                <button onClick={() => setCart([])} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2" style={{ maxHeight: "280px" }}>
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <ShoppingCart className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Cart is empty</p>
              </div>
            ) : cart.map(item => (
              <div key={item.productId} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white text-xs truncate">{item.name}</p>
                  <p className="text-[10px] text-slate-400">{formatCurrency(item.price, currency)} each</p>
                </div>
                <div className="flex items-center gap-0.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                  <button onClick={() => updateQty(item.productId, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors text-sm font-bold">−</button>
                  <span className="w-6 text-center text-xs font-bold text-slate-900 dark:text-white">{item.quantity}</span>
                  <button onClick={() => updateQty(item.productId, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors text-sm font-bold">+</button>
                </div>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs w-14 text-right">{formatCurrency(item.price * item.quantity, currency)}</span>
              </div>
            ))}
          </div>

          {cart.length > 0 && (
            <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-4 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-500">
                <div className="flex justify-between"><span>Subtotal</span><span className="font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(subtotal, currency)}</span></div>
                <div className="flex justify-between"><span>Tax ({DEMO_SETTINGS.taxRate}%)</span><span className="font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(tax, currency)}</span></div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">Total</span>
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(total, currency)}</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Cash Received</label>
                <input type="number" value={cashReceived} onChange={e => setCash(e.target.value)} placeholder={`Min ${formatCurrency(total, currency)}`}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" />
                {parseFloat(cashReceived) > 0 && (
                  <div className={`mt-1.5 flex justify-between px-3 py-2 rounded-lg text-xs font-semibold ${change >= 0 ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400" : "bg-red-50 dark:bg-red-900/20 text-red-600"}`}>
                    <span>{change >= 0 ? "Change" : "Short by"}</span>
                    <span className="font-black">{formatCurrency(Math.abs(change), currency)}</span>
                  </div>
                )}
              </div>

              <button onClick={checkout}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-white font-black text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg">
                <Receipt className="w-4 h-4" /> Complete Sale (Demo)
              </button>

              <p className="text-[10px] text-center text-amber-500 font-semibold">⚠️ Demo — this sale will NOT be saved</p>
            </div>
          )}
        </div>
      </div>

      {/* Receipt Modal */}
      {receipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto" style={{ animation: "scale-in 0.15s ease both" }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Receipt className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Receipt (Demo)</p>
                  <p className="text-xs text-slate-400 font-mono">{receipt.invoiceNumber}</p>
                </div>
              </div>
              <button onClick={() => setReceipt(null)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5">
              <div className="text-center mb-4 pb-4 border-b border-dashed border-slate-200">
                <p className="font-bold text-lg text-slate-900">{DEMO_SETTINGS.shopName}</p>
                <p className="text-xs text-slate-500">{receipt.date} {receipt.time}</p>
                <p className="text-xs text-amber-600 font-semibold mt-1">⚠️ DEMO RECEIPT — Not a real transaction</p>
              </div>
              <table className="w-full text-xs mb-4">
                <thead><tr className="border-b border-slate-200"><th className="text-left py-1.5 text-slate-600">Item</th><th className="text-center text-slate-600">Qty</th><th className="text-right text-slate-600">Total</th></tr></thead>
                <tbody>
                  {receipt.items.map((item, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="py-1.5 text-slate-800">{item.name}</td>
                      <td className="text-center text-slate-600">{item.quantity}</td>
                      <td className="text-right font-medium text-slate-800">{formatCurrency(item.total, currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="space-y-1 text-xs border-t border-slate-200 pt-3">
                <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{formatCurrency(receipt.subtotal, currency)}</span></div>
                <div className="flex justify-between text-slate-600"><span>Tax</span><span>{formatCurrency(receipt.tax, currency)}</span></div>
                <div className="flex justify-between font-black text-base text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total</span><span className="text-emerald-600">{formatCurrency(receipt.grandTotal, currency)}</span>
                </div>
                {receipt.change > 0 && <div className="flex justify-between text-slate-600"><span>Change</span><span>{formatCurrency(receipt.change, currency)}</span></div>}
              </div>
              <p className="text-center text-xs text-slate-400 mt-4">{DEMO_SETTINGS.receiptFooter}</p>
            </div>
            <div className="px-5 pb-5">
              <button onClick={() => setReceipt(null)} className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors">
                New Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemoPOS;
