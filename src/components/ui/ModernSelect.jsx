import React from "react";
import { ChevronDown } from "lucide-react";

const ModernSelect = ({
  value, onChange, options = [],
  placeholder = "Select option...",
  className = "", disabled = false, size = "md"
}) => {
  const sizes = { sm: "px-3.5 py-2 text-sm", md: "px-4 py-2.5 text-sm", lg: "px-4 py-3 text-base" };

  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`select-premium pr-10 ${sizes[size]} ${className}`}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
  );
};

export default ModernSelect;
