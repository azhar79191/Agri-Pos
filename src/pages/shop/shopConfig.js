import { Building2, Users, Receipt, Shield, BarChart3, Bell } from "lucide-react";

export const SHOP_NAV = [
  {
    group: "Shop",
    items: [
      { id: "profile",  label: "Shop Profile",    icon: Building2, desc: "Name, logo, contact info" },
      { id: "billing",  label: "Billing & Tax",   icon: Receipt,   desc: "Tax rate, currency, receipt" },
    ],
  },
  {
    group: "Team",
    items: [
      { id: "team",     label: "Team Members",    icon: Users,     desc: "Manage staff accounts" },
      { id: "roles",    label: "Roles & Access",  icon: Shield,    desc: "Permission overview" },
    ],
  },
  {
    group: "Insights",
    items: [
      { id: "stats",    label: "Shop Stats",      icon: BarChart3, desc: "Orders, revenue summary" },
      { id: "activity", label: "Recent Activity", icon: Bell,      desc: "Latest shop events" },
    ],
  },
];

export const inp = "w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all outline-none";
