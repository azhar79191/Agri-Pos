import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  ShoppingCart, Package, AlertTriangle, Users, DollarSign,
  BarChart3, TrendingUp, TrendingDown, Calendar, ArrowRight,
  Zap, RefreshCw, Clock, CheckCircle2, Activity,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useReports } from "../hooks/useReports";
import Button from "../components/ui/Button";
import Table from "../components/ui/Table";
import { formatCurrency, formatDate, getTodayDate } from "../utils/helpers";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#f43f5e"];

/* ── Animated counter ── */
const Counter = ({ value, prefix = "", suffix = "" }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const target = parseFloat(String(value).replace(/[^0-9.]/g, "")) || 0;
    if (target === 0) { setDisplay(0); return; }
    let start = 0;
    const step = target / 40;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setDisplay(target); clearInterval(timer); }
      else setDisplay(start);
    }, 20);
    return () => clearInterval(timer);
  }, [value]);
  const formatted = Number.isInteger(parseFloat(String(value).replace(/[^0-9.]/g, "")))
    ? Math.round(display).toLocaleString()
    : display.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return <span>{prefix}{formatted}{suffix}</span>;
};

/* ── Chart tooltip ── */
const CustomTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{label}</p>
      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(payload[0].value, currency)}</p>
    </div>
  );
};

