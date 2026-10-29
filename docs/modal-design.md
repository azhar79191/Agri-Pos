# Shared modal design and audit

All application dialogs use `src/components/ui/Modal.jsx`. `ModernModal.jsx` re-exports this component so existing consumers receive the same design. `ConfirmModal` and `ConfirmToast` also use it.

The shell owns the backdrop, portal, width, responsive height, header, small tinted icon, close control, scrollable body, optional fixed footer, dark theme, reduced-motion animation, accessible naming, focus containment/restoration, Escape handling, and body scroll lock. Escape closes the topmost dialog. Pending confirmations disable dismissal. Button loading indicators retain their existing behavior.

## Migrated custom dialogs (21)

| Area | Dialogs |
| --- | --- |
| Authentication | Reset password; original three-step progress preserved |
| Header | Install app instructions; global search with existing keyboard shortcuts |
| Customer payments | Deposit cash / wallet top-up; collect payment; redeem loyalty points |
| POS | Quick-add customer; held sales; receipt with email, print, PDF and WhatsApp actions |
| Products | Barcode / price-label printer |
| Inventory | Add/edit bundle |
| Sales | Invoice preview; demo receipt |
| Team | Add/edit user; user permissions; add/edit sales representative; representative statistics with refresh |
| Platform administration | Shop users; approve/change plan; suspend shop |
| Global confirmation | ConfirmToast |

Existing shared consumers, including products, customers, stock, suppliers, supplier payments/ledger, purchasing, returns, credit payments, staff hub, role permissions, email invoices, and confirmation dialogs, inherit the same shell through Modal or ModernModal.

## Deliberate non-dialog overlays

The mobile navigation drawer, initial splash screen, and full-page setup wizard remain their own surfaces. Select dropdowns remain popovers above the dialog layer. None is a form modal.

## Usage

Use Modal with `isOpen`, `onClose`, `title`, optional `subtitle` and `icon`, `size`, and optional `footer`. Keep request handling, validation, form state and submission actions in the caller. Use `headerActions` for tools such as refresh; use `bodyClassName="app-modal__body--flush"` only for full-width content such as invoice previews. Avoid creating separate fixed overlays or duplicate modal headers. Receipt print content retains its `.receipt` class.
