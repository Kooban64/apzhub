import { eq } from "drizzle-orm";

import { getDb } from "./client";
import { roles, user } from "./schema";

const DEFAULT_ROLES = [
  { name: "platform_admin", description: "Platform administrator" },
  { name: "user", description: "Standard platform user" },
] as const;

export async function seedDatabase(): Promise<void> {
  const db = getDb();

  for (const role of DEFAULT_ROLES) {
    await db.insert(roles).values(role).onConflictDoNothing({ target: roles.name });
  }

  const [adminRole] = await db
    .select()
    .from(roles)
    .where(eq(roles.name, "platform_admin"))
    .limit(1);

  const [userRole] = await db
    .select()
    .from(roles)
    .where(eq(roles.name, "user"))
    .limit(1);

  if (!adminRole || !userRole) {
    throw new Error("Default roles missing after seed");
  }

  const devEmail = "dev@apzhub.local";
  const existing = await db
    .select()
    .from(user)
    .where(eq(user.email, devEmail))
    .limit(1);

  if (existing.length === 0) {
    // User row is created by Better Auth on first register/login.
    // Seed only ensures roles exist for RBAC scaffold.
    console.info(`[seed] Roles ready. Register dev user at /register with ${devEmail}`);
  }

  void adminRole;
  void userRole;
}
