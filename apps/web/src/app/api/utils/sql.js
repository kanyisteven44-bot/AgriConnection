import { neon } from "@neondatabase/serverless";

// Use Neon DB URL (primary) or Supabase DB URL (fallback)
const dbUrl =
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL;

function NullishQueryFunction(..._args) {
  console.error(
    "[sql] No database connection string found. Set DATABASE_URL environment variable."
  );
  return Promise.resolve([]);
}
NullishQueryFunction.transaction = () =>
  Promise.reject(new Error("No database connection string configured."));

const sql = dbUrl ? neon(dbUrl) : NullishQueryFunction;

export default sql;
