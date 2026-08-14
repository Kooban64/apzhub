import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";

import { getDb } from "./client";
import { account, user } from "./schema";

export type EnsureCredentialUserInput = {
  readonly email: string;
  readonly name: string;
  readonly passwordHash: string;
  readonly activeTenantId?: string;
  readonly emailVerified?: boolean;
};

/**
 * Idempotent Better Auth credential user upsert (email unique).
 * Callers supply an already-hashed password (e.g. better-auth/crypto hashPassword).
 */
export async function ensureCredentialUser(
  input: EnsureCredentialUserInput,
): Promise<{ readonly userId: string; readonly created: boolean }> {
  const db = getDb();
  const email = input.email.trim().toLowerCase();
  const existing = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (existing[0]) {
    const userId = existing[0].id;
    await db
      .update(user)
      .set({
        name: input.name,
        activeTenantId: input.activeTenantId ?? undefined,
        emailVerified: input.emailVerified ?? true,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));

    const accounts = await db.select().from(account).where(eq(account.userId, userId));
    const credential = accounts.find((row) => row.providerId === "credential");
    if (credential) {
      await db
        .update(account)
        .set({ password: input.passwordHash, updatedAt: new Date() })
        .where(eq(account.id, credential.id));
    } else {
      await db.insert(account).values({
        id: randomUUID(),
        accountId: userId,
        providerId: "credential",
        userId,
        password: input.passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    return { userId, created: false };
  }

  const userId = randomUUID();
  const now = new Date();
  await db.insert(user).values({
    id: userId,
    name: input.name,
    email,
    emailVerified: input.emailVerified ?? true,
    activeTenantId: input.activeTenantId,
    createdAt: now,
    updatedAt: now,
  });
  await db.insert(account).values({
    id: randomUUID(),
    accountId: userId,
    providerId: "credential",
    userId,
    password: input.passwordHash,
    createdAt: now,
    updatedAt: now,
  });
  return { userId, created: true };
}
