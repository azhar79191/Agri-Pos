import React from "react";
import { Moon, Sun, Check } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { THEME_PRESETS } from "./settingsConfig";
import SettingsCard from "./SettingsCard";

const ThemePanel = () => {
  const { state, actions } = useApp();
  const { darkMode, themeColor } = state;

  return (
    <div className="space-y-6">
      {/* Accent color */}
      <SettingsCard title="Accent Color" desc="Choose the primary color used across buttons, badges, and highlights">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {THEME_PRESETS.map(({ label, color }) => (
              <button
                key={color}
                title={label}
                onClick={() => actions.setThemeColor(color)}
                className="relative w-9 h-9 rounded-full border-2 transition-all hover:scale-110 focus:outline-none"
                style={{
                  background: color,
                  borderColor: themeColor === color ? color : "transparent",
                  boxShadow: themeColor === color ? `0 0 0 3px ${color}44` : "none",
                }}
              >
                {themeColor === color && (
                  <Check className="w-4 h-4 text-white absolute inset-0 m-auto" />
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Custom color</label>
            <input
              type="color"
              value={themeColor}
              onChange={e => actions.setThemeColor(e.target.value)}
              className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5 bg-white dark:bg-slate-800"
            />
            <code className="text-sm font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
              {themeColor}
            </code>
            <div className="w-6 h-6 rounded-full ml-auto" style={{ background: themeColor }} />
          </div>
        </div>
      </SettingsCard>

      {/* Dark mode */}
      <SettingsCard title="Appearance Mode" desc="Switch between light and dark interface themes">
        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? "bg-indigo-100 dark:bg-indigo-900/30" : "bg-amber-100"}`}>
              {darkMode
                ? <Moon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                : <Sun className="w-5 h-5 text-amber-500" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {darkMode ? "Dark Mode" : "Light Mode"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {darkMode ? "Using dark theme" : "Using light theme"}
              </p>
            </div>
          </div>
          <button
            onClick={actions.toggleDarkMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${darkMode ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${darkMode ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>

        {/* Preview strip */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div
            onClick={() => darkMode && actions.toggleDarkMode()}
            className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${!darkMode ? "border-blue-500 bg-white" : "border-slate-200 dark:border-slate-700 bg-white opacity-60 hover:opacity-80"}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-slate-200" />
              <div className="h-2 w-16 rounded bg-slate-200" />
            </div>
            <div className="h-2 w-full rounded bg-slate-100 mb-1" />
            <div className="h-2 w-3/4 rounded bg-slate-100" />
            <p className="text-[10px] text-slate-500 mt-2 font-medium">Light</p>
          </div>
          <div
            onClick={() => !darkMode && actions.toggleDarkMode()}
            className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${darkMode ? "border-blue-500 bg-slate-800" : "border-slate-200 bg-slate-800 opacity-60 hover:opacity-80"}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-slate-600" />
              <div className="h-2 w-16 rounded bg-slate-600" />
            </div>
            <div className="h-2 w-full rounded bg-slate-700 mb-1" />
            <div className="h-2 w-3/4 rounded bg-slate-700" />
            <p className="text-[10px] text-slate-400 mt-2 font-medium">Dark</p>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
};

export default ThemePanel;
