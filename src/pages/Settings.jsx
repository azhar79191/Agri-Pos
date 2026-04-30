import React, { useState } from "react";
import SettingsNav from "./settings/SettingsNav";
import ThemePanel from "./settings/ThemePanel";
import ShopPanel from "./settings/ShopPanel";
import TagsPanel from "./settings/TagsPanel";
import AlertsPanel from "./settings/AlertsPanel";
import AboutPanel from "./settings/AboutPanel";
import NotificationsPanel from "./settings/NotificationsPanel";
import DataPanel from "./settings/DataPanel";
import { addBrand, deleteBrand, addCategory, deleteCategory } from "../api/shopApi";
import { SETTINGS_NAV } from "./settings/settingsConfig";

const PANELS = {
  theme:         <ThemePanel />,
  shop:          <ShopPanel />,
  brands:        (
    <TagsPanel
      title="Product Brands"
      desc="Brands appear as a dropdown when adding or editing products"
      placeholder="e.g. Syngenta, Bayer, FMC, BASF..."
      emptyNote='No brands yet. Type a name above and press Enter or click Add.'
      addFn={addBrand}
      deleteFn={deleteBrand}
      listKey="brands"
    />
  ),
  categories:    (
    <TagsPanel
      title="Product Categories"
      desc="Custom categories appear in product forms and POS filters"
      placeholder="e.g. Herbicides, Seeds, Fertilizers..."
      emptyNote="No custom categories yet."
      addFn={addCategory}
      deleteFn={deleteCategory}
      listKey="categories"
    />
  ),
  alerts:        <AlertsPanel />,
  notifications: <NotificationsPanel />,
  data:          <DataPanel />,
  about:         <AboutPanel />,
};

// Flat list of all section ids for breadcrumb label lookup
const ALL_ITEMS = SETTINGS_NAV.flatMap(g => g.items);

const Settings = () => {
  const [active, setActive] = useState("theme");
  const current = ALL_ITEMS.find(i => i.id === active);

  return (
    <div className="animate-fade-up space-y-0">
      {/* Page title bar — ManageEngine style */}
      <div className="flex items-center gap-2 mb-5">
        <span className="text-xs text-slate-400 dark:text-slate-500">Settings</span>
        <span className="text-xs text-slate-300 dark:text-slate-600">/</span>
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{current?.label}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Left nav */}
        <SettingsNav active={active} onChange={setActive} />

        {/* Content panel */}
        <div className="flex-1 min-w-0">
          {PANELS[active] ?? null}
        </div>
      </div>
    </div>
  );
};

export default Settings;
