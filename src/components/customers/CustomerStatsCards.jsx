import React from "react";
import { Users, Wallet } from "lucide-react";

const CustomerStatsCards = ({ totalCustomers, totalWallet, totalCredit, currency }) => {
  const stats = [
    { label: "Total Customers", value: totalCustomers, icon: Users, cls: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/15" },
    { label: "Total Wallet", value: totalWallet, icon: Wallet, cls: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/15" },
    { label: "Total Credit", value: totalCredit, icon: Wallet, cls: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/15" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map(({ label, value, icon: Icon, cls, bg }, i) => (
        <div key={label} className={`card-base p-4 animate-fade-up stagger-${i + 1}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-5 h-5 ${cls}`} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
              <p className={`text-lg font-bold mt-0.5 ${cls}`}>{value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default React.memo(CustomerStatsCards);
