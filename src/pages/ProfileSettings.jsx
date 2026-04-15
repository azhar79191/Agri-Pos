import React, { useState, useRef, useEffect } from "react";
import { User, Mail, Phone, MapPin, Lock, Eye, EyeOff, Camera, Save, Shield, Building2, Calendar } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import ModernButton from "../components/ui/ModernButton";
import { updateProfile, updatePassword } from "../api/authApi";
import { getMyShop } from "../api/shopApi";
import { formatDate } from "../utils/helpers";

const ProfileSettings = () => {
  const { state, actions } = useApp();
  const { user, refreshProfile } = useAuth();
  const { currentUser, settings } = state;
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

  useEffect(() => {
    if (displayUser) {
      setProfileForm({
        name: displayUser.name || "",
        phone: displayUser.phone || "",
        address: displayUser.address || "",
        avatar: displayUser.avatar || "",
      });
      setAvatarPreview(displayUser.avatar || "");
    }
    // Load shop info
    getMyShop().then(res => setShop(res.data.data?.shop)).catch(() => {});
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      actions.showToast({ message: "Image must be less than 2MB", type: "error" });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
      setProfileForm(prev => ({ ...prev, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await updateProfile(profileForm);
      const updated = res.data.data?.user ?? res.data.data;
      // Preserve existing shop — backend profile update may not return it
      const merged = { ...displayUser, ...updated, shop: updated.shop ?? displayUser?.shop };
      localStorage.setItem("user", JSON.stringify(merged));
      window.dispatchEvent(new CustomEvent("user-updated", { detail: merged }));
      actions.showToast({ message: "Profile updated successfully", type: "success" });
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Update failed", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      actions.showToast({ message: "New passwords do not match", type: "error" });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      actions.showToast({ message: "Password must be at least 6 characters", type: "error" });
      return;
    }
    setSavingPassword(true);
    try {
      await updatePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      actions.showToast({ message: "Password changed successfully", type: "success" });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Password change failed", type: "error" });
    } finally {
      setSavingPassword(false);
    }
  };

  const roleColors = { admin: "purple", manager: "blue", cashier: "emerald" };
  const roleLabels = { admin: "Administrator", manager: "Manager", cashier: "Cashier" };
  const role = displayUser?.role || "cashier";
  const color = roleColors[role] || "emerald";
  const initial = displayUser?.name?.[0]?.toUpperCase() || "U";

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "shop", label: "Shop Info", icon: Building2 },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">Profile Settings</h1>
        <p className="page-subtitle">Manage your account and preferences</p>
      </div>

      {/* Avatar + Name Card */}
      <Card padding="lg">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700 ring-4 ring-white dark:ring-gray-800 shadow-lg">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full bg-${color}-100 dark:bg-${color}-900/30 flex items-center justify-center`}>
                  <span className={`text-${color}-600 dark:text-${color}-400 font-bold text-3xl`}>{initial}</span>
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-lg transition-colors"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{displayUser?.name}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{displayUser?.email}</p>
            <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
              <span className={`text-xs px-3 py-1 rounded-full font-semibold bg-${color}-100 text-${color}-700 dark:bg-${color}-900/30 dark:text-${color}-400`}>
                {roleLabels[role]}
              </span>
              {displayUser?.lastLogin && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />Last login: {formatDate(displayUser.lastLogin?.split?.("T")?.[0])}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === id
                ? "bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">Personal Information</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text" value={profileForm.name}
                    onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email" value={displayUser?.email || ""} disabled
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-sm cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel" value={profileForm.phone}
                  onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="+92 300 0000000"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <textarea
                  value={profileForm.address} rows={2}
                  onChange={e => setProfileForm(p => ({ ...p, address: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                  placeholder="Your address"
                />
              </div>
            </div>

            {/* Role & Permissions Info */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Role & Permissions</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(displayUser?.permissions || []).map(p => (
                  <span key={p} className="text-xs px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-100 dark:border-emerald-800">
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <ModernButton variant="primary" onClick={handleSaveProfile} loading={saving} icon={Save}>
                Save Changes
              </ModernButton>
            </div>
          </div>
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">Change Password</h3>
          <div className="space-y-4">
            {[
              { key: "currentPassword", label: "Current Password", show: "current" },
              { key: "newPassword", label: "New Password", show: "new" },
              { key: "confirmPassword", label: "Confirm New Password", show: "confirm" },
            ].map(({ key, label, show }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPasswords[show] ? "text" : "password"}
                    value={passwordForm[key]}
                    onChange={e => setPasswordForm(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <button type="button" onClick={() => setShowPasswords(p => ({ ...p, [show]: !p[show] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPasswords[show] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
            <div className="flex justify-end">
              <ModernButton variant="primary" onClick={handleChangePassword} loading={savingPassword} icon={Lock}>
                Update Password
              </ModernButton>
            </div>
          </div>
        </Card>
      )}

      {/* Shop Tab */}
      {activeTab === "shop" && (
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">Shop Information</h3>
          {shop ? (
            <div className="space-y-4">
              {/* Shop Logo */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center flex-shrink-0">
                  {shop.logo ? (
                    <img src={shop.logo} alt={shop.name} className="w-full h-full object-contain" />
                  ) : (
                    <Building2 className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-lg">{shop.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{shop.email}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{shop.phone}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: "Address", value: shop.address },
                  { label: "Tax Rate", value: `${shop.taxRate}%` },
                  { label: "Currency", value: shop.currency },
                  { label: "Credit Enabled", value: shop.enableCredit ? "Yes" : "No" },
                ].map(({ label, value }) => (
                  <div key={label} className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                    <p className="font-medium text-gray-900 dark:text-white mt-0.5">{value || "—"}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 text-center">To edit shop details, go to Settings → Shop</p>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No shop assigned to your account</p>
              <p className="text-xs mt-1">Contact your administrator</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default ProfileSettings;
