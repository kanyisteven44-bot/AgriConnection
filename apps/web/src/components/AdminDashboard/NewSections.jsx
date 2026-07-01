"use client";
import { useState, useEffect } from "react";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-blue-100 text-blue-700",
  confirmed: "bg-teal-100 text-teal-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

function StatCard({ label, value, sub, icon, color, change }) {
  return (
    <div className="bg-white rounded-3xl p-7 border border-[#E8EEE5] shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-5">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${color}`}
        >
          {icon}
        </div>
        {change !== undefined && (
          <span
            className={`text-xs font-black px-2.5 py-1 rounded-full ${change >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
          >
            {change >= 0 ? "+" : ""}
            {change}%
          </span>
        )}
      </div>
      <p className="text-3xl font-black text-[#1A1A1A] mb-1">{value}</p>
      <p className="text-xs font-bold text-[#9BA8A0] uppercase tracking-wider">
        {label}
      </p>
      {sub && <p className="text-xs text-[#9BA8A0] mt-1">{sub}</p>}
    </div>
  );
}

export function VerificationsSectionFull({
  roleBreakdown = [],
  recentUsers = [],
  onViewUsers,
}) {
  const safeRoleBreakdown = roleBreakdown || [];
  const safeRecentUsers = recentUsers || [];
  return (
    <div>
      <div className="grid grid-cols-3 gap-5 mb-6">
        <StatCard
          label="Farmers Registered"
          value={safeRoleBreakdown.find((r) => r.role === "farmer")?.count || 0}
          icon="🌾"
          color="bg-green-50"
        />
        <StatCard
          label="Experts Registered"
          value={safeRoleBreakdown.find((r) => r.role === "expert")?.count || 0}
          icon="🔬"
          color="bg-teal-50"
        />
        <StatCard
          label="Total Verified"
          value={safeRecentUsers.filter((u) => u.is_verified).length}
          icon="✅"
          color="bg-blue-50"
        />
      </div>
      <div className="bg-white rounded-3xl p-8 border border-[#E8EEE5] shadow-sm mb-6">
        <h3 className="font-black text-xl mb-3">
          🪪 Identity & Farm Verification
        </h3>
        <p className="text-[#9BA8A0] mb-5">
          Review farmers and experts who require admin approval for full
          marketplace access.
        </p>
        <div className="bg-[#FFF8E1] border border-[#FBC02D]/40 rounded-2xl p-5 mb-6">
          <p className="font-black text-[#795548] mb-2">
            📋 Verification Process
          </p>
          <ol className="text-sm text-[#795548] space-y-2 list-decimal list-inside">
            <li>
              Farmer or Expert registers and submits farm/expert information
            </li>
            <li>Account appears with "Pending" status in User Management</li>
            <li>Admin reviews and clicks "✅ Verify" to approve</li>
            <li>User is automatically notified of approval via email</li>
            <li>
              Verified users receive the Verified badge and full marketplace
              access
            </li>
          </ol>
        </div>
        <div className="flex flex-wrap gap-3 mb-6">
          {[
            "✅ Verified Farmer",
            "✅ Verified Buyer",
            "🔬 Verified Expert",
            "🏆 Trusted Seller",
          ].map((b) => (
            <div
              key={b}
              className="bg-[#E8F5E9] border border-[#C8E6C9] rounded-xl px-4 py-2 text-xs font-black text-[#2E4D2E]"
            >
              {b}
            </div>
          ))}
        </div>
        <button
          onClick={onViewUsers}
          className="bg-[#4CAF50] text-white px-8 py-3.5 rounded-2xl font-black hover:bg-[#43A047] transition-all"
        >
          Go to User Management to Verify Users →
        </button>
      </div>
    </div>
  );
}

