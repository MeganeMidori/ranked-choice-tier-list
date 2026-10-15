import "server-only";
import { Pool } from "pg";

const globalForDb = globalThis as unknown as { pool?: Pool };

// Reuse the pool across hot reloads in dev so we don't exhaust connections.
export const pool =
  globalForDb.pool ??
  new Pool({ connectionString: process.env.DATABASE_URL });

if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;
