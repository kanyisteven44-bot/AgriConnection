import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// GET — list posts
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("search") || "";
    const limit = 20;
    const offset = (page - 1) * limit;

    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id) : null;

    let whereClause = "";
    const params = [];

    if (category !== "all") {
      params.push(category);
      whereClause += ` WHERE (p.category = $${params.length} OR p.post_type = $${params.length})`;
    }

    if (search) {
      params.push(`%${search}%`);
      const cond = `p.content ILIKE $${params.length}`;
      whereClause += whereClause ? ` AND (${cond})` : ` WHERE (${cond})`;
    }

    const isLikedExpr = userId
      ? `EXISTS(SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = ${userId}) as is_liked,
         EXISTS(SELECT 1 FROM post_saves ps WHERE ps.post_id = p.id AND ps.user_id = ${userId}) as is_saved`
      : `false as is_liked, false as is_saved`;

    const query = `
      SELECT
        p.id, p.content, p.image_url, p.media_url, p.category, p.post_type,
        p.likes_count, p.comments_count, p.shares_count, p.is_ad, p.created_at,
        u.id as author_id, u.name as author_name, u.image as author_image,
        u.profile_photo as author_photo, u.role as author_role,
        u.is_verified as author_verified,
        ${isLikedExpr}
      FROM community_posts p
      JOIN auth_users u ON p.user_id = u.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const posts = await sql(query, params);
    return Response.json({ posts, page, hasMore: posts.length === limit });
  } catch (err) {
    console.error("GET /api/community error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST — create post
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { content, image_url, media_url, category, post_type, is_ad } =
      await request.json();
    if (!content?.trim())
      return Response.json({ error: "Content required" }, { status: 400 });

    const [post] = await sql`
      INSERT INTO community_posts (user_id, content, image_url, media_url, category, post_type, is_ad)
      VALUES (
        ${session.user.id},
        ${content.trim()},
        ${image_url || null},
        ${media_url || null},
        ${category || "general"},
        ${post_type || "general"},
        ${is_ad === true}
      )
      RETURNING *
    `;

    return Response.json({ post });
  } catch (err) {
    console.error("POST /api/community error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH — edit post (own posts only)
export async function PATCH(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id, content, image_url, category, post_type } =
      await request.json();
    if (!id)
      return Response.json({ error: "Post id required" }, { status: 400 });

    // Only allow editing own post
    const existing =
      await sql`SELECT user_id FROM community_posts WHERE id = ${id} LIMIT 1`;
    if (
      !existing.length ||
      String(existing[0].user_id) !== String(session.user.id)
    ) {
      return Response.json({ error: "Not allowed" }, { status: 403 });
    }

    // Build update dynamically
    const fields = [];
    const values = [];
    if (content !== undefined) {
      fields.push(`content = $${values.length + 1}`);
      values.push(content.trim());
    }
    if (image_url !== undefined) {
      fields.push(`image_url = $${values.length + 1}`);
      values.push(image_url);
    }
    if (category !== undefined) {
      fields.push(`category = $${values.length + 1}`);
      values.push(category);
    }
    if (post_type !== undefined) {
      fields.push(`post_type = $${values.length + 1}`);
      values.push(post_type);
    }

    if (fields.length === 0)
      return Response.json({ error: "Nothing to update" }, { status: 400 });

    values.push(id);
    const [updated] = await sql(
      `UPDATE community_posts SET ${fields.join(", ")} WHERE id = $${values.length} RETURNING *`,
      values,
    );

    return Response.json({ post: updated });
  } catch (err) {
    console.error("PATCH /api/community error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE — delete post (own posts or admin)
export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id)
      return Response.json({ error: "Post id required" }, { status: 400 });

    // Check ownership or admin
    const [post] =
      await sql`SELECT user_id FROM community_posts WHERE id = ${id} LIMIT 1`;
    if (!post)
      return Response.json({ error: "Post not found" }, { status: 404 });

    const [userRole] =
      await sql`SELECT role FROM auth_users WHERE id = ${session.user.id}`;
    const isAdmin = userRole?.role === "admin";
    const isOwner = String(post.user_id) === String(session.user.id);

    if (!isAdmin && !isOwner)
      return Response.json({ error: "Not allowed" }, { status: 403 });

    await sql`DELETE FROM community_posts WHERE id = ${id}`;
    return Response.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/community error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
