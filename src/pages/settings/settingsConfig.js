import {
  Palette, AlertTriangle,
  Tag, Grid3X3, Building2, Bell, Info, Database
} from "lucide-react";

export const SETTINGS_NAV = [
  {
    group: "Appearance",
    items: [
      { id: "theme",         label: "Theme & Colors",      icon: Palette,       desc: "Accent color and dark mode" },
    ],
  },
  {
    group: "Shop",
    items: [
      { id: "shop",          label: "Shop Settings",       icon: Building2,     desc: "Tax, currency, receipt" },
      { id: "brands",        label: "Brands",              icon: Tag,           desc: "Product brand list" },
      { id: "categories",    label: "Categories",          icon: Grid3X3,       desc: "Product categories" },
    ],
  },
  {
    group: "System",
    items: [
      { id: "alerts",        label: "Stock Alerts",        icon: AlertTriangle, desc: "Low stock thresholds" },
      { id: "notifications", label: "Notifications",       icon: Bell,          desc: "Alert preferences" },
      { id: "data",          label: "Data & Export",       icon: Database,      desc: "Export & cache management" },
      { id: "about",         label: "About",               icon: Info,          desc: "Version & info" },
    ],
  },
];

export const THEME_PRESETS = [
  { label: "Emerald",  color: "#10b981" },
  { label: "Sky",      color: "#0ea5e9" },
  { label: "Violet",   color: "#8b5cf6" },
  { label: "Rose",     color: "#f43f5e" },
  { label: "Amber",    color: "#f59e0b" },
  { label: "Orange",   color: "#f97316" },
  { label: "Teal",     color: "#14b8a6" },
  { label: "Indigo",   color: "#6366f1" },
];
