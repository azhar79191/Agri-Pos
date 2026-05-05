import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Package, Search, ChevronDown, Clock, Star, Zap, ShoppingBag, Filter, PackagePlus, Tag, Percent } from "lucide-react";
import { formatCurrency, isOutOfStock, isLowStock } from "../../utils/helpers";
import usePOSFavorites from "../../hooks/usePOSFavorites";
import { useApp } from "../../context/AppContext";

const CAT_CFG = {
  Herbicides:   { bg: "bg-green-100 dark:bg-green-900/30",   text: "text-green-700 dark:text-green-400",   dot: "bg-green-500" },
  Insecticides: { bg: "bg-red-100 dark:bg-red-900/30",       text: "text-red-700 dark:text-red-400",       dot: "bg-red-500" },
  Fungicides:   { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-400", dot: "bg-purple-500" },
  Fertilizers:  { bg: "bg-amber-100 dark:bg-amber-900/30",   text: "text-amber-700 dark:text-amber-400",   dot: "bg-amber-500" },
  Seeds:        { bg: "bg-emerald-100 dark:bg-emerald-900/20",text: "text-emerald-700 dark:text-emerald-400",dot: "bg-emerald-500" },
  Other:        { bg: "bg-slate-100 dark:bg-slate-800",       text: "text-slate-600 dark:text-slate-400",   dot: "bg-slate-400" },
};
const getCat = (cat) => CAT_CFG[cat] || CAT_CFG.Other;

/* ── Product Card ── */
const ProductCard = ({ product, inCart, cartQuantity, onAddToCart, onUpdateQuantity, currency, isFavorite, onToggleFavorite }) => {
  const productId = product._id || product.id;
  const availableStock = product.stock - cartQuantity;
  const outOfStock = isOutOfStock(availableStock);
  const lowStock = isLowStock(availableStock);
  const cat = getCat(product.category);
  const [adding, setAdding] = useState(false);

  const handleAdd = () => {
    if (outOfStock) return;
    setAdding(true);
    onAddToCart(product);
    setTimeout(() => setAdding(false), 600);
  };

  const stockPct = Math.min((product.stock / Math.max(product.stock + 10, 20)) * 100, 100);

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      whileHover={!outOfStock ? { y: -3 } : {}}
      className={`relative bg-white dark:bg-slate-900 rounded-2xl border overflow-hidden transition-shadow duration-200 flex flex-col ${
        outOfStock ? "border-slate-200 dark:border-slate-800 opacity-60"
        : inCart ? "border-emerald-300 dark:border-emerald-700 shadow-lg shadow-emerald-100/50 dark:shadow-emerald-900/20"
        : "border-slate-200/80 dark:border-slate-700/60 hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-slate-900/60 hover:border-slate-300 dark:hover:border-slate-600"
      }`}>
      {inCart && <div className="absolute inset-0 rounded-2xl ring-2 ring-emerald-400/30 dark:ring-emerald-600/20 pointer-events-none z-10" />}
      <div className={`relative h-28 flex items-center justify-center ${cat.bg} overflow-hidden`}>
        <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/20" />
        <div className="absolute -bottom-3 -left-3 w-12 h-12 rounded-full bg-white/15" />
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover absolute inset-0" />
        ) : (
          <div className="w-12 h-12 rounded-2xl bg-white/40 dark:bg-white/10 backdrop-blur flex items-center justify-center shadow-sm z-10">
            <Package className={`w-6 h-6 ${cat.text}`} />
          </div>
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {inCart && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="px-1.5 py-0.5 rounded-lg bg-emerald-500 text-white text-[9px] font-bold">×{cartQuantity}</motion.span>}
          {lowStock && !outOfStock && <motion.span animate={{ opacity: [1, 0.6, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="px-1.5 py-0.5 rounded-lg bg-amber-500 text-white text-[9px] font-bold">LOW</motion.span>}
          {outOfStock && <span className="px-1.5 py-0.5 rounded-lg bg-red-500 text-white text-[9px] font-bold">OUT</span>}
        </div>
        {/* Favorite pin button */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(productId); }}
          className={`absolute top-2 right-2 z-20 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
            isFavorite
              ? "bg-amber-400 text-white shadow-md"
              : "bg-white/70 dark:bg-slate-900/70 text-slate-400 hover:text-amber-400 hover:bg-white dark:hover:bg-slate-800"
          }`}
          title={isFavorite ? "Remove from favorites" : "Pin to favorites"}
        >
          <Star className={`w-3 h-3 ${isFavorite ? "fill-white" : ""}`} />
        </button>
      </div>
      <div className="p-3 flex flex-col flex-1 gap-2">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-xs leading-snug line-clamp-2">{product.name}</h3>
          {product.manufacturer && <p className="text-[10px] text-slate-400 mt-0.5 truncate">{product.manufacturer}</p>}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-base font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(product.price, currency)}</p>
          <span className={`text-[10px] font-semibold ${outOfStock ? "text-red-500" : lowStock ? "text-amber-500" : "text-slate-400"}`}>{availableStock} left</span>
        </div>
        <div className="h-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div className={`h-full rounded-full ${outOfStock ? "bg-red-400" : lowStock ? "bg-amber-400" : "bg-emerald-500"}`} style={{ width: `${stockPct}%` }} />
        </div>
        <div className="mt-auto">
          {inCart ? (
            <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/15 rounded-xl p-1 border border-emerald-200 dark:border-emerald-800">
              <motion.button whileTap={{ scale: 0.85 }} onClick={() => onUpdateQuantity(productId, cartQuantity - 1)}
                className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-600 hover:text-red-500 transition-colors">
                <Minus className="w-3 h-3" />
              </motion.button>
              <motion.span key={cartQuantity} initial={{ scale: 1.4 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="font-black text-emerald-700 dark:text-emerald-400 text-sm w-7 text-center">{cartQuantity}</motion.span>
              <motion.button whileTap={{ scale: 0.85 }} onClick={() => onUpdateQuantity(productId, cartQuantity + 1)} disabled={cartQuantity >= product.stock}
                className="w-7 h-7 rounded-lg bg-emerald-500 shadow-sm flex items-center justify-center text-white hover:bg-emerald-600 disabled:opacity-40 transition-colors">
                <Plus className="w-3 h-3" />
              </motion.button>
            </div>
          ) : (
            <motion.button whileHover={!outOfStock ? { scale: 1.02 } : {}} whileTap={!outOfStock ? { scale: 0.96 } : {}}
              onClick={handleAdd} disabled={outOfStock}
              className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                outOfStock ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                : adding ? "bg-emerald-500 text-white"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
              }`}>
              <AnimatePresence mode="wait">
                {adding ? (
                  <motion.span key="added" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>✓ Added!</motion.span>
                ) : (
                  <motion.span key="add" className="flex items-center gap-1.5"><ShoppingBag className="w-3.5 h-3.5" />Add</motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/* ── Bundle Card ── */
const BundleCard = ({ bundle, onAddBundle, currency }) => {
  const [adding, setAdding] = useState(false);
  const handleAdd = () => {
    setAdding(true);
    onAddBundle(bundle);
    setTimeout(() => setAdding(false), 800);
  };
  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-pink-200/80 dark:border-pink-900/40 overflow-hidden hover:shadow-xl hover:shadow-pink-100/50 dark:hover:shadow-pink-900/20 transition-all flex flex-col">
      <div className="h-1 w-full bg-gradient-to-r from-pink-500 to-rose-600" />
      <div className="p-3.5 flex flex-col flex-1 gap-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center shrink-0">
              <PackagePlus className="w-4.5 h-4.5 text-pink-600 dark:text-pink-400" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm leading-tight">{bundle.name}</p>
              {bundle.description && <p className="text-[10px] text-slate-400 mt-0.5 truncate">{bundle.description}</p>}
            </div>
          </div>
          {bundle.discount > 0 && (
            <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 text-[10px] font-bold shrink-0">
              <Percent className="w-2.5 h-2.5" />-{bundle.discount.toFixed(0)}%
            </span>
          )}
        </div>
        <div className="space-y-1">
          {(bundle.items || []).slice(0, 3).map((item, i) => (
            <div key={i} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs">
              <span className="text-slate-700 dark:text-slate-300 truncate flex-1">{item.productName}</span>
              <span className="text-slate-400 ml-2 shrink-0">×{item.quantity || 1}</span>
            </div>
          ))}
          {(bundle.items || []).length > 3 && (
            <p className="text-[10px] text-slate-400 px-2">+{bundle.items.length - 3} more items</p>
          )}
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
          <div>
            {bundle.totalValue > bundle.bundlePrice && (
              <p className="text-[10px] text-slate-400 line-through">{formatCurrency(bundle.totalValue, currency)}</p>
            )}
            <p className="text-base font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(bundle.bundlePrice, currency)}</p>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} onClick={handleAdd}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              adding ? "bg-emerald-500 text-white" : "bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white shadow-md"
            }`}>
            {adding ? "✓ Added!" : <><PackagePlus className="w-3.5 h-3.5" />Add Bundle</>}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

/* ── Main ProductGrid ── */
const ProductGrid = ({
  products, cart, categories, searchTerm, selectedCategory,
  onSearchChange, onCategoryChange, onAddToCart, onUpdateQuantity, currency,
  recentProducts = [], bundles = [], onAddBundle,
}) => {
  const [viewMode, setViewMode] = useState("grid");
  const [activeTab, setActiveTab] = useState("products"); // "products" | "bundles"
  const { state } = useApp();
  const userId = state?.currentUser?._id || state?.currentUser?.id;
  const { favoriteIds, isFavorite, toggleFavorite } = usePOSFavorites(userId);

  const favoriteProducts = products.filter((p) => favoriteIds.includes(p._id || p.id));

  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
        <button onClick={() => setActiveTab("products")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "products" ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
          }`}>
          <Package className="w-4 h-4" />Products
          <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded-full font-bold">{products.length}</span>
        </button>
        <button onClick={() => setActiveTab("bundles")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "bundles" ? "bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
          }`}>
          <PackagePlus className="w-4 h-4" />Bundles
          {bundles.length > 0 && (
            <span className="text-xs bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 px-1.5 py-0.5 rounded-full font-bold">{bundles.length}</span>
          )}
        </button>
      </div>

      {/* ── PRODUCTS TAB ── */}
      {activeTab === "products" && (
        <>
          {/* Favorites row */}
          {favoriteProducts.length > 0 && !searchTerm && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> Favorites
                  <span className="text-[10px] font-normal text-slate-400">({favoriteProducts.length}/{8})</span>
                </span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {favoriteProducts.map((p) => {
                  const inCart = cart.find((i) => i.productId === (p._id || p.id));
                  return (
                    <button
                      key={p._id || p.id}
                      onClick={() => onAddToCart(p)}
                      disabled={isOutOfStock(p.stock)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                        isOutOfStock(p.stock)
                          ? "opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400"
                          : inCart
                          ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400"
                          : "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/20"
                      }`}
                    >
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />
                      <span className="truncate max-w-[100px]">{p.name}</span>
                      <span className="font-bold text-slate-600 dark:text-slate-400">{formatCurrency(p.price, currency)}</span>
                      {inCart && <span className="font-black text-emerald-600">×{inCart.quantity}</span>}
                    </button>
                  );
                })}
              </div>
              <div className="border-b border-slate-100 dark:border-slate-800" />
            </div>
          )}

          {/* Recent quick-add */}
          {recentProducts.length > 0 && !searchTerm && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-semibold shrink-0">
                <Clock className="w-3.5 h-3.5" /> Recent:
              </span>
              {recentProducts.slice(0, 6).map(p => {
                const inCart = cart.find(i => i.productId === p._id);
                return (
                  <button key={p._id} onClick={() => onAddToCart(p)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                      inCart ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:text-blue-600"
                    }`}>
                    <Plus className="w-3 h-3" />{p.name}
                    {inCart && <span className="font-black">×{inCart.quantity}</span>}
                  </button>
                );
              })}
            </div>
          )}

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input value={searchTerm} onChange={onSearchChange} placeholder="Search products, brands, barcodes..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all outline-none" />
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <select value={selectedCategory} onChange={onCategoryChange}
                  className="appearance-none pl-8 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all cursor-pointer outline-none">
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
              <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {["grid", "list"].map(v => (
                  <button key={v} onClick={() => setViewMode(v)}
                    className={`px-3 py-2.5 text-xs font-semibold transition-colors ${viewMode === v ? "bg-blue-600 text-white" : "bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
                    {v === "grid" ? "⊞" : "☰"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category pills */}
          {categories.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => onCategoryChange({ target: { value: "" } })}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${!selectedCategory ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:text-blue-600"}`}>
                All
              </button>
              {categories.map(cat => {
                const c = getCat(cat);
                const active = selectedCategory === cat;
                return (
                  <button key={cat} onClick={() => onCategoryChange({ target: { value: cat } })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${active ? `${c.bg} ${c.text} border-transparent shadow-sm` : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />{cat}
                  </button>
                );
              })}
            </div>
          )}

          {products.length > 0 && <p className="text-xs text-slate-400 font-medium">{products.length} product{products.length !== 1 ? "s" : ""}</p>}

          <AnimatePresence>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {products.map(product => {
                  const productId = product._id || product.id;
                  const inCart = cart.find(i => i.productId === productId);
                  return (
                    <ProductCard key={productId} product={product}
                      inCart={!!inCart} cartQuantity={inCart?.quantity || 0}
                      onAddToCart={onAddToCart} onUpdateQuantity={onUpdateQuantity} currency={currency}
                      isFavorite={isFavorite(productId)} onToggleFavorite={toggleFavorite} />
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                {products.map(product => {
                  const productId = product._id || product.id;
                  const inCart = cart.find(i => i.productId === productId);
                  const cartQuantity = inCart?.quantity || 0;
                  const availableStock = product.stock - cartQuantity;
                  const outOfStock = isOutOfStock(availableStock);
                  const cat = getCat(product.category);
                  return (
                    <motion.div key={productId} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      className={`flex items-center gap-3 p-3 rounded-2xl border bg-white dark:bg-slate-900 transition-all ${inCart ? "border-emerald-300 dark:border-emerald-700 shadow-sm" : "border-slate-200 dark:border-slate-700 hover:border-slate-300"} ${outOfStock ? "opacity-60" : ""}`}>
                      <div className={`w-10 h-10 rounded-xl ${cat.bg} flex items-center justify-center shrink-0`}>
                        <Package className={`w-5 h-5 ${cat.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{product.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-semibold ${cat.text}`}>{product.category}</span>
                          <span className="text-[10px] text-slate-400">{availableStock} left</span>
                        </div>
                      </div>
                      <p className="font-black text-emerald-600 dark:text-emerald-400 text-sm shrink-0">{formatCurrency(product.price, currency)}</p>
                      {inCart ? (
                        <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/15 rounded-xl p-1 border border-emerald-200 dark:border-emerald-800 shrink-0">
                          <button onClick={() => onUpdateQuantity(productId, cartQuantity - 1)} className="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-slate-600 hover:text-red-500 transition-colors"><Minus className="w-3 h-3" /></button>
                          <span className="font-black text-emerald-700 dark:text-emerald-400 text-sm w-5 text-center">{cartQuantity}</span>
                          <button onClick={() => onUpdateQuantity(productId, cartQuantity + 1)} disabled={cartQuantity >= product.stock} className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center text-white hover:bg-emerald-600 disabled:opacity-40 transition-colors"><Plus className="w-3 h-3" /></button>
                        </div>
                      ) : (
                        <button onClick={() => onAddToCart(product)} disabled={outOfStock}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold transition-colors shrink-0">
                          <Plus className="w-3 h-3" />Add
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>

          {products.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                <Package className="w-7 h-7 text-slate-400 opacity-50" />
              </div>
              <p className="font-bold text-slate-500 dark:text-slate-400">No products found</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Try adjusting your search or filter</p>
            </motion.div>
          )}
        </>
      )}

      {/* ── BUNDLES TAB ── */}
      {activeTab === "bundles" && (
        <>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-pink-50 dark:bg-pink-900/10 border border-pink-200 dark:border-pink-900/30">
            <Tag className="w-4 h-4 text-pink-600 dark:text-pink-400 shrink-0" />
            <p className="text-xs text-pink-700 dark:text-pink-300 font-medium">
              Bundles add all included products to the cart at the discounted bundle price. Manage bundles in <strong>Inventory → Bundles</strong>.
            </p>
          </div>

          {bundles.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="w-14 h-14 rounded-2xl bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center mb-3">
                <PackagePlus className="w-7 h-7 text-pink-400" />
              </div>
              <p className="font-bold text-slate-500 dark:text-slate-400">No bundles configured</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Create bundles in Inventory → Bundles</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {bundles.map(bundle => (
                <BundleCard key={bundle._id} bundle={bundle} onAddBundle={onAddBundle} currency={currency} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductGrid;
