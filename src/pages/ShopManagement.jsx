import React, { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { getMyShop, updateShop, createShop } from "../api/shopApi";
import ShopNav    from "./shop/ShopNav";
import ProfilePanel  from "./shop/ProfilePanel";
import BillingPanel  from "./shop/BillingPanel";
import TeamPanel     from "./shop/TeamPanel";
import RolesPanel    from "./shop/RolesPanel";
import StatsPanel    from "./shop/StatsPanel";
import ActivityPanel from "./shop/ActivityPanel";
import { SHOP_NAV } from "./shop/shopConfig";

const ALL_ITEMS = SHOP_NAV.flatMap(g => g.items);

const INIT_FORM = {
  name: "", address: "", phone: "", email: "",
  taxRate: "5", currency: "Rs.",
  receiptFooter: "Thank you for your purchase!",
  logo: "",
};

const ShopManagement = () => {
  const { state, actions } = useApp();
  const { refreshProfile } = useAuth();

  const [active, setActive]           = useState("profile");
  const [shop, setShop]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [form, setForm]               = useState(INIT_FORM);
  const [logoPreview, setLogoPreview] = useState("");
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);

  /* ── Load shop ── */
  useEffect(() => {
    getMyShop()
      .then(res => {
        const s = res.data.data?.shop;
        if (s) {
          setShop(s);
          setForm({
            name:          s.name          || "",
            address:       s.address       || "",
            phone:         s.phone         || "",
            email:         s.email         || "",
            taxRate:       String(s.taxRate ?? 5),
            currency:      s.currency      || "Rs.",
            receiptFooter: s.receiptFooter || "Thank you for your purchase!",
            logo:          s.logo          || "",
          });
          setLogoPreview(s.logo || "");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* ── Save handler shared by Profile + Billing panels ── */
  const handleSave = useCallback(async () => {
    if (!form.name.trim()) {
      actions.showToast({ message: "Shop name is required", type: "error" }); return;
    }
    setSaving(true);
    try {
      const payload = { ...form, taxRate: parseFloat(form.taxRate) || 0 };
      let updated;
      if (shop) {
        const res = await updateShop(shop._id, payload);
        updated = res.data.data?.shop ?? res.data.data;
      } else {
        const res = await createShop(payload);
        updated = res.data.data?.shop ?? res.data.data;
      }
      setShop(updated);
      actions.updateSettings({
        shopName:      updated.name,
        taxRate:       updated.taxRate,
        currency:      updated.currency,
        address:       updated.address,
        phone:         updated.phone,
        email:         updated.email,
        shopLogo:      updated.logo,
        receiptFooter: updated.receiptFooter,
      });
      // Sync into auth context so sidebar logo updates
      const freshUser = await refreshProfile?.();
      if (freshUser) actions.login(freshUser.email, null, { ...freshUser, shop: updated });

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      actions.showToast({ message: "Shop saved successfully", type: "success" });
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Failed to save shop", type: "error" });
    } finally { setSaving(false); }
  }, [form, shop, actions, refreshProfile]);

  const current = ALL_ITEMS.find(i => i.id === active);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
    </div>
  );

  /* ── Panel renderer ── */
  const renderPanel = () => {
    switch (active) {
      case "profile":
        return (
          <ProfilePanel
            form={form} setForm={setForm}
            logoPreview={logoPreview} setLogoPreview={setLogoPreview}
            saving={saving} saved={saved}
            onSave={handleSave} actions={actions}
          />
        );
      case "billing":
        return (
          <BillingPanel
            form={form} setForm={setForm}
            saving={saving} saved={saved}
            onSave={handleSave}
            shopName={form.name || state.settings?.shopName}
          />
        );
      case "team":
        return <TeamPanel shopId={shop?._id} />;
      case "roles":
        return <RolesPanel />;
      case "stats":
        return <StatsPanel />;
      case "activity":
        return <ActivityPanel />;
      default:
        return null;
    }
  };

  return (
    <div className="animate-fade-up space-y-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-5">
        <span className="text-xs text-slate-400 dark:text-slate-500">My Shop</span>
        <span className="text-xs text-slate-300 dark:text-slate-600">/</span>
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{current?.label}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Left nav */}
        <ShopNav
          active={active}
          onChange={setActive}
          shopName={form.name || state.settings?.shopName}
          logoPreview={logoPreview}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {renderPanel()}
        </div>
      </div>
    </div>
  );
};

export default ShopManagement;
