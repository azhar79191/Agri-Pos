import { useCallback, useEffect, useRef, useState } from 'react';

const fields = 'input:not([type="hidden"]):not([type="search"]), textarea, select:not([hidden]), [role="combobox"][data-form-value]';
const ignored = element => element.closest('[data-dirty-ignore]') || element.disabled || /^(search|filter)\b/i.test(element.getAttribute('placeholder') || '');
const valueOf = element => element.type === 'file' ? [...(element.files || [])].map(file => `${file.name}:${file.size}:${file.lastModified}`).join('|') : /^(checkbox|radio)$/.test(element.type) ? String(element.checked) : element.getAttribute('data-form-value') ?? element.value;

/** Observe user edits, not asynchronous initial data or search/filter controls. */
export default function useUnsavedDialog(isOpen, dialogRef, { isDirty, busy = false, protectChanges = true } = {}) {
  const [edited, setEdited] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const initial = useRef(new Map());
  const touched = useRef(false);
  const manualEdit = useRef(false);
  const dirty = protectChanges && (isDirty ?? edited);

  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    initial.current = new Map(); touched.current = false; manualEdit.current = false;
    setEdited(false); setConfirmDiscard(false);
    const collect = () => [...dialog.querySelectorAll(fields)].filter(element => !ignored(element));
    const remember = () => collect().forEach(element => {
      if (!touched.current || !initial.current.has(element)) initial.current.set(element, valueOf(element));
    });
    remember();
    const change = event => {
      if (!event.target.matches(fields) || ignored(event.target)) return;
      touched.current = true;
      const custom = event.type === 'workspace-field-change';
      if (custom && !initial.current.has(event.target)) initial.current.set(event.target, event.detail.previousValue);
      setEdited(manualEdit.current || [...initial.current.keys()].some(element => !dialog.contains(element)) || collect().some(element => initial.current.has(element) && initial.current.get(element) !== (custom && element === event.target ? event.detail.value : valueOf(element))));
    };
    const editAction = event => {
      if (!event.target.closest('[data-dirty-change]')) return;
      touched.current = true; manualEdit.current = true; setEdited(true);
    };
    const observer = new MutationObserver(remember);
    observer.observe(dialog, { childList:true, subtree:true, attributes:true, attributeFilter:['value', 'checked', 'data-form-value'] });
    dialog.addEventListener('input', change); dialog.addEventListener('change', change); dialog.addEventListener('workspace-field-change', change);
    dialog.addEventListener('click', editAction);
    return () => { observer.disconnect(); dialog.removeEventListener('input', change); dialog.removeEventListener('change', change); dialog.removeEventListener('workspace-field-change', change); dialog.removeEventListener('click', editAction); };
  }, [isOpen, dialogRef]);

  useEffect(() => {
    if (!isOpen || (!dirty && !busy)) return;
    const beforeUnload = event => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [isOpen, dirty, busy]);

  const requestClose = useCallback(onClose => {
    if (busy) return;
    if (dirty) setConfirmDiscard(true);
    else onClose?.();
  }, [busy, dirty]);
  return { dirty, confirmDiscard, setConfirmDiscard, requestClose };
}
