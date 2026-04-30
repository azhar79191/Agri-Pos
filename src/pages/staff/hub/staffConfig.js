import { Users, UserCheck, Shield, FileText, BarChart3 } from "lucide-react";

export const STAFF_NAV = [
  {
    group: "People",
    items: [
      { id: "users",    label: "Team Members",      icon: Users,     desc: "Manage user accounts" },
      { id: "reps",     label: "Sales Reps",        icon: UserCheck, desc: "Commission & territory" },
    ],
  },
  {
    group: "Security",
    items: [
      { id: "perms",    label: "Permissions",       icon: Shield,    desc: "Role-based access control" },
      { id: "audit",    label: "Audit Logs",        icon: FileText,  desc: "System activity trail" },
    ],
  },
  {
    group: "Analytics",
    items: [
      { id: "overview", label: "Staff Overview",    icon: BarChart3, desc: "Team performance summary" },
    ],
  },
];

export const ROLE_CFG = {
  admin:   { label: "Administrator", cls: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",    grad: "from-purple-500 to-violet-600",  dot: "bg-purple-500" },
  manager: { label: "Manager",       cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",            grad: "from-blue-500 to-indigo-600",    dot: "bg-blue-500" },
  cashier: { label: "Cashier",       cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400", grad: "from-emerald-500 to-teal-600",   dot: "bg-emerald-500" },
};

export const ALL_PERMISSIONS = [
  { key: "dashboard:view",   label: "Dashboard",        group: "Core" },
  { key: "pos:view",         label: "POS View",         group: "Core" },
  { key: "pos:process",      label: "POS Process",      group: "Core" },
  { key: "products:view",    label: "Products View",    group: "Products" },
  { key: "products:create",  label: "Products Create",  group: "Products" },
  { key: "products:edit",    label: "Products Edit",    group: "Products" },
  { key: "products:delete",  label: "Products Delete",  group: "Products" },
  { key: "customers:view",   label: "Customers View",   group: "Customers" },
  { key: "customers:create", label: "Customers Create", group: "Customers" },
  { key: "customers:edit",   label: "Customers Edit",   group: "Customers" },
  { key: "customers:delete", label: "Customers Delete", group: "Customers" },
  { key: "invoices:view",    label: "Invoices View",    group: "Sales" },
  { key: "invoices:create",  label: "Invoices Create",  group: "Sales" },
  { key: "invoices:print",   label: "Invoices Print",   group: "Sales" },
  { key: "reports:view",     label: "Reports View",     group: "Reports" },
  { key: "reports:export",   label: "Reports Export",   group: "Reports" },
  { key: "stock:view",       label: "Stock View",       group: "Inventory" },
  { key: "stock:manage",     label: "Stock Manage",     group: "Inventory" },
  { key: "users:view",       label: "Users View",       group: "Admin" },
  { key: "users:create",     label: "Users Create",     group: "Admin" },
  { key: "users:edit",       label: "Users Edit",       group: "Admin" },
  { key: "users:delete",     label: "Users Delete",     group: "Admin" },
  { key: "settings:view",    label: "Settings View",    group: "Admin" },
  { key: "settings:edit",    label: "Settings Edit",    group: "Admin" },
];

export const PERM_KEYS = ALL_PERMISSIONS.map(p => p.key);
export const BASIC_PERMS = ["dashboard:view", "pos:view", "pos:process"];

export const inp = "w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all outline-none";
