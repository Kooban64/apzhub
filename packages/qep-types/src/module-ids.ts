/** APZ QEP product module identifiers (DEF-002 / ARCH-001). No business behaviour. */
export const QEP_PRODUCT_ID = "apzqep" as const;
export const QEP_PRODUCT_NAME = "APZ QEP" as const;
export const QEP_PRODUCT_EXPANDED = "APZ Quality Engineering Platform" as const;

export const QEP_MODULE_IDS = [
  "M01",
  "M02",
  "M03",
  "M04",
  "M05",
  "M06",
  "M07",
  "M08",
  "M09",
  "M10",
  "M11",
  "M12",
  "M13",
  "M14",
  "M15",
  "M16",
  "M17",
  "M18",
  "M19",
  "M20",
  "M21",
  "M22",
] as const;

export type QepModuleId = (typeof QEP_MODULE_IDS)[number];

export type QepModuleDescriptor = {
  id: QepModuleId;
  slug: string;
  packageName: string;
  title: string;
  status: "stub" | "planned" | "enabled";
};

/**
 * Catalogue statuses (Tranche 2 Q6 honesty):
 * `enabled` = workspace router has a real surface (not Requirements fallthrough).
 * `stub` = package/nav may exist; UI must show unavailable — never impersonate another module.
 * M01 Home + M12 Release Readiness enabled under SPR-APZQEP-201;
 * M22 Search enabled under SPR-APZQEP-204.
 */
export const QEP_MODULES: readonly QepModuleDescriptor[] = [
  {
    id: "M01",
    slug: "home",
    packageName: "qep-home",
    title: "Home and Command Centre",
    status: "enabled",
  },
  {
    id: "M02",
    slug: "portfolio",
    packageName: "qep-portfolio",
    title: "Portfolio and Projects",
    status: "enabled",
  },
  {
    id: "M03",
    slug: "requirements",
    packageName: "qep-requirements",
    title: "Requirements",
    status: "enabled",
  },
  {
    id: "M04",
    slug: "verification-library",
    packageName: "qep-verification-library",
    title: "Verification Library",
    status: "enabled",
  },
  {
    id: "M05",
    slug: "verification-design",
    packageName: "qep-verification-design",
    title: "Verification Design",
    status: "enabled",
  },
  {
    id: "M06",
    slug: "execution",
    packageName: "qep-execution",
    title: "Execution and Sessions",
    status: "enabled",
  },
  {
    id: "M07",
    slug: "automation",
    packageName: "qep-automation",
    title: "Enterprise Automation",
    status: "enabled",
  },
  {
    id: "M08",
    slug: "defects",
    packageName: "qep-defects",
    title: "Defects and Quality Issues",
    status: "enabled",
  },
  {
    id: "M09",
    slug: "evidence",
    packageName: "qep-evidence",
    title: "Evidence",
    status: "enabled",
  },
  {
    id: "M10",
    slug: "traceability",
    packageName: "qep-traceability",
    title: "Traceability",
    status: "enabled",
  },
  {
    id: "M11",
    slug: "risk",
    packageName: "qep-risk",
    title: "Risk Management",
    status: "enabled",
  },
  {
    id: "M12",
    slug: "release-readiness",
    packageName: "qep-release-readiness",
    title: "Release Readiness",
    status: "enabled",
  },
  {
    id: "M13",
    slug: "certification",
    packageName: "qep-certification",
    title: "Release Candidate",
    status: "enabled",
  },
  {
    id: "M14",
    slug: "quality-intelligence",
    packageName: "qep-quality-intelligence",
    title: "Quality Intelligence",
    status: "enabled",
  },
  {
    id: "M15",
    slug: "reporting",
    packageName: "qep-reporting",
    title: "Reporting and Analytics",
    status: "enabled",
  },
  {
    id: "M16",
    slug: "learning",
    packageName: "qep-knowledge",
    title: "Learning",
    status: "enabled",
  },
  {
    id: "M17",
    slug: "ai-workspace",
    packageName: "qep-ai-workspace",
    title: "AI Quality Workspace",
    status: "enabled",
  },
  {
    id: "M18",
    slug: "mcp-dx",
    packageName: "qep-mcp",
    title: "MCP and Developer Experience",
    status: "stub",
  },
  {
    id: "M19",
    slug: "scm",
    packageName: "qep-scm",
    title: "Enterprise Source Control",
    status: "enabled",
  },

  {
    id: "M20",
    slug: "administration",
    packageName: "qep-administration",
    title: "Administration",
    status: "enabled",
  },
  {
    id: "M21",
    slug: "audit",
    packageName: "qep-audit",
    title: "Audit and Compliance",
    status: "enabled",
  },
  {
    id: "M22",
    slug: "search",
    packageName: "qep-search",
    title: "QEP Search",
    status: "enabled",
  },
] as const;

export function findQepModuleBySlug(slug: string): QepModuleDescriptor | undefined {
  return QEP_MODULES.find((module) => module.slug === slug);
}
