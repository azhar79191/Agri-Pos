import React, { useState, useEffect } from "react";
import { Download, TrendingUp, Package, AlertTriangle, DollarSign, ShoppingCart } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { useApp } from "../context/AppContext";
import { useReports } from "../hooks/useReports";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import Table from "../components/ui/Table";
import Badge from "../components/ui/Badge";
import { formatCurrency, getTodayDate, getStockStatus, getStockColor } from "../utils/helpers";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

const Reports = () => {
  const { state, actions } = useApp();
  const { settings } = state;
  const { fetchSalesReport, fetchTopProducts, fetchInventory, fetchPaymentDistribution, fetchExport, loading } = useReports();

  const [reportType, setReportType] = useState("daily");
  const [dateRange, setDateRange] = useState("7");

  const [summary, setSummary] = useState({ totalSales: 0, totalTransactions: 0, avgOrderValue: 0, totalItems: 0 });
  const [dailySalesData, setDailySalesData] = useState([]);
  const [paymentMethodData, setPaymentMethodData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [inventoryData, setInventoryData] = useState({ products: [], lowStock: [], outOfStock: 0 });

  const getDateParams = () => {
    const end = new Date().toISOString().split("T")[0];
    const start = new Date();
    start.setDate(start.getDate() - parseInt(dateRange));
    return { startDate: start.toISOString().split("T")[0], endDate: end };
  };

  useEffect(() => {
    const params = getDateParams();
    if (reportType === "daily") {
      fetchSalesReport(params).then((data) => {
        if (!data) return;
        // Backend returns { summary: {...}, salesData: [...] }
        const s = data.summary || {};
        setSummary({
          totalSales: s.totalSales || 0,
          totalTransactions: s.invoiceCount || 0,
          avgOrderValue: s.avgOrderValue || 0,
          totalItems: s.itemCount || 0,
        });
        setDailySalesData((data.salesData || []).map((d) => ({
          date: new Date(d._id.year, (d._id.month || 1) - 1, d._id.day || 1)
            .toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
          sales: d.totalSales || 0,
        })));
      }).catch(() => {});

      fetchPaymentDistribution(params).then((data) => {
        if (!data) return;
        // Backend returns { distribution: [{_id, count, total}] }
        const dist = data.distribution || [];
        setPaymentMethodData(dist.map((d) => ({ name: d._id, value: d.total })));
      }).catch(() => {});
    }

    if (reportType === "products") {
      fetchTopProducts(params).then((data) => {
        // Backend returns { topProducts: [...] }
        if (data) setTopProducts(data.topProducts || data);
      }).catch(() => {});
    }

    if (reportType === "inventory") {
      fetchInventory().then((data) => {
        if (!data) return;
        // Backend returns { summary, categorySummary, products }
        setInventoryData({
          products: data.products || [],
          lowStock: (data.products || []).filter(p => p.status === "Low Stock"),
          outOfStock: data.summary?.outOfStockCount || 0,
        });
      }).catch(() => {});
    }
  }, [reportType, dateRange]);

  const handleExport = async () => {
    try {
      const params = { ...getDateParams(), type: reportType };
      await fetchExport(params);
      actions.showToast({ message: "Report exported successfully", type: "success" });
    } catch {
      actions.showToast({ message: "Export failed", type: "error" });
    }
  };

  const topProductsColumns = [
    { key: "productName", title: "Product Name" },
    { key: "totalQuantity", title: "Quantity Sold", render: (v) => <span className="font-medium">{v}</span> },
    { key: "totalRevenue", title: "Revenue", render: (v) => <span className="font-semibold text-emerald-600">{formatCurrency(v, settings.currency)}</span> },
  ];

  const lowStockColumns = [
    { key: "name", title: "Product Name" },
    { key: "category", title: "Category", render: (v) => <Badge variant="primary" size="sm">{v}</Badge> },
    { key: "stock", title: "Stock Level", render: (v) => <span className={`font-medium px-2 py-1 rounded ${getStockColor(v)}`}>{v} {getStockStatus(v)}</span> },
    { key: "price", title: "Price", render: (v) => formatCurrency(v, settings.currency) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">View sales analytics and inventory reports</p>
        </div>
        <Button variant="outline" onClick={handleExport} icon={Download} loading={loading}>Export Report</Button>
      </div>

      <Card padding="md">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-48">
            <Select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              label="Report Type"
              options={[
                { value: "daily", label: "Daily Sales" },
                { value: "products", label: "Top Products" },
                { value: "inventory", label: "Inventory Status" },
              ]}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              label="Date Range"
              options={[
                { value: "7", label: "Last 7 Days" },
                { value: "30", label: "Last 30 Days" },
                { value: "90", label: "Last 90 Days" },
              ]}
            />
          </div>
        </div>
      </Card>

      {reportType !== "inventory" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Sales", value: formatCurrency(summary.totalSales, settings.currency), icon: DollarSign, color: "emerald" },
            { label: "Transactions", value: summary.totalTransactions, icon: ShoppingCart, color: "blue" },
            { label: "Avg Order Value", value: formatCurrency(summary.avgOrderValue, settings.currency), icon: TrendingUp, color: "purple" },
            { label: "Items Sold", value: summary.totalItems, icon: Package, color: "amber" },
          ].map((stat) => (
            <Card key={stat.label} padding="md" className="flex items-center gap-4">
              <div className={`p-3 bg-${stat.color}-100 dark:bg-${stat.color}-900/30 rounded-lg`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {reportType === "daily" && (
        <div className="space-y-6">
          <Card padding="md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sales Trend</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailySalesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `Rs.${v}`} />
                  <Tooltip formatter={(v) => formatCurrency(v, settings.currency)} contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                  <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card padding="md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Method Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%" cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {paymentMethodData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v, settings.currency)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {reportType === "products" && (
        <Card padding="none">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Selling Products</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Products with highest revenue in selected period</p>
          </div>
          <Table columns={topProductsColumns} data={topProducts} loading={loading} emptyMessage="No sales data available for the selected period" />
        </Card>
      )}

      {reportType === "inventory" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Total Products", value: inventoryData.products?.length || 0, icon: Package, color: "blue" },
              { label: "Low Stock", value: inventoryData.lowStock?.length || 0, icon: AlertTriangle, color: "amber" },
              { label: "Out of Stock", value: inventoryData.outOfStock || 0, icon: Package, color: "red" },
            ].map((stat) => (
              <Card key={stat.label} padding="md" className="flex items-center gap-4">
                <div className={`p-3 bg-${stat.color}-100 dark:bg-${stat.color}-900/30 rounded-lg`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
              </Card>
            ))}
          </div>

          <Card padding="none">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Low Stock Products</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Products that need restocking</p>
            </div>
            <Table columns={lowStockColumns} data={inventoryData.lowStock || []} loading={loading} emptyMessage="No low stock products. All inventory levels are good!" />
          </Card>
        </div>
      )}
    </div>
  );
};

export default Reports;
