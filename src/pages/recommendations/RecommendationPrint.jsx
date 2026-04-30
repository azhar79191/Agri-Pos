import React, { useState } from "react";
import { Printer, FileText } from "lucide-react";

const RecommendationPrint = () => {
  const [form, setForm] = useState({ customer: "", crop: "", issue: "", products: "", dosage: "", notes: "" });

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-3 no-print">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-sm"><Printer className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Print Recommendation</h1><p className="text-sm text-slate-500 dark:text-slate-400">Generate printed recommendation slips</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 shadow-premium p-6 space-y-4 no-print">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Fill Recommendation Details</h3>
          {[{ l: "Customer/Farmer Name", k: "customer" }, { l: "Crop", k: "crop" }, { l: "Issue/Disease", k: "issue" }, { l: "Recommended Products", k: "products" }, { l: "Dosage Instructions", k: "dosage" }].map(({ l, k }) => (
            <div key={k}><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{l}</label><input value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white" /></div>
          ))}
          <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Additional Notes</label><textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white resize-none" /></div>
          <button onClick={handlePrint} className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm shadow-sm"><Printer className="w-4 h-4" />Print Recommendation</button>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-premium p-8 receipt">
          <div className="text-center border-b border-slate-200 pb-4 mb-4"><h2 className="text-lg font-bold text-slate-900">🌱 Agri-Care Recommendation</h2><p className="text-xs text-slate-400 mt-1">{new Date().toLocaleDateString()}</p></div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Farmer:</span><span className="font-semibold text-slate-900">{form.customer || "—"}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Crop:</span><span className="font-semibold text-slate-900">{form.crop || "—"}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Issue:</span><span className="font-semibold text-slate-900">{form.issue || "—"}</span></div>
            <hr className="border-slate-200" />
            <div><span className="text-slate-500 block mb-1">Products:</span><span className="font-semibold text-slate-900">{form.products || "—"}</span></div>
            <div><span className="text-slate-500 block mb-1">Dosage:</span><span className="font-semibold text-slate-900">{form.dosage || "—"}</span></div>
            {form.notes && <div><span className="text-slate-500 block mb-1">Notes:</span><span className="text-slate-700">{form.notes}</span></div>}
          </div>
          <div className="mt-6 pt-4 border-t border-slate-200 text-center text-xs text-slate-400">Follow safety precautions. Consult expert if symptoms persist.</div>
        </div>
      </div>
    </div>
  );
};
export default RecommendationPrint;
