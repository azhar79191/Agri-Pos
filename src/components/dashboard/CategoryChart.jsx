import React from "react";
import { Package } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#2563eb", "#0ea5e9", "#8b5cf6", "#f59e0b", "#ef4444"];

const CategoryChart = ({ data }) => {
  const totalProducts = data.reduce((s, c) => s + c.value, 0);

  return (
    <div className="card-base p-5 animate-fade-up" style={{ animationDelay: "280ms" }}>
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-0.5">Categories</h3>
      <p className="text-xs text-slate-400 mb-4">Product distribution</p>
      {data.length > 0 ? (
        <>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={44} outerRadius={70} paddingAngle={3} dataKey="value" strokeWidth={0}>
                  {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => [v, "Products"]} contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 space-y-2">
            {data.slice(0, 5).map((cat, i) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-[110px]">{cat.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(cat.value / totalProducts) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }} />
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
  );
};

export default React.memo(CategoryChart);
