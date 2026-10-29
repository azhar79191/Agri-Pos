import React, { cloneElement, isValidElement, useId, useState } from 'react';
import CustomSelect from './CustomSelect';
import Input from './Input';

/** Associate an existing label, nested control and field messages without changing form handlers. */
export default function FormField({ label, error, helperText, children, className = '', ...props }) {
  const id = useId();
  const [validationMessage, setValidationMessage] = useState('');
  const fieldError = error || validationMessage;
  const labelId = `${id}-label`, messageIds = [];
  let first = true;
  let controlId = `${id}-control`;
  const connect = nodes => React.Children.map(nodes, child => {
    if (!isValidElement(child)) return child;
    const control = ['input', 'textarea', 'select'].includes(child.type) || child.type === CustomSelect || child.type === Input;
    if (control && first) {
      first = false;
      controlId = child.props.id || controlId;
      return cloneElement(child, {
        'aria-labelledby': child.props['aria-labelledby'] || (child.props['aria-label'] ? undefined : labelId),
        'aria-describedby': [child.props['aria-describedby'], fieldError || helperText ? `${id}-message` : null, ...messageIds].filter(Boolean).join(' ') || undefined,
        'aria-invalid': fieldError ? true : child.props['aria-invalid'],
        id: controlId,
        onInvalid: event => { child.props.onInvalid?.(event); setValidationMessage(event.target.validationMessage); },
        onChange: event => { setValidationMessage(''); child.props.onChange?.(event); },
      });
    }
    if (child.props.children) return cloneElement(child, {}, connect(child.props.children));
    return child;
  });
  // Existing inline field messages remain visible and become descriptions.
  let messageIndex = 0;
  const messages = nodes => React.Children.map(nodes, child => {
    if (!isValidElement(child)) return child;
    if (child.type === 'p') {
      const messageId = child.props.id || `${id}-description-${messageIndex++}`;
      messageIds.push(messageId);
      return cloneElement(child, { id: messageId });
    }
    return child.props.children ? cloneElement(child, {}, messages(child.props.children)) : child;
  });
  const content = messages(children);
  const controls = connect(content);
  return <div {...props} className={`form-field ${className}`}>
    <label id={labelId} htmlFor={controlId} className="form-field__label">{label}</label>
    {controls}
    {(fieldError || helperText) && <p id={`${id}-message`} role={fieldError ? 'alert' : undefined} className={fieldError ? 'form-field__error' : 'form-field__help'}>{fieldError || helperText}</p>}
  </div>;
}
