import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sprout, Building2, User, CheckCircle } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useRegisterShop } from "../hooks/useRegisterShop";
import { BrandingPanel } from "../components/auth/BrandingPanel";
import { ErrorBanner } from "../components/auth/ErrorBanner";
import { AdminStep } from "../components/register/AdminStep";
import { ShopStep } from "../components/register/ShopStep";
import { TeamStep } from "../components/register/TeamStep";
import { SuccessStep } from "../components/register/SuccessStep";

const STEPS = [
  { id: 1, label: "Admin Account", icon: User },
  { id: 2, label: "Shop Info", icon: Building2 },
  { id: 3, label: "Team Members", icon: User },
  { id: 4, label: "Done", icon: CheckCircle },
];

const emptyMember = { name: "", email: "", phone: "", password: "", role: "cashier" };

export default function RegisterShop() {
  const navigate = useNavigate();
  const { state, actions } = useApp();
  const isLoggedIn = state.isAuthenticated && !!localStorage.getItem("token");
  const currentUser = state.currentUser;

  const [step, setStep] = useState(isLoggedIn ? 2 : 1);
  const [adminForm, setAdminForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [shopForm, setShopForm] = useState({ name: "", address: "", phone: "", email: "", taxRate: "5", currency: "Rs.", receiptFooter: "Thank you for your purchase!" });
  const [logoPreview, setLogoPreview] = useState("");
  const [logoData, setLogoData] = useState("");
  const [members, setMembers] = useState([{ ...emptyMember }]);
  const [showPass, setShowPass] = useState(false);
  const [showMemberPass, setShowMemberPass] = useState([false]);

  const { saving, error, result, setError, handleSubmit } = useRegisterShop(isLoggedIn, currentUser, actions);

  const setA = (k, v) => setAdminForm((p) => ({ ...p, [k]: v }));
  const setS = (k, v) => setShopForm((p) => ({ ...p, [k]: v }));
  const updateMember = (i, k, v) => setMembers((p) => p.map((m, idx) => (idx === i ? { ...m, [k]: v } : m)));
  const addMember = () => { setMembers((p) => [...p, { ...emptyMember }]); setShowMemberPass((p) => [...p, false]); };
  const removeMember = (i) => { setMembers((p) => p.filter((_, idx) => idx !== i)); setShowMemberPass((p) => p.filter((_, idx) => idx !== i)); };
  const toggleMemberPass = (i) => setShowMemberPass((p) => p.map((v, idx) => (idx === i ? !v : v)));

  const handleLogo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError("Logo must be < 2MB"); return; }
    const reader = new FileReader();
    reader.onloadend = () => { setLogoPreview(reader.result); setLogoData(reader.result); };
    reader.readAsDataURL(file);
  };

  const validateStep1 = () => {
    if (!adminForm.name || !adminForm.email || !adminForm.password) return "Name, email and password are required";
    if (adminForm.password !== adminForm.confirmPassword) return "Passwords do not match";
    if (adminForm.password.length < 6) return "Password must be at least 6 characters";
    return null;
  };

  const validateStep2 = () => {
    if (!shopForm.name.trim()) return "Shop name is required";
    return null;
  };

  const goNext = () => {
    setError("");
    if (step === 1) {
      const err = validateStep1();
      if (err) { setError(err); return; }
    }
    if (step === 2) {
      const err = validateStep2();
      if (err) { setError(err); return; }
    }
    setStep((s) => s + 1);
  };

  const onSubmit = async (skipMembers) => {
    const success = await handleSubmit(adminForm, shopForm, members, logoData, skipMembers);
    if (success) setStep(4);
  };

  return (
    <div className="min-h-screen flex">
      <BrandingPanel steps={STEPS} currentStep={step} mode="register" />

      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-gray-50 dark:bg-gray-950 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">AgroCare POS</span>
          </div>

          <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.id}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s.id ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-400"}`}>
                  {step > s.id ? "✓" : s.id}
                </div>
                {i < STEPS.length - 1 && <div className={`h-0.5 w-8 ${step > s.id ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700"}`} />}
              </React.Fragment>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-8">
            <ErrorBanner error={error} />

            {step === 1 && <AdminStep form={adminForm} onChange={setA} showPassword={showPass} togglePassword={() => setShowPass((p) => !p)} onNext={goNext} />}
            {step === 2 && <ShopStep form={shopForm} onChange={setS} logoPreview={logoPreview} onLogoChange={handleLogo} onBack={() => { setError(""); setStep(1); }} onNext={goNext} isLoggedIn={isLoggedIn} currentUser={currentUser} />}
            {step === 3 && <TeamStep members={members} onUpdate={updateMember} onAdd={addMember} onRemove={removeMember} showPasswords={showMemberPass} togglePassword={toggleMemberPass} shopName={shopForm.name} onBack={() => { setError(""); setStep(2); }} onSubmit={onSubmit} saving={saving} />}
            {step === 4 && <SuccessStep result={result} onNavigate={() => navigate("/dashboard")} />}
          </div>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <button onClick={() => navigate("/")} className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
              Sign in
            </button>
          </p>
          {isLoggedIn && (
            <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
              <button onClick={() => navigate("/dashboard")} className="text-gray-400 hover:underline">
                Back to Dashboard
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
