/**
 * Pending package intent for commerce checkout → ITN provision.
 * File-backed when persist enabled (same pattern as product-access).
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { getPackage } from "@/lib/commercial/catalogue";
import { subscribeOrganisationToPackage } from "@/lib/commercial/provisioning";

type PendingIntent = {
  readonly organisationId: string;
  readonly packageId: string;
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
    if (Array.isArray(parsed.intents)) store = { intents: parsed.intents };
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

export function saveCommercePackageIntent(input: {
  readonly organisationId: string;
  readonly packageId: string;
  readonly planId: string;
  readonly ownerUserId?: string;
  readonly invoiceId?: string;
}): PendingIntent {
  hydrate();
  if (!getPackage(input.packageId)) {
    throw new Error("product.package_unknown");
  }
  const now = new Date().toISOString();
  const next: PendingIntent = {
    organisationId: input.organisationId,
    packageId: input.packageId,
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

export function getCommercePackageIntent(
  organisationId: string,
): PendingIntent | undefined {
  hydrate();
  return store.intents.find((row) => row.organisationId === organisationId);
}

/** Apply pending package subscription for an organisation (ITN / trial start). */
export function applyCommercePackageIntent(organisationId: string): {
  readonly applied: boolean;
  readonly packageId?: string;
} {
  const intent = getCommercePackageIntent(organisationId);
  if (!intent) return { applied: false };
  subscribeOrganisationToPackage({
    organisationId,
    packageId: intent.packageId,
    planId: intent.planId === "plan.individual" ? "plan.individual" : "plan.business",
    status: "active",
    grantUserIds: intent.ownerUserId ? [intent.ownerUserId] : undefined,
  });
  return { applied: true, packageId: intent.packageId };
}
