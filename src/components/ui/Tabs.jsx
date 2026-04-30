import React from "react";

const Tabs = ({ tabs = [], activeTab, onChange, className = "" }) => (
  <div className={`flex gap-0 border-b border-slate-200 dark:border-slate-700 ${className}`}>
    {tabs.map(({ id, label, icon: Icon, count }) => (
      <button
        key={id}
        onClick={() => onChange(id)}
        className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors duration-150 relative ${
          activeTab === id
            ? "text-blue-600 dark:text-blue-400"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
        }`}
      >
        {Icon && <Icon className="w-4 h-4" />}
        <span>{label}</span>
        {count !== undefined && (
          <span className={`min-w-[18px] h-[18px] px-1 rounded text-[11px] font-semibold flex items-center justify-center ${
            activeTab === id ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
          }`}>{count}</span>
        )}
        {/* Active indicator line */}
        {activeTab === id && (
          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t" />
        )}
      </button>
    ))}
  </div>
);

export default Tabs;
