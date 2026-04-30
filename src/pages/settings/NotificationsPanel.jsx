import React, { useState, useEffect } from "react";
import { Bell, BellOff, CheckCircle } from "lucide-react";
import SettingsCard from "./SettingsCard";

const PREFS_KEY = "pos_notification_prefs";

const DEFAULTS = {
  lowStock:     true,
  expiringSoon: true,
  newOrder:     true,
  paymentDue:   true,
  dailySummary: false,
};

const ITEMS = [
  { key: "lowStock",     label: "Low Stock Alerts",       desc: "Notify when a product falls below the threshold" },
  { key: "expiringSoon", label: "Expiry Warnings",        desc: "Alert when batches are expiring within 30 days" },
  { key: "newOrder",     label: "New Purchase Orders",    desc: "Notify when a new PO is created or sent" },
  { key: "paymentDue",   label: "Payment Due Reminders",  desc: "Remind about outstanding supplier payments" },
  { key: "dailySummary", label: "Daily Sales Summary",    desc: "End-of-day summary notification" },
];

const NotificationsPanel = () => {
  const [prefs, setPrefs] = useState(DEFAULTS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(PREFS_KEY));
      if (stored) setPrefs({ ...DEFAULTS, ...stored });
    } catch {}
  }, []);

  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const handleSave = () => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const enabledCount = Object.values(prefs).filter(Boolean).length;

  return (
    <SettingsCard
      title="Notification Preferences"
      desc="Choose which in-app alerts you want to receive"
      action={
        <button onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all ${saved ? "bg-emerald-500" : "bg-blue-600 hover:bg-blue-700"}`}>
          {saved ? <CheckCircle className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
          {saved ? "Saved!" : "Save"}
        </button>
      }
    >
      <div className="space-y-1">
        {ITEMS.map(({ key, label, desc }) => (
          <div key={key}
            className="flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group cursor-pointer"
            onClick={() => toggle(key)}>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${prefs[key] ? "bg-blue-100 dark:bg-blue-900/30" : "bg-slate-100 dark:bg-slate-800"}`}>
                {prefs[key]
                  ? <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  : <BellOff className="w-4 h-4 text-slate-400" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{desc}</p>
              </div>
            </div>
            {/* Toggle */}
            <button
              onClick={e => { e.stopPropagation(); toggle(key); }}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 shrink-0 ${prefs[key] ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"}`}>
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${prefs[key] ? "translate-x-4" : "translate-x-0.5"}`} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <p className="text-xs text-slate-400">{enabledCount} of {ITEMS.length} notifications enabled</p>
        <button onClick={() => setPrefs(DEFAULTS)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
          Reset to defaults
        </button>
      </div>
    </SettingsCard>
  );
};

export default NotificationsPanel;
