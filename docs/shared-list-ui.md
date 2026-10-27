# Shared list UI

Use `FilterBar` for list controls. Prefer its `filters`, `values`, `onChange`,
`onClear` and `total` props. Existing custom controls can be passed as children;
keep their state and API filtering in the page. Date range controls can live in
that same bar. Fields need descriptive accessible labels.

Use `DataTable` with normal `thead`, `tbody` and optional `tfoot` children.
Headers become keyboard-accessible sort buttons. Actions, selection columns,
and headers with `data-sortable={false}` stay static. Totals stay in place.
Provide `data-sort-value` on formatted numeric/date cells. Reusable row
components supply `sortValues` in column order. Sorting is stable, keeps missing
values last, and never mutates the source records. It sorts the supplied rows;
use `sortScope="Sorting applies to this page"` for paginated data. Use
`sortable={false}` for editable line items and preserve printed document order.
`Table` and `SDPTable` use this same primitive; column definitions can provide a
`sortValue(row)` accessor.

`DataTable` renders `EmptyState` when its body has no rows. Set `emptyState={false}`
when a page already handles loading/error/empty feedback outside the table.
Use `searchable` for a local search of supplied table rows, not a full-dataset API
search. `EmptyState` supports contextual titles, descriptions, icons, creation
actions and clearing filters. `ListFeedback` delegates its empty mode to it;
loading errors remain distinct and retryable.

Navigation labels, icons and permissions are defined in `MENU_GROUPS` for both
desktop and mobile. The desktop sidebar keeps one section open and reveals the
current route. Motion respects `prefers-reduced-motion`.
