import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    // Enforce admin-only access
    const roleCheck =
      await sql`SELECT role FROM auth_users WHERE id = ${session.user.id}`;
    if (roleCheck[0]?.role !== "admin")
      return Response.json({ error: "Forbidden" }, { status: 403 });

    const [
      userStats,
      orderStats,
      productStats,
      deliveryStats,
      roleBreakdown,
      recentUsers,
      recentOrders,
    ] = await Promise.all([
      sql`SELECT COUNT(*) as total, COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as new_this_week FROM auth_users`,
      sql`SELECT COUNT(*) as total, COALESCE(SUM(total_price), 0) as revenue, COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending FROM orders`,
      sql`SELECT COUNT(*) as total, COUNT(CASE WHEN is_available = true THEN 1 END) as active FROM products`,
      sql`SELECT COUNT(*) as total, COUNT(CASE WHEN status = 'in_transit' THEN 1 END) as active FROM deliveries`,
      sql`SELECT role, COUNT(*) as count FROM auth_users GROUP BY role ORDER BY count DESC`,
      sql`SELECT id, name, email, role, is_verified, created_at FROM auth_users ORDER BY created_at DESC LIMIT 20`,
      sql`SELECT o.id, o.total_price, o.status, o.created_at, p.name as product_name, u.name as buyer_name FROM orders o LEFT JOIN products p ON o.product_id = p.id LEFT JOIN auth_users u ON o.buyer_id = u.id ORDER BY o.created_at DESC LIMIT 10`,
    ]);

    return Response.json({
      stats: {
        users: parseInt(userStats[0]?.total || 0),
        newUsersThisWeek: parseInt(userStats[0]?.new_this_week || 0),
        orders: parseInt(orderStats[0]?.total || 0),
        revenue: parseFloat(orderStats[0]?.revenue || 0),
        pendingOrders: parseInt(orderStats[0]?.pending || 0),
        products: parseInt(productStats[0]?.total || 0),
        activeProducts: parseInt(productStats[0]?.active || 0),
        deliveries: parseInt(deliveryStats[0]?.total || 0),
        activeDeliveries: parseInt(deliveryStats[0]?.active || 0),
      },
      roleBreakdown,
      recentUsers,
      recentOrders,
    });
  } catch (err) {
    console.error("GET /api/admin/stats error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
