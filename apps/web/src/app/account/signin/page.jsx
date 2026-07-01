"use client";
import { useState } from "react";
import useAuth from "@/utils/useAuth";

function MainComponent() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState("login");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [devOtp, setDevOtp] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [success, setSuccess] = useState(null);
  const { signInWithCredentials } = useAuth();

  const onLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }
    try {
      await signInWithCredentials({
        email,
        password,
        callbackUrl: "/",
        redirect: true,
      });
    } catch {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    }
  };

  const sendForgotOtp = async () => {
    setError(null);
    if (!forgotEmail.includes("@")) {
      setError("Enter a valid email address");
      return;
    }
    setOtpSending(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, type: "reset" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.otp_dev) setDevOtp(data.otp_dev);
      setMode("otp");
    } catch (err) {
      setError(err.message || "Failed to send code");
    } finally {
      setOtpSending(false);
    }
  };

  const verifyResetOtp = async () => {
    setError(null);
    if (forgotOtp.length !== 6) {
      setError("Enter the 6-digit code");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, otp: forgotOtp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMode("newpass");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    setError(null);
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail,
          otp: forgotOtp,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess("Password reset successfully! You can now sign in.");
      setMode("login");
      setEmail(forgotEmail);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex font-sans">
      <div className="hidden lg:flex flex-col justify-between w-5/12 bg-[#1B5E20] p-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&q=80')] bg-cover bg-center opacity-20" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <img
              src="https://raw.createusercontent.com/67b58c49-6247-4e0b-ad44-dd03c1cbf914/"
              alt="AgriConnection"
              className="w-10 h-10 rounded-xl object-cover"
            />
            <span className="text-white font-black text-xl tracking-tight">
              AgriConnection
            </span>
          </div>
          <h2 className="text-4xl font-black text-white leading-tight mb-6">
            Welcome back to your Farm Hub
          </h2>
          <p className="text-white/70 text-base leading-relaxed max-w-xs">
            Your farm records, market prices, AI advisor and community are
            waiting for you.
          </p>
        </div>
        <div className="relative z-10 space-y-4">
          {[
            "🌾 Sell produce at better prices",
            "🤖 AI farming advice anytime",
            "📍 GPS weather for your location",
            "💬 Connect with 15,000+ farmers",
          ].map((f) => (
            <div
              key={f}
              className="flex items-center gap-3 text-white/80 text-sm"
            >
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-[#F4F7F2]">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-[#4CAF50] rounded-xl flex items-center justify-center">
              🌾
            </div>
            <span className="text-[#2E4D2E] font-black text-xl">
              AgriConnection
            </span>
          </div>

          {mode === "login" && (
            <form
              onSubmit={onLogin}
              className="bg-white rounded-3xl p-8 shadow-xl border border-[#E8EEE5]"
            >
              <h1 className="text-3xl font-black text-[#2E4D2E] mb-1">
                Welcome Back
              </h1>
              <p className="text-[#6B8E6B] mb-8">
                Sign in to your AgriConnection account
              </p>
              {success && (
                <div className="bg-[#E8F5E9] border border-[#C8E6C9] text-[#2E4D2E] px-4 py-3 rounded-2xl text-sm font-bold mb-4 flex gap-2">
                  <span>✅</span>
                  <span>{success}</span>
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#2E4D2E] mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-4 py-4 rounded-2xl border border-[#C5D8C5] focus:outline-none focus:ring-2 focus:ring-[#4CAF50] bg-[#FAFBFA] font-medium"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-bold text-[#2E4D2E]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("forgot");
                        setForgotEmail(email);
                        setError(null);
                      }}
                      className="text-xs font-bold text-[#4CAF50] hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-4 rounded-2xl border border-[#C5D8C5] focus:outline-none focus:ring-2 focus:ring-[#4CAF50] bg-[#FAFBFA] font-medium pr-20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-[#9BA8A0] hover:text-[#4CAF50]"
                    >
                      {showPassword ? "HIDE" : "SHOW"}
                    </button>
                  </div>
                </div>
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-2xl text-sm border border-red-100 flex gap-2">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#4CAF50] hover:bg-[#43A047] text-white font-black py-4 rounded-2xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? "Signing In..." : "Sign In →"}
                </button>
                <p className="text-center text-sm text-[#6B8E6B]">
                  Don't have an account?{" "}
                  <a
                    href="/account/signup"
                    className="text-[#4CAF50] font-black hover:underline"
                  >
                    Create Account
                  </a>
                </p>
              </div>
            </form>
          )}

          {mode === "forgot" && (
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-[#E8EEE5]">
              <button
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className="flex items-center gap-2 text-[#6B8E6B] text-sm font-bold mb-6 hover:text-[#2E4D2E]"
              >
                ← Back to Login
              </button>
              <div className="text-5xl text-center mb-4">🔑</div>
              <h1 className="text-2xl font-black text-[#2E4D2E] mb-2 text-center">
                Forgot Password?
              </h1>
              <p className="text-[#6B8E6B] text-sm text-center mb-6 leading-relaxed">
                Enter your email and we'll send a 6-digit reset code.
              </p>
              <div className="space-y-4">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-4 rounded-2xl border border-[#C5D8C5] focus:outline-none focus:ring-2 focus:ring-[#4CAF50] bg-[#FAFBFA] font-medium"
                />
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-2xl text-sm border border-red-100 flex gap-2">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}
                <button
                  onClick={sendForgotOtp}
                  disabled={otpSending}
                  className="w-full bg-[#4CAF50] text-white font-black py-4 rounded-2xl hover:bg-[#43A047] transition-all disabled:opacity-50"
                >
                  {otpSending ? "Sending Code..." : "Send Reset Code →"}
                </button>
              </div>
            </div>
          )}

          {mode === "otp" && (
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-[#E8EEE5]">
              <button
                onClick={() => {
                  setMode("forgot");
                  setError(null);
                }}
                className="flex items-center gap-2 text-[#6B8E6B] text-sm font-bold mb-6 hover:text-[#2E4D2E]"
              >
                ← Back
              </button>
              <div className="text-5xl text-center mb-4">📧</div>
              <h1 className="text-2xl font-black text-[#2E4D2E] mb-2 text-center">
                Enter Reset Code
              </h1>
              <p className="text-[#6B8E6B] text-sm text-center mb-6">
                Code sent to{" "}
                <strong className="text-[#2E4D2E]">{forgotEmail}</strong>
              </p>
              <div className="space-y-4">
                <input
                  value={forgotOtp}
                  onChange={(e) =>
                    setForgotOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-5 rounded-2xl border border-[#C5D8C5] focus:outline-none focus:ring-2 focus:ring-[#4CAF50] bg-white font-black text-center text-3xl tracking-[12px]"
                />
                {devOtp && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
                    <p className="text-xs font-bold text-yellow-700 mb-1">
                      📧 Dev mode — use this code:
                    </p>
                    <p
                      className="text-2xl font-black text-yellow-800 tracking-[8px] cursor-pointer hover:opacity-70"
                      onClick={() => setForgotOtp(devOtp)}
                    >
                      {devOtp}
                    </p>
                  </div>
                )}
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-2xl text-sm border border-red-100 flex gap-2">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}
                <button
                  onClick={verifyResetOtp}
                  disabled={loading || forgotOtp.length !== 6}
                  className="w-full bg-[#4CAF50] text-white font-black py-4 rounded-2xl hover:bg-[#43A047] transition-all disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify Code →"}
                </button>
                <button
                  onClick={sendForgotOtp}
                  disabled={otpSending}
                  className="w-full text-sm text-[#4CAF50] font-bold hover:underline text-center py-1"
                >
                  Resend Code
                </button>
              </div>
            </div>
          )}

          {mode === "newpass" && (
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-[#E8EEE5]">
              <div className="text-5xl text-center mb-4">🔒</div>
              <h1 className="text-2xl font-black text-[#2E4D2E] mb-2 text-center">
                Set New Password
              </h1>
              <p className="text-[#6B8E6B] text-sm text-center mb-6">
                Create a strong new password for your account.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#2E4D2E] mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full px-4 py-4 rounded-2xl border border-[#C5D8C5] focus:outline-none focus:ring-2 focus:ring-[#4CAF50] bg-[#FAFBFA] font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#2E4D2E] mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full px-4 py-4 rounded-2xl border border-[#C5D8C5] focus:outline-none focus:ring-2 focus:ring-[#4CAF50] bg-[#FAFBFA] font-medium"
                  />
                </div>
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-2xl text-sm border border-red-100 flex gap-2">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}
                <button
                  onClick={resetPassword}
                  disabled={loading}
                  className="w-full bg-[#4CAF50] text-white font-black py-4 rounded-2xl hover:bg-[#43A047] transition-all disabled:opacity-50"
                >
                  {loading ? "Saving..." : "🔒 Save New Password"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MainComponent;
