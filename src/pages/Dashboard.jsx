import React, { useState, useEffect, useMemo, useRef } from "react";
import { ShoppingCart, Package, AlertTriangle, Users, DollarSign, BarChart3, TrendingUp, Calendar, ArrowRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useReports } from "../hooks/useReports";
import { StatCard } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Table from "../components/ui/Table";
import { formatCurrency, formatDate, getTodayDate } from "../utils/helpers";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#f43f5e"];

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 shadow-premium-lg">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{label}</p>
      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(payload[0].value, currency)}</p>
    </div>
  );
};

const Dashboard = () => {
  const { state, actions } = useApp();
  const { settings, currentUser } = state;
  const { fetchDashboard, fetchSalesReport, loading } = useReports();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [salesChartData, setSalesChartData] = useState([]);
  const hasFetched = useRef(false);

  const canPOS      = actions.hasPermission("pos");
  const canProducts = actions.hasPermission("products");
  const canReports  = actions.hasPermission("reports");

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchDashboard().then(setDashboardData).catch(() => {});
    const end   = new Date().toISOString().split("T")[0];
    const start = (() => { const d = new Date(); d.setDate(d.getDate() - 6); return d.toISOString().split("T")[0]; })();
    fetchSalesReport({ startDate: start, endDate: end })
      .then(data => {
        if (data?.salesData) setSalesChartData(
          data.salesData.map(d => ({
            date: new Date(d._id.year, (d._id.month || 1) - 1, d._id.day || 1)
              .toLocaleDateString("en-PK", { weekday: "short" }),
            sales: d.totalSales || 0,
          }))
        );
      }).catch(() => {});
  }, []); // eslint-disable-line

  const todaySales    = dashboardData?.todaySales?.total || 0;
  const salesTrend    = dashboardData?.todaySales?.percentChange;
  const totalProducts = dashboardData?.products?.total || 0;
  const lowStock      = dashboardData?.products?.lowStock || 0;
  const totalCustomers= dashboardData?.customers?.total || 0;
  const recentInvoices= dashboardData?.recentInvoices || [];

  const categoryData = useMemo(() => {
    const dist = dashboardData?.categoryDistribution;
    if (!dist) return [];
    if (Array.isArray(dist)) return dist.map(i => ({ name: i._id || "Unknown", value: i.count || 0 }));
    return Object.entries(dist).map(([name, value]) => ({ name, value }));
  }, [dashboardData]);

  const columns = [
    { key: "invoiceNumber", title: "Invoice #", render: v => <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">{v}</span> },
    { key: "createdAt",     title: "Date",      render: v => <span className="text-sm text-slate-500">{formatDate(v?.split("T")[0])}</span> },
    { key: "customerName",  title: "Customer",  render: v => <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{v}</span> },
    { key: "total",         title: "Amount",    render: v => <span className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(v, settings.currency)}</span> },
    {
      key: "paymentMethod", title: "Method",
      render: v => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
          v === "Cash"   ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
          v === "Credit" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                           "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
        }`}>{v}</span>
      ),
    },
  ];

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  };

  return (
    <div className="space-y-6 animate-fade-up">

      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 lg:p-8 border border-white/5">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-teal-500/10" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/5 rounded-full -translate-x-1/3 translate-y-1/3 blur-3xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-emerald-400 text-sm font-medium mb-1">{greeting()},</p>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              {currentUser?.name?.split(" ")[0]} 👋
            </h1>
            <p className="text-slate-400 text-sm mt-1.5">
              Here's what's happening at <span className="text-white font-semibold">{settings.shopName}</span> today.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400 bg-white/5 border border-white/8 rounded-xl px-4 py-2.5 self-start sm:self-auto">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span className="font-medium text-slate-300">{formatDate(getTodayDate())}</span>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2.5">
        {canPOS      && <Button variant="primary"   onClick={() => navigate("/pos")}      icon={ShoppingCart}>New Sale</Button>}
        {canProducts && <Button variant="secondary" onClick={() => navigate("/products")} icon={Package}>Products</Button>}
        {canReports  && <Button variant="secondary" onClick={() => navigate("/reports")}  icon={BarChart3}>Reports</Button>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Today's Sales" color="emerald" icon={DollarSign}
          value={formatCurrency(todaySales, settings.currency)}
          trend={salesTrend !== undefined ? (salesTrend >= 0 ? "up" : "down") : null}
          trendLabel={salesTrend !== undefined ? `${Math.abs(salesTrend).toFixed(1)}% vs yesterday` : ""}
        />
        <StatCard title="Total Products" color="blue"   icon={Package}       value={totalProducts}  subtitle="In inventory" />
        <StatCard
          title="Low Stock Items" color={lowStock > 0 ? "amber" : "emerald"} icon={AlertTriangle}
          value={lowStock}
          subtitle={lowStock > 0 ? "Needs attention" : "All good!"}
        />
        <StatCard title="Total Customers" color="purple" icon={Users} value={totalCustomers} subtitle="Registered" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Sales chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/40 shadow-premium p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">Sales Overview</h3>
              <p className="text-xs text-slate-400 mt-0.5">Last 7 days performance</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Live</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `Rs.${v}`} width={60} />
                <Tooltip content={<CustomTooltip currency={settings.currency} />} />
                <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGrad)" dot={false} activeDot={{ r: 5, fill: "#10b981", strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category pie */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/40 shadow-premium p-6">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight mb-1">Categories</h3>
          <p className="text-xs text-slate-400 mb-5">Product distribution</p>
          {categoryData.length > 0 ? (
            <>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={4} dataKey="value" strokeWidth={0}>
                      {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={v => [v, "Products"]} contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {categoryData.slice(0, 5).map((cat, i) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-[120px]">{cat.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{cat.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-44 flex items-center justify-center text-slate-400 text-sm">No data available</div>
          )}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/40 shadow-premium overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">Recent Transactions</h3>
            <p className="text-xs text-slate-400 mt-0.5">Latest sales activity</p>
          </div>
          <Button variant="outline" size="sm" icon={ArrowRight} onClick={() => navigate("/invoices")}>View All</Button>
        </div>
        <Table columns={columns} data={recentInvoices} loading={loading} emptyMessage="No transactions yet" />
      </div>
    </div>
  );
};

export default Dashboard;
