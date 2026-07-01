import sql from "@/app/api/utils/sql";
import crypto from "node:crypto";
import { hash } from "argon2";

function hashOtp(otp) {
  return crypto.createHash("sha256").update(String(otp).trim()).digest("hex");
}

export async function POST(request) {
  try {
    const { email, otp, newPassword } = await request.json();

    if (!email || !otp || !newPassword) {
      return Response.json({ error: "All fields are required" }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return Response.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();
    const otpClean   = String(otp).trim();

    // Verify OTP using the new otp_verifications table (hashed)
    const otpRows = await sql`
      SELECT id, otp_hash, expires_at, verified, verify_attempts
      FROM otp_verifications
      WHERE email = ${emailLower} AND otp_type = 'reset' AND verified = true
      ORDER BY created_at DESC LIMIT 1
    `;

    // Also check unverified (in case verify step wasn't called separately)
    const unverifiedRows = await sql`
      SELECT id, otp_hash, expires_at, verified, verify_attempts
      FROM otp_verifications
      WHERE email = ${emailLower} AND otp_type = 'reset' AND verified = false
      ORDER BY created_at DESC LIMIT 1
    `;

    let otpRecord = otpRows[0] || unverifiedRows[0];

    if (!otpRecord) {
      // Fallback: check legacy auth_verification_token
      const legacy = await sql`
        SELECT token, expires FROM auth_verification_token
        WHERE identifier = ${emailLower} LIMIT 1
      `;
      if (legacy.length === 0 || new Date() > new Date(legacy[0].expires)) {
        return Response.json(
          { error: "Invalid or expired reset code. Please request a new one." },
          { status: 400 }
        );
      }
      if (legacy[0].token !== otpClean) {
        return Response.json(
          { error: "Incorrect reset code. Please check and try again." },
          { status: 400 }
        );
      }
      // Legacy token valid — proceed
      await sql`DELETE FROM auth_verification_token WHERE identifier = ${emailLower}`.catch(() => {});
    } else {
      // Verify hash
      const inputHash = hashOtp(otpClean);
      if (!otpRecord.verified && otpRecord.otp_hash !== inputHash) {
        return Response.json(
          { error: "Incorrect reset code. Please check and try again." },
          { status: 400 }
        );
      }
      if (new Date() > new Date(otpRecord.expires_at)) {
        return Response.json(
          { error: "This code has expired. Please request a new reset code." },
          { status: 400 }
        );
      }
    }

    // Find user account
    const users = await sql`SELECT id FROM auth_users WHERE email = ${emailLower} LIMIT 1`;
    if (users.length === 0) {
      return Response.json({ error: "Account not found." }, { status: 404 });
    }
    const userId = users[0].id;

    // Hash the new password with argon2
    const hashed = await hash(newPassword);

    // Update password — handle both existing and new accounts
    const existing = await sql`
      SELECT id FROM auth_accounts
      WHERE "userId" = ${userId} AND provider = 'credentials' LIMIT 1
    `;

    if (existing.length > 0) {
      await sql`
        UPDATE auth_accounts
        SET password = ${hashed}
        WHERE "userId" = ${userId} AND provider = 'credentials'
      `;
    } else {
      await sql`
        INSERT INTO auth_accounts ("userId", type, provider, "providerAccountId", password)
        VALUES (${userId}, 'credentials', 'credentials', ${emailLower}, ${hashed})
      `;
    }

    // Clean up OTP records
    await sql`DELETE FROM otp_verifications WHERE email = ${emailLower} AND otp_type = 'reset'`.catch(() => {});
    await sql`DELETE FROM auth_verification_token WHERE identifier = ${emailLower}`.catch(() => {});

    return Response.json({ success: true, message: "Password reset successfully. You can now sign in." });
  } catch (err) {
    console.error("[reset-password] Error:", err);
    return Response.json(
      { error: "Failed to reset password. Please try again." },
      { status: 500 }
    );
  }
}
