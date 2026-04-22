import React, { useState, useMemo, useEffect } from "react";
import { Plus, Edit2, Trash2, Download, Package, Search, ChevronDown, Leaf } from "lucide-react";
import { useProducts } from "../context/ProductsContext";
import { useApp } from "../context/AppContext";
import ModernButton from "../components/ui/ModernButton";
import Input from "../components/ui/Input";
import ModernModal, { ConfirmModal } from "../components/ui/ModernModal";
import Badge from "../components/ui/Badge";
import Select from "../components/ui/Select";
import { formatCurrency } from "../utils/helpers";
import Pagination from "../components/ui/Pagination";
import { TableSkeleton } from "../components/ui/Skeleton";
import { exportProducts } from "../utils/excelExport";

const LIMIT = 15;

const emptyForm = {
  name: "", category: "", brand: "", price: "", costPrice: "", stock: "",
  unit: "", subUnit: "", expiryDate: "", description: "", barcode: "", minStockLevel: "5",
};

const categoryOptions = [
  { value: "Herbicides", label: "Herbicides" },
  { value: "Insecticides", label: "Insecticides" },
  { value: "Fungicides", label: "Fungicides" },
  { value: "Fertilizers", label: "Fertilizers" },
  { value: "Seeds", label: "Seeds" },
  { value: "Other", label: "Other" },
];

const unitOptions = [
  { value: "liter", label: "Liter" },
  { value: "ml", label: "ML (Milliliter)" },
  { value: "kg", label: "KG (Kilogram)" },
  { value: "gram", label: "Gram" },
  { value: "packet", label: "Packet" },
  { value: "bottle", label: "Bottle" },
  { value: "box", label: "Box" },
  { value: "piece", label: "Piece" },
];

const getSubUnitOptions = (unit) => {
  if (unit === "liter") return [
    { value: "250ml", label: "250 ML" }, { value: "500ml", label: "500 ML" },
    { value: "1liter", label: "1 Liter" }, { value: "2liter", label: "2 Liter" }, { value: "5liter", label: "5 Liter" },
  ];
  if (unit === "kg") return [
    { value: "0.5kg", label: "0.5 KG" }, { value: "1kg", label: "1 KG" }, { value: "2kg", label: "2 KG" },
    { value: "3kg", label: "3 KG" }, { value: "5kg", label: "5 KG" }, { value: "10kg", label: "10 KG" }, { value: "15kg", label: "15kg" },
  ];
  if (unit === "packet") return [
    { value: "0.5kg", label: "1/2 KG" }, { value: "1kg", label: "1 KG" }, { value: "2kg", label: "2 KG" },
    { value: "5kg", label: "5 KG" }, { value: "250g", label: "250 Gram" }, { value: "500g", label: "500 Gram" },
  ];
  return [];
};

