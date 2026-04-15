import React, { useState, useEffect, useRef } from "react";
import { Moon, Sun, Tag, Plus, X, Loader2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import Card from "../components/ui/Card";
import { getMyShop, addBrand, deleteBrand } from "../api/shopApi";

const Settings = () => {
  const { state, actions } = useApp();
  const { darkMode } = state;
  const inputRef = useRef(null);

  const [shop, setShop] = useState(null);
  const [brands, setBrands] = useState([]);
  const [newBrand, setNewBrand] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deletingBrand, setDeletingBrand] = useState(null); // track which brand is being deleted

  useEffect(() => {
    getMyShop()
      .then(res => {
        const s = res.data.data?.shop;
        if (s) { setShop(s); setBrands(s.brands || []); }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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

  const handleKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); handleAddBrand(); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage appearance and product brands</p>
      </div>

      {/* Theme */}
      <Card padding="lg">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
            {darkMode
              ? <Moon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              : <Sun className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Appearance</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Customize your interface theme</p>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {darkMode
              ? <Moon className="w-5 h-5 text-indigo-500" />
              : <Sun className="w-5 h-5 text-amber-500" />}
            <div>
              <p className="font-medium text-gray-900 dark:text-white text-sm">Dark Mode</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {darkMode ? "Currently using dark theme" : "Currently using light theme"}
              </p>
            </div>
          </div>
          <button
            onClick={actions.toggleDarkMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${darkMode ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${darkMode ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>
      </Card>

      {/* Brands */}
      <Card padding="lg">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
            <Tag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Product Brands</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Brands appear as a dropdown when adding or editing products
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        ) : !shop ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
            <Tag className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No shop found.</p>
            <p className="text-xs text-gray-400 mt-1">Complete shop setup in <strong>My Shop</strong> first.</p>
          </div>
        ) : (
          <>
            {/* Add input */}
            <div className="flex gap-2 mb-5">
              <input
                ref={inputRef}
                type="text"
                value={newBrand}
                onChange={e => setNewBrand(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Syngenta, Bayer, FMC, BASF..."
                className="flex-1 px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
              <button
                onClick={handleAddBrand}
                disabled={!newBrand.trim() || adding}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors"
              >
                {adding
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Plus className="w-4 h-4" />}
                Add
              </button>
            </div>

            {/* Brands list */}
            {brands.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  No brands yet. Type a brand name above and press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">Enter</kbd> or click Add.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {brands.map(brand => (
                  <span
                    key={brand}
                    className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-full text-sm font-medium"
                  >
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

            <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
              {brands.length} brand{brands.length !== 1 ? "s" : ""} registered · Changes save instantly to database
            </p>
          </>
        )}
      </Card>
    </div>
  );
};

export default Settings;
