/**
 * Platform Administration enums (APZADMIN-001).
 * Metadata catalogue only — no runtime execution or UI rendering.
 */

export const ADMINISTRATION_MODULE_KEYS = [
  "identity",
  "projects",
  "support",
  "testing",
  "reporting",
  "documents",
  "search",
  "workflow",
  "workflow-engine",
  "notifications",
  "configuration",
  "future",
] as const;

export type AdministrationModuleKey =
  (typeof ADMINISTRATION_MODULE_KEYS)[number];

export function isAdministrationModuleKey(
  value: string,
): value is AdministrationModuleKey {
  return (ADMINISTRATION_MODULE_KEYS as readonly string[]).includes(value);
}

export const ADMINISTRATION_LIFECYCLE_STATUSES = [
  "draft",
  "registered",
  "active",
  "deprecated",
  "archived",
] as const;

export type AdministrationLifecycleStatus =
  (typeof ADMINISTRATION_LIFECYCLE_STATUSES)[number];

export function isAdministrationLifecycleStatus(
  value: string,
): value is AdministrationLifecycleStatus {
  return (ADMINISTRATION_LIFECYCLE_STATUSES as readonly string[]).includes(
    value,
  );
}

export const ADMINISTRATION_ACTION_KINDS = [
  "view",
  "manage",
  "configure",
  "diagnose",
  "audit",
  "maintain",
] as const;

export type AdministrationActionKind =
  (typeof ADMINISTRATION_ACTION_KINDS)[number];

export function isAdministrationActionKind(
  value: string,
): value is AdministrationActionKind {
  return (ADMINISTRATION_ACTION_KINDS as readonly string[]).includes(value);
}

export const ADMINISTRATION_NAVIGATION_VISIBILITY = [
  "visible",
  "hidden",
  "permission-gated",
] as const;

export type AdministrationNavigationVisibility =
  (typeof ADMINISTRATION_NAVIGATION_VISIBILITY)[number];

export function isAdministrationNavigationVisibility(
  value: string,
): value is AdministrationNavigationVisibility {
  return (ADMINISTRATION_NAVIGATION_VISIBILITY as readonly string[]).includes(
    value,
  );
}

export const ADMINISTRATION_DIAGNOSTIC_SEVERITY = [
  "info",
  "warning",
  "error",
  "critical",
] as const;

export type AdministrationDiagnosticSeverity =
  (typeof ADMINISTRATION_DIAGNOSTIC_SEVERITY)[number];

export function isAdministrationDiagnosticSeverity(
  value: string,
): value is AdministrationDiagnosticSeverity {
  return (ADMINISTRATION_DIAGNOSTIC_SEVERITY as readonly string[]).includes(
    value,
  );
}

export const ADMINISTRATION_REFERENCE_KINDS = [
  "module",
  "capability",
  "documentation",
  "external",
] as const;

export type AdministrationReferenceKind =
  (typeof ADMINISTRATION_REFERENCE_KINDS)[number];

export function isAdministrationReferenceKind(
  value: string,
): value is AdministrationReferenceKind {
  return (ADMINISTRATION_REFERENCE_KINDS as readonly string[]).includes(value);
}

export const ADMINISTRATION_POLICY_KINDS = [
  "access",
  "audit",
  "retention",
  "operational",
] as const;

export type AdministrationPolicyKind =
  (typeof ADMINISTRATION_POLICY_KINDS)[number];

export function isAdministrationPolicyKind(
  value: string,
): value is AdministrationPolicyKind {
  return (ADMINISTRATION_POLICY_KINDS as readonly string[]).includes(value);
}

export const ADMINISTRATION_WIDGET_KINDS = [
  "card",
  "chart",
  "table",
  "summary",
  "metric",
] as const;

export type AdministrationWidgetKind =
  (typeof ADMINISTRATION_WIDGET_KINDS)[number];

export function isAdministrationWidgetKind(
  value: string,
): value is AdministrationWidgetKind {
  return (ADMINISTRATION_WIDGET_KINDS as readonly string[]).includes(value);
}

export const ADMINISTRATION_AUDIT_ACTIONS = [
  "created",
  "updated",
  "registered",
  "lifecycle_changed",
  "policy_attached",
  "diagnosed",
  "archived",
] as const;

export type AdministrationAuditAction =
  (typeof ADMINISTRATION_AUDIT_ACTIONS)[number];

export function isAdministrationAuditAction(
  value: string,
): value is AdministrationAuditAction {
  return (ADMINISTRATION_AUDIT_ACTIONS as readonly string[]).includes(value);
}
