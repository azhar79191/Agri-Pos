import React from "react";
import { Search, X } from "lucide-react";

const SearchBar = ({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
  inputClassName = "",
  showClearButton = true,
  autoFocus = false
}) => {
  const handleClear = () => {
    onChange({ target: { value: "" } });
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-emerald-500" />
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={[
          "block w-full pl-11 pr-10 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800",
          "focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500",
          "dark:text-white dark:placeholder-gray-400",
          "transition-all duration-200 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600",
          "text-sm font-medium",
          inputClassName
        ].filter(Boolean).join(" ")}
      />
      {showClearButton && value && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          title="Clear search"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
