import React, { useState, useEffect, useRef } from "react";
import { Building2, Camera, Save, Phone, Mail, MapPin, Percent, DollarSign, FileText, Users, Plus, Eye, EyeOff, X, Store } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import ModernButton from "../components/ui/ModernButton";
import { getMyShop, createShop, updateShop, getShopUsers, addUserToShop } from "../api/shopApi";

const emptyUserForm = { name: "", email: "", phone: "", password: "", role: "cashier" };

const inputCls = "w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all";

const roleConfig = {
  admin:   "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  manager: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  cashier: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

const ShopManagement = () => {
  const { state, actions } = useApp();
  const { refreshProfile } = useAuth();
  const logoInputRef = useRef(null);

  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState("");
  const [activeTab, setActiveTab] = useState("info");

  const [form, setForm] = useState({
    name: "", address: "", phone: "", email: "",
    taxRate: "5", currency: "Rs.", logo: "",
    receiptFooter: "Thank you for your purchase!",
  });

  const [shopUsers, setShopUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [showPassword, setShowPassword] = useState(false);
  const [addingUser, setAddingUser] = useState(false);

  useEffect(() => {
    getMyShop()
      .then(res => {
        const s = res.data.data?.shop;
        if (s) {
          setShop(s);
          setForm({ name: s.name || "", address: s.address || "", phone: s.phone || "", email: s.email || "", taxRate: s.taxRate?.toString() || "5", currency: s.currency || "Rs.", logo: s.logo || "", receiptFooter: s.receiptFooter || "Thank you for your purchase!" });
          setLogoPreview(s.logo || "");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { if (activeTab === "users" && shop) loadUsers(); }, [activeTab, shop]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadUsers = async () => {
    setUsersLoading(true);
    try { const res = await getShopUsers(shop._id); setShopUsers(res.data.data?.users || []); }
    catch { setShopUsers([]); }
    finally { setUsersLoading(false); }
  };

  const handleLogo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { actions.showToast({ message: "Logo must be < 2MB", type: "error" }); return; }
    const reader = new FileReader();
    reader.onloadend = () => { setLogoPreview(reader.result); setForm(p => ({ ...p, logo: reader.result })); };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { actions.showToast({ message: "Shop name is required", type: "error" }); return; }
    setSaving(true);
    try {
      const payload = { ...form, taxRate: parseFloat(form.taxRate) || 0 };
      let updatedShop;
      if (shop) { const res = await updateShop(shop._id, payload); updatedShop = res.data.data?.shop; }
      else { const res = await createShop(payload); updatedShop = res.data.data?.shop; }
      setShop(updatedShop);
      actions.updateSettings({ shopName: updatedShop.name, taxRate: updatedShop.taxRate, currency: updatedShop.currency, address: updatedShop.address, phone: updatedShop.phone, email: updatedShop.email, shopLogo: updatedShop.logo, receiptFooter: updatedShop.receiptFooter });
      const updated = await refreshProfile?.();
      if (updated) actions.login(updated.email, null, { ...updated, shop: updatedShop });
      actions.showToast({ message: "Shop saved successfully", type: "success" });
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Failed to save shop", type: "error" });
    } finally { setSaving(false); }
  };

  const handleAddUser = async () => {
    if (!userForm.name || !userForm.email || !userForm.password) { actions.showToast({ message: "Name, email and password are required", type: "error" }); return; }
    setAddingUser(true);
    try {
      const res = await addUserToShop(shop._id, userForm);
      setShopUsers(prev => [...prev, res.data.data?.user]);
      actions.showToast({ message: "User added successfully", type: "success" });
      setShowAddUser(false); setUserForm(emptyUserForm);
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Failed to add user", type: "error" });
    } finally { setAddingUser(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const tabs = [
    { id: "info", label: "Shop Info", icon: Building2 },
    { id: "users", label: "Team Members", icon: Users },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-glow-sm">
          <Store className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">My Shop</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your shop information and team</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === id ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {/* Shop Info Tab */}
      {activeTab === "info" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-premium p-6">
          {/* Logo */}
          <div className="flex items-center gap-5 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <label className="relative cursor-pointer group flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 group-hover:border-emerald-400 bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden transition-colors">
                {logoPreview ? <img src={logoPreview} alt="logo" className="w-full h-full object-contain" /> : <Building2 className="w-10 h-10 text-slate-300 dark:text-slate-600" />}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 hover:bg-emerald-600 rounded-xl flex items-center justify-center shadow-glow-sm transition-colors">
                <Camera className="w-4 h-4 text-white" />
              </div>
              <input type="file" accept="image/*" className="hidden" ref={logoInputRef} onChange={handleLogo} />
            </label>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-lg">{form.name || "Your Shop Name"}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Click the camera to upload your shop logo</p>
              <p className="text-xs text-slate-400 mt-1">PNG or JPG, max 2MB. Shown on receipts.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Shop Name <span className="text-red-500">*</span></label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. AgroCare Pesticides" className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Phone", key: "phone", type: "tel", icon: Phone, placeholder: "+92 300 0000000" },
                { label: "Email", key: "email", type: "email", icon: Mail, placeholder: "shop@example.com" },
              ].map(({ label, key, type, icon: Icon, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
                  <div className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type={type} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} className={inputCls} />
                  </div>
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <textarea value={form.address} rows={2} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Shop address" className={inputCls + " resize-none"} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Tax Rate (%)</label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="number" min="0" max="100" value={form.taxRate} onChange={e => setForm(p => ({ ...p, taxRate: e.target.value }))} className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Currency</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))} className={inputCls + " appearance-none"}>
                    {["Rs.", "₹", "$", "€", "£"].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Receipt Footer</label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input value={form.receiptFooter} onChange={e => setForm(p => ({ ...p, receiptFooter: e.target.value }))} placeholder="Thank you for your purchase!" className={inputCls} />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <ModernButton variant="primary" onClick={handleSave} loading={saving} icon={Save}>
                {shop ? "Save Changes" : "Create Shop"}
              </ModernButton>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-premium p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Team Members</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{shopUsers.length} member{shopUsers.length !== 1 ? "s" : ""}</p>
            </div>
            <ModernButton variant="primary" size="sm" icon={Plus} onClick={() => setShowAddUser(true)}>Add Member</ModernButton>
          </div>

          {usersLoading ? (
            <p className="text-center text-slate-400 py-8 text-sm">Loading...</p>
          ) : shopUsers.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
              <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No team members yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {shopUsers.map(u => (
                <div key={u._id} className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">{u.name?.[0]?.toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{u.name}</p>
                    <p className="text-xs text-slate-500 truncate">{u.email}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${roleConfig[u.role] || roleConfig.cashier}`}>{u.role}</span>
                </div>
              ))}
            </div>
          )}

          {showAddUser && (
            <div className="mt-5 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">New Team Member</p>
                <button onClick={() => { setShowAddUser(false); setUserForm(emptyUserForm); }} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Full Name *", key: "name", type: "text" },
                  { label: "Email *", key: "email", type: "email" },
                  { label: "Phone", key: "phone", type: "tel" },
                ].map(({ label, key, type }) => (
                  <div key={key} className={key === "name" ? "col-span-2 sm:col-span-1" : ""}>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{label}</label>
                    <input type={type} value={userForm[key]} onChange={e => setUserForm(p => ({ ...p, [key]: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Password *</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={userForm.password} onChange={e => setUserForm(p => ({ ...p, password: e.target.value }))}
                      className="w-full px-3 py-2 pr-8 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all" />
                    <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Role</label>
                  <select value={userForm.role} onChange={e => setUserForm(p => ({ ...p, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm">
                    <option value="manager">Manager</option>
                    <option value="cashier">Cashier</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <ModernButton variant="secondary" size="sm" onClick={() => { setShowAddUser(false); setUserForm(emptyUserForm); }}>Cancel</ModernButton>
                <ModernButton variant="primary" size="sm" onClick={handleAddUser} loading={addingUser} icon={Plus}>Add Member</ModernButton>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShopManagement;
