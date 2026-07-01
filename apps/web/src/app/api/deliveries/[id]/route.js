import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params; // order_id
    const rows = await sql`
      SELECT d.*, o.product_id, o.quantity, o.total_price, o.status as order_status,
             p.name as product_name, p.image_url,
             u.name as transporter_name, u.phone as transporter_phone, u.profile_photo as transporter_photo,
             v.vehicle_type, v.capacity
      FROM deliveries d
      JOIN orders o ON d.order_id = o.id
      JOIN products p ON o.product_id = p.id
      LEFT JOIN auth_users u ON d.transporter_id = u.id
      LEFT JOIN vehicles v ON v.transporter_id = d.transporter_id
      WHERE d.order_id = ${id}
      LIMIT 1
    `;

    if (rows.length === 0) {
      // Verify the order exists first
      const orderRows =
        await sql`SELECT id FROM orders WHERE id = ${id} LIMIT 1`;
      if (orderRows.length === 0) {
        return Response.json({ error: "Order not found" }, { status: 404 });
      }
      const newDelivs = await sql`
        INSERT INTO deliveries (order_id, status, pickup_location, dropoff_location)
        VALUES (${id}, 'pending', 'Farm Location', 'Delivery Address')
        RETURNING *
      `;
      return Response.json({ delivery: newDelivs[0] || null });
    }

    return Response.json({ delivery: rows[0] });
  } catch (err) {
    console.error("GET /api/deliveries/[id] error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
