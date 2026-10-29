import React, { forwardRef, useId } from "react";

const Input = forwardRef(({
  label, error, helperText, className = "", containerClassName = "",
  labelClassName = "", leftIcon: LeftIcon = null, rightIcon: RightIcon = null,
  type = "text", ...props
}, ref) => {
  const generatedId = useId();
  const fieldId = props.id || generatedId;
  const messageId = `${fieldId}-message`;
  const base = "input-premium";
  const errorStyles = error ? "border-red-400 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500" : "";
  const iconPadding = LeftIcon ? "pl-10" : "px-4";
  const rightIconPadding = RightIcon ? "pr-10" : "";

  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={fieldId} className={`block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ${labelClassName}`}>
          {label}{props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {LeftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <LeftIcon className="h-4 w-4 text-slate-400" />
          </div>
        )}
        <input
          id={fieldId}
          ref={ref} type={type}
          className={[base, errorStyles, iconPadding, rightIconPadding, className].filter(Boolean).join(" ")}
          {...props}
          aria-invalid={error || props['aria-invalid'] ? true : undefined}
          aria-describedby={[props['aria-describedby'], error || helperText ? messageId : null].filter(Boolean).join(' ') || undefined}
        />
        {RightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
            <RightIcon className="h-4 w-4 text-slate-400" />
          </div>
        )}
      </div>
      {error && <p id={messageId} role="alert" className="form-field__error">{error}</p>}
      {helperText && !error && <p id={messageId} className="form-field__help">{helperText}</p>}
    </div>
  );
});

Input.displayName = "Input";
export default Input;