const generateSKU = (name, category) => {
  const prefix = category ? category.substring(0, 3).toUpperCase() : "PRD";
  const namePart = name.replace(/\s+/g, "").substring(0, 4).toUpperCase();
  const random = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${namePart}-${random}`;
};

const categoryColors = {
  Herbicides: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Insecticides: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Fungicides: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  Fertilizers: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Seeds: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Other: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
};

const Products = () => {
  const { products, brands: shopBrands, loading, fetchProducts, addProduct, editProduct, removeProduct } = useProducts();
  const { actions, state } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  useEffect(() => {
    fetchProducts({ page, limit: LIMIT }).then(res => {
      if (res?.data?.pagination) setPagination(res.data.pagination);
    });
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetForm = () => { setFormData(emptyForm); setEditingProduct(null); };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        sku: editingProduct?.sku || generateSKU(formData.name, formData.category),
        price: parseFloat(formData.price),
        costPrice: parseFloat(formData.costPrice) || 0,
        stock: parseInt(formData.stock),
        minStockLevel: parseInt(formData.minStockLevel) || 5,
        manufacturer: formData.brand === "__other__" ? (formData.customBrand || "") : formData.brand,
        description: formData.subUnit
          ? `${formData.description || ""} | Size: ${formData.subUnit}`.trim()
          : formData.description,
      };
      delete payload.brand; delete payload.subUnit; delete payload.customBrand;
      if (editingProduct) {
        await editProduct(editingProduct._id, payload);
        actions.showToast({ message: "Product updated successfully", type: "success" });
      } else {
        await addProduct(payload);
        actions.showToast({ message: "Product added successfully", type: "success" });
      }
      await fetchProducts();
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Something went wrong", type: "error" });
    } finally { setSubmitting(false); }
  };

  const confirmDelete = async () => {
    try {
      await removeProduct(deleteConfirm._id);
      actions.showToast({ message: "Product deleted successfully", type: "success" });
      setDeleteConfirm(null);
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Delete failed", type: "error" });
    }
  };

  const filteredProducts = useMemo(() =>
    products.filter((p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!filterCategory || p.category === filterCategory)
    ),
    [products, searchTerm, filterCategory]
  );

  const stockStats = useMemo(() => ({
    total: products.length,
    low: products.filter(p => p.stock > 0 && p.stock <= (p.minStockLevel || 5)).length,
    out: products.filter(p => p.stock <= 0).length,
  }), [products]);

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-glow-sm flex-shrink-0">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Products</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{pagination.total} products in inventory</p>
          </div>
        </div>
        <div className="flex gap-2">
          <ModernButton variant="outline" onClick={() => exportProducts(products, state?.settings?.currency)} icon={Download} size="sm">Export</ModernButton>
          <ModernButton onClick={() => { resetForm(); setIsModalOpen(true); }} icon={Plus}>Add Product</ModernButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Products", value: stockStats.total, color: "emerald", icon: Package },
          { label: "Low Stock", value: stockStats.low, color: "amber", icon: Package },
          { label: "Out of Stock", value: stockStats.out, color: "red", icon: Package },
        ].map(({ label, value, color, icon: Icon }, i) => (
          <div key={label} className={`stat-card-premium ${color} animate-fade-up stagger-${i + 1}`}>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color === "emerald" ? "text-emerald-600" : color === "amber" ? "text-amber-600" : "text-red-600"}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search products by name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
          />
        </div>
        <div className="relative">
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="appearance-none pl-3.5 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all cursor-pointer"
          >
            <option value="">All Categories</option>
            {categoryOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-premium overflow-hidden">
        {loading ? <TableSkeleton rows={LIMIT} cols={6} /> : (
          <div className="overflow-x-auto">
            <table className="w-full table-premium">
              <thead>
                <tr>
                  {["Product", "Category", "Brand", "Unit", "Price", "Stock", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3.5 text-xs font-700 text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-700/50">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProducts.map((product, i) => {
                  const stockStatus = product.stock <= 0 ? "out" : product.stock <= (product.minStockLevel || 5) ? "low" : "good";
                  return (
                    <tr key={product._id || product.id} className="group hover:bg-emerald-50/40 dark:hover:bg-emerald-900/10 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center flex-shrink-0">
                            <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white text-sm">{product.name}</p>
                            <p className="text-xs text-slate-400 font-mono">{product.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${categoryColors[product.category] || categoryColors.Other}`}>
                          {product.category}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-600 dark:text-slate-400">{product.manufacturer || <span className="text-slate-300 dark:text-slate-600">—</span>}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-600 dark:text-slate-400">{product.unit}</td>
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(product.price, "Rs.")}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          stockStatus === "out" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                          stockStatus === "low" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                          "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${stockStatus === "out" ? "bg-red-500" : stockStatus === "low" ? "bg-amber-500" : "bg-emerald-500"}`} />
                          {product.stock} {product.unit}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            onClick={() => {
                              setEditingProduct(product);
                              const mfr = product.manufacturer || "";
                              setFormData({ ...emptyForm, ...product, brand: shopBrands.includes(mfr) ? mfr : (mfr ? "__other__" : ""), customBrand: shopBrands.includes(mfr) ? "" : mfr });
                              setIsModalOpen(true);
                            }}
                          ><Edit2 size={15} /></button>
                          <button className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" onClick={() => setDeleteConfirm(product)}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <Package className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">No products found</p>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        )}
        <div className="border-t border-slate-100 dark:border-slate-800">
          <Pagination page={page} totalPages={pagination.pages} total={pagination.total} limit={LIMIT} onPageChange={setPage} />
        </div>
      </div>

      {/* Modal */}
      <ModernModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title={editingProduct ? "Edit Product" : "Add Product"}
        footer={<ModernButton onClick={handleSubmit} loading={submitting}>{editingProduct ? "Update" : "Create"}</ModernButton>}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Product Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Product Name" required />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Category" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value, subUnit: "" })} options={categoryOptions} placeholder="Select Category" />
            {shopBrands.length > 0 ? (
              <Select label="Brand / Manufacturer" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value, customBrand: "" })}
                options={[{ value: "", label: "Select Brand" }, ...shopBrands.map(b => ({ value: b, label: b })), { value: "__other__", label: "+ Type new brand" }]} />
            ) : (
              <Input label="Brand / Manufacturer" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} placeholder="Brand (add brands in Settings)" />
            )}
          </div>
          {formData.brand === "__other__" && (
            <Input label="New Brand Name" value={formData.customBrand || ""} onChange={e => setFormData({ ...formData, customBrand: e.target.value })} placeholder="e.g. Syngenta, Bayer..." required />
          )}
          <div className="grid grid-cols-2 gap-4">
            <Select label="Unit" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value, subUnit: "" })} options={unitOptions} placeholder="Select Unit" />
            {getSubUnitOptions(formData.unit).length > 0 && (
              <Select label={formData.unit === "liter" ? "Volume" : formData.unit === "kg" ? "Weight" : "Pack Size"} value={formData.subUnit}
                onChange={e => setFormData({ ...formData, subUnit: e.target.value })}
                options={[{ value: "", label: "Select Size" }, ...getSubUnitOptions(formData.unit)]} />
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Sale Price (Rs.)" type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} placeholder="Price" required />
            <Input label="Cost Price (Rs.)" type="number" value={formData.costPrice} onChange={e => setFormData({ ...formData, costPrice: e.target.value })} placeholder="Cost Price" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Stock Quantity" type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} placeholder="Stock" required />
            <Input label="Min Stock Level" type="number" value={formData.minStockLevel} onChange={e => setFormData({ ...formData, minStockLevel: e.target.value })} placeholder="5" />
          </div>
          <Input label="Barcode" value={formData.barcode} onChange={e => setFormData({ ...formData, barcode: e.target.value })} placeholder="Barcode (optional)" />
          <Input label="Expiry Date" type="date" value={formData.expiryDate} onChange={e => setFormData({ ...formData, expiryDate: e.target.value })} />
        </form>
      </ModernModal>

      <ConfirmModal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={confirmDelete}
        title="Delete Product" message={`Are you sure you want to delete "${deleteConfirm?.name}"?`} />
    </div>
  );
};

export default Products;
