import React, { useState, useEffect } from "react";
import { Sprout, Loader2, Package, BarChart3, Shield, Sparkles, Zap, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { getSetupStatus, registerUser } from "../api/authApi";
import { ErrorBanner } from "../components/auth/ErrorBanner";
import LoginForm from "../components/auth/LoginForm";
import SetupForm from "../components/auth/SetupForm";
import ForgotPasswordModal from "../components/auth/ForgotPasswordModal";

const FEATURES = [
  { icon: Package, title: "Smart Inventory", desc: "Real-time stock tracking & alerts" },
  { icon: BarChart3, title: "Deep Analytics", desc: "Insights that drive decisions" },
  { icon: Shield, title: "Role-Based Access", desc: "Secure multi-user management" },
  { icon: Zap, title: "Lightning Fast POS", desc: "Quick checkout & billing" },
  { icon: TrendingUp, title: "Sales Growth", desc: "Track performance & trends" },
];

/** Enhanced Branding Panel with modern gradient design */
const BrandingPanel = ({ mode }) => (
  <div className="hidden lg:flex lg:w-[45%] xl:w-1/2 relative overflow-hidden flex-col justify-between p-12 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
    {/* Animated background elements */}
    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl animate-pulse" />
    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full -translate-x-1/4 translate-y-1/4 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
    <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-cyan-500/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />

    <div className="relative z-10">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-16">
        <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Sprout className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="font-bold text-white text-xl tracking-tight leading-none">AgriNest POS</p>
          <p className="text-[10px] text-blue-300/70 mt-1 tracking-widest uppercase font-medium">Pesticide Management</p>
        </div>
      </div>

      {/* Main content */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-blue-500/15 to-purple-500/15 border border-blue-400/30 backdrop-blur-sm mb-6">
          <Sparkles className="w-4 h-4 text-blue-300" />
          <span className="text-xs font-semibold text-blue-200 tracking-wide">Premium Agricultural Solution</span>
        </div>
        
        <h1 className="text-5xl xl:text-6xl font-bold text-white leading-tight tracking-tight mb-5 bg-gradient-to-br from-white to-blue-100 bg-clip-text text-transparent">
          {mode === "setup" ? "Welcome.\nLet's begin." : "Grow your\nbusiness."}
        </h1>
        
        <p className="text-slate-300 text-base leading-relaxed max-w-md">
          {mode === "setup"
            ? "Create your admin account and unlock the complete power of AgriNest POS for your agricultural business."
            : "Complete point-of-sale solution designed specifically for modern pesticide and agricultural retail shops."}
        </p>
      </div>

      {/* Features grid */}
      <div className="grid grid-cols-1 gap-3">
        {FEATURES.slice(0, 3).map(({ icon: Icon, title, desc }) => (
          <div 
            key={title} 
            className="group flex items-center gap-4 p-4 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 backdrop-blur-sm"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <Icon className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-0.5">{title}</p>
              <p className="text-xs text-slate-400">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Footer */}
    <div className="relative z-10 flex items-center justify-between">
      <p className="text-xs text-slate-500">© {new Date().getFullYear()} AgriNest POS</p>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs text-slate-400">All systems operational</span>
      </div>
    </div>
  </div>
);

const Login = () => {
  const { login, loading } = useAuth();
  const { actions } = useApp();
  const navigate = useNavigate();

  const [mode, setMode] = useState("checking");
  const [error, setError] = useState("");
  const [setupEmail, setSetupEmail] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  useEffect(() => {
    if (window.location.pathname === "/register") {
      navigate("/register");
      return;
    }
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
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    try {
      await registerUser({ name, email, phone, password, role: "admin" });
      actions.showToast({ message: "Admin account created! Please log in.", type: "success" });
      setSetupEmail(email);
      setMode("login");
    } catch (err) {
      setError(err.response?.data?.message || "Setup failed");
    }
  };

  const handleForgotPasswordSuccess = (email) => {
    setSetupEmail(email);
    actions.showToast({ 
      message: "Password reset successful! You can now log in with your new password.", 
      type: "success" 
    });
  };

  if (mode === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30 animate-pulse">
              <Sprout className="w-8 h-8 text-white" />
            </div>
            <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Loading... <br /> please wait</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
        <BrandingPanel mode={mode} />

        <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-white dark:bg-slate-950">
          <div className="w-full max-w-[440px]">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-lg">AgriNest POS</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 tracking-wider uppercase">Pesticide Management</p>
              </div>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
                {mode === "setup" ? "Create admin account" : "Welcome back"}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                {mode === "setup" 
                  ? "No admin found. This account will have full access to all features." 
                  : "Sign in to access your dashboard and manage your business"}
              </p>
            </div>

            <ErrorBanner error={error} />

            {mode === "setup" && <SetupForm onSubmit={handleSetup} loading={false} />}
            {mode === "login" && (
              <LoginForm 
                initialEmail={setupEmail} 
                onSubmit={handleLogin} 
                loading={loading}
                onForgotPassword={() => setShowForgotPassword(true)}
              />
            )}

            {/* Footer links */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between text-sm">
                <p className="text-slate-500 dark:text-slate-400">
                  New shop?{" "}
                  <button 
                    onClick={() => navigate("/register")} 
                    className="text-blue-600 dark:text-blue-400 font-semibold hover:underline underline-offset-2 transition-colors"
                  >
                    Register here
                  </button>
                </p>
                <a 
                  href="#" 
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs transition-colors"
                >
                  Need help?
                </a>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-900">
              <div className="flex items-center justify-center gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Secure Login</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Fast & Reliable</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onSuccess={handleForgotPasswordSuccess}
      />
    </>
  );
};

export default Login;
