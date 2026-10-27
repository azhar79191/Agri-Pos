import React from "react";
import FilterBar from "../ui/FilterBar";
const ProductFilters = ({ searchTerm, onSearchChange, filterCategory, onCategoryChange, categoryOptions }) => <FilterBar
  filters={[{ type: 'search', key: 'search', label: 'Search products', placeholder: 'Search by name, SKU, or barcode...' }, { type: 'select', key: 'category', label: 'Product category', placeholder: 'All categories', options: categoryOptions }]}
  values={{ search: searchTerm, category: filterCategory }}
  onChange={(key, value) => (key === 'search' ? onSearchChange : onCategoryChange)({ target: { value } })}
  onClear={() => { onSearchChange({ target: { value: '' } }); onCategoryChange({ target: { value: '' } }); }}
/>;
export default React.memo(ProductFilters);
