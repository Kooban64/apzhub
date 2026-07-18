/**
 * Zammad operational certification types (OSS-102-07).
 * Mirrors Plane Reference Adapter operations patterns with Support-domain values.
 */

export type ZammadOperationalHealthLevel =
  "HEALTHY" | "DEGRADED" | "LIMITED" | "UNAVAILABLE";

export type ZammadCapabilityAvailability =
  "available" | "degraded" | "unavailable" | "optional_unavailable" | "unknown";

export type ZammadEdition = "community" | "enterprise" | "unknown";

export type ZammadAdapterCertificationOutcome =
  "CERTIFIED" | "CERTIFIED_WITH_LIMITATIONS" | "NOT_CERTIFIED" | "INCOMPATIBLE";

export interface ZammadCapabilityCertification {
  readonly capabilityId: string;
  readonly serviceId: string;
  readonly implemented: boolean;
  readonly registered: boolean;
  readonly available: boolean;
  readonly enabled: boolean;
  readonly certificationStatus: ZammadCapabilityAvailability;
  readonly status: ZammadCapabilityAvailability;
  readonly supportedOperations: readonly string[];
  readonly unsupportedOperations: readonly string[];
  readonly optional: boolean;
  readonly degraded: boolean;
  readonly degradationReasons: readonly string[];
  readonly dependencyRequirements: readonly string[];
  readonly minimumZammadVersion: string;
  readonly maximumVerifiedZammadVersion: string;
  readonly editionApplicability: readonly ZammadEdition[];
  readonly configurationRequirements: readonly string[];
  readonly knownLimitations: readonly string[];
  readonly testEvidenceRef?: string;
  readonly reasons: readonly string[];
}

export interface ZammadCompatibilityMatrix {
  readonly detectedZammadVersion?: string;
  readonly supportedVersionRange: {
    readonly min: string;
    readonly max: string;
  };
  readonly verifiedVersionRange: {
    readonly min: string;
    readonly max: string;
  };
  readonly compatibilityStatus:
    "compatible" | "incompatible" | "warning" | "unverified" | "not_checked";
  readonly edition: ZammadEdition;
  readonly selfHostedCeCompatible: boolean;
  readonly enterpriseIndicators: readonly string[];
  readonly unsupportedFeatures: readonly string[];
  readonly deprecatedApis: readonly string[];
  readonly unavailableEndpoints: readonly string[];
  readonly versionSpecificDifferences: readonly string[];
  readonly optionalCapabilities: readonly string[];
  readonly communityVsEnterpriseNotes: readonly string[];
  readonly warnings: readonly string[];
  readonly blockingIncompatibilities: readonly string[];
  readonly reasons: readonly string[];
}

export type ZammadReadinessCheckId =
  | "configuration"
  | "authentication"
  | "connectivity"
  | "version_compatibility"
  | "capability_registration"
  | "core_support_readiness"
  | "article_service_readiness"
  | "sync_configuration"
  | "webhook_configuration"
  | "diagnostics_availability"
  | "metrics_availability"
  | "logger_availability";

export interface ZammadReadinessCheckResult {
  readonly id: ZammadReadinessCheckId;
  readonly ok: boolean;
  readonly required: boolean;
  readonly message: string;
  readonly remediationHint?: string;
  readonly details?: Readonly<Record<string, string | number | boolean>>;
}

export interface ZammadReadinessResult {
  readonly ready: boolean;
  readonly overallHealth: ZammadOperationalHealthLevel;
  readonly checkedAt: string;
  readonly checks: readonly ZammadReadinessCheckResult[];
  readonly blockingIssues: readonly string[];
  readonly warnings: readonly string[];
}

export interface ZammadFeatureDetectionResult {
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

export interface ZammadRuntimeDiagnosticsSnapshot {
  readonly adapterVersion: string;
  readonly sdkVersion: string;
  readonly providerVersion?: string;
  readonly supportedVersionRange: { readonly min: string; readonly max: string };
  readonly edition: ZammadEdition;
  readonly authenticationMode: string;
  readonly connectionMode: string;
  readonly configurationValidationStatus: "valid" | "invalid" | "not_checked";
  readonly capabilityCount: number;
  readonly implementedCapabilityCount: number;
  readonly degradedCapabilityCount: number;
  readonly unavailableCapabilityCount: number;
  readonly capabilityHealth: ZammadOperationalHealthLevel;
  readonly webhookHealth: ZammadOperationalHealthLevel;
  readonly syncReadiness: "ready" | "not_ready" | "degraded" | "unknown";
  readonly eventTranslationReadiness: boolean;
  readonly persistentSyncStateSupport: false;
  readonly webhookIngressSupport: false;
  readonly binaryAttachmentSupport: false;
  readonly apiLatencySummary: {
    readonly lastConnectionLatencyMs?: number;
    readonly p95Ms?: number;
    readonly requestsTotal: number;
    readonly errorsTotal: number;
  };
  readonly recentOperationalFailures: readonly string[];
  readonly circuitBreakerState: string;
  readonly healthLevel: ZammadOperationalHealthLevel;
  readonly healthReasons: readonly string[];
  readonly readinessSummary?: string;
}

export interface ZammadReferenceAdapterComplianceResult {
  readonly compliant: boolean;
  readonly outcome: "pass" | "pass_with_limitations" | "fail";
  readonly checks: readonly {
    readonly id: string;
    readonly ok: boolean;
    readonly required: boolean;
    readonly message: string;
  }[];
  readonly deviations: readonly string[];
}

export interface ZammadOperationalReport {
  readonly reportId: string;
  readonly integrationId: string;
  readonly generatedAt: string;
  readonly correlationId?: string;
  readonly tenantId?: string;
  readonly certificationOutcome: ZammadAdapterCertificationOutcome;
  readonly health: {
    readonly level: ZammadOperationalHealthLevel;
    readonly reasons: readonly string[];
  };
  readonly capabilities: readonly ZammadCapabilityCertification[];
  readonly compatibility: ZammadCompatibilityMatrix;
  readonly readiness: ZammadReadinessResult;
  readonly diagnostics: ZammadRuntimeDiagnosticsSnapshot;
  readonly featureDetection?: ZammadFeatureDetectionResult;
  readonly configurationValidation: {
    readonly ok: boolean;
    readonly issues: readonly string[];
  };
  readonly knownLimitations: readonly string[];
  readonly referenceCompliance: ZammadReferenceAdapterComplianceResult;
  readonly referencePatterns: readonly string[];
}

export const ZAMMAD_CERTIFICATION_CAPABILITY_IDS = [
  "support",
  "organizations",
  "groups",
  "users",
  "articles",
  "search",
  "history",
  "analytics",
  "webhooks",
  "events",
  "synchronisation",
] as const;

export type ZammadCertificationCapabilityId =
  (typeof ZAMMAD_CERTIFICATION_CAPABILITY_IDS)[number];
