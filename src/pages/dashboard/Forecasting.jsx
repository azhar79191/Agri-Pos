import React, { useState, useEffect } from "react";
import { TrendingUp, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useApp } from "../../context/AppContext";
import { formatCurrency } from "../../utils/helpers";
import { getForecasting } from "../../api/reportsApi";

const Forecasting = () => {
  const { state } = useApp();
  const { settings } = state;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getForecasting()
      .then(res => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const combined = data?.combined || [];
  const avgGrowth = data?.avgGrowth || 0;
  const nextMonthForecast = data?.nextMonthForecast || 0;
  const currentMonthActual = data?.currentMonthActual || 0;

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-glow-sm"><TrendingUp className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Sales Forecasting</h1><p className="text-sm text-slate-500 dark:text-slate-400">Trend analysis and revenue projections</p></div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-slate-400"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading forecast...</span></div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            {[
              { l: "Current Month", v: formatCurrency(currentMonthActual, settings.currency), c: "text-emerald-600 dark:text-emerald-400" },
              { l: "Next Month Forecast", v: formatCurrency(nextMonthForecast, settings.currency), c: "text-blue-600 dark:text-blue-400" },
              { l: "Growth Trend", v: `${avgGrowth >= 0 ? "+" : ""}${avgGrowth}%`, c: "text-purple-600 dark:text-purple-400" },
            ].map(({ l, v, c }) => (
              <div key={l} className="stat-card-premium"><p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{l}</p><p className={`text-xl font-bold mt-1 ${c}`}>{v}</p></div>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-premium p-5">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4">Revenue: Actual vs Forecast</h3>
            {combined.length > 0 ? (
              <div className="h-72"><ResponsiveContainer width="100%" height="100%">
                <AreaChart data={combined}><CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} /><XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} /><YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${settings.currency}${(v/1000).toFixed(0)}k`} /><Tooltip contentStyle={{ borderRadius: "12px" }} formatter={(v, n) => [formatCurrency(v || 0, settings.currency), n === "actual" ? "Actual" : "Forecast"]} /><Area type="monotone" dataKey="actual" stroke="#10b981" fill="rgba(16,185,129,0.1)" strokeWidth={2.5} connectNulls={false} /><Area type="monotone" dataKey="forecast" stroke="#8b5cf6" fill="rgba(139,92,246,0.1)" strokeWidth={2.5} strokeDasharray="5 5" connectNulls={false} /></AreaChart>
              </ResponsiveContainer></div>
            ) : (
              <div className="h-72 flex items-center justify-center text-slate-400 text-sm">Not enough data for forecasting yet.</div>
            )}
            <div className="flex gap-6 mt-3 justify-center text-xs">
              <span className="flex items-center gap-2"><span className="w-3 h-0.5 bg-emerald-500 rounded inline-block" />Actual</span>
              <span className="flex items-center gap-2"><span className="w-3 h-0.5 bg-purple-500 rounded inline-block" style={{ borderTop: "2px dashed #8b5cf6", background: "none" }} />Forecast</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300"><strong>Note:</strong> Forecasts use a 3-month moving average based on your actual sales history.</p>
          </div>
        </>
      )}
    </div>
  );
};
export default Forecasting;
