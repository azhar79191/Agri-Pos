import PageHeader from "../../components/ui/PageHeader";
import FormField from "../../components/ui/FormField";
import Modal from "../../components/ui/Modal";
import LoadingState, { LoadingIndicator } from "../../components/ui/LoadingState";
import React from "react";
import { PackagePlus, Plus, Trash2, Package, Edit2, Search, X } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { useProducts } from "../../context/ProductsContext";
import { formatCurrency } from "../../utils/helpers";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import FilterBar from "../../components/ui/FilterBar";
import { useBundles } from "../../hooks/useBundles";

const LIMIT = 12;

const Bundles = () => {
  const { state }    = useApp();
  const { settings } = state;
  const { products, fetchProducts } = useProducts();

  const {
    bundles, loading, page, setPage, totalPages, total,
    search, setSearch,
    showModal, setShowModal,
    editing, saving, deleting,
    form, setForm,
    productSearch, setProductSearch,
    totalValue, discount,
    openCreate, openEdit,
    addItem, removeItem, updateQty,
    handleSave, handleDelete,
  } = useBundles();

  React.useEffect(() => { fetchProducts(); }, []); // eslint-disable-line

  const filteredProducts = products
    .filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase()) && !form.items.find((i) => i.product === p._id))
    .slice(0, 8);

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader title={<>Product Bundles</>} description={<>{total} bundles · Sell multiple products at a discount</>} icon={PackagePlus} actions={<><button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-semibold shadow-sm transition-all hover:opacity-90" style={{ background: "var(--pos-primary)" }}>
          <Plus className="w-4 h-4" />Create Bundle
        </button></>}></PageHeader>

      <FilterBar filters={[{ type: "search", key: "search", placeholder: "Search bundles..." }]} values={{ search }} onChange={(k, v) => setSearch(v)} onClear={() => setSearch("")} total={total} />

      {loading ? (
        <LoadingState variant="cards" label="Loading bundles" />
      ) : bundles.length === 0 ? (
        <EmptyState icon={PackagePlus} title="No bundles yet" description="Create product bundles with discounted pricing to boost sales" actionLabel="Create Bundle" onAction={openCreate} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bundles.map((b) => (
            <div key={b._id} className="workspace-panel bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 shadow-premium overflow-hidden hover:shadow-premium-lg hover:-translate-y-0.5 transition-all group">
              <div className="h-1 w-full bg-gradient-to-r from-pink-500 to-rose-600" />
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{b.name}</p>
                    {b.description && <p className="text-xs text-slate-400 mt-0.5 truncate">{b.description}</p>}
                  </div>
                  {b.discount > 0 && <span className="ml-2 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 flex-shrink-0">-{b.discount.toFixed(0)}%</span>}
                </div>
                <div className="space-y-1.5">
                  {(b.items || []).map((item, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-sm">
                      <span className="text-slate-700 dark:text-slate-300 truncate flex-1">{item.productName}</span>
                      <span className="text-slate-400 ml-2 flex-shrink-0">×{item.quantity || 1} · {formatCurrency(item.price, settings.currency)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    {b.totalValue > b.bundlePrice && <p className="text-xs text-slate-400 line-through">{formatCurrency(b.totalValue, settings.currency)}</p>}
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(b.bundlePrice, settings.currency)}</p>
                  </div>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(b)} className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(b._id)} disabled={deleting === b._id} className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50">
                      {deleting === b._id ? <LoadingIndicator /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="workspace-panel bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50">
          <Pagination page={page} totalPages={totalPages} total={total} limit={LIMIT} onPageChange={setPage} />
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <Modal busy={saving}
          isOpen
          onClose={() => setShowModal(false)}
          title={<>{editing ? "Edit Bundle" : "Create Bundle"}</>}
          size="lg"
          footer={<div className="flex items-center justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" data-modal-dismiss>Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-all" style={{ background: "var(--pos-primary)" }}>
                {saving ? <LoadingIndicator /> : <PackagePlus className="w-4 h-4" />}
                {editing ? "Update Bundle" : "Create Bundle"}
              </button>
            </div>}><div className="space-y-4">


            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField className="sm:col-span-2" label={<>Bundle Name <span className="text-red-500">*</span></>}>

                  <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Cotton Starter Kit" className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all" />
                </FormField>
                <FormField label={<>Bundle Price <span className="text-red-500">*</span></>}>

                  <input type="number" min="0" value={form.bundlePrice} onChange={(e) => setForm((p) => ({ ...p, bundlePrice: e.target.value }))} placeholder="0" className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all" />
                </FormField>
                <div className="flex items-end">
                  {totalValue > 0 && form.bundlePrice && (
                    <div className="w-full p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                      <p className="text-xs text-slate-500">Total value: <span className="font-bold text-slate-700 dark:text-slate-300">{formatCurrency(totalValue, settings.currency)}</span></p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">{discount > 0 ? `${discount}% discount` : discount < 0 ? `${Math.abs(discount)}% markup` : "No discount"}</p>
                    </div>
                  )}
                </div>
                <FormField className="sm:col-span-2" label={<>Description</>}>

                  <input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Optional description" className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all" />
                </FormField>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Add Products <span className="text-red-500">*</span></label>
                <div className="relative mb-2">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input aria-label="Search products to add" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} placeholder="Search products to add..." className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all" />
                </div>
                {productSearch && filteredProducts.length > 0 && (
                  <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden mb-3 max-h-40 overflow-y-auto">
                    {filteredProducts.map((p) => (
                      <button key={p._id} onClick={() => addItem(p)} className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left border-b border-slate-100 dark:border-slate-800 last:border-0" data-dirty-change>
                        <span className="text-sm text-slate-900 dark:text-white">{p.name}</span>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{formatCurrency(p.price, settings.currency)}</span>
                      </button>
                    ))}
                  </div>
                )}
                {form.items.length > 0 ? (
                  <div className="space-y-2">
                    {form.items.map((item) => (
                      <div key={item.product} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                        <div className="w-7 h-7 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center flex-shrink-0"><Package className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" /></div>
                        <span className="flex-1 text-sm text-slate-900 dark:text-white truncate">{item.productName}</span>
                        <span className="text-xs text-slate-400 flex-shrink-0">{formatCurrency(item.price, settings.currency)}</span>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="text-xs text-slate-500">Qty:</span>
                          <input type="number" min="1" value={item.quantity || 1} onChange={(e) => updateQty(item.product, e.target.value)} className="w-14 px-2 py-1 text-center text-xs border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"  aria-label="Quantity"/>
                        </div>
                        <button onClick={() => removeItem(item.product)} className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0" data-dirty-change><X className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                    <Package className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Search and add products above</p>
                  </div>
                )}
              </div>
            </div>


          </div></Modal>
      )}
    </div>
  );
};

export default Bundles;
