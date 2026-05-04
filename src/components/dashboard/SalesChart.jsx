import React from "react";
import { BarChart3, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "../../utils/helpers";
import CustomTooltip from "./CustomTooltip";

const SalesChart = ({ data, currency, totalSales }) => {
  return (
    <div className="lg:col-span-2 card-base p-5 animate-fade-up" style={{ animationDelay: "200ms" }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Sales Overview</h3>
          <p className="text-xs text-slate-400 mt-0.5">Last 7 days performance</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-slate-400">7-day total</p>
            <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{formatCurrency(totalSales, currency)}</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/15 px-2.5 py-1 rounded border border-blue-100 dark:border-blue-800/30">
            <TrendingUp className="w-3 h-3" />
            Live
          </div>
        </div>
      </div>
      <div className="h-64">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${currency}${v}`} width={65} />
              <Tooltip content={<CustomTooltip currency={currency} />} />
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
  );
};

export default React.memo(SalesChart);
