import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  AlertTriangle,
  QrCode,
  Barcode,
  History,
  MoreVertical,
  TrendingUp,
  TrendingDown,
  Filter,
  Download
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { productCategories } from "../data/products";
import Card from "../components/ui/Card";
import ModernButton from "../components/ui/ModernButton";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import ModernModal, { ConfirmModal } from "../components/ui/ModernModal";
import Table from "../components/ui/Table";
import Badge from "../components/ui/Badge";
import SearchBar from "../components/ui/SearchBar";
import BarcodeScanner from "../components/BarcodeScanner";
import StockManagementModal from "../components/StockManagementModal";
import {
  formatCurrency,
  isLowStock,
  isOutOfStock,
  getStockStatus,
  getStockColor
} from "../utils/helpers";

const Products = () => {
  const { state, actions } = useApp();
  const { products, customers, settings, stockHistory, currentUser } = state;

  // Check permissions
  const canManageProducts = actions.hasPermission("products");
  const canDelete = actions.hasPermission("delete_data");
  const canManageStock = actions.hasPermission("stock_management");

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [stockFilter, setStockFilter] = useState(""); // "all", "low", "out", "in"
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    brand: "",
    price: "",
    stock: "",
    unit: "",
    expiryDate: "",
    description: "",
    barcode: ""
  });

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode?.includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        !selectedCategory || product.category === selectedCategory;
      const matchesStock =
        stockFilter === "" ||
        (stockFilter === "low" && isLowStock(product.stock) && !isOutOfStock(product.stock)) ||
        (stockFilter === "out" && isOutOfStock(product.stock)) ||
        (stockFilter === "in" && product.stock > 5);
      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchTerm, selectedCategory, stockFilter]);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      brand: "",
      price: "",
      stock: "",
      unit: "",
      expiryDate: "",
      description: "",
      barcode: ""
    });
    setEditingProduct(null);
  };

  // Open add modal
  const handleAdd = () => {
    if (!canManageProducts) {
      actions.showToast({ message: "You don't have permission to add products", type: "error" });
      return;
    }
    resetForm();
    setIsModalOpen(true);
  };

  // Open edit modal
  const handleEdit = (product) => {
    if (!canManageProducts) {
      actions.showToast({ message: "You don't have permission to edit products", type: "error" });
      return;
    }
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      brand: product.brand,
      price: product.price.toString(),
      stock: product.stock.toString(),
      unit: product.unit,
      expiryDate: product.expiryDate,
      description: product.description,
      barcode: product.barcode || ""
    });
    setIsModalOpen(true);
  };

  // Handle delete
  const handleDelete = (product) => {
    if (!canDelete) {
      actions.showToast({ message: "Only admins can delete products", type: "error" });
      return;
    }
    actions.showToast({
      message: `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      type: "error",
      position: "center",
      isConfirm: true,
      onConfirm: () => {
        actions.deleteProduct(product.id);
      }
    });
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      actions.deleteProduct(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  // Handle stock management
  const handleStockManage = (product) => {
    if (!canManageStock) {
      actions.showToast({ message: "You don't have permission to manage stock", type: "error" });
      return;
    }
    setSelectedProduct(product);
    setIsStockModalOpen(true);
  };

  // Handle barcode scan
  const handleBarcodeScan = (product) => {
    actions.addToCart(product, 1);
    setIsScannerOpen(false);
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock)
    };

    if (editingProduct) {
      actions.updateProduct({ ...productData, id: editingProduct.id });
    } else {
      actions.addProduct(productData);
    }
    
    setIsModalOpen(false);
    resetForm();
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Generate barcode
  const generateBarcode = () => {
    const barcode = `${settings.barcodePrefix}${Date.now().toString().slice(-8)}`;
    setFormData(prev => ({ ...prev, barcode }));
  };

  // Export products
  const handleExport = () => {
    const data = {
      exportDate: new Date().toISOString(),
      totalProducts: products.length,
      products: filteredProducts
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `products-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    actions.showToast({ message: "Products exported successfully", type: "success" });
  };

  // Table columns
  const columns = [
    {
      key: "name",
      title: "Product",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isOutOfStock(row.stock) 
              ? "bg-red-100 dark:bg-red-900/30" 
              : isLowStock(row.stock)
              ? "bg-amber-100 dark:bg-amber-900/30"
              : "bg-emerald-100 dark:bg-emerald-900/30"
          }`}>
            <Package className={`w-5 h-5 ${
              isOutOfStock(row.stock) 
                ? "text-red-600" 
                : isLowStock(row.stock)
                ? "text-amber-600"
                : "text-emerald-600"
            }`} />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{row.barcode}</p>
          </div>
        </div>
      )
    },
    {
      key: "category",
      title: "Category",
      render: (value) => (
        <Badge variant="primary" size="sm">
          {value}
        </Badge>
      )
    },
    {
      key: "price",
      title: "Price",
      render: (value) => (
        <span className="font-semibold text-emerald-600">
          {formatCurrency(value, settings.currency)}
        </span>
      )
    },
    {
      key: "stock",
      title: "Stock",
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <span className={`font-medium px-3 py-1.5 rounded-lg ${getStockColor(value)}`}>
            {value} {row.unit}
          </span>
          {isOutOfStock(value) && (
            <Badge variant="danger" size="sm">Out</Badge>
          )}
          {isLowStock(value) && !isOutOfStock(value) && (
            <Badge variant="warning" size="sm">Low</Badge>
          )}
        </div>
      )
    },
    {
      key: "actions",
      title: "Actions",
      render: (_, row) => (
        <div className="flex items-center gap-1">
          {canManageStock && (
            <button
              onClick={() => handleStockManage(row)}
              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="Manage Stock"
            >
              <History className="w-4 h-4" />
            </button>
          )}
          {canManageProducts && (
            <button
              onClick={() => handleEdit(row)}
              className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => handleDelete(row)}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  // Category options
  const categoryOptions = productCategories.map((cat) => ({
    value: cat,
    label: cat
  }));

  // Unit options
  const unitOptions = [
    { value: "kg", label: "Kilogram (kg)" },
    { value: "liter", label: "Liter" },
    { value: "packet", label: "Packet" },
    { value: "bottle", label: "Bottle" },
    { value: "can", label: "Can" },
    { value: "piece", label: "Piece" }
  ];

  // Calculate stats
  const stats = {
    total: products.length,
    lowStock: products.filter((p) => isLowStock(p.stock) && !isOutOfStock(p.stock)).length,
    outOfStock: products.filter((p) => isOutOfStock(p.stock)).length,
    inStock: products.filter((p) => p.stock > 5).length
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Products
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your pesticide products inventory
          </p>
        </div>
        <div className="flex gap-2">
          <ModernButton variant="secondary" onClick={() => setIsScannerOpen(true)} icon={Barcode}>
            Scan
          </ModernButton>
          {canManageProducts && (
            <ModernButton variant="primary" onClick={handleAdd} icon={Plus}>
              Add Product
            </ModernButton>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md" className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
            <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
        </Card>
        <Card padding="md" className="flex items-center gap-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
            <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">In Stock</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.inStock}</p>
          </div>
        </Card>
        <Card padding="md" className="flex items-center gap-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Low Stock</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.lowStock}</p>
          </div>
        </Card>
        <Card padding="md" className="flex items-center gap-4">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
            <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Out of Stock</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.outOfStock}</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card padding="md">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, brand, barcode..."
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              placeholder="All Categories"
              options={[{ value: "", label: "All Categories" }, ...categoryOptions]}
              className="w-40"
            />
            <Select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              placeholder="Stock Status"
              options={[
                { value: "", label: "All Stock" },
                { value: "in", label: "In Stock" },
                { value: "low", label: "Low Stock" },
                { value: "out", label: "Out of Stock" }
              ]}
              className="w-40"
            />
            <ModernButton variant="secondary" onClick={handleExport} icon={Download}>
              Export
            </ModernButton>
          </div>
        </div>
      </Card>

      {/* Products Table */}
      <Card padding="none" className="overflow-hidden">
        <Table
          columns={columns}
          data={filteredProducts}
          emptyMessage="No products found. Add your first product to get started."
        />
      </Card>

      {/* Add/Edit Modal */}
      <ModernModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? "Edit Product" : "Add New Product"}
        subtitle={editingProduct ? "Update product details" : "Fill in the product information"}
        size="lg"
        icon={Package}
        footer={
          <div className="flex justify-end gap-3">
            <ModernButton variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </ModernButton>
            <ModernButton variant="primary" onClick={handleSubmit}>
              {editingProduct ? "Update Product" : "Add Product"}
            </ModernButton>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Product Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter product name"
            />
            <Select
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              options={categoryOptions}
              required
              placeholder="Select category"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              required
              placeholder="Enter brand name"
            />
            <Select
              label="Unit"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              options={unitOptions}
              required
              placeholder="Select unit"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Input
              label="Price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              required
              placeholder="0.00"
            />
            <Input
              label="Stock Quantity"
              name="stock"
              type="number"
              min="0"
              value={formData.stock}
              onChange={handleChange}
              required
              placeholder="0"
            />
            <Input
              label="Expiry Date"
              name="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={handleChange}
              required
            />
          </div>

          {/* Barcode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Barcode
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                placeholder="Enter or generate barcode"
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 font-mono"
              />
              <ModernButton type="button" variant="secondary" onClick={generateBarcode} icon={QrCode}>
                Generate
              </ModernButton>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white transition-colors duration-200"
              placeholder="Enter product description..."
            />
          </div>
        </form>
      </ModernModal>

      {/* Barcode Scanner */}
      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleBarcodeScan}
        products={products}
      />

      {/* Stock Management Modal */}
      <StockManagementModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        product={selectedProduct}
        stockHistory={stockHistory}
        onAddStock={actions.addStock}
        onRemoveStock={actions.removeStock}
        onAdjustStock={actions.adjustStock}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
        icon={Trash2}
      />
    </div>
  );
};

export default Products;
