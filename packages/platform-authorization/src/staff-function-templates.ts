/**
 * Stream 6 — staff organisational functions are metadata + access templates.
 * They never grant permissions by themselves (staff function ≠ authz).
 */

export type StaffFunctionProductRoleHint = {
  readonly productKey: string;
  readonly roleId: string;
  readonly roleSlug: string;
  readonly label: string;
};

export type StaffFunctionTemplate = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  /** Org-job persona id (tenant shell baseline only — not product wildcards). */
  readonly orgJobRoleId: string;
  readonly suggestedProducts: readonly StaffFunctionProductRoleHint[];
};

/** Product-scoped roles — Phase A verticals. */
export const DEFAULT_PRODUCT_SUPPORT_AGENT_ROLE_ID = "role-product-support-agent";
export const DEFAULT_PRODUCT_TIME_EMPLOYEE_ROLE_ID = "role-product-time-employee";
export const DEFAULT_PRODUCT_KNOWLEDGE_CONTRIBUTOR_ROLE_ID =
  "role-product-knowledge-contributor";
export const DEFAULT_PRODUCT_PROJECTS_MEMBER_ROLE_ID = "role-product-projects-member";
export const DEFAULT_PRODUCT_QEP_ENGINEER_ROLE_ID = "role-product-qep-engineer";
export const DEFAULT_PRODUCT_PENTEST_ANALYST_ROLE_ID = "role-product-pentest-analyst";
export const DEFAULT_PRODUCT_WORKFLOW_OPERATOR_ROLE_ID =
  "role-product-workflow-operator";
export const DEFAULT_PRODUCT_ANALYTICS_VIEWER_ROLE_ID = "role-product-analytics-viewer";
export const DEFAULT_PRODUCT_DOCUMENTS_CLERK_ROLE_ID = "role-product-documents-clerk";
export const DEFAULT_PRODUCT_DOCUMENTS_AUDITOR_ROLE_ID =
  "role-product-documents-auditor";
export const DEFAULT_PRODUCT_KNOWLEDGE_VIEWER_ROLE_ID = "role-product-knowledge-viewer";

export const STAFF_FUNCTION_CUSTOMER_SUPPORT_ID = "staff-fn-customer-support";
export const STAFF_FUNCTION_ENGINEERING_ID = "staff-fn-engineering";
export const STAFF_FUNCTION_FINANCE_ID = "staff-fn-finance";
export const STAFF_FUNCTION_COMPLIANCE_ID = "staff-fn-compliance";
export const STAFF_FUNCTION_EXECUTIVE_ID = "staff-fn-executive";
export const STAFF_FUNCTION_QA_ID = "staff-fn-qa";
export const STAFF_FUNCTION_SECURITY_ID = "staff-fn-security";

