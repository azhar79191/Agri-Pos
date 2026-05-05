/** Role display metadata — used in Sidebar, Header, UserManagement */
export const ROLES = {
  admin:   { label: "Administrator", color: "purple",  description: "Full access to all features" },
  manager: { label: "Manager",       color: "blue",    description: "Can manage products, stock, and view reports" },
  cashier: { label: "Cashier",       color: "emerald", description: "Can process sales and view customers" },
};

/** Role-based default permissions — mirrors backend getRolePermissions */
export const ROLE_PERMISSIONS = {
  admin: [
    "dashboard:view",
    "pos:view", "pos:process",
    "products:view", "products:create", "products:edit", "products:delete",
    "customers:view", "customers:create", "customers:edit", "customers:delete",
    "invoices:view", "invoices:create", "invoices:print", "invoices:edit",
    "reports:view", "reports:export",
    "stock:view", "stock:manage",
    "users:view", "users:create", "users:edit", "users:delete",
    "settings:view", "settings:edit",
  ],
  manager: [
    "dashboard:view",
    "pos:view", "pos:process",
    "products:view", "products:create", "products:edit",
    "customers:view", "customers:create", "customers:edit",
    "invoices:view", "invoices:create", "invoices:print", "invoices:edit",
    "reports:view", "reports:export",
    "stock:view", "stock:manage",
    "users:view",
    "settings:view",
  ],
  cashier: [
    "dashboard:view",
    "pos:view", "pos:process",
    "products:view",
    "customers:view", "customers:create",
    "invoices:view", "invoices:create", "invoices:print",
    "stock:view",
  ],
};

/**
 * Maps sidebar short-keys → backend namespaced permission keys.
 * Allows Sidebar menuItems to use short names like "pos" while
 * the backend uses "pos:view".
 */
export const PERMISSION_MAP = {
  dashboard: "dashboard:view",
  pos:       "pos:view",
  products:  "products:view",
  customers: "customers:view",
  invoices:  "invoices:view",
  reports:   "reports:view",
  stock:     "stock:view",
  users:     "users:view",
  settings:  "settings:view",
  shops:     "settings:view",
  status:    "dashboard:view",
};
