/**
 * Platform Admin — Products catalogue (commercial / capability surface).
 */

import { SUITE_CATALOGUE, getProduct, type SuiteId } from "@/lib/commercial/catalogue";
import {
  listAllOrgProductSubscriptionsDurable,
  listAllUserProductGrantsDurable,
} from "@/lib/commercial/product-access-durable";
import { PLATFORM_ADMIN_BASE } from "@/lib/platform-admin/nav";
import type { TenantListField } from "@/lib/platform-admin/tenants-types";

export type PlatformProductSuiteCard = {
  readonly suiteId: SuiteId;
  readonly section: string;
  readonly brand: string;
  readonly tagline: string;
  readonly catalogueStatus: string;
  readonly tenants: TenantListField<number>;
  readonly users: TenantListField<number>;
  readonly href: string;
};

export type PlatformProductsPayload = {
  readonly generatedAt: string;
  readonly suites: readonly PlatformProductSuiteCard[];
  readonly note: string;
};

export type PlatformProductDetailPayload = {
  readonly generatedAt: string;
  readonly suiteId: SuiteId;
  readonly brand: string;
  readonly tagline: string;
  readonly catalogueStatus: string;
  readonly tenants: TenantListField<number>;
  readonly users: TenantListField<number>;
  readonly capabilities: readonly {
    readonly productKey: string;
    readonly label: string;
    readonly status: "available" | "coming_soon" | "not_in_catalogue";
  }[];
  readonly tabs: readonly string[];
};

const SECTION: Record<SuiteId, string> = {
  qa: "QUALITY",
  pentest: "SECURITY",
  productivity: "PRODUCTIVITY",
  law: "LAW",
};

const BRAND: Record<SuiteId, string> = {
  qa: "APZQEP",
  pentest: "APZPEN",
  productivity: "APZPRD",
  law: "APZLaw",
};

const TAGLINE: Record<SuiteId, string> = {
  qa: "Quality Engineering Platform",
  pentest: "Penetration Testing & Security Assurance",
  productivity: "Productivity Platform",
  law: "Law Practice",
};

const SHORT: Record<string, string> = {
  projects: "Projects",
  support: "Support",
  time: "Time",
  workflow: "Workflow",
  analytics: "Analytics",
  knowledge: "Knowledge",
  documents: "Documents",
  qep: "Quality",
  pentest: "Security",
};

function okCount(n: number): TenantListField<number> {
  return { availability: "ok", value: n };
}

export async function buildPlatformAdminProducts(): Promise<PlatformProductsPayload> {
  const [subs, grants] = await Promise.all([
    listAllOrgProductSubscriptionsDurable(),
    listAllUserProductGrantsDurable(),
  ]);

  const display = SUITE_CATALOGUE.filter((s) => s.suiteId !== "law");

  const suites: PlatformProductSuiteCard[] = display.map((suite) => {
    const keys = new Set(suite.productKeys);
    const tenantIds = new Set(
      subs.filter((s) => keys.has(s.productKey)).map((s) => s.organisationId),
    );
    const userIds = new Set(
      grants.filter((g) => keys.has(g.productKey)).map((g) => g.userId),
    );
    return {
      suiteId: suite.suiteId,
      section: SECTION[suite.suiteId],
      brand: BRAND[suite.suiteId],
      tagline: TAGLINE[suite.suiteId],
      catalogueStatus:
        suite.status === "available"
          ? "Available"
          : suite.status === "coming_soon"
            ? "Coming soon"
            : suite.status,
      tenants: okCount(tenantIds.size),
      users: okCount(userIds.size),
      href: `${PLATFORM_ADMIN_BASE}/products/${encodeURIComponent(suite.suiteId)}`,
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    suites,
    note: "Tenant and user counts are derived from durable org subscriptions and user product grants. Licence quotas are not inventable here.",
  };
}

export async function buildPlatformAdminProductDetail(
  suiteId: string,
): Promise<PlatformProductDetailPayload | null> {
  const suite = SUITE_CATALOGUE.find((s) => s.suiteId === suiteId);
  if (!suite || suite.suiteId === "law") return null;

  const [subs, grants] = await Promise.all([
    listAllOrgProductSubscriptionsDurable(),
    listAllUserProductGrantsDurable(),
  ]);
  const keys = new Set(suite.productKeys);
  const tenantIds = new Set(
    subs.filter((s) => keys.has(s.productKey)).map((s) => s.organisationId),
  );
  const userIds = new Set(
    grants.filter((g) => keys.has(g.productKey)).map((g) => g.userId),
  );

  return {
    generatedAt: new Date().toISOString(),
    suiteId: suite.suiteId,
    brand: BRAND[suite.suiteId],
    tagline: TAGLINE[suite.suiteId],
    catalogueStatus:
      suite.status === "available"
        ? "Available"
        : suite.status === "coming_soon"
          ? "Coming soon"
          : suite.status,
    tenants: okCount(tenantIds.size),
    users: okCount(userIds.size),
    capabilities: suite.productKeys.map((productKey) => {
      const product = getProduct(productKey);
      return {
        productKey,
        label: SHORT[productKey] ?? product?.name ?? productKey,
        status:
          product?.status === "available"
            ? ("available" as const)
            : product?.status === "coming_soon"
              ? ("coming_soon" as const)
              : ("not_in_catalogue" as const),
      };
    }),
    tabs: ["overview", "capabilities", "tenants", "configuration"],
  };
}
