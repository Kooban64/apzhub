/**
 * Dynamic subscription provisioning — on suite/product change,
 * reconcile org subscriptions, user grants, and module entitlements.
 */

import {
  ALL_SUITE_IDS,
  APZOR_ORGANISATION_ID,
  getPackage,
  getProduct,
  isProductAvailable,
  productKeysForSuite,
  type PackageId,
  type ProductKey,
  type SuiteId,
} from "@/lib/commercial/catalogue";
import {
  cancelSubscription,
  listAllUserProductGrantsForOrg,
  listOrgProductSubscriptions,
  listUserProductGrants,
  setUserProductGrants,
  upsertOrgProductSubscription,
  type OrgProductSubscriptionStatus,
} from "@/lib/commercial/product-access";

export type SubscriptionChangedEvent = {
  readonly organisationId: string;
  readonly suiteIds?: readonly SuiteId[];
  readonly productKeys?: readonly ProductKey[];
  readonly status: OrgProductSubscriptionStatus;
  readonly planId?: "plan.individual" | "plan.business" | "plan.custom";
  readonly grantUserIds?: readonly string[];
  readonly reason?: string;
};

export type ProvisioningResult = {
  readonly organisationId: string;
  readonly subscribedProducts: readonly ProductKey[];
  readonly removedProducts: readonly ProductKey[];
  readonly grantsAdjusted: number;
  readonly moduleIds: readonly string[];
};

function expandSuiteOrProducts(input: SubscriptionChangedEvent): ProductKey[] {
  const keys = new Set<ProductKey>();
  for (const suiteId of input.suiteIds ?? []) {
    for (const key of productKeysForSuite(suiteId)) keys.add(key);
  }
  for (const key of input.productKeys ?? []) keys.add(key);
  return [...keys];
}

/**
 * Apply subscription change: upsert target products, cancel others when
 * suiteIds is provided as the full desired set, reconcile grants.
 */
export function applySubscriptionChanged(
  event: SubscriptionChangedEvent,
): ProvisioningResult {
  const targetKeys = expandSuiteOrProducts(event);
  const planId = event.planId ?? "plan.business";
  const previous = listOrgProductSubscriptions(event.organisationId).map(
    (s) => s.productKey,
  );

  const subscribed: ProductKey[] = [];
  for (const productKey of targetKeys) {
    if (!getProduct(productKey)) continue;
    upsertOrgProductSubscription({
      organisationId: event.organisationId,
      productKey,
      planId,
      status: event.status,
    });
    subscribed.push(productKey);
  }

  const removed: ProductKey[] = [];
  if (event.suiteIds) {
    const desired = new Set(subscribed);
    for (const sub of listOrgProductSubscriptions(event.organisationId)) {
      if (!desired.has(sub.productKey)) {
        cancelSubscription(sub.subscriptionId);
        removed.push(sub.productKey);
      }
    }
  }

  const activeSubscribed = new Set(
    listOrgProductSubscriptions(event.organisationId).map((s) => s.productKey),
  );
  let grantsAdjusted = 0;

  const userIds = new Set<string>(event.grantUserIds ?? []);
  for (const grant of listAllUserProductGrantsForOrg(event.organisationId)) {
    userIds.add(grant.userId);
  }

  for (const userId of userIds) {
    const current = listUserProductGrants({
      organisationId: event.organisationId,
      userId,
    }).map((g) => g.productKey);
    const next = current.filter((key) => activeSubscribed.has(key));
    if (event.grantUserIds?.includes(userId)) {
      for (const key of subscribed) {
        if (isProductAvailable(key) || getProduct(key)?.status === "coming_soon") {
          if (!next.includes(key)) next.push(key);
        }
      }
    }
    const changed =
      next.length !== current.length ||
      next.some((k) => !current.includes(k)) ||
      current.some((k) => !next.includes(k));
    if (changed) {
      setUserProductGrants({
        organisationId: event.organisationId,
        userId,
        productKeys: next,
      });
      grantsAdjusted += 1;
    }
  }

  const moduleIds = [
    ...new Set(
      [...activeSubscribed].flatMap((key) => getProduct(key)?.moduleIds ?? []),
    ),
  ];

  return {
    organisationId: event.organisationId,
    subscribedProducts: [...activeSubscribed],
    removedProducts: removed.length
      ? removed
      : previous.filter((k) => !activeSubscribed.has(k)),
    grantsAdjusted,
    moduleIds,
  };
}

