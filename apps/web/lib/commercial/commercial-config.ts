/**
 * Durable commercial control plane — extends the catalogue price overlay.
 * Does not invent Owner launch prices. Draft is never customer-visible.
 */

import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  getPackage,
  getPlan,
  listPackages,
  listPlans,
} from "@/lib/commercial/catalogue";

export type PricingUnit =
  | "per_user"
  | "per_agent"
  | "per_engineer"
  | "per_practitioner"
  | "per_collaborator"
  | "per_organisation"
  | "contact_sales";

export type CommercialRegionId = "GLOBAL" | "AFRICA" | "SOUTH_AFRICA" | string;

export type RegionalStrategy = "fixed" | "percentage_from_parent";

export type CatalogueAvailability =
  "available" | "coming_soon" | "contact_sales" | "hidden";

export type ItemPrice = {
  readonly amountCents: number | null;
  readonly currency: string;
  readonly annualAmountCents: number | null;
  readonly annualDiscountBps: number | null;
};

export type ItemCommercialState = {
  readonly packageId: string;
  readonly displayName?: string;
  readonly description?: string;
  readonly status?: CatalogueAvailability;
  readonly pricingUnit: PricingUnit;
  readonly draft: Readonly<Record<string, ItemPrice>>;
  readonly published: Readonly<Record<string, ItemPrice>>;
  readonly scheduled?: {
    readonly effectiveFrom: string;
    readonly published: Readonly<Record<string, ItemPrice>>;
  };
};

export type RegionConfig = {
  readonly regionId: string;
  readonly name: string;
  readonly countryCodes: readonly string[];
  readonly currency: string;
  readonly strategy: RegionalStrategy;
  readonly parentRegionId: string | null;
  readonly adjustmentBps: number | null;
  readonly status: "active" | "inactive";
};

export type TaxRule = {
  readonly taxRuleId: string;
  readonly countryCode: string;
  readonly name: string;
  readonly rateBps: number;
  readonly pricesExclusive: boolean;
  readonly status: "draft" | "published";
};

export type PlanCommercialState = {
  readonly planId: string;
  readonly status?: "active" | "contact_sales" | "hidden";
  readonly draft?: {
    readonly amountCents: number | null;
    readonly currency: string;
    readonly trialDays: number | null;
    readonly annualEnabled: boolean;
    readonly annualDiscountBps: number | null;
    readonly annualAmountCents: number | null;
  };
  readonly published?: {
    readonly amountCents: number | null;
    readonly currency: string;
    readonly trialDays: number | null;
    readonly annualEnabled: boolean;
    readonly annualDiscountBps: number | null;
    readonly annualAmountCents: number | null;
  };
};

export type DiscountRule = {
  readonly discountId: string;
  readonly kind: "regional" | "annual" | "promotional" | "manual";
  readonly name: string;
  readonly code?: string;
  readonly adjustmentBps?: number | null;
  readonly amountCents?: number | null;
  readonly status: "draft" | "published";
};

export type PriceChangeRecord = {
  readonly id: string;
  readonly occurredAt: string;
  readonly actorUserId: string;
  readonly action: string;
  readonly itemId: string;
  readonly regionId?: string;
  readonly from: unknown;
  readonly to: unknown;
  readonly reason: string;
};

export type SubscriptionRepricePolicy =
  "new_customers_only" | "next_renewal" | "immediately";

export type CommercialControlPlane = {
  readonly regions: readonly RegionConfig[];
  readonly items: Readonly<Record<string, ItemCommercialState>>;
  readonly plans: Readonly<Record<string, PlanCommercialState>>;
  readonly taxRules: readonly TaxRule[];
  readonly discounts: readonly DiscountRule[];
  readonly history: readonly PriceChangeRecord[];
  readonly quoteTtlMs: number;
  readonly subscriptionRepricePolicy: SubscriptionRepricePolicy;
};

export type CataloguePriceOverlay = {
  readonly version: 1 | 2;
  readonly packages: Record<string, number>;
  readonly products: Record<string, number>;
  readonly plane?: CommercialControlPlane;
};

