import React from 'react';
import Modal from './Modal';
import ModernButton from './ModernButton';

// Compatibility entry point: all dialogs use the same shell and design.
export default Modal;
export const ConfirmModal = ({
  isOpen, onClose, onConfirm, title = 'Confirm Action', message = 'Are you sure?',
  confirmText = 'Confirm', cancelText = 'Cancel', confirmVariant = 'danger', loading = false,
  icon: Icon = null, iconColor = 'red',
}) => (
  <Modal
          isOpen={isOpen}
          onClose={onClose}
          title={title}
          size="sm"
          icon={Icon}
          iconColor={iconColor}

          closeOnOverlayClick={!loading}
          closeOnEsc={!loading}
          showCloseButton={!loading}

          footer={<div className="flex justify-end gap-3">
      <ModernButton variant="secondary" onClick={onClose} disabled={loading}>{cancelText}</ModernButton>
      <ModernButton variant={confirmVariant} onClick={onConfirm} loading={loading}>{confirmText}</ModernButton>
    </div>}>
    <p className="text-sm leading-relaxed">{message}</p>
  </Modal>
);
