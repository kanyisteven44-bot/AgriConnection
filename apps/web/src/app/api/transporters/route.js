import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Returns transporters with their location for the live map
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat") || "0");
    const lng = parseFloat(searchParams.get("lng") || "0");
    const radius = parseFloat(searchParams.get("radius") || "100");

    // Get transporters with vehicle info, ordered by proximity
    const transporters = await sql`
      SELECT 
        u.id, u.name, u.phone, u.profile_photo, u.latitude, u.longitude, u.location,
        v.vehicle_type, v.capacity, v.current_location, v.is_available
      FROM auth_users u
      LEFT JOIN vehicles v ON v.transporter_id = u.id
      WHERE u.role = 'transporter'
        AND u.latitude IS NOT NULL
        AND u.longitude IS NOT NULL
      ORDER BY 
        CASE WHEN ${lat} != 0 AND ${lng} != 0
          THEN SQRT(POWER(u.latitude - ${lat}, 2) + POWER(u.longitude - ${lng}, 2))
          ELSE 9999
        END ASC
      LIMIT 50
    `;

    // Also get all farmers with location for the map
    const farmers = await sql`
      SELECT 
        u.id, u.name, u.phone, u.location, u.profile_photo, u.role,
        u.latitude, u.longitude, u.is_verified,
        f.crops_grown, f.livestock_info, f.size as farm_size,
        (SELECT COUNT(*) FROM products p WHERE p.seller_id = u.id AND p.is_available = true) as active_products
      FROM auth_users u
      LEFT JOIN farms f ON f.farmer_id = u.id
      WHERE u.role IN ('farmer', 'supplier', 'expert', 'buyer')
        AND u.latitude IS NOT NULL
        AND u.longitude IS NOT NULL
      ORDER BY u.created_at DESC
      LIMIT 100
    `;

    return Response.json({ transporters, farmers });
  } catch (err) {
    console.error("GET /api/transporters error", err);
    return Response.json(
      { error: "Failed to fetch map data" },
      { status: 500 },
    );
  }
}

// Update transporter location (called by transporter's app)
export async function PUT(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { latitude, longitude } = await request.json();
    if (latitude == null || longitude == null) {
      return Response.json(
        { error: "latitude and longitude required" },
        { status: 400 },
      );
    }

    // Validate coordinate ranges
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return Response.json(
        { error: "Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180" },
        { status: 400 },
      );
    }

    const userId = session.user.id;

    await sql`
      UPDATE auth_users SET latitude = ${lat}, longitude = ${lng}
      WHERE id = ${userId} AND role = 'transporter'
    `;
    await sql`
      UPDATE vehicles SET current_location = ${`${lat},${lng}`}
      WHERE transporter_id = ${userId}
    `;
    return Response.json({ ok: true });
  } catch (err) {
    console.error("PUT /api/transporters error", err);
    return Response.json(
      { error: "Failed to update location" },
      { status: 500 },
    );
  }
}
