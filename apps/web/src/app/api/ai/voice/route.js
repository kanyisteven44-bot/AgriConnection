import { auth } from "@/auth";
import sql from "@/app/api/utils/sql";

function getBaseUrl(request) {
  if (process.env.AUTH_URL) return process.env.AUTH_URL;
  if (process.env.NEXT_PUBLIC_CREATE_APP_URL) return process.env.NEXT_PUBLIC_CREATE_APP_URL;
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

const VOICE_SYSTEM_PROMPT = `You are AgriConnection Voice AI — Kenya's most advanced agricultural voice assistant.
You understand both English and Kiswahili naturally.

CRITICAL RULES:
- Detect the language of the user's message automatically
- If the message is in Kiswahili, respond ENTIRELY in Kiswahili
- If the message is in English, respond ENTIRELY in English
- Keep responses concise and conversational (2-4 sentences max for voice)
- Avoid markdown formatting — this is a spoken response
- Be warm, practical, and direct
- Always tailor advice to Kenyan farming conditions

KISWAHILI DETECTION KEYWORDS: nataka, kujua, mbinu, kufuga, kilimo, mazao, mifugo, bei, soko, magonjwa, dawa, mimea, mbolea, mvua, hali, nchi, Kenya`;

export async function POST(request) {
  try {
    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id) : null;

    const body = await request.json();
    const { text, language = "auto", sessionId, voiceGender = "female" } = body;

    if (!text?.trim()) {
      return Response.json({ error: "Text is required" }, { status: 400 });
    }

    // Auto-detect language
    const swahiliKeywords = [
      "nataka", "kujua", "mbinu", "kufuga", "kilimo", "mazao", "mifugo",
      "bei", "soko", "magonjwa", "dawa", "mimea", "mbolea", "mvua", "hali",
      "nchi", "sijui", "niambie", "sema", "kutoka", "kwenye", "bora", "nzuri",
    ];
    const lowerText = text.toLowerCase();
    const isSwahili =
      language === "sw" ||
      (language === "auto" && swahiliKeywords.some((k) => lowerText.includes(k)));
    const detectedLang = isSwahili ? "sw" : "en";

    const systemPrompt =
      VOICE_SYSTEM_PROMPT +
      (isSwahili
        ? "\n\nIMPORTANT: The user is speaking Kiswahili. Respond entirely in Kiswahili."
        : "\n\nIMPORTANT: The user is speaking English. Respond entirely in English.");

    const baseUrl = getBaseUrl(request);
    const aiRes = await fetch(`${baseUrl}/integrations/google-gemini-2-5-flash/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text },
        ],
      }),
    });

    if (!aiRes.ok) throw new Error(`AI error: ${aiRes.status}`);
    const aiData = await aiRes.json();
    const aiResponse =
      aiData.choices?.[0]?.message?.content ||
      (isSwahili
        ? "Samahani, sikuweza kukusaidia. Tafadhali jaribu tena."
        : "Sorry, I could not process that. Please try again.");

    if (userId) {
      try {
        await sql`
          INSERT INTO voice_chat_history (user_id, session_id, transcribed_text, ai_response, language, voice_gender)
          VALUES (${userId}, ${sessionId || null}, ${text}, ${aiResponse}, ${detectedLang}, ${voiceGender})
        `;
      } catch {}
    }

    return Response.json({
      response: aiResponse,
      language: detectedLang,
      isSwahili,
    });
  } catch (err) {
    console.error("POST /api/ai/voice error:", err);
    return Response.json(
      { error: "Voice AI failed. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const history = await sql`
      SELECT id, transcribed_text, ai_response, language, voice_gender, created_at
      FROM voice_chat_history
      WHERE user_id = ${session.user.id}
      ORDER BY created_at DESC LIMIT 30
    `;

    return Response.json({ history });
  } catch (err) {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
