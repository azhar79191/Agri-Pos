import React, { useState } from "react";
import { Bug, Leaf, Search, ChevronRight, Sprout } from "lucide-react";
import EmptyState from "../../components/ui/EmptyState";

const CROP_ISSUES = [
  { crop: "Cotton", issues: [
    { name: "White Fly", symptoms: "Yellowing leaves, sticky residue", products: ["Imidacloprid", "Thiamethoxam"], dosage: "200ml/acre", safety: "14 days", alternatives: ["Acetamiprid", "Dinotefuran"] },
    { name: "Pink Bollworm", symptoms: "Damaged bolls, larvae inside", products: ["Chlorpyrifos", "Cypermethrin"], dosage: "500ml/acre", safety: "21 days", alternatives: ["Spinosad"] },
  ]},
  { crop: "Wheat", issues: [
    { name: "Rust Disease", symptoms: "Orange/brown pustules on leaves", products: ["Propiconazole", "Tebuconazole"], dosage: "200ml/acre", safety: "30 days", alternatives: ["Mancozeb"] },
    { name: "Aphids", symptoms: "Curling leaves, honeydew", products: ["Malathion", "Dimethoate"], dosage: "300ml/acre", safety: "14 days", alternatives: ["Imidacloprid"] },
  ]},
  { crop: "Rice", issues: [
    { name: "Stem Borer", symptoms: "Dead hearts, white heads", products: ["Carbofuran", "Fipronil"], dosage: "8kg/acre", safety: "30 days", alternatives: ["Chlorantraniliprole"] },
    { name: "Blast Disease", symptoms: "Diamond-shaped lesions", products: ["Tricyclazole", "Carbendazim"], dosage: "300g/acre", safety: "21 days", alternatives: ["Azoxystrobin"] },
  ]},
  { crop: "Sugarcane", issues: [
    { name: "Borers", symptoms: "Red tunnels in stem", products: ["Chlorpyrifos", "Fipronil"], dosage: "1L/acre", safety: "21 days", alternatives: ["Thiamethoxam"] },
  ]},
  { crop: "Vegetables", issues: [
    { name: "Fruit Borer", symptoms: "Holes in fruits", products: ["Cypermethrin", "Spinosad"], dosage: "200ml/acre", safety: "7 days", alternatives: ["Bt spray"] },
    { name: "Powdery Mildew", symptoms: "White powder on leaves", products: ["Sulfur", "Carbendazim"], dosage: "500g/acre", safety: "14 days", alternatives: ["Neem oil"] },
  ]},
];

const PestDiagnosis = () => {
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-glow-sm"><Bug className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Pest & Disease Diagnosis</h1><p className="text-sm text-slate-500 dark:text-slate-400">Select crop → Identify issue → Get recommendations</p></div>
      </div>

      {!selectedCrop ? (
        <div>
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">Select Crop</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {CROP_ISSUES.map(c => (
              <button key={c.crop} onClick={() => setSelectedCrop(c)} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 p-5 text-center hover:shadow-premium-lg hover:-translate-y-1 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform"><Sprout className="w-6 h-6 text-emerald-600 dark:text-emerald-400" /></div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{c.crop}</p>
                <p className="text-xs text-slate-400 mt-1">{c.issues.length} issues</p>
              </button>
            ))}
          </div>
        </div>
      ) : !selectedIssue ? (
        <div>
          <button onClick={() => setSelectedCrop(null)} className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold mb-4 hover:underline">← Back to crops</button>
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">Issues for {selectedCrop.crop}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {selectedCrop.issues.map(issue => (
              <button key={issue.name} onClick={() => setSelectedIssue(issue)} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 p-5 text-left hover:shadow-premium-lg transition-all group">
                <div className="flex items-center justify-between mb-2"><p className="font-bold text-slate-900 dark:text-white">{issue.name}</p><ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" /></div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{issue.symptoms}</p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <button onClick={() => setSelectedIssue(null)} className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold mb-4 hover:underline">← Back to {selectedCrop.crop} issues</button>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-premium p-6 space-y-5">
            <div><h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedIssue.name}</h2><p className="text-sm text-slate-500 mt-1">Crop: {selectedCrop.crop}</p></div>
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"><p className="text-sm font-medium text-amber-800 dark:text-amber-300"><strong>Symptoms:</strong> {selectedIssue.symptoms}</p></div>
            <div><h3 className="font-bold text-slate-900 dark:text-white text-sm mb-2">Recommended Products</h3><div className="flex flex-wrap gap-2">{selectedIssue.products.map(p => <span key={p} className="px-3 py-1.5 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">{p}</span>)}</div></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60"><p className="text-xs text-slate-400 mb-1">Dosage</p><p className="font-bold text-slate-900 dark:text-white text-sm">{selectedIssue.dosage}</p></div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60"><p className="text-xs text-slate-400 mb-1">Safety Interval</p><p className="font-bold text-slate-900 dark:text-white text-sm">{selectedIssue.safety}</p></div>
            </div>
            <div><h3 className="font-bold text-slate-900 dark:text-white text-sm mb-2">Alternatives</h3><div className="flex flex-wrap gap-2">{selectedIssue.alternatives.map(a => <span key={a} className="px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{a}</span>)}</div></div>
          </div>
        </div>
      )}
    </div>
  );
};
export default PestDiagnosis;
