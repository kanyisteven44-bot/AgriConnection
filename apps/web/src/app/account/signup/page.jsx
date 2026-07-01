"use client";
import { useState } from "react";
import useAuth from "@/utils/useAuth";

const ROLES = [
  {
    value: "farmer",
    emoji: "🌾",
    label: "Farmer",
    desc: "Grow and sell farm produce",
  },
  {
    value: "buyer",
    emoji: "🛒",
    label: "Buyer",
    desc: "Purchase farm products in bulk",
  },
  {
    value: "supplier",
    emoji: "📦",
    label: "Supplier",
    desc: "Supply farm inputs & equipment",
  },
  {
    value: "transporter",
    emoji: "🚚",
    label: "Transporter",
    desc: "Deliver goods across counties",
  },
  {
    value: "expert",
    emoji: "🔬",
    label: "Expert",
    desc: "Provide professional farming advice",
  },
  {
    value: "consumer",
    emoji: "👤",
    label: "Consumer",
    desc: "Buy fresh produce for personal use",
  },
];

const STRONG_PASSWORDS = [
  "Agri#Farm2026!",
  "Green$Field88!",
  "Harvest@2026#",
  "Soil&Crop99!",
  "Kenya#Farm@25",
  "Plant$Grow2026",
  "Seeds#Rain@26!",
  "Field&Crop#88",
];

