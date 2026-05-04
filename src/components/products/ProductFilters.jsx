import React from "react";
import { Search, ChevronDown } from "lucide-react";

const ProductFilters = ({ searchTerm, onSearchChange, filterCategory, onCategoryChange, categoryOptions }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Search products by name..."
          className="input-premium w-full pl-10"
        />
      </div>
      <div className="relative">
        <select
          value={filterCategory}
          onChange={onCategoryChange}
          className="select-premium pr-9"
        >
          <option value="">All Categories</option>
          {categoryOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
};

export default React.memo(ProductFilters);
