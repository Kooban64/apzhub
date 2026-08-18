/**
 * Doc-007 job-role personas + IAM/commercial permission catalogue (SPR-IAM-COMMERCIAL-001).
 */

export const IAM_PLATFORM_PERMISSIONS = [
  "identity.read",
  "identity.manage",
  "identity.admin",
  "admin.read",
  "admin.operate",
  "admin.platform",
  "billing.read",
  "billing.manage",
  "billing.admin",
  "catalogue.read",
  "catalogue.manage",
  "commerce.catalogue.read",
  "commerce.catalogue.manage",
  "commerce.pricing.read",
  "commerce.pricing.manage",
  "commerce.discount.read",
  "commerce.discount.manage",
  "commerce.tax.read",
  "commerce.tax.manage",
  "entitlement.read",
  "entitlement.manage",
] as const;

export type IamPlatformPermission = (typeof IAM_PLATFORM_PERMISSIONS)[number];

export type PersonaRoleDefinition = {
  readonly roleId: string;
  readonly slug: string;
  readonly name: string;
  readonly scope: "platform" | "tenant" | "product";
  readonly productKey?: string;
  readonly permissions: readonly string[];
};

/** Org Admin — manage members inside own organisation only. */
export const DEFAULT_ORG_ADMIN_ROLE_ID = "role-org-admin";
export const DEFAULT_MANAGER_ROLE_ID = "role-manager";
export const DEFAULT_SUPERVISOR_ROLE_ID = "role-supervisor";
export const DEFAULT_EMPLOYEE_ROLE_ID = "role-employee";
export const DEFAULT_SUPPORT_AGENT_ROLE_ID = "role-support-agent";
export const DEFAULT_DEVELOPER_ROLE_ID = "role-developer";
export const DEFAULT_FINANCE_STAFF_ROLE_ID = "role-finance-staff";
export const DEFAULT_AUDITOR_ROLE_ID = "role-auditor";
export const DEFAULT_COMPLIANCE_OFFICER_ROLE_ID = "role-compliance-officer";
export const DEFAULT_EXECUTIVE_ROLE_ID = "role-executive";
export const DEFAULT_QA_STAFF_ROLE_ID = "role-qa-staff";
export const DEFAULT_SECURITY_STAFF_ROLE_ID = "role-security-staff";
export const DEFAULT_SUPERADMIN_ROLE_ID = "role-superadmin";
export const DEFAULT_PLATFORM_FINANCE_ROLE_ID = "role-platform-finance";
export const DEFAULT_PLATFORM_SUPPORT_ROLE_ID = "role-platform-support";
export const DEFAULT_PLATFORM_COMPLIANCE_ROLE_ID = "role-platform-compliance";
export const DEFAULT_INDIVIDUAL_ROLE_ID = "role-individual";

const TENANT_BASE = [
  "tenant.*",
  "workspace.*",
  "user.read",
  "search.execute",
  "notification.read",
  "notifications.read",
  "notifications.preferences",
] as const;

/** Platform operator personas (Super Admin, Platform Admin, Finance, Support, Compliance). */
export const PLATFORM_OPERATOR_PERSONAS: readonly PersonaRoleDefinition[] = [
  {
    roleId: DEFAULT_SUPERADMIN_ROLE_ID,
    slug: "superadmin",
    name: "Super Administrator",
    scope: "platform",
    permissions: ["*", "platform.*", "admin.platform", ...IAM_PLATFORM_PERMISSIONS],
  },
  {
    roleId: DEFAULT_PLATFORM_FINANCE_ROLE_ID,
    slug: "platform-finance",
    name: "Platform Finance",
    scope: "platform",
    permissions: [
      "platform.nav.home.view",
      "platform.nav.administration.view",
      "billing.read",
      "billing.manage",
      "billing.admin",
      "catalogue.read",
      "commerce.catalogue.read",
      "commerce.catalogue.manage",
      "commerce.pricing.read",
      "commerce.pricing.manage",
      "commerce.discount.read",
      "commerce.discount.manage",
      "commerce.tax.read",
      "commerce.tax.manage",
      "entitlement.read",
      "admin.read",
      "identity.read",
      ...TENANT_BASE,
    ],
  },
  {
    roleId: DEFAULT_PLATFORM_SUPPORT_ROLE_ID,
    slug: "platform-support",
    name: "Platform Support",
    scope: "platform",
    permissions: [
      "platform.nav.home.view",
      "support.*",
      "identity.read",
      "admin.read",
      "admin.operate",
      "notification.*",
      ...TENANT_BASE,
    ],
  },
  {
    roleId: DEFAULT_PLATFORM_COMPLIANCE_ROLE_ID,
    slug: "platform-compliance",
    name: "Platform Compliance",
    scope: "platform",
    permissions: [
      "platform.nav.home.view",
      "identity.read",
      "admin.read",
      "billing.read",
      "entitlement.read",
      "document.audit",
      "document.retention",
      "workflow.audit",
      ...TENANT_BASE,
    ],
  },
  {
    roleId: DEFAULT_INDIVIDUAL_ROLE_ID,
    slug: "individual",
    name: "Individual",
    scope: "tenant",
    permissions: [
      ...TENANT_BASE,
      "identity.read",
      "identity.manage",
      "billing.read",
      "billing.manage",
      "catalogue.read",
      "entitlement.read",
      "entitlement.manage",
      "user.*",
      "qep.*",
      "project.*",
      "projects.view",
      "document.read",
      "document.write",
    ],
  },
] as const;

