import React, { useState, useEffect } from "react";
import { Download, TrendingUp, Package, AlertTriangle, DollarSign, ShoppingCart, BarChart3, PieChart as PieIcon, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { useApp } from "../context/AppContext";
import { useReports } from "../hooks/useReports";
import { useReportData } from "../hooks/useReportData";
import Badge from "../components/ui/Badge";
import ModernButton from "../components/ui/ModernButton";
import { formatCurrency, getStockStatus, getStockColor } from "../utils/helpers";
import { CHART_COLORS } from "../constants/invoices";

const selectCls = "appearance-none pl-3.5 pr-8 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all cursor-pointer";

/** Recharts custom tooltip */
const ChartTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-premium-lg px-3.5 py-2.5">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{label}</p>
      <p className="text-sm font-bold text-blue-600">{formatCurrency(payload[0].value, currency)}</p>
    </div>
  );
};

const REPORT_TABS = [
  { id: "daily",     label: "Sales Report", icon: BarChart3 },
  { id: "products",  label: "Top Products", icon: TrendingUp },
  { id: "inventory", label: "Inventory",    icon: Package },
];

const Reports = () => {
  const { state, actions } = useApp();
  const { settings }       = state;
  const { fetchExport }    = useReports();
  const {
    loading,
    summary, dailySalesData, paymentMethodData, topProducts, inventoryData,
    getDateParams, loadSalesReport, loadPaymentDistribution, loadTopProducts, loadInventory,
  } = useReportData();

  const [reportType, setReportType] = useState("daily");
  const [dateRange, setDateRange]   = useState("7");

  useEffect(() => {
    const params = getDateParams(dateRange);
    if (reportType === "daily") {
      loadSalesReport(params).catch(() => {});
      loadPaymentDistribution(params).catch(() => {});
    }
    if (reportType === "products")  loadTopProducts(params).catch(() => {});
    if (reportType === "inventory") loadInventory().catch(() => {});
  }, [reportType, dateRange]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleExport = async () => {
    try {
      await fetchExport({ ...getDateParams(dateRange), type: reportType });
      actions.showToast({ message: "Report exported successfully", type: "success" });
    } catch { actions.showToast({ message: "Export failed", type: "error" }); }
  };

  const SUMMARY_STATS = [
    { label: "Total Sales",      value: formatCurrency(summary.totalSales, settings.currency),      icon: DollarSign, cls: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-50 dark:bg-blue-900/15" },
    { label: "Transactions",     value: summary.totalTransactions,                                   icon: ShoppingCart,cls: "text-blue-600 dark:text-blue-400",  bg: "bg-blue-100 dark:bg-blue-900/30" },
    { label: "Avg Order Value",  value: formatCurrency(summary.avgOrderValue, settings.currency),   icon: TrendingUp, cls: "text-purple-600 dark:text-purple-400",bg: "bg-purple-100 dark:bg-purple-900/30" },
    { label: "Items Sold",       value: summary.totalItems,                                          icon: Package,    cls: "text-amber-600 dark:text-amber-400",  bg: "bg-amber-100 dark:bg-amber-900/30" },
  ];

  const INVENTORY_STATS = [
    { label: "Total Products", value: inventoryData.products?.length || 0, icon: Package,        cls: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-100 dark:bg-blue-900/30" },
    { label: "Low Stock",      value: inventoryData.lowStock?.length || 0, icon: AlertTriangle,  cls: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30" },
    { label: "Out of Stock",   value: inventoryData.outOfStock || 0,       icon: Package,        cls: "text-red-600 dark:text-red-400",     bg: "bg-red-100 dark:bg-red-900/30" },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-sm flex-shrink-0">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Reports</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Sales analytics and inventory insights</p>
          </div>
        </div>
        <ModernButton variant="outline" onClick={handleExport} icon={Download} loading={loading}>Export Report</ModernButton>
      </div>

      {/* Tabs + date range */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          {REPORT_TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setReportType(id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${reportType === id ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"}`}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className={selectCls}>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Summary stats */}
      {reportType !== "inventory" && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {SUMMARY_STATS.map(({ label, value, icon: Icon, cls, bg }, i) => (
            <div key={label} className={`stat-card-premium animate-fade-up stagger-${i + 1}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${cls}`} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
                  <p className={`text-lg font-bold mt-0.5 ${cls}`}>{value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Daily sales charts */}
      {reportType === "daily" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 shadow-premium p-5">
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Sales Trend</h3>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailySalesData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${settings.currency}${v}`} />
                  <Tooltip content={<ChartTooltip currency={settings.currency} />} cursor={{ fill: "rgba(37,99,235,0.06)" }} />
                  <Bar dataKey="sales" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 shadow-premium p-5">
            <div className="flex items-center gap-2 mb-5">
              <PieIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Payment Methods</h3>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={paymentMethodData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {paymentMethodData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v, settings.currency)} contentStyle={{ borderRadius: "12px", border: "1px solid rgba(226,232,240,0.8)", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} />
                  <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-slate-600 dark:text-slate-400">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Top products */}
      {reportType === "products" && (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 shadow-premium overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Top Selling Products</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Highest revenue in selected period</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full table-premium">
              <thead>
                <tr>{["#", "Product Name", "Qty Sold", "Revenue"].map((h) => <th key={h} className="text-left px-4 py-3.5 text-xs font-700 text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-700/50">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {topProducts.map((p, i) => (
                  <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-slate-100 text-slate-600" : i === 2 ? "bg-orange-100 text-orange-700" : "bg-slate-50 text-slate-400"}`}>{i + 1}</span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-white text-sm">{p.productName}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-700 dark:text-slate-300">{p.totalQuantity}</td>
                    <td className="px-4 py-3.5 font-bold text-blue-600 dark:text-blue-400">{formatCurrency(p.totalRevenue, settings.currency)}</td>
                  </tr>
                ))}
                {topProducts.length === 0 && <tr><td colSpan={4} className="text-center py-12 text-slate-400 text-sm">No sales data for selected period</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inventory */}
      {reportType === "inventory" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {INVENTORY_STATS.map(({ label, value, icon: Icon, cls, bg }, i) => (
              <div key={label} className={`stat-card-premium animate-fade-up stagger-${i + 1}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${cls}`} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
                    <p className={`text-xl font-bold mt-0.5 ${cls}`}>{value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 shadow-premium overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Low Stock Products</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Products that need restocking</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full table-premium">
                <thead>
                  <tr>{["Product Name", "Category", "Stock Level", "Price"].map((h) => <th key={h} className="text-left px-4 py-3.5 text-xs font-700 text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-700/50">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(inventoryData.lowStock || []).map((p, i) => (
                    <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-white text-sm">{p.name}</td>
                      <td className="px-4 py-3.5"><Badge variant="primary" size="sm">{p.category}</Badge></td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${getStockColor(p.stock)}`}>
                          {p.stock} {getStockStatus(p.stock)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-blue-600 dark:text-blue-400">{formatCurrency(p.price, settings.currency)}</td>
                    </tr>
                  ))}
                  {(inventoryData.lowStock || []).length === 0 && <tr><td colSpan={4} className="text-center py-12 text-slate-400 text-sm">All inventory levels are good!</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