/* ── Stat card ── */
const StatCard = ({ title, value, icon: Icon, trend, trendLabel, color, subtitle, delay = 0 }) => {
  const colors = {
    emerald: { bg: "from-emerald-500 to-teal-500", light: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-100 dark:border-emerald-900/30" },
    blue:    { bg: "from-blue-500 to-indigo-500",  light: "bg-blue-50 dark:bg-blue-900/20",    text: "text-blue-600 dark:text-blue-400",    border: "border-blue-100 dark:border-blue-900/30" },
    amber:   { bg: "from-amber-500 to-orange-500", light: "bg-amber-50 dark:bg-amber-900/20",  text: "text-amber-600 dark:text-amber-400",  border: "border-amber-100 dark:border-amber-900/30" },
    purple:  { bg: "from-purple-500 to-pink-500",  light: "bg-purple-50 dark:bg-purple-900/20",text: "text-purple-600 dark:text-purple-400",border: "border-purple-100 dark:border-purple-900/30" },
  };
  const c = colors[color] || colors.emerald;
  return (
    <div
      className="card-base card-hover p-5 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${c.light} ${c.border} border`}>
          <Icon className={`w-5 h-5 ${c.text}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
            trend === "up" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                           : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
          }`}>
            {trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trendLabel}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">{value}</p>
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
};

/* ── Quick action button ── */
const QuickBtn = ({ icon: Icon, label, sub, color, onClick, delay = 0 }) => {
  const colors = {
    emerald: "from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/25",
    slate:   "from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 shadow-slate-500/20 dark:from-slate-700 dark:to-slate-800",
    blue:    "from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-blue-500/25",
  };
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-5 py-3 rounded-xl bg-gradient-to-r ${colors[color]} text-white font-medium text-sm shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 animate-fade-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <div className="text-left">
        <p className="font-semibold leading-none">{label}</p>
        {sub && <p className="text-xs opacity-75 mt-0.5">{sub}</p>}
      </div>
    </button>
  );
};

const Dashboard = () => {
  const { state, actions } = useApp();
  const { settings, currentUser } = state;
  const { fetchDashboard, fetchSalesReport, loading } = useReports();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [salesChartData, setSalesChartData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const hasFetched = useRef(false);

  const canPOS      = actions.hasPermission("pos");
  const canProducts = actions.hasPermission("products");
  const canReports  = actions.hasPermission("reports");

  const loadData = () => {
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
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    loadData();
  }, []); // eslint-disable-line

  const handleRefresh = async () => {
    setRefreshing(true);
    loadData();
    setTimeout(() => setRefreshing(false), 1200);
  };

  const todaySales     = dashboardData?.todaySales?.total || 0;
  const salesTrend     = dashboardData?.todaySales?.percentChange;
  const totalProducts  = dashboardData?.products?.total || 0;
  const lowStock       = dashboardData?.products?.lowStock || 0;
  const totalCustomers = dashboardData?.customers?.total || 0;
  const recentInvoices = dashboardData?.recentInvoices || [];

  const categoryData = useMemo(() => {
    const dist = dashboardData?.categoryDistribution;
    if (!dist) return [];
    if (Array.isArray(dist)) return dist.map(i => ({ name: i._id || "Unknown", value: i.count || 0 }));
    return Object.entries(dist).map(([name, value]) => ({ name, value }));
  }, [dashboardData]);

  const totalSalesInChart = salesChartData.reduce((s, d) => s + d.sales, 0);

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" });

  const columns = [
    {
      key: "invoiceNumber", title: "Invoice",
      render: v => (
        <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">{v}</span>
      ),
    },
    {
      key: "createdAt", title: "Date",
      render: v => (
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock className="w-3 h-3" />{formatDate(v?.split("T")[0])}
        </div>
      ),
    },
    {
      key: "customerName", title: "Customer",
      render: v => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
            {(v || "W")[0].toUpperCase()}
          </div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{v || "Walk-in"}</span>
        </div>
      ),
    },
    {
      key: "total", title: "Amount",
      render: v => <span className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(v, settings.currency)}</span>,
    },
    {
      key: "status", title: "Status",
      render: v => (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
          v === "Completed" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          : v === "Pending" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
        }`}>
          <CheckCircle2 className="w-3 h-3" />{v || "Completed"}
        </span>
      ),
    },
    {
      key: "paymentMethod", title: "Payment",
      render: v => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
          v === "Cash"   ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          : v === "Credit" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
          : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
        }`}>{v}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">

      {/* ── HERO HEADER ── */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10" style={{ background: "linear-gradient(135deg, #0f172a 0%, #0d1f3c 40%, #0a1628 100%)" }}>
        {/* Background layers */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 80% 50%, rgba(16,185,129,0.12) 0%, transparent 60%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 20% 80%, rgba(59,130,246,0.08) 0%, transparent 50%)" }} />
        {/* Animated grid */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        {/* Glow orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10 blur-3xl" style={{ background: "radial-gradient(circle, #10b981, transparent)" }} />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full opacity-8 blur-3xl" style={{ background: "radial-gradient(circle, #3b82f6, transparent)" }} />

        <div className="relative z-10 p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

            {/* Left — greeting */}
            <div className="animate-fade-up">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10">
                  <Activity className="w-3 h-3 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-400 tracking-wide">Live Dashboard</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/5">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span className="text-xs text-slate-400">{timeStr}</span>
                </div>
              </div>

              <p className="text-slate-400 text-sm font-medium mb-1">{greeting()},</p>
              <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight mb-2">
                {currentUser?.name|| "Welcome"}
              </h1>
              <p className="text-slate-400 text-sm max-w-md leading-relaxed">
                Here is your business overview for{" "}
                <span className="text-white font-semibold">{settings.shopName || "your shop"}</span>.
                Everything looks operational.
              </p>

              {/* Mini stats row */}
              <div className="flex flex-wrap items-center gap-4 mt-5">
                {[
                  { label: "Today's Revenue", value: formatCurrency(todaySales, settings.currency), color: "text-emerald-400" },
                  { label: "Products", value: totalProducts, color: "text-blue-400" },
                  { label: "Customers", value: totalCustomers, color: "text-purple-400" },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {i > 0 && <div className="w-px h-6 bg-white/10" />}
                    <div>
                      <p className={`text-base font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-slate-500">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — date + refresh */}
            <div className="flex flex-col items-start lg:items-end gap-3 animate-fade-up" style={{ animationDelay: "100ms" }}>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-white">{formatDate(getTodayDate())}</span>
              </div>
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-sm font-medium transition-all duration-200"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh Data
              </button>

              {lowStock > 0 && (
                <div
                  onClick={() => navigate("/stock")}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-semibold cursor-pointer hover:bg-amber-500/20 transition-colors"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {lowStock} low stock {lowStock === 1 ? "item" : "items"} — View
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div className="flex flex-wrap gap-3">
        {canPOS      && <QuickBtn icon={ShoppingCart} label="New Sale"    sub="Open POS"         color="emerald" onClick={() => navigate("/pos")}      delay={0} />}
        {canProducts && <QuickBtn icon={Package}      label="Products"    sub="Manage inventory" color="slate"   onClick={() => navigate("/products")} delay={80} />}
        {canReports  && <QuickBtn icon={BarChart3}    label="Reports"     sub="View analytics"   color="blue"    onClick={() => navigate("/reports")}  delay={160} />}
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Today's Sales" color="emerald" icon={DollarSign} delay={0}
          value={<Counter prefix={`${settings.currency} `} value={todaySales} />}
          trend={salesTrend !== undefined ? (salesTrend >= 0 ? "up" : "down") : null}
          trendLabel={salesTrend !== undefined ? `${Math.abs(salesTrend).toFixed(1)}%` : ""}
        />
        <StatCard title="Total Products" color="blue"   icon={Package}       delay={80}  value={<Counter value={totalProducts} />}  subtitle="In inventory" />
        <StatCard
          title="Low Stock Items" color={lowStock > 0 ? "amber" : "emerald"} icon={AlertTriangle} delay={160}
          value={<Counter value={lowStock} />}
          subtitle={lowStock > 0 ? "Needs attention" : "All good"}
        />
        <StatCard title="Total Customers" color="purple" icon={Users} delay={240} value={<Counter value={totalCustomers} />} subtitle="Registered" />
      </div>

      {/* ── CHARTS ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Sales area chart */}
        <div className="lg:col-span-2 card-base p-6 animate-fade-up" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Sales Overview</h3>
              <p className="text-xs text-slate-400 mt-0.5">Last 7 days performance</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-slate-400">7-day total</p>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalSalesInChart, settings.currency)}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-900/30">
                <TrendingUp className="w-3.5 h-3.5" />
                Live
              </div>
            </div>
          </div>
          <div className="h-64">
            {salesChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesChartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${settings.currency}${v}`} width={65} />
                  <Tooltip content={<CustomTooltip currency={settings.currency} />} />
                  <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGrad)" dot={false} activeDot={{ r: 5, fill: "#10b981", strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400">
                <BarChart3 className="w-10 h-10 opacity-30" />
                <p className="text-sm">No sales data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Category donut */}
        <div className="card-base p-6 animate-fade-up" style={{ animationDelay: "280ms" }}>
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight mb-1">Categories</h3>
          <p className="text-xs text-slate-400 mb-4">Product distribution</p>
          {categoryData.length > 0 ? (
            <>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={44} outerRadius={70} paddingAngle={3} dataKey="value" strokeWidth={0}>
                      {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={v => [v, "Products"]} contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 space-y-2">
                {categoryData.slice(0, 5).map((cat, i) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-[110px]">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(cat.value / categoryData.reduce((s, c) => s + c.value, 0)) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-4 text-right">{cat.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Package className="w-10 h-10 opacity-30" />
              <p className="text-sm">No data available</p>
            </div>
          )}
        </div>
      </div>

      {/* ── RECENT TRANSACTIONS ── */}
      <div className="card-base overflow-hidden animate-fade-up" style={{ animationDelay: "320ms" }}>
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Recent Transactions</h3>
            <p className="text-xs text-slate-400 mt-0.5">{recentInvoices.length} latest sales</p>
          </div>
          <Button variant="outline" size="sm" icon={ArrowRight} onClick={() => navigate("/invoices")}>View All</Button>
        </div>
        <Table columns={columns} data={recentInvoices} loading={loading} emptyMessage="No transactions yet — start a sale from POS" />
      </div>

    </div>
  );
};

export default Dashboard;
