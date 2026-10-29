import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import useDialogAccessibility from '../../hooks/useDialogAccessibility';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';
import useUnsavedDialog from '../../hooks/useUnsavedDialog';
import Button from './Button';

const sizes = { xs: 'max-w-sm', sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', '2xl': 'max-w-6xl', full: 'max-w-full' };

/** Shared dialog shell. Keep business logic and form state in the caller. */
export default function Modal({
  isOpen, onClose, title, subtitle, children, footer = null,
  size = 'md', showCloseButton = true, closeOnOverlayClick = true, closeOnEsc = true,
  icon: Icon, iconColor = 'brand', headerActions, ariaLabel = 'Dialog',
  className = '', bodyClassName = '', busy = false, isDirty, protectChanges = true, ...dialogProps
}) {
  useBodyScrollLock(isOpen);
  const { dialogRef, titleId } = useDialogAccessibility(isOpen);
  const descriptionId = useId();
  const keepEditingRef = useRef(null);
  const { dirty, confirmDiscard, setConfirmDiscard, requestClose } = useUnsavedDialog(isOpen, dialogRef, { isDirty, busy, protectChanges });
  const close = () => requestClose(onClose);

  useEffect(() => { if (confirmDiscard) keepEditingRef.current?.focus(); }, [confirmDiscard]);

  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;
    const handler = event => {
      const dialogs = document.querySelectorAll('[role="dialog"][aria-modal="true"]');
      if (event.key === 'Escape' && dialogs[dialogs.length - 1] === dialogRef.current) {
        event.preventDefault();
        event.stopPropagation();
        if (confirmDiscard) setConfirmDiscard(false);
        else requestClose(onClose);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, closeOnEsc, onClose, dialogRef, confirmDiscard, requestClose, setConfirmDiscard]);

  if (!isOpen) return null;
  return createPortal(
    <div className="app-modal" onClick={event => {
      if (event.target === event.currentTarget && closeOnOverlayClick) close();
    }}>
      <div {...dialogProps} ref={dialogRef} role="dialog" aria-modal="true"
        aria-labelledby={title ? titleId : undefined} aria-label={title ? undefined : ariaLabel}
        aria-describedby={subtitle ? descriptionId : undefined} aria-busy={busy || undefined} tabIndex={-1}
        onClickCapture={event => {
          if (event.target.closest('[role="dialog"]') === event.currentTarget && event.target.closest('[data-modal-dismiss]') && (dirty || busy)) {
            event.preventDefault(); event.stopPropagation(); close();
          }
        }}
        className={`app-modal__panel w-full ${sizes[size] || sizes.md} ${className}`}>
        {(title || showCloseButton) && <header className="app-modal__header">
          {Icon && <span className="app-modal__icon" data-tone={iconColor} aria-hidden="true"><Icon size={18} strokeWidth={1.75} /></span>}
          <div className="app-modal__heading">
            {title && <h3 id={titleId}>{title}</h3>}
            {subtitle && <p id={descriptionId}>{subtitle}</p>}
          </div>
          {headerActions}
          {showCloseButton && <button type="button" className="app-modal__close" aria-label="Close dialog" disabled={busy} onClick={close}><X size={17} /></button>}
        </header>}
        {confirmDiscard && <div className="app-modal__discard" role="group" aria-label="Unsaved changes">
          <div><p className="font-semibold">Discard unsaved changes?</p><p>Your edits will be lost if you close this form.</p></div>
          <div className="flex gap-2">
            <button ref={keepEditingRef} type="button" className="ui-button-secondary app-modal__keep" onClick={() => setConfirmDiscard(false)}>Keep editing</button>
            <Button variant="danger" size="sm" disabled={busy} onClick={() => { if (!busy) { setConfirmDiscard(false); onClose?.(); } }}>Discard changes</Button>
          </div>
        </div>}
        <div className={`app-modal__body modal-content-scroll ${bodyClassName}`}>{children}</div>
        {footer && <footer className="app-modal__footer">{footer}</footer>}
      </div>
    </div>, document.body
  );
}
