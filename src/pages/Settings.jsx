import React, { useState, useEffect, useRef } from "react";
import { Moon, Sun, Tag, Plus, X, Loader2, Palette, Sparkles, Save, DollarSign, Receipt, AlertTriangle } from "lucide-react";
import { useApp } from "../context/AppContext";
import { getMyShop, addBrand, deleteBrand, updateShop } from "../api/shopApi";

const THEME_PRESETS = [
  { label: "Emerald",  color: "#10b981" },
  { label: "Sky",      color: "#0ea5e9" },
  { label: "Violet",   color: "#8b5cf6" },
  { label: "Rose",     color: "#f43f5e" },
  { label: "Amber",    color: "#f59e0b" },
  { label: "Orange",   color: "#f97316" },
  { label: "Teal",     color: "#14b8a6" },
  { label: "Indigo",   color: "#6366f1" },
];

const inputCls = "w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all";

const Settings = () => {
  const { state, actions } = useApp();
  const { darkMode, themeColor } = state;
  const inputRef = useRef(null);

  const [shop, setShop] = useState(null);
  const [brands, setBrands] = useState([]);
  const [newBrand, setNewBrand] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deletingBrand, setDeletingBrand] = useState(null);

  // Shop settings form
  const [shopForm, setShopForm] = useState({ taxRate: "", currency: "", receiptFooter: "", lowStockThreshold: "" });
  const [savingShop, setSavingShop] = useState(false);

  useEffect(() => {
    getMyShop()
      .then(res => {
        const s = res.data.data?.shop;
        if (s) {
          setShop(s);
          setBrands(s.brands || []);
          setShopForm({
            taxRate: s.taxRate ?? 5,
            currency: s.currency || "Rs.",
            receiptFooter: s.receiptFooter || "Thank you for your purchase!",
            lowStockThreshold: s.lowStockThreshold ?? 5,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSaveShop = async () => {
    if (!shop) return;
    setSavingShop(true);
    try {
      await updateShop(shop._id, {
        taxRate: parseFloat(shopForm.taxRate) || 0,
        currency: shopForm.currency,
        receiptFooter: shopForm.receiptFooter,
        lowStockThreshold: parseInt(shopForm.lowStockThreshold) || 5,
      });
      actions.updateSettings({
        taxRate: parseFloat(shopForm.taxRate) || 0,
        currency: shopForm.currency,
        receiptFooter: shopForm.receiptFooter,
        lowStockThreshold: parseInt(shopForm.lowStockThreshold) || 5,
      });
      actions.showToast({ message: "Settings saved successfully", type: "success" });
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Failed to save settings", type: "error" });
    } finally { setSavingShop(false); }
  };

  const handleAddBrand = async () => {
    const trimmed = newBrand.trim();
    if (!trimmed) return;
    if (!shop) { actions.showToast({ message: "No shop found. Set up your shop first.", type: "error" }); return; }
    if (brands.map(b => b.toLowerCase()).includes(trimmed.toLowerCase())) {
      actions.showToast({ message: "Brand already exists", type: "error" }); return;
    }
    setAdding(true);
    try {
      const res = await addBrand(shop._id, trimmed);
      setBrands(res.data.data.brands);
      setNewBrand("");
      inputRef.current?.focus();
      actions.showToast({ message: `"${trimmed}" added`, type: "success" });
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Failed to add brand", type: "error" });
    } finally { setAdding(false); }
  };

  const handleDeleteBrand = async (brand) => {
    if (!shop) return;
    setDeletingBrand(brand);
    try {
      const res = await deleteBrand(shop._id, brand);
      setBrands(res.data.data.brands);
      actions.showToast({ message: `"${brand}" removed`, type: "success" });
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Failed to remove brand", type: "error" });
    } finally { setDeletingBrand(null); }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") { e.preventDefault(); handleAddBrand(); } };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-glow-sm flex-shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage appearance, shop settings, and brands</p>
        </div>
      </div>

        {/* Theme Color Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-premium p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${themeColor}22` }}>
              <Palette className="w-4 h-4" style={{ color: themeColor }} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Theme Color</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Choose your accent color across the app</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {THEME_PRESETS.map(({ label, color }) => (
              <button
                key={color}
                title={label}
                onClick={() => actions.setThemeColor(color)}
                className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
                style={{ background: color, borderColor: themeColor === color ? color : "transparent", boxShadow: themeColor === color ? `0 0 0 3px ${color}44` : "none" }}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-600 dark:text-slate-400 font-medium">Custom:</label>
            <input
              type="color"
              value={themeColor}
              onChange={e => actions.setThemeColor(e.target.value)}
              className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5 bg-white dark:bg-slate-800"
            />
            <span className="text-sm font-mono text-slate-500 dark:text-slate-400">{themeColor}</span>
          </div>
        </div>

        {/* Theme Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-premium p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Palette className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Appearance</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Customize your interface theme</p>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${darkMode ? "bg-indigo-100 dark:bg-indigo-900/30" : "bg-amber-100 dark:bg-amber-900/30"}`}>
              {darkMode
                ? <Moon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                : <Sun className="w-4 h-4 text-amber-500" />}
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">Dark Mode</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {darkMode ? "Currently using dark theme" : "Currently using light theme"}
              </p>
            </div>
          </div>
          <button
            onClick={actions.toggleDarkMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${darkMode ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${darkMode ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>
      </div>

      {/* Shop Settings Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-premium p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Shop Settings</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Tax, currency, receipt, and stock thresholds</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10 gap-2 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        ) : !shop ? (
          <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
            <p className="text-sm text-slate-500 dark:text-slate-400">No shop found. Complete shop setup in <strong>My Shop</strong> first.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tax Rate (%)</label>
                <input
                  type="number" min="0" max="100" step="0.1"
                  value={shopForm.taxRate}
                  onChange={e => setShopForm(p => ({ ...p, taxRate: e.target.value }))}
                  className={inputCls}
                  placeholder="e.g. 5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Currency Symbol</label>
                <input
                  type="text"
                  value={shopForm.currency}
                  onChange={e => setShopForm(p => ({ ...p, currency: e.target.value }))}
                  className={inputCls}
                  placeholder="e.g. Rs. or $"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Low Stock Threshold
              </label>
              <input
                type="number" min="1"
                value={shopForm.lowStockThreshold}
                onChange={e => setShopForm(p => ({ ...p, lowStockThreshold: e.target.value }))}
                className={inputCls}
                placeholder="e.g. 5"
              />
              <p className="text-xs text-slate-400 mt-1">Products at or below this quantity will be flagged as low stock.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-slate-400" />
                Receipt Footer Message
              </label>
              <textarea
                rows={2}
                value={shopForm.receiptFooter}
                onChange={e => setShopForm(p => ({ ...p, receiptFooter: e.target.value }))}
                className={inputCls + " resize-none"}
                placeholder="Thank you for your purchase!"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveShop}
                disabled={savingShop}
                className="flex items-center gap-2 px-5 py-2.5 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors shadow-glow-sm"
                style={{ background: themeColor }}
              >
                {savingShop ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Brands Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-premium p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Product Brands</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Brands appear as a dropdown when adding products</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10 gap-2 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        ) : !shop ? (
          <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
            <Tag className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400">No shop found.</p>
            <p className="text-xs text-slate-400 mt-1">Complete shop setup in <strong>My Shop</strong> first.</p>
          </div>
        ) : (
          <>
            <div className="flex gap-2 mb-5">
              <input
                ref={inputRef}
                type="text"
                value={newBrand}
                onChange={e => setNewBrand(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Syngenta, Bayer, FMC, BASF..."
                className="flex-1 px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
              />
              <button
                onClick={handleAddBrand}
                disabled={!newBrand.trim() || adding}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors shadow-glow-sm"
              >
                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add
              </button>
            </div>

            {brands.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  No brands yet. Type a brand name above and press{" "}
                  <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs font-mono">Enter</kbd> or click Add.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {brands.map(brand => (
                  <span key={brand} className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-full text-sm font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors group">
                    {brand}
                    <button
                      onClick={() => handleDeleteBrand(brand)}
                      disabled={deletingBrand === brand}
                      className="flex items-center justify-center w-4 h-4 hover:text-red-500 disabled:opacity-50 transition-colors"
                      title={`Remove ${brand}`}
                    >
                      {deletingBrand === brand
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <X className="w-3.5 h-3.5" />}
                    </button>
                  </span>
                ))}
              </div>
            )}

            <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
              {brands.length} brand{brands.length !== 1 ? "s" : ""} registered · Changes save instantly
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Settings;
