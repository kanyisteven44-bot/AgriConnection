"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import useUser from "@/utils/useUser";
import { NAV_ITEMS } from "@/constants/adminDashboard";
import { useAdminStats } from "@/hooks/useAdminStats";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { LoadingSpinner } from "@/components/AdminDashboard/LoadingSpinner";
import { Notification } from "@/components/AdminDashboard/Notification";
import { Sidebar } from "@/components/AdminDashboard/Sidebar";
import { TopBar } from "@/components/AdminDashboard/TopBar";
import { OverviewSection } from "@/components/AdminDashboard/OverviewSection";
import { UserManagementSection } from "@/components/AdminDashboard/UserManagementSection";
import {
  VerificationsSectionFull,
  MarketplaceSection,
  OrdersSection,
  AiMonitoringSection,
  AnalyticsSection,
  NotificationsSection,
  NewsSection,
  ReportsSection,
  SettingsSection,
} from "@/components/AdminDashboard/NewSections";

const USER_ROLES_LIST = [
  "farmer",
  "buyer",
  "supplier",
  "transporter",
  "expert",
  "consumer",
  "admin",
];

function AdminAiChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("general");
  const [outputLang, setOutputLang] = useState("english");
  const [recording, setRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [voiceSupported, setVoiceSupported] = useState(false);
  const scrollRef = useRef(null);
  const recognitionRef = useRef(null);

  const CATS = [
    { key: "general", label: "General 🌿" },
    { key: "crop", label: "Crops 🌾" },
    { key: "livestock", label: "Livestock 🐄" },
    { key: "market", label: "Market 📈" },
    { key: "finance", label: "Finance 💰" },
    { key: "equipment", label: "Equipment 🚜" },
    { key: "government", label: "Policy 🏛️" },
  ];

  useEffect(() => {
    const SR =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (SR) {
      setVoiceSupported(true);
      const recognition = new SR();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.onresult = (e) => {
        const interim = Array.from(e.results)
          .map((r) => r[0].transcript)
          .join(" ");
        setLiveTranscript(interim);
        if (e.results[e.results.length - 1].isFinal) {
          setInput(interim);
          setLiveTranscript("");
        }
      };
      recognition.onend = () => setRecording(false);
      recognition.onerror = () => {
        setRecording(false);
        setLiveTranscript("");
      };
      recognitionRef.current = recognition;
    }
    return () => recognitionRef.current?.stop();
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    if (recording) {
      recognitionRef.current.stop();
      setRecording(false);
    } else {
      recognitionRef.current.lang =
        outputLang === "kiswahili" ? "sw-KE" : "en-KE";
      setLiveTranscript("");
      try {
        recognitionRef.current.start();
        setRecording(true);
      } catch {
        setRecording(false);
      }
    }
  };

  const scrollDown = () =>
    setTimeout(
      () => scrollRef.current?.scrollTo({ top: 99999, behavior: "smooth" }),
      100,
    );

  const send = async (overrideText) => {
    const q = (overrideText || input).trim();
    if (!q || loading) return;
    setInput("");
    setLiveTranscript("");
    const langInstruction =
      outputLang === "kiswahili"
        ? "\n\nMhimu: Jibu kwa Kiswahili safi na rahisi kuelewa. Tumia lugha ya Kiswahili sanifu."
        : "\n\nImportant: Respond in clear, professional English.";
    setMessages((p) => [...p, { role: "user", content: q }]);
    setLoading(true);
    scrollDown();
    try {
      const res = await fetch("/api/ai/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q + langInstruction, category }),
      });
      const d = await res.json();
      setMessages((p) => [
        ...p,
        { role: "assistant", content: d.result || "Could not process." },
      ]);
    } catch {
      setMessages((p) => [
        ...p,
        { role: "assistant", content: "Connection error. Please try again." },
      ]);
    } finally {
      setLoading(false);
      scrollDown();
    }
  };

  const QUICK_QUESTIONS =
    outputLang === "kiswahili"
      ? [
          "Nipe bei ya mahindi leo 🌽",
          "Mbolea gani bora kwa nyanya?",
          "Dalili za ugonjwa wa ng'ombe ni zipi?",
          "Jinsi ya kupata mkopo wa kilimo?",
        ]
      : [
          "Crop disease detection tips",
          "Current market prices for maize",
          "How to increase farm yield?",
          "Livestock vaccination schedule",
        ];

  return (
    <div
      className="flex flex-col bg-white rounded-3xl border border-[#E8EEE5] shadow-sm overflow-hidden"
      style={{ height: "calc(100vh - 200px)", minHeight: "500px" }}
    >
      {/* Header */}
      <div
        className="flex-shrink-0 px-6 py-4 flex items-center gap-4"
        style={{
          background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)",
        }}
      >
        <div className="w-11 h-11 bg-[#FBC02D] rounded-xl flex items-center justify-center text-xl flex-shrink-0">
          🤖
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-white text-base">
            AgriConnection AI — Admin Workspace
          </p>
          <p className="text-xs text-white/60">
            7 specialist advisors · 🎤 Voice · 🇬🇧 English & 🇰🇪 Kiswahili
          </p>
        </div>
        {/* Language toggle */}
        <div className="flex items-center gap-1 bg-white/15 rounded-xl p-1 flex-shrink-0">
          <button
            onClick={() => setOutputLang("english")}
            className={`text-xs font-black px-3 py-1.5 rounded-lg transition-all ${outputLang === "english" ? "bg-white text-[#1B5E20] shadow-sm" : "text-white/80 hover:text-white"}`}
          >
            🇬🇧 EN
          </button>
          <button
            onClick={() => setOutputLang("kiswahili")}
            className={`text-xs font-black px-3 py-1.5 rounded-lg transition-all ${outputLang === "kiswahili" ? "bg-[#FBC02D] text-[#1A1A1A] shadow-sm" : "text-white/80 hover:text-white"}`}
          >
            🇰🇪 SW
          </button>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="w-2.5 h-2.5 bg-green-400 rounded-full" />
          <span className="text-xs font-bold text-white/70 hidden sm:block">
            Online
          </span>
        </div>
      </div>

      {/* Category tabs */}
      <div
        className="flex gap-2 px-4 py-3 border-b border-[#E8EEE5] overflow-x-auto flex-shrink-0 bg-[#FAFBFA]"
        style={{ scrollbarWidth: "none" }}
      >
        {CATS.map((c) => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all flex-shrink-0 ${category === c.key ? "bg-[#2E7D32] text-white shadow-sm" : "bg-white text-[#555] hover:bg-[#E8F5E9] border border-[#E8EEE5]"}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Recording indicator */}
      {recording && (
        <div className="flex-shrink-0 bg-red-50 border-b border-red-100 px-5 py-2.5 flex items-center gap-3">
          <div className="flex items-end gap-0.5 h-5">
            {[4, 8, 12, 8, 4, 10, 6, 12, 4, 8].map((h, i) => (
              <div
                key={i}
                className="w-1.5 rounded-full bg-red-500 transition-all"
                style={{ height: `${h}px` }}
              />
            ))}
          </div>
          <span className="text-sm font-black text-red-600">
            🎤 Listening in{" "}
            {outputLang === "kiswahili" ? "Kiswahili" : "English"}…
          </span>
          {liveTranscript && (
            <span className="text-sm text-red-400 italic flex-1 truncate">
              "{liveTranscript}"
            </span>
          )}
          <button
            onClick={toggleRecording}
            className="text-xs font-black text-red-700 bg-red-100 px-3 py-1 rounded-lg hover:bg-red-200 transition-all flex-shrink-0"
          >
            ■ Stop
          </button>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="w-20 h-20 bg-[#E8F5E9] rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4">
              🌾
            </div>
            <p className="font-black text-[#1A1A1A] text-lg mb-1">
              Admin AI Workspace
            </p>
            <p className="text-sm text-[#9BA8A0] max-w-sm mx-auto leading-relaxed mb-6">
              {outputLang === "kiswahili"
                ? "Uliza swali lolote kuhusu kilimo, soko, au jukwaa. Unaweza kuzungumza kwa Kiswahili! 🎤"
                : "Ask anything or tap the mic to speak. Available in 7 specializations and both English & Kiswahili."}
            </p>
            <div className="grid grid-cols-2 gap-2 max-w-md w-full">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="text-left text-xs bg-[#F5F7FA] hover:bg-[#E8F5E9] border border-[#E8EEE5] hover:border-[#C8E6C9] rounded-xl px-3 py-2.5 font-medium text-[#555] transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
            {voiceSupported && (
              <button
                onClick={toggleRecording}
                className="mt-5 flex items-center gap-2 bg-[#E8F5E9] text-[#2E7D32] px-5 py-2.5 rounded-xl font-black text-sm hover:bg-[#C8E6C9] transition-all border-2 border-[#C8E6C9]"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
                🎤 Speak in{" "}
                {outputLang === "kiswahili" ? "Kiswahili" : "English"}
              </button>
            )}
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} gap-3`}
          >
            {m.role === "assistant" && (
              <div className="w-8 h-8 bg-[#1B5E20] rounded-xl flex items-center justify-center text-sm flex-shrink-0 mt-1">
                🤖
              </div>
            )}
            <div
              className={`max-w-[78%] px-5 py-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${m.role === "user" ? "bg-[#2E7D32] text-white rounded-tr-sm" : "bg-[#F5F7FA] text-[#1A1A1A] rounded-tl-sm border border-[#E8EEE5]"}`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start gap-3">
            <div className="w-8 h-8 bg-[#1B5E20] rounded-xl flex items-center justify-center text-sm flex-shrink-0 mt-1">
              🤖
            </div>
            <div className="bg-[#F5F7FA] border border-[#E8EEE5] px-5 py-4 rounded-2xl rounded-tl-sm flex items-center gap-3">
              <div className="flex gap-1">
                {[0.2, 0.4, 0.6].map((d, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-[#2E7D32] rounded-full"
                    style={{ opacity: 0.3 + d }}
                  />
                ))}
              </div>
              <span className="text-sm text-[#888]">
                {outputLang === "kiswahili" ? "Nafikiri..." : "Thinking..."}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-[#E8EEE5] p-4 bg-[#FAFBFA] flex-shrink-0">
        <div className="flex gap-3 items-end">
          {/* Mic button */}
          {voiceSupported && (
            <button
              onClick={toggleRecording}
              title={
                recording
                  ? "Stop recording"
                  : `Record in ${outputLang === "kiswahili" ? "Kiswahili" : "English"}`
              }
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all flex-shrink-0 border-2 ${recording ? "bg-red-500 text-white border-red-500 shadow-lg" : "bg-white text-[#2E7D32] border-[#C8E6C9] hover:bg-[#E8F5E9]"}`}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>
          )}
          {/* Text input */}
          <div className="flex-1 relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), send())
              }
              placeholder={
                outputLang === "kiswahili"
                  ? "Andika au rekodi swali lako…"
                  : "Type or record your question…"
              }
              className="w-full border-2 border-[#E8EEE5] rounded-2xl px-5 py-3.5 text-sm font-medium focus:outline-none focus:border-[#2E7D32] transition-all bg-white pr-10"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-base">
              {outputLang === "kiswahili" ? "🇰🇪" : "🇬🇧"}
            </span>
          </div>
          {/* Send */}
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="w-12 h-12 bg-[#2E7D32] text-white rounded-2xl flex items-center justify-center hover:bg-[#1B5E20] transition-all disabled:opacity-40 flex-shrink-0 shadow-lg"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-[#9BA8A0] mt-2 text-center">
          {voiceSupported
            ? `🎤 Tap mic → speak → AI responds in ${outputLang === "kiswahili" ? "Kiswahili 🇰🇪" : "English 🇬🇧"} · Enter to send`
            : `Type your question · AI responds in ${outputLang === "kiswahili" ? "Kiswahili 🇰🇪" : "English 🇬🇧"}`}
        </p>
      </div>
    </div>
  );
}

