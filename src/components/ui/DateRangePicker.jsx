import React, { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown, X } from "lucide-react";

const PRESETS = [
  { label: "Today",        getDates: () => { const d = today(); return { start: d, end: d }; } },
  { label: "Yesterday",    getDates: () => { const d = daysAgo(1); return { start: d, end: d }; } },
  { label: "Last 7 days",  getDates: () => ({ start: daysAgo(6), end: today() }) },
  { label: "Last 30 days", getDates: () => ({ start: daysAgo(29), end: today() }) },
  { label: "This month",   getDates: () => ({ start: monthStart(), end: today() }) },
  { label: "Last month",   getDates: () => ({ start: lastMonthStart(), end: lastMonthEnd() }) },
  { label: "This year",    getDates: () => ({ start: yearStart(), end: today() }) },
];

const fmt   = (d) => d.toISOString().split("T")[0];
const today = () => fmt(new Date());
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return fmt(d); };
const monthStart = () => { const d = new Date(); d.setDate(1); return fmt(d); };
const lastMonthStart = () => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); return fmt(d); };
const lastMonthEnd   = () => { const d = new Date(); d.setDate(0); return fmt(d); };
const yearStart = () => { const d = new Date(); d.setMonth(0, 1); return fmt(d); };

const formatDisplay = (start, end) => {
  if (!start && !end) return "Select date range";
  const opts = { month: "short", day: "numeric", year: "numeric" };
  const s = start ? new Date(start + "T00:00:00").toLocaleDateString("en-US", opts) : "—";
  const e = end   ? new Date(end   + "T00:00:00").toLocaleDateString("en-US", opts) : "—";
  return start === end ? s : `${s} → ${e}`;
};

const DateRangePicker = ({ value, onChange, className = "" }) => {
  const { start = "", end = "" } = value || {};
  const [open, setOpen]           = useState(false);
  const [activePreset, setActive] = useState(null);
  const ref                       = useRef(null);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const apply = (s, e, preset = null) => {
    onChange({ start: s, end: e });
    setActive(preset);
    if (s && e) setOpen(false);
  };

  const clear = (ev) => { ev.stopPropagation(); onChange({ start: "", end: "" }); setActive(null); };

  const hasValue = start || end;

  return (
    <div className={`relative ${className}`} ref={ref}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
          hasValue
            ? "border-violet-300 dark:border-violet-600 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300"
            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
        }`}
      >
        <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="whitespace-nowrap">{formatDisplay(start, end)}</span>
        {hasValue
          ? <X className="w-3.5 h-3.5 ml-1 hover:text-red-500 transition-colors" onClick={clear} />
          : <ChevronDown className={`w-3.5 h-3.5 ml-1 transition-transform ${open ? "rotate-180" : ""}`} />
        }
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full mt-1.5 right-0 z-50 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
          style={{ animation: "scale-in 0.12s ease both" }}>

          {/* Presets */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 pb-1.5">Quick Select</p>
            <div className="grid grid-cols-2 gap-1">
              {PRESETS.map((p) => (
                <button key={p.label} onClick={() => { const d = p.getDates(); apply(d.start, d.end, p.label); }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors ${
                    activePreset === p.label
                      ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom range */}
          <div className="p-3 space-y-2.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Custom Range</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate-500 mb-1">From</label>
                <input type="date" value={start} max={end || undefined}
                  onChange={(e) => apply(e.target.value, end, null)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">To</label>
                <input type="date" value={end} min={start || undefined}
                  onChange={(e) => apply(start, e.target.value, null)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all" />
              </div>
            </div>
            {start && end && (
              <button onClick={() => setOpen(false)}
                className="w-full py-2 rounded-lg text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 transition-colors">
                Apply Range
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
