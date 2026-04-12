/**
 * Creates (or updates access for) a portal user with bundle + overrides across the full admin catalog
 * (mail, calendar, drive, reminders, chat, vendor apps). Idempotent on email.
 *
 * Prereq: migrations applied; optional `npm run db:seed` for the primary admin.
 *
 * Env:
 * - APZHUB_SEED_DEMO_EMAIL — default demo.all-services@example.com
 * - APZHUB_SEED_DEMO_PASSWORD — default same as seed-local-identity fallback (see MIN_PASSWORD_LENGTH)
 * - APZHUB_SEED_DEMO_DISPLAY_NAME — optional
 * - APZHUB_SEED_DEMO_PLATFORM_ROLE — user | admin | superadmin (default user)
 *
 * Dev launch: set `APZHUB_ACCESS_OPTIMISTIC_REALIZATION=true` so materialized posture is **provisioned**
 * without running the provisioning worker.
 */
import argon2 from "argon2";
import { eq } from "drizzle-orm";

import { getDb } from "../db/client";
import { userCredentials, users } from "../db/schema";
import { applyHubDemoAccessForSubject } from "../lib/dev/apply-hub-demo-access";
import { MIN_PASSWORD_LENGTH } from "../lib/identity/password-policy";

const PLATFORM_ROLES = ["user", "admin", "superadmin"] as const;
type PlatformRole = (typeof PLATFORM_ROLES)[number];

function parsePlatformRole(raw: string | undefined): PlatformRole {
  const v = (raw ?? "user").toLowerCase().trim();
  if ((PLATFORM_ROLES as readonly string[]).includes(v)) {
    return v as PlatformRole;
  }
  throw new Error(`APZHUB_SEED_DEMO_PLATFORM_ROLE must be one of: ${PLATFORM_ROLES.join(", ")}`);
}

async function main() {
  const email = (process.env.APZHUB_SEED_DEMO_EMAIL ?? "demo.all-services@example.com").trim();
  const norm = email.toLowerCase();
  const password =
    process.env.APZHUB_SEED_DEMO_PASSWORD?.trim() ??
    process.env.APZHUB_SEED_IDENTITY_PASSWORD?.trim() ??
    process.env.APZHUB_SEED_ADMIN_PASSWORD?.trim() ??
    "ChangeMe-LocalDev-12!";
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`APZHUB_SEED_DEMO_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  const platformRole = parsePlatformRole(process.env.APZHUB_SEED_DEMO_PLATFORM_ROLE);
  const displayName =
    process.env.APZHUB_SEED_DEMO_DISPLAY_NAME?.trim() ||
    (norm.includes("@") ? norm.split("@")[0]!.replace(/[._-]/g, " ").trim() || "Demo user" : "Demo user");

  const db = getDb();
  const [existing] = await db.select().from(users).where(eq(users.emailNormalized, norm)).limit(1);
  let userId: string;
  if (existing) {
    userId = existing.id;
    await db
      .update(users)
      .set({ displayName, platformRole, updatedAt: new Date() })
      .where(eq(users.id, userId));
    console.log("Updating existing demo user:", email, userId);
  } else {
    const hash = await argon2.hash(password, { type: argon2.argon2id });
    const [inserted] = await db
      .insert(users)
      .values({
        email,
        emailNormalized: norm,
        displayName,
        status: "active",
        platformRole,
        emailVerifiedAt: new Date(),
      })
      .returning({ id: users.id });
    if (!inserted) {
      throw new Error("Failed to insert demo user.");
    }
    userId = inserted.id;
    await db.insert(userCredentials).values({ userId, passwordHash: hash });
    console.log("Created demo user:", email, userId);
  }

  await applyHubDemoAccessForSubject(userId);
  console.log("Applied hub demo bundles + vendor overrides for subject:", userId);
  console.log("");
  console.log("Next steps:");
  console.log(
    "  - Set APZHUB_IDENTITY_SOURCE=local APZHUB_ACCESS_SOURCE=real APZHUB_ACCESS_OPTIMISTIC_REALIZATION=true for dev launch checks.",
  );
  console.log("  - Run: npm run test -- test/integration/hub-demo-access.integration.test.ts (with DATABASE_URL)");
  console.log("  - SSO edge JWT: npm run test -- test/integration/sso-first-party-edge.integration.test.ts");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
