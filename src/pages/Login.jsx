import React, { useState, useEffect } from "react";
import { Sprout, Loader2, Package, BarChart3, Shield, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { getSetupStatus, registerUser } from "../api/authApi";
import { ErrorBanner } from "../components/auth/ErrorBanner";
import LoginForm from "../components/auth/LoginForm";
import SetupForm from "../components/auth/SetupForm";

const FEATURES = [
  { icon: Package,  title: "Smart Inventory",    desc: "Real-time stock tracking & alerts" },
  { icon: BarChart3,title: "Deep Analytics",     desc: "Insights that drive decisions" },
  { icon: Shield,   title: "Role-Based Access",  desc: "Secure multi-user management" },
];

/** Left-side branding panel — hidden on mobile */
const BrandingPanel = ({ mode }) => (
  <div className="hidden lg:flex lg:w-[45%] xl:w-1/2 relative overflow-hidden flex-col justify-between p-12" style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" }}>
    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full translate-x-1/4 -translate-y-1/4 blur-3xl" />
    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/8 rounded-full -translate-x-1/3 translate-y-1/3 blur-3xl" />

    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-16">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <Sprout className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-semibold text-white text-lg tracking-tight leading-none">AgriNest POS</p>
          <p className="text-[11px] text-blue-400/70 mt-0.5 tracking-widest uppercase">Pesticide Management</p>
        </div>
      </div>

      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-500/10 border border-blue-500/20 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs font-medium text-blue-400 tracking-wide">Premium Agricultural POS</span>
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
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-center gap-4 p-4 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors">
            <div className="w-10 h-10 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    <p className="relative z-10 text-xs text-slate-600">© {new Date().getFullYear()} AgriNest POS · All rights reserved</p>
  </div>
);

const Login = () => {
  const { login, loading } = useAuth();
  const { actions }        = useApp();
  const navigate           = useNavigate();

  const [mode, setMode]           = useState("checking");
  const [error, setError]         = useState("");
  const [setupEmail, setSetupEmail] = useState("");

  useEffect(() => {
    if (window.location.pathname === "/register") { navigate("/register"); return; }
    getSetupStatus()
      .then((r) => setMode(r.data.data.setupRequired ? "setup" : "login"))
      .catch(() => setMode("login"));
  }, []); // eslint-disable-line

  const handleLogin = async ({ email, password }) => {
    setError("");
    try {
      const user = await login({ email, password });
      actions.login(user.email, null, user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
    }
  };

  const handleSetup = async ({ name, email, phone, password, confirmPassword }) => {
    setError("");
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    try {
      await registerUser({ name, email, phone, password, role: "admin" });
      actions.showToast({ message: "Admin account created! Please log in.", type: "success" });
      setSetupEmail(email);
      setMode("login");
    } catch (err) {
      setError(err.response?.data?.message || "Setup failed");
    }
  };

  if (mode === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center animate-pulse">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <p className="text-sm text-slate-500">Connecting to server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      <BrandingPanel mode={mode} />

      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-white dark:bg-slate-950">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <p className="font-semibold text-slate-900 dark:text-white text-lg">AgriNest POS</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {mode === "setup" ? "Create admin account" : "Welcome back"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5">
              {mode === "setup" ? "No admin found. This account will have full access." : "Sign in to access your dashboard"}
            </p>
          </div>

          <ErrorBanner error={error} />

          {mode === "setup" && <SetupForm onSubmit={handleSetup} loading={false} />}
          {mode === "login" && <LoginForm initialEmail={setupEmail} onSubmit={handleLogin} loading={loading} />}

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              New shop?{" "}
              <button onClick={() => navigate("/register")} className="text-blue-600 dark:text-blue-400 font-medium hover:underline underline-offset-2">
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
