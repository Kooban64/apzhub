import argon2 from "argon2";
import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { count } from "drizzle-orm";

import { getDb } from "@/db/client";
import {
  loginAttempts,
  userCredentials,
  userEmailVerifications,
  userPasswordResetTokens,
  userSessions,
  users,
} from "@/db/schema";
import type { PasswordLoginResult } from "@/lib/adapters/identity/types";
import { isSmtpConfigured, loadAppSecrets } from "@/lib/config/secrets";
import { buildSessionSnapshotForUser } from "@/lib/identity/session-snapshot-from-user";
import { hashOpaqueToken, randomUrlToken } from "@/lib/identity/token-crypto";
import { appendAuthAuditEventSafe } from "@/lib/identity/auth-audit.server";
import { logDevEmailTokenIfEnabled } from "@/lib/identity/auth-dev-mail-log";
import { sendTransactionalEmail } from "@/lib/mail/smtp-send";
import { logStructured } from "@/lib/observability/log";
import type { SessionSnapshot } from "@/lib/auth/session-types";
import { MIN_PASSWORD_LENGTH } from "@/lib/identity/password-policy";

const THROTTLE_WINDOW_MS = 15 * 60 * 1000;
const THROTTLE_MAX_FAILURES = 8;
const SESSION_TTL_SEC = 60 * 60 * 8;
const RESET_TTL_MS = 60 * 60 * 1000;
const VERIFY_TTL_MS = 48 * 60 * 60 * 1000;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function countRecentFailures(emailNormalized: string): Promise<number> {
  const db = getDb();
  const since = new Date(Date.now() - THROTTLE_WINDOW_MS);
  const [row] = await db
    .select({ c: count() })
    .from(loginAttempts)
    .where(
      and(
        eq(loginAttempts.emailNormalized, emailNormalized),
        eq(loginAttempts.outcome, "failure"),
        gt(loginAttempts.createdAt, since),
      ),
    );
  return Number(row?.c ?? 0);
}

async function recordLoginAttempt(
  emailNormalized: string,
  outcome: "success" | "failure",
  ip?: string,
): Promise<void> {
  const db = getDb();
  await db.insert(loginAttempts).values({ emailNormalized, outcome, ipAddress: ip });
}

export async function loginWithPasswordLocal(
  email: string,
  password: string,
  meta: { correlationId: string; ip?: string; userAgent?: string },
): Promise<PasswordLoginResult> {
  const emailNorm = normalizeEmail(email);
  if (!emailNorm || !password) {
    return { ok: false, error: "Email and password are required." };
  }

  const failures = await countRecentFailures(emailNorm);
  if (failures >= THROTTLE_MAX_FAILURES) {
    await recordLoginAttempt(emailNorm, "failure", meta.ip);
    await appendAuthAuditEventSafe({
      type: "login_throttled",
      correlationId: meta.correlationId,
      metadata: { emailNormalized: emailNorm },
    });
    return { ok: false, error: "Too many failed sign-in attempts. Try again later." };
  }

  const db = getDb();
  const [userRow] = await db.select().from(users).where(eq(users.emailNormalized, emailNorm)).limit(1);
  if (!userRow) {
    await recordLoginAttempt(emailNorm, "failure", meta.ip);
    await appendAuthAuditEventSafe({ type: "login_failure_unknown_user", correlationId: meta.correlationId });
    return { ok: false, error: "Invalid email or password." };
  }

  if (userRow.status === "suspended") {
    await recordLoginAttempt(emailNorm, "failure", meta.ip);
    await appendAuthAuditEventSafe({
      type: "login_failure_suspended",
      userId: userRow.id,
      correlationId: meta.correlationId,
    });
    return { ok: false, error: "Account is suspended." };
  }

  const [cred] = await db.select().from(userCredentials).where(eq(userCredentials.userId, userRow.id)).limit(1);
  if (!cred) {
    await recordLoginAttempt(emailNorm, "failure", meta.ip);
    await appendAuthAuditEventSafe({
      type: "login_failure_no_password",
      userId: userRow.id,
      correlationId: meta.correlationId,
    });
    return { ok: false, error: "Invalid email or password." };
  }

  const okPass = await argon2.verify(cred.passwordHash, password).catch(() => false);
  if (!okPass) {
    await recordLoginAttempt(emailNorm, "failure", meta.ip);
    await appendAuthAuditEventSafe({
      type: "login_failure_bad_password",
      userId: userRow.id,
      correlationId: meta.correlationId,
    });
    return { ok: false, error: "Invalid email or password." };
  }

  const now = Date.now();
  const expiresAt = new Date(now + SESSION_TTL_SEC * 1000);
  const expiresAtEpochSec = Math.floor(now / 1000) + SESSION_TTL_SEC;

  const [session] = await db
    .insert(userSessions)
    .values({
      userId: userRow.id,
      expiresAt,
      correlationId: meta.correlationId,
      userAgent: meta.userAgent,
      ipAddress: meta.ip,
    })
    .returning({ id: userSessions.id });

  if (!session) {
    return { ok: false, error: "Could not create session." };
  }

  await recordLoginAttempt(emailNorm, "success", meta.ip);
  await appendAuthAuditEventSafe({
    type: "login_success",
    userId: userRow.id,
    sessionId: session.id,
    correlationId: meta.correlationId,
  });

  const snapshot = buildSessionSnapshotForUser(
    {
      id: userRow.id,
      email: userRow.email,
      displayName: userRow.displayName,
      status: userRow.status,
      platformRole: userRow.platformRole,
    },
    { expiresAtEpochSec, authSessionId: session.id },
  );

  return { ok: true, snapshot };
}