export const STAFF_FUNCTION_TEMPLATES: readonly StaffFunctionTemplate[] = [
  {
    id: STAFF_FUNCTION_CUSTOMER_SUPPORT_ID,
    name: "Customer Support",
    description:
      "Suggested APZPRD access for customer-facing support agents — Support, Time, Knowledge.",
    orgJobRoleId: "role-support-agent",
    suggestedProducts: [
      {
        productKey: "support",
        roleId: DEFAULT_PRODUCT_SUPPORT_AGENT_ROLE_ID,
        roleSlug: "product-support-agent",
        label: "Support / Agent",
      },
      {
        productKey: "time",
        roleId: DEFAULT_PRODUCT_TIME_EMPLOYEE_ROLE_ID,
        roleSlug: "product-time-employee",
        label: "Time / Employee",
      },
      {
        productKey: "knowledge",
        roleId: DEFAULT_PRODUCT_KNOWLEDGE_CONTRIBUTOR_ROLE_ID,
        roleSlug: "product-knowledge-contributor",
        label: "Knowledge / Contributor",
      },
    ],
  },
  {
    id: STAFF_FUNCTION_ENGINEERING_ID,
    name: "Engineering",
    description:
      "Developer access — Projects, Time, QEP, PEN (no Support queues; Source phased later).",
    orgJobRoleId: "role-developer",
    suggestedProducts: [
      {
        productKey: "projects",
        roleId: DEFAULT_PRODUCT_PROJECTS_MEMBER_ROLE_ID,
        roleSlug: "product-projects-member",
        label: "Projects / Member",
      },
      {
        productKey: "time",
        roleId: DEFAULT_PRODUCT_TIME_EMPLOYEE_ROLE_ID,
        roleSlug: "product-time-employee",
        label: "Time / Employee",
      },
      {
        productKey: "qep",
        roleId: DEFAULT_PRODUCT_QEP_ENGINEER_ROLE_ID,
        roleSlug: "product-qep-engineer",
        label: "Quality / Engineer",
      },
      {
        productKey: "pentest",
        roleId: DEFAULT_PRODUCT_PENTEST_ANALYST_ROLE_ID,
        roleSlug: "product-pentest-analyst",
        label: "Security / Analyst",
      },
    ],
  },
  {
    id: STAFF_FUNCTION_FINANCE_ID,
    name: "Finance",
    description:
      "Finance staff — Time, Workflow, Analytics, Documents (no Support / QEP / PEN tools).",
    orgJobRoleId: "role-finance-staff",
    suggestedProducts: [
      {
        productKey: "time",
        roleId: DEFAULT_PRODUCT_TIME_EMPLOYEE_ROLE_ID,
        roleSlug: "product-time-employee",
        label: "Time / Employee",
      },
      {
        productKey: "workflow",
        roleId: DEFAULT_PRODUCT_WORKFLOW_OPERATOR_ROLE_ID,
        roleSlug: "product-workflow-operator",
        label: "Workflow / Operator",
      },
      {
        productKey: "analytics",
        roleId: DEFAULT_PRODUCT_ANALYTICS_VIEWER_ROLE_ID,
        roleSlug: "product-analytics-viewer",
        label: "Analytics / Viewer",
      },
      {
        productKey: "documents",
        roleId: DEFAULT_PRODUCT_DOCUMENTS_CLERK_ROLE_ID,
        roleSlug: "product-documents-clerk",
        label: "Documents / Clerk",
      },
    ],
  },
  {
    id: STAFF_FUNCTION_COMPLIANCE_ID,
    name: "Compliance",
    description:
      "Compliance staff — Documents (audit), Analytics, Knowledge (no Support / QEP / Projects).",
    orgJobRoleId: "role-compliance-officer",
    suggestedProducts: [
      {
        productKey: "documents",
        roleId: DEFAULT_PRODUCT_DOCUMENTS_AUDITOR_ROLE_ID,
        roleSlug: "product-documents-auditor",
        label: "Documents / Auditor",
      },
      {
        productKey: "analytics",
        roleId: DEFAULT_PRODUCT_ANALYTICS_VIEWER_ROLE_ID,
        roleSlug: "product-analytics-viewer",
        label: "Analytics / Viewer",
      },
      {
        productKey: "knowledge",
        roleId: DEFAULT_PRODUCT_KNOWLEDGE_CONTRIBUTOR_ROLE_ID,
        roleSlug: "product-knowledge-contributor",
        label: "Knowledge / Contributor",
      },
    ],
  },
  {
    id: STAFF_FUNCTION_EXECUTIVE_ID,
    name: "Executive",
    description:
      "Executive overview — Analytics, Documents (read/audit), Knowledge (view). No queues or engineering tools.",
    orgJobRoleId: "role-executive",
    suggestedProducts: [
      {
        productKey: "analytics",
        roleId: DEFAULT_PRODUCT_ANALYTICS_VIEWER_ROLE_ID,
        roleSlug: "product-analytics-viewer",
        label: "Analytics / Viewer",
      },
      {
        productKey: "documents",
        roleId: DEFAULT_PRODUCT_DOCUMENTS_AUDITOR_ROLE_ID,
        roleSlug: "product-documents-auditor",
        label: "Documents / Auditor",
      },
      {
        productKey: "knowledge",
        roleId: DEFAULT_PRODUCT_KNOWLEDGE_VIEWER_ROLE_ID,
        roleSlug: "product-knowledge-viewer",
        label: "Knowledge / Viewer",
      },
    ],
  },
  {
    id: STAFF_FUNCTION_QA_ID,
    name: "QA",
    description:
      "Quality assurance — QEP, Projects, Time (no Support queues; PEN is Security vertical).",
    orgJobRoleId: "role-qa-staff",
    suggestedProducts: [
      {
        productKey: "qep",
        roleId: DEFAULT_PRODUCT_QEP_ENGINEER_ROLE_ID,
        roleSlug: "product-qep-engineer",
        label: "Quality / Engineer",
      },
      {
        productKey: "projects",
        roleId: DEFAULT_PRODUCT_PROJECTS_MEMBER_ROLE_ID,
        roleSlug: "product-projects-member",
        label: "Projects / Member",
      },
      {
        productKey: "time",
        roleId: DEFAULT_PRODUCT_TIME_EMPLOYEE_ROLE_ID,
        roleSlug: "product-time-employee",
        label: "Time / Employee",
      },
    ],
  },
  {
    id: STAFF_FUNCTION_SECURITY_ID,
    name: "Security",
    description:
      "Security / Pentester — PEN, Documents (evidence), Time (no Support / QEP queues).",
    orgJobRoleId: "role-security-staff",
    suggestedProducts: [
      {
        productKey: "pentest",
        roleId: DEFAULT_PRODUCT_PENTEST_ANALYST_ROLE_ID,
        roleSlug: "product-pentest-analyst",
        label: "Security / Analyst",
      },
      {
        productKey: "documents",
        roleId: DEFAULT_PRODUCT_DOCUMENTS_AUDITOR_ROLE_ID,
        roleSlug: "product-documents-auditor",
        label: "Documents / Auditor",
      },
      {
        productKey: "time",
        roleId: DEFAULT_PRODUCT_TIME_EMPLOYEE_ROLE_ID,
        roleSlug: "product-time-employee",
        label: "Time / Employee",
      },
    ],
  },
] as const;

export function listStaffFunctionTemplates(): readonly StaffFunctionTemplate[] {
  return STAFF_FUNCTION_TEMPLATES;
}

export function getStaffFunctionTemplate(
  id: string,
): StaffFunctionTemplate | undefined {
  return STAFF_FUNCTION_TEMPLATES.find((t) => t.id === id);
}

export function resolveStaffFunctionTemplateForOrgJob(
  orgJobRoleId: string,
): StaffFunctionTemplate | undefined {
  return STAFF_FUNCTION_TEMPLATES.find((t) => t.orgJobRoleId === orgJobRoleId);
}
