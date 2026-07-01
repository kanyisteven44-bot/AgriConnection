import sql from "@/app/api/utils/sql";

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
    const { userId, latitude, longitude } = await request.json();
    if (!userId || !latitude || !longitude) {
      return Response.json(
        { error: "userId, latitude, longitude required" },
        { status: 400 },
      );
    }
    await sql`
      UPDATE auth_users SET latitude = ${latitude}, longitude = ${longitude}
      WHERE id = ${userId} AND role = 'transporter'
    `;
    await sql`
      UPDATE vehicles SET current_location = ${`${latitude},${longitude}`}
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