function StepBar({ step }) {
  const labels = ["Your Details", "Verify Email", "Choose Role"];
  return (
    <div className="flex items-center gap-2 mb-8">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black transition-all duration-300 ${s < step ? "bg-[#4CAF50] text-white" : s === step ? "bg-[#4CAF50] text-white ring-4 ring-[#4CAF50]/20" : "bg-[#E8EEE5] text-[#9BA8A0]"}`}
          >
            {s < step ? "✓" : s}
          </div>
          {s < 3 && (
            <div
              className={`h-1 w-12 rounded-full transition-all duration-500 ${s < step ? "bg-[#4CAF50]" : "bg-[#E8EEE5]"}`}
            />
          )}
        </div>
      ))}
      <span className="ml-3 text-xs font-bold text-[#9BA8A0] uppercase tracking-wider">
        {labels[step - 1]}
      </span>
    </div>
  );
}

function MainComponent() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [role, setRole] = useState("farmer");
  const [devOtp, setDevOtp] = useState(null);
  const { signUpWithCredentials } = useAuth();

  const pwStrength = (() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (password.length >= 12) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();
  const pwLabel = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"][
    pwStrength
  ];
  const pwColor = ["", "#EF5350", "#FFA726", "#FBC02D", "#66BB6A", "#2E7D32"][
    pwStrength
  ];

  const suggestPassword = () => {
    const r =
      STRONG_PASSWORDS[Math.floor(Math.random() * STRONG_PASSWORDS.length)];
    setPassword(r);
    setConfirmPassword(r);
    setShowPassword(true);
  };

  const sendOtp = async () => {
    setError(null);
    if (!name.trim() || name.trim().split(" ").filter(Boolean).length < 2) {
      setError("Please enter your full name (first and last name)");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, "").length < 9) {
      setError("Please enter a valid phone number");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setOtpSending(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "signup", name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send code");
      if (data.otp_dev) setDevOtp(data.otp_dev);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setOtpSending(false);
    }
  };

  const verifyOtp = async () => {
    setError(null);
    if (otp.length !== 6) {
      setError("Enter the 6-digit code sent to your email");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, type: "signup" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid code");
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Safe localStorage access (prevents SSR crash)
      if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
        try {
          localStorage.setItem("pendingRole", role);
          if (phone) localStorage.setItem("pendingPhone", phone);
        } catch {}
      }
      await signUpWithCredentials({
        email,
        password,
        name,
        callbackUrl: "/onboarding",
        redirect: true,
      });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex font-sans">
      <div className="hidden lg:flex flex-col justify-between w-5/12 bg-[#1B5E20] p-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&q=80')] bg-cover bg-center opacity-20" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-[#FBC02D] rounded-xl flex items-center justify-center text-lg">
              🌾
            </div>
            <span className="text-white font-black text-xl tracking-tight">
              AgriConnection
            </span>
          </div>
          <h2 className="text-4xl font-black text-white leading-tight mb-6">
            Join Kenya's Premier Farm Ecosystem
          </h2>
          <p className="text-white/70 text-base leading-relaxed max-w-xs">
            Connect with 15,000+ farmers, buyers, suppliers and experts across
            all 47 counties.
          </p>
          <div className="mt-10 space-y-4">
            {[
              "🛒 Sell produce directly to buyers",
              "📈 Get live market prices",
              "🌦️ GPS weather & AI farming tips",
              "💰 Track your farm finances",
            ].map((f) => (
              <div
                key={f}
                className="flex items-center gap-3 text-white/80 text-sm font-medium"
              >
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            ["15K+", "Farmers"],
            ["50K+", "Products"],
            ["47", "Counties"],
          ].map(([v, l]) => (
            <div key={l} className="bg-white/10 rounded-2xl p-4">
              <p className="text-xl font-black text-[#FBC02D]">{v}</p>
              <p className="text-white/60 text-xs">{l}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center p-8 bg-[#F4F7F2] overflow-y-auto">
        <div className="w-full max-w-lg py-8">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-[#4CAF50] rounded-xl flex items-center justify-center text-base">
              🌾
            </div>
            <span className="text-[#2E4D2E] font-black text-xl">
              AgriConnection
            </span>
          </div>
          <h1 className="text-3xl font-black text-[#2E4D2E] mb-2">
            Create Account
          </h1>
          <p className="text-[#6B8E6B] mb-6">Step {step} of 3</p>
          <StepBar step={step} />
          <form onSubmit={onSubmit}>
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#2E4D2E] mb-2">
                    Full Name (First &amp; Last Name) *
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Kamau"
                    className="w-full px-4 py-4 rounded-2xl border border-[#C5D8C5] focus:outline-none focus:ring-2 focus:ring-[#4CAF50] bg-white font-medium text-[#1A1A1A]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#2E4D2E] mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-4 py-4 rounded-2xl border border-[#C5D8C5] focus:outline-none focus:ring-2 focus:ring-[#4CAF50] bg-white font-medium text-[#1A1A1A]"
                  />
                  <p className="text-xs text-[#9BA8A0] mt-1">
                    📧 A 6-digit verification code (valid 10 mins) will be sent
                    to this email
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#2E4D2E] mb-2">
                    Phone Number *
                  </label>
                  <div className="flex">
                    <span className="bg-[#E8EEE5] border border-r-0 border-[#C5D8C5] px-4 rounded-l-2xl flex items-center text-sm font-bold text-[#6B8E6B]">
                      +254
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="712 345 678"
                      className="flex-1 px-4 py-4 rounded-r-2xl border border-[#C5D8C5] focus:outline-none focus:ring-2 focus:ring-[#4CAF50] bg-white font-medium text-[#1A1A1A]"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-bold text-[#2E4D2E]">
                      Create Password *
                    </label>
                    <button
                      type="button"
                      onClick={suggestPassword}
                      className="text-xs font-black text-[#4CAF50] bg-[#E8F5E9] px-3 py-1.5 rounded-xl hover:bg-[#C8E6C9] transition-all"
                    >
                      ✨ Suggest Strong Password
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full px-4 py-4 rounded-2xl border border-[#C5D8C5] focus:outline-none focus:ring-2 focus:ring-[#4CAF50] bg-white font-medium text-[#1A1A1A] pr-20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-[#9BA8A0] hover:text-[#4CAF50]"
                    >
                      {showPassword ? "HIDE" : "SHOW"}
                    </button>
                  </div>
                  {password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="h-1.5 flex-1 rounded-full transition-all"
                            style={{
                              backgroundColor:
                                i < pwStrength ? pwColor : "#E8EEE5",
                            }}
                          />
                        ))}
                      </div>
                      <p
                        className="text-xs font-bold"
                        style={{ color: pwColor }}
                      >
                        {pwLabel} password
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#2E4D2E] mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your password"
                      className={`w-full px-4 py-4 rounded-2xl border focus:outline-none focus:ring-2 bg-white font-medium text-[#1A1A1A] pr-20 ${confirmPassword && confirmPassword !== password ? "border-red-400 focus:ring-red-400" : "border-[#C5D8C5] focus:ring-[#4CAF50]"}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-[#9BA8A0] hover:text-[#4CAF50]"
                    >
                      {showConfirm ? "HIDE" : "SHOW"}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== password && (
                    <p className="text-xs text-red-500 mt-1 font-bold">
                      ⚠️ Passwords do not match
                    </p>
                  )}
                  {confirmPassword && confirmPassword === password && (
                    <p className="text-xs text-[#4CAF50] mt-1 font-bold">
                      ✅ Passwords match
                    </p>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div className="bg-[#E8F5E9] rounded-2xl p-6 text-center border border-[#C8E6C9]">
                  <div className="text-5xl mb-4">📧</div>
                  <h3 className="font-black text-[#2E4D2E] text-lg mb-2">
                    Check Your Email
                  </h3>
                  <p className="text-[#6B8E6B] text-sm leading-relaxed">
                    We sent a 6-digit verification code to
                    <br />
                    <strong className="text-[#2E4D2E]">{email}</strong>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#2E4D2E] mb-2">
                    Enter 6-Digit Code *
                  </label>
                  <input
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="000000"
                    maxLength={6}
                    className="w-full px-4 py-5 rounded-2xl border border-[#C5D8C5] focus:outline-none focus:ring-2 focus:ring-[#4CAF50] bg-white font-black text-[#1A1A1A] text-center text-3xl tracking-[12px]"
                  />
                  <p className="text-xs text-[#9BA8A0] text-center mt-2">
                    Code expires in 10 minutes
                  </p>
                  {devOtp && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
                      <p className="text-xs font-bold text-yellow-700 mb-1">
                        📧 Email not configured — use this code for testing:
                      </p>
                      <p
                        className="text-2xl font-black text-yellow-800 tracking-[8px] cursor-pointer hover:opacity-70"
                        onClick={() => setOtp(devOtp)}
                        title="Click to auto-fill"
                      >
                        {devOtp}
                      </p>
                      <p className="text-[10px] text-yellow-600 mt-1">Click code to auto-fill</p>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    setDevOtp(null);
                    setOtp("");
                    await sendOtp();
                  }}
                  className="w-full text-sm font-bold text-[#4CAF50] hover:underline text-center py-2"
                >
                  Didn't receive the code? Resend →
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3">
                <div className="bg-[#E8F5E9] rounded-2xl p-4 mb-4 flex items-center gap-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <p className="font-black text-[#2E4D2E] text-sm">
                      Email Verified!
                    </p>
                    <p className="text-[#6B8E6B] text-xs">
                      Now choose the role that best describes you.
                    </p>
                  </div>
                </div>
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${role === r.value ? "border-[#4CAF50] bg-[#E8F5E9]" : "border-[#E8EEE5] bg-white hover:border-[#C5D8C5]"}`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${role === r.value ? "bg-[#4CAF50]" : "bg-[#F4F7F2]"}`}
                    >
                      {r.emoji}
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-sm text-[#1A1A1A]">
                        {r.label}
                      </p>
                      <p className="text-xs text-[#9BA8A0] mt-0.5">{r.desc}</p>
                    </div>
                    {role === r.value && (
                      <div className="w-6 h-6 bg-[#4CAF50] rounded-full flex items-center justify-center text-white text-xs font-black">
                        ✓
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {error && (
              <div className="mt-4 bg-red-50 text-red-600 px-4 py-3 rounded-2xl text-sm border border-red-100 flex gap-2 items-start">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setStep((s) => s - 1);
                  }}
                  className="flex-1 py-4 rounded-2xl border-2 border-[#C5D8C5] text-[#2E4D2E] font-black hover:bg-[#E8F5E9] transition-all"
                >
                  ← Back
                </button>
              )}
              {step === 1 && (
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={otpSending}
                  className="flex-1 bg-[#4CAF50] hover:bg-[#43A047] text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-[#4CAF50]/25 active:scale-[0.98] disabled:opacity-50"
                >
                  {otpSending ? "Sending Code..." : "Send Verification Code →"}
                </button>
              )}
              {step === 2 && (
                <button
                  type="button"
                  onClick={verifyOtp}
                  disabled={loading || otp.length !== 6}
                  className="flex-1 bg-[#4CAF50] hover:bg-[#43A047] text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-[#4CAF50]/25 active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify Code →"}
                </button>
              )}
              {step === 3 && (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#4CAF50] hover:bg-[#43A047] text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-[#4CAF50]/25 active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? "Creating Account..." : "🎉 Create My Account"}
                </button>
              )}
            </div>
            <p className="text-center text-sm text-[#6B8E6B] mt-6">
              Already have an account?{" "}
              <a
                href="/account/signin"
                className="text-[#4CAF50] font-black hover:underline"
              >
                Sign In
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;
