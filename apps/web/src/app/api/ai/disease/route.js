import { auth } from "@/auth";
import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return Response.json({ error: "Image URL required" }, { status: 400 });
    }

    const session = await auth();
    const userId = session?.user?.id || null;

    const baseUrl =
      process.env.AUTH_URL ||
      process.env.NEXT_PUBLIC_CREATE_APP_URL ||
      "http://localhost:3000";

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

    // Log if authenticated
    if (userId) {
      await sql`
        INSERT INTO ai_logs (user_id, query_type, input_data, result)
        VALUES (${userId}, 'disease', ${imageUrl}, ${result})
      `.catch(() => {}); // Don't fail if logging fails
    }

    return Response.json({ result });
  } catch (err) {
    console.error("POST /api/ai/disease error", err);
    return Response.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 },
    );
  }
}
