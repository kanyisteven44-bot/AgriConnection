import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";
import { decode } from "@auth/core/jwt";

async function getUserId(request) {
  const session = await auth();
  if (session?.user?.id) return parseInt(session.user.id);
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const isSecure = process.env.AUTH_URL?.startsWith("https") ?? false;
      const salt = isSecure
        ? "__Secure-authjs.session-token"
        : "authjs.session-token";
      const payload = await decode({
        token,
        secret: process.env.AUTH_SECRET,
        salt,
      });
      if (payload?.sub) return parseInt(payload.sub);
    } catch {}
  }
  return null;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const sellerId = searchParams.get("sellerId");
    const query = searchParams.get("query");
    const mine = searchParams.get("mine") === "true";
    const rawLimit = parseInt(searchParams.get("limit") || "50");
    const limit = isNaN(rawLimit) ? 50 : Math.min(rawLimit, 200);
    const productId = searchParams.get("id");

    // Single product by id
    if (productId) {
      const rows =
        await sql`SELECT p.*, u.name as seller_name FROM products p JOIN auth_users u ON p.seller_id = u.id WHERE p.id = ${productId}`;
      return Response.json({ product: rows[0] || null });
    }

    let sqlQuery = `SELECT p.*, u.name as seller_name FROM products p JOIN auth_users u ON p.seller_id = u.id WHERE p.is_available = true`;
    const params = [];

    if (mine) {
      const userId = await getUserId(request);
      if (!userId)
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      params.push(userId);
      sqlQuery = `SELECT p.*, u.name as seller_name FROM products p JOIN auth_users u ON p.seller_id = u.id WHERE p.seller_id = $${params.length}`;
    }

    if (category) {
      params.push(category);
      sqlQuery += ` AND p.category = $${params.length}`;
    }
    if (sellerId && !mine) {
      params.push(sellerId);
      sqlQuery += ` AND p.seller_id = $${params.length}`;
    }
    if (query) {
      params.push(`%${query}%`);
      sqlQuery += ` AND (p.name ILIKE $${params.length} OR p.description ILIKE $${params.length})`;
    }

    params.push(limit);
    sqlQuery += ` ORDER BY p.created_at DESC LIMIT $${params.length}`;

    const products = await sql(sqlQuery, params);
    return Response.json({ products });
  } catch (err) {
    console.error("GET /api/products error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const userId = await getUserId(request);
    if (!userId)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const {
      name,
      category,
      price,
      unit,
      quantity,
      description,
      image_url,
      location,
    } = body;

    if (!name || !category || price == null || !unit || quantity == null) {
      return Response.json(
        {
          error:
            "Missing required fields: name, category, price, unit, quantity",
        },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO products (seller_id, name, category, price, unit, quantity, description, image_url, location)
      VALUES (${userId}, ${name}, ${category}, ${parseFloat(price)}, ${unit}, ${parseFloat(quantity)}, ${description || null}, ${image_url || null}, ${location || null})
      RETURNING *
    `;
    return Response.json({ product: result[0] });
  } catch (err) {
    console.error("POST /api/products error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const userId = await getUserId(request);
    if (!userId)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id)
      return Response.json({ error: "Missing product id" }, { status: 400 });

    const body = await request.json();
    const fields = [];
    const params = [];
    const allowed = [
      "name",
      "category",
      "price",
      "unit",
      "quantity",
      "description",
      "image_url",
      "location",
      "is_available",
    ];
    for (const key of allowed) {
      if (key in body) {
        params.push(body[key]);
        fields.push(`${key} = $${params.length}`);
      }
    }
    if (!fields.length)
      return Response.json({ error: "No fields to update" }, { status: 400 });

    params.push(id, userId);
    await sql(
      `UPDATE products SET ${fields.join(",")} WHERE id = $${params.length - 1} AND seller_id = $${params.length}`,
      params,
    );
    return Response.json({ success: true });
  } catch (err) {
    console.error("PUT /api/products error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const userId = await getUserId(request);
    if (!userId)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id)
      return Response.json({ error: "Missing product id" }, { status: 400 });

    await sql`DELETE FROM products WHERE id = ${id} AND seller_id = ${userId}`;
    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/products error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
