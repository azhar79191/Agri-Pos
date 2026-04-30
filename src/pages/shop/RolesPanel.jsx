import React from "react";
import { Shield, Check, X } from "lucide-react";
import ShopCard from "./ShopCard";

const PERMISSIONS = [
  { key: "dashboard",  label: "Dashboard & Analytics" },
  { key: "pos",        label: "POS & Billing" },
  { key: "products",   label: "Products & Inventory" },
  { key: "stock",      label: "Stock Management" },
  { key: "customers",  label: "Customers" },
  { key: "reports",    label: "Reports" },
  { key: "users",      label: "User Management" },
  { key: "settings",   label: "Settings" },
];

const ROLES = [
  {
    name: "Admin",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    dot: "bg-purple-500",
    desc: "Full access to everything",
    perms: ["dashboard","pos","products","stock","customers","reports","users","settings"],
  },
  {
    name: "Manager",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    dot: "bg-blue-500",
    desc: "All except user management & settings",
    perms: ["dashboard","pos","products","stock","customers","reports"],
  },
  {
    name: "Cashier",
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
    dot: "bg-emerald-500",
    desc: "POS, customers and basic dashboard",
    perms: ["dashboard","pos","customers"],
  },
];

const RolesPanel = () => (
  <div className="space-y-5">
    {/* Role cards */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {ROLES.map(role => (
        <div key={role.name} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2.5 h-2.5 rounded-full ${role.dot}`} />
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${role.color}`}>{role.name}</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{role.desc}</p>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-2">{role.perms.length} permissions</p>
        </div>
      ))}
    </div>

    {/* Permission matrix */}
    <ShopCard title="Permission Matrix" desc="What each role can access in the system" noPad>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Permission</th>
              {ROLES.map(r => (
                <th key={r.name} className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <span className={`px-2.5 py-1 rounded-full ${r.color}`}>{r.name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {PERMISSIONS.map(perm => (
              <tr key={perm.key} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-5 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">{perm.label}</td>
                {ROLES.map(role => (
                  <td key={role.name} className="px-4 py-3 text-center">
                    {role.perms.includes(perm.key)
                      ? <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/20"><Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /></div>
                      : <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800"><X className="w-3.5 h-3.5 text-slate-400" /></div>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
        <p className="text-xs text-slate-400 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" /> Permissions are assigned per role. Contact your system administrator to change role assignments.
        </p>
      </div>
    </ShopCard>
  </div>
);

export default RolesPanel;
