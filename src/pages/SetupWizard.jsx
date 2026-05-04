import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Building2, Users, CheckCircle, ArrowRight, ArrowLeft, Plus, Trash2, Eye, EyeOff, Sprout, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { createShop } from "../api/shopApi";
import { registerUser } from "../api/authApi";

const STEPS = [
  { id: 1, label: "Shop Info",  icon: Building2 },
  { id: 2, label: "Add Users",  icon: Users },
  { id: 3, label: "Done",       icon: CheckCircle },
];

const emptyUser = { name: "", email: "", phone: "", password: "", role: "cashier" };

const SetupWizard = () => {
  const { actions } = useApp();
  const { refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [createdShop, setCreatedShop] = useState(null);

  // Step 1 — shop form
  const [shopForm, setShopForm] = useState({
    name: "", address: "", phone: "", email: "",
    taxRate: "5", currency: "Rs.", logo: "", receiptFooter: "Thank you for your purchase!",
  });
  const [logoPreview, setLogoPreview] = useState("");

  // Step 2 — users
  const [users, setUsers] = useState([{ ...emptyUser }]);
  const [showPasswords, setShowPasswords] = useState([false]);

  // ── Logo upload ───────────────────────────────────────────────
  const handleLogo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { actions.showToast({ message: "Logo must be < 2MB", type: "error" }); return; }
    const reader = new FileReader();
    reader.onloadend = () => { setLogoPreview(reader.result); setShopForm(p => ({ ...p, logo: reader.result })); };
    reader.readAsDataURL(file);
  };

  // ── Step 1: Create shop ───────────────────────────────────────
  const handleCreateShop = async () => {
    if (!shopForm.name.trim()) { actions.showToast({ message: "Shop name is required", type: "error" }); return; }
    setSaving(true);
    try {
      const res = await createShop({ ...shopForm, taxRate: parseFloat(shopForm.taxRate) || 0 });
      const shop = res.data.data?.shop;
      setCreatedShop(shop);
      // Refresh profile and sync shop into AppContext settings
      const updated = await refreshProfile?.();
      if (updated) {
        actions.login(updated.email, null, { ...updated, shop });
      }
      setStep(2);
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Failed to create shop", type: "error" });
    } finally { setSaving(false); }
  };

  // ── Step 2: Add users ─────────────────────────────────────────
  const addUserRow = () => { setUsers(p => [...p, { ...emptyUser }]); setShowPasswords(p => [...p, false]); };
  const removeUserRow = (i) => { setUsers(p => p.filter((_, idx) => idx !== i)); setShowPasswords(p => p.filter((_, idx) => idx !== i)); };
  const updateUser = (i, key, val) => setUsers(p => p.map((u, idx) => idx === i ? { ...u, [key]: val } : u));
  const togglePass = (i) => setShowPasswords(p => p.map((v, idx) => idx === i ? !v : v));

  const handleAddUsers = async () => {
    const filled = users.filter(u => u.name.trim() && u.email.trim() && u.password.trim());
    if (filled.length === 0) { setStep(3); return; } // skip if none filled
    setSaving(true);
    let added = 0;
    for (const u of filled) {
      try {
        await registerUser({ name: u.name, email: u.email, phone: u.phone, password: u.password, role: u.role });
        added++;
      } catch (err) {
        actions.showToast({ message: `${u.email}: ${err.response?.data?.message || "Failed"}`, type: "error" });
      }
    }
    setSaving(false);
    if (added > 0) actions.showToast({ message: `${added} user(s) added`, type: "success" });
    setStep(3);
  };

  // ── Step 3: Finish ────────────────────────────────────────────
  const handleFinish = () => {
    // Force full page reload to ensure app re-renders with new shop data
    window.location.href = "/dashboard";
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="p-3 bg-blue-600 rounded-lg shadow-sm">
            <Sprout className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">AgroCare POS</span>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center mb-8 gap-0">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = step > s.id;
            const active = step === s.id;
            return (
              <React.Fragment key={s.id}>
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    done ? "bg-blue-600 text-white" : active ? "bg-blue-600 text-white shadow-sm" : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                  }`}>
                    {done ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs font-medium ${active ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400"}`}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 w-16 mb-5 mx-1 transition-all ${step > s.id ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700"}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-100 dark:border-gray-800">

          {/* ── Step 1: Shop Info ── */}
          {step === 1 && (
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Set Up Your Shop</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This will be your shop's profile. You can update it later in Settings.</p>
              </div>

              {/* Logo */}
              <div className="flex items-center gap-5 mb-6">
                <label className="relative cursor-pointer group">
                  <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 group-hover:border-emerald-400 bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden transition-colors">
                    {logoPreview
                      ? <img src={logoPreview} alt="logo" className="w-full h-full object-contain" />
                      : <Building2 className="w-8 h-8 text-gray-400" />}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center shadow">
                    <Camera className="w-3.5 h-3.5 text-white" />
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogo} />
                </label>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Shop Logo</p>
                  <p className="text-xs text-gray-400 mt-0.5">PNG or JPG, max 2MB</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shop Name <span className="text-red-500">*</span></label>
                    <input value={shopForm.name} onChange={e => setShopForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. AgroCare Pesticides"
                      className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                    <input value={shopForm.phone} onChange={e => setShopForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="+92 300 0000000"
                      className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input type="email" value={shopForm.email} onChange={e => setShopForm(p => ({ ...p, email: e.target.value }))}
                      placeholder="shop@example.com"
                      className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                    <input value={shopForm.address} onChange={e => setShopForm(p => ({ ...p, address: e.target.value }))}
                      placeholder="Shop address"
                      className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tax Rate (%)</label>
                    <input type="number" min="0" max="100" value={shopForm.taxRate} onChange={e => setShopForm(p => ({ ...p, taxRate: e.target.value }))}
                      className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency</label>
                    <select value={shopForm.currency} onChange={e => setShopForm(p => ({ ...p, currency: e.target.value }))}
                      className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      {["Rs.", "₹", "$", "€", "£"].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button onClick={handleCreateShop} disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm">
                  {saving ? "Creating..." : "Create Shop"} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Add Users ── */}
          {step === 2 && (
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Team Members</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add managers and cashiers for <span className="font-medium text-emerald-600">{createdShop?.name}</span>. You can skip and add them later.</p>
              </div>

              <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                {users.map((u, i) => (
                  <div key={i} className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-100 dark:border-gray-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">User {i + 1}</span>
                      {users.length > 1 && (
                        <button onClick={() => removeUserRow(i)} className="p-1 text-red-400 hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input value={u.name} onChange={e => updateUser(i, "name", e.target.value)} placeholder="Full Name"
                        className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
                      <input type="email" value={u.email} onChange={e => updateUser(i, "email", e.target.value)} placeholder="Email"
                        className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
                      <div className="relative">
                        <input type={showPasswords[i] ? "text" : "password"} value={u.password} onChange={e => updateUser(i, "password", e.target.value)} placeholder="Password"
                          className="w-full px-3 py-2 pr-9 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
                        <button type="button" onClick={() => togglePass(i)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                          {showPasswords[i] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <select value={u.role} onChange={e => updateUser(i, "role", e.target.value)}
                        className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                        <option value="manager">Manager</option>
                        <option value="cashier">Cashier</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={addUserRow} className="mt-3 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-medium transition-colors">
                <Plus className="w-4 h-4" />Add another user
              </button>

              <div className="flex justify-between mt-8">
                <button onClick={() => setStep(1)} className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <ArrowLeft className="w-4 h-4" />Back
                </button>
                <div className="flex gap-3">
                  <button onClick={() => setStep(3)} className="px-5 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    Skip for now
                  </button>
                  <button onClick={handleAddUsers} disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm">
                    {saving ? "Adding..." : "Add Users"} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Done ── */}
          {step === 3 && (
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">You're all set!</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                <span className="font-semibold text-emerald-600">{createdShop?.name}</span> has been created successfully.
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">Start adding products, customers and processing sales.</p>

              <div className="grid grid-cols-3 gap-3 mb-8 text-sm">
                {[
                  { label: "Add Products", path: "/products", emoji: "📦" },
                  { label: "Add Customers", path: "/customers", emoji: "👥" },
                  { label: "Start Selling", path: "/pos", emoji: "💰" },
                ].map(item => (
                  <button key={item.path} onClick={() => navigate(item.path)}
                    className="p-4 bg-gray-50 dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-gray-100 dark:border-gray-700 rounded-lg transition-colors">
                    <div className="text-2xl mb-1">{item.emoji}</div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">{item.label}</p>
                  </button>
                ))}
              </div>

              <button onClick={handleFinish}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-sm">
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SetupWizard;
