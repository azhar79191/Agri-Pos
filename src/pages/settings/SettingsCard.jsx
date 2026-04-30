import React from "react";

const SettingsCard = ({ title, desc, children, action }) => (
  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
    <div className="flex items-start justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
        {desc && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>}
      </div>
      {action && <div className="shrink-0 ml-4">{action}</div>}
    </div>
    <div className="px-5 py-5">{children}</div>
  </div>
);

export default SettingsCard;
