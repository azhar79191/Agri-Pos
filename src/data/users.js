export const users = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@agrocare.pk",
    password: "admin123",
    role: "admin",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
    permissions: [
      "dashboard",
      "products",
      "customers",
      "pos",
      "invoices",
      "reports",
      "settings",
      "stock_management",
      "user_management",
      "delete_data"
    ]
  },
  {
    id: 2,
    name: "Manager User",
    email: "manager@agrocare.pk",
    password: "manager123",
    role: "manager",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=manager",
    permissions: [
      "dashboard",
      "products",
      "customers",
      "pos",
      "invoices",
      "reports",
      "stock_management"
    ]
  },
  {
    id: 3,
    name: "Cashier User",
    email: "cashier@agrocare.pk",
    password: "cashier123",
    role: "cashier",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=cashier",
    permissions: [
      "dashboard",
      "pos",
      "invoices",
      "customers_view"
    ]
  }
];

export const roles = {
  admin: {
    label: "Administrator",
    color: "purple",
    description: "Full access to all features"
  },
  manager: {
    label: "Manager",
    color: "blue",
    description: "Can manage products, stock, and view reports"
  },
  cashier: {
    label: "Cashier",
    color: "emerald",
    description: "Can process sales and view customers"
  }
};

export const hasPermission = (user, permission) => {
  if (!user) return false;
  return user.permissions.includes(permission);
};
