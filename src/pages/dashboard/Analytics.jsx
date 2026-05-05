import React from "react";
import { BarChart3, TrendingUp, Users, ShoppingCart, DollarSign, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { useApp } from "../../context/AppContext";
import { formatCurrency } from "../../utils/helpers";
import { useAnalytics } from "../../hooks/useAnalytics";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#f97316"];

const STATS = (data, currency) => [
  { l: "Monthly Revenue", v: formatCurrency(data.currentMonthSales, currency), c: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-blue-900/20",   icon: DollarSign },
  { l: "Growth Rate",     v: `${data.growthRate >= 0 ? "+" : ""}${data.growthRate}%`,  c: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-100 dark:bg-blue-900/30",    icon: TrendingUp },
  { l: "Customers",       v: data.totalCustomers,                                       c: "text-purple-600 dark:text-purple-400",bg: "bg-purple-100 dark:bg-purple-900/30",icon: Users },
  { l: "Transactions",    v: data.totalInvoices,                                        c: "text-amber-600 dark:text-amber-400",  bg: "bg-amber-100 dark:bg-amber-900/30",  icon: ShoppingCart },
];

const Analytics = () => {
  const { state }  = useApp();
  const { settings } = state;
  const data       = useAnalytics();

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Analytics</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Deep-dive into your business performance</p>
        </div>
      </div>

      {data.loading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading analytics...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS(data, settings.currency).map(({ l, v, c, bg, icon: I }) => (
              <div key={l} className="stat-card-premium">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}><I className={`w-5 h-5 ${c}`} /></div>
                  <div><p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{l}</p><p className={`text-lg font-bold mt-0.5 ${c}`}>{v}</p></div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 shadow-premium p-5">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4">Monthly Revenue Trend</h3>
              {data.salesData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.salesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${settings.currency}${(v / 1000).toFixed(0)}k`} />
                      <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid rgba(226,232,240,0.8)" }} formatter={(v) => [formatCurrency(v, settings.currency), "Sales"]} />
                      <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: "#10b981" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-400 text-sm">No sales data yet</div>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 shadow-premium p-5">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4">Products by Category</h3>
              {data.categoryData.length > 0 ? (
                <>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={data.categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                          {data.categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v) => [v, "Products"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-1 mt-2">
                    {data.categoryData.map((c, i) => (
                      <div key={c.name} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />{c.name}</span>
                        <span className="font-bold">{c.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-52 flex items-center justify-center text-slate-400 text-sm">No products yet</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
