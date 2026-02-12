import React, { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

const Select = forwardRef(({
  label,
  error,
  helperText,
  options = [],
  className = "",
  containerClassName = "",
  labelClassName = "",
  placeholder = "Select an option",
  ...props
}, ref) => {
  const baseStyles = "block w-full rounded-xl border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-white transition-all duration-200 appearance-none px-4 py-2.5 bg-white text-gray-700 dark:text-gray-300";
  
  const errorStyles = error
    ? "border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500"
    : "";

  return (
    <div className={`${containerClassName}`}>
      {label && (
        <label
          className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${labelClassName}`}
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={[
            baseStyles,
            errorStyles,
            "pr-10",
            className
          ].filter(Boolean).join(" ")}
          {...props}
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
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <ChevronDown className="h-5 w-5 text-gray-400" />
        </div>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
});

Select.displayName = "Select";

export default Select;