export async function validateAuthSession(snapshot: SessionSnapshot): Promise<SessionSnapshot | null> {
  if (!snapshot.authSessionId || snapshot.sessionStatus !== "active" || !snapshot.user) {
    return snapshot;
  }
  const db = getDb();
  const [row] = await db
    .select({ session: userSessions, user: users })
    .from(userSessions)
    .innerJoin(users, eq(users.id, userSessions.userId))
    .where(eq(userSessions.id, snapshot.authSessionId))
    .limit(1);

  if (!row) {
    return null;
  }
  if (row.session.revokedAt) {
    return null;
  }
  if (row.session.expiresAt.getTime() <= Date.now()) {
    return null;
  }
  if (row.user.status === "suspended") {
    return null;
  }
  if (row.user.id !== snapshot.user.id) {
    return null;
  }
  return snapshot;
}

export async function revokeAuthSessionById(sessionId: string): Promise<void> {
  const db = getDb();
  await db
    .update(userSessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(userSessions.id, sessionId), isNull(userSessions.revokedAt)));
  await appendAuthAuditEventSafe({ type: "session_revoked", sessionId });
}

export async function requestPasswordResetLocal(
  email: string,
  meta: { correlationId: string },
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  if (!isSmtpConfigured()) {
    return { ok: false, error: "Password reset is unavailable until SMTP is configured.", status: 503 };
  }
  const emailNorm = normalizeEmail(email);
  const db = getDb();
  const [userRow] = await db.select().from(users).where(eq(users.emailNormalized, emailNorm)).limit(1);
  await appendAuthAuditEventSafe({
    type: "password_reset_request",
    userId: userRow?.id,
    correlationId: meta.correlationId,
    metadata: { emailNormalized: emailNorm, found: Boolean(userRow) },
  });
  if (!userRow) {
    return { ok: true };
  }
  const raw = randomUrlToken();
  const tokenHash = hashOpaqueToken(raw);
  const expiresAt = new Date(Date.now() + RESET_TTL_MS);
  await db.insert(userPasswordResetTokens).values({ userId: userRow.id, tokenHash, expiresAt });
  const baseUrl = process.env.APZHUB_PUBLIC_BASE_URL?.trim() || "http://localhost:3000";
  const link = `${baseUrl}/login?reset=${encodeURIComponent(raw)}`;
  const r = await sendTransactionalEmail({
    to: userRow.email,
    subject: "Reset your APZHUB password",
    text: `Use this link to reset your password (expires in 1 hour):\n\n${link}\n`,
  });
  if (!r.ok) {
    logStructured("error", "identity", "password reset mail failed", { correlationId: meta.correlationId });
    return { ok: false, error: "Could not send reset email.", status: 500 };
  }
  logDevEmailTokenIfEnabled("password_reset", { correlationId: meta.correlationId, rawToken: raw });
  return { ok: true };
}

