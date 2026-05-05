import React, { useMemo } from "react";
import { Keyboard, Command } from "lucide-react";
import SettingsCard from "./SettingsCard";
import { SHORTCUTS } from "../../hooks/useKeyboardShortcuts";

const Kbd = ({ children }) => (
  <kbd className="inline-flex items-center justify-center min-w-[26px] h-6 px-1.5 rounded-md text-[11px] font-bold font-mono bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 shadow-sm">
    {children}
  </kbd>
);

const ShortcutRow = ({ shortcut }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0 group hover:bg-slate-50 dark:hover:bg-slate-800/40 -mx-5 px-5 transition-colors">
    <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
      {shortcut.label}
    </span>
    <div className="flex items-center gap-1 flex-shrink-0 ml-4">
      {shortcut.keys.map((key, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="text-slate-300 dark:text-slate-600 text-xs mx-0.5">then</span>}
          <Kbd>
            {key === "Ctrl"    ? <><Command className="w-2.5 h-2.5 inline" /> Ctrl</> :
             key === "Escape"  ? "Esc" :
             key === "\\"      ? "\\" :
             key}
          </Kbd>
        </React.Fragment>
      ))}
    </div>
  </div>
);

const GROUP_COLORS = {
  Navigation: { dot: "bg-blue-500",    badge: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800" },
  Search:     { dot: "bg-violet-500",  badge: "bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-800" },
  POS:        { dot: "bg-emerald-500", badge: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800" },
  Interface:  { dot: "bg-amber-500",   badge: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800" },
};

const KeyboardShortcutsPanel = () => {
  const grouped = useMemo(() => {
    return SHORTCUTS.reduce((acc, s) => {
      if (!acc[s.group]) acc[s.group] = [];
      acc[s.group].push(s);
      return acc;
    }, {});
  }, []);

  return (
    <div className="space-y-4">
      {/* Header card */}
      <SettingsCard
        title="Keyboard Shortcuts"
        desc="Speed up your workflow with these shortcuts — available across the entire app"
      >
        {/* Tip banner */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800 mb-5">
          <Keyboard className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-violet-700 dark:text-violet-300">Pro tip</p>
            <p className="text-xs text-violet-600 dark:text-violet-400 mt-0.5">
              Press <Kbd>?</Kbd> anywhere in the app to jump directly to this page. Navigation shortcuts use a two-key sequence — press <Kbd>G</Kbd> then the second key within 1 second.
            </p>
          </div>
        </div>

        {/* Shortcut groups */}
        <div className="space-y-6">
          {Object.entries(grouped).map(([group, shortcuts]) => {
            const colors = GROUP_COLORS[group] || { dot: "bg-slate-400", badge: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700" };
            return (
              <div key={group}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${colors.badge}`}>
                    {group}
                  </span>
                  <span className="text-[10px] text-slate-400">{shortcuts.length} shortcut{shortcuts.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                  {shortcuts.map((s, i) => <ShortcutRow key={i} shortcut={s} />)}
                </div>
              </div>
            );
          })}
        </div>
      </SettingsCard>

      {/* Quick reference card */}
      <SettingsCard title="Quick Reference" desc="Most used shortcuts at a glance">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { keys: ["G", "P"], label: "Open POS",      color: "emerald" },
            { keys: ["G", "D"], label: "Dashboard",     color: "blue" },
            { keys: ["Ctrl","K"], label: "Search",      color: "violet" },
            { keys: ["?"],      label: "Shortcuts",     color: "amber" },
          ].map(({ keys, label, color }) => (
            <div key={label} className={`flex flex-col items-center gap-2 p-3 rounded-xl border ${
              color === "emerald" ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30" :
              color === "blue"    ? "bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30" :
              color === "violet"  ? "bg-violet-50 dark:bg-violet-900/10 border-violet-100 dark:border-violet-900/30" :
                                    "bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30"
            }`}>
              <div className="flex items-center gap-1">
                {keys.map((k, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <span className="text-slate-300 text-[10px]">+</span>}
                    <Kbd>{k === "Ctrl" ? "Ctrl" : k}</Kbd>
                  </React.Fragment>
                ))}
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</span>
            </div>
          ))}
        </div>
      </SettingsCard>
    </div>
  );
};

export default KeyboardShortcutsPanel;
