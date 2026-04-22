import React, { useState, useRef, useEffect } from "react";
import { User, Mail, Phone, MapPin, Lock, Eye, EyeOff, Camera, Save, Shield, Building2, Calendar, CheckCircle } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import ModernButton from "../components/ui/ModernButton";
import { updateProfile, updatePassword } from "../api/authApi";
import { getMyShop } from "../api/shopApi";
import { formatDate } from "../utils/helpers";

const inputCls = "w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all";

const roleConfig = {
  admin:   { label: "Administrator", gradient: "from-purple-500 to-violet-600", cls: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  manager: { label: "Manager",       gradient: "from-blue-500 to-indigo-600",   cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  cashier: { label: "Cashier",       gradient: "from-emerald-500 to-teal-600",  cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
};

const ProfileSettings = () => {
  const { state, actions } = useApp();
  const { user } = useAuth();
  const { currentUser } = state;
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("profile");
  const [profileForm, setProfileForm] = useState({ name: "", phone: "", address: "", avatar: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [avatarPreview, setAvatarPreview] = useState("");
  const [shop, setShop] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const displayUser = user || currentUser;
  const role = displayUser?.role || "cashier";
  const rc = roleConfig[role] || roleConfig.cashier;
  const initial = displayUser?.name?.[0]?.toUpperCase() || "U";

  useEffect(() => {
    if (displayUser) {
      setProfileForm({ name: displayUser.name || "", phone: displayUser.phone || "", address: displayUser.address || "", avatar: displayUser.avatar || "" });
      setAvatarPreview(displayUser.avatar || "");
    }
    getMyShop().then(res => setShop(res.data.data?.shop)).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { actions.showToast({ message: "Image must be less than 2MB", type: "error" }); return; }
    const reader = new FileReader();
    reader.onloadend = () => { setAvatarPreview(reader.result); setProfileForm(prev => ({ ...prev, avatar: reader.result })); };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await updateProfile(profileForm);
      const updated = res.data.data?.user ?? res.data.data;
      const merged = { ...displayUser, ...updated, shop: updated.shop ?? displayUser?.shop };
      localStorage.setItem("user", JSON.stringify(merged));
      window.dispatchEvent(new CustomEvent("user-updated", { detail: merged }));
      actions.showToast({ message: "Profile updated successfully", type: "success" });
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Update failed", type: "error" });
    } finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { actions.showToast({ message: "New passwords do not match", type: "error" }); return; }
    if (passwordForm.newPassword.length < 6) { actions.showToast({ message: "Password must be at least 6 characters", type: "error" }); return; }
    setSavingPassword(true);
    try {
      await updatePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      actions.showToast({ message: "Password changed successfully", type: "success" });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Password change failed", type: "error" });
    } finally { setSavingPassword(false); }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "shop", label: "Shop Info", icon: Building2 },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-glow-sm">
          <User className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Profile Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your account and preferences</p>
        </div>
      </div>

      {/* Avatar Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-premium p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-white dark:ring-slate-800 shadow-premium">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${rc.gradient} flex items-center justify-center`}>
                  <span className="text-white font-bold text-3xl">{initial}</span>
                </div>
              )}
            </div>
            <button onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-glow-sm transition-colors">
              <Camera className="w-4 h-4" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{displayUser?.name}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{displayUser?.email}</p>
            <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start flex-wrap">
              <span className={`text-xs px-3 py-1 rounded-full font-semibold ${rc.cls}`}>{rc.label}</span>
              {displayUser?.lastLogin && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />Last login: {formatDate(displayUser.lastLogin?.split?.("T")?.[0])}
                </span>
              )}
            </div>
          </div>
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

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-premium p-6">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-5">Personal Information</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" value={displayUser?.email || ""} disabled className={inputCls + " opacity-60 cursor-not-allowed"} />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="tel" value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} className={inputCls} placeholder="+92 300 0000000" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <textarea value={profileForm.address} rows={2} onChange={e => setProfileForm(p => ({ ...p, address: e.target.value }))} className={inputCls + " resize-none"} placeholder="Your address" />
              </div>
            </div>

            {/* Permissions */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Role & Permissions</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(displayUser?.permissions || []).map(p => (
                  <span key={p} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-100 dark:border-emerald-800">
                    <CheckCircle className="w-2.5 h-2.5" />{p}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <ModernButton variant="primary" onClick={handleSaveProfile} loading={saving} icon={Save}>Save Changes</ModernButton>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-premium p-6">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-5">Change Password</h3>
          <div className="space-y-4">
            {[
              { key: "currentPassword", label: "Current Password", show: "current" },
              { key: "newPassword", label: "New Password", show: "new" },
              { key: "confirmPassword", label: "Confirm New Password", show: "confirm" },
            ].map(({ key, label, show }) => (
              <div key={key}>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type={showPasswords[show] ? "text" : "password"} value={passwordForm[key]} onChange={e => setPasswordForm(p => ({ ...p, [key]: e.target.value }))} className={inputCls + " pr-10"} />
                  <button type="button" onClick={() => setShowPasswords(p => ({ ...p, [show]: !p[show] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPasswords[show] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
            <div className="flex justify-end">
              <ModernButton variant="primary" onClick={handleChangePassword} loading={savingPassword} icon={Lock}>Update Password</ModernButton>
            </div>
          </div>
        </div>
      )}

      {/* Shop Tab */}
      {activeTab === "shop" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-premium p-6">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-5">Shop Information</h3>
          {shop ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center flex-shrink-0">
                  {shop.logo ? <img src={shop.logo} alt={shop.name} className="w-full h-full object-contain" /> : <Building2 className="w-7 h-7 text-slate-400" />}
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{shop.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{shop.email}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{shop.phone}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Address", value: shop.address },
                  { label: "Tax Rate", value: `${shop.taxRate}%` },
                  { label: "Currency", value: shop.currency },
                  { label: "Credit Enabled", value: shop.enableCredit ? "Yes" : "No" },
                ].map(({ label, value }) => (
                  <div key={label} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm mt-0.5">{value || "—"}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 text-center">To edit shop details, go to Settings → My Shop</p>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 dark:text-slate-400">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No shop assigned to your account</p>
              <p className="text-xs mt-1">Contact your administrator</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;
