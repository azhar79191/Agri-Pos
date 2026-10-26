# Agri-POS frontend

React/Vite application for the Agri-POS backend. Use Node 22.12 or newer.

```sh
npm ci
npm run dev
npm run lint -- --quiet
npm test
npm run build
```

Set `VITE_API_BASE_URL=http://localhost:5000/api` in an untracked `.env.local`. Configure the backend `CLIENT_URL` to match the frontend origin. Use both updated repositories together, particularly for receiving and checkout recovery.

The test suite checks rejected/offline checkout, backend totals, recovery after a remount, payment retry identifiers, and account isolation for pending commands. Lint now includes JavaScript/JSX instead of referencing an absent TypeScript plugin and ignoring application files. Existing advisory lint warnings remain; correctness errors are enforced.

## Browser verification

```sh
npm run test:browser
```

This starts local Vite on port 5179 and uses synthetic API fixtures. It does not connect to a live application database. Install Playwright Chromium with `npx playwright install chromium`, or set `BROWSER_PATH` to an installed Chrome/Edge executable. The script saves ignored desktop/mobile screenshots under `artifacts/` and verifies category search, rejected checkout/cart retention, narrow layout, and disabled offline confirmation.

## Current user-facing improvements

- Category filters are connected to server search, with catalog pagination and exact barcode lookup across the catalog.
- Checkout errors retain the cart; ambiguous sales have an explicit recovery action. An offline sale is never described as completed.
- Payment actions distinguish cash, credit, and pending transfers.
- Receiving uses stable PO-line IDs, remaining quantities, and recovery identifiers.
- Customer statements include balance movements. Profile forms direct users to deposits/payments for wallet changes.
- Historical unknown costs are explicit in profit/margin reports.
- Batch API errors no longer display mock stock. Forecast failures show a retry state.
- Shared dialogs have dialog semantics, focus trapping/restoration, and named close buttons.
- Carts, held sales, and recent products are scoped to the account/shop; globally persisted server-data caches have been retired.

Full offline sales, server-managed bundles, cashier shifts, batch allocation, localization, and broader navigation/design consolidation remain in the roadmap. Bundle checkout is temporarily unavailable while its pricing is made authoritative on the backend.

See the shared workspace `IMPLEMENTATION_PROGRESS.md` and backend `IMPLEMENTATION.md` for release requirements and remaining work.


## Stock and supplier workflows

Stock adjustments and product/return mutations retain a recovery identifier. An unresolved request appears on the relevant page; **Recover original change** replays its frozen details rather than guessing a new operation. Bulk changes now succeed together or fail together.

Counted stock supports zero. Refresh the stock list and review changed counts before retrying a conflict. Product edits do not resubmit unchanged stock. Inventory changes require stock-management permission.

New receiving increases the supplier amount owed after applying existing credit. The Suppliers page records payments already made, displays supplier credit, and opens paginated movement history. Recording a payment does not send money through a bank. Supplier returns preserve the payable offset and excess credit separately.

Browser smoke now also exercises failed zero-count recovery, supplier payment entry, mobile supplier history, keyboard focus trapping, and Escape dismissal. Additional screenshots are saved under `artifacts/`.


### Farmer workspace

Customers > Farmer Workspace (`/customers/workspace`) provides crop-season recording and a shared follow-up inbox. Existing customer search links records to accounts. Crop profiles require explicit area units and farmer consent; preferred language is stored, but UI translation is not yet delivered. Follow-ups support notes, rescheduling, complete/reopen and customer statement links; task completion does not record a payment or send a message. New writes use stable recovery IDs and appear in the pending operation panel if confirmation is uncertain.

Readers need customers:view; forms require customers:edit. Staff assignment, profile editing/withdrawal/export and a unified farmer timeline remain pending. Browser smoke covers crop-season creation, follow-up creation/rescheduling/completion and mobile width. Screenshots are saved under artifacts/farmer-workspace-mobile.png and artifacts/farmer-workspace-desktop.png.


### Branding and action emails

Settings > Branding & Emails stores a shop identity, accent and confirmation footer with a live visual preview and recent delivery status. Public login/landing names use VITE_BRAND_NAME and VITE_BRAND_TAGLINE at build time. Action confirmations are opt-in for the signed-in staff account, with provider/worker setup documented in ../agri-pos-backend/EMAIL_AND_BRANDING_SETUP.md. Saving branding does not send a test email. Some legacy components and document assets still need theme migration.
