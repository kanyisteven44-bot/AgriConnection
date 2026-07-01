import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// GET — fetch comments for a post
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("post_id");
    if (!postId)
      return Response.json({ error: "post_id required" }, { status: 400 });

    const comments = await sql`
      SELECT 
        pc.id, pc.content, pc.created_at,
        u.id as author_id, u.name as author_name, u.profile_photo as author_photo, 
        u.image as author_image, u.role as author_role, u.is_verified as author_verified
      FROM post_comments pc
      JOIN auth_users u ON pc.user_id = u.id
      WHERE pc.post_id = ${postId}
      ORDER BY pc.created_at ASC
      LIMIT 50
    `;

    return Response.json({ comments });
  } catch (err) {
    console.error("GET /api/community/comments error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

// POST — add a comment
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { post_id, content } = await request.json();
    if (!post_id || !content?.trim()) {
      return Response.json(
        { error: "post_id and content required" },
        { status: 400 },
      );
    }

    const [comment] = await sql`
      INSERT INTO post_comments (post_id, user_id, content)
      VALUES (${post_id}, ${session.user.id}, ${content.trim()})
      RETURNING *
    `;

    // Recount comments
    await sql`
      UPDATE community_posts
      SET comments_count = (SELECT COUNT(*) FROM post_comments WHERE post_id = ${post_id})
      WHERE id = ${post_id}
    `;

    // Enrich with author info
    const [user] = await sql`
      SELECT name, profile_photo, image, role, is_verified
      FROM auth_users WHERE id = ${session.user.id}
    `;

    return Response.json({
      comment: {
        ...comment,
        author_name: user?.name,
        author_photo: user?.profile_photo || user?.image,
        author_role: user?.role,
        author_verified: user?.is_verified,
      },
    });
  } catch (err) {
    console.error("POST /api/community/comments error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE — delete a comment
export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get("id");
    if (!commentId)
      return Response.json({ error: "Comment id required" }, { status: 400 });

    const [deleted] = await sql`
      DELETE FROM post_comments WHERE id = ${commentId} AND user_id = ${session.user.id} RETURNING post_id
    `;
    if (deleted?.post_id) {
      await sql`
        UPDATE community_posts
        SET comments_count = (SELECT COUNT(*) FROM post_comments WHERE post_id = ${deleted.post_id})
        WHERE id = ${deleted.post_id}
      `;
    }
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
