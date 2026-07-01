import sql from "@/app/api/utils/sql";
import crypto from "node:crypto";

// ── Constants ──────────────────────────────────────────────
const MAX_RESENDS       = 5;
const MAX_VERIFY_ATTS   = 5;
const OTP_EXPIRY_MS     = 10 * 60 * 1000;   // 10 minutes (as required)
const RESEND_COOLDOWN_S = 30;

// ── Helpers ────────────────────────────────────────────────
function generateOtp() {
  // Cryptographically random 6-digit OTP
  const bytes = crypto.randomBytes(3);
  const num   = (bytes.readUIntBE(0, 3) % 900000) + 100000;
  return String(num);
}

function hashOtp(otp) {
  // SHA-256 hash — fast enough for OTP, no salt needed (6-digit space + expiry)
  return crypto.createHash("sha256").update(otp).digest("hex");
}

function verifyOtp(otp, hash) {
  return hashOtp(otp) === hash;
}

function buildEmailHtml(otp, userName, isSignup) {
  const greeting  = userName ? `Hello ${userName.split(" ")[0]},` : "Hello,";
  const action    = isSignup ? "verify your email address" : "reset your password";
  const footerMsg = isSignup
    ? "If you did not create an account, please ignore this email."
    : "If you did not request a password reset, please ignore this email.";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/></head>
<body style="margin:0;padding:0;background:#f0f4f0;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:#f0f4f0;padding:24px;border-radius:20px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-flex;align-items:center;justify-content:center;
                  width:72px;height:72px;background:#2E7D32;border-radius:20px;
                  font-size:36px;margin-bottom:12px;">🌾</div>
      <h1 style="color:#1B5E20;font-size:24px;margin:0;font-weight:900;letter-spacing:-0.5px;">
        AgriConnection
      </h1>
      <p style="color:#9BA8A0;font-size:13px;margin:4px 0 0;">
        Kenya's Smart Agriculture Platform
      </p>
    </div>

    <!-- Card -->
    <div style="background:white;border-radius:20px;padding:40px 36px;text-align:center;
                box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <h2 style="color:#1A1A1A;margin:0 0 8px;font-size:22px;font-weight:900;">
        ${isSignup ? "Verify Your Email" : "Password Reset Code"}
      </h2>
      <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 28px;">
        ${greeting}<br/>
        Use the code below to ${action}:
      </p>

      <!-- OTP Box -->
      <div style="background:linear-gradient(135deg,#E8F5E9 0%,#C8E6C9 100%);
                  border:2.5px solid #2E7D32;border-radius:16px;
                  padding:28px 20px;margin-bottom:28px;">
        <p style="font-size:52px;font-weight:900;letter-spacing:16px;
                  color:#1B5E20;margin:0;font-family:'Courier New',Courier,monospace;
                  line-height:1;">
          ${otp}
        </p>
      </div>

      <!-- Expiry -->
      <div style="background:#FFF8E1;border:1.5px solid #FFE082;border-radius:12px;
                  padding:12px 16px;margin-bottom:20px;">
        <p style="color:#F57F17;font-size:14px;font-weight:700;margin:0;">
          ⏱️ This code expires in <strong>10 minutes</strong>
        </p>
      </div>

      <!-- Warning -->
      <p style="color:#9BA8A0;font-size:13px;line-height:1.7;margin:0;">
        ${footerMsg}<br/>
        Never share this code with anyone.
      </p>
    </div>

    <!-- Footer -->
    <p style="text-align:center;color:#9BA8A0;font-size:12px;margin-top:20px;line-height:1.6;">
      © ${new Date().getFullYear()} AgriConnection · Connecting Farmers to Opportunities 🌱<br/>
      <a href="#" style="color:#9BA8A0;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`;
}

function buildEmailText(otp, userName, isSignup) {
  const firstName = userName ? userName.split(" ")[0] : "there";
  return isSignup
    ? `Hello ${firstName},\n\nWelcome to AgriConnection.\n\nYour verification code is:\n\n${otp}\n\nThis code expires in 10 minutes.\n\nIf you did not create an account, ignore this email.\n\nAgriConnection Team`
    : `Hello ${firstName},\n\nYour AgriConnection password reset code is:\n\n${otp}\n\nThis code expires in 10 minutes.\n\nIf you did not request this, ignore this email.\n\nAgriConnection Team`;
}

