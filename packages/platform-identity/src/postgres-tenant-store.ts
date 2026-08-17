import { and, eq } from "drizzle-orm";

import { getDb, platformTenant, platformUserTenant, user } from "@apzhub/config/db";

import { DEFAULT_PLATFORM_TENANT_ID } from "./index";
import type { PlatformTenant, PlatformUserTenantMembership } from "./tenant-types";

export async function getPrimaryTenantIdForUser(
  userId: string,
): Promise<string | undefined> {
  const db = getDb();

  const [userRow] = await db
    .select({ activeTenantId: user.activeTenantId })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (userRow?.activeTenantId) {
    return userRow.activeTenantId;
  }

  const [membership] = await db
    .select()
    .from(platformUserTenant)
    .where(
      and(
        eq(platformUserTenant.userId, userId),
        eq(platformUserTenant.isPrimary, true),
        eq(platformUserTenant.status, "active"),
      ),
    )
    .limit(1);

  if (membership) {
    return membership.tenantId;
  }

  const [fallback] = await db
    .select()
    .from(platformUserTenant)
    .where(
      and(
        eq(platformUserTenant.userId, userId),
        eq(platformUserTenant.status, "active"),
      ),
    )
    .limit(1);

  return fallback?.tenantId;
}

export async function ensureUserTenantMembership(input: {
  readonly userId: string;
  readonly tenantId?: string;
}): Promise<string> {
  const db = getDb();
  const tenantId = input.tenantId ?? DEFAULT_PLATFORM_TENANT_ID;
  const timestamp = new Date();

  const [tenant] = await db
    .select()
    .from(platformTenant)
    .where(eq(platformTenant.tenantId, tenantId))
    .limit(1);

  if (!tenant) {
    throw new Error(`Platform tenant not found: ${tenantId}`);
  }

  const [existing] = await db
    .select()
    .from(platformUserTenant)
    .where(
      and(
        eq(platformUserTenant.userId, input.userId),
        eq(platformUserTenant.tenantId, tenantId),
      ),
    )
    .limit(1);

  if (!existing) {
    await db.insert(platformUserTenant).values({
      membershipId: `mtm-${crypto.randomUUID()}`,
      userId: input.userId,
      tenantId,
      isPrimary: true,
      status: "active",
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  } else if (existing.status !== "active") {
    await db
      .update(platformUserTenant)
      .set({ status: "active", updatedAt: timestamp })
      .where(eq(platformUserTenant.membershipId, existing.membershipId));
  }

  await db
    .update(platformUserTenant)
    .set({ isPrimary: false, updatedAt: timestamp })
    .where(eq(platformUserTenant.userId, input.userId));

  await db
    .update(platformUserTenant)
    .set({ isPrimary: true, updatedAt: timestamp })
    .where(
      and(
        eq(platformUserTenant.userId, input.userId),
        eq(platformUserTenant.tenantId, tenantId),
      ),
    );

  await db
    .update(user)
    .set({ activeTenantId: tenantId, updatedAt: timestamp })
    .where(eq(user.id, input.userId));

  return tenantId;
}

export async function seedDefaultPlatformTenantRow(): Promise<void> {
  const db = getDb();
  const timestamp = new Date();

  await db
    .insert(platformTenant)
    .values({
      tenantId: DEFAULT_PLATFORM_TENANT_ID,
      slug: "default-firm",
      name: "Default Firm",
      status: "active",
      metadata: { displayName: "Default Firm", productKeys: ["law-platform"] },
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    .onConflictDoNothing({ target: platformTenant.tenantId });
}

export async function listPlatformTenants(): Promise<readonly PlatformTenant[]> {
  const db = getDb();
  const rows = await db.select().from(platformTenant);
  return rows.map((row) => ({
    tenantId: row.tenantId,
    slug: row.slug,
    name: row.name,
    status: row.status as PlatformTenant["status"],
    metadata: (row.metadata ?? {}) as PlatformTenant["metadata"],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }));
}

export async function getPlatformTenantDiagnostics(): Promise<{
  readonly tenantCount: number;
  readonly membershipCount: number;
}> {
  const db = getDb();
  const tenants = await db.select().from(platformTenant);
  const memberships = await db
    .select()
    .from(platformUserTenant)
    .where(eq(platformUserTenant.status, "active"));
  return { tenantCount: tenants.length, membershipCount: memberships.length };
}

export async function listMembershipsForUser(
  userId: string,
): Promise<readonly PlatformUserTenantMembership[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(platformUserTenant)
    .where(
      and(
        eq(platformUserTenant.userId, userId),
        eq(platformUserTenant.status, "active"),
      ),
    );

  return rows.map((row) => ({
    membershipId: row.membershipId,
    userId: row.userId,
    tenantId: row.tenantId,
    isPrimary: row.isPrimary,
    status: row.status as PlatformUserTenantMembership["status"],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }));
}

/** All memberships for a tenant (any status except removed-equivalent). */
export async function listMembershipsForTenant(
  tenantId: string,
): Promise<readonly PlatformUserTenantMembership[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(platformUserTenant)
    .where(eq(platformUserTenant.tenantId, tenantId));

  return rows.map((row) => ({
    membershipId: row.membershipId,
    userId: row.userId,
    tenantId: row.tenantId,
    isPrimary: row.isPrimary,
    status: row.status as PlatformUserTenantMembership["status"],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }));
}

export async function setUserTenantMembershipStatus(input: {
  readonly userId: string;
  readonly tenantId: string;
  readonly status: PlatformUserTenantMembership["status"];
}): Promise<boolean> {
  const db = getDb();
  const [existing] = await db
    .select()
    .from(platformUserTenant)
    .where(
      and(
        eq(platformUserTenant.userId, input.userId),
        eq(platformUserTenant.tenantId, input.tenantId),
      ),
    )
    .limit(1);
  if (!existing) return false;
  await db
    .update(platformUserTenant)
    .set({ status: input.status, updatedAt: new Date() })
    .where(eq(platformUserTenant.membershipId, existing.membershipId));
  return true;
}
