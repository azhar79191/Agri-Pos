import React from "react";

const ProductStatsCards = ({ stats }) => {
  const cards = [
    { label: "Products on page", value: stats.total, color: "blue" },
    { label: "Low stock on page", value: stats.low, color: "amber" },
    { label: "Out of stock on page", value: stats.out, color: "red" },
  ];

  return (
    <div className="grid grid-cols-3 keep-cols gap-2 sm:gap-4">
      {cards.map(({ label, value, color }, i) => (
        <div key={label} className={`card-base p-3 sm:p-4 animate-fade-up stagger-${i + 1}`}>
          <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{label}</p>
          <p className={`text-2xl font-bold ${
            color === "blue" ? "text-blue-600" : 
            color === "amber" ? "text-amber-600" : 
            "text-red-600"
          }`}>
            {value}
          </p>
        </div>
      ))}
    </div>
  );
};

export default React.memo(ProductStatsCards);
