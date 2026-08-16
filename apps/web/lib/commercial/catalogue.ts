/**
 * Commercial catalogue — plans, suites, products, and sellable packages.
 * Authority: docs/strategy/commercial/SAAS-COMMERCIAL-MODEL.md (LOCKED).
 * Legacy SKUs retained for addon/capability billing compatibility.
 */

export type CatalogueSkuKind = "org_plan" | "addon" | "individual" | "plan";

export type CatalogueSku = {
  readonly skuId: string;
  readonly name: string;
  readonly kind: CatalogueSkuKind;
  readonly description: string;
  readonly amountCents: number;
  readonly currency: string;
  readonly interval: "month" | "year" | "one_time";
  readonly capabilities: readonly string[];
  readonly active: boolean;
  /** Linked commercial plan id when kind === "plan" */
  readonly planId?: string;
};

export type ProductStatus = "available" | "coming_soon";

export type ProductKey =
  | "qep"
  | "pentest"
  | "projects"
  | "time"
  | "support"
  | "documents"
  | "analytics"
  | "workflow"
  | "knowledge"
  | "law"
  | "monitoring";

export type SuiteId = "qa" | "pentest" | "productivity" | "law";

export type ProductCatalogueEntry = {
  readonly productKey: ProductKey;
  readonly name: string;
  readonly description: string;
  readonly status: ProductStatus;
  /** Maps to Activity Bar module / workspace ids */
  readonly moduleIds: readonly string[];
  /** Commercial suite membership */
  readonly suiteId: SuiteId;
  /** @deprecated use suiteId */
  readonly bundle?: "productivity" | "assurance" | "observability";
};

export type SuiteCatalogueEntry = {
  readonly suiteId: SuiteId;
  readonly name: string;
  readonly description: string;
  readonly productKeys: readonly ProductKey[];
  readonly status: ProductStatus;
};

export type PlanId = "plan.individual" | "plan.business" | "plan.custom";

export type PlanCatalogueEntry = {
  readonly planId: PlanId;
  readonly name: string;
  readonly tagline: string;
  readonly amountCents: number;
  readonly currency: string;
  readonly interval: "month" | "year";
  readonly products: readonly ProductKey[];
  readonly suiteIds: readonly SuiteId[];
  readonly selfServe: boolean;
  readonly trialDays: number;
  readonly seatBased: boolean;
  readonly highlights: readonly string[];
  readonly active: boolean;
};

/** Named commercial packages (invoice lines) — expand to product modules. */
export type PackageId =
  | "pkg.apzprd.projects"
  | "pkg.apzprd.time"
  | "pkg.apzprd.service"
  | "pkg.apzprd.delivery"
  | "pkg.apzprd.operations"
  | "pkg.apzprd.workspace"
  | "pkg.apzpen.starter"
  | "pkg.apzqep.starter"
  | "pkg.law.practice";

export type PackageCatalogueEntry = {
  readonly packageId: PackageId;
  readonly name: string;
  readonly description: string;
  readonly suiteId: SuiteId;
  readonly productKeys: readonly ProductKey[];
  /** Knowledge lite included without separate charge */
  readonly includesKnowledgeLite: boolean;
  readonly status: ProductStatus;
  readonly selfServe: boolean;
};

/** APZOR organisation id — ordinary tenant (Stream 6). Not a platform super-tenant. */
export const APZOR_ORGANISATION_ID =
  process.env.APZOR_ORGANISATION_ID?.trim() || "t0000001-0000-4000-8000-000000000001";

