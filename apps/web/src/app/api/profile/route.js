import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const rows = await sql`
      SELECT 
        id, name, email, image, role, phone, location, profile_photo, created_at,
        is_verified, id_number, latitude, longitude,
        (SELECT COUNT(*) FROM products WHERE seller_id = auth_users.id) as product_count,
        (SELECT COUNT(*) FROM orders WHERE buyer_id = auth_users.id) as order_count
      FROM auth_users
      WHERE id = ${userId}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const user = rows[0];

    // Fetch additional info based on role
    let additionalInfo = {};
    if (user.role === "farmer") {
      const farms =
        await sql`SELECT * FROM farms WHERE farmer_id = ${userId} LIMIT 1`;
      additionalInfo.farm = farms[0] || null;
    } else if (user.role === "transporter") {
      const vehicles =
        await sql`SELECT * FROM vehicles WHERE transporter_id = ${userId} LIMIT 1`;
      additionalInfo.vehicle = vehicles[0] || null;
    }

    return Response.json({ user, ...additionalInfo });
  } catch (err) {
    console.error("GET /api/profile error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { name, role, phone, location, profile_photo, farm, vehicle } = body;

    // Update auth_users
    const setClauses = [];
    const values = [];

    if (name) {
      setClauses.push(`name = $${values.length + 1}`);
      values.push(name);
    }
    if (role) {
      setClauses.push(`role = $${values.length + 1}`);
      values.push(role);
    }
    if (phone) {
      setClauses.push(`phone = $${values.length + 1}`);
      values.push(phone);
    }
    if (location) {
      setClauses.push(`location = $${values.length + 1}`);
      values.push(location);
    }
    if (profile_photo) {
      setClauses.push(`profile_photo = $${values.length + 1}`);
      values.push(profile_photo);
    }

    if (setClauses.length > 0) {
      const query = `UPDATE auth_users SET ${setClauses.join(", ")} WHERE id = $${values.length + 1}`;
      await sql(query, [...values, userId]);
    }

    // Handle Farmer additional info
    if (role === "farmer" && farm) {
      const existingFarm =
        await sql`SELECT id FROM farms WHERE farmer_id = ${userId}`;
      if (existingFarm.length > 0) {
        await sql`
          UPDATE farms 
          SET size = ${farm.size}, location = ${farm.location}, crops_grown = ${farm.crops_grown}, livestock_info = ${farm.livestock_info}
          WHERE farmer_id = ${userId}
        `;
      } else {
        await sql`
          INSERT INTO farms (farmer_id, size, location, crops_grown, livestock_info)
          VALUES (${userId}, ${farm.size}, ${farm.location}, ${farm.crops_grown}, ${farm.livestock_info})
        `;
      }
    }

    // Handle Transporter additional info
    if (role === "transporter" && vehicle) {
      const existingVehicle =
        await sql`SELECT id FROM vehicles WHERE transporter_id = ${userId}`;
      if (existingVehicle.length > 0) {
        await sql`
          UPDATE vehicles 
          SET vehicle_type = ${vehicle.vehicle_type}, capacity = ${vehicle.capacity}, current_location = ${vehicle.current_location}
          WHERE transporter_id = ${userId}
        `;
      } else {
        await sql`
          INSERT INTO vehicles (transporter_id, vehicle_type, capacity, current_location)
          VALUES (${userId}, ${vehicle.vehicle_type}, ${vehicle.capacity}, ${vehicle.current_location})
        `;
      }
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("PUT /api/profile error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
