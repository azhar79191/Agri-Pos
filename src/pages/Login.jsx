import { useState, useEffect } from "react";
import { Sprout, Eye, EyeOff, Lock, Mail, ArrowRight, User, Phone, Loader2, Sparkles, Shield, BarChart3, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { getSetupStatus, registerUser } from "../api/authApi";

const features = [
  { icon: Package,   title: "Smart Inventory",   desc: "Real-time stock tracking & alerts" },
  { icon: BarChart3, title: "Deep Analytics",     desc: "Insights that drive decisions" },
  { icon: Shield,    title: "Role-Based Access",  desc: "Secure multi-user management" },
];

const InputField = ({ label, type = "text", icon: Icon, value, onChange, placeholder, required, extra }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all text-sm"
      />
      {extra}
    </div>
  </div>
);

const Login = () => {
  const { login, loading } = useAuth();
  const { actions } = useApp();
  const navigate = useNavigate();

  const [mode, setMode] = useState("checking");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [setupForm, setSetupForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [setupLoading, setSetupLoading] = useState(false);

  useEffect(() => {
    if (window.location.pathname === "/register") { navigate("/register"); return; }
    getSetupStatus()
      .then(r => setMode(r.data.data.setupRequired ? "setup" : "login"))
      .catch(() => setMode("login"));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault(); setError("");
    try {
      const user = await login({ email: loginForm.email, password: loginForm.password });
      actions.login(user.email, null, user);
      navigate("/dashboard");
    } catch (err) { setError(err.message || "Invalid credentials. Please try again."); }
  };

  const handleSetup = async (e) => {
    e.preventDefault(); setError("");
    if (setupForm.password !== setupForm.confirmPassword) { setError("Passwords do not match"); return; }
    if (setupForm.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setSetupLoading(true);
    try {
      await registerUser({ name: setupForm.name, email: setupForm.email, phone: setupForm.phone, password: setupForm.password, role: "admin" });
      actions.showToast({ message: "Admin account created! Please log in.", type: "success" });
      setMode("login");
      setLoginForm({ email: setupForm.email, password: "" });
    } catch (err) { setError(err.response?.data?.message || "Setup failed"); }
    finally { setSetupLoading(false); }
  };

  if (mode === "checking") return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-glow animate-pulse">
          <Sprout className="w-6 h-6 text-white" />
        </div>
        <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
        <p className="text-sm text-slate-500">Connecting to server...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">

      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-1/2 relative overflow-hidden bg-slate-950 flex-col justify-between p-12">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-teal-500/8 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-gold-500/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-glow">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-lg tracking-tight leading-none">CropNest POS</p>
              <p className="text-[11px] text-emerald-400/70 mt-0.5 tracking-widest uppercase">Pesticide Management</p>
            </div>
          </div>

          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400 tracking-wide">Premium Agricultural POS</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight tracking-tight mb-4">
              {mode === "setup" ? "Welcome.\nLet's get started." : "Manage your\nagri business."}
            </h1>
            <p className="text-slate-400 text-base leading-relaxed max-w-sm">
              {mode === "setup"
                ? "Set up your admin account to unlock the full power of AgroCare POS."
                : "A complete point-of-sale solution built for modern pesticide and agri shops."}
            </p>
          </div>

          <div className="space-y-3">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4 p-4 rounded-2xl bg-white/3 border border-white/5 backdrop-blur-sm hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-xs text-slate-600">© {new Date().getFullYear()} AgroCare POS · All rights reserved</p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-white dark:bg-slate-950">
        <div className="w-full max-w-[420px]">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-glow-sm">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <p className="font-bold text-slate-900 dark:text-white text-lg">AgroCare POS</p>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {mode === "setup" ? "Create admin account" : "Welcome back"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5">
              {mode === "setup"
                ? "No admin found. This account will have full access."
                : "Sign in to access your dashboard"}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-3 p-3.5 bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800/50 rounded-xl">
              <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Setup form */}
          {mode === "setup" && (
            <form onSubmit={handleSetup} className="space-y-4">
              <InputField label="Full Name" icon={User} value={setupForm.name} onChange={e => setSetupForm(p => ({ ...p, name: e.target.value }))} placeholder="Admin Name" required />
              <InputField label="Email Address" type="email" icon={Mail} value={setupForm.email} onChange={e => setSetupForm(p => ({ ...p, email: e.target.value }))} placeholder="admin@yourshop.com" required />
              <InputField label="Phone (optional)" type="tel" icon={Phone} value={setupForm.phone} onChange={e => setSetupForm(p => ({ ...p, phone: e.target.value }))} placeholder="+92 300 0000000" />
              <InputField
                label="Password" type={showPwd ? "text" : "password"} icon={Lock}
                value={setupForm.password} onChange={e => setSetupForm(p => ({ ...p, password: e.target.value }))}
                placeholder="Min 6 characters" required
                extra={<button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">{showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>}
              />
              <InputField
                label="Confirm Password" type="password" icon={Lock}
                value={setupForm.confirmPassword} onChange={e => setSetupForm(p => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="Repeat password" required
              />
              <button type="submit" disabled={setupLoading} className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-glow-sm hover:shadow-glow transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2">
                {setupLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Create Admin Account</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}

          {/* Login form */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <InputField label="Email Address" type="email" icon={Mail} value={loginForm.email} onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))} placeholder="Enter your email" required />
              <InputField
                label="Password" type={showPwd ? "text" : "password"} icon={Lock}
                value={loginForm.password} onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
                placeholder="Enter your password" required
                extra={<button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">{showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>}
              />
              <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-glow-sm hover:shadow-glow transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              New shop?{" "}
              <button onClick={() => navigate("/register")} className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline underline-offset-2">
                Register here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
