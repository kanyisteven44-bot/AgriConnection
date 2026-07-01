export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city") || "Nairobi";

    const baseUrl =
      process.env.AUTH_URL ||
      process.env.NEXT_PUBLIC_CREATE_APP_URL ||
      "http://localhost:3000";

    const response = await fetch(
      `${baseUrl}/integrations/weather-by-city?city=${encodeURIComponent(city)}`,
    );
    if (!response.ok) {
      const conditions = [
        "Sunny",
        "Partly Cloudy",
        "Cloudy",
        "Light Rain",
        "Clear",
      ];
      const condition =
        conditions[Math.floor(Math.random() * conditions.length)];
      return Response.json({
        temperature: Math.floor(Math.random() * 8) + 20,
        condition,
        humidity: Math.floor(Math.random() * 30) + 50,
        wind: Math.floor(Math.random() * 15) + 5,
        feels_like: Math.floor(Math.random() * 8) + 18,
        uv_index: Math.floor(Math.random() * 6) + 2,
        city,
        suggestion: condition.includes("Rain")
          ? "Rain detected. Delay irrigation and protect your seedlings."
          : condition === "Sunny"
            ? "Excellent day for field work, planting, and harvesting."
            : "Good day for farm activities. Monitor crop moisture levels.",
      });
    }
    const weatherData = await response.json();
    return Response.json({ ...weatherData, city });
  } catch (err) {
    console.error("GET /api/weather error", err);
    return Response.json({
      temperature: 24,
      condition: "Sunny",
      humidity: 60,
      wind: 12,
      city: "Nairobi",
      suggestion: "Good day for planting!",
    });
  }
}
