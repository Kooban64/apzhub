import "server-only";

import argon2 from "argon2";
import { and, eq, isNull } from "drizzle-orm";

import { getDb } from "@/db/client";
import { userCredentials, userSessions, users } from "@/db/schema";
import { appendAuthAuditEventSafe } from "@/lib/identity/auth-audit.server";
import { MIN_PASSWORD_LENGTH } from "@/lib/identity/password-policy";
import type { PlatformRole } from "@/lib/auth/session-types";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function assertPlatformRoleAssignable(actor: PlatformRole, target: PlatformRole): void {
  if (target === "superadmin" && actor !== "superadmin") {
    throw Object.assign(new Error("Forbidden"), { status: 403 });
  }
}

export type AdminUserListRow = {
  id: string;
  email: string;
  displayName: string;
  status: "active" | "suspended";
  platformRole: PlatformRole;
  hasPassword: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function adminListUsers(): Promise<AdminUserListRow[]> {
  const db = getDb();
  const rows = await db.select().from(users).orderBy(users.emailNormalized);
  const creds = await db.select({ userId: userCredentials.userId }).from(userCredentials);
  const credSet = new Set(creds.map((c) => c.userId));
  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    displayName: r.displayName,
    status: r.status,
    platformRole: r.platformRole as PlatformRole,
    hasPassword: credSet.has(r.id),
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));
}

export type CreatePortalUserInput = {
  email: string;
  displayName: string;
  password: string;
  platformRole: PlatformRole;
};

export async function adminCreatePortalUser(
  input: CreatePortalUserInput,
  actor: { userId: string; platformRole: PlatformRole; correlationId?: string | null },
): Promise<{ id: string }> {
  assertPlatformRoleAssignable(actor.platformRole, input.platformRole);
  const emailNorm = normalizeEmail(input.email);
  if (!emailNorm.includes("@")) {
    throw Object.assign(new Error("Invalid email."), { status: 400 });
  }
  if (input.password.length < MIN_PASSWORD_LENGTH) {
    throw Object.assign(
      new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`),
      { status: 400 },
    );
  }
  const db = getDb();
  const [dup] = await db.select({ id: users.id }).from(users).where(eq(users.emailNormalized, emailNorm)).limit(1);
  if (dup) {
    throw Object.assign(new Error("A user with this email already exists."), { status: 409 });
  }
  const hash = await argon2.hash(input.password, { type: argon2.argon2id });
  const [inserted] = await db
    .insert(users)
    .values({
      email: input.email.trim(),
      emailNormalized: emailNorm,
      displayName: input.displayName.trim() || emailNorm.split("@")[0]!,
      status: "active",
      platformRole: input.platformRole,
      emailVerifiedAt: new Date(),
    })
    .returning({ id: users.id });
  if (!inserted) {
    throw Object.assign(new Error("Could not create user."), { status: 500 });
  }
  await db.insert(userCredentials).values({ userId: inserted.id, passwordHash: hash });
  await appendAuthAuditEventSafe({
    type: "admin_user_created",
    userId: inserted.id,
    correlationId: actor.correlationId ?? null,
    metadata: { createdBy: actor.userId },
  });
  return { id: inserted.id };
}

export type UpdatePortalUserInput = {
  displayName?: string;
  platformRole?: PlatformRole;
};

export async function adminUpdatePortalUser(
  userId: string,
  patch: UpdatePortalUserInput,
  actor: { userId: string; platformRole: PlatformRole; correlationId?: string | null },
): Promise<void> {
  if (patch.platformRole) {
    assertPlatformRoleAssignable(actor.platformRole, patch.platformRole);
  }
  const db = getDb();
  const [row] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!row) {
    throw Object.assign(new Error("User not found."), { status: 404 });
  }
  const next: Partial<typeof users.$inferInsert> = { updatedAt: new Date() };
  if (patch.displayName !== undefined) {
    next.displayName = patch.displayName.trim();
  }
  if (patch.platformRole !== undefined) {
    next.platformRole = patch.platformRole;
  }
  await db.update(users).set(next).where(eq(users.id, userId));
  await appendAuthAuditEventSafe({
    type: "admin_user_updated",
    userId,
    correlationId: actor.correlationId ?? null,
    metadata: { updatedBy: actor.userId, patch },
  });
}

export async function adminSetUserPassword(
  userId: string,
  newPassword: string,
  actor: { userId: string; correlationId?: string | null },
): Promise<void> {
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    throw Object.assign(
      new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`),
      { status: 400 },
    );
  }
  const db = getDb();
  const [row] = await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1);
  if (!row) {
    throw Object.assign(new Error("User not found."), { status: 404 });
  }
  const hash = await argon2.hash(newPassword, { type: argon2.argon2id });
  const [existing] = await db.select().from(userCredentials).where(eq(userCredentials.userId, userId)).limit(1);
  if (existing) {
    await db
      .update(userCredentials)
      .set({ passwordHash: hash, updatedAt: new Date() })
      .where(eq(userCredentials.userId, userId));
  } else {
    await db.insert(userCredentials).values({ userId, passwordHash: hash });
  }
  await db
    .update(userSessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(userSessions.userId, userId), isNull(userSessions.revokedAt)));
  await appendAuthAuditEventSafe({
    type: "admin_password_reset",
    userId,
    correlationId: actor.correlationId ?? null,
    metadata: { setBy: actor.userId },
  });
}

export async function adminDeletePortalUser(
  userId: string,
  actor: { userId: string; correlationId?: string | null },
): Promise<void> {
  if (userId === actor.userId) {
    throw Object.assign(new Error("You cannot delete your own account."), { status: 400 });
  }
  const db = getDb();
  const [row] = await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1);
  if (!row) {
    throw Object.assign(new Error("User not found."), { status: 404 });
  }
  await db.delete(users).where(eq(users.id, userId));
  await appendAuthAuditEventSafe({
    type: "admin_user_deleted",
    correlationId: actor.correlationId ?? null,
    metadata: { deletedUserId: userId, deletedBy: actor.userId },
  });
}
