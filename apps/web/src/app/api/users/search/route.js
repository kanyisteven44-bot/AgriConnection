import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, name, email, role, location, profile_photo, is_verified, created_at
      FROM auth_users
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (name ILIKE $${params.length} OR email ILIKE $${params.length})`;
    }
    if (role) {
      params.push(role);
      query += ` AND role = $${params.length}`;
    }

    query += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const users = await sql(query, params);
    // Don't expose email in public search
    const safeUsers = users.map(({ email: _e, ...u }) => u);

    return Response.json({ users: safeUsers });
  } catch (err) {
    console.error("GET /api/users/search error", err);
    return Response.json({ error: "Search failed" }, { status: 500 });
  }
}
