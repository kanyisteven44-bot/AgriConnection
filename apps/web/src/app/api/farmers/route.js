import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const lat = parseFloat(searchParams.get("lat") || "0");
    const lng = parseFloat(searchParams.get("lng") || "0");
    const limit = parseInt(searchParams.get("limit") || "50");

    let farmers;
    if (search.trim()) {
      farmers = await sql`
        SELECT 
          u.id, u.name, u.phone, u.location, u.profile_photo, u.role, u.latitude, u.longitude, u.is_verified,
          f.crops_grown, f.livestock_info, f.size as farm_size,
          (SELECT COUNT(*) FROM products p WHERE p.seller_id = u.id AND p.is_available = true) as active_products
        FROM auth_users u
        LEFT JOIN farms f ON f.farmer_id = u.id
        WHERE u.role IN ('farmer', 'supplier', 'expert')
        AND (
          LOWER(u.name) LIKE ${`%${search.toLowerCase()}%`}
          OR LOWER(u.location) LIKE ${`%${search.toLowerCase()}%`}
          OR LOWER(f.crops_grown) LIKE ${`%${search.toLowerCase()}%`}
        )
        ORDER BY u.name ASC
        LIMIT ${limit}
      `;
    } else if (lat && lng) {
      // Sort by distance when coordinates provided
      farmers = await sql`
        SELECT 
          u.id, u.name, u.phone, u.location, u.profile_photo, u.role, u.latitude, u.longitude, u.is_verified,
          f.crops_grown, f.livestock_info, f.size as farm_size,
          (SELECT COUNT(*) FROM products p WHERE p.seller_id = u.id AND p.is_available = true) as active_products
        FROM auth_users u
        LEFT JOIN farms f ON f.farmer_id = u.id
        WHERE u.role IN ('farmer', 'supplier', 'expert')
        ORDER BY 
          CASE WHEN u.latitude IS NOT NULL AND u.longitude IS NOT NULL
            THEN SQRT(POWER(u.latitude - ${lat}, 2) + POWER(u.longitude - ${lng}, 2))
            ELSE 9999
          END ASC
        LIMIT ${limit}
      `;
    } else {
      farmers = await sql`
        SELECT 
          u.id, u.name, u.phone, u.location, u.profile_photo, u.role, u.latitude, u.longitude, u.is_verified,
          f.crops_grown, f.livestock_info, f.size as farm_size,
          (SELECT COUNT(*) FROM products p WHERE p.seller_id = u.id AND p.is_available = true) as active_products
        FROM auth_users u
        LEFT JOIN farms f ON f.farmer_id = u.id
        WHERE u.role IN ('farmer', 'supplier', 'expert')
        ORDER BY u.created_at DESC
        LIMIT ${limit}
      `;
    }

    return Response.json({ farmers });
  } catch (err) {
    console.error("GET /api/farmers error", err);
    return Response.json({ error: "Failed to fetch farmers" }, { status: 500 });
  }
}
