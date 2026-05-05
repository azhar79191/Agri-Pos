import React, { useState, useEffect } from "react";
import { Delete, CheckCircle } from "lucide-react";
import { formatCurrency } from "../../utils/helpers";

const DENOMINATIONS = [1000, 500, 100, 50, 20, 10, 5, 2, 1];

const calcChange = (received, payable) => {
  let rem = Math.round((received - payable) * 100) / 100;
  if (rem < 0) return [];
  const result = [];
  for (const d of DENOMINATIONS) {
    const count = Math.floor(rem / d);
    if (count > 0) { result.push({ d, count }); rem = Math.round((rem - d * count) * 100) / 100; }
  }
  return result;
};

const roundUp = (amount, to) => Math.ceil(amount / to) * to;

const CashNumpad = ({ payableAmount, value, onChange, currency }) => {
  const [display, setDisplay] = useState(value || "");

  useEffect(() => { setDisplay(value || ""); }, [value]);

  const push = (char) => {
    setDisplay((prev) => {
      let next;
      if (char === "." && prev.includes(".")) return prev;
      if (char === "." && prev === "") next = "0.";
      else next = prev + char;
      onChange(next);
      return next;
    });
  };

  const backspace = () => {
    setDisplay((prev) => {
      const next = prev.slice(0, -1);
      onChange(next);
      return next;
    });
  };

  const setPreset = (val) => {
    const s = String(val);
    setDisplay(s);
    onChange(s);
  };

  const received  = parseFloat(display) || 0;
  const change    = Math.round((received - payableAmount) * 100) / 100;
  const breakdown = change >= 0 ? calcChange(received, payableAmount) : [];

  const KEYS = ["7","8","9","4","5","6","1","2","3","0","00","."];

  return (
    <div className="space-y-3">
      {/* Display */}
      <div className="relative">
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-900 dark:bg-slate-950 border border-slate-700">
          <span className="text-xs text-slate-500 font-medium">{currency}</span>
          <span className={`text-2xl font-black tracking-tight ${display ? "text-white" : "text-slate-600"}`}>
            {display || "0"}
          </span>
          <button onClick={backspace} className="p-1.5 rounded-lg text-slate-500 hover:text-white transition-colors">
            <Delete className="w-4 h-4" />
          </button>
        </div>
        {/* Change indicator */}
        {received > 0 && (
          <div className={`mt-1.5 flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold ${
            change >= 0
              ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
              : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
          }`}>
            <span>{change >= 0 ? "Change" : "Short by"}</span>
            <span className="font-black">{formatCurrency(Math.abs(change), currency)}</span>
          </div>
        )}
      </div>

      {/* Quick presets */}
      <div className="grid grid-cols-4 gap-1.5">
        {[
          { label: "Exact",   val: payableAmount },
          { label: "↑500",    val: roundUp(payableAmount, 500) },
          { label: "↑1000",   val: roundUp(payableAmount, 1000) },
          { label: "↑5000",   val: roundUp(payableAmount, 5000) },
        ].map(({ label, val }) => (
          <button
            key={label}
            onClick={() => setPreset(val)}
            className="py-2 rounded-xl text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-700 dark:hover:text-violet-400 transition-colors border border-slate-200 dark:border-slate-700"
          >
            {label === "Exact" ? "Exact" : formatCurrency(val, currency).replace(currency, "").trim()}
          </button>
        ))}
      </div>

      {/* Numpad grid */}
      <div className="grid grid-cols-3 gap-2">
        {KEYS.map((k) => (
          <button
            key={k}
            onClick={() => push(k)}
            className="h-12 rounded-xl text-lg font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all shadow-sm"
          >
            {k}
          </button>
        ))}
      </div>

      {/* Denomination breakdown */}
      {breakdown.length > 0 && (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Return in denominations</p>
          <div className="flex flex-wrap gap-1.5">
            {breakdown.map(({ d, count }) => (
              <span key={d} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm">
                {count}×<span className="text-emerald-600 dark:text-emerald-400">{d}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CashNumpad;
