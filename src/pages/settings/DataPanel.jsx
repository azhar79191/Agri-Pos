import SharedButton from "../../components/ui/Button";
import { LoadingIndicator } from "../../components/ui/LoadingState";
import React, { useState } from "react";
import { Download, Trash2, RefreshCw, CheckCircle, AlertTriangle, Database } from "lucide-react";
import SettingsCard from "./SettingsCard";
import { useApp } from "../../context/AppContext";
import { getProducts } from "../../api/productApi";
import { getCustomers } from "../../api/customersApi";
import { collectDirectory } from "../../utils/directoryExport";

const downloadJSON = (data, filename) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
};

const ActionRow = ({ icon: Icon, iconBg, iconColor, title, desc, action }) => (
  <div className="flex flex-wrap gap-3 items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
    <div className="flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</p>
        <p className="text-xs text-slate-400">{desc}</p>
      </div>
    </div>
    {action}
  </div>
);

const DataPanel = () => {
  const { actions } = useApp();
  const [exporting, setExporting] = useState(null);
  const [cleared, setCleared] = useState(false);

  const exportData = async (type) => {
    setExporting(type);
    try {
      let data, filename;
      if (type === "products") {
        data = await collectDirectory(getProducts, 'products');
        filename = `products_export_${new Date().toISOString().split("T")[0]}.json`;
      } else {
        data = await collectDirectory(getCustomers, 'customers');
        filename = `customers_export_${new Date().toISOString().split("T")[0]}.json`;
      }
      downloadJSON(data, filename);
      actions.showToast({ message: `${type} exported successfully`, type: "success" });
    } catch (error) {
      actions.showToast({ message: error.message || `Failed to export ${type}`, type: "error" });
    } finally { setExporting(null); }
  };

  const clearCache = () => {
    ["pos-settings", "posCart"].forEach(k => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });
    setCleared(true);
    setTimeout(() => setCleared(false), 2500);
    actions.showToast({ message: "Local cache cleared", type: "success" });
  };

  return (
    <div className="space-y-6">
      <SettingsCard title="Data Export" desc="Export product or customer directories as JSON. These files do not include financial ledgers or replace a database backup. Export while directory records are not being edited.">
        <div className="space-y-3">
          <ActionRow
            icon={Download} iconBg="bg-blue-100 dark:bg-blue-900/30" iconColor="text-blue-600 dark:text-blue-400"
            title="Export Products" desc="Download all products with prices and stock levels"
            action={
              <SharedButton onClick={() => exportData("products")} disabled={exporting === "products"}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors">
                {exporting === "products" ? <LoadingIndicator /> : <Download className="w-3.5 h-3.5" />}
                Export
              </SharedButton>
            }
          />
          <ActionRow
            icon={Download} iconBg="bg-violet-100 dark:bg-violet-900/30" iconColor="text-violet-600 dark:text-violet-400"
            title="Export Customers" desc="Download all customer records and contact info"
            action={
              <button onClick={() => exportData("customers")} disabled={exporting === "customers"}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white transition-colors">
                {exporting === "customers" ? <LoadingIndicator /> : <Download className="w-3.5 h-3.5" />}
                Export
              </button>
            }
          />
        </div>
      </SettingsCard>

      <SettingsCard title="Cache & Storage" desc="Manage local browser data and cached settings">
        <div className="space-y-3">
          <ActionRow
            icon={cleared ? CheckCircle : Trash2}
            iconBg={cleared ? "bg-emerald-100 dark:bg-emerald-900/20" : "bg-red-100 dark:bg-red-900/20"}
            iconColor={cleared ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}
            title="Clear Local Cache" desc="Removes cached settings and session data (you stay logged in)"
            action={
              <button onClick={clearCache}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all ${cleared ? "bg-emerald-500" : "bg-red-500 hover:bg-red-600"}`}>
                {cleared ? <CheckCircle className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                {cleared ? "Cleared!" : "Clear"}
              </button>
            }
          />
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Clearing cache will reset your theme preferences and any unsaved POS cart. Your account and data on the server are not affected.
            </p>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
};

export default DataPanel;
