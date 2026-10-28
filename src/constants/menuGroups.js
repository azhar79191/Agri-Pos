import {
  LayoutDashboard, Package, Users, ShoppingCart, FileText,
  BarChart3, Settings, Building2, Layers, Bug,
  Calendar, Zap, PackagePlus, ShoppingBag, ClipboardCheck,
  RotateCcw, Beaker, Printer, CreditCard, Wallet,
  History, Award, Shield, TrendingUp, DollarSign, PieChart, Clock,
  Cloud, Activity, Leaf, ContactRound, UserRoundCog, ShieldCheck, Bot, ScanLine, ClipboardList,
} from "lucide-react";

/**
 * Sidebar navigation groups.
 * Each group has a permission key (short-form, resolved via PERMISSION_MAP),
 * an icon, and children routes.
 * `single: true` renders the group as a flat button with no dropdown.
 */
export const MENU_GROUPS = [
  { id: 'dealer-workspace', label: 'Dealer Workspace', icon: ClipboardList, permission: 'customers', single: true, children: [{ id: 'dealer-workspace', label: 'Dealer Workspace', icon: ClipboardList }] },
  {
    id: "dashboard", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard",
    children: [
      { id: "dashboard",            label: "Overview",     icon: LayoutDashboard },
      { id: "dashboard/analytics",  label: "Analytics",    icon: BarChart3 },
      { id: "dashboard/forecasting",label: "Forecasting",  icon: TrendingUp },
    ],
  },
  {
    id: "sales", label: "Sales", icon: ShoppingCart, permission: "pos",
    children: [
      { id: "pos",          label: "POS Billing",  icon: ScanLine },
      { id: "invoices",     label: "Invoices",     icon: FileText },
      { id: "sales/credit", label: "Credit Sales", icon: CreditCard },
    ],
  },
  {
    id: "inventory", label: "Inventory", icon: Package, permission: "products",
    children: [
      { id: "products",               label: "Products",      icon: Package },
      { id: "stock",                  label: "Stock Levels",  icon: Layers },
      { id: "inventory/batch-expiry", label: "Batch & Expiry",icon: Calendar },
      { id: "inventory/bundles",      label: "Bundles",       icon: PackagePlus },
      { id: "inventory/dead-stock",   label: "Dead Stock Alerts",  icon: Zap },
    ],
  },
  {
    id: "purchases", label: "Purchases", icon: ShoppingBag, permission: "stock",
    children: [
      { id: "purchases/orders",    label: "Purchase Orders", icon: ClipboardList },
      { id: "purchases/grn",       label: "Goods Receiving", icon: ClipboardCheck },
      { id: "purchases/returns",   label: "Returns",         icon: RotateCcw },
      { id: "purchases/suppliers", label: "Suppliers",       icon: Building2 },
    ],
  },
  {
    id: "customers-group", label: "Customers", icon: Users, permission: "customers",
    children: [
      { id: "customers",          label: "All Customers",   icon: Users },
      { id: "customers/dues",     label: "Customer Dues",   icon: Wallet },
      { id: "customers/history",  label: "Purchase History",icon: History },
      { id: "customers/workspace", label: "Farmer Workspace", icon: ContactRound },
      { id: "customers/loyalty",  label: "Loyalty Program", icon: Award },
    ],
  },
  {
    id: "recommendations", label: "Crop Support", icon: Leaf, permission: "ai:use",
    children: [
      { id: "recommendations/diagnosis", label: "Pest Diagnosis", icon: Bug },
      { id: "recommendations/dosage",    label: "Dosage Calculator", icon: Beaker },
      { id: "recommendations/weather",   label: "Weather Advisory",  icon: Cloud },
      { id: "recommendations/history",   label: "Advisory History",  icon: History },
      { id: "recommendations/ai-stats",  label: "Advisory Activity", icon: Activity },
      { id: "recommendations/calendar",  label: "Crop Calendar",     icon: Calendar },
      { id: "recommendations/print",     label: "Print Advisory",    icon: Printer },
    ],
  },
  {
    id: "reports-group", label: "Reports", icon: BarChart3, permission: "reports",
    children: [
      { id: "reports",           label: "Sales Report",     icon: BarChart3 },
      { id: "reports/profit",    label: "Profit Analysis",  icon: DollarSign },
      { id: "reports/margin",    label: "Margin Analysis",  icon: PieChart },
      { id: "reports/inventory", label: "Inventory Report", icon: Package },
      { id: "reports/aging",     label: "Invoice Aging",    icon: Clock },
    ],
  },
  { id: "assistant", label: "Shop Assistant", icon: Bot, permission: "assistant:use", single: true, children: [{ id: "assistant", label: "Shop Assistant", icon: Bot }] },
  {
    id: "staff", label: "Staff Hub", icon: UserRoundCog, permission: "users",
    single: false,
    children: [
      { id: "staff", label: "Team overview", icon: Users },
      { id: "staff/roles", label: "Roles & Access", icon: ShieldCheck },
    ],
  },
  {
    id: "settings-group", label: "Settings", icon: Settings, permission: "settings",
    children: [
      { id: "shops",    label: "My Shop",      icon: Building2 },
      { id: "settings", label: "App Settings", icon: Settings },
    ],
  },
];