async function sendEmailWithResend(to, subject, html, text) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[OTP] RESEND_API_KEY not set — email not sent");
    return { success: false, reason: "no_api_key" };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "AgriConnection <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
        text,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("[OTP] Resend error:", data);
      return { success: false, reason: data.message || "send_failed" };
    }
    return { success: true, id: data.id };
  } catch (err) {
    console.error("[OTP] Email send exception:", err.message);
    return { success: false, reason: err.message };
  }
}

// ═══════════════════════════════════════════════════════════
// POST — Generate & send OTP
// ═══════════════════════════════════════════════════════════
export async function POST(request) {
  try {
    const body = await request.json();
    const { email, type = "signup", name: userName } = body;

    if (!email || !email.includes("@")) {
      return Response.json(
        { error: "A valid email address is required" },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();
    const isSignup   = type === "signup";

    // For password reset: silently succeed if account doesn't exist (security)
    if (type === "reset") {
      const users = await sql`SELECT id FROM auth_users WHERE email = ${emailLower} LIMIT 1`;
      if (users.length === 0) {
        return Response.json({
          success: true,
          message: "If an account with this email exists, a reset code has been sent.",
        });
      }
    }

    // Fetch user name from DB for signup (if user passed it) or from DB for reset
    let resolvedName = userName || "";
    if (!resolvedName && type === "reset") {
      try {
        const u = await sql`SELECT name FROM auth_users WHERE email = ${emailLower} LIMIT 1`;
        resolvedName = u[0]?.name || "";
      } catch {}
    }

    // ── Rate-limit check ──────────────────────────────────
    const existing = await sql`
      SELECT id, resend_count, created_at, verify_attempts
      FROM otp_verifications
      WHERE email = ${emailLower} AND otp_type = ${type} AND verified = false
      ORDER BY created_at DESC LIMIT 1
    `;

    if (existing.length > 0) {
      const rec     = existing[0];
      const elapsed = (Date.now() - new Date(rec.created_at).getTime()) / 1000;

      if (elapsed < RESEND_COOLDOWN_S) {
        const wait = Math.ceil(RESEND_COOLDOWN_S - elapsed);
        return Response.json(
          { error: `Please wait ${wait} seconds before requesting a new code.`, wait_seconds: wait },
          { status: 429 }
        );
      }
      if (rec.resend_count >= MAX_RESENDS) {
        return Response.json(
          { error: "Too many code requests. Please wait 30 minutes and try again." },
          { status: 429 }
        );
      }
    }

    // ── Generate & hash OTP ───────────────────────────────
    const otp       = generateOtp();
    const otpHash   = hashOtp(otp);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);
    const newResendCount = existing.length > 0 ? existing[0].resend_count + 1 : 0;

    // Delete old pending OTPs for this email+type
    await sql`
      DELETE FROM otp_verifications
      WHERE email = ${emailLower} AND otp_type = ${type} AND verified = false
    `;

    // Store hashed OTP
    await sql`
      INSERT INTO otp_verifications
        (email, otp_hash, otp_type, expires_at, resend_count, user_name)
      VALUES
        (${emailLower}, ${otpHash}, ${type}, ${expiresAt}, ${newResendCount}, ${resolvedName || null})
    `;

    // ── Send email ────────────────────────────────────────
    const subject = isSignup
      ? "AgriConnection Verification Code"
      : "AgriConnection Password Reset Code";

    const emailResult = await sendEmailWithResend(
      emailLower,
      subject,
      buildEmailHtml(otp, resolvedName, isSignup),
      buildEmailText(otp, resolvedName, isSignup)
    );

    const response = {
      success: true,
      message: emailResult.success
        ? "Verification code sent to your email. Check your inbox (and spam folder)."
        : "Code generated. Email may be delayed — check spam or use the code below.",
    };

    // Always expose OTP when email fails; also in dev mode
    if (!emailResult.success || process.env.NODE_ENV !== "production") {
      response.otp_dev = otp;
      response.note = "otp_dev is shown because email sending failed or app is in dev mode";
    }

    return Response.json(response);
  } catch (err) {
    console.error("[OTP POST] Error:", err);
    return Response.json(
      { error: "Failed to send verification code. Please try again." },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════
// PUT — Verify OTP
// ═══════════════════════════════════════════════════════════
export async function PUT(request) {
  try {
    const { email, otp, type = "signup" } = await request.json();

    if (!email || !otp) {
      return Response.json(
        { error: "Email and verification code are required" },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();
    const otpClean   = String(otp).trim().replace(/\s/g, "");

    if (otpClean.length !== 6 || !/^\d{6}$/.test(otpClean)) {
      return Response.json(
        { error: "Verification code must be exactly 6 digits" },
        { status: 400 }
      );
    }

    // Get the latest unverified record
    const rows = await sql`
      SELECT id, otp_hash, expires_at, verified, verify_attempts
      FROM otp_verifications
      WHERE email = ${emailLower} AND otp_type = ${type} AND verified = false
      ORDER BY created_at DESC LIMIT 1
    `;

    if (rows.length === 0) {
      return Response.json(
        { error: "No active verification code found. Please request a new one." },
        { status: 400 }
      );
    }

    const rec = rows[0];

    // ── Too many attempts ─────────────────────────────────
    if (rec.verify_attempts >= MAX_VERIFY_ATTS) {
      await sql`DELETE FROM otp_verifications WHERE id = ${rec.id}`;
      return Response.json(
        { error: "Too many incorrect attempts. Please request a new code.", max_attempts: true },
        { status: 429 }
      );
    }

    // ── Expired ───────────────────────────────────────────
    if (new Date() > new Date(rec.expires_at)) {
      return Response.json(
        { error: "This code has expired. Please click 'Resend' to get a new one.", expired: true },
        { status: 400 }
      );
    }

    // ── Wrong code ────────────────────────────────────────
    if (!verifyOtp(otpClean, rec.otp_hash)) {
      await sql`
        UPDATE otp_verifications
        SET verify_attempts = verify_attempts + 1
        WHERE id = ${rec.id}
      `;
      const remaining = MAX_VERIFY_ATTS - (rec.verify_attempts + 1);
      return Response.json(
        {
          error: `Incorrect code. ${remaining > 0 ? `${remaining} attempt${remaining === 1 ? "" : "s"} remaining.` : "No attempts remaining — request a new code."}`,
          remaining_attempts: Math.max(0, remaining),
        },
        { status: 400 }
      );
    }

    // ── Correct ───────────────────────────────────────────
    await sql`UPDATE otp_verifications SET verified = true WHERE id = ${rec.id}`;

    return Response.json({ valid: true, verified: true });
  } catch (err) {
    console.error("[OTP PUT] Error:", err);
    return Response.json(
      { error: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════
// GET — Check OTP status (for countdown timer)
// ═══════════════════════════════════════════════════════════
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const type  = searchParams.get("type") || "signup";

    if (!email) {
      return Response.json({ error: "email parameter required" }, { status: 400 });
    }

    const rows = await sql`
      SELECT expires_at, resend_count, verify_attempts, verified
      FROM otp_verifications
      WHERE email = ${email.toLowerCase()} AND otp_type = ${type}
      ORDER BY created_at DESC LIMIT 1
    `;

    if (rows.length === 0) return Response.json({ exists: false });

    const rec       = rows[0];
    const now       = new Date();
    const expired   = now > new Date(rec.expires_at);
    const secsLeft  = Math.max(0, Math.floor((new Date(rec.expires_at) - now) / 1000));

    return Response.json({
      exists:          true,
      verified:        rec.verified,
      expired,
      seconds_left:    secsLeft,
      resend_count:    rec.resend_count,
      verify_attempts: rec.verify_attempts,
    });
  } catch (err) {
    console.error("[OTP GET] Error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
