import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const notifications = await sql`
      SELECT * FROM notifications 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 50
    `;
    const unreadCount = notifications.filter((n) => !n.is_read).length;
    return Response.json({ notifications, unreadCount });
  } catch (err) {
    console.error("GET /api/notifications error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const body = await request.json();
    const { id } = body;

    if (id) {
      await sql`UPDATE notifications SET is_read = true WHERE id = ${id} AND user_id = ${userId}`;
    } else {
      await sql`UPDATE notifications SET is_read = true WHERE user_id = ${userId}`;
    }
    return Response.json({ success: true });
  } catch (err) {
    console.error("PUT /api/notifications error", err);
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
    const { user_id, type, title, message, broadcast } = body;

    if (!title || !message) {
      return Response.json(
        { error: "title and message are required" },
        { status: 400 },
      );
    }

    // Only admins can send to other users or broadcast
    const sessionUserId = parseInt(session.user.id);
    const roleRows =
      await sql`SELECT role FROM auth_users WHERE id = ${sessionUserId}`;
    const isAdmin = roleRows[0]?.role === "admin";

    if (broadcast && isAdmin) {
      // Broadcast to all users
      const allUsers = await sql`SELECT id FROM auth_users`;
      await Promise.all(
        allUsers.map(
          (u) =>
            sql`INSERT INTO notifications (user_id, type, title, message) VALUES (${u.id}, ${type || "info"}, ${title}, ${message})`,
        ),
      );
      return Response.json({ success: true, sent: allUsers.length });
    }

    // Target: admin can specify any user_id, others can only send to themselves
    const targetUser = isAdmin && user_id ? parseInt(user_id) : sessionUserId;

    const result = await sql`
      INSERT INTO notifications (user_id, type, title, message)
      VALUES (${targetUser}, ${type || "info"}, ${title}, ${message})
      RETURNING *
    `;
    return Response.json({ notification: result[0] });
  } catch (err) {
    console.error("POST /api/notifications error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
