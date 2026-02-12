import React, { useMemo } from "react";
import {
  ShoppingCart,
  Package,
  AlertTriangle,
  Users,
  TrendingUp,
  TrendingDown,
  Calendar,
  ArrowRight,
  DollarSign,
  QrCode,
  BarChart3,
  Clock
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { useApp } from "../context/AppContext";
import { StatCard } from "../components/ui/Card";
import Card from "../components/ui/Card";
import ModernButton from "../components/ui/ModernButton";
import Table from "../components/ui/Table";
import Badge from "../components/ui/Badge";
import {
  formatCurrency,
  formatDate,
  isLowStock,
  getTodayDate
} from "../utils/helpers";

const Dashboard = () => {
  const { state, actions } = useApp();
  const { products, customers, transactions, settings, currentUser, stockHistory } = state;

  // Check permissions
  const canAccessPOS = actions.hasPermission("pos");
  const canAccessProducts = actions.hasPermission("products");
  const canAccessReports = actions.hasPermission("reports");

  // Calculate statistics
  const stats = useMemo(() => {
    const today = getTodayDate();
    
    // Today's sales
    const todayTransactions = transactions.filter((t) => t.date === today);
    const todaySales = todayTransactions.reduce((sum, t) => sum + t.grandTotal, 0);
    
    // Total products
    const totalProducts = products.length;
    
    // Low stock items
    const lowStockItems = products.filter((p) => isLowStock(p.stock)).length;
    
    // Total customers
    const totalCustomers = customers.length;
    
    // Previous day sales for trend
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    const yesterdaySales = transactions
      .filter((t) => t.date === yesterdayStr)
      .reduce((sum, t) => sum + t.grandTotal, 0);
    
    const salesTrend = yesterdaySales > 0
      ? ((todaySales - yesterdaySales) / yesterdaySales) * 100
      : 0;
    
    return {
      todaySales,
      totalProducts,
      lowStockItems,
      totalCustomers,
      salesTrend,
      todayTransactionsCount: todayTransactions.length
    };
  }, [transactions, products, customers]);

  // Recent transactions
  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 5);
  }, [transactions]);

  // Sales chart data (last 7 days)
  const salesChartData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const daySales = transactions
        .filter((t) => t.date === dateStr)
        .reduce((sum, t) => sum + t.grandTotal, 0);
      
      data.push({
        date: date.toLocaleDateString("en-PK", { weekday: "short" }),
        fullDate: dateStr,
        sales: daySales
      });
    }
    return data;
  }, [transactions]);

  // Category distribution
  const categoryData = useMemo(() => {
    const distribution = {};
    products.forEach((p) => {
      distribution[p.category] = (distribution[p.category] || 0) + 1;
    });
    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  }, [products]);

  // Stock activity
  const recentStockActivity = useMemo(() => {
    return stockHistory.slice(0, 5);
  }, [stockHistory]);

  // Colors for charts
  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

  // Transaction columns
  const transactionColumns = [
    {
      key: "id",
      title: "Invoice #",
      render: (value) => <span className="font-medium text-emerald-600 font-mono">{value}</span>
    },
    {
      key: "date",
      title: "Date",
      render: (value) => formatDate(value)
    },
    {
      key: "customerName",
      title: "Customer"
    },
    {
      key: "grandTotal",
      title: "Total",
      render: (value) => (
        <span className="font-semibold text-emerald-600">{formatCurrency(value, settings.currency)}</span>
      )
    },
    {
      key: "paymentMethod",
      title: "Payment",
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === "Cash"
            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
            : value === "Credit"
            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
            : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
        }`}>
          {value}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {currentUser?.name?.split(" ")[0]}!
          </h1>
          <p className="text-emerald-100 mt-1">
            Here's what's happening at {settings.shopName} today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-emerald-100 bg-white/10 backdrop-blur rounded-xl px-4 py-2">
          <Calendar className="w-4 h-4" />
          {formatDate(getTodayDate())}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        {canAccessPOS && (
          <ModernButton 
            variant="primary" 
            onClick={() => actions.setPage("pos")}
            icon={ShoppingCart}
          >
            New Sale
          </ModernButton>
        )}
        {canAccessProducts && (
          <ModernButton 
            variant="secondary" 
            onClick={() => actions.setPage("products")}
            icon={Package}
          >
            Manage Products
          </ModernButton>
        )}
        {canAccessReports && (
          <ModernButton 
            variant="secondary" 
            onClick={() => actions.setPage("reports")}
            icon={BarChart3}
          >
            View Reports
          </ModernButton>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md" className="flex items-center gap-4 hover:shadow-lg transition-shadow">
          <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Today's Sales</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(stats.todaySales, settings.currency)}
            </p>
            <p className={`text-xs ${stats.salesTrend >= 0 ? "text-green-600" : "text-red-600"}`}>
              {stats.salesTrend >= 0 ? "↑" : "↓"} {Math.abs(stats.salesTrend).toFixed(1)}% from yesterday
            </p>
          </div>
        </Card>

        <Card padding="md" className="flex items-center gap-4 hover:shadow-lg transition-shadow">
          <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Products</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalProducts}</p>
          </div>
        </Card>

        <Card padding="md" className="flex items-center gap-4 hover:shadow-lg transition-shadow">
          <div className={`p-4 rounded-xl ${stats.lowStockItems > 0 ? "bg-gradient-to-br from-amber-500 to-orange-600" : "bg-gradient-to-br from-green-500 to-emerald-600"}`}>
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Low Stock Items</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.lowStockItems}</p>
            {stats.lowStockItems > 0 && (
              <p className="text-xs text-amber-600">Needs attention</p>
            )}
          </div>
        </Card>

        <Card padding="md" className="flex items-center gap-4 hover:shadow-lg transition-shadow">
          <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Customers</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCustomers}</p>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Sales Overview
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Last 7 days sales performance
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Total: {formatCurrency(salesChartData.reduce((sum, d) => sum + d.sales, 0), settings.currency)}
              </span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value) => `Rs.${value}`} />
                <Tooltip
                  formatter={(value) => formatCurrency(value, settings.currency)}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px"
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Products by Category
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Distribution across categories
          </p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {categoryData.map((cat, index) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{cat.name}</span>
                </div>
                <span className="text-sm font-medium">{cat.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Recent Transactions
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Latest sales activity
              </p>
            </div>
            <ModernButton
              variant="outline"
              size="sm"
              onClick={() => actions.setPage("reports")}
            >
              View All
            </ModernButton>
          </div>
          <Table
            columns={transactionColumns}
            data={recentTransactions}
            emptyMessage="No transactions yet"
          />
        </Card>

        {/* Stock Activity */}
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Recent Stock Activity
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Latest inventory changes
            </p>
          </div>
          <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
            {recentStockActivity.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No stock activity yet</p>
              </div>
            ) : (
              recentStockActivity.map((activity) => (
                <div 
                  key={activity.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      activity.type === "IN" || activity.type === "ADJUST_IN"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-600"
                        : "bg-red-100 dark:bg-red-900/30 text-red-600"
                    }`}>
                      {activity.type === "IN" || activity.type === "ADJUST_IN" ? "+" : "-"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {activity.productName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.reason} • {activity.user}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      activity.type === "IN" || activity.type === "ADJUST_IN"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}>
                      {activity.type === "IN" || activity.type === "ADJUST_IN" ? "+" : "-"}{activity.quantity}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(activity.date)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