const AFRICA_COUNTRY_CODES = [
  "DZ",
  "AO",
  "BJ",
  "BW",
  "BF",
  "BI",
  "CM",
  "CV",
  "CF",
  "TD",
  "KM",
  "CG",
  "CD",
  "CI",
  "DJ",
  "EG",
  "GQ",
  "ER",
  "SZ",
  "ET",
  "GA",
  "GM",
  "GH",
  "GN",
  "GW",
  "KE",
  "LS",
  "LR",
  "LY",
  "MG",
  "MW",
  "ML",
  "MR",
  "MU",
  "MA",
  "MZ",
  "NA",
  "NE",
  "NG",
  "RW",
  "ST",
  "SN",
  "SC",
  "SL",
  "SO",
  "ZA",
  "SS",
  "SD",
  "TZ",
  "TG",
  "TN",
  "UG",
  "ZM",
  "ZW",
] as const;

const DEFAULT_UNITS: Record<string, PricingUnit> = {
  "pkg.apzprd.projects": "per_user",
  "pkg.apzprd.time": "per_user",
  "pkg.apzprd.service": "per_agent",
  "pkg.apzprd.workflow": "per_user",
  "pkg.apzprd.analytics": "per_user",
  "pkg.apzprd.knowledge": "per_user",
  "pkg.apzprd.documents": "per_user",
  "pkg.apzprd.delivery": "per_user",
  "pkg.apzprd.operations": "per_user",
  "pkg.apzprd.workspace": "per_user",
  "pkg.apzqep.starter": "per_engineer",
  "pkg.apzqep.collaborator": "per_collaborator",
  "pkg.apzpen.starter": "per_practitioner",
  "pkg.apzpen.collaborator": "per_collaborator",
  "pkg.law.practice": "contact_sales",
};

export function defaultRegions(): readonly RegionConfig[] {
  return [
    {
      regionId: "GLOBAL",
      name: "Global",
      countryCodes: [],
      currency: "USD",
      strategy: "fixed",
      parentRegionId: null,
      adjustmentBps: null,
      status: "active",
    },
    {
      regionId: "AFRICA",
      name: "Africa",
      countryCodes: AFRICA_COUNTRY_CODES,
      currency: "USD",
      strategy: "percentage_from_parent",
      parentRegionId: "GLOBAL",
      adjustmentBps: null,
      status: "active",
    },
    {
      regionId: "SOUTH_AFRICA",
      name: "South Africa",
      countryCodes: ["ZA"],
      currency: "ZAR",
      strategy: "fixed",
      parentRegionId: "AFRICA",
      adjustmentBps: null,
      status: "active",
    },
  ];
}

function emptyPlane(): CommercialControlPlane {
  return {
    regions: defaultRegions(),
    items: {},
    plans: {},
    taxRules: [],
    discounts: [],
    history: [],
    quoteTtlMs: 30 * 60 * 1000,
    subscriptionRepricePolicy: "new_customers_only",
  };
}

const emptyOverlay = (): CataloguePriceOverlay => ({
  version: 2,
  packages: {},
  products: {},
  plane: emptyPlane(),
});

let overlay: CataloguePriceOverlay = emptyOverlay();
let hydrated = false;

function persistEnabled(): boolean {
  if (process.env.APZHUB_FORCE_COMMERCE_PERSIST === "1") return true;
  if (process.env.VITEST === "true" || process.env.NODE_ENV === "test") return false;
  return true;
}

/** Owner staging only — flush in-memory control plane to disk without publishing. */
export function persistCommercialConfigForStaging(): void {
  mkdirSync(dataDir(), { recursive: true });
  writeFileSync(
    join(dataDir(), "overlay.json"),
    JSON.stringify(overlay, null, 2),
    "utf8",
  );
}

function dataDir(): string {
  const override = process.env.APZHUB_COMMERCE_DATA_DIR?.trim();
  if (override) return join(override, "catalogue-prices");
  const cwd = process.cwd();
  const base =
    cwd.endsWith("/apps/web") || cwd.endsWith("\\apps/web")
      ? join(cwd, ".data")
      : join(cwd, "apps/web/.data");
  return join(base, "catalogue-prices");
}