export const SUITE_CATALOGUE: readonly SuiteCatalogueEntry[] = [
  {
    suiteId: "qa",
    name: "Quality Assurance (APZQEP)",
    description: "APZQEP — quality engineering and release confidence.",
    productKeys: ["qep"],
    status: "available",
  },
  {
    suiteId: "pentest",
    name: "Security Assurance (APZPEN)",
    description:
      "APZPEN — engagements, RoE, findings, remediation and certification. Providers underneath.",
    productKeys: ["pentest"],
    status: "available",
  },
  {
    suiteId: "productivity",
    name: "Productivity (APZPRD)",
    description:
      "Composable workspace — Projects, Time, Support, Documents, Analytics, Workflow, Knowledge.",
    productKeys: [
      "projects",
      "time",
      "support",
      "documents",
      "analytics",
      "workflow",
      "knowledge",
    ],
    status: "coming_soon",
  },
  {
    suiteId: "law",
    name: "Law Practice (APZLaw)",
    description:
      "Legal practice / governance product — sellable; also dogfooded by APZOR.",
    productKeys: ["law"],
    status: "coming_soon",
  },
] as const;

export const PRODUCT_CATALOGUE: readonly ProductCatalogueEntry[] = [
  {
    productKey: "qep",
    name: "Quality (APZQEP)",
    description: "Quality OS — dispatch, ingest, certify with human GO / NO-GO.",
    status: "available",
    moduleIds: ["qep", "qep-quality-flows"],
    suiteId: "qa",
    bundle: "assurance",
  },
  {
    productKey: "pentest",
    name: "APZPEN",
    description:
      "Enterprise Security Assurance — engagements, findings, retest (module: apzpen).",
    status: "available",
    moduleIds: ["apzpen", "pentest"],
    suiteId: "pentest",
  },
  {
    productKey: "projects",
    name: "Projects",
    description: "Project workspaces and delivery boards.",
    status: "available",
    moduleIds: ["projects"],
    suiteId: "productivity",
    bundle: "productivity",
  },
  {
    productKey: "time",
    name: "Time",
    description: "Time tracking and utilisation.",
    status: "available",
    moduleIds: ["time"],
    suiteId: "productivity",
    bundle: "productivity",
  },
  {
    productKey: "support",
    name: "Support",
    description: "Support desk and customer care.",
    status: "available",
    moduleIds: ["support"],
    suiteId: "productivity",
    bundle: "productivity",
  },
  {
    productKey: "documents",
    name: "Documents",
    description: "Document workflows and records.",
    status: "available",
    moduleIds: ["documents"],
    suiteId: "productivity",
    bundle: "productivity",
  },
  {
    productKey: "analytics",
    name: "Analytics",
    description: "Cross-product analytics and reporting.",
    status: "available",
    moduleIds: ["analytics"],
    suiteId: "productivity",
    bundle: "observability",
  },
  {
    productKey: "workflow",
    name: "Workflow",
    description: "Cross-product automation and orchestration.",
    status: "available",
    moduleIds: ["workflow", "automation"],
    suiteId: "productivity",
    bundle: "productivity",
  },
  {
    productKey: "knowledge",
    name: "Knowledge",
    description: "Knowledge base and discovery (lite included with APZPRD packages).",
    status: "available",
    moduleIds: ["knowledge"],
    suiteId: "productivity",
    bundle: "productivity",
  },
  {
    productKey: "law",
    name: "APZLaw",
    description: "Legal practice / matter governance product.",
    status: "coming_soon",
    moduleIds: ["law", "law-platform"],
    suiteId: "law",
  },
  {
    productKey: "monitoring",
    name: "Monitoring",
    description: "Observability and health operations (ops-facing).",
    status: "coming_soon",
    moduleIds: ["monitoring"],
    suiteId: "productivity",
    bundle: "observability",
  },
] as const;

