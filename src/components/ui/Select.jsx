import React, { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

const Select = forwardRef(({
  label, error, helperText, options = [], className = "",
  containerClassName = "", labelClassName = "",
  placeholder = "Select an option", ...props
}, ref) => {
  const base = "select-premium";
  const errorStyles = error ? "border-red-400 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500" : "";

  return (
    <div className={containerClassName}>
      {label && (
        <label className={`block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ${labelClassName}`}>
          {label}{props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={[base, errorStyles, "pr-10", className].filter(Boolean).join(" ")}
          {...props}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </div>
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>}
      {helperText && !error && <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>}
    </div>
  );
});

Select.displayName = "Select";
export default Select;
