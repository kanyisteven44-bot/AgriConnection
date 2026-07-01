import { StatCard } from "@/components/AdminDashboard/StatCard";
import { RoleBreakdown } from "@/components/AdminDashboard/RoleBreakdown";
import { RecentOrders } from "@/components/AdminDashboard/RecentOrders";
import { RecentUsers } from "@/components/AdminDashboard/RecentUsers";

export function OverviewSection({
  stats,
  roleBreakdown,
  recentOrders,
  recentUsers,
  onViewAllUsers,
}) {
  const revenue = stats?.revenue || 0;
  const fmtRevenue =
    revenue >= 1000000
      ? `KSh ${(revenue / 1000000).toFixed(1)}M`
      : revenue >= 1000
        ? `KSh ${(revenue / 1000).toFixed(1)}K`
        : `KSh ${revenue.toLocaleString()}`;

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          label="Total Users"
          value={(stats?.users || 0).toLocaleString()}
          sub={`+${stats?.newUsersThisWeek || 0} this week`}
          icon="👥"
          color="bg-blue-50"
          change={12}
        />
        <StatCard
          label="Total Orders"
          value={(stats?.orders || 0).toLocaleString()}
          sub={`${stats?.pendingOrders || 0} pending`}
          icon="🛒"
          color="bg-orange-50"
          change={8}
        />
        <StatCard
          label="Platform Revenue"
          value={fmtRevenue}
          sub="Total earnings"
          icon="💰"
          color="bg-yellow-50"
          change={15}
        />
        <StatCard
          label="Active Products"
          value={(stats?.activeProducts || 0).toLocaleString()}
          sub={`${stats?.products || 0} total listed`}
          icon="🌾"
          color="bg-green-50"
          change={5}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Role breakdown */}
        <div className="bg-white rounded-3xl p-8 border border-[#E8EEE5] shadow-sm">
          <h3 className="font-black text-lg mb-6">👥 Users by Role</h3>
          <RoleBreakdown roleBreakdown={roleBreakdown} />
        </div>

        {/* Recent orders */}
        <div className="bg-white rounded-3xl p-8 border border-[#E8EEE5] shadow-sm">
          <h3 className="font-black text-lg mb-6">🛒 Recent Orders</h3>
          <RecentOrders recentOrders={recentOrders} />
        </div>
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            label: "Active Deliveries",
            value: stats?.activeDeliveries || 0,
            icon: "🚚",
            color: "bg-purple-50",
          },
          {
            label: "Total Deliveries",
            value: stats?.deliveries || 0,
            icon: "📦",
            color: "bg-indigo-50",
          },
          {
            label: "Pending Orders",
            value: stats?.pendingOrders || 0,
            icon: "⏳",
            color: "bg-yellow-50",
          },
          {
            label: "New Users / Week",
            value: stats?.newUsersThisWeek || 0,
            icon: "🆕",
            color: "bg-pink-50",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-3xl p-6 border border-[#E8EEE5] shadow-sm hover:shadow-md transition-all"
          >
            <div
              className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center text-lg mb-4`}
            >
              {s.icon}
            </div>
            <p className="text-2xl font-black text-[#1A1A1A]">
              {s.value.toLocaleString()}
            </p>
            <p className="text-xs font-bold text-[#9BA8A0] uppercase tracking-wider mt-1">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Recent users */}
      <RecentUsers recentUsers={recentUsers} onViewAll={onViewAllUsers} />
    </div>
  );
}
