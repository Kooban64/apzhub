import type { EnvVars } from "@/lib/env-vars";
/**
 * Demo / development personas for quick login + role dashboards.
 * Gated to non-production (or ALLOW_DEMO_PERSONAS=true).
 */

export type DemoPersonaKind =
  | "superadmin"
  | "platform_admin"
  | "finance"
  | "support"
  | "tenant_support"
  | "tenant_developer"
  | "tenant_finance"
  | "tenant_compliance"
  | "tenant_executive"
  | "tenant_qa"
  | "tenant_security"
  | "compliance"
  | "org_admin"
  | "org_member"
  | "individual";

export type DemoPersona = {
  readonly id: string;
  readonly kind: DemoPersonaKind;
  readonly label: string;
  readonly email: string;
  readonly password: string;
  readonly name: string;
  readonly roleId: string;
  readonly tenantId: string;
  readonly description: string;
  readonly group: "platform" | "organisation" | "individual";
};

export const DEMO_ORG_TENANT_ID = "t-demo-org-0001";
export const DEMO_PASSWORD = "DemoPassword123!";

/** Shared password for all demo personas (dev only). */
export const DEMO_PERSONAS: readonly DemoPersona[] = [
  {
    id: "superadmin",
    kind: "superadmin",
    label: "Super Admin",
    email: "super@apzhub.local",
    password: DEMO_PASSWORD,
    name: "Super Admin",
    roleId: "role-superadmin",
    tenantId: "t0000001-0000-4000-8000-000000000001",
    description: "Every role · platform-critical controls",
    group: "platform",
  },
  {
    id: "platform_admin",
    kind: "platform_admin",
    label: "Platform Admin",
    email: "platform@apzhub.local",
    password: DEMO_PASSWORD,
    name: "Platform Admin",
    roleId: "role-platform-admin",
    tenantId: "t0000001-0000-4000-8000-000000000001",
    description: "Operational authority across the platform",
    group: "platform",
  },
  {
    id: "finance",
    kind: "finance",
    label: "Finance",
    email: "finance@apzhub.local",
    password: DEMO_PASSWORD,
    name: "Finance Operator",
    roleId: "role-platform-finance",
    tenantId: "t0000001-0000-4000-8000-000000000001",
    description: "Billing, invoices, dunning, credits",
    group: "platform",
  },
  {
    id: "support",
    kind: "support",
    label: "Support",
    email: "support@apzhub.local",
    password: DEMO_PASSWORD,
    name: "Support Operator",
    roleId: "role-platform-support",
    tenantId: "t0000001-0000-4000-8000-000000000001",
    description: "Customer care & ticket operations",
    group: "platform",
  },
  {
    id: "compliance",
    kind: "compliance",
    label: "Compliance",
    email: "compliance@apzhub.local",
    password: DEMO_PASSWORD,
    name: "Compliance Officer",
    roleId: "role-platform-compliance",
    tenantId: "t0000001-0000-4000-8000-000000000001",
    description: "Audit, retention, entitlement review",
    group: "platform",
  },
  {
    id: "org_admin",
    kind: "org_admin",
    label: "Org Admin",
    email: "admin@demo-org.local",
    password: DEMO_PASSWORD,
    name: "Demo Org Admin",
    roleId: "role-org-admin",
    tenantId: DEMO_ORG_TENANT_ID,
    description: "Members, grants, org billing",
    group: "organisation",
  },
  {
    id: "org_member",
    kind: "org_member",
    label: "Org Member",
    email: "member@demo-org.local",
    password: DEMO_PASSWORD,
    name: "Demo Org Member",
    roleId: "role-employee",
    tenantId: DEMO_ORG_TENANT_ID,
    description: "Day-to-day operator in the demo org",
    group: "organisation",
  },
  {
    id: "individual",
    kind: "individual",
    label: "Individual",
    email: "individual@apzhub.local",
    password: DEMO_PASSWORD,
    name: "Individual Operator",
    roleId: "role-individual",
    tenantId: "t-individual-self",
    description: "Full control of own account & products",
    group: "individual",
  },
] as const;

export function isDemoPersonasEnabled(env: EnvVars = process.env): boolean {
  if (env.ALLOW_DEMO_PERSONAS === "true") return true;
  if (env.NODE_ENV === "production" && env.ALLOW_DEMO_PERSONAS !== "true") {
    return false;
  }
  return env.NODE_ENV !== "production";
}

export function listDemoPersonasForClient(): readonly {
  id: string;
  label: string;
  email: string;
  description: string;
  group: DemoPersona["group"];
}[] {
  return DEMO_PERSONAS.map((p) => ({
    id: p.id,
    label: p.label,
    email: p.email,
    description: p.description,
    group: p.group,
  }));
}

export function getDemoPersona(id: string): DemoPersona | undefined {
  return DEMO_PERSONAS.find((p) => p.id === id);
}

export function resolveDashboardKindFromRoles(
  roles: readonly string[],
): DemoPersonaKind {
  const set = new Set(roles.map((r) => r.toLowerCase()));
  if (set.has("role-superadmin") || set.has("superadmin")) return "superadmin";
  if (set.has("role-platform-admin") || set.has("platform-admin")) {
    return "platform_admin";
  }
  if (set.has("role-platform-finance") || set.has("platform-finance")) {
    return "finance";
  }
  // Platform support ops ≠ tenant Support Agent (Stream 6 vertical).
  if (set.has("role-platform-support") || set.has("platform-support")) {
    return "support";
  }
  if (set.has("role-platform-compliance") || set.has("platform-compliance")) {
    return "compliance";
  }
  // Org-job roles drive tenant home kinds (product roles alone are ambiguous).
  if (set.has("role-finance-staff") || set.has("finance-staff")) {
    return "tenant_finance";
  }
  if (set.has("role-compliance-officer") || set.has("compliance-officer")) {
    return "tenant_compliance";
  }
  if (set.has("role-executive") || set.has("executive")) {
    return "tenant_executive";
  }
  if (set.has("role-qa-staff") || set.has("qa-staff")) {
    return "tenant_qa";
  }
  if (set.has("role-security-staff") || set.has("security-staff")) {
    return "tenant_security";
  }
  if (
    set.has("role-product-projects-member") ||
    set.has("product-projects-member") ||
    set.has("role-product-qep-engineer") ||
    set.has("product-qep-engineer") ||
    set.has("role-developer") ||
    set.has("developer")
  ) {
    return "tenant_developer";
  }
  if (
    set.has("role-product-support-agent") ||
    set.has("product-support-agent") ||
    set.has("role-support-agent") ||
    set.has("support-agent")
  ) {
    return "tenant_support";
  }
  if (set.has("role-org-admin") || set.has("org-admin")) return "org_admin";
  if (set.has("role-individual") || set.has("individual")) return "individual";
  return "org_member";
}
