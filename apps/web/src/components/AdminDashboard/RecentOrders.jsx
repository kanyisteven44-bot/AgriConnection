export function RecentOrders({ recentOrders }) {
  const orders = Array.isArray(recentOrders) ? recentOrders : [];

  if (orders.length === 0) {
    return <p className="text-[#9BA8A0] text-sm">No orders yet.</p>;
  }

  return (
    <div className="space-y-2">
      {orders.slice(0, 6).map((o) => (
        <div
          key={o.id}
          className="flex items-center gap-3 py-2.5 border-b border-[#F5F5F5] last:border-0"
        >
          <div className="w-9 h-9 bg-[#E8F5E9] rounded-xl flex items-center justify-center text-xs font-black text-[#2E7D32]">
            #{o.id}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#1A1A1A] truncate">
              {o.product_name || "Product"}
            </p>
            <p className="text-xs text-[#9BA8A0]">{o.buyer_name || "—"}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-black text-[#2E7D32]">
              KSh {parseFloat(o.total_price || 0).toLocaleString()}
            </p>
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                o.status === "delivered"
                  ? "bg-green-100 text-green-700"
                  : o.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-blue-100 text-blue-700"
              }`}
            >
              {o.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
