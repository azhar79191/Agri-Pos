import LoadingState from "../components/ui/LoadingState";
import { PLATFORM_BRAND } from "../constants/platformBrand";
import React, { useState, useEffect } from "react";
import { Sprout, Package, BarChart3, Shield, Sparkles, Zap, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { getSetupStatus, registerUser } from "../api/authApi";
import { ErrorBanner } from "../components/auth/ErrorBanner";
import LoginForm from "../components/auth/LoginForm";
import SetupForm from "../components/auth/SetupForm";
import ForgotPasswordModal from "../components/auth/ForgotPasswordModal";

const BrandingPanel = () => <aside className="auth-brand hidden lg:flex flex-col justify-between p-12 w-[42%] border-r border-slate-200">
  <div className="flex items-center gap-3"><Sprout className="h-7 w-7 text-blue-600" /><span className="text-lg font-semibold">{PLATFORM_BRAND.name}</span></div>
  <div className="max-w-sm"><p className="text-xs font-medium uppercase tracking-widest text-slate-500 mb-4">Your shop, organized</p><h1 className="text-4xl font-semibold tracking-tight leading-tight">A simpler day at the counter.</h1><p className="mt-5 text-sm leading-6 text-slate-500">Sales, stock and customers in one workspace.</p><div className="mt-8 space-y-3">{[{icon: Package, text: 'Know what is in stock'}, {icon: BarChart3, text: 'Keep track of every sale'}, {icon: Shield, text: 'Give your team the right access'}].map(({icon: Icon, text}) => <div key={text} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm"><Icon className="h-4 w-4 text-slate-500" />{text}</div>)}</div></div>
  <p className="text-xs text-slate-400">© {new Date().getFullYear()} {PLATFORM_BRAND.name}</p>
</aside>;

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
      <LoadingState variant="page" label="Preparing sign in" />
    );
  }

  return (
    <>
      <div className="auth-shell min-h-screen flex bg-slate-50 dark:bg-slate-950">
        <BrandingPanel mode={mode} />

        <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-slate-50 dark:bg-slate-950">
          <div className="w-full max-w-[440px] rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-emerald-700 rounded-xl flex items-center justify-center">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-lg">{PLATFORM_BRAND.name}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 tracking-wider uppercase">{PLATFORM_BRAND.tagline}</p>
              </div>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight mb-2">
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
                    className="text-emerald-700 dark:text-emerald-300 font-semibold hover:underline underline-offset-2 transition-colors"
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
