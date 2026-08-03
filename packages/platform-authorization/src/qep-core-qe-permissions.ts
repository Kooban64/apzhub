/**
 * Cap A–F permission catalogue and roles — APZQEP-152.
 * Least privilege: tenant-member does NOT receive these by default.
 */

export const DEFAULT_QEP_OPERATOR_ROLE_ID = "role-qep-operator";
export const DEFAULT_QEP_READER_ROLE_ID = "role-qep-reader";

/** Authoritative Cap A–F permission keys used by domain services. */
export const QEP_CORE_QE_PERMISSIONS = [
  "qep.suites.read",
  "qep.suites.create",
  "qep.suites.update",
  "qep.suites.lifecycle",
  "qep.suites.admin",
  "qep.execution_plans.read",
  "qep.execution_plans.create",
  "qep.execution_plans.update",
  "qep.execution_plans.lifecycle",
  "qep.execution_plans.handoff",
  "qep.execution_plans.admin",
  "qep.execution_workspace.read",
  "qep.execution_workspace.create",
  "qep.execution_workspace.execute",
  "qep.execution_workspace.lifecycle",
  "qep.execution_workspace.amend",
  "qep.execution_workspace.admin",
  "qep.defects.read",
  "qep.defects.create",
  "qep.defects.update",
  "qep.defects.lifecycle",
  "qep.defects.admin",
  "qep.enterprise_requirements.read",
  "qep.enterprise_requirements.create",
  "qep.enterprise_requirements.update",
  "qep.enterprise_requirements.lifecycle",
  "qep.enterprise_requirements.admin",
  "qep.enterprise_reporting.read",
  "qep.enterprise_reporting.create",
  "qep.enterprise_reporting.update",
  "qep.enterprise_reporting.admin",
  "qep.*",
] as const;

export const QEP_OPERATOR_PERMISSIONS = [
  "qep.suites.read",
  "qep.suites.create",
  "qep.suites.update",
  "qep.suites.lifecycle",
  "qep.execution_plans.read",
  "qep.execution_plans.create",
  "qep.execution_plans.update",
  "qep.execution_plans.lifecycle",
  "qep.execution_plans.handoff",
  "qep.execution_workspace.read",
  "qep.execution_workspace.create",
  "qep.execution_workspace.execute",
  "qep.execution_workspace.lifecycle",
  "qep.execution_workspace.amend",
  "qep.defects.read",
  "qep.defects.create",
  "qep.defects.update",
  "qep.defects.lifecycle",
  "qep.enterprise_requirements.read",
  "qep.enterprise_requirements.create",
  "qep.enterprise_requirements.update",
  "qep.enterprise_requirements.lifecycle",
  "qep.enterprise_reporting.read",
  "qep.enterprise_reporting.create",
  "qep.enterprise_reporting.update",
] as const;

export const QEP_READER_PERMISSIONS = [
  "qep.suites.read",
  "qep.execution_plans.read",
  "qep.execution_workspace.read",
  "qep.defects.read",
  "qep.enterprise_requirements.read",
  "qep.enterprise_reporting.read",
] as const;

/** When true, auto-provision also assigns qep-operator (dev/cert only). */
export function isQepOperatorAutoAssignEnabled(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  const raw = (env.APZQEP_QEP_AUTO_ASSIGN_OPERATOR ?? "").toLowerCase();
  return raw === "true" || raw === "1" || raw === "yes";
}
