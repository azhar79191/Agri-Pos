const numbers = (value,keys) => !!value && keys.every(key=>Number.isFinite(value[key]));
export const reportSchemas = {
  margin: data=>Array.isArray(data?.categories),
  inventory: data=>Array.isArray(data?.products)&&numbers(data?.summary,['totalProducts','totalStockValue','lowStockCount','outOfStockCount']),
  profit: data=>Array.isArray(data?.rows)&&numbers(data?.summary,['totalRevenue','totalCost','totalProfit','avgMargin']),
  analytics: data=>Array.isArray(data?.salesData)&&Array.isArray(data?.categoryData)&&numbers(data,['currentMonthSales','growthRate','totalCustomers','totalInvoices']),
  purchases: data=>Array.isArray(data?.customers),
};
