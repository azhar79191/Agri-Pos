import React, { useState, useEffect } from "react";
import { UserCheck, Plus, DollarSign, Target, TrendingUp } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { formatCurrency } from "../../utils/helpers";
import EmptyState from "../../components/ui/EmptyState";
import ModernModal from "../../components/ui/ModernModal";
import { getSalesReps, createSalesRep } from "../../api/salesRepsApi";

const MOCK = [
  { _id:"sr1",name:"Asif Iqbal",phone:"0300-111",territory:"Multan Region",commission:5,totalSales:125000,earned:6250,status:"active" },
  { _id:"sr2",name:"Kamran Shah",phone:"0321-222",territory:"Faisalabad Region",commission:4,totalSales:98000,earned:3920,status:"active" },
  { _id:"sr3",name:"Zubair Ahmed",phone:"0333-333",territory:"Sahiwal Region",commission:5,totalSales:75000,earned:3750,status:"inactive" },
];

const SalesReps = () => {
  const { state, actions } = useApp();
  const { settings } = state;
  const [reps, setReps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name:"",phone:"",territory:"",commission:"5" });

  useEffect(() => {
    getSalesReps()
      .then(res => setReps(res.data.data.reps))
      .catch(() => setReps(MOCK))
      .finally(() => setLoading(false));
  }, []);

  const totalEarned = reps.reduce((s,r)=>s+(r.earned||0),0);

  const handleAdd = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      const res = await createSalesRep({ ...form, commission: parseFloat(form.commission) || 5 });
      setReps(p => [...p, res.data.data.rep]);
      setShowModal(false);
      setForm({ name:"",phone:"",territory:"",commission:"5" });
      actions.showToast({ message:"Sales rep added", type:"success" });
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Failed to add rep", type:"error" });
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-glow-sm"><UserCheck className="w-5 h-5 text-white" /></div>
          <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Sales Representatives</h1><p className="text-sm text-slate-500 dark:text-slate-400">{reps.length} reps · Commission paid: {formatCurrency(totalEarned,settings.currency)}</p></div>
        </div>
        <button onClick={()=>setShowModal(true)} className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-glow-sm"><Plus className="w-4 h-4"/>Add Rep</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reps.map(r=>(
          <div key={r._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-premium p-5 space-y-3 hover:shadow-premium-lg transition-all">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center"><span className="text-white font-bold">{r.name[0]}</span></div>
              <div className="flex-1"><p className="font-bold text-slate-900 dark:text-white text-sm">{r.name}</p><p className="text-xs text-slate-400">{r.territory}</p></div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${r.status==="active"?"bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400":"bg-red-100 text-red-700"}`}>{r.status}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60"><p className="text-xs text-slate-400">Sales</p><p className="font-bold text-sm text-slate-900 dark:text-white">{formatCurrency(r.totalSales,settings.currency)}</p></div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60"><p className="text-xs text-slate-400">Rate</p><p className="font-bold text-sm text-blue-600">{r.commission}%</p></div>
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20"><p className="text-xs text-slate-400">Earned</p><p className="font-bold text-sm text-emerald-600">{formatCurrency(r.earned,settings.currency)}</p></div>
            </div>
          </div>
        ))}
      </div>
      {reps.length===0 && <EmptyState icon={UserCheck} title="No sales reps" actionLabel="Add Rep" onAction={()=>setShowModal(true)}/>}
      <ModernModal isOpen={showModal} onClose={()=>setShowModal(false)} title="Add Sales Rep" footer={<button onClick={handleAdd} disabled={saving} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl text-sm font-semibold">{saving ? "Adding..." : "Add"}</button>}>
        <div className="space-y-4">
          {[{l:"Name *",k:"name"},{l:"Phone",k:"phone"},{l:"Territory",k:"territory"},{l:"Commission %",k:"commission",t:"number"}].map(({l,k,t})=>(
            <div key={k}><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{l}</label><input type={t||"text"} value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"/></div>
          ))}
        </div>
      </ModernModal>
    </div>
  );
};
export default SalesReps;
