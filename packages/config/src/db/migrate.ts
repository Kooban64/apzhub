import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createDb } from "./client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function runMigrations(connectionString?: string): Promise<void> {
  const db = createDb(connectionString);
  const migrationsFolder = path.resolve(__dirname, "../../drizzle");
  await migrate(db, { migrationsFolder });
}
