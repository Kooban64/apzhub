/**
 * Durable product assignment SoR (Stream 6) — Postgres first, file ledger bridge.
 * Product-specific roles remain in AuthZ; this store is org subscribe + user grant only.
 */

import { and, eq } from "drizzle-orm";

import {
  getDb,
  platformProductOrgSubscription,
  platformProductUserGrant,
} from "@apzhub/config/db";
import type { PlanId, ProductKey } from "@/lib/commercial/catalogue";
import {
  listAllOrgProductSubscriptions as listFileAllOrgSubscriptions,
  listAllUserProductGrants as listFileAllUserGrants,
  listAllUserProductGrantsForOrg,
  listOrgProductSubscriptions as listFileOrgSubscriptions,
  listUserProductGrants as listFileUserGrants,
  type OrgProductSubscription,
  type UserProductGrant,
} from "@/lib/commercial/product-access";

function pgAvailable(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export async function listOrgProductSubscriptionsDurable(
  organisationId: string,
): Promise<readonly OrgProductSubscription[]> {
  if (!pgAvailable()) {
    return listFileOrgSubscriptions(organisationId);
  }
  try {
    const rows = await getDb()
      .select()
      .from(platformProductOrgSubscription)
      .where(eq(platformProductOrgSubscription.organisationId, organisationId));
    if (rows.length > 0) {
      return rows.map((r) => ({
        subscriptionId: r.id,
        organisationId: r.organisationId,
        productKey: r.productKey as ProductKey,
        planId: (r.planId ?? "plan.business") as PlanId,
        status: r.status as OrgProductSubscription["status"],
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }));
    }
  } catch {
    // Table may not exist yet mid-migrate — fall through.
  }
  return listFileOrgSubscriptions(organisationId);
}

export async function listUserProductGrantsDurable(input: {
  readonly organisationId: string;
  readonly userId: string;
}): Promise<readonly UserProductGrant[]> {
  if (!pgAvailable()) {
    return listFileUserGrants(input);
  }
  try {
    const rows = await getDb()
      .select()
      .from(platformProductUserGrant)
      .where(
        and(
          eq(platformProductUserGrant.organisationId, input.organisationId),
          eq(platformProductUserGrant.userId, input.userId),
          eq(platformProductUserGrant.status, "active"),
        ),
      );
    if (rows.length > 0) {
      return rows.map((r) => ({
        grantId: r.id,
        organisationId: r.organisationId,
        userId: r.userId,
        productKey: r.productKey as ProductKey,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }));
    }
  } catch {
    // fall through
  }
  return listFileUserGrants(input);
}

export async function listAllUserProductGrantsForOrgDurable(
  organisationId: string,
): Promise<readonly UserProductGrant[]> {
  if (!pgAvailable()) {
    return listAllUserProductGrantsForOrg(organisationId);
  }
  try {
    const rows = await getDb()
      .select()
      .from(platformProductUserGrant)
      .where(
        and(
          eq(platformProductUserGrant.organisationId, organisationId),
          eq(platformProductUserGrant.status, "active"),
        ),
      );
    if (rows.length > 0) {
      return rows.map((r) => ({
        grantId: r.id,
        organisationId: r.organisationId,
        userId: r.userId,
        productKey: r.productKey as ProductKey,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }));
    }
  } catch {
    // fall through
  }
  return listAllUserProductGrantsForOrg(organisationId);
}

/** Platform-wide org subscriptions (Postgres SoR when available). */
export async function listAllOrgProductSubscriptionsDurable(): Promise<
  readonly OrgProductSubscription[]
> {
  if (!pgAvailable()) {
    return listFileAllOrgSubscriptions();
  }
  try {
    const rows = await getDb().select().from(platformProductOrgSubscription);
    if (rows.length > 0) {
      return rows
        .filter((r) => ["active", "trial", "past_due"].includes(r.status))
        .map((r) => ({
          subscriptionId: r.id,
          organisationId: r.organisationId,
          productKey: r.productKey as ProductKey,
          planId: (r.planId ?? "plan.business") as PlanId,
          status: r.status as OrgProductSubscription["status"],
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        }));
    }
  } catch {
    // fall through
  }
  return listFileAllOrgSubscriptions();
}

/** Platform-wide user product grants (active). */
export async function listAllUserProductGrantsDurable(): Promise<
  readonly UserProductGrant[]
> {
  if (!pgAvailable()) {
    return listFileAllUserGrants();
  }
  try {
    const rows = await getDb()
      .select()
      .from(platformProductUserGrant)
      .where(eq(platformProductUserGrant.status, "active"));
    if (rows.length > 0) {
      return rows.map((r) => ({
        grantId: r.id,
        organisationId: r.organisationId,
        userId: r.userId,
        productKey: r.productKey as ProductKey,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }));
    }
  } catch {
    // fall through
  }
  return listFileAllUserGrants();
}

/** One-way bridge: copy file ledger rows into Postgres when PG has no rows for the org. */
export async function bridgeProductAccessFileToPostgres(
  organisationId: string,
): Promise<{ readonly subscriptions: number; readonly grants: number }> {
  if (!pgAvailable()) return { subscriptions: 0, grants: 0 };
  const db = getDb();
  let subscriptions = 0;
  let grants = 0;
  try {
    const existingSubs = await db
      .select()
      .from(platformProductOrgSubscription)
      .where(eq(platformProductOrgSubscription.organisationId, organisationId));
    if (existingSubs.length === 0) {
      for (const s of listFileOrgSubscriptions(organisationId)) {
        const now = new Date();
        await db
          .insert(platformProductOrgSubscription)
          .values({
            id: s.subscriptionId || `pos_${organisationId}_${s.productKey}`,
            organisationId,
            productKey: s.productKey,
            planId: s.planId,
            status: s.status,
            metadata: {},
            createdAt: now,
            updatedAt: now,
          })
          .onConflictDoNothing();
        subscriptions += 1;
      }
    }

    const existingGrants = await db
      .select()
      .from(platformProductUserGrant)
      .where(eq(platformProductUserGrant.organisationId, organisationId));
    if (existingGrants.length === 0) {
      for (const g of listAllUserProductGrantsForOrg(organisationId)) {
        const now = new Date();
        await db
          .insert(platformProductUserGrant)
          .values({
            id: g.grantId || `pug_${organisationId}_${g.userId}_${g.productKey}`,
            organisationId,
            userId: g.userId,
            productKey: g.productKey,
            status: "active",
            createdAt: now,
            updatedAt: now,
          })
          .onConflictDoNothing();
        grants += 1;
      }
    }
  } catch {
    return { subscriptions: 0, grants: 0 };
  }
  return { subscriptions, grants };
}

/**
 * Ensure org is subscribed to products (Platform Admin privileged write).
 * Dual-writes file ledger for transitional compatibility.
 */
export async function ensureOrgProductSubscriptionsDurable(input: {
  readonly organisationId: string;
  readonly productKeys: readonly ProductKey[];
  readonly planId?: PlanId;
}): Promise<void> {
  const { upsertOrgProductSubscription } =
    await import("@/lib/commercial/product-access");
  const planId = input.planId ?? ("plan.business" as PlanId);
  for (const productKey of input.productKeys) {
    try {
      upsertOrgProductSubscription({
        organisationId: input.organisationId,
        productKey,
        planId,
        status: "active",
      });
    } catch {
      /* skip unknown products in file layer */
    }
  }

  if (!pgAvailable()) return;
  const db = getDb();
  const now = new Date();
  for (const productKey of input.productKeys) {
    await db
      .insert(platformProductOrgSubscription)
      .values({
        id: `pos_${input.organisationId}_${productKey}`,
        organisationId: input.organisationId,
        productKey,
        planId,
        status: "active",
        metadata: { source: "platform_admin_write" },
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoNothing();
  }
}

/**
 * Replace user product grants in Postgres (SoR) + dual-write file for compatibility.
 */
export async function setUserProductGrantsDurable(input: {
  readonly organisationId: string;
  readonly userId: string;
  readonly productKeys: readonly ProductKey[];
}): Promise<readonly UserProductGrant[]> {
  const { setUserProductGrants } = await import("@/lib/commercial/product-access");
  // Transitional dual-write to file
  const fileGrants = setUserProductGrants(input);

  if (!pgAvailable()) return fileGrants;

  const db = getDb();
  const now = new Date();
  try {
    // Soft-remove prior grants for user+org
    const existing = await db
      .select()
      .from(platformProductUserGrant)
      .where(
        and(
          eq(platformProductUserGrant.organisationId, input.organisationId),
          eq(platformProductUserGrant.userId, input.userId),
        ),
      );
    for (const row of existing) {
      await db
        .update(platformProductUserGrant)
        .set({ status: "revoked", updatedAt: now })
        .where(eq(platformProductUserGrant.id, row.id));
    }

    const created: UserProductGrant[] = [];
    for (const productKey of input.productKeys) {
      const id = `pug_${input.organisationId}_${input.userId}_${productKey}`;
      await db
        .insert(platformProductUserGrant)
        .values({
          id,
          organisationId: input.organisationId,
          userId: input.userId,
          productKey,
          status: "active",
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoNothing();
      // Reactivate if existed revoked
      await db
        .update(platformProductUserGrant)
        .set({ status: "active", updatedAt: now })
        .where(eq(platformProductUserGrant.id, id));
      created.push({
        grantId: id,
        organisationId: input.organisationId,
        userId: input.userId,
        productKey,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      });
    }
    return created.length > 0 ? created : fileGrants;
  } catch {
    return fileGrants;
  }
}
