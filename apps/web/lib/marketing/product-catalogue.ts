/**
 * Stream 1 public products catalogue (§11–12, §45).
 * Capability names only — no provider brands.
 */

export type PublicProductEntry = {
  readonly id: string;
  readonly name: string;
  readonly pillar: "quality" | "security" | "productivity";
  readonly href: string;
  readonly summary: string;
  readonly packageId?: string;
};

export const PUBLIC_PRODUCT_CATALOGUE: readonly PublicProductEntry[] = [
  {
    id: "qep",
    name: "Quality Engineering Platform",
    pillar: "quality",
    href: "/products/qep",
    summary: "Release readiness, test evidence, and quality gates.",
    packageId: "pkg.apzqep.starter",
  },
  {
    id: "pen",
    name: "Security Assurance",
    pillar: "security",
    href: "/products/pen",
    summary: "Penetration testing engagements and security evidence.",
    packageId: "pkg.apzpen.starter",
  },
  {
    id: "projects",
    name: "Projects",
    pillar: "productivity",
    href: "/products/projects",
    summary: "Delivery boards and workspaces for product teams.",
    packageId: "pkg.apzprd.projects",
  },
  {
    id: "support",
    name: "Support",
    pillar: "productivity",
    href: "/products/support",
    summary: "Customer care desk with agent and requester licences.",
  },
  {
    id: "time",
    name: "Time",
    pillar: "productivity",
    href: "/products/time",
    summary: "Time tracking and utilisation for delivery teams.",
  },
  {
    id: "workflow",
    name: "Workflow",
    pillar: "productivity",
    href: "/products/workflow",
    summary: "Process design and operational workflows.",
  },
  {
    id: "analytics",
    name: "Analytics",
    pillar: "productivity",
    href: "/products/analytics",
    summary: "Cross-product insights for leaders and operators.",
  },
  {
    id: "knowledge",
    name: "Knowledge",
    pillar: "productivity",
    href: "/products/knowledge",
    summary: "Governed knowledge base for teams and auditors.",
  },
] as const;

export function getPublicProduct(id: string): PublicProductEntry | undefined {
  return PUBLIC_PRODUCT_CATALOGUE.find((p) => p.id === id);
}