export const PERSONA_ROLE_DEFINITIONS: readonly PersonaRoleDefinition[] = [
  ...PLATFORM_OPERATOR_PERSONAS,
  {
    roleId: DEFAULT_ORG_ADMIN_ROLE_ID,
    slug: "org-admin",
    name: "Organisation Administrator",
    scope: "tenant",
    permissions: [
      ...TENANT_BASE,
      "identity.read",
      "identity.manage",
      "admin.read",
      "admin.operate",
      "billing.read",
      "billing.manage",
      "catalogue.read",
      "entitlement.read",
      "team.*",
      "user.*",
    ],
  },
  {
    roleId: DEFAULT_MANAGER_ROLE_ID,
    slug: "manager",
    name: "Manager",
    scope: "tenant",
    permissions: [
      ...TENANT_BASE,
      "identity.read",
      "admin.read",
      "billing.read",
      "catalogue.read",
      "entitlement.read",
      "team.*",
      "project.*",
      "projects.view",
      "projects.manage",
    ],
  },
  {
    roleId: DEFAULT_SUPERVISOR_ROLE_ID,
    slug: "supervisor",
    name: "Supervisor",
    scope: "tenant",
    permissions: [
      ...TENANT_BASE,
      "identity.read",
      "team.list",
      "team.read",
      "project.*",
      "projects.view",
    ],
  },
  {
    roleId: DEFAULT_EMPLOYEE_ROLE_ID,
    slug: "employee",
    name: "Employee",
    scope: "tenant",
    permissions: [...TENANT_BASE, "project.*", "projects.view", "document.read"],
  },
  {
    // Org-job label only (Stream 6 Layer 3). Product access via product roles.
    roleId: DEFAULT_SUPPORT_AGENT_ROLE_ID,
    slug: "support-agent",
    name: "Support Agent",
    scope: "tenant",
    permissions: [...TENANT_BASE],
  },
  {
    // Org-job label only — Engineering / Developer staff function.
    roleId: DEFAULT_DEVELOPER_ROLE_ID,
    slug: "developer",
    name: "Developer",
    scope: "tenant",
    permissions: [...TENANT_BASE],
  },
  {
    // Org-job label only — Finance staff function (≠ platform-finance).
    roleId: DEFAULT_FINANCE_STAFF_ROLE_ID,
    slug: "finance-staff",
    name: "Finance",
    scope: "tenant",
    permissions: [...TENANT_BASE],
  },
  {
    roleId: DEFAULT_AUDITOR_ROLE_ID,
    slug: "auditor",
    name: "Auditor",
    scope: "tenant",
    permissions: [
      ...TENANT_BASE,
      "identity.read",
      "admin.read",
      "billing.read",
      "entitlement.read",
      "document.audit",
      "workflow.audit",
    ],
  },
  {
    // Org-job label only — Compliance staff function (≠ platform-compliance).
    // Document audit/retention come from product-documents-auditor.
    roleId: DEFAULT_COMPLIANCE_OFFICER_ROLE_ID,
    slug: "compliance-officer",
    name: "Compliance Officer",
    scope: "tenant",
    permissions: [...TENANT_BASE],
  },
  {
    // Org-job label only — Executive staff function.
    roleId: DEFAULT_EXECUTIVE_ROLE_ID,
    slug: "executive",
    name: "Executive",
    scope: "tenant",
    permissions: [...TENANT_BASE],
  },
  {
    // Org-job label only — QA staff function (≠ Engineering; no PEN).
    roleId: DEFAULT_QA_STAFF_ROLE_ID,
    slug: "qa-staff",
    name: "QA",
    scope: "tenant",
    permissions: [...TENANT_BASE],
  },
  {
    // Org-job label only — Security / Pentester staff function.
    roleId: DEFAULT_SECURITY_STAFF_ROLE_ID,
    slug: "security-staff",
    name: "Security",
    scope: "tenant",
    permissions: [...TENANT_BASE],
  },
] as const;

export function listPersonaRoles(): readonly PersonaRoleDefinition[] {
  return PERSONA_ROLE_DEFINITIONS;
}
