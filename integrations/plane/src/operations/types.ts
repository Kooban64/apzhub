/**
 * Plane operational certification types (OSS-101-09).
 * Vendor-neutral patterns for future adapters — Plane-specific values stay in metadata.
 */

export type PlaneOperationalHealthLevel =
  | "HEALTHY"
  | "DEGRADED"
  | "LIMITED"
  | "UNAVAILABLE";

export type PlaneCapabilityAvailability =
  | "available"
  | "degraded"
  | "unavailable"
  | "optional_unavailable"
  | "unknown";

export type PlaneEdition = "community" | "enterprise" | "unknown";

export interface PlaneCapabilityCertification {
  readonly capabilityId: string;
  readonly serviceId: string;
  readonly implemented: boolean;
  readonly available: boolean;
  readonly enabled: boolean;
  readonly supportedOperations: readonly string[];
  readonly minimumPlaneVersion: string;
  readonly optional: boolean;
  readonly degraded: boolean;
  readonly status: PlaneCapabilityAvailability;
  readonly dependencyRequirements: readonly string[];
  readonly reasons: readonly string[];
}

export interface PlaneCompatibilityMatrix {
  readonly detectedPlaneVersion?: string;
  readonly supportedVersionRange: {
    readonly min: string;
    readonly max: string;
  };
  readonly compatibilityStatus: "compatible" | "incompatible" | "warning" | "not_checked";
  readonly edition: PlaneEdition;
  readonly unsupportedFeatures: readonly string[];
  readonly deprecatedApis: readonly string[];
  readonly optionalCapabilities: readonly string[];
  readonly communityVsEnterpriseNotes: readonly string[];
  readonly reasons: readonly string[];
}

export type PlaneReadinessCheckId =
  | "configuration"
  | "authentication"
  | "connectivity"
  | "capability_registration"
  | "provider_compatibility"
  | "sync_configuration"
  | "webhook_configuration"
  | "metrics_availability"
  | "logger_availability";

export interface PlaneReadinessCheckResult {
  readonly id: PlaneReadinessCheckId;
  readonly ok: boolean;
  readonly required: boolean;
  readonly message: string;
  readonly details?: Readonly<Record<string, string | number | boolean>>;
}

export interface PlaneReadinessResult {
  readonly ready: boolean;
  readonly overallHealth: PlaneOperationalHealthLevel;
  readonly checkedAt: string;
  readonly checks: readonly PlaneReadinessCheckResult[];
  readonly blockingIssues: readonly string[];
  readonly warnings: readonly string[];
}

export interface PlaneFeatureDetectionResult {
  readonly probedAt: string;
  readonly unsupportedEndpoints: readonly string[];
  readonly unavailableCapabilities: readonly string[];
  readonly versionSpecificNotes: readonly string[];
  readonly detections: readonly {
    readonly capabilityId: string;
    readonly endpoint: string;
    readonly available: boolean;
    readonly optional: boolean;
    readonly statusCode?: number;
    readonly note: string;
  }[];
}

export interface PlaneRuntimeDiagnosticsSnapshot {
  readonly adapterVersion: string;
  readonly sdkVersion: string;
  readonly providerVersion?: string;
  readonly capabilityHealth: PlaneOperationalHealthLevel;
  readonly webhookHealth: PlaneOperationalHealthLevel;
  readonly syncReadiness: "ready" | "not_ready" | "degraded" | "unknown";
  readonly authenticationMode: string;
  readonly connectionMode: string;
  readonly apiLatencySummary: {
    readonly lastConnectionLatencyMs?: number;
    readonly p95Ms?: number;
    readonly requestsTotal: number;
    readonly errorsTotal: number;
  };
  readonly recentOperationalFailures: readonly string[];
  readonly circuitBreakerState: string;
  readonly configurationValidationStatus: "valid" | "invalid" | "not_checked";
  readonly healthLevel: PlaneOperationalHealthLevel;
  readonly healthReasons: readonly string[];
}

export interface PlaneOperationalReport {
  readonly reportId: string;
  readonly integrationId: string;
  readonly generatedAt: string;
  readonly correlationId?: string;
  readonly tenantId?: string;
  readonly health: {
    readonly level: PlaneOperationalHealthLevel;
    readonly reasons: readonly string[];
  };
  readonly capabilities: readonly PlaneCapabilityCertification[];
  readonly compatibility: PlaneCompatibilityMatrix;
  readonly readiness: PlaneReadinessResult;
  readonly diagnostics: PlaneRuntimeDiagnosticsSnapshot;
  readonly featureDetection?: PlaneFeatureDetectionResult;
  readonly configurationValidation: {
    readonly ok: boolean;
    readonly issues: readonly string[];
  };
  /** Reusable pattern notes for future adapters. */
  readonly referencePatterns: readonly string[];
}

export const PLANE_CERTIFICATION_CAPABILITY_IDS = [
  "workspaces",
  "projects",
  "tasks",
  "labels",
  "project_states",
  "modules",
  "members",
  "comments",
  "activity",
  "watchers",
  "analytics",
  "synchronisation",
  "webhooks",
  "cycles",
  "events",
] as const;

export type PlaneCertificationCapabilityId =
  (typeof PLANE_CERTIFICATION_CAPABILITY_IDS)[number];