export const PACKAGE_CATALOGUE: readonly PackageCatalogueEntry[] = [
  {
    packageId: "pkg.apzprd.projects",
    name: "APZPRD Projects",
    description: "Projects workspaces only — first sellable APZPRD slice.",
    suiteId: "productivity",
    productKeys: ["projects"],
    includesKnowledgeLite: false,
    status: "available",
    selfServe: true,
  },
  {
    packageId: "pkg.apzprd.time",
    name: "APZPRD Time",
    description: "Time tracking with Knowledge lite.",
    suiteId: "productivity",
    productKeys: ["time", "knowledge"],
    includesKnowledgeLite: true,
    status: "coming_soon",
    selfServe: true,
  },
  {
    packageId: "pkg.apzprd.service",
    name: "APZPRD Service",
    description: "Support desk with Knowledge.",
    suiteId: "productivity",
    productKeys: ["support", "knowledge"],
    includesKnowledgeLite: true,
    status: "coming_soon",
    selfServe: true,
  },
  {
    packageId: "pkg.apzprd.delivery",
    name: "APZPRD Delivery",
    description: "Projects, Time, Knowledge, Analytics.",
    suiteId: "productivity",
    productKeys: ["projects", "time", "knowledge", "analytics"],
    includesKnowledgeLite: true,
    status: "coming_soon",
    selfServe: true,
  },
  {
    packageId: "pkg.apzprd.operations",
    name: "APZPRD Operations",
    description: "Support, Projects, Workflow, Analytics, Knowledge.",
    suiteId: "productivity",
    productKeys: ["support", "projects", "workflow", "analytics", "knowledge"],
    includesKnowledgeLite: true,
    status: "coming_soon",
    selfServe: false,
  },
  {
    packageId: "pkg.apzprd.workspace",
    name: "APZPRD Workspace",
    description: "Full productivity module set.",
    suiteId: "productivity",
    productKeys: [
      "projects",
      "time",
      "support",
      "documents",
      "analytics",
      "workflow",
      "knowledge",
    ],
    includesKnowledgeLite: true,
    status: "coming_soon",
    selfServe: false,
  },
  {
    packageId: "pkg.apzpen.starter",
    name: "APZPEN Starter",
    description: "Security Assurance core — additive with other pillars.",
    suiteId: "pentest",
    productKeys: ["pentest"],
    includesKnowledgeLite: false,
    status: "available",
    selfServe: true,
  },
  {
    packageId: "pkg.apzqep.starter",
    name: "APZQEP Starter",
    description: "Quality Engineering core — additive with other pillars.",
    suiteId: "qa",
    productKeys: ["qep"],
    includesKnowledgeLite: false,
    status: "available",
    selfServe: true,
  },
  {
    packageId: "pkg.law.practice",
    name: "Law Practice Pack",
    description: "APZLaw with Time + Documents adjacency.",
    suiteId: "law",
    productKeys: ["law", "time", "documents"],
    includesKnowledgeLite: false,
    status: "coming_soon",
    selfServe: false,
  },
] as const;

/** @deprecated prefer PACKAGE_CATALOGUE compositions */
export const PRODUCTIVITY_SUITE_PRODUCT_KEYS = [
  "projects",
  "time",
  "support",
  "documents",
] as const satisfies readonly ProductKey[];

export const ALL_SUITE_IDS = [
  "qa",
  "pentest",
  "productivity",
  "law",
] as const satisfies readonly SuiteId[];

