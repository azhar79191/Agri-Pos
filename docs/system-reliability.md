# System reliability and priority UI pass

## P0: confirmed data and safe recovery

- Margin, profit, inventory, analytics, credit sales, invoice aging, purchase history and customer statements now expose failures and Retry actions. Failed or incomplete report responses do not render zero totals. The main Reports workspace waits for all required report sections and hides stale results while filters change. Late responses cannot replace a newer report filter.
- Financial/inventory recovery retains the original request body and recovery ID in durable, account/shop-scoped storage. Existing session records remain compatible. Recovery only replays recognized commands supported by the existing backend identifiers. Normal in-flight saves are excluded from the recovery UI.
- Recovery requires an explicit user action; reconnecting does not silently submit money or stock changes. Concurrent retries reuse the existing request and ID. Requests are not dispatched after an account switch. Terminal server validation failures are surfaced separately from successful recovery.
- Legacy callback-only entries and unreadable records remain manual-review items. They are never reconstructed as new transactions. New sales still require connectivity. Known recovery IDs cannot be discarded through the legacy reminder controls.
- Relevant report, product, customer, stock and workspace views refresh after successful recovery without clearing unrelated draft inputs.

## P1: access and forms

- Global search pages, shortcuts, keyboard navigation and recent history respect route permissions. Creation shortcuts additionally require their action permission. Role management remains owner-only. Recent history is partitioned by shop and account; unrecognized or unauthorized stored paths cannot be opened.
- Shared confirmation/notice dialogs replace JavaScript alert/confirm calls in archive, supplier-credit, return, role, logout and platform-admin actions. Cancelling never executes the change. Failed platform actions no longer disappear silently.
- A data-router navigation boundary protects registered full-page forms, including brand/shop/alert/notification settings, profile/password, roles, tags, stock adjustments, dealer/farmer records, seasonal budgets, payment schedules, registration and setup. Internal settings/workspace switches use the same guard. Pending saves block navigation; successful saves update the baseline. Browser reload/close uses the browser's required beforeunload prompt.

## P2: UI consistency

- Decorative header icons moved into the shared small-icon slot; action areas contain actions.
- Top-bar titles use paragraph text so the page has one primary heading.
- Report failures have a compact shared feedback panel. Recovery feedback sits above mobile navigation and supports both themes.
- Profit summary cards stack on small screens. Existing button loading indicators are unchanged.

## Validation

Unit coverage includes report failure/retry and late responses, incomplete report payloads, actual permission-filtered search, recovery across browser sessions and accounts, active-save/recovery separation, shared confirmation cancellation, and full-page navigation blocking. Browser fixtures exercise report failure/recovery and settings navigation alongside existing POS, stock, supplier, staff, theme, modal and mobile workflows. These checks use isolated fixtures; no live financial records are modified by the test suite.
