import { auth } from "@/auth";
import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Enforce admin-only access
    const roleCheck = await sql`SELECT role FROM auth_users WHERE id = ${session.user.id}`;
    if (roleCheck[0]?.role !== "admin")
      return Response.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const rawLimit = parseInt(searchParams.get("limit") || "50");
    // Clamp limit between 1 and 200
    const limit = isNaN(rawLimit) ? 50 : Math.min(Math.max(rawLimit, 1), 200);
    const type = searchParams.get("type") || "";

    let logs;
    if (type) {
      logs = await sql`
        SELECT al.*, au.name as user_name, au.email as user_email
        FROM ai_logs al
        LEFT JOIN auth_users au ON al.user_id = au.id
        WHERE al.query_type = ${type}
        ORDER BY al.created_at DESC
        LIMIT ${limit}
      `;
    } else {
      logs = await sql`
        SELECT al.*, au.name as user_name, au.email as user_email
        FROM ai_logs al
        LEFT JOIN auth_users au ON al.user_id = au.id
        ORDER BY al.created_at DESC
        LIMIT ${limit}
      `;
    }

    return Response.json({ logs: logs || [] });
  } catch (err) {
    console.error("GET /api/admin/ai-logs error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
