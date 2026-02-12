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
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={[
          "block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg",
          "focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
          "dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400",
          "transition-colors duration-200",
          inputClassName
        ].filter(Boolean).join(" ")}
      />
      {showClearButton && value && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
