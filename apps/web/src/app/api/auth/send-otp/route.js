import sql from "@/app/api/utils/sql";
import { sendEmail } from "@/app/api/utils/send-email";

const MAX_RESENDS = 5;
const MAX_VERIFY_ATTEMPTS = 5;
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const RESEND_COOLDOWN_SECS = 30;

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function buildEmailTemplate(otp, isSignup) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#f4f7f2;padding:32px;border-radius:16px;">
      <div style="text-align:center;margin-bottom:28px;">
        <div style="background:#2E7D32;width:64px;height:64px;border-radius:18px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
          <span style="font-size:30px;">🌾</span>
        </div>
        <h1 style="color:#1B5E20;font-size:22px;margin:0;font-weight:900;">AgriConnection</h1>
        <p style="color:#9BA8A0;font-size:13px;margin:4px 0 0;">Kenya's Smart Agriculture Platform</p>
      </div>
      <div style="background:white;border-radius:16px;padding:36px;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
        <h2 style="color:#1A1A1A;margin-top:0;font-size:20px;">
          ${isSignup ? "Verify Your Email Address" : "Password Reset Code"}
        </h2>
        <p style="color:#6B6B6B;line-height:1.7;font-size:15px;">
          ${
            isSignup
              ? "Welcome to AgriConnection! Enter this 6-digit code to verify your email and activate your account:"
              : "Enter this 6-digit code to reset your AgriConnection password:"
          }
        </p>
        <div style="background:linear-gradient(135deg,#E8F5E9,#C8E6C9);border:2.5px solid #2E7D32;border-radius:16px;padding:24px;margin:28px 0;">
          <p style="font-size:48px;font-weight:900;letter-spacing:16px;color:#1B5E20;margin:0;font-family:'Courier New',monospace;">${otp}</p>
        </div>
        <p style="color:#9BA8A0;font-size:13px;line-height:1.6;">
          ⏱️ This code expires in <strong>5 minutes</strong>.<br/>
          If you didn't request this, please ignore this email.
        </p>
        <div style="margin-top:24px;padding-top:24px;border-top:1px solid #F0F0F0;">
          <p style="color:#AAAA;font-size:12px;margin:0;">For security, never share this code with anyone.</p>
        </div>
      </div>
      <p style="text-align:center;color:#9BA8A0;font-size:12px;margin-top:24px;">
        © 2026 AgriConnection — Connecting Farmers to Opportunities 🌱
      </p>
    </div>
  `;
}

// POST — generate & send OTP
export async function POST(request) {
  try {
    const { email, type = "signup" } = await request.json();

    if (!email || !email.includes("@")) {
      return Response.json(
        { error: "Valid email address required" },
        { status: 400 },
      );
    }

    const emailLower = email.toLowerCase().trim();

    // For reset: only send if account exists
    if (type === "reset") {
      const users =
        await sql`SELECT id FROM auth_users WHERE email = ${emailLower} LIMIT 1`;
      if (users.length === 0) {
        // Don't reveal whether account exists — still return success
        return Response.json({
          success: true,
          message: "If this email exists, a code has been sent.",
        });
      }
    }

    // Check cooldown & resend limit
    const existing = await sql`
      SELECT id, resend_count, created_at FROM otp_verifications
      WHERE email = ${emailLower} AND otp_type = ${type} AND verified = false
      ORDER BY created_at DESC LIMIT 1
    `;

    if (existing.length > 0) {
      const rec = existing[0];
      const secondsSinceLast =
        (Date.now() - new Date(rec.created_at).getTime()) / 1000;

      if (secondsSinceLast < RESEND_COOLDOWN_SECS) {
        const waitSecs = Math.ceil(RESEND_COOLDOWN_SECS - secondsSinceLast);
        return Response.json(
          {
            error: `Please wait ${waitSecs} seconds before requesting a new code.`,
            wait_seconds: waitSecs,
          },
          { status: 429 },
        );
      }

      if (rec.resend_count >= MAX_RESENDS) {
        return Response.json(
          {
            error:
              "Maximum resend attempts reached. Please try again in 30 minutes.",
          },
          { status: 429 },
        );
      }
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);
    const isSignup = type === "signup";
    const subject = isSignup
      ? "Your AgriConnection Verification Code"
      : "Reset Your AgriConnection Password";

    // Clean old OTPs for this email+type and insert new one (parallel with email send)
    await Promise.all([
      sql`
        DELETE FROM otp_verifications
        WHERE email = ${emailLower} AND otp_type = ${type} AND verified = false
      `.then(
        () =>
          sql`
          INSERT INTO otp_verifications (email, otp_code, otp_type, expires_at, resend_count)
          VALUES (${emailLower}, ${otp}, ${type}, ${expiresAt},
            ${existing.length > 0 ? existing[0].resend_count + 1 : 0})
        `,
      ),
      sendEmail({
        to: emailLower,
        subject,
        html: buildEmailTemplate(otp, isSignup),
        text: `Your AgriConnection ${isSignup ? "verification" : "password reset"} code is: ${otp}\n\nThis code expires in 5 minutes.\n\nIf you didn't request this, please ignore this email.`,
      }).catch((err) => {
        console.error("Email send failed:", err.message);
        // Don't throw — we already saved OTP, can retry via resend
      }),
    ]);

    // Also keep legacy auth_verification_token for backward compat
    await sql`DELETE FROM auth_verification_token WHERE identifier = ${emailLower}`.catch(
      () => {},
    );
    await sql`INSERT INTO auth_verification_token (identifier, token, expires) VALUES (${emailLower}, ${otp}, ${expiresAt})`.catch(
      () => {},
    );

    return Response.json({
      success: true,
      message: "Verification code sent to your email.",
      // Only expose expiry in dev for testing
      ...(process.env.NODE_ENV === "development" ? { otp_dev_only: otp } : {}),
    });
  } catch (err) {
    console.error("POST /api/auth/send-otp error:", err);
    return Response.json(
      { error: "Failed to send verification code. Please try again." },
      { status: 500 },
    );
  }
}

