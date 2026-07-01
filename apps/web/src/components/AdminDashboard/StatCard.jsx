export function StatCard({ label, value, sub, icon, color, change }) {
  return (
    <div className="bg-white rounded-3xl p-7 border border-[#E8EEE5] shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-5">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${color}`}
        >
          {icon}
        </div>
        <span
          className={`text-xs font-black px-2.5 py-1 rounded-full ${change >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
        >
          {change >= 0 ? "+" : ""}
          {change}%
        </span>
      </div>
      <p className="text-3xl font-black text-[#1A1A1A] mb-1">{value}</p>
      <p className="text-xs font-bold text-[#9BA8A0] uppercase tracking-wider">
        {label}
      </p>
      {sub && <p className="text-xs text-[#9BA8A0] mt-1">{sub}</p>}
    </div>
  );
}
