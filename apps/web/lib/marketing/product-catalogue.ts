/**
 * Public product catalogue — three commercial disciplines + module detail pages.
 * Capability names only — no provider brands.
 */

export type PublicProductPillar = "quality" | "security" | "productivity";

export type PublicProductEntry = {
  readonly id: string;
  readonly name: string;
  readonly code?: string;
  readonly pillar: PublicProductPillar;
  readonly href: string;
  readonly summary: string;
  readonly packageId?: string;
  /** Suite landing pages vs individual module pages. */
  readonly kind: "suite" | "module";
  readonly modules?: readonly string[];
};

export const PUBLIC_PRODUCT_CATALOGUE: readonly PublicProductEntry[] = [
  {
    id: "apzprd",
    name: "Productivity",
    code: "APZPRD",
    pillar: "productivity",
    href: "/products/apzprd",
    summary: "Bring everyday work into one workspace.",
    packageId: "pkg.apzprd.projects",
    kind: "suite",
    modules: [
      "Projects",
      "Support",
      "Time",
      "Workflow",
      "Analytics",
      "Knowledge",
      "Documents",
    ],
  },
  {
    id: "apzqep",
    name: "Quality Engineering",
    code: "APZQEP",
    pillar: "quality",
    href: "/products/apzqep",
    summary: "Connect testing directly to software delivery.",
    packageId: "pkg.apzqep.starter",
    kind: "suite",
    modules: [
      "Test management",
      "Automation",
      "Runs & results",
      "Evidence",
      "Defects",
      "Release readiness",
      "Source context",
    ],
  },
  {
    id: "apzpen",
    name: "Security Testing",
    code: "APZPEN",
    pillar: "security",
    href: "/products/apzpen",
    summary: "Manage professional penetration testing from scope to closure.",
    packageId: "pkg.apzpen.starter",
    kind: "suite",
    modules: [
      "Engagements",
      "Scope & ROE",
      "Testing",
      "Findings",
      "Evidence",
      "Retesting",
      "Reporting",
    ],
  },
  {
    id: "qep",
    name: "Quality Engineering Platform",
    pillar: "quality",
    href: "/products/apzqep",
    summary: "Release readiness, test evidence, and quality gates.",
    packageId: "pkg.apzqep.starter",
    kind: "module",
  },
  {
    id: "pen",
    name: "Security Assurance",
    pillar: "security",
    href: "/products/apzpen",
    summary: "Penetration testing engagements and security evidence.",
    packageId: "pkg.apzpen.starter",
    kind: "module",
  },
  {
    id: "projects",
    name: "Projects",
    pillar: "productivity",
    href: "/products/projects",
    summary: "Plan and execute work.",
    packageId: "pkg.apzprd.projects",
    kind: "module",
  },
  {
    id: "support",
    name: "Support",
    pillar: "productivity",
    href: "/products/support",
    summary: "Manage customer and internal support.",
    kind: "module",
  },
  {
    id: "time",
    name: "Time",
    pillar: "productivity",
    href: "/products/time",
    summary: "Record and understand time.",
    kind: "module",
  },
  {
    id: "workflow",
    name: "Workflow",
    pillar: "productivity",
    href: "/products/workflow",
    summary: "Automate operational processes.",
    kind: "module",
  },
  {
    id: "analytics",
    name: "Analytics",
    pillar: "productivity",
    href: "/products/analytics",
    summary: "Understand performance.",
    kind: "module",
  },
  {
    id: "knowledge",
    name: "Knowledge",
    pillar: "productivity",
    href: "/products/knowledge",
    summary: "Capture organisational knowledge.",
    kind: "module",
  },
  {
    id: "documents",
    name: "Documents",
    pillar: "productivity",
    href: "/products/documents",
    summary: "Manage working documents.",
    kind: "module",
  },
] as const;

export function getPublicProduct(id: string): PublicProductEntry | undefined {
  return PUBLIC_PRODUCT_CATALOGUE.find((p) => p.id === id);
}

export function listPublicSuites(): readonly PublicProductEntry[] {
  return PUBLIC_PRODUCT_CATALOGUE.filter((p) => p.kind === "suite");
}
