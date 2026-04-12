/**
 * Idempotent seed for a fixed @apzor.com testing roster with full catalog access
 * (bundles `b-admin` + `b-core` and per-service max overrides; see `lib/dev/catalog-max-access.ts`).
 *
 * Prereq: `npm run db:migrate`; recommended first admin: `npm run db:seed`.
 *
 * Env:
 * - APZHUB_SEED_APZOR_PASSWORD — shared portal password (default `@Branch123`)
 */
import argon2 from "argon2";
import { eq } from "drizzle-orm";

import { getDb } from "../db/client";
import { userCredentials, users } from "../db/schema";
import { applyHubDemoAccessForSubject } from "../lib/dev/apply-hub-demo-access";
import { MIN_PASSWORD_LENGTH } from "../lib/identity/password-policy";
import type { PlatformRole } from "../lib/auth/session-types";

const ROSTER: { email: string; displayName: string; platformRole: PlatformRole }[] = [
  { email: "superadmin@apzor.com", displayName: "Apzor Superadmin", platformRole: "superadmin" },
  { email: "admin@apzor.com", displayName: "Apzor Admin", platformRole: "admin" },
  { email: "qa.lead@apzor.com", displayName: "QA Lead", platformRole: "user" },
  { email: "dev.user@apzor.com", displayName: "Dev User", platformRole: "user" },
  { email: "viewer@apzor.com", displayName: "Read-only Viewer", platformRole: "user" },
];

async function upsertPortalUser(
  email: string,
  displayName: string,
  platformRole: PlatformRole,
  password: string,
): Promise<string> {
  const norm = email.toLowerCase().trim();
  const db = getDb();
  const [existing] = await db.select().from(users).where(eq(users.emailNormalized, norm)).limit(1);
  if (existing) {
    await db
      .update(users)
      .set({ displayName, platformRole, updatedAt: new Date() })
      .where(eq(users.id, existing.id));
    const hash = await argon2.hash(password, { type: argon2.argon2id });
    const [cred] = await db.select().from(userCredentials).where(eq(userCredentials.userId, existing.id)).limit(1);
    if (cred) {
      await db
        .update(userCredentials)
        .set({ passwordHash: hash, updatedAt: new Date() })
        .where(eq(userCredentials.userId, existing.id));
    } else {
      await db.insert(userCredentials).values({ userId: existing.id, passwordHash: hash });
    }
    console.log("Updated apzor testing user:", email, existing.id);
    return existing.id;
  }
  const hash = await argon2.hash(password, { type: argon2.argon2id });
  const [inserted] = await db
    .insert(users)
    .values({
      email: email.trim(),
      emailNormalized: norm,
      displayName,
      status: "active",
      platformRole,
      emailVerifiedAt: new Date(),
    })
    .returning({ id: users.id });
  if (!inserted) {
    throw new Error(`Failed to insert user ${email}`);
  }
  await db.insert(userCredentials).values({ userId: inserted.id, passwordHash: hash });
  console.log("Created apzor testing user:", email, inserted.id);
  return inserted.id;
}

async function main() {
  const password =
    process.env.APZHUB_SEED_APZOR_PASSWORD?.trim() ??
    process.env.APZHUB_SEED_DEMO_PASSWORD?.trim() ??
    process.env.APZHUB_SEED_IDENTITY_PASSWORD?.trim() ??
    "@Branch123";
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`APZHUB_SEED_APZOR_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }

  for (const row of ROSTER) {
    const userId = await upsertPortalUser(row.email, row.displayName, row.platformRole, password);
    await applyHubDemoAccessForSubject(userId);
    console.log("Applied catalog max access profile for:", row.email);
  }
  console.log("");
  console.log("Done. Use APZHUB_ACCESS_SOURCE=real and optional APZHUB_ACCESS_OPTIMISTIC_REALIZATION=true for dev matrix/launch checks.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
