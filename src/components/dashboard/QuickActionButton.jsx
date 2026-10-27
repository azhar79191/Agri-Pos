import React from "react";

const QuickActionButton = ({ icon: _Icon, label, sub, onClick, delay = 0 }) => {
  return (
    <button
      onClick={onClick}
      className="dashboard-shortcut flex items-center gap-3 rounded-lg px-3 py-2.5 text-left"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="dashboard-shortcut__icon flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg">
        <_Icon className="h-[18px] w-[18px]" />
      </span>
      <div>
        <p className="font-semibold leading-tight">{label}</p>
        {sub && <p className="mt-1 text-xs font-normal">{sub}</p>}
      </div>
    </button>
  );
};

export default React.memo(QuickActionButton);
