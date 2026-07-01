import { auth } from "@/auth";
import sql from "@/app/api/utils/sql";
import * as argon2 from "argon2";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    // Enforce admin-only access
    const roleCheck =
      await sql`SELECT role FROM auth_users WHERE id = ${session.user.id}`;
    if (roleCheck[0]?.role !== "admin")
      return Response.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const {
      name,
      email,
      phone,
      role,
      location,
      password = "AgriConnect@2026!",
    } = body;

    if (!name || !email || !role)
      return Response.json(
        { error: "Name, email and role are required" },
        { status: 400 },
      );

    const existing =
      await sql`SELECT id FROM auth_users WHERE email = ${email} LIMIT 1`;
    if (existing.length > 0)
      return Response.json(
        { error: "Email already registered" },
        { status: 409 },
      );

    const userRow = await sql`
      INSERT INTO auth_users (name, email, role, phone, location, is_verified)
      VALUES (${name}, ${email}, ${role}, ${phone || ""}, ${location || ""}, false)
      RETURNING id, name, email, role
    `;
    const userId = userRow[0].id;

    const hashed = await argon2.hash(password);
    await sql`
      INSERT INTO auth_accounts ("userId", type, provider, "providerAccountId", password)
      VALUES (${userId}, 'credentials', 'credentials', ${email}, ${hashed})
    `;

    // Welcome notification — no plaintext password stored
    await sql`
      INSERT INTO notifications (user_id, type, title, message)
      VALUES (${userId}, 'info', 'Welcome to AgriConnection!',
        'Your account has been set up by an administrator. Please sign in and update your password and profile.')
    `.catch(() => {});

    return Response.json({
      user: userRow[0],
      message: "User created successfully",
    });
  } catch (err) {
    console.error("POST /api/admin/users/add error", err);
    return Response.json({ error: "Failed to create user" }, { status: 500 });
  }
}