export function MarketplaceSection({ stats }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const fmtMoney = (v) =>
    v >= 1000000
      ? `KSh ${(v / 1000000).toFixed(1)}M`
      : `KSh ${(v / 1000).toFixed(1)}K`;

  useEffect(() => {
    fetch("/api/products?limit=30")
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <StatCard
          label="Total Products"
          value={stats?.products || 0}
          icon="🌾"
          color="bg-green-50"
        />
        <StatCard
          label="Active Listings"
          value={stats?.activeProducts || 0}
          icon="✅"
          color="bg-teal-50"
        />
        <StatCard
          label="Total Orders"
          value={stats?.orders || 0}
          icon="📦"
          color="bg-blue-50"
        />
        <StatCard
          label="Revenue"
          value={fmtMoney(stats?.revenue || 0)}
          icon="💰"
          color="bg-yellow-50"
        />
      </div>
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-[#4CAF50] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#E8EEE5] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#F5F5F5] flex justify-between items-center">
            <p className="font-black text-[#1A1A1A]">
              Product Listings ({products.length})
            </p>
            <a
              href="/marketplace"
              target="_blank"
              className="text-xs font-black text-[#4CAF50] hover:underline"
            >
              View Marketplace →
            </a>
          </div>
          <div className="divide-y divide-[#F5F5F5]">
            {products.slice(0, 20).map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-[#F9FBF9]"
              >
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                    alt=""
                  />
                ) : (
                  <div className="w-12 h-12 bg-[#E8F5E9] rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                    🌾
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm truncate">{p.name}</p>
                  <p className="text-xs text-[#9BA8A0]">
                    {p.category} · {p.location || "Kenya"}
                  </p>
                </div>
                <p className="font-black text-[#2E7D32] text-sm flex-shrink-0">
                  KSh {parseFloat(p.price || 0).toLocaleString()}/{p.unit}
                </p>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-black flex-shrink-0 ${p.is_available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                >
                  {p.is_available ? "Active" : "Inactive"}
                </span>
              </div>
            ))}
            {products.length === 0 && (
              <div className="text-center py-12 text-[#9BA8A0]">
                <p className="text-4xl mb-2">🌾</p>
                <p className="font-bold">No products listed yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function OrdersSection({ stats, recentOrders = [] }) {
  const safeOrders = recentOrders || [];
  const fmtMoney = (v) =>
    v >= 1000000
      ? `KSh ${(v / 1000000).toFixed(1)}M`
      : v >= 1000
        ? `KSh ${(v / 1000).toFixed(1)}K`
        : `KSh ${(v || 0).toLocaleString()}`;
  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <StatCard
          label="Total Orders"
          value={stats?.orders || 0}
          icon="📦"
          color="bg-blue-50"
        />
        <StatCard
          label="Pending"
          value={stats?.pendingOrders || 0}
          icon="⏳"
          color="bg-yellow-50"
        />
        <StatCard
          label="Revenue"
          value={fmtMoney(stats?.revenue || 0)}
          icon="💰"
          color="bg-green-50"
        />
        <StatCard
          label="Deliveries"
          value={stats?.deliveries || 0}
          icon="🚛"
          color="bg-purple-50"
        />
      </div>
      <div className="bg-white rounded-3xl border border-[#E8EEE5] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#F5F5F5] font-black text-[#1A1A1A]">
          All Recent Orders
        </div>
        <div className="divide-y divide-[#F5F5F5]">
          {safeOrders.map((o, i) => (
            <div
              key={o.id || i}
              className="flex items-center gap-4 px-6 py-4 hover:bg-[#F9FBF9]"
            >
              <div className="w-10 h-10 bg-[#E8F5E9] rounded-xl flex items-center justify-center font-black text-[#2E7D32] text-xs flex-shrink-0">
                #{o.id}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm truncate">
                  {o.product_name || "Product"}
                </p>
                <p className="text-xs text-[#9BA8A0]">
                  Buyer: {o.buyer_name || "Unknown"}
                </p>
              </div>
              <p className="font-black text-[#2E7D32] flex-shrink-0">
                KSh {parseFloat(o.total_price || 0).toLocaleString()}
              </p>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-black flex-shrink-0 ${STATUS_COLORS[o.status] || "bg-gray-100 text-gray-600"}`}
              >
                {o.status}
              </span>
              <p className="text-xs text-[#9BA8A0] hidden md:block flex-shrink-0">
                {o.created_at
                  ? new Date(o.created_at).toLocaleDateString()
                  : "—"}
              </p>
            </div>
          ))}
          {safeOrders.length === 0 && (
            <div className="text-center py-12 text-[#9BA8A0]">
              <p className="text-4xl mb-2">📦</p>
              <p className="font-bold">No orders yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AiMonitoringSection() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/admin/ai-logs")
      .then((r) => (r.ok ? r.json() : { logs: [] }))
      .then((d) => setLogs(d.logs || []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);
  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
        <StatCard
          label="Total AI Queries"
          value={logs.length}
          icon="🤖"
          color="bg-purple-50"
        />
        <StatCard
          label="Disease Queries"
          value={logs.filter((l) => l.query_type === "disease").length}
          icon="🔬"
          color="bg-red-50"
        />
        <StatCard
          label="Advice Queries"
          value={logs.filter((l) => l.query_type !== "disease").length}
          icon="💡"
          color="bg-yellow-50"
        />
      </div>
      <div className="bg-white rounded-3xl border border-[#E8EEE5] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#F5F5F5] font-black text-[#1A1A1A]">
          Recent AI Conversations
        </div>
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-[#4CAF50] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 text-[#9BA8A0]">
            <p className="text-4xl mb-3">🤖</p>
            <p className="font-bold">No AI conversations yet</p>
            <p className="text-sm mt-2">Queries from users will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-[#F5F5F5]">
            {logs.slice(0, 20).map((log, i) => (
              <div key={log.id || i} className="px-6 py-4 hover:bg-[#F9FBF9]">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${log.query_type === "disease" ? "bg-red-100 text-red-700" : "bg-purple-100 text-purple-700"}`}
                  >
                    {log.query_type || "advice"}
                  </span>
                  <span className="text-[10px] text-[#9BA8A0]">
                    {log.created_at
                      ? new Date(log.created_at).toLocaleString()
                      : "—"}
                  </span>
                </div>
                <p className="text-sm font-bold text-[#1A1A1A] mb-1">
                  Q: {(log.input_data || "").slice(0, 120)}
                  {(log.input_data || "").length > 120 ? "..." : ""}
                </p>
                <p className="text-xs text-[#9BA8A0]">
                  A: {(log.result || "").slice(0, 160)}...
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function AnalyticsSection({ stats, roleBreakdown = [] }) {
  const safeRoleBreakdown = roleBreakdown || [];
  const fmtMoney = (v) =>
    v >= 1000000
      ? `KSh ${(v / 1000000).toFixed(1)}M`
      : v >= 1000
        ? `KSh ${(v / 1000).toFixed(1)}K`
        : `KSh ${(v || 0).toLocaleString()}`;
  const roleColors = {
    farmer: "#2E7D32",
    buyer: "#1565C0",
    supplier: "#E65100",
    transporter: "#6A1B9A",
    expert: "#00838F",
    consumer: "#37474F",
    admin: "#C62828",
  };
  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <StatCard
          label="Total Revenue"
          value={fmtMoney(stats?.revenue || 0)}
          icon="💰"
          color="bg-green-50"
          change={15}
        />
        <StatCard
          label="Total Users"
          value={stats?.users || 0}
          icon="👥"
          color="bg-blue-50"
          change={12}
        />
        <StatCard
          label="Products Listed"
          value={stats?.products || 0}
          icon="🌾"
          color="bg-orange-50"
          change={8}
        />
        <StatCard
          label="Deliveries Done"
          value={stats?.deliveries || 0}
          icon="🚛"
          color="bg-purple-50"
          change={5}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-3xl p-8 border border-[#E8EEE5] shadow-sm">
          <h3 className="font-black text-lg mb-6">
            📊 User Distribution by Role
          </h3>
          {safeRoleBreakdown.map((r) => {
            const total =
              safeRoleBreakdown.reduce(
                (a, b) => a + parseInt(b.count || 0),
                0,
              ) || 1;
            const pct = Math.round((parseInt(r.count || 0) / total) * 100);
            return (
              <div key={r.role} className="flex items-center gap-4 mb-4">
                <span className="text-sm font-black capitalize w-20 flex-shrink-0">
                  {r.role}
                </span>
                <div className="flex-1 h-4 bg-[#F0F0F0] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: roleColors[r.role] || "#888",
                    }}
                  />
                </div>
                <span className="text-sm font-black w-20 text-right flex-shrink-0">
                  {r.count} ({pct}%)
                </span>
              </div>
            );
          })}
          {safeRoleBreakdown.length === 0 && (
            <p className="text-[#9BA8A0] text-sm text-center py-4">
              No role data yet.
            </p>
          )}
        </div>
        <div className="bg-white rounded-3xl p-8 border border-[#E8EEE5] shadow-sm">
          <h3 className="font-black text-lg mb-4">💰 Revenue & Activity</h3>
          <div className="text-center mb-5">
            <p className="text-4xl font-black text-[#2E7D32] mb-1">
              {fmtMoney(stats?.revenue || 0)}
            </p>
            <p className="text-sm text-[#9BA8A0]">Total Platform Revenue</p>
          </div>
          {[
            {
              label: "New Users (This Week)",
              value: stats?.newUsersThisWeek || 0,
              color: "#2E7D32",
            },
            {
              label: "Active Products",
              value: stats?.activeProducts || 0,
              color: "#1565C0",
            },
            {
              label: "Pending Orders",
              value: stats?.pendingOrders || 0,
              color: "#F9A825",
            },
            {
              label: "Active Deliveries",
              value: stats?.activeDeliveries || 0,
              color: "#6A1B9A",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex justify-between items-center py-2.5 border-b border-[#F5F5F5] last:border-0"
            >
              <span className="text-sm text-[#555]">{item.label}</span>
              <span
                className="font-black text-sm"
                style={{ color: item.color }}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-3xl p-8 border border-[#E8EEE5] shadow-sm">
        <h3 className="font-black text-lg mb-5">📈 Platform Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { emoji: "👥", label: "Total Users", value: stats?.users || 0 },
            {
              emoji: "🌾",
              label: "Farmers",
              value:
                safeRoleBreakdown.find((r) => r.role === "farmer")?.count || 0,
            },
            { emoji: "🛒", label: "Total Orders", value: stats?.orders || 0 },
            { emoji: "🚛", label: "Deliveries", value: stats?.deliveries || 0 },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-[#F5F7FA] rounded-2xl p-5 text-center"
            >
              <div className="text-3xl mb-2">{s.emoji}</div>
              <p className="text-2xl font-black text-[#1A1A1A]">
                {String(s.value).toLocaleString()}
              </p>
              <p className="text-xs text-[#9BA8A0] font-bold mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function NotificationsSection({ onShowToast }) {
  const [title, setTitle] = useState("");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const [type, setType] = useState("info");
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!title.trim() || !msg.trim()) {
      onShowToast?.("Please fill in title and message", "error");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message: msg, type, broadcast: true }),
      });
      if (!res.ok) throw new Error("Failed");
      setSent(true);
      setTitle("");
      setMsg("");
      onShowToast?.("Notification sent to all users!");
      setTimeout(() => setSent(false), 3000);
    } catch {
      onShowToast?.("Failed to send notification", "error");
    } finally {
      setSending(false);
    }
  };

  const notifTypes = [
    { label: "📢 General Announcement", value: "info" },
    { label: "⚠️ Weather Alert", value: "warning" },
    { label: "🌱 Farming News & Tips", value: "tip" },
    { label: "💰 Market Price Update", value: "market" },
    { label: "🚨 Disease Outbreak Alert", value: "alert" },
    { label: "🎉 Platform Update", value: "update" },
  ];

  return (
    <div>
      <div className="bg-white rounded-3xl p-8 border border-[#E8EEE5] shadow-sm mb-6">
        <h3 className="font-black text-xl mb-5">
          📢 Send Announcement to All Users
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#555] mb-2 uppercase tracking-wide">
              Notification Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border-2 border-[#E8EEE5] rounded-2xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
            >
              {notifTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-[#555] mb-2 uppercase tracking-wide">
              Title *
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Heavy Rainfall Alert for Western Kenya"
              className="w-full border-2 border-[#E8EEE5] rounded-2xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4CAF50] transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#555] mb-2 uppercase tracking-wide">
              Message *
            </label>
            <textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              rows={4}
              placeholder="Write your message to all users..."
              className="w-full border-2 border-[#E8EEE5] rounded-2xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4CAF50] transition-all resize-none"
            />
          </div>
          <button
            onClick={send}
            disabled={sending}
            className="bg-[#4CAF50] text-white px-8 py-3.5 rounded-2xl font-black text-sm hover:bg-[#43A047] transition-all disabled:opacity-50"
          >
            {sent
              ? "✅ Sent!"
              : sending
                ? "Sending..."
                : "📤 Send to All Users"}
          </button>
        </div>
      </div>
      <div className="bg-[#FFF8E1] border border-[#FBC02D]/40 rounded-3xl p-6">
        <p className="font-black text-[#795548] mb-3">
          📋 Notification Types Available
        </p>
        <div className="grid grid-cols-2 gap-2">
          {notifTypes.map((t) => (
            <div
              key={t.value}
              className="flex items-center gap-2 text-sm text-[#795548] font-medium py-1"
            >
              <span className="w-2 h-2 bg-[#FBC02D] rounded-full flex-shrink-0" />
              {t.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function NewsSection() {
  return (
    <div className="bg-white rounded-3xl p-8 border border-[#E8EEE5] shadow-sm">
      <h3 className="font-black text-xl mb-5">
        📰 Publish News Article or Event
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {[
          {
            label: "Content Type",
            options: [
              "📰 News Article",
              "📅 Event",
              "🌱 Farming Tip",
              "🚨 Alert",
              "🎓 Training Announcement",
            ],
          },
          {
            label: "Category",
            options: [
              "Crop Farming",
              "Livestock",
              "Weather",
              "Market Prices",
              "Technology",
              "Policy & Government",
            ],
          },
        ].map((s) => (
          <div key={s.label}>
            <label className="block text-sm font-bold text-[#555] mb-2 uppercase tracking-wide">
              {s.label}
            </label>
            <select className="w-full border-2 border-[#E8EEE5] rounded-2xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4CAF50]">
              {s.options.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-[#555] mb-2 uppercase tracking-wide">
            Title
          </label>
          <input
            placeholder="Enter article or event title..."
            className="w-full border-2 border-[#E8EEE5] rounded-2xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4CAF50] transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-[#555] mb-2 uppercase tracking-wide">
            Content
          </label>
          <textarea
            rows={6}
            placeholder="Write article content, event details, or farming tip here..."
            className="w-full border-2 border-[#E8EEE5] rounded-2xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4CAF50] transition-all resize-none"
          />
        </div>
        <div className="flex gap-3">
          <button className="bg-[#4CAF50] text-white px-8 py-3.5 rounded-2xl font-black text-sm hover:bg-[#43A047] transition-all">
            📤 Publish Now
          </button>
          <button className="border-2 border-[#E8EEE5] text-[#555] px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-[#F5F5F5] transition-all">
            💾 Save Draft
          </button>
        </div>
      </div>
    </div>
  );
}

export function ReportsSection() {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <StatCard
          label="User Complaints"
          value="0"
          icon="📋"
          color="bg-blue-50"
          sub="Filed reports"
        />
        <StatCard
          label="Fraud Reports"
          value="0"
          icon="🚨"
          color="bg-red-50"
          sub="Suspicious activity"
        />
        <StatCard
          label="Product Reports"
          value="0"
          icon="⚠️"
          color="bg-yellow-50"
          sub="Fake listings"
        />
      </div>
      <div className="bg-white rounded-3xl p-12 border border-[#E8EEE5] shadow-sm flex flex-col items-center justify-center text-center">
        <div className="text-5xl mb-4">✅</div>
        <h3 className="text-xl font-black text-[#1A1A1A] mb-2">
          No Active Reports
        </h3>
        <p className="text-[#9BA8A0] max-w-sm text-sm leading-relaxed">
          When users report issues, fraud, or suspicious products, they will
          appear here for your review and action.
        </p>
      </div>
    </div>
  );
}

export function SettingsSection() {
  const sections = [
    {
      title: "🌐 Platform Settings",
      items: [
        { label: "Platform Name", input: true, value: "AgriConnection" },
        {
          label: "Support Email",
          input: true,
          value: "support@agriconnection.co.ke",
        },
        { label: "Platform Region", input: true, value: "Kenya, East Africa" },
      ],
    },
    {
      title: "🛡️ Security Settings",
      items: [
        {
          label: "Require Email Verification on Signup",
          toggle: true,
          on: true,
        },
        { label: "Admin Review for Farmers & Experts", toggle: true, on: true },
        { label: "Two-Factor Authentication (Admin)", toggle: true, on: false },
        { label: "Block Suspicious Login Attempts", toggle: true, on: true },
      ],
    },
    {
      title: "💬 Notification Settings",
      items: [
        { label: "Email Notifications", toggle: true, on: true },
        { label: "SMS Notifications", toggle: true, on: false },
        { label: "Push Notifications", toggle: true, on: true },
        { label: "Weather Alert Broadcasts", toggle: true, on: true },
      ],
    },
  ];
  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div
          key={section.title}
          className="bg-white rounded-3xl border border-[#E8EEE5] overflow-hidden shadow-sm"
        >
          <div className="px-8 py-5 border-b border-[#F5F5F5] font-black text-[#1A1A1A]">
            {section.title}
          </div>
          <div className="divide-y divide-[#F5F5F5]">
            {section.items.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between px-8 py-4"
              >
                <span className="text-sm font-bold text-[#333]">
                  {item.label}
                </span>
                {item.toggle ? (
                  <div
                    className={`w-12 h-6 rounded-full transition-all cursor-pointer flex items-center px-1 ${item.on ? "bg-[#4CAF50]" : "bg-[#E0E0E0]"}`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full shadow transition-all ${item.on ? "translate-x-6" : "translate-x-0"}`}
                    />
                  </div>
                ) : item.input ? (
                  <input
                    defaultValue={item.value}
                    className="border-2 border-[#E8EEE5] rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-[#4CAF50] w-52"
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ))}
      <button className="bg-[#4CAF50] text-white px-8 py-3.5 rounded-2xl font-black text-sm hover:bg-[#43A047] transition-all">
        💾 Save Settings
      </button>
    </div>
  );
}
