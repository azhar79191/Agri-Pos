import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  ShoppingCart, Package, AlertTriangle, Users, DollarSign,
  BarChart3, ArrowRight, Zap, Clock, CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useReports } from "../hooks/useReports";
import Button from "../components/ui/Button";
import Table from "../components/ui/Table";
import { formatCurrency, formatDate } from "../utils/helpers";
import StatCard from "../components/dashboard/StatCard";
import Counter from "../components/dashboard/Counter";
import QuickActionButton from "../components/dashboard/QuickActionButton";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import SalesChart from "../components/dashboard/SalesChart";
import CategoryChart from "../components/dashboard/CategoryChart";

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

  const [timeStr, setTimeStr] = useState(() => new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" }));

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
      <DashboardHeader
        currentUser={currentUser}
        settings={settings}
        timeStr={timeStr}
        todaySales={todaySales}
        totalProducts={totalProducts}
        totalCustomers={totalCustomers}
        lowStock={lowStock}
        expiringProducts={expiringProducts}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onNavigate={navigate}
      />

      <div className="flex flex-wrap gap-2">
        {canPOS      && <QuickActionButton icon={ShoppingCart} label="New Sale"    sub="Open POS"         color="blue"    onClick={() => navigate("/pos")}      delay={0} />}
        {canProducts && <QuickActionButton icon={Package}      label="Products"    sub="Manage inventory" color="slate"   onClick={() => navigate("/products")} delay={80} />}
        {canReports  && <QuickActionButton icon={BarChart3}    label="Reports"     sub="View analytics"   color="emerald" onClick={() => navigate("/reports")}  delay={160} />}
      </div>

      {!loading && totalProducts === 0 && totalCustomers === 0 && todaySales === 0 && (
        <div className="card-base p-8 text-center animate-fade-up">
          <div className="w-14 h-14 rounded-lg bg-blue-50 dark:bg-blue-900/15 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Welcome to AgriNest POS!</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mb-5">
            Your shop is set up and ready. Start by adding your products, then make your first sale.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {canProducts && <QuickActionButton icon={Package} label="Add Products" sub="Build your inventory" color="blue" onClick={() => navigate("/products")} />}
            {canPOS && <QuickActionButton icon={ShoppingCart} label="Make a Sale" sub="Open POS" color="emerald" onClick={() => navigate("/pos")} />}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Today's Sales" color="blue" icon={DollarSign} delay={0}
          value={<Counter prefix={`${settings.currency} `} value={todaySales} />}
          trend={salesTrend !== undefined ? (salesTrend >= 0 ? "up" : "down") : null}
          trendLabel={salesTrend !== undefined ? `${Math.abs(salesTrend).toFixed(1)}%` : ""}
        />
        <StatCard title="Total Products" color="purple" icon={Package} delay={80} value={<Counter value={totalProducts} />} subtitle="In inventory" />
        <StatCard
          title="Low Stock Items" color={lowStock > 0 ? "amber" : "emerald"} icon={AlertTriangle} delay={160}
          value={<Counter value={lowStock} />}
          subtitle={lowStock > 0 ? "Needs attention" : "All good"}
        />
        <StatCard title="Total Customers" color="emerald" icon={Users} delay={240} value={<Counter value={totalCustomers} />} subtitle="Registered" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SalesChart data={salesChartData} currency={settings.currency} totalSales={totalSalesInChart} />
        <CategoryChart data={categoryData} />
      </div>

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
