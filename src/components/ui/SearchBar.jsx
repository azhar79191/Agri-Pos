import React from "react";
import { Search, X } from "lucide-react";

const SearchBar = ({ value, onChange, placeholder = "Search...", className = "", inputClassName = "", showClearButton = true, autoFocus = false }) => (
  <div className={`relative ${className}`}>
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
    <input
      type="text" value={value} onChange={onChange}
      placeholder={placeholder} autoFocus={autoFocus}
      className={[
        "block w-full pl-9 pr-9 py-2 border border-slate-200 dark:border-slate-600 rounded-lg",
        "bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500",
        "focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all duration-150 text-sm",
        inputClassName,
      ].filter(Boolean).join(" ")}
    />
    {showClearButton && value && (
      <button
        onClick={() => onChange({ target: { value: "" } })}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    )}
  </div>
);

export default SearchBar;
