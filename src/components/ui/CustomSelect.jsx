import { Children, isValidElement, forwardRef, useEffect, useId, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';

const CustomSelect = forwardRef(function CustomSelect({
  label, error, helperText, options, children, onSearchChange, loading = false, value: controlledValue, defaultValue = '', onChange, placeholder = 'Select an option',
  disabled = false, required = false, name, id, className = '', containerClassName = '', labelClassName = '',
  'aria-label': ariaLabel, onBlur, onFocus,
}, ref) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = controlledValue ?? internalValue;
  const generated = useId();
  const fieldId = id || generated, listId = `${fieldId}-options`, helpId = `${fieldId}-help`;
  const trigger = useRef(null), panel = useRef(null), typeahead = useRef({ value: '', time: 0 });
  const [open, setOpen] = useState(false), [active, setActive] = useState(-1), [position, setPosition] = useState(null), [invalid, setInvalid] = useState(false), [search, setSearch] = useState('');
  useImperativeHandle(ref, () => trigger.current);
  const text = node => Children.toArray(node).map(child => isValidElement(child) ? text(child.props.children) : String(child)).join('');
  const fromChildren = nodes => Children.toArray(nodes).flatMap(child => !isValidElement(child) ? [] : child.type === 'option' ? [{ value: child.props.value ?? text(child.props.children), label: text(child.props.children), disabled: child.props.disabled }] : fromChildren(child.props.children));
  const normalized = (options || fromChildren(children)).map(option => ({ ...option, value: String(option.value) }));
  const visibleOptions = normalized.map((option, index) => ({ option, index })).filter(({ option }) => String(option.label).toLowerCase().includes(search.toLowerCase()));
  const selected = normalized.find(option => option.value === String(value ?? ''));
  const unavailable = () => disabled || trigger.current?.matches(':disabled');
  const enabled = visibleOptions.filter(({ option }) => !option.disabled).map(({ index }) => index);
  const close = (focus = false) => { setOpen(false); setSearch(''); if (focus) trigger.current?.focus(); };
  const show = (last = false) => {
    if (unavailable()) return;
    setSearch(''); onSearchChange?.('');
    const current = normalized.findIndex(option => option.value === String(value ?? '') && !option.disabled);
    setActive(current >= 0 ? current : last ? enabled.at(-1) ?? -1 : enabled[0] ?? -1);
    setOpen(true);
  };
  const choose = index => {
    const option = normalized[index];
    if (!option || option.disabled || unavailable()) return;
    setInternalValue(option.value);
    onChange?.({ target: { value: option.value, name }, currentTarget: { value: option.value, name } });
    setInvalid(false); close(true);
  };
  const keyDown = event => {
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      if (!open) { show(event.key === 'End' || event.key === 'ArrowUp'); return; }
      const offset = event.key === 'ArrowUp' ? -1 : 1;
      const current = enabled.indexOf(active);
      setActive(event.key === 'Home' ? enabled[0] ?? -1 : event.key === 'End' ? enabled.at(-1) ?? -1 : enabled[(current + offset + enabled.length) % enabled.length] ?? -1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault(); if (open) choose(active); else show();
    } else if (event.key === 'Escape' && open) { event.preventDefault(); event.stopPropagation(); close(true); }
    else if (event.key === 'Tab') close();
    else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const now = Date.now(), previous = typeahead.current;
      const query = `${now - previous.time < 700 ? previous.value : ''}${event.key}`.toLowerCase();
      typeahead.current = { value: query, time: now };
      const match = normalized.findIndex(option => !option.disabled && String(option.label).toLowerCase().startsWith(query));
      if (match >= 0) { if (!open) show(); setActive(match); }
    }
  };
  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const bounds = trigger.current?.getBoundingClientRect();
      if (!bounds) return;
      const below = window.innerHeight - bounds.bottom - 12, above = bounds.top - 12;
        const height = Math.min(320, Math.max(100, below >= 160 || below >= above ? below : above));
      const width = Math.min(Math.max(bounds.width, 180), window.innerWidth - 24);
      setPosition({ position: 'fixed', width, maxHeight: height, left: Math.max(12, Math.min(bounds.left, window.innerWidth - width - 12)), ...(below >= 160 || below >= above ? { top: bounds.bottom + 6 } : { bottom: window.innerHeight - bounds.top + 6 }) });
    };
    update(); window.addEventListener('resize', update); window.addEventListener('scroll', update, true);
    return () => { window.removeEventListener('resize', update); window.removeEventListener('scroll', update, true); };
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const outside = event => { if (!trigger.current?.contains(event.target) && !panel.current?.contains(event.target)) setOpen(false); };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);
  useEffect(() => { if (open) panel.current?.querySelector('[data-active="true"]')?.scrollIntoView?.({ block: 'nearest' }); }, [active, open]);
  const layoutClasses = className.split(/\s+/).filter(token => /(^|:)(col-span-|row-span-|flex-1$|w-|min-w-|max-w-|self-|order-)/.test(token)).join(' ');
  return <div className={`min-w-0 ${layoutClasses} ${containerClassName}`}>
    {label && <label htmlFor={fieldId} className={`mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300 ${labelClassName}`}>{label}{required && <span className="ml-1 text-red-500">*</span>}</label>}
    <button ref={trigger} id={fieldId} type="button" role="combobox" aria-label={ariaLabel} aria-expanded={open} aria-controls={listId} aria-haspopup="listbox" aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined} aria-required={required || undefined} aria-invalid={!!error || invalid || undefined} aria-describedby={error || helperText || invalid ? helpId : undefined} disabled={disabled} onClick={() => open ? close() : show()} onKeyDown={keyDown} onBlur={onBlur} onFocus={onFocus}
      className={`custom-select-trigger flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border bg-white px-3 py-2 text-left text-sm text-slate-900 dark:bg-slate-800 dark:text-white ${error || invalid ? 'border-red-400' : 'border-slate-300 dark:border-slate-600'} disabled:cursor-not-allowed disabled:opacity-50 ${className}`}>
      <span className={`min-w-0 truncate ${!selected ? 'text-slate-500 dark:text-slate-400' : ''}`}>{selected?.label ?? placeholder}</span><ChevronDown aria-hidden="true" className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
    {/* Native form participation only; the visible popup is entirely custom. */}
    <select hidden aria-hidden="true" tabIndex={-1} name={name} value={value ?? ''} disabled={disabled} required={required} onChange={() => {}} onInvalid={event => { event.preventDefault(); setInvalid(true); trigger.current?.focus(); }}><option value="" />{normalized.map(option => <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>)}</select>
    {(error || helperText || invalid) && <p id={helpId} className={`mt-1.5 text-xs ${error || invalid ? 'text-red-600 dark:text-red-300' : 'text-slate-500 dark:text-slate-400'}`}>{error || (invalid ? 'Choose an option.' : helperText)}</p>}
    {open && position && createPortal(<div ref={panel} className="custom-select-menu overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 text-sm shadow-xl dark:border-slate-600 dark:bg-slate-900" style={{ ...position, zIndex: 12000 }}>
      <label className="sr-only" htmlFor={`${fieldId}-search`}>Search options</label>
      <input id={`${fieldId}-search`} type="search" value={search} onChange={event => { setSearch(event.target.value); onSearchChange?.(event.target.value); setActive(-1); }} onKeyDown={event => { if (["ArrowDown", "ArrowUp", "Enter", "Escape", "Tab"].includes(event.key)) keyDown(event); }} placeholder="Search options..." className="mb-1.5 min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[var(--pos-primary)] dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
      <div id={listId} role="listbox" aria-label={ariaLabel || label || placeholder} className="max-h-[240px] overflow-y-auto overscroll-contain">
      {loading && <p role="status" className="p-3 text-slate-500">Searching…</p>}
      {!loading && visibleOptions.length === 0 && <p className="p-3 text-slate-500 dark:text-slate-400">{normalized.length === 0 ? 'No options available' : 'No matching options'}</p>}
      {visibleOptions.map(({ option, index }) => <div key={option.value} id={`${listId}-${index}`} role="option" data-value={option.value} aria-selected={option.value === String(value ?? '')} aria-disabled={!!option.disabled} data-active={index === active} onPointerMove={() => !option.disabled && setActive(index)} onPointerDown={event => event.preventDefault()} onClick={() => choose(index)}
        className={`custom-select-option flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 ${option.disabled ? 'cursor-not-allowed opacity-40' : ''}`}>
        <span className="min-w-0 break-words">{option.label}</span>{option.value === String(value ?? '') && <Check aria-hidden="true" className="h-4 w-4 shrink-0" />}
      </div>)}
      </div>
    </div>, document.body)}
  </div>;
});
export default CustomSelect;
