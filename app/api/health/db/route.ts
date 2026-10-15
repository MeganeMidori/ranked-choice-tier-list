import { pool } from "@/lib/db";

export async function GET() {
  const { rows } = await pool.query("select now() as now, version() as version");
  return Response.json(rows[0]);
}
