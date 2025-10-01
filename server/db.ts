import { WebSocket } from 'ws';
(globalThis as any).WebSocket = WebSocket;

import { neon, Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "@shared/schema";

// If USE_DB is truthy, require DATABASE_URL and initialize Neon/Drizzle.
const USE_DB = process.env.USE_DB === 'true';
const databaseUrl = process.env.DATABASE_URL;

// Export top-level bindings; we'll assign them below based on USE_DB.
export let sql: any = null;
export let pool: any = null;
export let db: any = null;
export let isConnected = false;

if (USE_DB) {
  if (!databaseUrl) {
    console.error('DATABASE_URL is not set. For production, set DATABASE_URL to your Neon or Postgres connection string.');
    throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
  }

  console.log("Attempting to connect to database...");
  // Create a Neon connection (serverless HTTP) by default. If you prefer local Postgres in dev,
  // set DATABASE_URL to a postgres:// connection string and optionally swap to a pg-based driver.
  sql = neon(databaseUrl);

  // Create a pool for session store
  pool = new Pool({ connectionString: databaseUrl });

  // Create a Drizzle instance
  db = drizzle(sql, { schema });
  isConnected = true;
} else {
  // No DB mode - leave sql/pool/db as null and isConnected=false
  sql = null;
  pool = null;
  db = null;
  isConnected = false;
}

/**
 * Run a lightweight health check against the database. Returns true if a simple query succeeds.
 */
export async function checkDbHealth(timeoutMs = 2000): Promise<boolean> {
  try {
    if (!isConnected || !sql) return false;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    // run a lightweight select
    await sql`SELECT 1`.then(() => clearTimeout(id));
    return true;
  } catch (err) {
    return false;
  }
}

// Test the database connection
// sql`SELECT NOW()`
//   .then(() => {
//     console.log('✅ Database connection successful');
//   })
//   .catch(err => {
//     console.error('❌ Database connection failed:', err.message);
//   });