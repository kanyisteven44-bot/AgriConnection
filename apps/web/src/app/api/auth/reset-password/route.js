import sql from "@/app/api/utils/sql";
import argon2 from "argon2";

export async function POST(request) {
  try {
    const { email, otp, newPassword } = await request.json();
    if (!email || !otp || !newPassword) {
      return Response.json({ error: "All fields required" }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return Response.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    // Verify OTP
    const rows = await sql`
      SELECT * FROM auth_verification_token
      WHERE identifier = ${email} AND token = ${otp} AND expires > NOW()
      LIMIT 1
    `;
    if (rows.length === 0) {
      return Response.json(
        { error: "Invalid or expired code. Request a new one." },
        { status: 400 },
      );
    }

    // Hash new password
    const hashed = await argon2.hash(newPassword);

    // Update password in auth_accounts
    const users =
      await sql`SELECT id FROM auth_users WHERE email = ${email} LIMIT 1`;
    if (users.length === 0) {
      return Response.json({ error: "Account not found" }, { status: 404 });
    }
    const userId = users[0].id;
    await sql`
      UPDATE auth_accounts
      SET password = ${hashed}
      WHERE "userId" = ${userId} AND provider = 'credentials'
    `;

    // Delete used OTP
    await sql`DELETE FROM auth_verification_token WHERE identifier = ${email}`;

    return Response.json({ success: true });
  } catch (err) {
    console.error("POST /api/auth/reset-password error", err);
    return Response.json(
      { error: "Failed to reset password. Please try again." },
      { status: 500 },
    );
  }
}
