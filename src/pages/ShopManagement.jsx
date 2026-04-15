import React, { useState, useEffect, useRef } from "react";
import { Building2, Camera, Save, Phone, Mail, MapPin, Percent, DollarSign, FileText, Users, Plus, Eye, EyeOff, X } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import ModernButton from "../components/ui/ModernButton";
import { getMyShop, createShop, updateShop, getShopUsers, addUserToShop } from "../api/shopApi";

const emptyUserForm = { name: "", email: "", phone: "", password: "", role: "cashier" };

const ShopManagement = () => {
  const { state, actions } = useApp();
  const { user, refreshProfile } = useAuth();
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

  // Users tab
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
          setForm({
            name: s.name || "",
            address: s.address || "",
            phone: s.phone || "",
            email: s.email || "",
            taxRate: s.taxRate?.toString() || "5",
            currency: s.currency || "Rs.",
            logo: s.logo || "",
            receiptFooter: s.receiptFooter || "Thank you for your purchase!",
          });
          setLogoPreview(s.logo || "");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === "users" && shop) loadUsers();
  }, [activeTab, shop]);

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await getShopUsers(shop._id);
      setShopUsers(res.data.data?.users || []);
    } catch { setShopUsers([]); }
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
      if (shop) {
        const res = await updateShop(shop._id, payload);
        updatedShop = res.data.data?.shop;
      } else {
        const res = await createShop(payload);
        updatedShop = res.data.data?.shop;
      }
      setShop(updatedShop);
      // Sync to AppContext settings so receipt shows correct data
      actions.updateSettings({
        shopName: updatedShop.name,
        taxRate: updatedShop.taxRate,
        currency: updatedShop.currency,
        address: updatedShop.address,
        phone: updatedShop.phone,
        email: updatedShop.email,
        shopLogo: updatedShop.logo,
        receiptFooter: updatedShop.receiptFooter,
      });
      // Refresh profile so user.shop is updated
      const updated = await refreshProfile?.();
      if (updated) actions.login(updated.email, null, { ...updated, shop: updatedShop });
      actions.showToast({ message: "Shop saved successfully", type: "success" });
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Failed to save shop", type: "error" });
    } finally { setSaving(false); }
  };

  const handleAddUser = async () => {
    if (!userForm.name || !userForm.email || !userForm.password) {
      actions.showToast({ message: "Name, email and password are required", type: "error" }); return;
    }
    setAddingUser(true);
    try {
      const res = await addUserToShop(shop._id, userForm);
      setShopUsers(prev => [...prev, res.data.data?.user]);
      actions.showToast({ message: "User added successfully", type: "success" });
      setShowAddUser(false);
      setUserForm(emptyUserForm);
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Failed to add user", type: "error" });
    } finally { setAddingUser(false); }
  };

  const tabs = [
    { id: "info", label: "Shop Info", icon: Building2 },
    { id: "users", label: "Team Members", icon: Users },
  ];

  if (loading) return <div className="text-center py-16 text-gray-500">Loading shop...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">My Shop</h1>
        <p className="page-subtitle">Manage your shop information and team</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === id ? "bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {/* Shop Info Tab */}
      {activeTab === "info" && (
        <Card padding="lg">
          {/* Logo */}
          <div className="flex items-center gap-5 mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
            <label className="relative cursor-pointer group flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 group-hover:border-emerald-400 bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden transition-colors">
                {logoPreview
                  ? <img src={logoPreview} alt="logo" className="w-full h-full object-contain" />
                  : <Building2 className="w-10 h-10 text-gray-300" />}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 hover:bg-emerald-600 rounded-xl flex items-center justify-center shadow transition-colors">
                <Camera className="w-4 h-4 text-white" />
              </div>
              <input type="file" accept="image/*" className="hidden" ref={logoInputRef} onChange={handleLogo} />
            </label>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-lg">{form.name || "Your Shop Name"}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Click the camera to upload your shop logo</p>
              <p className="text-xs text-gray-400 mt-1">PNG or JPG, max 2MB. Shown on receipts.</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Shop Name <span className="text-red-500">*</span></label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. AgroCare Pesticides"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+92 300 0000000"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="shop@example.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <textarea value={form.address} rows={2} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Shop address"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tax Rate (%)</label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="number" min="0" max="100" value={form.taxRate} onChange={e => setForm(p => ({ ...p, taxRate: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Currency</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                    {["Rs.", "₹", "$", "€", "£"].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Receipt Footer</label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={form.receiptFooter} onChange={e => setForm(p => ({ ...p, receiptFooter: e.target.value }))} placeholder="Thank you for your purchase!"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <ModernButton variant="primary" onClick={handleSave} loading={saving} icon={Save}>
                {shop ? "Save Changes" : "Create Shop"}
              </ModernButton>
            </div>
          </div>
        </Card>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <Card padding="lg">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Team Members</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{shopUsers.length} member{shopUsers.length !== 1 ? "s" : ""}</p>
            </div>
            <ModernButton variant="primary" size="sm" icon={Plus} onClick={() => setShowAddUser(true)}>Add Member</ModernButton>
          </div>

          {usersLoading ? (
            <p className="text-center text-gray-400 py-8 text-sm">Loading...</p>
          ) : shopUsers.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No team members yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {shopUsers.map(u => (
                <div key={u._id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-700">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">{u.name?.[0]?.toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{u.name}</p>
                    <p className="text-xs text-gray-500 truncate">{u.email}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    u.role === "admin" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" :
                    u.role === "manager" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  }`}>{u.role}</span>
                </div>
              ))}
            </div>
          )}

          {/* Add User inline form */}
          {showAddUser && (
            <div className="mt-5 p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">New Team Member</p>
                <button onClick={() => { setShowAddUser(false); setUserForm(emptyUserForm); }} className="text-gray-400 hover:text-gray-600">
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
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
                    <input type={type} value={userForm[key]} onChange={e => setUserForm(p => ({ ...p, [key]: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Password *</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={userForm.password} onChange={e => setUserForm(p => ({ ...p, password: e.target.value }))}
                      className="w-full px-3 py-2 pr-8 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
                    <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Role</label>
                  <select value={userForm.role} onChange={e => setUserForm(p => ({ ...p, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
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
        </Card>
      )}
    </div>
  );
};

export default ShopManagement;
