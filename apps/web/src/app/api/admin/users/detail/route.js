import { auth } from "@/auth";
import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    // Enforce admin-only access
    const roleCheck =
      await sql`SELECT role FROM auth_users WHERE id = ${session.user.id}`;
    if (roleCheck[0]?.role !== "admin")
      return Response.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");
    if (!userId)
      return Response.json({ error: "User ID required" }, { status: 400 });

    const [userRows, ordersRows, productsRows, aiRows, farmRows] =
      await Promise.all([
        sql`SELECT u.id, u.name, u.email, u.role, u.phone, u.location, u.image, u.profile_photo,
                 u.is_verified, u.id_number, u.created_at,
                 (SELECT COUNT(*) FROM orders WHERE buyer_id = u.id) as total_orders,
                 (SELECT COALESCE(SUM(total_price),0) FROM orders WHERE buyer_id = u.id) as total_spent
           FROM auth_users u WHERE u.id = ${userId} LIMIT 1`,
        sql`SELECT o.id, o.total_price, o.status, o.created_at, p.name as product_name
          FROM orders o LEFT JOIN products p ON o.product_id = p.id
          WHERE o.buyer_id = ${userId} ORDER BY o.created_at DESC LIMIT 10`,
        sql`SELECT id, name, category, price, unit, quantity, image_url, is_available, created_at
          FROM products WHERE seller_id = ${userId} ORDER BY created_at DESC LIMIT 10`,
        sql`SELECT id, category, message, created_at FROM ai_chat_history WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 5`,
        sql`SELECT id, size, location, crops_grown, livestock_info FROM farms WHERE farmer_id = ${userId} LIMIT 1`,
      ]);

    if (!userRows.length)
      return Response.json({ error: "User not found" }, { status: 404 });

    return Response.json({
      user: userRows[0],
      orders: ordersRows,
      products: productsRows,
      aiHistory: aiRows,
      farm: farmRows[0] || null,
    });
  } catch (err) {
    console.error("GET /api/admin/users/detail error", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