function AddUserModal({ onClose, onSuccess, showToast }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "farmer",
    location: "",
    password: "AgriConnect@2026!",
  });
  const [saving, setSaving] = useState(false);
  const setF = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const save = async () => {
    if (!form.name || !form.email || !form.role) {
      showToast("Name, email and role are required", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/users/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed");
      showToast(`User ${form.name} created successfully!`);
      onSuccess();
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setSaving(false);
    }
  };
  const inputCls =
    "w-full border-2 border-[#E8EEE5] rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#2E7D32] transition-all bg-white";
  const labelCls =
    "block text-xs font-black text-[#555] mb-1.5 uppercase tracking-wide";
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="bg-[#2E7D32] px-6 py-5 flex items-center justify-between">
          <div>
            <p className="font-black text-white text-lg">➕ Add New User</p>
            <p className="text-xs text-white/65">
              Create a user account manually
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-2xl font-bold"
          >
            ×
          </button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Full Name *</label>
              <input
                value={form.name}
                onChange={(e) => setF("name", e.target.value)}
                placeholder="John Kamau"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Role *</label>
              <select
                value={form.role}
                onChange={(e) => setF("role", e.target.value)}
                className={inputCls}
              >
                {USER_ROLES_LIST.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Email Address *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setF("email", e.target.value)}
              placeholder="user@email.com"
              className={inputCls}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Phone Number</label>
              <input
                value={form.phone}
                onChange={(e) => setF("phone", e.target.value)}
                placeholder="+254 7XX XXX XXX"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>County / Location</label>
              <input
                value={form.location}
                onChange={(e) => setF("location", e.target.value)}
                placeholder="Nairobi"
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Temporary Password</label>
            <input
              value={form.password}
              onChange={(e) => setF("password", e.target.value)}
              className={inputCls}
            />
            <p className="text-xs text-[#9BA8A0] mt-1">
              User should change this after first login
            </p>
          </div>
          <div className="bg-[#FFF8E1] border border-[#FBC02D]/40 rounded-2xl p-4">
            <p className="text-xs text-[#795548] font-bold">
              📧 The user will receive a welcome notification with their login
              details.
            </p>
          </div>
        </div>
        <div className="px-6 py-5 border-t border-[#F5F5F5] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border-2 border-[#E8EEE5] text-[#555] py-3.5 rounded-2xl font-bold text-sm hover:bg-[#F5F5F5] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 bg-[#2E7D32] text-white py-3.5 rounded-2xl font-black text-sm hover:bg-[#1B5E20] transition-all disabled:opacity-60"
          >
            {saving ? "Creating..." : "✅ Create User"}
          </button>
        </div>
      </div>
    </div>
  );
}