export async function confirmPasswordResetLocal(
  token: string,
  newPassword: string,
  meta: { correlationId: string },
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      status: 400,
    };
  }
  const tokenHash = hashOpaqueToken(token.trim());
  const db = getDb();
  const [row] = await db
    .select()
    .from(userPasswordResetTokens)
    .where(
      and(
        eq(userPasswordResetTokens.tokenHash, tokenHash),
        isNull(userPasswordResetTokens.consumedAt),
        gt(userPasswordResetTokens.expiresAt, new Date()),
      ),
    )
    .orderBy(desc(userPasswordResetTokens.createdAt))
    .limit(1);
  if (!row) {
    return { ok: false, error: "Invalid or expired reset link.", status: 400 };
  }
  const hash = await argon2.hash(newPassword, { type: argon2.argon2id });
  await db.transaction(async (tx) => {
    await tx
      .update(userPasswordResetTokens)
      .set({ consumedAt: new Date() })
      .where(eq(userPasswordResetTokens.id, row.id));
    const [existingCred] = await tx
      .select({ userId: userCredentials.userId })
      .from(userCredentials)
      .where(eq(userCredentials.userId, row.userId))
      .limit(1);
    if (existingCred) {
      await tx
        .update(userCredentials)
        .set({ passwordHash: hash, updatedAt: new Date() })
        .where(eq(userCredentials.userId, row.userId));
    } else {
      await tx.insert(userCredentials).values({ userId: row.userId, passwordHash: hash });
    }
    await tx
      .update(userSessions)
      .set({ revokedAt: new Date() })
      .where(and(eq(userSessions.userId, row.userId), isNull(userSessions.revokedAt)));
  });
  await appendAuthAuditEventSafe({
    type: "password_reset_confirm",
    userId: row.userId,
    correlationId: meta.correlationId,
  });
  return { ok: true };
}

export async function requestEmailVerificationLocal(
  email: string,
  meta: { correlationId: string },
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  if (!isSmtpConfigured()) {
    return { ok: false, error: "Email verification is unavailable until SMTP is configured.", status: 503 };
  }
  const emailNorm = normalizeEmail(email);
  const db = getDb();
  const [userRow] = await db.select().from(users).where(eq(users.emailNormalized, emailNorm)).limit(1);
  if (!userRow) {
    return { ok: true };
  }
  if (userRow.emailVerifiedAt) {
    return { ok: true };
  }
  const raw = randomUrlToken();
  const tokenHash = hashOpaqueToken(raw);
  const expiresAt = new Date(Date.now() + VERIFY_TTL_MS);
  await db.insert(userEmailVerifications).values({ userId: userRow.id, tokenHash, expiresAt });
  const baseUrl = process.env.APZHUB_PUBLIC_BASE_URL?.trim() || "http://localhost:3000";
  const link = `${baseUrl}/login?verify=${encodeURIComponent(raw)}`;
  const r = await sendTransactionalEmail({
    to: userRow.email,
    subject: "Verify your APZHUB email",
    text: `Confirm your email address:\n\n${link}\n`,
  });
  if (!r.ok) {
    return { ok: false, error: "Could not send verification email.", status: 500 };
  }
  logDevEmailTokenIfEnabled("email_verify", { correlationId: meta.correlationId, rawToken: raw });
  await appendAuthAuditEventSafe({
    type: "email_verification_request",
    userId: userRow.id,
    correlationId: meta.correlationId,
  });
  return { ok: true };
}

export async function confirmEmailVerificationLocal(
  token: string,
  meta: { correlationId: string },
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const tokenHash = hashOpaqueToken(token.trim());
  const db = getDb();
  const [row] = await db
    .select()
    .from(userEmailVerifications)
    .where(
      and(
        eq(userEmailVerifications.tokenHash, tokenHash),
        isNull(userEmailVerifications.consumedAt),
        gt(userEmailVerifications.expiresAt, new Date()),
      ),
    )
    .orderBy(desc(userEmailVerifications.createdAt))
    .limit(1);
  if (!row) {
    return { ok: false, error: "Invalid or expired verification link.", status: 400 };
  }
  await db.transaction(async (tx) => {
    await tx
      .update(userEmailVerifications)
      .set({ consumedAt: new Date() })
      .where(eq(userEmailVerifications.id, row.id));
    await tx
      .update(users)
      .set({ emailVerifiedAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, row.userId));
  });
  await appendAuthAuditEventSafe({
    type: "email_verification_confirm",
    userId: row.userId,
    correlationId: meta.correlationId,
  });
  return { ok: true };
}

export function assertLocalIdentityPrerequisites(): void {
  const url =
    loadAppSecrets().databaseUrl?.trim() ??
    process.env.APZHUB_DATABASE_URL?.trim() ??
    process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "APZHUB_IDENTITY_SOURCE=local requires APZHUB_DATABASE_URL or DATABASE_URL (or APZHUB_DATABASE_URL_FILE with file contents).",
    );
  }
  const fromSecrets = loadAppSecrets().sessionSigningSecret;
  const fromEnv = process.env.APZHUB_SESSION_SIGNING_SECRET?.trim();
  const ok =
    (fromEnv && fromEnv.length >= 32) || (fromSecrets != null && fromSecrets.length >= 32);
  if (!ok) {
    throw new Error(
      "APZHUB_IDENTITY_SOURCE=local requires a 32+ character session signing secret (APZHUB_SESSION_SIGNING_SECRET env and/or *_FILE via loadAppSecrets).",
    );
  }
}
