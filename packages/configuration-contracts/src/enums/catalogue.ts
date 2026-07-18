/**
 * Platform Configuration enums (APZCONFIG-001).
 * Metadata catalogue only — no runtime resolution or secret storage.
 */

export const CONFIGURATION_LIFECYCLE_STATUSES = [
  "draft",
  "validated",
  "approved",
  "published",
  "deprecated",
  "archived",
] as const;

export type ConfigurationLifecycleStatus =
  (typeof CONFIGURATION_LIFECYCLE_STATUSES)[number];

export function isConfigurationLifecycleStatus(
  value: string,
): value is ConfigurationLifecycleStatus {
  return (CONFIGURATION_LIFECYCLE_STATUSES as readonly string[]).includes(value);
}

/** Hierarchy levels — inheritance metadata only (no runtime apply). */
export const CONFIGURATION_HIERARCHY_LEVELS = [
  "platform",
  "tenant",
  "organisation",
  "product",
  "environment",
  "user",
] as const;

export type ConfigurationHierarchyLevel =
  (typeof CONFIGURATION_HIERARCHY_LEVELS)[number];

export function isConfigurationHierarchyLevel(
  value: string,
): value is ConfigurationHierarchyLevel {
  return (CONFIGURATION_HIERARCHY_LEVELS as readonly string[]).includes(value);
}

/**
 * Override precedence (highest wins): user → environment → product →
 * organisation → tenant → platform.
 */
export const CONFIGURATION_OVERRIDE_PRECEDENCE: readonly ConfigurationHierarchyLevel[] =
  ["user", "environment", "product", "organisation", "tenant", "platform"] as const;

export const CONFIGURATION_SCOPES = [
  "global",
  "tenant",
  "organisation",
  "product",
  "environment",
  "user",
] as const;

export type ConfigurationScopeKind = (typeof CONFIGURATION_SCOPES)[number];

export function isConfigurationScopeKind(
  value: string,
): value is ConfigurationScopeKind {
  return (CONFIGURATION_SCOPES as readonly string[]).includes(value);
}

/** Validation rule kinds — metadata only; validators are not executed here. */
export const CONFIGURATION_VALIDATION_KINDS = [
  "string",
  "number",
  "boolean",
  "enum",
  "json",
  "array",
  "object",
  "pattern",
  "range",
  "required",
  "custom",
] as const;

export type ConfigurationValidationKind =
  (typeof CONFIGURATION_VALIDATION_KINDS)[number];

export function isConfigurationValidationKind(
  value: string,
): value is ConfigurationValidationKind {
  return (CONFIGURATION_VALIDATION_KINDS as readonly string[]).includes(value);
}

/** Value payload kinds — never secrets or credentials. */
export const CONFIGURATION_VALUE_KINDS = [
  "string",
  "number",
  "boolean",
  "json",
  "array",
  "object",
  "null",
] as const;

export type ConfigurationValueKind = (typeof CONFIGURATION_VALUE_KINDS)[number];

export function isConfigurationValueKind(
  value: string,
): value is ConfigurationValueKind {
  return (CONFIGURATION_VALUE_KINDS as readonly string[]).includes(value);
}

export const CONFIGURATION_REFERENCE_KINDS = [
  "projects",
  "support",
  "testing",
  "reporting",
  "documents",
  "workflow",
  "search",
  "notifications",
  "future",
] as const;

export type ConfigurationReferenceKind = (typeof CONFIGURATION_REFERENCE_KINDS)[number];

export function isConfigurationReferenceKind(
  value: string,
): value is ConfigurationReferenceKind {
  return (CONFIGURATION_REFERENCE_KINDS as readonly string[]).includes(value);
}

export const CONFIGURATION_AUDIT_ACTIONS = [
  "created",
  "updated",
  "lifecycle_changed",
  "version_created",
  "override_created",
  "override_updated",
  "validation_attached",
  "published",
  "deprecated",
  "archived",
  "rollback_recorded",
] as const;

export type ConfigurationAuditAction = (typeof CONFIGURATION_AUDIT_ACTIONS)[number];
