import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const SDPStatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue,
  color = 'blue',
  delay = 0 
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/15',
      iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-100 dark:border-blue-900/30'
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/15',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-100 dark:border-emerald-900/30'
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-900/15',
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-100 dark:border-amber-900/30'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/15',
      iconBg: 'bg-gradient-to-br from-purple-500 to-pink-600',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-100 dark:border-purple-900/30'
    },
    slate: {
      bg: 'bg-slate-50 dark:bg-slate-800/60',
      iconBg: 'bg-gradient-to-br from-slate-500 to-slate-600',
      text: 'text-slate-600 dark:text-slate-400',
      border: 'border-slate-100 dark:border-slate-700'
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div 
      className={`sdp-stat-card ${colors.border} sdp-animate-in`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {value}
            </p>
            {trend && (
              <span className={`inline-flex items-center gap-1 text-xs font-bold ${
                trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {trendValue}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-xl ${colors.iconBg} flex items-center justify-center shadow-lg shrink-0`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
      </div>
    </div>
  );
};

export default SDPStatCard;
