import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// M-Pesa Daraja API integration
async function getMpesaToken() {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  if (!consumerKey || !consumerSecret) {
    throw new Error("M-Pesa credentials not configured");
  }
  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
    "base64",
  );
  const res = await fetch(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      headers: { Authorization: `Basic ${credentials}` },
    },
  );
  if (!res.ok) throw new Error("Failed to get M-Pesa token");
  const data = await res.json();
  return data.access_token;
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { phone, amount, order_id, account_ref } = await request.json();
    if (!phone || !amount)
      return Response.json(
        { error: "Phone and amount required" },
        { status: 400 },
      );

    // Format phone: strip leading 0, add 254
    const formattedPhone = phone.replace(/^0/, "254").replace(/^\+/, "");

    const shortcode = process.env.MPESA_SHORTCODE || "174379";
    const passkey = process.env.MPESA_PASSKEY;
    const callbackUrl =
      process.env.MPESA_CALLBACK_URL ||
      `${process.env.NEXT_PUBLIC_CREATE_APP_URL}/api/mpesa/callback`;

    if (!passkey) {
      // Demo mode: simulate successful initiation
      return Response.json({
        success: true,
        demo: true,
        message: `M-Pesa STK Push simulated. In production, KSh ${amount} request would be sent to ${formattedPhone}.`,
        CheckoutRequestID: `demo_${Date.now()}`,
        MerchantRequestID: `merchant_${Date.now()}`,
      });
    }

    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, 14);
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString(
      "base64",
    );

    const token = await getMpesaToken();

    const stkRes = await fetch(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          BusinessShortCode: shortcode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: Math.ceil(amount),
          PartyA: formattedPhone,
          PartyB: shortcode,
          PhoneNumber: formattedPhone,
          CallBackURL: callbackUrl,
          AccountReference: account_ref || "AgriConnection",
          TransactionDesc: `Payment for order #${order_id || "N/A"}`,
        }),
      },
    );

    const stkData = await stkRes.json();

    if (stkData.ResponseCode === "0") {
      // Log payment attempt
      if (order_id) {
        await sql`UPDATE orders SET status = 'paid' WHERE id = ${order_id}`;
      }
      return Response.json({ success: true, ...stkData });
    } else {
      return Response.json(
        {
          success: false,
          error: stkData.errorMessage || "STK push failed",
          details: stkData,
        },
        { status: 400 },
      );
    }
  } catch (err) {
    console.error("POST /api/mpesa error", err);
    // Return demo response if credentials missing
    if (err.message?.includes("not configured")) {
      return Response.json({
        success: true,
        demo: true,
        message:
          "M-Pesa credentials not yet configured. Add MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_SHORTCODE, MPESA_PASSKEY to enable real payments.",
        CheckoutRequestID: `demo_${Date.now()}`,
      });
    }
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