function UserDetailModal({ userId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const ROLE_COLORS_MAP = {
    farmer: "bg-green-100 text-green-700",
    buyer: "bg-blue-100 text-blue-700",
    supplier: "bg-orange-100 text-orange-700",
    transporter: "bg-purple-100 text-purple-700",
    expert: "bg-teal-100 text-teal-700",
    admin: "bg-gray-100 text-gray-700",
    consumer: "bg-slate-100 text-slate-700",
  };
  useEffect(() => {
    fetch(`/api/admin/users/detail?id=${userId}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);
  const STATUS = {
    pending: "bg-yellow-100 text-yellow-700",
    paid: "bg-blue-100 text-blue-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-[#1A1A1A] px-6 py-5 flex items-center justify-between flex-shrink-0">
          <p className="font-black text-white text-lg">👤 User Details</p>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-2xl font-bold"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-4 border-[#2E7D32] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !data?.user ? (
            <p className="text-center text-[#9BA8A0] py-12">User not found</p>
          ) : (
            <>
              {/* Profile */}
              <div className="flex items-center gap-5 mb-6">
                {data.user.profile_photo || data.user.image ? (
                  <img
                    src={data.user.profile_photo || data.user.image}
                    className="w-20 h-20 rounded-2xl object-cover flex-shrink-0"
                    alt=""
                  />
                ) : (
                  <div className="w-20 h-20 bg-[#E8F5E9] rounded-2xl flex items-center justify-center font-black text-[#2E7D32] text-3xl flex-shrink-0">
                    {(data.user.name || "?")[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="font-black text-xl text-[#1A1A1A]">
                    {data.user.name}
                  </h3>
                  <p className="text-sm text-[#9BA8A0]">{data.user.email}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase ${ROLE_COLORS_MAP[data.user.role] || "bg-gray-100 text-gray-600"}`}
                    >
                      {data.user.role}
                    </span>
                    {data.user.is_verified && (
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-green-100 text-green-700">
                        ✅ Verified
                      </span>
                    )}
                    {data.user.location && (
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700">
                        📍 {data.user.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { label: "Phone", value: data.user.phone || "—" },
                  {
                    label: "Joined",
                    value: new Date(data.user.created_at).toLocaleDateString(
                      "en-KE",
                      { month: "long", day: "numeric", year: "numeric" },
                    ),
                  },
                  {
                    label: "Total Orders",
                    value: (data.user.total_orders || 0).toLocaleString(),
                  },
                  {
                    label: "Total Spent",
                    value: `KSh ${parseFloat(data.user.total_spent || 0).toLocaleString()}`,
                  },
                ].map((info) => (
                  <div
                    key={info.label}
                    className="bg-[#F5F7FA] rounded-2xl p-4"
                  >
                    <p className="text-xs font-black text-[#9BA8A0] uppercase tracking-wide mb-1">
                      {info.label}
                    </p>
                    <p className="font-black text-[#1A1A1A]">{info.value}</p>
                  </div>
                ))}
              </div>

              {/* Farm info */}
              {data.farm && (
                <div className="bg-[#E8F5E9] border border-[#C8E6C9] rounded-2xl p-5 mb-5">
                  <p className="font-black text-[#2E4D2E] mb-3">
                    🌾 Farm Information
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {data.farm.size && (
                      <div>
                        <span className="text-[#9BA8A0]">Size: </span>
                        <span className="font-bold text-[#333]">
                          {data.farm.size}
                        </span>
                      </div>
                    )}
                    {data.farm.location && (
                      <div>
                        <span className="text-[#9BA8A0]">Location: </span>
                        <span className="font-bold text-[#333]">
                          {data.farm.location}
                        </span>
                      </div>
                    )}
                    {data.farm.crops_grown && (
                      <div className="col-span-2">
                        <span className="text-[#9BA8A0]">Crops: </span>
                        <span className="font-bold text-[#333]">
                          {data.farm.crops_grown}
                        </span>
                      </div>
                    )}
                    {data.farm.livestock_info && (
                      <div className="col-span-2">
                        <span className="text-[#9BA8A0]">Livestock: </span>
                        <span className="font-bold text-[#333]">
                          {data.farm.livestock_info}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Recent orders */}
              {data.orders?.length > 0 && (
                <div className="mb-5">
                  <p className="font-black text-[#1A1A1A] mb-3">
                    🛒 Recent Orders ({data.orders.length})
                  </p>
                  <div className="bg-white border border-[#E8EEE5] rounded-2xl overflow-hidden">
                    {data.orders.slice(0, 5).map((o, i) => (
                      <div
                        key={o.id}
                        className={`flex items-center gap-3 px-4 py-3 ${i < data.orders.length - 1 ? "border-b border-[#F5F5F5]" : ""}`}
                      >
                        <div className="w-8 h-8 bg-[#E8F5E9] rounded-xl flex items-center justify-center text-xs font-black text-[#2E7D32]">
                          #{o.id}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">
                            {o.product_name || "Product"}
                          </p>
                          <p className="text-xs text-[#9BA8A0]">
                            {new Date(o.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="font-black text-sm text-[#2E7D32]">
                          KSh {parseFloat(o.total_price || 0).toLocaleString()}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-black ${STATUS[o.status] || "bg-gray-100 text-gray-600"}`}
                        >
                          {o.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Products */}
              {data.products?.length > 0 && (
                <div className="mb-5">
                  <p className="font-black text-[#1A1A1A] mb-3">
                    🌾 Listed Products ({data.products.length})
                  </p>
                  <div className="bg-white border border-[#E8EEE5] rounded-2xl overflow-hidden">
                    {data.products.slice(0, 4).map((p, i) => (
                      <div
                        key={p.id}
                        className={`flex items-center gap-3 px-4 py-3 ${i < data.products.length - 1 ? "border-b border-[#F5F5F5]" : ""}`}
                      >
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                            alt=""
                          />
                        ) : (
                          <div className="w-10 h-10 bg-[#E8F5E9] rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                            🌾
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">{p.name}</p>
                          <p className="text-xs text-[#9BA8A0]">{p.category}</p>
                        </div>
                        <span className="font-black text-sm text-[#2E7D32]">
                          KSh {parseFloat(p.price || 0).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI history */}
              {data.aiHistory?.length > 0 && (
                <div className="mb-5">
                  <p className="font-black text-[#1A1A1A] mb-3">
                    🤖 Recent AI Queries
                  </p>
                  <div className="space-y-2">
                    {data.aiHistory.slice(0, 3).map((a, i) => (
                      <div
                        key={i}
                        className="bg-[#F5F7FA] rounded-xl px-4 py-3"
                      >
                        <p className="text-xs font-black text-[#9BA8A0] mb-1">
                          {a.category} ·{" "}
                          {new Date(a.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-sm font-bold text-[#333] truncate">
                          Q: {a.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const { data: user } = useUser();
  const [activeSection, setActiveSection] = useState("overview");
  const [notification, setNotification] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const {
    stats,
    roleBreakdown,
    recentOrders,
    recentUsers,
    loading,
    fetchStats,
  } = useAdminStats();
  const {
    users,
    userSearch,
    setUserSearch,
    userRole,
    setUserRole,
    userPage,
    setUserPage,
    userTotal,
    usersLoading,
    actionLoading,
    fetchUsers,
    handleUserAction,
  } = useAdminUsers();

  const showNotif = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);
  useEffect(() => {
    if (activeSection === "users") fetchUsers(userSearch, userRole, userPage);
  }, [activeSection, userPage]);

  const onUserAction = (id, action) => {
    const lbl =
      action === "verify"
        ? "verified"
        : action === "unverify"
          ? "unverified"
          : action === "delete"
            ? "deleted"
            : "updated";
    handleUserAction(
      id,
      action,
      {},
      () => showNotif(`User ${lbl} successfully`),
      () => showNotif("Action failed.", "error"),
    );
  };

  const handleSearch = (role) => {
    setUserPage(1);
    fetchUsers(userSearch, role !== undefined ? role : userRole, 1);
  };

  if (loading) return <LoadingSpinner />;
  const currentNav = NAV_ITEMS.find((n) => n.key === activeSection);

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex font-sans text-[#333]">
      <Notification notification={notification} />

      {showAddUser && (
        <AddUserModal
          onClose={() => setShowAddUser(false)}
          onSuccess={() => {
            setShowAddUser(false);
            fetchUsers(userSearch, userRole, userPage);
            fetchStats();
          }}
          showToast={showNotif}
        />
      )}
      {selectedUserId && (
        <UserDetailModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}

      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <main className="flex-1 p-6 lg:p-10 overflow-y-auto min-h-screen">
        <TopBar
          user={user}
          currentNav={currentNav}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          onRefresh={fetchStats}
        />

        {activeSection === "overview" && (
          <OverviewSection
            stats={stats}
            roleBreakdown={roleBreakdown}
            recentOrders={recentOrders}
            recentUsers={recentUsers}
            onViewAllUsers={() => setActiveSection("users")}
          />
        )}

        {activeSection === "users" && (
          <div>
            <div className="flex justify-end mb-5">
              <button
                onClick={() => setShowAddUser(true)}
                className="bg-[#2E7D32] text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-[#1B5E20] transition-all flex items-center gap-2"
              >
                ➕ Add New User
              </button>
            </div>
            <UserManagementSection
              users={users}
              usersLoading={usersLoading}
              actionLoading={actionLoading}
              userSearch={userSearch}
              setUserSearch={setUserSearch}
              userRole={userRole}
              setUserRole={setUserRole}
              userPage={userPage}
              setUserPage={setUserPage}
              userTotal={userTotal}
              onSearch={handleSearch}
              onUserAction={onUserAction}
              onViewDetail={(id) => setSelectedUserId(id)}
            />
          </div>
        )}

        {activeSection === "verifications" && (
          <VerificationsSectionFull
            roleBreakdown={roleBreakdown}
            recentUsers={recentUsers}
            onViewUsers={() => setActiveSection("users")}
          />
        )}
        {activeSection === "products" && <MarketplaceSection stats={stats} />}
        {activeSection === "orders" && (
          <OrdersSection stats={stats} recentOrders={recentOrders} />
        )}
        {activeSection === "ai_chat" && <AdminAiChat />}
        {activeSection === "ai_monitor" && <AiMonitoringSection />}
        {activeSection === "analytics" && (
          <AnalyticsSection stats={stats} roleBreakdown={roleBreakdown} />
        )}
        {activeSection === "notifications" && (
          <NotificationsSection onShowToast={showNotif} />
        )}
        {activeSection === "news" && <NewsSection />}
        {activeSection === "reports" && <ReportsSection />}
        {activeSection === "settings" && <SettingsSection />}
      </main>

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}

export default AdminDashboard;
