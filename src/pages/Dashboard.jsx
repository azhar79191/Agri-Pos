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

const COLORS = ["#2563eb", "#0ea5e9", "#8b5cf6", "#f59e0b", "#ef4444"];

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
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 shadow-premium-lg">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</p>
      <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{formatCurrency(payload[0].value, currency)}</p>
    </div>
  );
};

/* ── Stat card ── */
const StatCard = ({ title, value, icon: Icon, trend, trendLabel, color, subtitle, delay = 0 }) => {
  const colors = {
    blue:    { light: "bg-blue-50 dark:bg-blue-900/15",    text: "text-blue-600 dark:text-blue-400" },
    emerald: { light: "bg-emerald-50 dark:bg-emerald-900/15", text: "text-emerald-600 dark:text-emerald-400" },
    amber:   { light: "bg-amber-50 dark:bg-amber-900/15",  text: "text-amber-600 dark:text-amber-400" },
    purple:  { light: "bg-purple-50 dark:bg-purple-900/15", text: "text-purple-600 dark:text-purple-400" },
  };
  const c = colors[color] || colors.blue;
  return (
    <div
      className="card-base card-hover p-5 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${c.light}`}>
          <Icon className={`w-5 h-5 ${c.text}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded ${
            trend === "up" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/15 dark:text-emerald-400"
                           : "bg-red-50 text-red-600 dark:bg-red-900/15 dark:text-red-400"
          }`}>
            {trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trendLabel}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-0.5">{value}</p>
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
};

/* ── Quick action button ── */
const QuickBtn = ({ icon: Icon, label, sub, color, onClick, delay = 0 }) => {
  const colors = {
    blue:    "bg-blue-600 hover:bg-blue-700 shadow-blue-600/15",
    slate:   "bg-slate-700 hover:bg-slate-800 shadow-slate-700/15 dark:bg-slate-600 dark:hover:bg-slate-500",
    emerald: "bg-teal-600 hover:bg-teal-700 shadow-teal-600/15",
  };
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-md ${colors[color]} text-white font-medium text-sm shadow-sm hover:shadow-md transition-all duration-200 animate-fade-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <div className="text-left">
        <p className="font-medium leading-none">{label}</p>
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

  // Expiring within 30 days
  const expiringProducts = useMemo(() => {
    const items = dashboardData?.products?.items || [];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + 30);
    return items.filter(p => p.expiryDate && new Date(p.expiryDate) <= cutoff && new Date(p.expiryDate) >= new Date());
  }, [dashboardData]);

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
  const [timeStr, setTimeStr] = useState(() => now.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" }));

  // Live clock — updates every minute
  useEffect(() => {
    const tick = () => setTimeStr(new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" }));
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  const columns = [
    {
      key: "invoiceNumber", title: "Invoice",
      render: v => (
        <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/15 px-2 py-1 rounded">{v}</span>
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
          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-600 dark:text-slate-400">
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
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
          v === "Completed" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
          : v === "Pending" ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
          : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
        }`}>
          <CheckCircle2 className="w-3 h-3" />{v || "Completed"}
        </span>
      ),
    },
    {
      key: "paymentMethod", title: "Payment",
      render: v => (
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
          v === "Cash"   ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
          : v === "Credit" ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
          : "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
        }`}>{v}</span>
      ),
    },
  ];

  return (
    <div className="space-y-5">

      {/* ── HERO HEADER ── */}
      <div className="card-base p-6 animate-fade-up">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

          {/* Left — greeting */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/15 border border-blue-100 dark:border-blue-800/30">
                <Activity className="w-3 h-3 text-blue-500" />
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Live Dashboard</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <Clock className="w-3 h-3 text-slate-400" />
                <span className="text-xs text-slate-500">{timeStr}</span>
              </div>
            </div>

            <p className="text-slate-500 text-sm font-medium mb-0.5">{greeting()},</p>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">
              {currentUser?.name|| "Welcome"}
            </h1>
            <p className="text-slate-500 text-sm">
              Business overview for{" "}
              <span className="text-slate-900 dark:text-white font-semibold">{settings.shopName || "your shop"}</span>
            </p>

            {/* Mini stats row */}
            <div className="flex flex-wrap items-center gap-4 mt-4">
              {[
                { label: "Today's Revenue", value: formatCurrency(todaySales, settings.currency), color: "text-blue-600 dark:text-blue-400" },
                { label: "Products", value: totalProducts, color: "text-slate-900 dark:text-white" },
                { label: "Customers", value: totalCustomers, color: "text-slate-900 dark:text-white" },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  {i > 0 && <div className="w-px h-5 bg-slate-200 dark:bg-slate-700" />}
                  <div>
                    <p className={`text-base font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-slate-400">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — date + refresh */}
          <div className="flex flex-col items-start lg:items-end gap-2.5">
            <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{formatDate(getTodayDate())}</span>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh Data
            </button>

            {lowStock > 0 && (
              <div
                onClick={() => navigate("/stock")}
                className="flex items-center gap-2 px-3 py-2 rounded-md border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/15 text-amber-700 dark:text-amber-400 text-xs font-medium cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/25 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                {lowStock} low stock {lowStock === 1 ? "item" : "items"} — View
              </div>
            )}
            {expiringProducts.length > 0 && (
              <div
                onClick={() => navigate("/products")}
                className="flex items-center gap-2 px-3 py-2 rounded-md border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-900/15 text-red-700 dark:text-red-400 text-xs font-medium cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/25 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                {expiringProducts.length} expiring in 30 days — View
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div className="flex flex-wrap gap-2">
        {canPOS      && <QuickBtn icon={ShoppingCart} label="New Sale"    sub="Open POS"         color="blue"    onClick={() => navigate("/pos")}      delay={0} />}
        {canProducts && <QuickBtn icon={Package}      label="Products"    sub="Manage inventory" color="slate"   onClick={() => navigate("/products")} delay={80} />}
        {canReports  && <QuickBtn icon={BarChart3}    label="Reports"     sub="View analytics"   color="emerald" onClick={() => navigate("/reports")}  delay={160} />}
      </div>

      {/* ── ONBOARDING EMPTY STATE ── */}
      {!loading && totalProducts === 0 && totalCustomers === 0 && todaySales === 0 && (
        <div className="card-base p-8 text-center animate-fade-up">
          <div className="w-14 h-14 rounded-lg bg-blue-50 dark:bg-blue-900/15 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Welcome to AgroCare POS!</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mb-5">
            Your shop is set up and ready. Start by adding your products, then make your first sale.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {canProducts && <QuickBtn icon={Package} label="Add Products" sub="Build your inventory" color="blue" onClick={() => navigate("/products")} />}
            {canPOS && <QuickBtn icon={ShoppingCart} label="Make a Sale" sub="Open POS" color="emerald" onClick={() => navigate("/pos")} />}
          </div>
        </div>
      )}

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Today's Sales" color="blue" icon={DollarSign} delay={0}
          value={<Counter prefix={`${settings.currency} `} value={todaySales} />}
          trend={salesTrend !== undefined ? (salesTrend >= 0 ? "up" : "down") : null}
          trendLabel={salesTrend !== undefined ? `${Math.abs(salesTrend).toFixed(1)}%` : ""}
        />
        <StatCard title="Total Products" color="purple" icon={Package}       delay={80}  value={<Counter value={totalProducts} />}  subtitle="In inventory" />
        <StatCard
          title="Low Stock Items" color={lowStock > 0 ? "amber" : "emerald"} icon={AlertTriangle} delay={160}
          value={<Counter value={lowStock} />}
          subtitle={lowStock > 0 ? "Needs attention" : "All good"}
        />
        <StatCard title="Total Customers" color="emerald" icon={Users} delay={240} value={<Counter value={totalCustomers} />} subtitle="Registered" />
      </div>

      {/* ── CHARTS ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Sales area chart */}
        <div className="lg:col-span-2 card-base p-5 animate-fade-up" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Sales Overview</h3>
              <p className="text-xs text-slate-400 mt-0.5">Last 7 days performance</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-slate-400">7-day total</p>
                <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{formatCurrency(totalSalesInChart, settings.currency)}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/15 px-2.5 py-1 rounded border border-blue-100 dark:border-blue-800/30">
                <TrendingUp className="w-3 h-3" />
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
                      <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${settings.currency}${v}`} width={65} />
                  <Tooltip content={<CustomTooltip currency={settings.currency} />} />
                  <Area type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#salesGrad)" dot={false} activeDot={{ r: 4, fill: "#2563eb", strokeWidth: 0 }} />
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
        <div className="card-base p-5 animate-fade-up" style={{ animationDelay: "280ms" }}>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-0.5">Categories</h3>
          <p className="text-xs text-slate-400 mb-4">Product distribution</p>
          {categoryData.length > 0 ? (
            <>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={44} outerRadius={70} paddingAngle={3} dataKey="value" strokeWidth={0}>
                      {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={v => [v, "Products"]} contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 space-y-2">
                {categoryData.slice(0, 5).map((cat, i) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-[110px]">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(cat.value / categoryData.reduce((s, c) => s + c.value, 0)) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-4 text-right">{cat.value}</span>
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
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Transactions</h3>
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
