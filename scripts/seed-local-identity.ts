import argon2 from "argon2";
import { eq } from "drizzle-orm";

import { getDb } from "../db/client";
import { userCredentials, users } from "../db/schema";
import { MIN_PASSWORD_LENGTH } from "../lib/identity/password-policy";

const PLATFORM_ROLES = ["user", "admin", "superadmin"] as const;
type PlatformRole = (typeof PLATFORM_ROLES)[number];

function parsePlatformRole(raw: string | undefined): PlatformRole {
  const v = (raw ?? "admin").toLowerCase().trim();
  if ((PLATFORM_ROLES as readonly string[]).includes(v)) {
    return v as PlatformRole;
  }
  throw new Error(
    `APZHUB_SEED_IDENTITY_PLATFORM_ROLE must be one of: ${PLATFORM_ROLES.join(", ")} (got "${raw ?? ""}")`,
  );
}

/**
 * Inserts one local-identity user + password hash if missing (idempotent on email).
 *
 * Env (optional):
 * - APZHUB_SEED_IDENTITY_EMAIL — default ops.admin@example.com
 * - APZHUB_SEED_IDENTITY_PASSWORD — default APZHUB_SEED_ADMIN_PASSWORD or ChangeMe-LocalDev-12!
 * - APZHUB_SEED_IDENTITY_PLATFORM_ROLE — user | admin | superadmin (default admin)
 * - APZHUB_SEED_IDENTITY_DISPLAY_NAME — default derived from local part of email
 *
 * DB URL: APZHUB_DATABASE_URL / DATABASE_URL / APZHUB_DATABASE_URL_FILE via loadAppSecrets (getDb).
 */
async function main() {
  const email = (process.env.APZHUB_SEED_IDENTITY_EMAIL ?? "ops.admin@example.com").trim();
  const norm = email.toLowerCase();
  const password =
    process.env.APZHUB_SEED_IDENTITY_PASSWORD?.trim() ??
    process.env.APZHUB_SEED_ADMIN_PASSWORD?.trim() ??
    "ChangeMe-LocalDev-12!";
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `Seed password must be at least ${MIN_PASSWORD_LENGTH} characters (APZHUB_SEED_IDENTITY_PASSWORD or APZHUB_SEED_ADMIN_PASSWORD).`,
    );
  }
  const platformRole = parsePlatformRole(process.env.APZHUB_SEED_IDENTITY_PLATFORM_ROLE);
  const displayName =
    process.env.APZHUB_SEED_IDENTITY_DISPLAY_NAME?.trim() ||
    (norm.includes("@")
      ? norm.split("@")[0]!.replace(/[._-]/g, " ").trim() || "Seeded user"
      : norm || "Seeded user");

  const db = getDb();
  const [existing] = await db.select().from(users).where(eq(users.emailNormalized, norm)).limit(1);
  if (existing) {
    console.log("Seed user already exists:", email);
    return;
  }
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
    throw new Error("Failed to insert seed user.");
  }
  await db.insert(userCredentials).values({ userId: inserted.id, passwordHash: hash });
  console.log("Seeded local user:", email, "role:", platformRole);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
