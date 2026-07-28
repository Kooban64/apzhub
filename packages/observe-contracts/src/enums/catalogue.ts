/**
 * Observability enumerations (APZOBSERVE-001).
 * Metadata plane only — not Prometheus/Loki/Grafana runtime enums.
 */

export const OBSERVE_HEALTH_STATUSES = [
  "unknown",
  "healthy",
  "degraded",
  "unhealthy",
  "maintenance",
] as const;
export type ObserveHealthStatus = (typeof OBSERVE_HEALTH_STATUSES)[number];
export function isObserveHealthStatus(value: string): value is ObserveHealthStatus {
  return (OBSERVE_HEALTH_STATUSES as readonly string[]).includes(value);
}

export const OBSERVE_READINESS_STATUSES = ["unknown", "ready", "not_ready"] as const;
export type ObserveReadinessStatus = (typeof OBSERVE_READINESS_STATUSES)[number];
export function isObserveReadinessStatus(
  value: string,
): value is ObserveReadinessStatus {
  return (OBSERVE_READINESS_STATUSES as readonly string[]).includes(value);
}

export const OBSERVE_LIVENESS_STATUSES = ["unknown", "alive", "not_alive"] as const;
export type ObserveLivenessStatus = (typeof OBSERVE_LIVENESS_STATUSES)[number];
export function isObserveLivenessStatus(value: string): value is ObserveLivenessStatus {
  return (OBSERVE_LIVENESS_STATUSES as readonly string[]).includes(value);
}

export const OBSERVE_ALERT_SEVERITIES = ["info", "warning", "critical"] as const;
export type ObserveAlertSeverity = (typeof OBSERVE_ALERT_SEVERITIES)[number];
export function isObserveAlertSeverity(value: string): value is ObserveAlertSeverity {
  return (OBSERVE_ALERT_SEVERITIES as readonly string[]).includes(value);
}

export const OBSERVE_ALERT_STATES = [
  "inactive",
  "pending",
  "firing",
  "resolved",
  "silenced",
] as const;
export type ObserveAlertStateKind = (typeof OBSERVE_ALERT_STATES)[number];
export function isObserveAlertStateKind(value: string): value is ObserveAlertStateKind {
  return (OBSERVE_ALERT_STATES as readonly string[]).includes(value);
}

/** ADR-0070 alert category model — metadata classification, not a separate SoR. */
export const OBSERVE_ALERT_CATEGORIES = [
  "platform_health",
  "component",
  "capacity",
  "security",
  "integration",
  "custom",
] as const;
export type ObserveAlertCategory = (typeof OBSERVE_ALERT_CATEGORIES)[number];
export function isObserveAlertCategory(value: string): value is ObserveAlertCategory {
  return (OBSERVE_ALERT_CATEGORIES as readonly string[]).includes(value);
}

/** Phase A evaluation signal sources — Observe metadata SoR only (no PromQL). */
export const OBSERVE_ALERT_SIGNAL_SOURCES = [
  "serviceHealth",
  "componentStatus",
  "healthSummary",
  "serviceStatus",
  "readinessCheck",
  "livenessCheck",
] as const;
export type ObserveAlertSignalSource = (typeof OBSERVE_ALERT_SIGNAL_SOURCES)[number];
export function isObserveAlertSignalSource(
  value: string,
): value is ObserveAlertSignalSource {
  return (OBSERVE_ALERT_SIGNAL_SOURCES as readonly string[]).includes(value);
}

export const OBSERVE_ALERT_EVALUATION_OUTCOMES = [
  "match",
  "clear",
  "unknown",
  "error",
] as const;
export type ObserveAlertEvaluationOutcome =
  (typeof OBSERVE_ALERT_EVALUATION_OUTCOMES)[number];
export function isObserveAlertEvaluationOutcome(
  value: string,
): value is ObserveAlertEvaluationOutcome {
  return (OBSERVE_ALERT_EVALUATION_OUTCOMES as readonly string[]).includes(value);
}

export const OBSERVE_METRIC_KINDS = [
  "counter",
  "gauge",
  "histogram",
  "summary",
  "unknown",
] as const;
export type ObserveMetricKind = (typeof OBSERVE_METRIC_KINDS)[number];
export function isObserveMetricKind(value: string): value is ObserveMetricKind {
  return (OBSERVE_METRIC_KINDS as readonly string[]).includes(value);
}

export const OBSERVE_LOG_SOURCE_KINDS = [
  "application",
  "platform",
  "infrastructure",
  "audit",
  "other",
] as const;
export type ObserveLogSourceKind = (typeof OBSERVE_LOG_SOURCE_KINDS)[number];
export function isObserveLogSourceKind(value: string): value is ObserveLogSourceKind {
  return (OBSERVE_LOG_SOURCE_KINDS as readonly string[]).includes(value);
}

export const OBSERVE_PROVIDER_KINDS = [
  "prometheus",
  "loki",
  "grafana",
  "opentelemetry",
  "alertmanager",
  "internal",
  "unknown",
] as const;
export type ObserveProviderKind = (typeof OBSERVE_PROVIDER_KINDS)[number];
export function isObserveProviderKind(value: string): value is ObserveProviderKind {
  return (OBSERVE_PROVIDER_KINDS as readonly string[]).includes(value);
}

export const OBSERVE_METADATA_STATUSES = [
  "draft",
  "active",
  "inactive",
  "archived",
] as const;
export type ObserveMetadataStatus = (typeof OBSERVE_METADATA_STATUSES)[number];
export function isObserveMetadataStatus(value: string): value is ObserveMetadataStatus {
  return (OBSERVE_METADATA_STATUSES as readonly string[]).includes(value);
}
