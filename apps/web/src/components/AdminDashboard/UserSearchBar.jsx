import { USER_ROLES } from "@/constants/adminDashboard";

export function UserSearchBar({
  userSearch,
  setUserSearch,
  userRole,
  setUserRole,
  userTotal,
  onSearch,
}) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-[#E8EEE5] shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9BA8A0]">
            🔍
          </span>
          <input
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            placeholder="Search by name or email..."
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-[#E8EEE5] focus:outline-none focus:ring-2 focus:ring-[#4CAF50] bg-[#F5F7FA] font-medium text-sm"
          />
        </div>
        <select
          value={userRole}
          onChange={(e) => {
            setUserRole(e.target.value);
            onSearch(e.target.value);
          }}
          className="px-4 py-3.5 rounded-2xl border border-[#E8EEE5] bg-[#F5F7FA] font-bold text-[#555] text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
        >
          <option value="">All Roles</option>
          {USER_ROLES.map((r) => (
            <option key={r} value={r} className="capitalize">
              {r}
            </option>
          ))}
        </select>
        <button
          onClick={() => onSearch()}
          className="bg-[#4CAF50] text-white px-8 py-3.5 rounded-2xl font-black hover:bg-[#43A047] transition-all text-sm"
        >
          Search
        </button>
      </div>
      <p className="text-xs text-[#9BA8A0] mt-3 font-bold">
        {userTotal} users found
      </p>
    </div>
  );
}
