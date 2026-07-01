import { ROLE_COLORS } from "@/constants/adminDashboard";

export function UserTable({
  users,
  usersLoading,
  actionLoading,
  onUserAction,
  onViewDetail,
}) {
  const safeUsers = users || [];

  if (usersLoading) {
    return (
      <tr>
        <td colSpan={8} className="text-center py-16 text-[#9BA8A0] font-bold">
          🔄 Loading users...
        </td>
      </tr>
    );
  }

  if (safeUsers.length === 0) {
    return (
      <tr>
        <td colSpan={8} className="text-center py-16 text-[#9BA8A0] font-bold">
          No users found. Try a different search.
        </td>
      </tr>
    );
  }

  return (
    <>
      {safeUsers.map((u) => (
        <tr key={u.id} className="hover:bg-[#F9FBF9] transition-all">
          <td className="px-6 py-4">
            <div className="flex items-center gap-3">
              {u.profile_photo || u.image ? (
                <img
                  src={u.profile_photo || u.image}
                  className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                  alt=""
                />
              ) : (
                <div className="w-10 h-10 bg-[#E8F5E9] rounded-xl flex items-center justify-center font-black text-[#2E7D32] flex-shrink-0">
                  {(u.name || "?")[0].toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-black text-[#1A1A1A] text-sm truncate max-w-[140px]">
                  {u.name}
                </p>
                <p className="text-xs text-[#9BA8A0] truncate max-w-[140px]">
                  {u.email}
                </p>
              </div>
            </div>
          </td>
          <td className="px-6 py-4">
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${ROLE_COLORS[u.role] || "bg-gray-100 text-gray-600"}`}
            >
              {u.role}
            </span>
          </td>
          <td className="px-6 py-4 text-sm text-[#555]">{u.location || "—"}</td>
          <td className="px-6 py-4">
            <div>
              <span
                className={`text-xs font-black ${u.is_verified ? "text-green-600" : "text-[#9BA8A0]"}`}
              >
                {u.is_verified ? "✅ Verified" : "⏳ Unverified"}
              </span>
              {u.id_number && (
                <p className="text-[10px] text-[#9BA8A0] mt-0.5">
                  ID: {u.id_number.slice(0, 4)}****
                </p>
              )}
            </div>
          </td>
          <td className="px-6 py-4 text-sm font-bold text-[#555] text-center">
            {u.product_count || 0}
          </td>
          <td className="px-6 py-4 text-sm font-bold text-[#555] text-center">
            {u.order_count || 0}
          </td>
          <td className="px-6 py-4 text-xs text-[#9BA8A0]">
            {new Date(u.created_at).toLocaleDateString("en-KE", {
              month: "short",
              day: "numeric",
              year: "2-digit",
            })}
          </td>
          <td className="px-6 py-4">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => onViewDetail?.(u.id)}
                className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-[10px] font-black hover:bg-blue-100 transition-all whitespace-nowrap"
              >
                👁️ View
              </button>
              {u.is_verified ? (
                <button
                  onClick={() => onUserAction(u.id, "unverify")}
                  disabled={actionLoading === `${u.id}-unverify`}
                  className="px-3 py-1.5 rounded-xl bg-yellow-50 text-yellow-700 text-[10px] font-black hover:bg-yellow-100 transition-all disabled:opacity-50 whitespace-nowrap"
                >
                  {actionLoading === `${u.id}-unverify` ? "..." : "⚠️ Unverify"}
                </button>
              ) : (
                <button
                  onClick={() => onUserAction(u.id, "verify")}
                  disabled={actionLoading === `${u.id}-verify`}
                  className="px-3 py-1.5 rounded-xl bg-green-50 text-green-700 text-[10px] font-black hover:bg-green-100 transition-all disabled:opacity-50 whitespace-nowrap"
                >
                  {actionLoading === `${u.id}-verify` ? "..." : "✅ Verify"}
                </button>
              )}
              <button
                onClick={() => {
                  if (
                    window.confirm(`Delete ${u.name}? This cannot be undone.`)
                  )
                    onUserAction(u.id, "delete");
                }}
                disabled={actionLoading === `${u.id}-delete`}
                className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 text-[10px] font-black hover:bg-red-100 transition-all disabled:opacity-50"
              >
                {actionLoading === `${u.id}-delete` ? "..." : "🗑️ Delete"}
              </button>
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}
