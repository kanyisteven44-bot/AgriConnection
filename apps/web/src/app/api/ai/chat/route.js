import { auth } from "@/auth";
import sql from "@/app/api/utils/sql";
import { v4 as uuidv4 } from "uuid";

// GET — fetch chat history (with optional category filter)
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "";
    const search = searchParams.get("search") || "";
    const sessionId = searchParams.get("session_id") || "";
    const favoritesOnly = searchParams.get("favorites") === "true";

    let history;
    if (sessionId) {
      history = await sql`
        SELECT * FROM ai_chat_history
        WHERE user_id = ${userId} AND session_id = ${sessionId}
        ORDER BY created_at ASC
      `;
    } else if (favoritesOnly) {
      history = await sql`
        SELECT * FROM ai_chat_history
        WHERE user_id = ${userId} AND is_favorite = true
        ORDER BY created_at DESC LIMIT 50
      `;
    } else if (search) {
      history = await sql(
        `SELECT * FROM ai_chat_history
         WHERE user_id = $1 AND (message ILIKE $2 OR response ILIKE $2)
         ORDER BY created_at DESC LIMIT 50`,
        [userId, `%${search}%`],
      );
    } else if (category) {
      history = await sql`
        SELECT * FROM ai_chat_history
        WHERE user_id = ${userId} AND category = ${category}
        ORDER BY created_at DESC LIMIT 50
      `;
    } else {
      history = await sql`
        SELECT * FROM ai_chat_history
        WHERE user_id = ${userId}
        ORDER BY created_at DESC LIMIT 50
      `;
    }

    // Get distinct sessions for sidebar
    const sessions = await sql`
      SELECT session_id, category, MIN(created_at) as started_at,
             COUNT(*) as message_count,
             (SELECT message FROM ai_chat_history a2 WHERE a2.session_id = ai_chat_history.session_id ORDER BY created_at ASC LIMIT 1) as first_message
      FROM ai_chat_history
      WHERE user_id = ${userId}
      GROUP BY session_id, category
      ORDER BY MIN(created_at) DESC
      LIMIT 20
    `;

    return Response.json({ history, sessions });
  } catch (err) {
    console.error("GET /api/ai/chat error", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

// POST — save a new message/response
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;
    const { message, response, category, sessionId } = await request.json();
    if (!message || !response)
      return Response.json(
        { error: "message and response required" },
        { status: 400 },
      );

    const sid = sessionId || uuidv4();
    const row = await sql`
      INSERT INTO ai_chat_history (user_id, session_id, category, message, response)
      VALUES (${userId}, ${sid}, ${category || "general"}, ${message}, ${response})
      RETURNING *
    `;
    return Response.json({ entry: row[0], sessionId: sid });
  } catch (err) {
    console.error("POST /api/ai/chat error", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH — toggle favorite
export async function PATCH(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    const { id, is_favorite } = await request.json();
    await sql`
      UPDATE ai_chat_history SET is_favorite = ${is_favorite}
      WHERE id = ${id} AND user_id = ${session.user.id}
    `;
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE — delete a session or single entry
export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");
    const id = searchParams.get("id");
    if (sessionId) {
      await sql`DELETE FROM ai_chat_history WHERE session_id = ${sessionId} AND user_id = ${session.user.id}`;
    } else if (id) {
      await sql`DELETE FROM ai_chat_history WHERE id = ${id} AND user_id = ${session.user.id}`;
    }
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
