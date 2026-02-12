import React, { useState, useMemo } from "react";
import {
  Download,
  TrendingUp,
  Calendar,
  Package,
  AlertTriangle,
  DollarSign,
  ShoppingCart
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { useApp } from "../context/AppContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import Table from "../components/ui/Table";
import Badge from "../components/ui/Badge";
import {
  formatCurrency,
  formatDate,
  isLowStock,
  getTodayDate,
  getStockStatus,
  getStockColor
} from "../utils/helpers";

const Reports = () => {
  const { state, actions } = useApp();
  const { products, transactions, settings } = state;

  // Local state
  const [reportType, setReportType] = useState("daily");
  const [dateRange, setDateRange] = useState("7");

  // Get date range
  const getDateRange = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - parseInt(days));
    return { start, end };
  };

  // Filter transactions by date range
  const filteredTransactions = useMemo(() => {
    const { start } = getDateRange(dateRange);
    return transactions.filter((t) => new Date(t.date) >= start);
  }, [transactions, dateRange]);

  // Daily sales data
  const dailySalesData = useMemo(() => {
    const salesByDate = {};
    filteredTransactions.forEach((t) => {
      if (!salesByDate[t.date]) {
        salesByDate[t.date] = 0;
      }
      salesByDate[t.date] += t.grandTotal;
    });

    return Object.entries(salesByDate)
      .map(([date, sales]) => ({
        date: new Date(date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
        fullDate: date,
        sales
      }))
      .sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));
  }, [filteredTransactions]);

  // Payment method distribution
  const paymentMethodData = useMemo(() => {
    const distribution = {};
    filteredTransactions.forEach((t) => {
      distribution[t.paymentMethod] = (distribution[t.paymentMethod] || 0) + t.grandTotal;
    });
    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  }, [filteredTransactions]);

  // Top selling products
  const topProducts = useMemo(() => {
    const productSales = {};
    filteredTransactions.forEach((t) => {
      t.items.forEach((item) => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            name: item.name,
            quantity: 0,
            revenue: 0
          };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.total;
      });
    });

    return Object.entries(productSales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [filteredTransactions]);

  // Low stock products
  const lowStockProducts = useMemo(() => {
    return products
      .filter((p) => isLowStock(p.stock))
      .sort((a, b) => a.stock - b.stock);
  }, [products]);

  // Summary statistics
  const summary = useMemo(() => {
    const totalSales = filteredTransactions.reduce((sum, t) => sum + t.grandTotal, 0);
    const totalTransactions = filteredTransactions.length;
    const avgOrderValue = totalTransactions > 0 ? totalSales / totalTransactions : 0;
    const totalItems = filteredTransactions.reduce(
      (sum, t) => sum + t.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );

    return {
      totalSales,
      totalTransactions,
      avgOrderValue,
      totalItems
    };
  }, [filteredTransactions]);

  // Colors for charts
  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

  // Handle export
  const handleExport = () => {
    const data = {
      reportType,
      dateRange,
      generatedAt: new Date().toISOString(),
      summary,
      transactions: filteredTransactions,
      topProducts,
      lowStockProducts
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${reportType}-${getTodayDate()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    actions.showToast({ message: "Report exported successfully", type: "success" });
  };

  // Top products columns
  const topProductsColumns = [
    {
      key: "name",
      title: "Product Name"
    },
    {
      key: "quantity",
      title: "Quantity Sold",
      render: (value) => <span className="font-medium">{value}</span>
    },
    {
      key: "revenue",
      title: "Revenue",
      render: (value) => (
        <span className="font-semibold text-emerald-600">
          {formatCurrency(value, settings.currency)}
        </span>
      )
    }
  ];

  // Low stock columns
  const lowStockColumns = [
    {
      key: "name",
      title: "Product Name"
    },
    {
      key: "category",
      title: "Category",
      render: (value) => <Badge variant="primary" size="sm">{value}</Badge>
    },
    {
      key: "stock",
      title: "Stock Level",
      render: (value) => (
        <span className={`font-medium px-2 py-1 rounded ${getStockColor(value)}`}>
          {value} {getStockStatus(value)}
        </span>
      )
    },
    {
      key: "price",
      title: "Price",
      render: (value) => formatCurrency(value, settings.currency)
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reports
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            View sales analytics and inventory reports
          </p>
        </div>
        <Button variant="outline" onClick={handleExport} icon={Download}>
          Export Report
        </Button>
      </div>

      {/* Filters */}
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
                { value: "inventory", label: "Inventory Status" }
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
                { value: "90", label: "Last 90 Days" }
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      {reportType !== "inventory" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card padding="md" className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Sales</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(summary.totalSales, settings.currency)}
              </p>
            </div>
          </Card>
          <Card padding="md" className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Transactions</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {summary.totalTransactions}
              </p>
            </div>
          </Card>
          <Card padding="md" className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg Order Value</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(summary.avgOrderValue, settings.currency)}
              </p>
            </div>
          </Card>
          <Card padding="md" className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Package className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Items Sold</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {summary.totalItems}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Report Content */}
      {reportType === "daily" && (
        <div className="space-y-6">
          {/* Sales Chart */}
          <Card padding="md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Sales Trend
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailySalesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                  <YAxis
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(value, settings.currency)}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px"
                    }}
                  />
                  <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Payment Method Distribution */}
          <Card padding="md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Payment Method Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(value, settings.currency)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {reportType === "products" && (
        <Card padding="none">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Top Selling Products
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Products with highest revenue in selected period
            </p>
          </div>
          <Table
            columns={topProductsColumns}
            data={topProducts}
            emptyMessage="No sales data available for the selected period"
          />
        </Card>
      )}

      {reportType === "inventory" && (
        <div className="space-y-6">
          {/* Inventory Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card padding="md" className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Products</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {products.length}
                </p>
              </div>
            </Card>
            <Card padding="md" className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Low Stock</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {lowStockProducts.length}
                </p>
              </div>
            </Card>
            <Card padding="md" className="flex items-center gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Package className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Out of Stock</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {products.filter((p) => p.stock === 0).length}
                </p>
              </div>
            </Card>
          </div>

          {/* Low Stock Table */}
          <Card padding="none">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Low Stock Products
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Products that need restocking
              </p>
            </div>
            <Table
              columns={lowStockColumns}
              data={lowStockProducts}
              emptyMessage="No low stock products. All inventory levels are good!"
            />
          </Card>
        </div>
      )}
    </div>
  );
};

export default Reports;
