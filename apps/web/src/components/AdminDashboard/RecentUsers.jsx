import { ROLE_COLORS } from "@/constants/adminDashboard";

export function RecentUsers({ recentUsers, onViewAll }) {
  if (recentUsers.length === 0) {
    return (
      <div className="px-8 py-6 text-[#9BA8A0] text-sm">No users yet.</div>
    );
  }

  return (
    <div className="mt-8 bg-white rounded-3xl border border-[#E8EEE5] shadow-sm overflow-hidden">
      <div className="px-8 py-6 border-b border-[#F5F5F5] flex items-center justify-between">
        <h3 className="font-black text-lg">🆕 Recently Joined Users</h3>
        <button
          onClick={onViewAll}
          className="text-xs font-black text-[#2E7D32] hover:underline"
        >
          View All →
        </button>
      </div>
      <div className="divide-y divide-[#F5F5F5]">
        {recentUsers.slice(0, 10).map((u) => (
          <div
            key={u.id}
            className="flex items-center gap-4 px-8 py-4 hover:bg-[#F9FBF9]"
          >
            {u.profile_photo ? (
              <img
                src={u.profile_photo}
                className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                alt=""
              />
            ) : (
              <div className="w-10 h-10 bg-[#E8F5E9] rounded-xl flex items-center justify-center font-black text-[#2E7D32] flex-shrink-0">
                {(u.name || "?")[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-black text-sm text-[#1A1A1A] truncate">
                {u.name}
              </p>
              <p className="text-xs text-[#9BA8A0] truncate">{u.email}</p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase flex-shrink-0 ${ROLE_COLORS[u.role] || "bg-gray-100 text-gray-600"}`}
            >
              {u.role}
            </span>
            {u.location && (
              <span className="text-xs text-[#9BA8A0] hidden sm:block flex-shrink-0">
                📍 {u.location}
              </span>
            )}
            <span className="text-[10px] text-[#9BA8A0] flex-shrink-0">
              {new Date(u.created_at).toLocaleDateString("en-KE", {
                month: "short",
                day: "numeric",
              })}
            </span>
            {u.is_verified && <span className="text-xs flex-shrink-0">✅</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
