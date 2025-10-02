import { WebSocket } from "ws";
globalThis.WebSocket = WebSocket;
import { neon, Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./shared/schema.js";
const USE_DB = process.env.USE_DB === "true";
const databaseUrl = process.env.DATABASE_URL;
let sql = null;
let pool = null;
let db = null;
let isConnected = false;
if (USE_DB) {
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set. For production, set DATABASE_URL to your Neon or Postgres connection string.");
    throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
  }
  console.log("Attempting to connect to database...");
  sql = neon(databaseUrl);
  pool = new Pool({ connectionString: databaseUrl });
  db = drizzle(sql, { schema });
  isConnected = true;
} else {
  sql = null;
  pool = null;
  db = null;
  isConnected = false;
}
async function checkDbHealth(timeoutMs = 2e3) {
  try {
    if (!isConnected || !sql) return false;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    await sql`SELECT 1`.then(() => clearTimeout(id));
    return true;
  } catch (err) {
    return false;
  }
}
export {
  checkDbHealth,
  db,
  isConnected,
  pool,
  sql
};
