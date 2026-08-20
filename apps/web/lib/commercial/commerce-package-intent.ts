/**
 * Pending commerce basket intent for checkout → ITN provision.
 * File-backed when persist enabled (same pattern as product-access).
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { getPackage } from "@/lib/commercial/catalogue";
import { subscribeOrganisationToPackage } from "@/lib/commercial/provisioning";

type PendingIntent = {
  readonly organisationId: string;
  readonly packageIds: readonly string[];
  readonly planId: string;
  readonly ownerUserId?: string;
  readonly invoiceId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

type Store = { intents: PendingIntent[] };

let store: Store = { intents: [] };
let hydrated = false;

function persistEnabled(): boolean {
  if (process.env.VITEST === "true" || process.env.NODE_ENV === "test") {
    return false;
  }
  return true;
}

function dataDir(): string {
  return (
    process.env.APZHUB_COMMERCE_DATA_DIR?.trim() ||
    join(process.cwd(), ".data", "commerce-intents")
  );
}

function hydrate(): void {
  if (hydrated) return;
  hydrated = true;
  try {
    const raw = readFileSync(join(dataDir(), "ledger.json"), "utf8");
    const parsed = JSON.parse(raw) as Store;
    if (Array.isArray(parsed.intents)) {
      store = {
        intents: parsed.intents.map((row) => {
          const legacy = row as unknown as { packageId?: string };
          return {
            ...row,
            packageIds: Array.isArray(row.packageIds)
              ? row.packageIds
              : legacy.packageId
                ? [legacy.packageId]
                : [],
          };
        }),
      };
    }
  } catch {
    store = { intents: [] };
  }
}

function persistAll(): void {
  if (!persistEnabled()) return;
  mkdirSync(dataDir(), { recursive: true });
  writeFileSync(join(dataDir(), "ledger.json"), JSON.stringify(store, null, 2), "utf8");
}

export function resetCommerceIntentsForTests(): void {
  store = { intents: [] };
  hydrated = false;
}

function validatePackageIds(packageIds: readonly string[]): readonly string[] {
  const ids = [...new Set(packageIds.map((id) => id.trim()).filter(Boolean))];
  if (ids.length === 0) throw new Error("commerce.basket_empty");
  for (const id of ids) {
    if (!getPackage(id)) throw new Error("product.package_unknown");
  }
  return ids;
}

export function saveCommerceBasketIntent(input: {
  readonly organisationId: string;
  readonly packageIds: readonly string[];
  readonly planId: string;
  readonly ownerUserId?: string;
  readonly invoiceId?: string;
}): PendingIntent {
  hydrate();
  const packageIds = validatePackageIds(input.packageIds);
  const now = new Date().toISOString();
  const next: PendingIntent = {
    organisationId: input.organisationId,
    packageIds,
    planId: input.planId,
    ownerUserId: input.ownerUserId,
    invoiceId: input.invoiceId,
    createdAt: now,
    updatedAt: now,
  };
  store.intents = store.intents.filter(
    (row) => row.organisationId !== input.organisationId,
  );
  store.intents.push(next);
  persistAll();
  return next;
}

/** @deprecated use saveCommerceBasketIntent */
export function saveCommercePackageIntent(input: {
  readonly organisationId: string;
  readonly packageId: string;
  readonly planId: string;
  readonly ownerUserId?: string;
  readonly invoiceId?: string;
}): PendingIntent {
  return saveCommerceBasketIntent({
    organisationId: input.organisationId,
    packageIds: [input.packageId],
    planId: input.planId,
    ownerUserId: input.ownerUserId,
    invoiceId: input.invoiceId,
  });
}

export function getCommerceBasketIntent(
  organisationId: string,
): PendingIntent | undefined {
  hydrate();
  return store.intents.find((row) => row.organisationId === organisationId);
}

/** @deprecated use getCommerceBasketIntent */
export function getCommercePackageIntent(
  organisationId: string,
): PendingIntent | undefined {
  return getCommerceBasketIntent(organisationId);
}

/** Apply pending basket subscription for an organisation (ITN only — not trial start). */
export function applyCommerceBasketIntent(organisationId: string): {
  readonly applied: boolean;
  readonly packageIds?: readonly string[];
} {
  const intent = getCommerceBasketIntent(organisationId);
  if (!intent || intent.packageIds.length === 0) return { applied: false };
  const planId =
    intent.planId === "plan.individual" ? "plan.individual" : "plan.business";
  for (const packageId of intent.packageIds) {
    subscribeOrganisationToPackage({
      organisationId,
      packageId,
      planId,
      status: "active",
      // Commercial entitlement only — do not auto-grant users on payment.
      grantUserIds: undefined,
    });
  }
  return { applied: true, packageIds: intent.packageIds };
}

/** @deprecated use applyCommerceBasketIntent */
export function applyCommercePackageIntent(organisationId: string): {
  readonly applied: boolean;
  readonly packageId?: string;
} {
  const result = applyCommerceBasketIntent(organisationId);
  return {
    applied: result.applied,
    packageId: result.packageIds?.[0],
  };
}
