import type { VersionCompatibilityStatus } from "@apzhub/integration-sdk";

export type KimaiOperationalHealthLevel =
  "HEALTHY" | "DEGRADED" | "LIMITED" | "UNAVAILABLE";

export type KimaiCapabilityAvailability =
  "available" | "degraded" | "unavailable" | "not_applicable";

export interface KimaiCompatibilityMatrix {
  readonly detectedKimaiVersion?: string;
  readonly supportedVersionRange: {
    readonly min: string;
    readonly max: string;
  };
  readonly compatibilityStatus: VersionCompatibilityStatus | "partial";
  readonly edition: "community";
  readonly unsupportedFeatures: readonly string[];
  readonly reasons: readonly string[];
  readonly adapterVersion: string;
  readonly notes: readonly string[];
}

export interface KimaiFeatureDetectionResult {
  readonly checkedAt: string;
  readonly pingAvailable: boolean;
  readonly versionAvailable: boolean;
  readonly unsupportedEndpoints: readonly string[];
  readonly unavailableCapabilities: readonly string[];
  readonly notes: readonly string[];
}

export interface KimaiCapabilityCertification {
  readonly capabilityId: string;
  readonly displayName: string;
  readonly availability: KimaiCapabilityAvailability;
  readonly optional: boolean;
  readonly minimumKimaiVersion: string;
  readonly dependencyRequirements: readonly string[];
  readonly notes: readonly string[];
}

export interface KimaiReadinessCheckResult {
  readonly id: string;
  readonly ok: boolean;
  readonly required: boolean;
  readonly message: string;
  readonly details?: Readonly<Record<string, number | string | boolean>>;
}

export interface KimaiReadinessResult {
  readonly ready: boolean;
  readonly classification: "ready" | "ready_with_warnings" | "not_ready";
  readonly checkedAt: string;
  readonly checks: readonly KimaiReadinessCheckResult[];
  readonly warnings: readonly string[];
  readonly blockingFailures: readonly string[];
}

export interface KimaiRuntimeDiagnosticsSnapshot {
  readonly adapterVersion: string;
  readonly healthLevel: KimaiOperationalHealthLevel;
  readonly reasons: readonly string[];
  readonly compatibility: KimaiCompatibilityMatrix;
  readonly readiness: KimaiReadinessResult;
  readonly featureDetection: KimaiFeatureDetectionResult;
  readonly certifications: readonly KimaiCapabilityCertification[];
  readonly apiStatus: string;
  readonly authenticationStatus: string;
  readonly authMode: string;
  readonly detectedKimaiVersion?: string;
  readonly lastLatencyMs?: number;
  readonly coreServiceCount: number;
}

export interface KimaiOperationalReport {
  readonly generatedAt: string;
  readonly healthLevel: KimaiOperationalHealthLevel;
  readonly readiness: KimaiReadinessResult;
  readonly compatibility: KimaiCompatibilityMatrix;
  readonly featureDetection: KimaiFeatureDetectionResult;
  readonly certifications: readonly KimaiCapabilityCertification[];
  readonly diagnostics: KimaiRuntimeDiagnosticsSnapshot;
}