// PUT — verify OTP
export async function PUT(request) {
  try {
    const { email, otp, type = "signup" } = await request.json();

    if (!email || !otp) {
      return Response.json(
        { error: "Email and code are required" },
        { status: 400 },
      );
    }

    const emailLower = email.toLowerCase().trim();
    const otpClean = String(otp).trim();

    // Get current OTP record
    const rows = await sql`
      SELECT id, otp_code, expires_at, verified, verify_attempts
      FROM otp_verifications
      WHERE email = ${emailLower} AND otp_type = ${type} AND verified = false
      ORDER BY created_at DESC LIMIT 1
    `;

    if (rows.length === 0) {
      return Response.json(
        {
          error: "No active verification code found. Please request a new one.",
        },
        { status: 400 },
      );
    }

    const record = rows[0];

    // Check max attempts
    if (record.verify_attempts >= MAX_VERIFY_ATTEMPTS) {
      await sql`DELETE FROM otp_verifications WHERE id = ${record.id}`;
      return Response.json(
        {
          error: "Too many incorrect attempts. Please request a new code.",
          max_attempts: true,
        },
        { status: 429 },
      );
    }

    // Check expiry
    if (new Date() > new Date(record.expires_at)) {
      return Response.json(
        {
          error: "This code has expired. Please request a new one.",
          expired: true,
        },
        { status: 400 },
      );
    }

    // Wrong code — increment attempts
    if (record.otp_code !== otpClean) {
      await sql`
        UPDATE otp_verifications SET verify_attempts = verify_attempts + 1 WHERE id = ${record.id}
      `;
      const remaining = MAX_VERIFY_ATTEMPTS - (record.verify_attempts + 1);
      return Response.json(
        {
          error: `Invalid code. ${remaining > 0 ? `${remaining} attempt${remaining === 1 ? "" : "s"} remaining.` : "No attempts remaining."}`,
          remaining_attempts: remaining,
        },
        { status: 400 },
      );
    }

    // ✅ Correct — mark verified
    await sql`UPDATE otp_verifications SET verified = true WHERE id = ${record.id}`;
    // Clean up legacy token
    await sql`DELETE FROM auth_verification_token WHERE identifier = ${emailLower}`.catch(
      () => {},
    );

    return Response.json({ valid: true, verified: true });
  } catch (err) {
    console.error("PUT /api/auth/send-otp error:", err);
    return Response.json(
      { error: "Verification failed. Please try again." },
      { status: 500 },
    );
  }
}

// GET — check OTP status (for polling)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const type = searchParams.get("type") || "signup";

    if (!email)
      return Response.json({ error: "email required" }, { status: 400 });

    const rows = await sql`
      SELECT id, expires_at, resend_count, verify_attempts, verified
      FROM otp_verifications
      WHERE email = ${email.toLowerCase()} AND otp_type = ${type}
      ORDER BY created_at DESC LIMIT 1
    `;

    if (rows.length === 0) return Response.json({ exists: false });

    const rec = rows[0];
    const now = new Date();
    const expired = now > new Date(rec.expires_at);
    const secondsLeft = Math.max(
      0,
      Math.floor((new Date(rec.expires_at) - now) / 1000),
    );

    return Response.json({
      exists: true,
      verified: rec.verified,
      expired,
      seconds_left: secondsLeft,
      resend_count: rec.resend_count,
      verify_attempts: rec.verify_attempts,
    });
  } catch (err) {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
