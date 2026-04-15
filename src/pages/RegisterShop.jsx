import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sprout, ArrowRight, ArrowLeft, Building2, User, Mail, Phone, Lock,
  Eye, EyeOff, CheckCircle, Camera, Plus, Trash2, Loader2,
} from "lucide-react";
import { registerShopWithAdmin } from "../api/authApi";
import { createShop } from "../api/shopApi";
import { useApp } from "../context/AppContext";

const STEPS = [
  { id: 1, label: "Admin Account", icon: User },
  { id: 2, label: "Shop Info",     icon: Building2 },
  { id: 3, label: "Team Members",  icon: User },
  { id: 4, label: "Done",          icon: CheckCircle },
];

const emptyMember = { name: "", email: "", phone: "", password: "", role: "cashier" };

const inputCls = "w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm";

export default function RegisterShop() {
  const navigate = useNavigate();
  const { state, actions } = useApp();

  // If already authenticated, skip admin step — just create the shop
  const isLoggedIn = state.isAuthenticated && !!localStorage.getItem("token");
  const currentUser = state.currentUser;

  const [step, setStep]     = useState(isLoggedIn ? 2 : 1); // skip step 1 if logged in
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");
  const [result, setResult] = useState(null);

  // Step 1 — admin
  const [adminForm, setAdminForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [showPass, setShowPass]   = useState(false);

  // Step 2 — shop
  const [shopForm, setShopForm]       = useState({ name: "", address: "", phone: "", email: "", taxRate: "5", currency: "Rs.", receiptFooter: "Thank you for your purchase!" });
  const [logoPreview, setLogoPreview] = useState("");
  const [logoData, setLogoData]       = useState("");

  // Step 3 — team
  const [members, setMembers]               = useState([{ ...emptyMember }]);
  const [showMemberPass, setShowMemberPass] = useState([false]);

  // ── helpers ──────────────────────────────────────────────────
  const setA = (k, v) => setAdminForm(p => ({ ...p, [k]: v }));
  const setS = (k, v) => setShopForm(p => ({ ...p, [k]: v }));
  const updateMember    = (i, k, v) => setMembers(p => p.map((m, idx) => idx === i ? { ...m, [k]: v } : m));
  const addMember       = () => { setMembers(p => [...p, { ...emptyMember }]); setShowMemberPass(p => [...p, false]); };
  const removeMember    = (i) => { setMembers(p => p.filter((_, idx) => idx !== i)); setShowMemberPass(p => p.filter((_, idx) => idx !== i)); };
  const toggleMemberPass = (i) => setShowMemberPass(p => p.map((v, idx) => idx === i ? !v : v));

  const handleLogo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError("Logo must be < 2MB"); return; }
    const reader = new FileReader();
    reader.onloadend = () => { setLogoPreview(reader.result); setLogoData(reader.result); };
    reader.readAsDataURL(file);
  };

  // ── Step validations (client-side) ──────────────────────────
  const validateStep1 = () => {
    if (!adminForm.name || !adminForm.email || !adminForm.password) return "Name, email and password are required";
    if (adminForm.password !== adminForm.confirmPassword) return "Passwords do not match";
    if (adminForm.password.length < 6) return "Password must be at least 6 characters";
    return null;
  };

  const validateStep2 = () => {
    if (!shopForm.name.trim()) return "Shop name is required";
    return null;
  };

  // ── Final submit: single API call ────────────────────────────
  const handleSubmit = async (skipMembers = false) => {
    setError("");
    setSaving(true);
    try {
      const filledMembers = skipMembers
        ? []
        : members.filter(m => m.name.trim() && m.email.trim() && m.password.trim());

      let token, user;

      if (isLoggedIn) {
        // Already authenticated — just create the shop, token sent automatically
        const res = await createShop({
          name: shopForm.name,
          address: shopForm.address,
          phone: shopForm.phone,
          email: shopForm.email,
          taxRate: shopForm.taxRate,
          currency: shopForm.currency,
          receiptFooter: shopForm.receiptFooter,
          logo: logoData,
          members: filledMembers,
        });
        const shop = res.data.data?.shop ?? res.data.data;
        // Merge shop into current user and persist
        const updatedUser = { ...currentUser, shop };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        window.dispatchEvent(new CustomEvent("user-updated", { detail: updatedUser }));
        setResult({ shop, members: [] });
      } else {
        // Not logged in — register admin + shop together
        const res = await registerShopWithAdmin({
          admin: {
            name: adminForm.name,
            email: adminForm.email,
            phone: adminForm.phone,
            password: adminForm.password,
          },
          shop: {
            name: shopForm.name,
            address: shopForm.address,
            phone: shopForm.phone,
            email: shopForm.email,
            taxRate: shopForm.taxRate,
            currency: shopForm.currency,
            receiptFooter: shopForm.receiptFooter,
            logo: logoData,
          },
          members: filledMembers,
        });
        token = res.data.data?.token;
        user  = res.data.data?.user;
        if (!token || !user) throw new Error("Invalid response from server");
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        actions.login(user.email, null, user);
        setResult(res.data.data);
      }

      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || "Registration failed");
    } finally {
      setSaving(false);
    }
  };

  const goNext = () => {
    setError("");
    if (step === 1) {
      const err = validateStep1();
      if (err) { setError(err); return; }
    }
    if (step === 2) {
      const err = validateStep2();
      if (err) { setError(err); return; }
    }
    setStep(s => s + 1);
  };

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex">
      {/* Left branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-6">
            <Sprout className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4">AgroCare POS</h1>
          <p className="text-xl text-emerald-100 mb-8">Register your shop and get started in minutes</p>
          <div className="space-y-3">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const done   = step > s.id;
              const active = step === s.id;
              return (
                <div key={s.id} className={`flex items-center gap-4 rounded-xl p-4 transition-all ${active ? "bg-white/20" : done ? "bg-white/10" : "bg-white/5"}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${done ? "bg-emerald-400" : active ? "bg-white/30" : "bg-white/10"}`}>
                    {done ? <CheckCircle className="w-5 h-5 text-white" /> : <Icon className="w-5 h-5 text-white" />}
                  </div>
                  <p className={`font-semibold ${active ? "text-white" : "text-emerald-200"}`}>Step {i + 1}: {s.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-gray-50 dark:bg-gray-950 overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">AgroCare POS</span>
          </div>

          {/* Mobile step dots */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.id}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s.id ? "bg-emerald-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-400"}`}>
                  {step > s.id ? "✓" : s.id}
                </div>
                {i < STEPS.length - 1 && <div className={`h-0.5 w-8 ${step > s.id ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700"}`} />}
              </React.Fragment>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">

            {/* Error banner */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">{error}</div>
            )}

            {/* ── STEP 1: Admin Account ── */}
            {step === 1 && (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Admin Account</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">This will be the owner/admin of the new shop</p>
                </div>
                <div className="space-y-4">
                  {[
                    { label: "Full Name", key: "name", type: "text", icon: User, placeholder: "Admin Name", required: true },
                    { label: "Email Address", key: "email", type: "email", icon: Mail, placeholder: "admin@shop.com", required: true },
                    { label: "Phone (optional)", key: "phone", type: "tel", icon: Phone, placeholder: "+92 300 0000000" },
                  ].map(({ label, key, type, icon: Icon, placeholder, required }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
                      <div className="relative">
                        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type={type} value={adminForm[key]} onChange={e => setA(key, e.target.value)}
                          placeholder={placeholder} required={required} className={inputCls} />
                      </div>
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type={showPass ? "text" : "password"} value={adminForm.password} onChange={e => setA("password", e.target.value)}
                        placeholder="Min 6 characters" className={inputCls} />
                      <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="password" value={adminForm.confirmPassword} onChange={e => setA("confirmPassword", e.target.value)}
                        placeholder="Repeat password" className={inputCls} />
                    </div>
                  </div>
                  <button onClick={goNext}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold text-sm transition-colors mt-2">
                    Continue <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}

            {/* ── STEP 2: Shop Info ── */}
            {step === 2 && (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Shop Information</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    {isLoggedIn
                      ? `Setting up shop for ${currentUser?.name || "your account"}`
                      : "Set up your shop profile and settings"}
                  </p>
                </div>

                {/* Logo upload */}
                <div className="flex items-center gap-4 mb-5">
                  <label className="relative cursor-pointer group flex-shrink-0">
                    <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 group-hover:border-emerald-400 bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden transition-colors">
                      {logoPreview ? <img src={logoPreview} alt="logo" className="w-full h-full object-contain" /> : <Building2 className="w-8 h-8 text-gray-300" />}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center shadow">
                      <Camera className="w-3.5 h-3.5 text-white" />
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogo} />
                  </label>
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Shop Logo</p>
                    <p className="text-xs text-gray-400 mt-0.5">PNG or JPG, max 2MB. Shown on receipts.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { label: "Shop Name *", key: "name", type: "text", icon: Building2, placeholder: "e.g. AgroCare Pesticides" },
                    { label: "Phone", key: "phone", type: "tel", icon: Phone, placeholder: "+92 300 0000000" },
                    { label: "Email", key: "email", type: "email", icon: Mail, placeholder: "shop@example.com" },
                    { label: "Address", key: "address", type: "text", icon: Building2, placeholder: "Shop address" },
                  ].map(({ label, key, type, icon: Icon, placeholder }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
                      <div className="relative">
                        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type={type} value={shopForm[key]} onChange={e => setS(key, e.target.value)}
                          placeholder={placeholder} className={inputCls} />
                      </div>
                    </div>
                  ))}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tax Rate (%)</label>
                      <input type="number" min="0" max="100" value={shopForm.taxRate} onChange={e => setS("taxRate", e.target.value)}
                        className="w-full px-3 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Currency</label>
                      <select value={shopForm.currency} onChange={e => setS("currency", e.target.value)}
                        className="w-full px-3 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 text-sm">
                        {["Rs.", "₹", "$", "€", "£"].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => { setError(""); setStep(1); }}
                      className="flex items-center gap-2 px-5 py-3 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button onClick={goNext}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold text-sm transition-colors">
                      Continue <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ── STEP 3: Team Members ── */}
            {step === 3 && (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add Team Members</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Add managers & cashiers for <span className="font-semibold text-emerald-600">{shopForm.name}</span>. You can skip and add later.
                  </p>
                </div>

                <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                  {members.map((m, i) => (
                    <div key={i} className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-700 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Member {i + 1}</span>
                        {members.length > 1 && (
                          <button onClick={() => removeMember(i)} className="p-1 text-red-400 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input value={m.name} onChange={e => updateMember(i, "name", e.target.value)} placeholder="Full Name"
                          className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
                        <input type="email" value={m.email} onChange={e => updateMember(i, "email", e.target.value)} placeholder="Email"
                          className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
                        <div className="relative">
                          <input type={showMemberPass[i] ? "text" : "password"} value={m.password} onChange={e => updateMember(i, "password", e.target.value)} placeholder="Password"
                            className="w-full px-3 py-2 pr-8 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
                          <button type="button" onClick={() => toggleMemberPass(i)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                            {showMemberPass[i] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <select value={m.role} onChange={e => updateMember(i, "role", e.target.value)}
                          className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                          <option value="manager">Manager</option>
                          <option value="cashier">Cashier</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={addMember} className="mt-3 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-medium">
                  <Plus className="w-4 h-4" /> Add another member
                </button>

                <div className="flex gap-3 mt-6">
                  <button onClick={() => { setError(""); setStep(2); }}
                    className="flex items-center gap-2 px-4 py-3 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button onClick={() => handleSubmit(true)} disabled={saving}
                    className="px-4 py-3 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-60">
                    Skip
                  </button>
                  <button onClick={() => handleSubmit(false)} disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white rounded-xl font-semibold text-sm transition-colors">
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Finish Setup <ArrowRight className="w-5 h-5" /></>}
                  </button>
                </div>
              </>
            )}

            {/* ── STEP 4: Done ── */}
            {step === 4 && (
              <div className="text-center py-4">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Shop Created!</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-1">
                  <span className="font-semibold text-emerald-600">{result?.shop?.name}</span> is ready to go.
                </p>
                {result?.members?.length > 0 && (
                  <p className="text-sm text-gray-400 mb-2">
                    {result.members.filter(m => m.status === "created").length} team member(s) added.
                  </p>
                )}
                <p className="text-sm text-gray-400 mb-8">You are now logged in as admin. Start adding products and processing sales.</p>
                <button onClick={() => navigate("/dashboard")}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors">
                  Go to Dashboard
                </button>
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <button onClick={() => navigate("/")} className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
              Sign in
            </button>
          </p>
          {isLoggedIn && (
            <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
              <button onClick={() => navigate("/dashboard")} className="text-gray-400 hover:underline">
                ← Back to Dashboard
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
