import React, { useState, useEffect } from "react";
import { ShoppingCart, Package, Users, DollarSign, TrendingUp, Loader2, BarChart3 } from "lucide-react";
import ShopCard from "./ShopCard";
import { formatCurrency } from "../../utils/helpers";
import { useApp } from "../../context/AppContext";

// Reuse the reports hook
import { useReports } from "../../hooks/useReports";

const StatTile = ({ icon: Icon, label, value, sub, color }) => {
  const colors = {
    blue:    { bg: "bg-blue-50 dark:bg-blue-900/15",    text: "text-blue-600 dark:text-blue-400" },
    emerald: { bg: "bg-emerald-50 dark:bg-emerald-900/15", text: "text-emerald-600 dark:text-emerald-400" },
    violet:  { bg: "bg-violet-50 dark:bg-violet-900/15",  text: "text-violet-600 dark:text-violet-400" },
    amber:   { bg: "bg-amber-50 dark:bg-amber-900/15",   text: "text-amber-600 dark:text-amber-400" },
  };
  const c = colors[color] || colors.blue;
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-5 h-5 ${c.text}`} />
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className={`text-xl font-bold ${c.text}`}>{value}</p>
        {sub && <p className="text-[11px] text-slate-400">{sub}</p>}
      </div>
    </div>
  );
};

const StatsPanel = () => {
  const { state } = useApp();
  const { settings } = state;
  const { fetchDashboard } = useReports();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
    </div>
  );

  const todaySales    = data?.todaySales?.total || 0;
  const totalProducts = data?.products?.total || 0;
  const lowStock      = data?.products?.lowStock || 0;
  const totalCustomers= data?.customers?.total || 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatTile icon={DollarSign}  label="Today's Revenue"  value={formatCurrency(todaySales, settings.currency)}  color="blue"    sub="Live sales total" />
        <StatTile icon={Package}     label="Total Products"   value={totalProducts}  color="violet"  sub="In inventory" />
        <StatTile icon={Users}       label="Total Customers"  value={totalCustomers} color="emerald" sub="Registered" />
        <StatTile icon={TrendingUp}  label="Low Stock Items"  value={lowStock}       color="amber"   sub={lowStock > 0 ? "Needs attention" : "All good"} />
      </div>

      <ShopCard title="Performance Summary" desc="Key metrics for your shop">
        <div className="space-y-3">
          {[
            { label: "Today's Sales",    value: formatCurrency(todaySales, settings.currency),  bar: Math.min((todaySales / 50000) * 100, 100), color: "bg-blue-500" },
            { label: "Products in Stock",value: `${totalProducts} items`,                        bar: Math.min((totalProducts / 200) * 100, 100), color: "bg-violet-500" },
            { label: "Active Customers", value: `${totalCustomers} customers`,                   bar: Math.min((totalCustomers / 500) * 100, 100), color: "bg-emerald-500" },
          ].map(({ label, value, bar, color }) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{label}</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{value}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${bar}%` }} />
              </div>
            </div>
          ))}
        </div>
      </ShopCard>
    </div>
  );
};

export default StatsPanel;