export const PLAN_CATALOGUE: readonly PlanCatalogueEntry[] = [
  {
    planId: "plan.individual",
    name: "Individual",
    tagline: "Solo operators running Quality OS",
    amountCents: 9900,
    currency: "ZAR",
    interval: "month",
    products: ["qep"],
    suiteIds: ["qa"],
    selfServe: true,
    trialDays: 7,
    seatBased: false,
    highlights: ["QEP Quality OS", "7-day card trial", "Personal billing account"],
    active: true,
  },
  {
    planId: "plan.business",
    name: "Business",
    tagline: "Teams with seats and org product grants",
    amountCents: 24900,
    currency: "ZAR",
    interval: "month",
    products: ["qep"],
    suiteIds: ["qa"],
    selfServe: true,
    trialDays: 7,
    seatBased: true,
    highlights: [
      "QEP for the organisation",
      "Seat-based membership",
      "Org Admin product grants",
    ],
    active: true,
  },
  {
    planId: "plan.custom",
    name: "Custom",
    tagline: "Enterprise suite — quote path",
    amountCents: 0,
    currency: "ZAR",
    interval: "month",
    products: [
      "qep",
      "pentest",
      "projects",
      "time",
      "support",
      "documents",
      "analytics",
      "workflow",
      "knowledge",
      "law",
      "monitoring",
    ],
    suiteIds: ["qa", "pentest", "productivity", "law"],
    selfServe: false,
    trialDays: 0,
    seatBased: true,
    highlights: [
      "Full product suite when entitled",
      "Custom contracts & SSO",
      "Sales-assisted onboarding",
    ],
    active: true,
  },
] as const;

/** Legacy / addon SKUs (capability billing). */
export const CATALOGUE_SKUS: readonly CatalogueSku[] = [
  {
    skuId: "sku.plan.individual",
    name: "Individual",
    kind: "plan",
    planId: "plan.individual",
    description: "Individual plan monthly subscription.",
    amountCents: 9900,
    currency: "ZAR",
    interval: "month",
    capabilities: ["cap.org.core", "cap.qep.basic"],
    active: true,
  },
  {
    skuId: "sku.plan.business",
    name: "Business",
    kind: "plan",
    planId: "plan.business",
    description: "Business plan monthly subscription.",
    amountCents: 24900,
    currency: "ZAR",
    interval: "month",
    capabilities: ["cap.org.core", "cap.qep.basic", "cap.qep.advanced"],
    active: true,
  },
  {
    skuId: "sku.org.team",
    name: "Team",
    kind: "org_plan",
    description: "Organisation team plan with seats and core workspaces.",
    amountCents: 14900,
    currency: "ZAR",
    interval: "month",
    capabilities: ["cap.org.core", "cap.qep.basic"],
    active: true,
  },
  {
    skuId: "sku.org.enterprise",
    name: "Enterprise",
    kind: "org_plan",
    description: "Enterprise organisation plan with advanced controls.",
    amountCents: 49900,
    currency: "ZAR",
    interval: "month",
    capabilities: [
      "cap.org.core",
      "cap.qep.basic",
      "cap.qep.advanced",
      "cap.billing.invoice",
    ],
    active: true,
  },
  {
    skuId: "sku.qep.pentest",
    name: "Pen-Test Pack",
    kind: "individual",
    description: "Pen-test verification pack subscription (direct APZHUB SKU).",
    amountCents: 9900,
    currency: "ZAR",
    interval: "month",
    capabilities: ["cap.qep.pentest"],
    active: true,
  },
  {
    skuId: "sku.qep.qa-report",
    name: "QA Report Subscription",
    kind: "individual",
    description: "QA report pack publish / subscription (direct APZHUB SKU).",
    amountCents: 7900,
    currency: "ZAR",
    interval: "month",
    capabilities: ["cap.qep.qa_report"],
    active: true,
  },
] as const;

export function listCatalogueSkus(filter?: {
  readonly activeOnly?: boolean;
}): readonly CatalogueSku[] {
  const activeOnly = filter?.activeOnly ?? true;
  return CATALOGUE_SKUS.filter((sku) => (activeOnly ? sku.active : true));
}

export function getCatalogueSku(skuId: string): CatalogueSku | undefined {
  return CATALOGUE_SKUS.find((sku) => sku.skuId === skuId);
}

export function listPlans(filter?: {
  readonly activeOnly?: boolean;
}): readonly PlanCatalogueEntry[] {
  const activeOnly = filter?.activeOnly ?? true;
  return PLAN_CATALOGUE.filter((plan) => (activeOnly ? plan.active : true));
}

export function getPlan(planId: string): PlanCatalogueEntry | undefined {
  return PLAN_CATALOGUE.find((plan) => plan.planId === planId);
}

