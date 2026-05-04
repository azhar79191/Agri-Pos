export const users = [];

export const roles = {
  admin:   { label: "Administrator", color: "purple", description: "Full access to all features" },
  manager: { label: "Manager",       color: "blue",   description: "Can manage products, stock, and view reports" },
  cashier: { label: "Cashier",       color: "emerald",description: "Can process sales and view customers" },
};

// Role-based default permissions (mirrors backend getRolePermissions)
const rolePermissions = {
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
 * Map sidebar/page short-keys → backend permission keys.
 * This lets existing Sidebar menuItems keep their short permission names
 * while the backend uses namespaced keys like "pos:view".
 */
const PERMISSION_MAP = {
  dashboard:  "dashboard:view",
  pos:        "pos:view",
  products:   "products:view",
  customers:  "customers:view",
  invoices:   "invoices:view",
  reports:    "reports:view",
  stock:      "stock:view",
  users:      "users:view",
  settings:   "settings:view",
  shops:      "settings:view",
  status:     "dashboard:view",
};

/**
 * hasPermission — fully backend-driven.
 *
 * 1. Admin always has full access.
 * 2. If user.permissions array is set (from backend), use it.
 * 3. Otherwise fall back to role defaults.
 * 4. Maps old short-form keys (e.g. "pos") to backend keys (e.g. "pos:view").
 */
export const hasPermission = (user, permission) => {
  if (!user) return false;

  const rawRole = typeof user.role === "object" ? user.role?.name : user.role;
  const role = (rawRole || "").toLowerCase();

  // Admin always has full access — no permission check needed
  if (role === "admin") return true;

  // Resolve the effective permission key
  // If it's a short key like "pos", map it to "pos:view"
  const effectiveKey = PERMISSION_MAP[permission] || permission;

  // Use backend-stored permissions if available
  const stored = Array.isArray(user.permissions) && user.permissions.length > 0
    ? user.permissions
    : (rolePermissions[role] || []);

  // Check exact match OR prefix match (e.g. "pos" matches "pos:view", "pos:process")
  return stored.some(p =>
    p === effectiveKey ||
    p === permission ||
    p.startsWith(permission + ":") ||
    p.startsWith(effectiveKey + ":")
  );
};
