import React, { useRef } from "react";
import { Camera, Building2, Phone, Mail, MapPin, Save, Loader2, CheckCircle } from "lucide-react";
import ShopCard from "./ShopCard";
import { inp } from "./shopConfig";

const ProfilePanel = ({ form, setForm, logoPreview, setLogoPreview, saving, saved, onSave, actions }) => {
  const fileRef = useRef(null);

  const handleLogo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { actions.showToast({ message: "Logo must be < 2MB", type: "error" }); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
      setForm(p => ({ ...p, logo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-5">
      {/* Logo + identity */}
      <ShopCard title="Shop Identity" desc="Logo and display name shown on receipts and the sidebar"
        action={
          <button onClick={onSave} disabled={saving}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-all ${saved ? "bg-emerald-500" : "bg-blue-600 hover:bg-blue-700"}`}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : saved ? "Saved!" : "Save"}
          </button>
        }>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Logo uploader */}
          <div className="relative shrink-0 group cursor-pointer" onClick={() => fileRef.current?.click()}>
            <div className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 group-hover:border-blue-400 bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden transition-all">
              {logoPreview
                ? <img src={logoPreview} alt="logo" className="w-full h-full object-contain p-1" />
                : <Building2 className="w-10 h-10 text-slate-300 dark:text-slate-600" />}
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center shadow transition-colors">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
          </div>

          <div className="flex-1 space-y-3 w-full">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Shop Name <span className="text-red-500">*</span></label>
              <input value={form.name} onChange={e => f("name", e.target.value)} placeholder="e.g. AgriNest Pesticides" className={inp} />
            </div>
            <p className="text-xs text-slate-400">PNG or JPG, max 2MB. Displayed on receipts and the sidebar.</p>
          </div>
        </div>
      </ShopCard>

      {/* Contact info */}
      <ShopCard title="Contact Information" desc="Phone, email and address for your shop">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone
              </label>
              <input type="tel" value={form.phone} onChange={e => f("phone", e.target.value)} placeholder="+92 300 0000000" className={inp} />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Email
              </label>
              <input type="email" value={form.email} onChange={e => f("email", e.target.value)} placeholder="shop@example.com" className={inp} />
            </div>
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> Address
            </label>
            <textarea rows={2} value={form.address} onChange={e => f("address", e.target.value)}
              placeholder="Shop address" className={inp + " resize-none"} />
          </div>

          {/* Live contact preview */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Receipt Header Preview</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center overflow-hidden shrink-0">
                {logoPreview ? <img src={logoPreview} alt="logo" className="w-full h-full object-contain" /> : <Building2 className="w-5 h-5 text-slate-400" />}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{form.name || "Your Shop Name"}</p>
                <p className="text-xs text-slate-500">{form.phone || "Phone"} · {form.email || "Email"}</p>
                <p className="text-xs text-slate-400">{form.address || "Address"}</p>
              </div>
            </div>
          </div>
        </div>
      </ShopCard>
    </div>
  );
};

export default ProfilePanel;
