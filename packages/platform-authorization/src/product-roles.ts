/**
 * Stream 6 product roles — Layer 4 for Phase A vertical proofs.
 * Distinct from org-job personas (staff function / Layer 3 metadata).
 */

import type { PersonaRoleDefinition } from "./persona-roles";
import { QEP_READER_PERMISSIONS } from "./qep-core-qe-permissions";
import {
  DEFAULT_PRODUCT_ANALYTICS_VIEWER_ROLE_ID,
  DEFAULT_PRODUCT_DOCUMENTS_AUDITOR_ROLE_ID,
  DEFAULT_PRODUCT_DOCUMENTS_CLERK_ROLE_ID,
  DEFAULT_PRODUCT_KNOWLEDGE_CONTRIBUTOR_ROLE_ID,
  DEFAULT_PRODUCT_KNOWLEDGE_VIEWER_ROLE_ID,
  DEFAULT_PRODUCT_PENTEST_ANALYST_ROLE_ID,
  DEFAULT_PRODUCT_PROJECTS_MEMBER_ROLE_ID,
  DEFAULT_PRODUCT_QEP_ENGINEER_ROLE_ID,
  DEFAULT_PRODUCT_SUPPORT_AGENT_ROLE_ID,
  DEFAULT_PRODUCT_TIME_EMPLOYEE_ROLE_ID,
  DEFAULT_PRODUCT_WORKFLOW_OPERATOR_ROLE_ID,
} from "./staff-function-templates";

/** Support Agent — queue work only. */
export const PRODUCT_SUPPORT_AGENT_PERMISSIONS = [
  "support.*",
  "notification.read",
  "notifications.read",
  "notifications.preferences",
  "search.execute",
] as const;

/** Time Employee — own time recording. */
export const PRODUCT_TIME_EMPLOYEE_PERMISSIONS = [
  "time.*",
  "notification.read",
  "notifications.read",
  "search.execute",
] as const;

/** Knowledge Contributor — contribute without knowledge admin. */
export const PRODUCT_KNOWLEDGE_CONTRIBUTOR_PERMISSIONS = [
  "knowledge.view",
  "knowledge.manage",
  "document.read",
  "search.execute",
  "notification.read",
  "notifications.read",
] as const;

/** Knowledge Viewer — read policy/library without contribute. */
export const PRODUCT_KNOWLEDGE_VIEWER_PERMISSIONS = [
  "knowledge.view",
  "search.execute",
  "notification.read",
  "notifications.read",
] as const;

/** Projects Member — delivery work without projects.admin. */
export const PRODUCT_PROJECTS_MEMBER_PERMISSIONS = [
  "project.*",
  "projects.view",
  "projects.manage",
  "projects.task.view",
  "projects.task.manage",
  "projects.sprint.view",
  "notification.read",
  "notifications.read",
  "search.execute",
] as const;

/** QEP Engineer — operate quality flows (reader+write lean; not platform QEP admin). */
export const PRODUCT_QEP_ENGINEER_PERMISSIONS = [
  ...QEP_READER_PERMISSIONS,
  "qep.plan.create",
  "qep.plan.update",
  "qep.execution.create",
  "qep.execution.execute",
  "qep.evidence.create",
  "search.execute",
  "notification.read",
  "notifications.read",
] as const;

/**
 * PEN Analyst — engagement/findings visibility for engineers.
 * Not Security Tester: no professional-tool / terminal entitlements.
 */
export const PRODUCT_PENTEST_ANALYST_PERMISSIONS = [
  "testing.*",
  "evidence.*",
  "certification.*",
  "search.execute",
  "notification.read",
  "notifications.read",
] as const;

/** Workflow Operator — finance/ops orchestration without engine admin. */
export const PRODUCT_WORKFLOW_OPERATOR_PERMISSIONS = [
  "workflow.view",
  "workflow.create",
  "workflow.update",
  "workflow.publish",
  "workflow.template.view",
  "workflow.tasks.*",
  "workflow.runs.view",
  "workflow.runs.start",
  "search.execute",
  "notification.read",
  "notifications.read",
] as const;

/** Analytics Viewer — KPIs / dashboards, not analytics.admin. */
export const PRODUCT_ANALYTICS_VIEWER_PERMISSIONS = [
  "analytics.view",
  "analytics.kpi.view",
  "analytics.dashboard.view",
  "analytics.report.run",
  "dashboard.*",
  "search.execute",
  "notification.read",
  "notifications.read",
] as const;

