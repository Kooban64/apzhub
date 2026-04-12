import "server-only";

import { eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { users } from "@/db/schema";
import type { UserRowForSession } from "@/lib/identity/session-snapshot-from-user";
import { appendAuthAuditEventSafe } from "@/lib/identity/auth-audit.server";

function defaultOidcPlatformRole(): UserRowForSession["platformRole"] {
  const v = (process.env.APZHUB_OIDC_DEFAULT_PLATFORM_ROLE ?? "user").toLowerCase().trim();
  if (v === "admin" || v === "superadmin" || v === "user") {
    return v;
  }
  return "user";
}

/**
 * Resolve or create a portal `users` row for an OIDC login (first-party directory link).
 */
export async function ensurePortalUserForOidcEmail(params: {
  email: string;
  displayNameHint?: string;
  correlationId?: string | null;
}): Promise<UserRowForSession> {
  const emailNorm = params.email.trim().toLowerCase();
  const db = getDb();
  const [existing] = await db.select().from(users).where(eq(users.emailNormalized, emailNorm)).limit(1);
  if (existing) {
    const hint = params.displayNameHint?.trim();
    if (hint && hint !== existing.displayName) {
      await db.update(users).set({ displayName: hint, updatedAt: new Date() }).where(eq(users.id, existing.id));
      await appendAuthAuditEventSafe({
        type: "oidc_profile_display_name_updated",
        userId: existing.id,
        correlationId: params.correlationId ?? null,
      });
      return {
        id: existing.id,
        email: existing.email,
        displayName: hint,
        status: existing.status,
        platformRole: existing.platformRole as UserRowForSession["platformRole"],
      };
    }
    return {
      id: existing.id,
      email: existing.email,
      displayName: existing.displayName,
      status: existing.status,
      platformRole: existing.platformRole as UserRowForSession["platformRole"],
    };
  }

  const displayName =
    params.displayNameHint?.trim() ||
    (emailNorm.includes("@") ? (emailNorm.split("@")[0] ?? "User").replace(/[._-]/g, " ") : "User");
  const platformRole = defaultOidcPlatformRole();
  const [created] = await db
    .insert(users)
    .values({
      email: params.email.trim(),
      emailNormalized: emailNorm,
      displayName,
      status: "active",
      platformRole,
      emailVerifiedAt: new Date(),
    })
    .returning();

  if (!created) {
    throw new Error("Could not create portal user for OIDC.");
  }
  await appendAuthAuditEventSafe({
    type: "oidc_portal_user_created",
    userId: created.id,
    correlationId: params.correlationId ?? null,
    metadata: { emailNormalized: emailNorm },
  });
  return {
    id: created.id,
    email: created.email,
    displayName: created.displayName,
    status: created.status,
    platformRole: created.platformRole as UserRowForSession["platformRole"],
  };
}