/** Ensure APZOR has all three suites free (active).
 * @deprecated Phase A — APZOR is an ordinary tenant. Prefer
 * `ensureApzorOrdinarySubscriptions`. Opt-in only via
 * `APZHUB_APZOR_ALL_SUITES_FREE=true` (or unit tests).
 */
export function ensureApzorAllSuitesFree(): ProvisioningResult {
  const optIn =
    process.env.APZHUB_APZOR_ALL_SUITES_FREE === "true" ||
    process.env.VITEST === "true" ||
    process.env.NODE_ENV === "test";
  if (!optIn) {
    return ensureApzorOrdinarySubscriptions();
  }
  return applySubscriptionChanged({
    organisationId: APZOR_ORGANISATION_ID,
    suiteIds: ALL_SUITE_IDS,
    status: "active",
    planId: "plan.custom",
    reason: "apzor_internal_all_suites_free",
  });
}

/**
 * Ordinary APZOR tenant subscriptions (Stream 6) — named packages, not free-all.
 */
export function ensureApzorOrdinarySubscriptions(): ProvisioningResult {
  subscribeOrganisationToPackage({
    organisationId: APZOR_ORGANISATION_ID,
    packageId: "pkg.apzprd.service",
    planId: "plan.business",
  });
  subscribeOrganisationToPackage({
    organisationId: APZOR_ORGANISATION_ID,
    packageId: "pkg.apzprd.time",
    planId: "plan.business",
  });
  subscribeOrganisationToPackage({
    organisationId: APZOR_ORGANISATION_ID,
    packageId: "pkg.apzprd.projects",
    planId: "plan.business",
  });
  // Developer vertical — QEP + PEN on ordinary packages (not free-all).
  subscribeOrganisationToPackage({
    organisationId: APZOR_ORGANISATION_ID,
    packageId: "pkg.apzqep.starter",
    planId: "plan.business",
  });
  subscribeOrganisationToPackage({
    organisationId: APZOR_ORGANISATION_ID,
    packageId: "pkg.apzpen.starter",
    planId: "plan.business",
  });
  // Finance vertical — analytics / workflow / documents via delivery + operations packages.
  subscribeOrganisationToPackage({
    organisationId: APZOR_ORGANISATION_ID,
    packageId: "pkg.apzprd.delivery",
    planId: "plan.business",
  });
  subscribeOrganisationToPackage({
    organisationId: APZOR_ORGANISATION_ID,
    packageId: "pkg.apzprd.operations",
    planId: "plan.business",
  });
  subscribeOrganisationToPackage({
    organisationId: APZOR_ORGANISATION_ID,
    packageId: "pkg.apzprd.workspace",
    planId: "plan.business",
  });
  const subscribedProducts = [
    ...new Set(
      listOrgProductSubscriptions(APZOR_ORGANISATION_ID).map((s) => s.productKey),
    ),
  ];
  return {
    organisationId: APZOR_ORGANISATION_ID,
    subscribedProducts,
    removedProducts: [],
    grantsAdjusted: 0,
    moduleIds: [
      ...new Set(subscribedProducts.flatMap((key) => getProduct(key)?.moduleIds ?? [])),
    ],
  };
}

export function subscribeOrganisationToSuites(input: {
  readonly organisationId: string;
  readonly suiteIds: readonly SuiteId[];
  readonly status?: OrgProductSubscriptionStatus;
  readonly planId?: "plan.individual" | "plan.business" | "plan.custom";
  readonly grantUserIds?: readonly string[];
}): ProvisioningResult {
  return applySubscriptionChanged({
    organisationId: input.organisationId,
    suiteIds: input.suiteIds,
    status: input.status ?? "active",
    planId: input.planId ?? "plan.business",
    grantUserIds: input.grantUserIds,
  });
}

/**
 * Subscribe a tenant to a named commercial package (invoice line).
 * Additive: expands package → product modules without removing other pillars.
 */
export function subscribeOrganisationToPackage(input: {
  readonly organisationId: string;
  readonly packageId: PackageId | string;
  readonly status?: OrgProductSubscriptionStatus;
  readonly planId?: "plan.individual" | "plan.business" | "plan.custom";
  readonly grantUserIds?: readonly string[];
}): ProvisioningResult {
  const pkg = getPackage(input.packageId);
  if (!pkg) {
    throw new Error("product.package_unknown");
  }
  return applySubscriptionChanged({
    organisationId: input.organisationId,
    productKeys: pkg.productKeys,
    status: input.status ?? "active",
    planId: input.planId ?? "plan.business",
    grantUserIds: input.grantUserIds,
    reason: `package:${pkg.packageId}`,
  });
}
