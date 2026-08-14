/**
 * Org product subscriptions + per-user product grants (file-backed SoR).
 * Access = orgSubscribed ∩ userGranted ∩ product.available ∩ RBAC.
 */

import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  getPlan,
  getProduct,
  type PlanId,
  type ProductKey,
} from "@/lib/commercial/catalogue";

export type OrgProductSubscriptionStatus =
  "trial" | "active" | "past_due" | "cancelled" | "expired";

export type OrgProductSubscription = {
  readonly subscriptionId: string;
  readonly organisationId: string;
  readonly productKey: ProductKey;
  readonly planId: PlanId;
  readonly status: OrgProductSubscriptionStatus;
  readonly trialEndsAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type UserProductGrant = {
  readonly grantId: string;
  readonly organisationId: string;
  readonly userId: string;
  readonly productKey: ProductKey;
  readonly createdAt: string;
  readonly updatedAt: string;
};

type Snapshot = {
  subscriptions: OrgProductSubscription[];
  grants: UserProductGrant[];
};

const store: Snapshot = {
  subscriptions: [],
  grants: [],
};
let hydrated = false;

function persistEnabled(): boolean {
  if (process.env.APZHUB_QEP_LEDGER_PERSIST === "true") return true;
  if (process.env.VITEST === "true" || process.env.NODE_ENV === "test") return false;
  return true;
}

function dataDir(): string {
  const override = process.env.APZHUB_QEP_DATA_DIR?.trim();
  const cwd = process.cwd();
  const base = override
    ? override
    : cwd.endsWith("/apps/web") || cwd.endsWith("\\apps/web")
      ? join(cwd, ".data")
      : join(cwd, "apps/web/.data");
  return join(base, "product-access");
}

function hydrate(): void {
  if (hydrated) return;
  hydrated = true;
  if (!persistEnabled()) return;
  const path = join(dataDir(), "ledger.json");
  if (!existsSync(path)) return;
  try {
    const snap = JSON.parse(readFileSync(path, "utf8")) as Snapshot;
    if (Array.isArray(snap.subscriptions)) {
      store.subscriptions.push(...snap.subscriptions);
    }
    if (Array.isArray(snap.grants)) {
      store.grants.push(...snap.grants);
    }
  } catch {
    /* ignore corrupt */
  }
}

function persistAll(): void {
  if (!persistEnabled()) return;
  mkdirSync(dataDir(), { recursive: true });
  writeFileSync(join(dataDir(), "ledger.json"), JSON.stringify(store, null, 2), "utf8");
}

export function resetProductAccessForTests(): void {
  store.subscriptions.splice(0, store.subscriptions.length);
  store.grants.splice(0, store.grants.length);
  hydrated = false;
}

export function listOrgProductSubscriptions(
  organisationId: string,
): readonly OrgProductSubscription[] {
  hydrate();
  return store.subscriptions.filter(
    (row) =>
      row.organisationId === organisationId &&
      (row.status === "trial" || row.status === "active" || row.status === "past_due"),
  );
}

export function listUserProductGrants(input: {
  readonly organisationId: string;
  readonly userId: string;
}): readonly UserProductGrant[] {
  hydrate();
  return store.grants.filter(
    (row) => row.organisationId === input.organisationId && row.userId === input.userId,
  );
}

export function upsertOrgProductSubscription(input: {
  readonly organisationId: string;
  readonly productKey: ProductKey;
  readonly planId: PlanId;
  readonly status: OrgProductSubscriptionStatus;
  readonly trialEndsAt?: string;
}): OrgProductSubscription {
  hydrate();
  const now = new Date().toISOString();
  const existing = store.subscriptions.find(
    (row) =>
      row.organisationId === input.organisationId &&
      row.productKey === input.productKey,
  );
  if (existing) {
    const updated: OrgProductSubscription = {
      ...existing,
      planId: input.planId,
      status: input.status,
      trialEndsAt: input.trialEndsAt ?? existing.trialEndsAt,
      updatedAt: now,
    };
    const idx = store.subscriptions.indexOf(existing);
    store.subscriptions[idx] = updated;
    persistAll();
    return updated;
  }
  const created: OrgProductSubscription = {
    subscriptionId: `ops-${randomUUID()}`,
    organisationId: input.organisationId,
    productKey: input.productKey,
    planId: input.planId,
    status: input.status,
    trialEndsAt: input.trialEndsAt,
    createdAt: now,
    updatedAt: now,
  };
  store.subscriptions.push(created);
  persistAll();
  return created;
}

export function setUserProductGrants(input: {
  readonly organisationId: string;
  readonly userId: string;
  readonly productKeys: readonly ProductKey[];
}): readonly UserProductGrant[] {
  hydrate();
  const now = new Date().toISOString();
  const orgSubscribed = new Set(
    listOrgProductSubscriptions(input.organisationId).map((s) => s.productKey),
  );
  const allowed = input.productKeys.filter((key) => orgSubscribed.has(key));

  store.grants = store.grants.filter(
    (row) =>
      !(row.organisationId === input.organisationId && row.userId === input.userId),
  );

  const created: UserProductGrant[] = allowed.map((productKey) => ({
    grantId: `upg-${randomUUID()}`,
    organisationId: input.organisationId,
    userId: input.userId,
    productKey,
    createdAt: now,
    updatedAt: now,
  }));
  store.grants.push(...created);
  persistAll();
  return created;
}

export function grantUserProduct(input: {
  readonly organisationId: string;
  readonly userId: string;
  readonly productKey: ProductKey;
}): UserProductGrant {
  const existing = listUserProductGrants(input).map((g) => g.productKey);
  if (!existing.includes(input.productKey)) {
    setUserProductGrants({
      organisationId: input.organisationId,
      userId: input.userId,
      productKeys: [...existing, input.productKey],
    });
  }
  return listUserProductGrants(input).find((g) => g.productKey === input.productKey)!;
}

/** Effective product keys for shell / API (org ∩ user ∩ available|coming_soon for nav stubs). */
export function resolveEffectiveProductKeys(input: {
  readonly organisationId: string;
  readonly userId: string;
}): readonly ProductKey[] {
  const orgKeys = new Set(
    listOrgProductSubscriptions(input.organisationId).map((s) => s.productKey),
  );
  const userKeys = listUserProductGrants(input).map((g) => g.productKey);
  return userKeys.filter((key) => {
    if (!orgKeys.has(key)) return false;
    const product = getProduct(key);
    if (!product) return false;
    // Available products gate APIs; coming_soon still entitles nav stubs.
    return product.status === "available" || product.status === "coming_soon";
  });
}

export function hasProductAccess(input: {
  readonly organisationId: string;
  readonly userId: string;
  readonly productKey: ProductKey;
}): boolean {
  return resolveEffectiveProductKeys(input).includes(input.productKey);
}

export function startPlanProductSubscriptions(input: {
  readonly organisationId: string;
  readonly planId: PlanId;
  readonly status: OrgProductSubscriptionStatus;
  readonly trialEndsAt?: string;
  readonly grantUserId?: string;
}): {
  readonly subscriptions: readonly OrgProductSubscription[];
  readonly grants: readonly UserProductGrant[];
} {
  const plan = getPlan(input.planId);
  if (!plan) throw new Error("product.plan_unknown");
  const subscriptions = plan.products
    .filter((key) => getProduct(key)?.status === "available")
    .map((productKey) =>
      upsertOrgProductSubscription({
        organisationId: input.organisationId,
        productKey,
        planId: input.planId,
        status: input.status,
        trialEndsAt: input.trialEndsAt,
      }),
    );

  let grants: readonly UserProductGrant[] = [];
  if (input.grantUserId) {
    grants = setUserProductGrants({
      organisationId: input.organisationId,
      userId: input.grantUserId,
      productKeys: subscriptions.map((s) => s.productKey),
    });
  }
  return { subscriptions, grants };
}

export function listTrialSubscriptionsDue(
  now = new Date(),
): readonly OrgProductSubscription[] {
  hydrate();
  const iso = now.toISOString();
  return store.subscriptions.filter(
    (row) =>
      row.status === "trial" && row.trialEndsAt !== undefined && row.trialEndsAt <= iso,
  );
}

export function activateSubscription(
  subscriptionId: string,
): OrgProductSubscription | undefined {
  hydrate();
  const idx = store.subscriptions.findIndex(
    (row) => row.subscriptionId === subscriptionId,
  );
  if (idx < 0) return undefined;
  const current = store.subscriptions[idx]!;
  const updated: OrgProductSubscription = {
    ...current,
    status: "active",
    updatedAt: new Date().toISOString(),
  };
  store.subscriptions[idx] = updated;
  persistAll();
  return updated;
}

export function expireSubscription(
  subscriptionId: string,
): OrgProductSubscription | undefined {
  hydrate();
  const idx = store.subscriptions.findIndex(
    (row) => row.subscriptionId === subscriptionId,
  );
  if (idx < 0) return undefined;
  const current = store.subscriptions[idx]!;
  const updated: OrgProductSubscription = {
    ...current,
    status: "expired",
    updatedAt: new Date().toISOString(),
  };
  store.subscriptions[idx] = updated;
  persistAll();
  return updated;
}

export function cancelSubscription(
  subscriptionId: string,
): OrgProductSubscription | undefined {
  hydrate();
  const idx = store.subscriptions.findIndex(
    (row) => row.subscriptionId === subscriptionId,
  );
  if (idx < 0) return undefined;
  const current = store.subscriptions[idx]!;
  const updated: OrgProductSubscription = {
    ...current,
    status: "cancelled",
    updatedAt: new Date().toISOString(),
  };
  store.subscriptions[idx] = updated;
  persistAll();
  return updated;
}

export function listAllUserProductGrantsForOrg(
  organisationId: string,
): readonly UserProductGrant[] {
  hydrate();
  return store.grants.filter((row) => row.organisationId === organisationId);
}

/**
 * Map workbench nav / view identity → product key or platform (always allowed by product gate).
 */
export function resolveProductKeyFromWorkbenchItem(item: {
  readonly id?: string;
  readonly workspace?: string;
  readonly permission?: string;
  readonly viewId?: string;
}): ProductKey | "platform" {
  const hay = [item.id, item.viewId, item.workspace, item.permission]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (hay.includes("qep") || hay.includes("quality")) return "qep";
  if (
    hay.includes("apzpen") ||
    hay.includes("pentest") ||
    hay.includes("penetration")
  ) {
    return "pentest";
  }
  if (/\bprojects?\b/.test(hay) || hay.includes("plane")) return "projects";
  if (/\btime\b/.test(hay) || hay.includes("kimai")) return "time";
  if (hay.includes("support") || hay.includes("zammad")) return "support";
  if (hay.includes("document") || hay.includes("paperless")) return "documents";
  if (hay.includes("analytics")) return "analytics";
  if (hay.includes("workflow") || hay.includes("automation")) return "workflow";
  if (hay.includes("knowledge")) return "knowledge";
  if (hay.includes("law")) return "law";
  if (hay.includes("monitor") || hay.includes("observe")) return "monitoring";
  return "platform";
}

/** Pure filter for workbench DTO by effective product keys (platform always kept). */
export function filterWorkbenchItemsByProducts<
  T extends {
    id?: string;
    viewId?: string;
    workspace?: string;
    permission?: string;
  },
>(items: readonly T[], allowedProducts: ReadonlySet<ProductKey>): T[] {
  return items.filter((item) => {
    const productKey = resolveProductKeyFromWorkbenchItem(item);
    if (productKey === "platform") return true;
    return allowedProducts.has(productKey);
  });
}
