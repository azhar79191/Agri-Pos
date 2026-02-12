import React from "react";
import { ChevronDown } from "lucide-react";

const ModernSelect = ({ 
  value, 
  onChange, 
  options = [], 
  placeholder = "Select option...",
  className = "",
  disabled = false,
  size = "md"
}) => {
  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-4 py-3 text-base"
  };

  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`
          w-full appearance-none bg-white dark:bg-gray-800 
          border border-gray-200 dark:border-gray-700 
          rounded-xl text-gray-700 dark:text-gray-300
          focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 
          outline-none transition-all duration-200 
          shadow-sm hover:shadow-md cursor-pointer
          disabled:opacity-50 disabled:cursor-not-allowed
          ${sizeClasses[size]}
          ${className}
        `}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  );
};

export default ModernSelect;