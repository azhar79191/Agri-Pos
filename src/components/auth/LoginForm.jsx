import React, { useState } from "react";
import { Mail, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";

/**
 * LoginForm — email + password sign-in form.
 */
const LoginForm = ({ initialEmail = "", onSubmit, loading }) => {
  const [form, setForm]       = useState({ email: initialEmail, password: "" });
  const [showPwd, setShowPwd] = useState(false);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
        <div className="relative">
          <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="email" value={form.email} onChange={set("email")} placeholder="Enter your email" required
            className="w-full pl-3 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
        <div className="relative">
          <input type={showPwd ? "text" : "password"} value={form.password} onChange={set("password")} placeholder="Enter your password" required
            className="w-full pl-3 pr-10 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm" />
          <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
            {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
      </button>
    </form>
  );
};

export default LoginForm;
