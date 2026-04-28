import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Package, Search, ChevronDown, Clock } from "lucide-react";
import { formatCurrency, isOutOfStock, isLowStock } from "../../utils/helpers";

const categoryColors = {
  Herbicides:   "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Insecticides: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Fungicides:   "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  Fertilizers:  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Seeds:        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Other:        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  }),
};

const ProductGrid = ({
  products, cart, categories, searchTerm, selectedCategory,
  onSearchChange, onCategoryChange, onAddToCart, onUpdateQuantity, currency,
  recentProducts = [],
}) => (
  <div className="space-y-4">
    {/* Recently sold quick-add chips */}
    {recentProducts.length > 0 && !searchTerm && (
      <div className="flex flex-wrap gap-2">
        <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <Clock className="w-3 h-3" />Recent:
        </span>
        {recentProducts.slice(0, 6).map(p => {
          const inCart = cart.find(i => i.productId === p._id);
          return (
            <button key={p._id} onClick={() => onAddToCart(p)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                inCart
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700"
                  : "bg-white dark:bg-[#122b1c] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-emerald-900/20 hover:border-emerald-400 hover:text-emerald-600"
              }`}>
              <Plus className="w-3 h-3" />{p.name}
              {inCart && <span className="font-bold">×{inCart.quantity}</span>}
            </button>
          );
        })}
      </div>
    )}
    {/* Search + Filter */}
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className="flex flex-col sm:flex-row gap-3"
    >
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Search products by name or barcode..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
        />
      </div>
      <div className="relative">
        <select
          value={selectedCategory}
          onChange={onCategoryChange}
          className="appearance-none pl-3.5 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all cursor-pointer"
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
    </motion.div>

    {/* Product Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <AnimatePresence>
        {products.map((product, i) => {
          const inCart = cart.find(item => item.productId === (product._id || product.id));
          const cartQuantity = inCart?.quantity || 0;
          const availableStock = product.stock - cartQuantity;
          const outOfStock = isOutOfStock(availableStock);
          const lowStock = isLowStock(availableStock);
          const productId = product._id || product.id;
          const catCls = categoryColors[product.category] || categoryColors.Other;

          return (
            <motion.div
              key={productId}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, scale: 0.95 }}
              whileHover={!outOfStock ? { y: -4, boxShadow: "0 12px 30px rgba(0,0,0,0.12), 0 4px 12px rgba(16,185,129,0.1)" } : {}}
              className={`relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-sm overflow-hidden transition-colors ${outOfStock ? "opacity-60" : ""}`}
            >
              {/* Top accent line */}
              <div className={`h-0.5 w-full ${outOfStock ? "bg-slate-200" : "bg-gradient-to-r from-emerald-400 to-teal-500"}`} />

              {/* Out of stock overlay */}
              {outOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-slate-900/60 z-10 rounded-2xl">
                  <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border border-red-200 dark:border-red-800">
                    Out of Stock
                  </span>
                </div>
              )}

              <div className="p-4">
                {/* Category + Low stock */}
                <div className="flex items-center justify-between mb-2.5">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${catCls}`}>
                    {product.category}
                  </span>
                  {lowStock && !outOfStock && (
                    <motion.span
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ repeat: Infinity, duration: 1.8 }}
                      className="text-xs font-semibold text-amber-600 dark:text-amber-400"
                    >
                      Low Stock
                    </motion.span>
                  )}
                </div>

                {/* Name */}
                <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-snug line-clamp-2 mb-1">
                  {product.name}
                </h3>
                <p className="text-xs text-slate-400 font-mono mb-3">{product.barcode || "—"}</p>

                {/* Price + Stock */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(product.price, currency)}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    lowStock ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                             : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  }`}>
                    {availableStock} left
                  </span>
                </div>

                {/* Add / Qty controls */}
                {inCart ? (
                  <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-1">
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => onUpdateQuantity(productId, cartQuantity - 1)}
                      className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </motion.button>
                    <motion.span
                      key={cartQuantity}
                      initial={{ scale: 1.4 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      className="font-extrabold text-emerald-700 dark:text-emerald-400 text-base w-8 text-center"
                    >
                      {cartQuantity}
                    </motion.span>
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => onUpdateQuantity(productId, cartQuantity + 1)}
                      disabled={cartQuantity >= product.stock}
                      className="w-9 h-9 rounded-lg bg-emerald-500 shadow-sm flex items-center justify-center text-white hover:bg-emerald-600 disabled:opacity-40 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => onAddToCart(product)}
                    disabled={outOfStock}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm font-bold shadow-glow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add to Cart
                  </motion.button>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>

    {/* Empty state */}
    {products.length === 0 && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/50"
      >
        <Package className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
        <p className="font-semibold text-slate-500 dark:text-slate-400">No products found</p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Try adjusting your search or filter</p>
      </motion.div>
    )}
  </div>
);

export default ProductGrid;
