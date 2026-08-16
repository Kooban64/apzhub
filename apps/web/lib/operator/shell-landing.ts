/**
 * Persona → operator / workbench shell landing paths.
 * Only org_member + individual use the productivity workbench.
 */

import type { DemoPersonaKind } from "@/lib/demo/demo-personas";

export type OperatorShellId =
  "console" | "ops" | "finance" | "compliance" | "org" | "apzpen" | "workspace";

export type ShellLanding = {
  readonly shell: OperatorShellId;
  readonly path: string;
  readonly label: string;
};

const LANDINGS: Record<DemoPersonaKind, ShellLanding> = {
  superadmin: { shell: "console", path: "/console", label: "Platform Console" },
  platform_admin: { shell: "ops", path: "/ops", label: "Platform Ops" },
  finance: { shell: "finance", path: "/finance", label: "Finance" },
  support: { shell: "ops", path: "/ops", label: "Platform Ops" },
  tenant_support: {
    shell: "workspace",
    path: "/workspace/home",
    label: "Support work",
  },
  tenant_developer: {
    shell: "workspace",
    path: "/workspace/home",
    label: "Engineering work",
  },
  tenant_finance: {
    shell: "workspace",
    path: "/workspace/home",
    label: "Finance work",
  },
  tenant_compliance: {
    shell: "workspace",
    path: "/workspace/home",
    label: "Compliance work",
  },
  tenant_executive: {
    shell: "workspace",
    path: "/workspace/home",
    label: "Executive work",
  },
  tenant_qa: {
    shell: "workspace",
    path: "/workspace/home",
    label: "QA work",
  },
  tenant_security: {
    shell: "workspace",
    path: "/workspace/home",
    label: "Security work",
  },
  compliance: {
    shell: "compliance",
    path: "/compliance",
    label: "Compliance",
  },
  org_admin: { shell: "org", path: "/org", label: "Organisation" },
  org_member: {
    shell: "workspace",
    path: "/workspace/home",
    label: "Workbench",
  },
  individual: {
    shell: "workspace",
    path: "/workspace/home",
    label: "Workbench",
  },
};

export function shellLandingForKind(kind: DemoPersonaKind): ShellLanding {
  return LANDINGS[kind];
}

export function isOperatorShellPath(pathname: string): boolean {
  return (
    pathname === "/console" ||
    pathname.startsWith("/console/") ||
    pathname === "/ops" ||
    pathname.startsWith("/ops/") ||
    pathname === "/finance" ||
    pathname.startsWith("/finance/") ||
    pathname === "/compliance" ||
    pathname.startsWith("/compliance/") ||
    pathname === "/org" ||
    pathname.startsWith("/org/") ||
    pathname === "/apzpen" ||
    pathname.startsWith("/apzpen/")
  );
}

export function isWorkbenchPath(pathname: string): boolean {
  return pathname === "/workspace" || pathname.startsWith("/workspace/");
}

/** Operator personas must not use productivity shell as home. */
export function isOperatorKind(kind: DemoPersonaKind): boolean {
  return (
    kind === "superadmin" ||
    kind === "platform_admin" ||
    kind === "finance" ||
    kind === "support" ||
    kind === "compliance" ||
    kind === "org_admin"
  );
}

export type OperatorNavItem = {
  readonly id: string;
  readonly href: string;
  readonly label: string;
  readonly hint?: string;
};

/** Top-bar mode switcher entries (Cursor-style surface switch). */
export type OperatorMode = {
  readonly id: Exclude<OperatorShellId, "workspace">;
  readonly href: string;
  readonly label: string;
  readonly shortLabel: string;
};

export const OPERATOR_MODES: readonly OperatorMode[] = [
  {
    id: "console",
    href: "/console",
    label: "Platform Console",
    shortLabel: "Console",
  },
  { id: "ops", href: "/ops", label: "Platform Ops", shortLabel: "Ops" },
  {
    id: "finance",
    href: "/finance",
    label: "Finance",
    shortLabel: "Finance",
  },
  {
    id: "compliance",
    href: "/compliance",
    label: "Compliance",
    shortLabel: "Compliance",
  },
  { id: "org", href: "/org", label: "Organisation", shortLabel: "Org" },
  {
    id: "apzpen",
    href: "/apzpen",
    label: "Security Assurance",
    shortLabel: "APZPEN",
  },
];

/**
 * Which mode shells a persona may open from the header switcher.
 * Soft for now — look/feel first; tighten with PermissionService later.
 */
export function modesForKind(kind: DemoPersonaKind): readonly OperatorMode[] {
  switch (kind) {
    case "superadmin":
      return OPERATOR_MODES;
    case "platform_admin":
    case "support":
      return OPERATOR_MODES.filter((m) => m.id === "ops" || m.id === "apzpen");
    case "tenant_support":
      return [];
    case "tenant_developer":
      return [];
    case "tenant_finance":
      return [];
    case "tenant_compliance":
      return [];
    case "tenant_executive":
      return [];
    case "tenant_qa":
      return [];
    case "tenant_security":
      return [];
    case "finance":
      return OPERATOR_MODES.filter((m) => m.id === "finance");
    case "compliance":
      return OPERATOR_MODES.filter((m) => m.id === "compliance");
    case "org_admin":
      return OPERATOR_MODES.filter((m) => m.id === "org" || m.id === "apzpen");
    case "org_member":
      return OPERATOR_MODES.filter((m) => m.id === "apzpen");
    default:
      return [];
  }
}