export function listProducts(): readonly ProductCatalogueEntry[] {
  return PRODUCT_CATALOGUE;
}

export function getProduct(productKey: string): ProductCatalogueEntry | undefined {
  return PRODUCT_CATALOGUE.find((p) => p.productKey === productKey);
}

export function isProductAvailable(productKey: string): boolean {
  return getProduct(productKey)?.status === "available";
}

export function listSuites(): readonly SuiteCatalogueEntry[] {
  return SUITE_CATALOGUE;
}

export function getSuite(suiteId: string): SuiteCatalogueEntry | undefined {
  return SUITE_CATALOGUE.find((s) => s.suiteId === suiteId);
}

export function productKeysForSuite(suiteId: SuiteId): readonly ProductKey[] {
  return getSuite(suiteId)?.productKeys ?? [];
}

export function suiteIdForProduct(productKey: ProductKey): SuiteId | undefined {
  return getProduct(productKey)?.suiteId;
}

export function moduleIdsForProductKeys(
  productKeys: readonly ProductKey[],
): readonly string[] {
  const ids = new Set<string>();
  for (const key of productKeys) {
    const product = getProduct(key);
    if (!product) continue;
    for (const id of product.moduleIds) ids.add(id);
  }
  return [...ids];
}

/** Public-safe catalogue subset for marketing / pricing pages. */
export function getPublicCatalogue() {
  return {
    plans: listPlans({ activeOnly: true }).map((plan) => ({
      planId: plan.planId,
      name: plan.name,
      tagline: plan.tagline,
      amountCents: plan.amountCents,
      currency: plan.currency,
      interval: plan.interval,
      products: plan.products,
      suiteIds: plan.suiteIds,
      selfServe: plan.selfServe,
      trialDays: plan.trialDays,
      seatBased: plan.seatBased,
      highlights: plan.highlights,
    })),
    products: listProducts().map((product) => ({
      productKey: product.productKey,
      name: product.name,
      description: product.description,
      status: product.status,
      suiteId: product.suiteId,
      bundle: product.bundle,
    })),
    suites: listSuites().map((suite) => ({
      suiteId: suite.suiteId,
      name: suite.name,
      description: suite.description,
      productKeys: suite.productKeys,
      status: suite.status,
    })),
    productivitySuite: {
      status: "coming_soon" as const,
      productKeys: [
        "projects",
        "time",
        "support",
        "documents",
        "analytics",
        "workflow",
        "knowledge",
      ] as const,
    },
    packages: listPackages({ activeOnly: false }).map((pkg) => ({
      packageId: pkg.packageId,
      name: pkg.name,
      description: pkg.description,
      suiteId: pkg.suiteId,
      productKeys: pkg.productKeys,
      status: pkg.status,
      selfServe: pkg.selfServe,
      includesKnowledgeLite: pkg.includesKnowledgeLite,
    })),
  };
}

export function listPackages(filter?: {
  readonly activeOnly?: boolean;
}): readonly PackageCatalogueEntry[] {
  const activeOnly = filter?.activeOnly ?? false;
  return PACKAGE_CATALOGUE.filter((pkg) =>
    activeOnly ? pkg.status === "available" : true,
  );
}

export function getPackage(packageId: string): PackageCatalogueEntry | undefined {
  return PACKAGE_CATALOGUE.find((p) => p.packageId === packageId);
}

export function productKeysForPackage(
  packageId: PackageId | string,
): readonly ProductKey[] {
  return getPackage(packageId)?.productKeys ?? [];
}

export function isPackageId(value: string): value is PackageId {
  return PACKAGE_CATALOGUE.some((p) => p.packageId === value);
}

export function skuIdForPlan(planId: PlanId): string | undefined {
  return CATALOGUE_SKUS.find((sku) => sku.planId === planId)?.skuId;
}
