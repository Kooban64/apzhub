/** Analytics Platform enumerations (APZHUB-PLATFORM-ANALYTICS-003). */

export const ANALYTICS_LIFECYCLE_STATUSES = [
  "draft",
  "published",
  "deprecated",
  "archived",
] as const;

export type AnalyticsLifecycleStatus = (typeof ANALYTICS_LIFECYCLE_STATUSES)[number];

export function isAnalyticsLifecycleStatus(
  value: string,
): value is AnalyticsLifecycleStatus {
  return (ANALYTICS_LIFECYCLE_STATUSES as readonly string[]).includes(value);
}

export const ANALYTICS_HEALTH_STATUSES = [
  "healthy",
  "degraded",
  "unavailable",
  "unknown",
] as const;

export type AnalyticsHealthStatus = (typeof ANALYTICS_HEALTH_STATUSES)[number];

export function isAnalyticsHealthStatus(value: string): value is AnalyticsHealthStatus {
  return (ANALYTICS_HEALTH_STATUSES as readonly string[]).includes(value);
}

export const ANALYTICS_PERMISSION_SUBJECT_KINDS = ["user", "role", "group"] as const;

export type AnalyticsPermissionSubjectKind =
  (typeof ANALYTICS_PERMISSION_SUBJECT_KINDS)[number];

export const ANALYTICS_EMBED_MODES = [
  "signed",
  "public_disabled",
  "interactive",
] as const;

export type AnalyticsEmbedMode = (typeof ANALYTICS_EMBED_MODES)[number];

export const ANALYTICS_FILTER_KINDS = [
  "text",
  "number",
  "boolean",
  "date",
  "datetime",
  "enum",
  "multi_enum",
] as const;

export type AnalyticsFilterKind = (typeof ANALYTICS_FILTER_KINDS)[number];

export const ANALYTICS_CAPABILITY_SUPPORT = [
  "supported",
  "partial",
  "planned",
  "not_supported",
] as const;

export type AnalyticsCapabilitySupport = (typeof ANALYTICS_CAPABILITY_SUPPORT)[number];
