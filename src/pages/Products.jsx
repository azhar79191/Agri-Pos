import React, { useState, useMemo, useEffect } from "react";
import { Plus, Download, Package } from "lucide-react";
import { useProducts } from "../context/ProductsContext";
import { useApp } from "../context/AppContext";
import ModernButton from "../components/ui/ModernButton";
import Input from "../components/ui/Input";
import ModernModal, { ConfirmModal } from "../components/ui/ModernModal";
import Select from "../components/ui/Select";
import Pagination from "../components/ui/Pagination";
import { TableSkeleton } from "../components/ui/Skeleton";
import { exportProducts } from "../utils/excelExport";
import ProductRow from "../components/products/ProductRow";
import ProductStatsCards from "../components/products/ProductStatsCards";
import ProductFilters from "../components/products/ProductFilters";
import { useProductForm } from "../hooks/useProductForm";
import {
  DEFAULT_CATEGORIES, UNIT_OPTIONS, SUB_UNIT_OPTIONS, EMPTY_PRODUCT_FORM,
} from "../constants/products";

const LIMIT = 15;

const Products = () => {
  const { products, brands: shopBrands, shopCategories, loading, fetchProducts } = useProducts();
  const { state } = useApp();

  const {
    isModalOpen, setIsModalOpen,
    editingProduct, deleteConfirm, setDeleteConfirm,
    formData, setFormData, submitting,
    openAdd, openEdit, handleSubmit, confirmDelete, resetForm,
  } = useProductForm();

  const [searchTerm, setSearchTerm]       = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [page, setPage]                   = useState(1);
  const [pagination, setPagination]       = useState({ total: 0, pages: 1 });

  useEffect(() => {
    fetchProducts({ page, limit: LIMIT }).then((res) => {
      if (res?.data?.pagination) setPagination(res.data.pagination);
    });
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const allCategories = useMemo(() => [
    ...DEFAULT_CATEGORIES,
    ...(shopCategories || []).filter((c) => !DEFAULT_CATEGORIES.includes(c)),
  ], [shopCategories]);

  const categoryOptions = allCategories.map((c) => ({ value: c, label: c }));

  const filteredProducts = useMemo(() =>
    products.filter((p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!filterCategory || p.category === filterCategory)
    ),
    [products, searchTerm, filterCategory]
  );

  const stockStats = useMemo(() => ({
    total: products.length,
    low:   products.filter((p) => p.stock > 0 && p.stock <= (p.minStockLevel || 5)).length,
    out:   products.filter((p) => p.stock <= 0).length,
  }), [products]);

  const subUnitOptions = SUB_UNIT_OPTIONS[formData.unit] || [];

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/15 flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Products</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{pagination.total} products in inventory</p>
          </div>
        </div>
        <div className="flex gap-2">
          <ModernButton variant="outline" onClick={() => exportProducts(products, state?.settings?.currency)} icon={Download} size="sm">Export</ModernButton>
          <ModernButton onClick={openAdd} icon={Plus}>Add Product</ModernButton>
        </div>
      </div>

      <ProductStatsCards stats={stockStats} />

      <ProductFilters
        searchTerm={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        filterCategory={filterCategory}
        onCategoryChange={(e) => setFilterCategory(e.target.value)}
        categoryOptions={categoryOptions}
      />

      {/* Table */}
      <div className="card-base overflow-hidden">
        {loading ? <TableSkeleton rows={LIMIT} cols={6} /> : (
          <div className="overflow-x-auto">
            <table className="w-full table-premium">
              <thead>
                <tr>{["Product", "Category", "Brand", "Unit", "Price", "Stock", "Actions"].map((h) => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <ProductRow
                    key={product._id || product.id}
                    product={product}
                    onEdit={(p) => openEdit(p, shopBrands)}
                    onDelete={setDeleteConfirm}
                    currency="Rs."
                  />
                ))}
              </tbody>
            </table>
            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <Package className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">No products found</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        )}
        <div className="border-t border-slate-100 dark:border-slate-800">
          <Pagination page={page} totalPages={pagination.pages} total={pagination.total} limit={LIMIT} onPageChange={setPage} />
        </div>
      </div>

      {/* Add / Edit modal */}
      <ModernModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title={editingProduct ? "Edit Product" : "Add Product"}
        footer={<ModernButton onClick={handleSubmit} loading={submitting}>{editingProduct ? "Update" : "Create"}</ModernButton>}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Product Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Product Name" required />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value, subUnit: "" })} options={categoryOptions} placeholder="Select Category" />
            {shopBrands.length > 0 ? (
              <Select
                label="Brand / Manufacturer"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value, customBrand: "" })}
                options={[{ value: "", label: "Select Brand" }, ...shopBrands.map((b) => ({ value: b, label: b })), { value: "__other__", label: "+ Type new brand" }]}
              />
            ) : (
              <Input label="Brand / Manufacturer" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} placeholder="Brand (add brands in Settings)" />
            )}
          </div>
          {formData.brand === "__other__" && (
            <Input label="New Brand Name" value={formData.customBrand || ""} onChange={(e) => setFormData({ ...formData, customBrand: e.target.value })} placeholder="e.g. Syngenta, Bayer..." required />
          )}
          <div className="grid grid-cols-2 gap-4">
            <Select label="Unit" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value, subUnit: "" })} options={UNIT_OPTIONS} placeholder="Select Unit" />
            {subUnitOptions.length > 0 && (
              <Select
                label={formData.unit === "liter" ? "Volume" : formData.unit === "kg" ? "Weight" : "Pack Size"}
                value={formData.subUnit}
                onChange={(e) => setFormData({ ...formData, subUnit: e.target.value })}
                options={[{ value: "", label: "Select Size" }, ...subUnitOptions]}
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Sale Price (Rs.)" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="Price" required />
            <Input label="Cost Price (Rs.)" type="number" value={formData.costPrice} onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })} placeholder="Cost Price" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Stock Quantity" type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} placeholder="Stock" required />
            <Input label="Min Stock Level" type="number" value={formData.minStockLevel} onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })} placeholder="5" />
          </div>
          <Input label="Barcode" value={formData.barcode} onChange={(e) => setFormData({ ...formData, barcode: e.target.value })} placeholder="Barcode (optional)" />
          <Input label="Expiry Date" type="date" value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} />
        </form>
      </ModernModal>

      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"?`}
      />
    </div>
  );
};

export default Products;
