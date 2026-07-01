import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

async function requireAdmin(session) {
  if (!session?.user?.id) return "unauthorized";
  const rows =
    await sql`SELECT role FROM auth_users WHERE id = ${session.user.id}`;
  if (rows[0]?.role !== "admin") return "forbidden";
  return null;
}

export async function GET(request) {
  try {
    const session = await auth();
    const denied = await requireAdmin(session);
    if (denied === "unauthorized")
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (denied === "forbidden")
      return Response.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const rawPage = parseInt(searchParams.get("page") || "1");
    const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
    const limit = 15;
    const offset = (page - 1) * limit;

    const whereClauses = ["1=1"];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      whereClauses.push(
        `(u.name ILIKE $${params.length} OR u.email ILIKE $${params.length})`,
      );
    }
    if (role) {
      params.push(role);
      whereClauses.push(`u.role = $${params.length}`);
    }

    const whereClause = whereClauses.join(" AND ");
    const query = `
      SELECT u.id, u.name, u.email, u.role, u.phone, u.location, u.image, u.profile_photo,
             u.is_verified, u.id_number, u.created_at,
             COUNT(DISTINCT p.id) as product_count,
             COUNT(DISTINCT o.id) as order_count
      FROM auth_users u
      LEFT JOIN products p ON p.seller_id = u.id
      LEFT JOIN orders o ON o.buyer_id = u.id
      WHERE ${whereClause}
      GROUP BY u.id
      ORDER BY u.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const countQuery = `SELECT COUNT(*) as total FROM auth_users u WHERE ${whereClause}`;

    const [users, countResult] = await Promise.all([
      sql(query, params),
      sql(countQuery, params),
    ]);

    return Response.json({
      users,
      total: parseInt(countResult[0]?.total || 0),
      page,
      limit,
    });
  } catch (err) {
    console.error("GET /api/admin/users error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await auth();
    const denied = await requireAdmin(session);
    if (denied === "unauthorized")
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (denied === "forbidden")
      return Response.json({ error: "Forbidden" }, { status: 403 });

    const { id, action, role } = await request.json();
    if (!id || !action)
      return Response.json({ error: "Missing fields" }, { status: 400 });

    if (action === "verify") {
      await sql`UPDATE auth_users SET is_verified = true WHERE id = ${id}`;
    } else if (action === "unverify") {
      await sql`UPDATE auth_users SET is_verified = false WHERE id = ${id}`;
    } else if (action === "set_role") {
      if (!role)
        return Response.json(
          { error: "role is required for set_role" },
          { status: 400 },
        );
      await sql`UPDATE auth_users SET role = ${role} WHERE id = ${id}`;
    } else if (action === "delete") {
      // Delete in safe order to respect FK constraints
      await sql`DELETE FROM auth_sessions WHERE "userId" = ${id}`;
      await sql`DELETE FROM auth_accounts WHERE "userId" = ${id}`;
      await sql`DELETE FROM auth_users WHERE id = ${id}`;
    } else {
      return Response.json({ error: "Unknown action" }, { status: 400 });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("PUT /api/admin/users error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
