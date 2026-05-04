import React from "react";

const QuickActionButton = ({ icon: Icon, label, sub, color, onClick, delay = 0 }) => {
  const colors = {
    blue:    "bg-blue-600 hover:bg-blue-700 shadow-blue-600/15",
    slate:   "bg-slate-700 hover:bg-slate-800 shadow-slate-700/15 dark:bg-slate-600 dark:hover:bg-slate-500",
    emerald: "bg-teal-600 hover:bg-teal-700 shadow-teal-600/15",
  };
  
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-md ${colors[color]} text-white font-medium text-sm shadow-sm hover:shadow-md transition-all duration-200 animate-fade-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <div className="text-left">
        <p className="font-medium leading-none">{label}</p>
        {sub && <p className="text-xs opacity-75 mt-0.5">{sub}</p>}
      </div>
    </button>
  );
};

export default React.memo(QuickActionButton);
