import React from "react";
import { Info, Sprout, Globe, Code2, Zap } from "lucide-react";
import SettingsCard from "./SettingsCard";
import { useApp } from "../../context/AppContext";

const Row = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
    <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400">
      <Icon className="w-4 h-4 text-slate-400" />
      <span className="text-sm">{label}</span>
    </div>
    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{value}</span>
  </div>
);

const AboutPanel = () => {
  const { state } = useApp();
  return (
    <SettingsCard title="About AgroCare POS" desc="System information and version details">
      <div className="space-y-5">
        {/* Logo block */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-100 dark:border-blue-900/20">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-base font-bold text-slate-900 dark:text-white">AgroCare POS</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Agricultural Point of Sale System</p>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5">v3.0.0</p>
          </div>
        </div>

        {/* Info rows */}
        <div>
          <Row icon={Globe}  label="Shop"     value={state.settings?.shopName || "—"} />
          <Row icon={Code2}  label="Frontend" value="React 19 + Vite 7" />
          <Row icon={Zap}    label="UI"       value="Tailwind CSS v3" />
          <Row icon={Info}   label="Version"  value="3.0.0" />
        </div>

        <p className="text-xs text-slate-400 dark:text-slate-500 text-center pt-2">
          Built for agricultural retailers · All rights reserved
        </p>
      </div>
    </SettingsCard>
  );
};

export default AboutPanel;
