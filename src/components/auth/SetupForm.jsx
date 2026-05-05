import React, { useState } from "react";
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";

const Field = ({ label, type = "text", icon: Icon, value, onChange, placeholder, required, extra }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />}
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
        className="w-full pl-3 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
      />
      {extra}
    </div>
  </div>
);

/**
 * SetupForm — first-run admin account creation form.
 */
const SetupForm = ({ onSubmit, loading }) => {
  const [form, setForm]       = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [showPwd, setShowPwd] = useState(false);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <Field label="Full Name"       icon={User}  value={form.name}            onChange={set("name")}            placeholder="Admin Name"          required />
      <Field label="Email Address"   type="email" icon={Mail}  value={form.email}           onChange={set("email")}           placeholder="admin@yourshop.com"  required />
      <Field label="Phone (optional)"type="tel"   icon={Phone} value={form.phone}           onChange={set("phone")}           placeholder="+92 300 0000000" />
      <Field
        label="Password" type={showPwd ? "text" : "password"} icon={Lock}
        value={form.password} onChange={set("password")} placeholder="Min 6 characters" required
        extra={
          <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
            {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
      />
      <Field label="Confirm Password" type="password" icon={Lock} value={form.confirmPassword} onChange={set("confirmPassword")} placeholder="Repeat password" required />
      <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Create Admin Account</span><ArrowRight className="w-4 h-4" /></>}
      </button>
    </form>
  );
};

export default SetupForm;
