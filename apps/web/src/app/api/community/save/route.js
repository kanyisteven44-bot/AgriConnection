import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// POST — toggle save/unsave a post
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    const { post_id } = await request.json();
    if (!post_id)
      return Response.json({ error: "post_id required" }, { status: 400 });

    const existing =
      await sql`SELECT id FROM post_saves WHERE post_id = ${post_id} AND user_id = ${session.user.id}`;
    if (existing.length > 0) {
      await sql`DELETE FROM post_saves WHERE post_id = ${post_id} AND user_id = ${session.user.id}`;
      return Response.json({ saved: false });
    } else {
      await sql`INSERT INTO post_saves (post_id, user_id) VALUES (${post_id}, ${session.user.id}) ON CONFLICT DO NOTHING`;
      return Response.json({ saved: true });
    }
  } catch (err) {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

// GET — get saved posts
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const posts = await sql`
      SELECT p.*, u.name as author_name, u.profile_photo as author_photo, u.image as author_image,
             u.role as author_role, u.is_verified as author_verified, true as is_saved
      FROM post_saves ps
      JOIN community_posts p ON ps.post_id = p.id
      JOIN auth_users u ON p.user_id = u.id
      WHERE ps.user_id = ${session.user.id}
      ORDER BY ps.created_at DESC LIMIT 30
    `;
    return Response.json({ posts });
  } catch (err) {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