function mergePlane(
  parsed: Partial<CommercialControlPlane> | undefined,
): CommercialControlPlane {
  const base = emptyPlane();
  if (!parsed) return base;
  return {
    regions:
      Array.isArray(parsed.regions) && parsed.regions.length > 0
        ? parsed.regions
        : base.regions,
    items: parsed.items ?? {},
    plans: parsed.plans ?? {},
    taxRules: parsed.taxRules ?? [],
    discounts: parsed.discounts ?? [],
    history: parsed.history ?? [],
    quoteTtlMs: parsed.quoteTtlMs ?? base.quoteTtlMs,
    subscriptionRepricePolicy: parsed.subscriptionRepricePolicy ?? "new_customers_only",
  };
}

export function hydrateCommercialConfig(): void {
  if (hydrated) return;
  hydrated = true;
  try {
    const raw = readFileSync(join(dataDir(), "overlay.json"), "utf8");
    const parsed = JSON.parse(raw) as CataloguePriceOverlay;
    overlay = {
      version: 2,
      packages: parsed.packages ?? {},
      products: parsed.products ?? {},
      plane: mergePlane(parsed.plane),
    };
  } catch {
    overlay = emptyOverlay();
  }
}

function persistAll(): void {
  if (!persistEnabled()) return;
  mkdirSync(dataDir(), { recursive: true });
  writeFileSync(
    join(dataDir(), "overlay.json"),
    JSON.stringify(overlay, null, 2),
    "utf8",
  );
}

function mutate(next: CataloguePriceOverlay): void {
  overlay = next;
  persistAll();
}

export function resetCataloguePriceOverlayForTests(): void {
  overlay = emptyOverlay();
  // Keep hydrated=true so tests do not re-load production disk overlay.
  hydrated = true;
}

export function getCataloguePriceOverlay(): CataloguePriceOverlay {
  hydrateCommercialConfig();
  return overlay;
}

export function getCommercialPlane(): CommercialControlPlane {
  hydrateCommercialConfig();
  return overlay.plane ?? emptyPlane();
}

function replacePlane(plane: CommercialControlPlane): void {
  hydrateCommercialConfig();
  mutate({ ...overlay, version: 2, plane });
}

export function defaultPricingUnit(packageId: string): PricingUnit {
  return DEFAULT_UNITS[packageId] ?? "per_organisation";
}

export function emptyItemPrice(currency: string): ItemPrice {
  return {
    amountCents: null,
    currency,
    annualAmountCents: null,
    annualDiscountBps: null,
  };
}

export function getOrInitItem(packageId: string): ItemCommercialState {
  hydrateCommercialConfig();
  if (!getPackage(packageId)) throw new Error("product.package_unknown");
  const existing = overlay.plane?.items[packageId];
  if (existing) return existing;
  return {
    packageId,
    pricingUnit: defaultPricingUnit(packageId),
    draft: {},
    published: {},
  };
}

function appendHistory(
  entry: Omit<PriceChangeRecord, "id" | "occurredAt">,
): PriceChangeRecord {
  const record: PriceChangeRecord = {
    id: `px-${randomUUID()}`,
    occurredAt: new Date().toISOString(),
    ...entry,
  };
  const plane = getCommercialPlane();
  replacePlane({
    ...plane,
    history: [record, ...plane.history].slice(0, 2000),
  });
  return record;
}

export function requireChangeReason(reason: string | undefined): string {
  const trimmed = reason?.trim() ?? "";
  if (trimmed.length < 3) throw new Error("commerce.change_reason_required");
  return trimmed;
}

export function listRegions(): readonly RegionConfig[] {
  return getCommercialPlane().regions;
}

export function getRegion(regionId: string): RegionConfig | undefined {
  return listRegions().find((row) => row.regionId === regionId);
}

export function upsertRegion(
  region: RegionConfig,
  actorUserId: string,
  reason: string,
): RegionConfig {
  const why = requireChangeReason(reason);
  const plane = getCommercialPlane();
  const prev = plane.regions.find((row) => row.regionId === region.regionId);
  const regions = plane.regions.some((row) => row.regionId === region.regionId)
    ? plane.regions.map((row) => (row.regionId === region.regionId ? region : row))
    : [...plane.regions, region];
  replacePlane({ ...plane, regions });
  appendHistory({
    actorUserId,
    action: "regional.price.changed",
    itemId: region.regionId,
    from: prev ?? null,
    to: region,
    reason: why,
  });
  return region;
}

