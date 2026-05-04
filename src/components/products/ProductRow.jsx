import React from "react";
import { Edit2, Trash2, Leaf } from "lucide-react";
import { formatCurrency } from "../../utils/helpers";

const categoryColors = {
  Herbicides: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  Insecticides: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  Fungicides: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
  Fertilizers: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  Seeds: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  Other: "bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
};

const ProductRow = ({ product, onEdit, onDelete, currency }) => {
  const stockStatus = product.stock <= 0 ? "out" : product.stock <= (product.minStockLevel || 5) ? "low" : "good";

  return (
    <tr className="group hover:bg-blue-50/40 dark:hover:bg-blue-900/5 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/15 flex items-center justify-center flex-shrink-0">
            <Leaf className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white text-sm">{product.name}</p>
            <p className="text-xs text-slate-400 font-mono">{product.sku}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${categoryColors[product.category] || categoryColors.Other}`}>
          {product.category}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
        {product.manufacturer || <span className="text-slate-300 dark:text-slate-600">—</span>}
      </td>
      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{product.unit}</td>
      <td className="px-4 py-3">
        <span className="font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(product.price, currency)}</span>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
          stockStatus === "out" ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400" :
          stockStatus === "low" ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" :
          "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${stockStatus === "out" ? "bg-red-500" : stockStatus === "low" ? "bg-amber-500" : "bg-emerald-500"}`} />
          {product.stock} {product.unit}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/15 transition-colors"
            onClick={() => onEdit(product)}
          >
            <Edit2 size={15} />
          </button>
          <button 
            className="p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/15 transition-colors" 
            onClick={() => onDelete(product)}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default React.memo(ProductRow);
