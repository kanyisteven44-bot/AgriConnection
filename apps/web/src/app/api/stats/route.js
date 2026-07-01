import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user role first
    const roleRows = await sql`SELECT role FROM auth_users WHERE id = ${userId}`;
    const role = roleRows[0]?.role || "farmer";

    let stats = {};

    try {
      if (role === "farmer" || role === "supplier") {
        const [productCount, orderCount, revenue, deliveryCount] = await Promise.all([
          sql`SELECT COUNT(*) as count FROM products WHERE seller_id = ${userId} AND is_available = true`,
          sql`SELECT COUNT(*) as count FROM orders o JOIN products p ON o.product_id = p.id WHERE p.seller_id = ${userId}`,
          sql`SELECT COALESCE(SUM(o.total_price), 0) as total FROM orders o JOIN products p ON o.product_id = p.id WHERE p.seller_id = ${userId} AND o.status != 'cancelled'`,
          sql`SELECT COUNT(*) as count FROM deliveries d JOIN orders o ON d.order_id = o.id JOIN products p ON o.product_id = p.id WHERE p.seller_id = ${userId}`,
        ]);
        stats = {
          products: parseInt(productCount[0]?.count || 0),
          orders: parseInt(orderCount[0]?.count || 0),
          revenue: parseFloat(revenue[0]?.total || 0),
          deliveries: parseInt(deliveryCount[0]?.count || 0),
        };
      } else if (role === "buyer" || role === "consumer") {
        const [orderCount, deliveryCount] = await Promise.all([
          sql`SELECT COUNT(*) as count FROM orders WHERE buyer_id = ${userId}`,
          sql`SELECT COUNT(*) as count FROM deliveries d JOIN orders o ON d.order_id = o.id WHERE o.buyer_id = ${userId}`,
        ]);
        stats = {
          orders: parseInt(orderCount[0]?.count || 0),
          deliveries: parseInt(deliveryCount[0]?.count || 0),
          favorites: 0,
          spent: 0,
        };
      } else if (role === "transporter") {
        const [deliveryCount, activeCount] = await Promise.all([
          sql`SELECT COUNT(*) as count FROM deliveries WHERE transporter_id = ${userId}`,
          sql`SELECT COUNT(*) as count FROM deliveries WHERE transporter_id = ${userId} AND status = 'in_transit'`,
        ]);
        stats = {
          deliveries: parseInt(deliveryCount[0]?.count || 0),
          active: parseInt(activeCount[0]?.count || 0),
        };
      } else {
        stats = { orders: 0, products: 0, revenue: 0, deliveries: 0 };
      }
    } catch (innerErr) {
      console.error("Stats query error:", innerErr);
      stats = { orders: 0, products: 0, revenue: 0, deliveries: 0 };
    }

    // Recent activity
    let recent = [];
    try {
      recent = await sql`
        SELECT o.id, o.created_at, o.status, o.total_price, p.name as product_name
        FROM orders o
        JOIN products p ON o.product_id = p.id
        WHERE o.buyer_id = ${userId} OR p.seller_id = ${userId}
        ORDER BY o.created_at DESC
        LIMIT 5
      `;
    } catch {}

    return Response.json({ stats, role, recent });
  } catch (err) {
    console.error("GET /api/stats error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