export function titleForShell(shell: OperatorShellId): string {
  switch (shell) {
    case "console":
      return "Platform Console";
    case "ops":
      return "Platform Ops";
    case "finance":
      return "Finance";
    case "compliance":
      return "Compliance";
    case "org":
      return "Organisation";
    case "apzpen":
      return "Security Assurance";
    default:
      return "Workbench";
  }
}

export function activeNavLabel(shell: OperatorShellId, pathname: string): string {
  const nav = navForShell(shell);
  const exact = nav.find((item) => pathname === item.href);
  if (exact) return exact.label;
  const nested = [...nav]
    .reverse()
    .find(
      (item) =>
        item.href !== `/${shell}` &&
        (pathname === item.href || pathname.startsWith(`${item.href}/`)),
    );
  return nested?.label ?? titleForShell(shell);
}

export const CONSOLE_NAV: readonly OperatorNavItem[] = [
  { id: "overview", href: "/console", label: "Overview" },
  { id: "customers", href: "/console/customers", label: "Customers" },
  { id: "catalogue", href: "/console/catalogue", label: "Suites & pricing" },
  { id: "limits", href: "/console/limits", label: "Limits" },
  { id: "payments", href: "/console/payments", label: "Payment providers" },
  { id: "api-keys", href: "/console/api-keys", label: "API credentials" },
  { id: "secrets", href: "/console/secrets", label: "Secrets" },
  { id: "audit", href: "/console/audit", label: "Audit" },
];

export const OPS_NAV: readonly OperatorNavItem[] = [
  { id: "overview", href: "/ops", label: "Overview" },
  { id: "health", href: "/ops/health", label: "Health" },
  { id: "monitoring", href: "/ops/monitoring", label: "Monitoring" },
  { id: "performance", href: "/ops/performance", label: "Performance" },
  { id: "sessions", href: "/ops/sessions", label: "Sessions" },
  { id: "workers", href: "/ops/workers", label: "Workers" },
  { id: "diagnostics", href: "/ops/diagnostics", label: "Diagnostics" },
  { id: "tuning", href: "/ops/tuning", label: "Tuning" },
];

export const FINANCE_NAV: readonly OperatorNavItem[] = [
  { id: "overview", href: "/finance", label: "Overview" },
  { id: "accounts", href: "/finance/accounts", label: "Accounts" },
  { id: "invoices", href: "/finance/invoices", label: "Invoices" },
  { id: "dunning", href: "/finance/dunning", label: "Dunning" },
  { id: "credits", href: "/finance/credits", label: "Credits" },
  { id: "refunds", href: "/finance/refunds", label: "Refunds" },
  { id: "statements", href: "/finance/statements", label: "Statements" },
];

export const COMPLIANCE_NAV: readonly OperatorNavItem[] = [
  { id: "overview", href: "/compliance", label: "Overview" },
  { id: "signups", href: "/compliance/signups", label: "Signup review" },
  { id: "statutory", href: "/compliance/statutory", label: "Statutory & tax" },
  { id: "entitlements", href: "/compliance/entitlements", label: "Entitlements" },
  { id: "audit", href: "/compliance/audit", label: "Audit" },
  { id: "findings", href: "/compliance/findings", label: "Findings" },
];

export const ORG_NAV: readonly OperatorNavItem[] = [
  { id: "overview", href: "/org", label: "Overview" },
  { id: "members", href: "/org/members", label: "Members & RBAC" },
  { id: "services", href: "/org/services", label: "Service roles" },
  {
    id: "professional-tools",
    href: "/org/professional-tools",
    label: "Professional Tools",
  },
  { id: "subscriptions", href: "/org/subscriptions", label: "Subscriptions" },
  { id: "billing", href: "/org/billing", label: "Billing" },
];

export const APZPEN_NAV: readonly OperatorNavItem[] = [
  { id: "overview", href: "/apzpen", label: "Home" },
  { id: "my-work", href: "/apzpen/my-work", label: "My Work" },
  { id: "engagements", href: "/apzpen/engagements", label: "Engagements" },
  { id: "findings", href: "/apzpen/findings", label: "Findings" },
  { id: "remediation", href: "/apzpen/remediation", label: "Remediation" },
  { id: "retests", href: "/apzpen/retests", label: "Retests" },
  {
    id: "risk-acceptance",
    href: "/apzpen/risk-acceptance",
    label: "Risk acceptance",
  },
  { id: "evidence", href: "/apzpen/evidence", label: "Evidence" },
  { id: "certification", href: "/apzpen/certification", label: "Assurance" },
  { id: "assets", href: "/apzpen/assets", label: "Assets" },
  { id: "code", href: "/apzpen/code", label: "Code security" },
  { id: "intelligence", href: "/apzpen/intelligence", label: "Intelligence" },
  { id: "providers", href: "/apzpen/providers", label: "Providers" },
  { id: "reports", href: "/apzpen/reports", label: "Reports" },
];

export function navForShell(shell: OperatorShellId): readonly OperatorNavItem[] {
  switch (shell) {
    case "console":
      return CONSOLE_NAV;
    case "ops":
      return OPS_NAV;
    case "finance":
      return FINANCE_NAV;
    case "compliance":
      return COMPLIANCE_NAV;
    case "org":
      return ORG_NAV;
    case "apzpen":
      return APZPEN_NAV;
    default:
      return [];
  }
}