/** Documents Clerk — finance document work without retention/admin. */
export const PRODUCT_DOCUMENTS_CLERK_PERMISSIONS = [
  "document.read",
  "document.write",
  "document.manage",
  "document.version.read",
  "document.metadata.read",
  "search.execute",
  "notification.read",
  "notifications.read",
] as const;

/** Documents Auditor — compliance review / retention without full write. */
export const PRODUCT_DOCUMENTS_AUDITOR_PERMISSIONS = [
  "document.read",
  "document.version.read",
  "document.metadata.read",
  "document.audit",
  "document.retention",
  "search.execute",
  "notification.read",
  "notifications.read",
] as const;

export const PRODUCT_ROLE_DEFINITIONS: readonly PersonaRoleDefinition[] = [
  {
    roleId: DEFAULT_PRODUCT_SUPPORT_AGENT_ROLE_ID,
    slug: "product-support-agent",
    name: "Support Agent",
    scope: "product",
    productKey: "support",
    permissions: [...PRODUCT_SUPPORT_AGENT_PERMISSIONS],
  },
  {
    roleId: DEFAULT_PRODUCT_TIME_EMPLOYEE_ROLE_ID,
    slug: "product-time-employee",
    name: "Time Employee",
    scope: "product",
    productKey: "time",
    permissions: [...PRODUCT_TIME_EMPLOYEE_PERMISSIONS],
  },
  {
    roleId: DEFAULT_PRODUCT_KNOWLEDGE_CONTRIBUTOR_ROLE_ID,
    slug: "product-knowledge-contributor",
    name: "Knowledge Contributor",
    scope: "product",
    productKey: "knowledge",
    permissions: [...PRODUCT_KNOWLEDGE_CONTRIBUTOR_PERMISSIONS],
  },
  {
    roleId: DEFAULT_PRODUCT_KNOWLEDGE_VIEWER_ROLE_ID,
    slug: "product-knowledge-viewer",
    name: "Knowledge Viewer",
    scope: "product",
    productKey: "knowledge",
    permissions: [...PRODUCT_KNOWLEDGE_VIEWER_PERMISSIONS],
  },
  {
    roleId: DEFAULT_PRODUCT_PROJECTS_MEMBER_ROLE_ID,
    slug: "product-projects-member",
    name: "Projects Member",
    scope: "product",
    productKey: "projects",
    permissions: [...PRODUCT_PROJECTS_MEMBER_PERMISSIONS],
  },
  {
    roleId: DEFAULT_PRODUCT_QEP_ENGINEER_ROLE_ID,
    slug: "product-qep-engineer",
    name: "QEP Engineer",
    scope: "product",
    productKey: "qep",
    permissions: [...PRODUCT_QEP_ENGINEER_PERMISSIONS],
  },
  {
    roleId: DEFAULT_PRODUCT_PENTEST_ANALYST_ROLE_ID,
    slug: "product-pentest-analyst",
    name: "PEN Analyst",
    scope: "product",
    productKey: "pentest",
    permissions: [...PRODUCT_PENTEST_ANALYST_PERMISSIONS],
  },
  {
    roleId: DEFAULT_PRODUCT_WORKFLOW_OPERATOR_ROLE_ID,
    slug: "product-workflow-operator",
    name: "Workflow Operator",
    scope: "product",
    productKey: "workflow",
    permissions: [...PRODUCT_WORKFLOW_OPERATOR_PERMISSIONS],
  },
  {
    roleId: DEFAULT_PRODUCT_ANALYTICS_VIEWER_ROLE_ID,
    slug: "product-analytics-viewer",
    name: "Analytics Viewer",
    scope: "product",
    productKey: "analytics",
    permissions: [...PRODUCT_ANALYTICS_VIEWER_PERMISSIONS],
  },
  {
    roleId: DEFAULT_PRODUCT_DOCUMENTS_CLERK_ROLE_ID,
    slug: "product-documents-clerk",
    name: "Documents Clerk",
    scope: "product",
    productKey: "documents",
    permissions: [...PRODUCT_DOCUMENTS_CLERK_PERMISSIONS],
  },
  {
    roleId: DEFAULT_PRODUCT_DOCUMENTS_AUDITOR_ROLE_ID,
    slug: "product-documents-auditor",
    name: "Documents Auditor",
    scope: "product",
    productKey: "documents",
    permissions: [...PRODUCT_DOCUMENTS_AUDITOR_PERMISSIONS],
  },
] as const;

export function listProductRoles(): readonly PersonaRoleDefinition[] {
  return PRODUCT_ROLE_DEFINITIONS;
}