export function setItemDraftPrice(input: {
  readonly packageId: string;
  readonly regionId: string;
  readonly price: ItemPrice;
  readonly pricingUnit?: PricingUnit;
  readonly status?: CatalogueAvailability;
  readonly displayName?: string;
  readonly description?: string;
  readonly actorUserId: string;
  readonly reason: string;
}): ItemCommercialState {
  const why = requireChangeReason(input.reason);
  if (!getRegion(input.regionId)) throw new Error("commerce.region_unknown");
  if (input.price.amountCents != null) {
    if (!Number.isFinite(input.price.amountCents) || input.price.amountCents < 0) {
      throw new Error("billing.price_invalid");
    }
  }
  if (input.price.annualAmountCents != null && input.price.annualDiscountBps != null) {
    throw new Error("commerce.annual_price_ambiguous");
  }
  const current = getOrInitItem(input.packageId);
  const next: ItemCommercialState = {
    ...current,
    displayName: input.displayName ?? current.displayName,
    description: input.description ?? current.description,
    status: input.status ?? current.status,
    pricingUnit: input.pricingUnit ?? current.pricingUnit,
    draft: {
      ...current.draft,
      [input.regionId]: {
        amountCents:
          input.price.amountCents == null ? null : Math.floor(input.price.amountCents),
        currency: input.price.currency,
        annualAmountCents:
          input.price.annualAmountCents == null
            ? null
            : Math.floor(input.price.annualAmountCents),
        annualDiscountBps:
          input.price.annualDiscountBps == null
            ? null
            : Math.floor(input.price.annualDiscountBps),
      },
    },
  };
  const plane = getCommercialPlane();
  replacePlane({
    ...plane,
    items: { ...plane.items, [input.packageId]: next },
  });
  appendHistory({
    actorUserId: input.actorUserId,
    action: "catalogue.price.changed",
    itemId: input.packageId,
    regionId: input.regionId,
    from: current.draft[input.regionId] ?? null,
    to: next.draft[input.regionId],
    reason: why,
  });
  return next;
}

export function setItemAvailability(input: {
  readonly packageId: string;
  readonly status: CatalogueAvailability;
  readonly actorUserId: string;
  readonly reason: string;
}): ItemCommercialState {
  const why = requireChangeReason(input.reason);
  const current = getOrInitItem(input.packageId);
  const next: ItemCommercialState = { ...current, status: input.status };
  const plane = getCommercialPlane();
  replacePlane({
    ...plane,
    items: { ...plane.items, [input.packageId]: next },
  });
  appendHistory({
    actorUserId: input.actorUserId,
    action: "catalogue.availability.changed",
    itemId: input.packageId,
    from: current.status ?? null,
    to: input.status,
    reason: why,
  });
  return next;
}

export function publishItemRegion(input: {
  readonly packageId: string;
  readonly regionId?: string;
  readonly actorUserId: string;
  readonly reason: string;
  readonly effectiveFrom?: string | null;
}): ItemCommercialState {
  const why = requireChangeReason(input.reason);
  const current = getOrInitItem(input.packageId);
  const regionIds = input.regionId ? [input.regionId] : Object.keys(current.draft);
  let published = { ...current.published };
  for (const regionId of regionIds) {
    const draft = current.draft[regionId];
    if (draft) published = { ...published, [regionId]: draft };
  }
  const effectiveFrom = input.effectiveFrom?.trim() || null;
  const scheduled =
    effectiveFrom && new Date(effectiveFrom).getTime() > Date.now()
      ? { effectiveFrom, published }
      : undefined;
  const next: ItemCommercialState = scheduled
    ? { ...current, scheduled }
    : { ...current, published, scheduled: undefined };
  const plane = getCommercialPlane();
  replacePlane({
    ...plane,
    items: { ...plane.items, [input.packageId]: next },
  });
  if (input.regionId) {
    const legacy = { ...overlay.packages };
    const sa = next.published.SOUTH_AFRICA?.amountCents;
    if (typeof sa === "number") legacy[input.packageId] = sa;
    mutate({ ...overlay, packages: legacy });
  }
  appendHistory({
    actorUserId: input.actorUserId,
    action: "catalogue.price.changed",
    itemId: input.packageId,
    regionId: input.regionId,
    from: current.published,
    to: next.published,
    reason: `publish: ${why}`,
  });
  return getOrInitItem(input.packageId);
}

