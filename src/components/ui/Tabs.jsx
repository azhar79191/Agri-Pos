import React from "react";

const Tabs = ({ tabs = [], activeTab, onChange, className = "" }) => (
  <div className={`flex gap-1 p-1 bg-slate-100 dark:bg-[#122b1c] rounded-xl ${className}`}>
    {tabs.map(({ id, label, icon: Icon, count }) => (
      <button
        key={id}
        onClick={() => onChange(id)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
          activeTab === id
            ? "bg-white dark:bg-[#0d1f14] text-emerald-600 dark:text-emerald-400 shadow-sm"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
        }`}
      >
        {Icon && <Icon className="w-4 h-4" />}
        <span>{label}</span>
        {count !== undefined && (
          <span className={`min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold flex items-center justify-center ${
            activeTab === id ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
          }`}>{count}</span>
        )}
      </button>
    ))}
  </div>
);

export default Tabs;
