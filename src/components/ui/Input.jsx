import React, { forwardRef } from "react";

const Input = forwardRef(({
  label, error, helperText, className = "", containerClassName = "",
  labelClassName = "", leftIcon: LeftIcon = null, rightIcon: RightIcon = null,
  type = "text", ...props
}, ref) => {
  const base = "input-premium";
  const errorStyles = error ? "border-red-400 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500" : "";
  const iconPadding = LeftIcon ? "pl-10" : "px-4";
  const rightIconPadding = RightIcon ? "pr-10" : "";

  return (
    <div className={containerClassName}>
      {label && (
        <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ${labelClassName}`}>
          {label}{props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {LeftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <LeftIcon className="h-4 w-4 text-gray-400" />
          </div>
        )}
        <input
          ref={ref} type={type}
          className={[base, errorStyles, iconPadding, rightIconPadding, className].filter(Boolean).join(" ")}
          {...props}
        />
        {RightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
            <RightIcon className="h-4 w-4 text-gray-400" />
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>}
      {helperText && !error && <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{helperText}</p>}
    </div>
  );
});

Input.displayName = "Input";
export default Input;