export function promoteScheduledIfDue(now = new Date()): void {
  const plane = getCommercialPlane();
  let changed = false;
  const items = { ...plane.items };
  for (const [id, item] of Object.entries(items)) {
    if (
      item.scheduled &&
      new Date(item.scheduled.effectiveFrom).getTime() <= now.getTime()
    ) {
      items[id] = {
        ...item,
        published: item.scheduled.published,
        scheduled: undefined,
      };
      changed = true;
    }
  }
  if (changed) replacePlane({ ...plane, items });
}

export function listPriceHistory(itemId?: string): readonly PriceChangeRecord[] {
  const history = getCommercialPlane().history;
  if (!itemId) return history;
  return history.filter((row) => row.itemId === itemId);
}

export function upsertTaxRule(
  rule: Omit<TaxRule, "taxRuleId"> & { taxRuleId?: string },
  actorUserId: string,
  reason: string,
): TaxRule {
  const why = requireChangeReason(reason);
  const plane = getCommercialPlane();
  const taxRuleId = rule.taxRuleId ?? `tax-${randomUUID()}`;
  const next: TaxRule = {
    taxRuleId,
    countryCode: rule.countryCode.toUpperCase(),
    name: rule.name,
    rateBps: Math.floor(rule.rateBps),
    pricesExclusive: rule.pricesExclusive,
    status: rule.status,
  };
  const prev = plane.taxRules.find((row) => row.taxRuleId === taxRuleId);
  const taxRules = prev
    ? plane.taxRules.map((row) => (row.taxRuleId === taxRuleId ? next : row))
    : [...plane.taxRules, next];
  replacePlane({ ...plane, taxRules });
  appendHistory({
    actorUserId,
    action: "tax.changed",
    itemId: taxRuleId,
    from: prev ?? null,
    to: next,
    reason: why,
  });
  return next;
}

export function upsertDiscountRule(
  rule: Omit<DiscountRule, "discountId"> & { discountId?: string },
  actorUserId: string,
  reason: string,
): DiscountRule {
  const why = requireChangeReason(reason);
  const plane = getCommercialPlane();
  const discountId = rule.discountId ?? `disc-${randomUUID()}`;
  const next: DiscountRule = { ...rule, discountId };
  const prev = plane.discounts.find((row) => row.discountId === discountId);
  const discounts = prev
    ? plane.discounts.map((row) => (row.discountId === discountId ? next : row))
    : [...plane.discounts, next];
  replacePlane({ ...plane, discounts });
  appendHistory({
    actorUserId,
    action: "discount.changed",
    itemId: discountId,
    from: prev ?? null,
    to: next,
    reason: why,
  });
  return next;
}

export function upsertPlanState(
  state: PlanCommercialState,
  actorUserId: string,
  reason: string,
): PlanCommercialState {
  const why = requireChangeReason(reason);
  if (!getPlan(state.planId)) throw new Error("product.plan_unknown");
  const plane = getCommercialPlane();
  const prev = plane.plans[state.planId];
  replacePlane({
    ...plane,
    plans: { ...plane.plans, [state.planId]: state },
  });
  appendHistory({
    actorUserId,
    action: "plan.changed",
    itemId: state.planId,
    from: prev ?? null,
    to: state,
    reason: why,
  });
  return state;
}

