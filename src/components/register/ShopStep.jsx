import { Building2, Phone, Mail, Camera, ArrowLeft, ArrowRight } from "lucide-react";
import { InputField } from "../auth/InputField";

export const ShopStep = ({ form, onChange, logoPreview, onLogoChange, onBack, onNext, isLoggedIn, currentUser }) => {
  const fields = [
    { label: "Shop Name *", key: "name", type: "text", icon: Building2, placeholder: "e.g. AgriNest Pesticides" },
    { label: "Phone", key: "phone", type: "tel", icon: Phone, placeholder: "+92 300 0000000" },
    { label: "Email", key: "email", type: "email", icon: Mail, placeholder: "shop@example.com" },
    { label: "Address", key: "address", type: "text", icon: Building2, placeholder: "Shop address" },
  ];

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Shop Information</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          {isLoggedIn ? `Setting up shop for ${currentUser?.name || "your account"}` : "Set up your shop profile and settings"}
        </p>
      </div>

      <div className="flex items-center gap-4 mb-5">
        <label className="relative cursor-pointer group flex-shrink-0">
          <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 group-hover:border-emerald-400 bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden transition-colors">
            {logoPreview ? <img src={logoPreview} alt="logo" className="w-full h-full object-contain" /> : <Building2 className="w-8 h-8 text-gray-300" />}
          </div>
          <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center shadow">
            <Camera className="w-3.5 h-3.5 text-white" />
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={onLogoChange} />
        </label>
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Shop Logo</p>
          <p className="text-xs text-gray-400 mt-0.5">PNG or JPG, max 2MB. Shown on receipts.</p>
        </div>
      </div>

      <div className="space-y-4">
        {fields.map(({ label, key, type, icon, placeholder }) => (
          <InputField
            key={key}
            label={label}
            type={type}
            icon={icon}
            value={form[key]}
            onChange={(e) => onChange(key, e.target.value)}
            placeholder={placeholder}
          />
        ))}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tax Rate (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={form.taxRate}
              onChange={(e) => onChange("taxRate", e.target.value)}
              className="w-full px-3 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Currency</label>
            <select
              value={form.currency}
              onChange={(e) => onChange("currency", e.target.value)}
              className="w-full px-3 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {["Rs.", "₹", "$", "€", "£"].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          {!isLoggedIn && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-5 py-3 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}
          <button
            onClick={onNext}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors"
          >
            Continue <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
};
