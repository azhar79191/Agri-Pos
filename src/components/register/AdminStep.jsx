import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { InputField } from "../auth/InputField";

export const AdminStep = ({ form, onChange, showPassword, togglePassword, onNext }) => {
  const fields = [
    { label: "Full Name", key: "name", type: "text", icon: User, placeholder: "Admin Name", required: true },
    { label: "Email Address", key: "email", type: "email", icon: Mail, placeholder: "admin@shop.com", required: true },
    { label: "Phone (optional)", key: "phone", type: "tel", icon: Phone, placeholder: "+92 300 0000000" },
  ];

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Admin Account</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          This will be the owner/admin of the new shop
        </p>
      </div>
      <div className="space-y-4">
        {fields.map(({ label, key, type, icon, placeholder, required }) => (
          <InputField
            key={key}
            label={label}
            type={type}
            icon={icon}
            value={form[key]}
            onChange={(e) => onChange(key, e.target.value)}
            placeholder={placeholder}
            required={required}
          />
        ))}
        <InputField
          label="Password"
          type={showPassword ? "text" : "password"}
          icon={Lock}
          value={form.password}
          onChange={(e) => onChange("password", e.target.value)}
          placeholder="Min 6 characters"
          required
          extra={
            <button type="button" onClick={togglePassword} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          }
        />
        <InputField
          label="Confirm Password"
          type="password"
          icon={Lock}
          value={form.confirmPassword}
          onChange={(e) => onChange("confirmPassword", e.target.value)}
          placeholder="Repeat password"
          required
        />
        <button
          onClick={onNext}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors mt-2"
        >
          Continue <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </>
  );
};