export function publishPlan(
  planId: string,
  actorUserId: string,
  reason: string,
): PlanCommercialState {
  const why = requireChangeReason(reason);
  const plane = getCommercialPlane();
  const current = plane.plans[planId];
  if (!current?.draft) throw new Error("commerce.plan_draft_missing");
  const next: PlanCommercialState = {
    ...current,
    published: current.draft,
  };
  replacePlane({
    ...plane,
    plans: { ...plane.plans, [planId]: next },
  });
  appendHistory({
    actorUserId,
    action: "plan.changed",
    itemId: planId,
    from: current.published ?? null,
    to: next.published,
    reason: `publish: ${why}`,
  });
  return next;
}

export function setSubscriptionRepricePolicy(
  policy: SubscriptionRepricePolicy,
  actorUserId: string,
  reason: string,
): SubscriptionRepricePolicy {
  const why = requireChangeReason(reason);
  const plane = getCommercialPlane();
  replacePlane({ ...plane, subscriptionRepricePolicy: policy });
  appendHistory({
    actorUserId,
    action: "plan.changed",
    itemId: "subscriptionRepricePolicy",
    from: plane.subscriptionRepricePolicy,
    to: policy,
    reason: why,
  });
  return policy;
}

/** Legacy write — published South Africa monthly, for existing overlay callers/tests. */
export function setPackageListPrice(
  packageId: string,
  amountCents: number | null,
): void {
  hydrateCommercialConfig();
  if (!getPackage(packageId)) throw new Error("product.package_unknown");
  const nextPackages = { ...overlay.packages };
  if (amountCents == null) {
    delete nextPackages[packageId];
  } else {
    if (!Number.isFinite(amountCents) || amountCents < 0) {
      throw new Error("billing.price_invalid");
    }
    nextPackages[packageId] = Math.floor(amountCents);
  }
  mutate({ ...overlay, packages: nextPackages });
  const current = getOrInitItem(packageId);
  const price: ItemPrice = {
    amountCents: amountCents == null ? null : Math.floor(amountCents),
    currency: "ZAR",
    annualAmountCents: null,
    annualDiscountBps: null,
  };
  const plane = getCommercialPlane();
  replacePlane({
    ...plane,
    items: {
      ...plane.items,
      [packageId]: {
        ...current,
        draft: { ...current.draft, SOUTH_AFRICA: price },
        published: { ...current.published, SOUTH_AFRICA: price },
      },
    },
  });
}

export function setProductListPrice(
  productKey: string,
  amountCents: number | null,
): void {
  hydrateCommercialConfig();
  const next = { ...overlay.products };
  if (amountCents == null) {
    delete next[productKey];
  } else {
    if (!Number.isFinite(amountCents) || amountCents < 0) {
      throw new Error("billing.price_invalid");
    }
    next[productKey] = Math.floor(amountCents);
  }
  mutate({ ...overlay, products: next });
}

export function legacyPackageAmount(packageId: string): number | undefined {
  hydrateCommercialConfig();
  return overlay.packages[packageId];
}

export function legacyProductAmount(productKey: string): number | undefined {
  hydrateCommercialConfig();
  return overlay.products[productKey];
}

export function listCatalogueItemsForAdmin(): readonly {
  readonly packageId: string;
  readonly name: string;
  readonly description: string;
  readonly suiteId: string;
  readonly productKeys: readonly string[];
  readonly catalogueStatus: string;
  readonly overlayStatus: CatalogueAvailability | undefined;
  readonly pricingUnit: PricingUnit;
  readonly selfServe: boolean;
}[] {
  return listPackages({ activeOnly: false }).map((pkg) => {
    const item = overlay.plane?.items[pkg.packageId];
    return {
      packageId: pkg.packageId,
      name: item?.displayName ?? pkg.name,
      description: item?.description ?? pkg.description,
      suiteId: pkg.suiteId,
      productKeys: pkg.productKeys,
      catalogueStatus: pkg.status,
      overlayStatus: item?.status,
      pricingUnit: item?.pricingUnit ?? defaultPricingUnit(pkg.packageId),
      selfServe: pkg.selfServe,
    };
  });
}

export function listPlansForAdmin() {
  return listPlans({ activeOnly: false }).map((plan) => {
    const overlayPlan = getCommercialPlane().plans[plan.planId];
    return {
      ...plan,
      overlayStatus: overlayPlan?.status,
      draft: overlayPlan?.draft,
      published: overlayPlan?.published,
    };
  });
}
