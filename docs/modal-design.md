# Shared modal design and audit

All application dialogs use `src/components/ui/Modal.jsx`. `ModernModal.jsx` re-exports this component so existing consumers receive the same design. `ConfirmModal` and `ConfirmToast` also use it.

The shell owns the backdrop, portal, width, responsive height, header, small tinted icon, close control, scrollable body, optional fixed footer, dark theme, reduced-motion animation, accessible naming, focus containment/restoration, Escape handling, and body scroll lock. Escape closes the topmost dialog. Pending confirmations disable dismissal. Button loading indicators retain their existing behavior.

## Migrated custom dialogs (21)

| Area | Dialogs |
| --- | --- |
| Authentication | Reset password; original three-step progress preserved |
| Header | Global search with existing keyboard shortcuts |
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

## Shared forms and workspace pages

`PageHeader.jsx` owns workspace page identity, a small tinted icon, descriptions and responsive action placement. Top navigation, marketing pages, the setup flow and printable invoice document headers retain their specialized structures. White workspace panels, controls and buttons use shared surface, border, spacing and brand tokens in `workspace.css`; warning and destructive colors remain semantic.

`FormField.jsx` associates a visible label with a nested native control or shared select. Existing inline hints become descriptions. Native field validation and explicit errors are connected with `aria-describedby` and `aria-invalid`. `Input.jsx` connects its helper/error text in the same way. Field IDs use React IDs so repeated rows do not produce duplicate IDs. Search, quantity and upload controls have explicit accessible names. Run `node scripts/audit-ui-fields.mjs` for the static control audit; browser checks verify representative rendered forms.

## Unsaved changes and pending actions

The shared modal observes editable controls. Cancel, close, Escape and backdrop dismissal show an inline discard choice after edits. Search/filter fields and asynchronous initial values do not count as edits; successful saves continue to close directly through their existing caller callbacks. Reverted text fields return to a clean state. Select choices are tracked through the shared select component. Add/remove-item and preset-value actions use `data-dirty-change`. Simple action presets conservatively mark the dialog edited until it closes.

Pass `busy` during submission to block dismissal, including a previously opened discard prompt. This also protects against reloading the page during the request. A dirty dialog warns before browser reload. Use `data-modal-dismiss` for a custom Cancel/Close button, `data-dirty-ignore` for a control that only filters a preview, `isDirty` for a form with its own precise change tracking, and `protectChanges={false}` for read-only or immediately saved controls.

The old gray skeleton CSS and unused skeleton primitive were removed. Named compatibility helpers in `Skeleton.jsx` now render the shared loading state. Button loading indicators are unchanged.
