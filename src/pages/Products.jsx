import React, { useState, useMemo, useEffect } from "react";
import { Plus, Edit2, Trash2, Download, Package } from "lucide-react";
import { useProducts } from "../context/ProductsContext";
import { useApp } from "../context/AppContext";
import Card from "../components/ui/Card";
import ModernButton from "../components/ui/ModernButton";
import Input from "../components/ui/Input";
import ModernModal, { ConfirmModal } from "../components/ui/ModernModal";
import Table from "../components/ui/Table";
import Badge from "../components/ui/Badge";
import SearchBar from "../components/ui/SearchBar";
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

// Sub-unit options based on selected unit
const getSubUnitOptions = (unit) => {
  if (unit === "liter") return [
    { value: "250ml", label: "250 ML" },
    { value: "500ml", label: "500 ML" },
    { value: "1liter", label: "1 Liter" },
    { value: "2liter", label: "2 Liter" },
    { value: "5liter", label: "5 Liter" },
  ];
  if (unit === "kg") return [
    { value: "0.5kg", label: "0.5 KG" },
    { value: "1kg", label: "1 KG" },
    { value: "2kg", label: "2 KG" },
    { value: "3kg", label: "3 KG" },
    { value: "5kg", label: "5 KG" },
    { value: "10kg", label: "10 KG" },
    { value:"15kg", label:"15kg"},
  ];
  if (unit === "packet") return [
    { value: "0.5kg", label: "1/2 KG" },
    { value: "1kg", label: "1 KG" },
    { value: "2kg", label: "2 KG" },
    { value: "5kg", label: "5 KG" },
    { value: "250g", label: "250 Gram" },
    { value: "500g", label: "500 Gram" },
  ];
  return [];
};

// Auto-generate SKU from name
const generateSKU = (name, category) => {
  const prefix = category ? category.substring(0, 3).toUpperCase() : "PRD";
  const namePart = name.replace(/\s+/g, "").substring(0, 4).toUpperCase();
  const random = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${namePart}-${random}`;
};

const Products = () => {
  const { products, brands: shopBrands, loading, fetchProducts, addProduct, editProduct, removeProduct } = useProducts();
  const { actions, state } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
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
      delete payload.brand;
      delete payload.subUnit;
      delete payload.customBrand;
      if (editingProduct) {
        await editProduct(editingProduct._id, payload);
        actions.showToast({ message: "Product updated successfully", type: "success" });
      } else {
        await addProduct(payload);
        actions.showToast({ message: "Product added successfully", type: "success" });
      }
      // Refresh to get updated brands list from backend
      await fetchProducts();
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Something went wrong", type: "error" });
    } finally {
      setSubmitting(false);
    }
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
    products.filter((p) => p.name?.toLowerCase().includes(searchTerm.toLowerCase())),
    [products, searchTerm]
  );

  const columns = [
    { key: "name", title: "Product", render: (v, row) => (
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{v}</p>
        <p className="text-xs text-gray-400 font-mono">{row.sku}</p>
      </div>
    )},
    { key: "category", title: "Category", render: (v) => <Badge variant="primary" size="sm">{v}</Badge> },
    { key: "manufacturer", title: "Brand", render: (v) => v ? <span className="text-sm text-gray-700 dark:text-gray-300">{v}</span> : <span className="text-gray-400 text-xs">—</span> },
    { key: "unit", title: "Unit", render: (v) => <span className="text-sm text-gray-600 dark:text-gray-400">{v}</span> },
    {
      key: "price", title: "Price",
      render: (v) => <span className="font-semibold text-emerald-600">{formatCurrency(v, "Rs.")}</span>,
    },
    {
      key: "stock", title: "Stock",
      render: (v, row) => (
        <span className={`font-medium ${
          v <= 0 ? "text-red-600" : v <= (row.minStockLevel || 5) ? "text-amber-600" : "text-emerald-600"
        }`}>{v} {row.unit}</span>
      ),
    },
    {
      key: "actions", title: "Actions",
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
            onClick={() => { 
              setEditingProduct(row); 
              const mfr = row.manufacturer || "";
              setFormData({ 
                ...emptyForm, 
                ...row,
                brand: shopBrands.includes(mfr) ? mfr : (mfr ? "__other__" : ""),
                customBrand: shopBrands.includes(mfr) ? "" : mfr,
              }); 
              setIsModalOpen(true); 
            }}
          >
            <Edit2 size={16} />
          </button>
          <button
            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
            onClick={() => setDeleteConfirm(row)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Products</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1.5 flex items-center gap-2">
            <Package className="w-4 h-4" />
            <span>Manage your product inventory</span>
          </p>
        </div>
        <div className="flex gap-2">
          <ModernButton variant="outline" onClick={() => exportProducts(products, state?.settings?.currency)} icon={Download}>Export</ModernButton>
          <ModernButton onClick={() => { resetForm(); setIsModalOpen(true); }} icon={Plus}>Add Product</ModernButton>
        </div>
      </div>

      <Card padding="md">
        <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search products..." />
      </Card>

      <Card padding="none">
        {loading ? <TableSkeleton rows={LIMIT} cols={6} /> : (
          <Table columns={columns} data={filteredProducts} loading={false} emptyMessage="No products found." />
        )}
        <Pagination page={page} totalPages={pagination.pages} total={pagination.total} limit={LIMIT} onPageChange={setPage} />
      </Card>

      <ModernModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title={editingProduct ? "Edit Product" : "Add Product"}
        footer={
          <ModernButton onClick={handleSubmit} loading={submitting}>
            {editingProduct ? "Update" : "Create"}
          </ModernButton>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Product Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Product Name"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value, subUnit: "" })}
              options={categoryOptions}
              placeholder="Select Category"
            />
            {shopBrands.length > 0 ? (
              <Select
                label="Brand / Manufacturer"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value, customBrand: "" })}
                options={[
                  { value: "", label: "Select Brand" },
                  ...shopBrands.map(b => ({ value: b, label: b })),
                  { value: "__other__", label: "+ Type new brand" },
                ]}
              />
            ) : (
              <Input
                label="Brand / Manufacturer"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="Brand (add brands in Settings)"
              />
            )}
          </div>
          {formData.brand === "__other__" && (
            <Input
              label="New Brand Name"
              value={formData.customBrand || ""}
              onChange={(e) => setFormData({ ...formData, customBrand: e.target.value })}
              placeholder="e.g. Syngenta, Bayer..."
              required
            />
          )}
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Unit"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value, subUnit: "" })}
              options={unitOptions}
              placeholder="Select Unit"
            />
            {getSubUnitOptions(formData.unit).length > 0 && (
              <Select
                label={formData.unit === "liter" ? "Volume" : formData.unit === "kg" ? "Weight" : "Pack Size"}
                value={formData.subUnit}
                onChange={(e) => setFormData({ ...formData, subUnit: e.target.value })}
                options={[{ value: "", label: "Select Size" }, ...getSubUnitOptions(formData.unit)]}
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Sale Price (Rs.)"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="Price"
              required
            />
            <Input
              label="Cost Price (Rs.)"
              type="number"
              value={formData.costPrice}
              onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
              placeholder="Cost Price"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Stock Quantity"
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              placeholder="Stock"
              required
            />
            <Input
              label="Min Stock Level"
              type="number"
              value={formData.minStockLevel}
              onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
              placeholder="5"
            />
          </div>
          <Input
            label="Barcode"
            value={formData.barcode}
            onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
            placeholder="Barcode (optional)"
          />
          <Input
            label="Expiry Date"
            type="date"
            value={formData.expiryDate}
            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
          />
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
