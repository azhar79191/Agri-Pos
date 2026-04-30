import React, { useState } from "react";
import { Beaker, Calculator } from "lucide-react";

const DOSAGE_DATA = [
  { product: "Imidacloprid", category: "Insecticides", unit: "ml/acre", crops: [{ crop: "Cotton", dosage: "200", interval: "14 days" }, { crop: "Rice", dosage: "150", interval: "21 days" }] },
  { product: "Mancozeb", category: "Fungicides", unit: "g/acre", crops: [{ crop: "Vegetables", dosage: "500", interval: "7 days" }, { crop: "Wheat", dosage: "400", interval: "14 days" }] },
  { product: "Glyphosate", category: "Herbicides", unit: "ml/acre", crops: [{ crop: "Cotton", dosage: "1000", interval: "N/A" }, { crop: "Sugarcane", dosage: "800", interval: "N/A" }] },
  { product: "Urea", category: "Fertilizers", unit: "kg/acre", crops: [{ crop: "Wheat", dosage: "50", interval: "N/A" }, { crop: "Rice", dosage: "40", interval: "N/A" }] },
];

const DosageSuggestions = () => {
  const [fieldSize, setFieldSize] = useState("1");

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-sm"><Beaker className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Dosage Suggestions</h1><p className="text-sm text-slate-500 dark:text-slate-400">Product dosage reference by crop</p></div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 shadow-premium p-5">
        <div className="flex items-center gap-3 mb-4"><Calculator className="w-5 h-5 text-emerald-600" /><h3 className="font-bold text-slate-900 dark:text-white text-sm">Field Size Calculator</h3></div>
        <div className="flex items-center gap-3"><label className="text-sm text-slate-600 dark:text-slate-400">Field Size (acres):</label><input type="number" value={fieldSize} onChange={e => setFieldSize(e.target.value)} min="0.1" step="0.5" className="w-24 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white" /><span className="text-xs text-slate-400">Dosages below will be multiplied by field size</span></div>
      </div>

      <div className="space-y-4">
        {DOSAGE_DATA.map(item => (
          <div key={item.product} className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 shadow-premium p-5">
            <div className="flex items-center justify-between mb-3"><div><p className="font-bold text-slate-900 dark:text-white">{item.product}</p><p className="text-xs text-slate-400">{item.category} · {item.unit}</p></div></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {item.crops.map(c => (
                <div key={c.crop} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                  <p className="text-xs text-slate-400 mb-1">{c.crop}</p>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">{(parseFloat(c.dosage) * parseFloat(fieldSize || 1)).toFixed(0)} {item.unit.split("/")[0]}</p>
                  <p className="text-xs text-slate-400 mt-1">Safety: {c.interval}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default DosageSuggestions;
