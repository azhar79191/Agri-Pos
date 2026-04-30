import React, { useState, useEffect } from "react";
import { Search, Filter, X, Calendar, Package, Users, Receipt } from "lucide-react";
import { useApp } from "../context/AppContext";

const AdvancedSearch = ({ onResults, placeholder = "Search..." }) => {
  const { state } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [searchType, setSearchType] = useState("products");
  const [filters, setFilters] = useState({
    category: "",
    brand: "",
    priceRange: { min: "", max: "" },
    stockLevel: "",
    dateRange: { start: "", end: "" }
  });

  const searchTypes = [
    { id: "products", label: "Products", icon: Package },
    { id: "customers", label: "Customers", icon: Users },
    { id: "transactions", label: "Transactions", icon: Receipt }
  ];

  const performSearch = () => {
    let results = [];
    
    switch (searchType) {
      case "products":
        results = state.products.filter(product => {
          const matchesSearch = !searchTerm || 
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.barcode.includes(searchTerm) ||
            product.brand.toLowerCase().includes(searchTerm.toLowerCase());
          
          const matchesCategory = !filters.category || product.category === filters.category;
          const matchesBrand = !filters.brand || product.brand === filters.brand;
          const matchesPrice = (!filters.priceRange.min || product.price >= parseFloat(filters.priceRange.min)) &&
                              (!filters.priceRange.max || product.price <= parseFloat(filters.priceRange.max));
          
          let matchesStock = true;
          if (filters.stockLevel === "low") matchesStock = product.stock <= state.settings.lowStockThreshold;
          else if (filters.stockLevel === "out") matchesStock = product.stock === 0;
          else if (filters.stockLevel === "available") matchesStock = product.stock > 0;
          
          return matchesSearch && matchesCategory && matchesBrand && matchesPrice && matchesStock;
        });
        break;
        
      case "customers":
        results = state.customers.filter(customer => {
          return !searchTerm || 
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone.includes(searchTerm);
        });
        break;
        
      case "transactions":
        results = state.transactions.filter(transaction => {
          const matchesSearch = !searchTerm || 
            transaction.id.toString().includes(searchTerm) ||
            transaction.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
          
          const matchesDateRange = (!filters.dateRange.start || new Date(transaction.date) >= new Date(filters.dateRange.start)) &&
                                  (!filters.dateRange.end || new Date(transaction.date) <= new Date(filters.dateRange.end));
          
          return matchesSearch && matchesDateRange;
        });
        break;
    }
    
    onResults?.(results, searchType);
  };

  useEffect(() => {
    performSearch();
  }, [searchTerm, searchType, filters]);

  const clearFilters = () => {
    setFilters({
      category: "",
      brand: "",
      priceRange: { min: "", max: "" },
      stockLevel: "",
      dateRange: { start: "", end: "" }
    });
  };

  const getUniqueValues = (array, key) => {
    return [...new Set(array.map(item => item[key]))].filter(Boolean);
  };

  return (
    <div className="relative">
      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        
        {/* Search Type Selector */}
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-700 dark:text-gray-300 font-medium shadow-sm hover:shadow-md cursor-pointer"
        >
          {searchTypes.map(type => (
            <option key={type.id} value={type.id}>{type.label}</option>
          ))}
        </select>
        
        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2.5 rounded-lg border transition-all ${
            showFilters 
              ? "bg-blue-600 text-white border-blue-600" 
              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900 dark:text-white">Filters</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {searchType === "products" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {getUniqueValues(state.products, "category").map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Brand</label>
                <select
                  value={filters.brand}
                  onChange={(e) => setFilters(prev => ({ ...prev, brand: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
                >
                  <option value="">All Brands</option>
                  {getUniqueValues(state.products, "brand").map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Stock Level</label>
                <select
                  value={filters.stockLevel}
                  onChange={(e) => setFilters(prev => ({ ...prev, stockLevel: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
                >
                  <option value="">All Stock</option>
                  <option value="available">In Stock</option>
                  <option value="low">Low Stock</option>
                  <option value="out">Out of Stock</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Price Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange.min}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      priceRange: { ...prev.priceRange, min: e.target.value }
                    }))}
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 shadow-sm hover:shadow-md"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange.max}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      priceRange: { ...prev.priceRange, max: e.target.value }
                    }))}
                    className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  />
                </div>
              </div>
            </div>
          )}

          {searchType === "transactions" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    dateRange: { ...prev.dateRange, start: e.target.value }
                  }))}
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    dateRange: { ...prev.dateRange, end: e.target.value }
                  }))}
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;