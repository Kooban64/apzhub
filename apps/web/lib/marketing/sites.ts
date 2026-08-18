/**
 * Multi-site marketing registry — APZHUB hub + product brand sites.
 *
 * Live brand hosts:
 *   apzhub.apzportal.apzor.com     → hub (outcome + funnel)
 *   apzqa.apzportal.apzor.com      → QA (alias apzqep)
 *   apzqep.apzportal.apzor.com     → QA
 *   apzpentest.apzportal.apzor.com → PenTest
 *
 * Future (catalogue + shell when available — one commercial bundle):
 *   Productivity Suite → Projects, Time, Support, Documents
 */

export type MarketingSiteId = "hub" | "qa" | "pentest";

export type MarketingNavLink = {
  readonly href: string;
  readonly label: string;
  readonly description?: string;
  readonly children?: readonly MarketingNavLink[];
};

export type MarketingSiteConfig = {
  readonly id: MarketingSiteId;
  readonly brand: string;
  readonly tagline: string;
  readonly publicHosts: readonly string[];
  /** Internal App Router prefix ("" for hub). */
  readonly pathPrefix: string;
  readonly primaryCta: { readonly href: string; readonly label: string };
  readonly secondaryCta: { readonly href: string; readonly label: string };
  readonly nav: readonly MarketingNavLink[];
};

/** Future APZHUB productivity commercial bundle (not a separate brand host yet). */
export const PRODUCTIVITY_BUNDLE = {
  id: "productivity" as const,
  name: "Productivity Suite",
  status: "coming_soon" as const,
  href: "/productivity",
  description:
    "One workbench bundle for delivery operations — projects, time, support, and documents.",
  products: [
    { key: "projects", name: "Projects", summary: "Delivery boards and workspaces" },
    { key: "time", name: "Time", summary: "Time tracking and utilisation" },
    { key: "support", name: "Support", summary: "Customer care desk" },
    { key: "documents", name: "Documents", summary: "Document workflows and records" },
  ],
} as const;

export const MARKETING_SITES: Record<MarketingSiteId, MarketingSiteConfig> = {
  hub: {
    id: "hub",
    brand: "APZ",
    tagline: "Productivity · Quality · Security",
    publicHosts: ["apzhub.apzportal.apzor.com", "localhost", "127.0.0.1"],
    pathPrefix: "",
    primaryCta: { href: "/register", label: "Get Started" },
    secondaryCta: { href: "/products", label: "Explore Products" },
    nav: [
      { href: "/products", label: "Products" },
      {
        href: "/solutions",
        label: "Solutions",
        children: [
          {
            href: "/products/apzqep",
            label: "APZQEP",
            description: "Quality engineering connected to delivery",
          },
          {
            href: "/products/apzpen",
            label: "APZPEN",
            description: "Professional penetration testing",
          },
          {
            href: "/products/apzprd",
            label: "APZPRD",
            description: "Everyday productivity in one workbench",
          },
        ],
      },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  qa: {
    id: "qa",
    brand: "APZQA",
    tagline: "Independent software quality assurance",
    publicHosts: ["apzqa.apzportal.apzor.com", "apzqep.apzportal.apzor.com"],
    pathPrefix: "/qa",
    primaryCta: { href: "/contact?intent=qa", label: "Get a quote" },
    secondaryCta: { href: "/qa/services", label: "QA services" },
    nav: [
      {
        href: "/qa/services",
        label: "QA Services",
        children: [
          { href: "/qa/services/manual-testing", label: "Manual Testing" },
          { href: "/qa/services/automation-testing", label: "Automation Testing" },
          { href: "/qa/services/performance-testing", label: "Performance Testing" },
          { href: "/qa/services/security-testing", label: "Security Testing" },
          { href: "/qa/services/mobile-testing", label: "Mobile Testing" },
        ],
      },
      { href: "/industries", label: "Industries" },
      { href: "/case-studies", label: "Case Studies" },
      { href: "/pricing", label: "Pricing" },
      { href: "/about", label: "About Us" },
      { href: "/contact?intent=qa", label: "Contact" },
    ],
  },
  pentest: {
    id: "pentest",
    brand: "APZPenTest",
    tagline: "Manual-first penetration testing",
    publicHosts: ["apzpentest.apzportal.apzor.com"],
    pathPrefix: "/pentest",
    primaryCta: { href: "/contact?intent=pentest", label: "Get a quote" },
    secondaryCta: { href: "/pentest/services", label: "Pen test services" },
    nav: [
      {
        href: "/pentest/services",
        label: "Services",
        children: [
          {
            href: "/pentest/services/web-application",
            label: "Web Application Testing",
          },
          {
            href: "/pentest/services/network",
            label: "Network Penetration Testing",
          },
          { href: "/pentest/services/mobile", label: "Mobile App Testing" },
          {
            href: "/pentest/services/cloud",
            label: "Cloud Security Assessment",
          },
          { href: "/pentest/services/red-teaming", label: "Red Teaming" },
        ],
      },
      { href: "/industries", label: "Industries" },
      { href: "/methodology", label: "Methodology" },
      { href: "/case-studies", label: "Case Studies" },
      { href: "/about", label: "About Us" },
      { href: "/contact?intent=pentest", label: "Contact" },
    ],
  },
};

export function resolveMarketingSiteFromHost(
  hostHeader: string | null | undefined,
): MarketingSiteId {
  const host = (hostHeader ?? "").split(":")[0]?.toLowerCase() ?? "";
  if (host.startsWith("apzqa.") || host.startsWith("apzqep.")) return "qa";
  if (host.startsWith("apzpentest.")) return "pentest";
  for (const site of Object.values(MARKETING_SITES)) {
    if (site.id === "hub") continue;
    if (site.publicHosts.some((h) => host === h)) return site.id;
  }
  return "hub";
}

export function getMarketingSite(id: MarketingSiteId): MarketingSiteConfig {
  return MARKETING_SITES[id];
}

export function brandHref(
  siteId: MarketingSiteId,
  path = "/",
  options?: { readonly absolute?: boolean },
): string {
  const site = MARKETING_SITES[siteId];
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (!options?.absolute) {
    if (siteId === "hub") return normalized === "/" ? "/" : normalized;
    if (normalized === "/") return site.pathPrefix || "/";
    return `${site.pathPrefix}${normalized}`;
  }
  const host = site.publicHosts[0];
  if (!host || host === "localhost" || host === "127.0.0.1") {
    return brandHref(siteId, path, { absolute: false });
  }
  const suffix = normalized === "/" ? "" : normalized;
  return `https://${host}${suffix}`;
}
