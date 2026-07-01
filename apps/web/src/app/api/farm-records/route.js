import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;
    const records = await sql`
      SELECT * FROM farm_records WHERE farmer_id = ${userId} ORDER BY date DESC LIMIT 60
    `;
    const summary = await sql`
      SELECT 
        SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as total_expense
      FROM farm_records WHERE farmer_id = ${userId}
    `;
    const monthly = await sql`
      SELECT 
        TO_CHAR(date, 'Mon') as month,
        SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as expense
      FROM farm_records 
      WHERE farmer_id = ${userId} AND date >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(date, 'Mon'), DATE_TRUNC('month', date)
      ORDER BY DATE_TRUNC('month', date) ASC
    `;
    return Response.json({ records, summary: summary[0], monthly });
  } catch (err) {
    console.error("GET /api/farm-records error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const { type, category, amount, date, description } = body;
    if (!type || !category || !amount)
      return Response.json({ error: "Missing fields" }, { status: 400 });
    const result = await sql`
      INSERT INTO farm_records (farmer_id, type, category, amount, date, description)
      VALUES (${session.user.id}, ${type}, ${category}, ${amount}, ${date || new Date().toISOString().split("T")[0]}, ${description})
      RETURNING *
    `;
    return Response.json({ record: result[0] });
  } catch (err) {
    console.error("POST /api/farm-records error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
