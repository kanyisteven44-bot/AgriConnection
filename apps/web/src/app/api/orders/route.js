import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Check if user is buyer or seller
    const userRows =
      await sql`SELECT role FROM auth_users WHERE id = ${userId}`;
    const role = userRows[0]?.role;

    let orders;
    if (role === "farmer" || role === "supplier") {
      orders = await sql`
        SELECT o.*, p.name as product_name, p.image_url, u.name as buyer_name 
        FROM orders o 
        JOIN products p ON o.product_id = p.id 
        JOIN auth_users u ON o.buyer_id = u.id
        WHERE p.seller_id = ${userId}
        ORDER BY o.created_at DESC
      `;
    } else {
      orders = await sql`
        SELECT o.*, p.name as product_name, p.image_url, u.name as seller_name 
        FROM orders o 
        JOIN products p ON o.product_id = p.id 
        JOIN auth_users u ON p.seller_id = u.id
        WHERE o.buyer_id = ${userId}
        ORDER BY o.created_at DESC
      `;
    }

    return Response.json({ orders });
  } catch (err) {
    console.error("GET /api/orders error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { product_id, quantity, payment_method } = body;

    const productRows =
      await sql`SELECT price, quantity as stock FROM products WHERE id = ${product_id}`;
    if (productRows.length === 0)
      return Response.json({ error: "Product not found" }, { status: 404 });

    const product = productRows[0];
    if (product.stock < quantity)
      return Response.json({ error: "Insufficient stock" }, { status: 400 });

    const total_price = product.price * quantity;

    const orderRows = await sql`
      INSERT INTO orders (buyer_id, product_id, quantity, total_price, payment_method)
      VALUES (${session.user.id}, ${product_id}, ${quantity}, ${total_price}, ${payment_method})
      RETURNING *
    `;

    await sql`
      UPDATE products SET quantity = quantity - ${quantity} WHERE id = ${product_id}
    `;

    return Response.json({ order: orderRows[0] });
  } catch (err) {
    console.error("POST /api/orders error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
