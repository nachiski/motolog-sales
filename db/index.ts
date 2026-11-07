import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema-pg";

let database: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function getDb() {
  if (database) return database;
  const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }
  database = drizzle(neon(databaseUrl), { schema });
  return database;
}
