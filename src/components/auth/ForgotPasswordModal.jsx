import React, { useState, useRef, useEffect } from "react";
import { X, Mail, KeyRound, Lock, ArrowRight, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { requestPasswordReset, verifyResetCode, resetPassword, resendResetCode } from "../../api/authApi";

/**
 * ForgotPasswordModal - 3-step password reset flow
 * Step 1: Enter email → Get 6-digit code
 * Step 2: Verify code → Get reset token
 * Step 3: Set new password → Complete
 */
const ForgotPasswordModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: Password
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const codeInputs = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    if (step === 2 && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [step, countdown]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setEmail("");
      setCode(["", "", "", "", "", ""]);
      setResetToken("");
      setNewPassword("");
      setConfirmPassword("");
      setError("");
      setSuccess("");
      setCanResend(false);
      setCountdown(60);
    }
  }, [isOpen]);

  // Step 1: Request reset code
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await requestPasswordReset({ email });
      setSuccess("Reset code sent to your email!");
      setStep(2);
      setCountdown(60);
      setCanResend(false);
      setTimeout(() => codeInputs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify code
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    const codeString = code.join("");
    
    if (codeString.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await verifyResetCode({ email, code: codeString });
      const token = response.data?.data?.resetToken || response.data?.resetToken;
      
      if (!token) {
        throw new Error("Reset token not received");
      }

      setResetToken(token);
      setSuccess("Code verified! Set your new password.");
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await resetPassword({ resetToken, newPassword });
      setSuccess("Password reset successful! You can now log in.");
      setTimeout(() => {
        onSuccess?.(email);
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  // Resend code
  const handleResendCode = async () => {
    setError("");
    setLoading(true);

    try {
      await resendResetCode({ email });
      setSuccess("New code sent to your email!");
      setCode(["", "", "", "", "", ""]);
      setCountdown(60);
      setCanResend(false);
      setTimeout(() => codeInputs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  // Handle code input
  const handleCodeChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only digits

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Only last digit
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      codeInputs.current[index + 1]?.focus();
    }
  };

  // Handle code backspace
  const handleCodeKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      codeInputs.current[index - 1]?.focus();
    }
  };

  // Handle code paste
  const handleCodePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newCode = [...code];
    
    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i];
    }
    
    setCode(newCode);
    
    if (pastedData.length === 6) {
      codeInputs.current[5]?.focus();
    } else if (pastedData.length > 0) {
      codeInputs.current[pastedData.length]?.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="relative px-6 py-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Reset Password</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Step {step} of 3
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
            </div>
          )}

          {/* Step 1: Email */}
          {step === 1 && (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Enter your email address and we'll send you a 6-digit verification code.
                </p>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Send Reset Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: Verify Code */}
          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  We sent a 6-digit code to <span className="font-medium text-slate-900 dark:text-white">{email}</span>
                </p>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Verification Code
                </label>
                <div className="flex gap-2 justify-between">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (codeInputs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(index, e)}
                      onPaste={index === 0 ? handleCodePaste : undefined}
                      className="w-full aspect-square text-center text-2xl font-bold rounded-lg border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  ))}
                </div>
              </div>

              {/* Resend Code */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Didn't receive code?</span>
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={loading}
                    className="text-blue-600 dark:text-blue-400 font-medium hover:underline disabled:opacity-50"
                  >
                    Resend Code
                  </button>
                ) : (
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3" />
                    Resend in {countdown}s
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center justify-center gap-2 py-3 px-6 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={loading || code.join("").length !== 6}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Verify Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Create a strong password for your account.
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        required
                        minLength={6}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        required
                        minLength={6}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>

                {newPassword && (
                  <div className="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">Password strength:</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded-full transition-all ${
                            newPassword.length >= level * 3
                              ? newPassword.length >= 12
                                ? "bg-green-500"
                                : newPassword.length >= 8
                                ? "bg-yellow-500"
                                : "bg-red-500"
                              : "bg-slate-200 dark:bg-slate-700"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Reset Password</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
