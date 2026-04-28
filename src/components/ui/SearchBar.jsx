import React from "react";
import { Search, X } from "lucide-react";

const SearchBar = ({ value, onChange, placeholder = "Search...", className = "", inputClassName = "", showClearButton = true, autoFocus = false }) => (
  <div className={`relative ${className}`}>
    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500 pointer-events-none" />
    <input
      type="text" value={value} onChange={onChange}
      placeholder={placeholder} autoFocus={autoFocus}
      className={[
        "block w-full pl-10 pr-9 py-2.5 border border-slate-200 dark:border-emerald-900/30 rounded-xl",
        "bg-white dark:bg-[#0d1f14] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-emerald-800/60",
        "focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm",
        inputClassName,
      ].filter(Boolean).join(" ")}
    />
    {showClearButton && value && (
      <button
        onClick={() => onChange({ target: { value: "" } })}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    )}
  </div>
);

export default SearchBar;
