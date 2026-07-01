export const ROLE_COLORS = {
  farmer: "bg-green-100 text-green-700",
  buyer: "bg-blue-100 text-blue-700",
  supplier: "bg-orange-100 text-orange-700",
  transporter: "bg-purple-100 text-purple-700",
  expert: "bg-teal-100 text-teal-700",
  admin: "bg-gray-100 text-gray-700",
  consumer: "bg-slate-100 text-slate-700",
};

export const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-blue-100 text-blue-700",
  confirmed: "bg-teal-100 text-teal-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export const NAV_ITEMS = [
  { key: "overview", label: "Overview", icon: "📊" },
  { key: "users", label: "User Management", icon: "👥" },
  { key: "verifications", label: "Farmer Verification", icon: "✅" },
  { key: "products", label: "Marketplace", icon: "🛒" },
  { key: "orders", label: "Orders", icon: "📦" },
  { key: "ai_chat", label: "AI Assistant", icon: "🤖" },
  { key: "ai_monitor", label: "AI Monitoring", icon: "📡" },
  { key: "analytics", label: "Analytics", icon: "📈" },
  { key: "notifications", label: "Notifications", icon: "🔔" },
  { key: "news", label: "News & Events", icon: "📰" },
  { key: "reports", label: "Reports", icon: "🚨" },
  { key: "settings", label: "Settings", icon: "⚙️" },
];

export const USER_ROLES = [
  "farmer",
  "buyer",
  "supplier",
  "transporter",
  "expert",
  "consumer",
  "admin",
];
