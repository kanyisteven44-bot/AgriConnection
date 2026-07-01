import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    const { post_id } = await request.json();
    if (!post_id)
      return Response.json({ error: "post_id required" }, { status: 400 });

    const userId = session.user.id;
    const existing =
      await sql`SELECT id FROM post_likes WHERE post_id = ${post_id} AND user_id = ${userId}`;

    if (existing.length > 0) {
      // Unlike: delete like, then recount from source of truth
      await sql`DELETE FROM post_likes WHERE post_id = ${post_id} AND user_id = ${userId}`;
      await sql`
        UPDATE community_posts
        SET likes_count = (SELECT COUNT(*) FROM post_likes WHERE post_id = ${post_id})
        WHERE id = ${post_id}
      `;
      return Response.json({ liked: false });
    } else {
      // Like: insert (idempotent), then recount from source of truth
      await sql`INSERT INTO post_likes (post_id, user_id) VALUES (${post_id}, ${userId}) ON CONFLICT DO NOTHING`;
      await sql`
        UPDATE community_posts
        SET likes_count = (SELECT COUNT(*) FROM post_likes WHERE post_id = ${post_id})
        WHERE id = ${post_id}
      `;
      return Response.json({ liked: true });
    }
  } catch (err) {
    console.error("POST /api/community/like error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
