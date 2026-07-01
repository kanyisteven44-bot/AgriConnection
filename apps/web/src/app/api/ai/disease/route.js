import { auth } from "@/auth";
import sql from "@/app/api/utils/sql";

function getBaseUrl(request) {
  if (process.env.AUTH_URL) return process.env.AUTH_URL;
  if (process.env.NEXT_PUBLIC_CREATE_APP_URL) return process.env.NEXT_PUBLIC_CREATE_APP_URL;
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export async function POST(request) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return Response.json({ error: "Image URL required" }, { status: 400 });
    }

    const session = await auth();
    const userId = session?.user?.id || null;

    const baseUrl = getBaseUrl(request);

    const response = await fetch(`${baseUrl}/integrations/gpt-vision/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content:
              "You are an expert plant pathologist and agricultural advisor specializing in East African farming. Analyze the provided plant image and give a thorough diagnosis. Structure your response clearly with: 🔍 DIAGNOSIS (what you see), 📊 SEVERITY (mild/moderate/severe), 💊 TREATMENT (specific steps), 🌱 PREVENTION (how to avoid it in future). Be practical, specific, and use simple language suitable for farmers in Kenya.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please analyze this plant image for any diseases, pests, nutritional deficiencies, or health issues:",
              },
              {
                type: "image_url",
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Vision API failed: ${response.status}`);
    }

    const data = await response.json();
    const result =
      data.choices?.[0]?.message?.content ||
      "Could not analyze the image. Please try again with a clearer photo.";

    if (userId) {
      try {
        await sql`
          INSERT INTO ai_logs (user_id, query_type, input_data, result)
          VALUES (${userId}, 'disease', ${imageUrl}, ${result})
        `;
      } catch {}
    }

    return Response.json({ result });
  } catch (err) {
    console.error("POST /api/ai/disease error", err);
    return Response.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
