export const AVAILABLE_PERMISSIONS = [
  { key: "dashboard:view",   label: "Dashboard",        description: "View main dashboard" },
  { key: "pos:view",         label: "POS View",         description: "Access POS screen" },
  { key: "pos:process",      label: "POS Process",      description: "Process sales" },
  { key: "products:view",    label: "Products View",    description: "View products" },
  { key: "products:create",  label: "Products Create",  description: "Add new products" },
  { key: "products:edit",    label: "Products Edit",    description: "Edit products" },
  { key: "products:delete",  label: "Products Delete",  description: "Delete products" },
  { key: "customers:view",   label: "Customers View",   description: "View customers" },
  { key: "customers:create", label: "Customers Create", description: "Add customers" },
  { key: "customers:edit",   label: "Customers Edit",   description: "Edit customers" },
  { key: "customers:delete", label: "Customers Delete", description: "Delete customers" },
  { key: "invoices:view",    label: "Invoices View",    description: "View invoices" },
  { key: "invoices:create",  label: "Invoices Create",  description: "Create invoices" },
  { key: "invoices:print",   label: "Invoices Print",   description: "Print invoices" },
  { key: "reports:view",     label: "Reports View",     description: "View reports" },
  { key: "reports:export",   label: "Reports Export",   description: "Export reports" },
  { key: "stock:view",       label: "Stock View",       description: "View stock levels" },
  { key: "stock:manage",     label: "Stock Manage",     description: "Adjust stock" },
  { key: "users:view",       label: "Users View",       description: "View users" },
  { key: "users:create",     label: "Users Create",     description: "Add users" },
  { key: "users:edit",       label: "Users Edit",       description: "Edit users" },
  { key: "users:delete",     label: "Users Delete",     description: "Delete users" },
  { key: "settings:view",    label: "Settings View",    description: "View settings" },
  { key: "settings:edit",    label: "Settings Edit",    description: "Edit settings" },
];

export const ALL_PERMISSION_KEYS = AVAILABLE_PERMISSIONS.map((p) => p.key);

export const USER_ROLE_CONFIG = {
  admin:   { label: "Administrator", cls: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",  gradient: "from-purple-500 to-violet-600" },
  manager: { label: "Manager",       cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",          gradient: "from-blue-500 to-indigo-600" },
  cashier: { label: "Cashier",       cls: "bg-emerald-100 text-emerald-700 dark:bg-blue-900/20 dark:text-emerald-400", gradient: "from-blue-600 to-blue-700" },
};

export const EMPTY_USER_FORM = { name: "", email: "", password: "", role: "cashier", phone: "" };
