export type GitHubActionsOperationalHealthLevel =
  | "HEALTHY"
  | "DEGRADED"
  | "LIMITED"
  | "UNAVAILABLE";

export type GitHubActionsCapabilityAvailability =
  | "available"
  | "degraded"
  | "unavailable"
  | "optional_unavailable"
  | "unknown";

export interface GitHubActionsCapabilityCertification {
  readonly capabilityId: string;
  readonly serviceId: string;
  readonly implemented: boolean;
  readonly available: boolean;
  readonly optional: boolean;
  readonly status: GitHubActionsCapabilityAvailability;
  readonly supportedOperations: readonly string[];
  readonly unsupportedOperations: readonly string[];
  readonly knownLimitations: readonly string[];
}

export interface GitHubActionsCompatibilityMatrix {
  readonly configuredApiVersion: string;
  readonly supportedApiVersion: string;
  readonly compatibilityStatus:
    | "compatible"
    | "incompatible"
    | "warning"
    | "unverified"
    | "not_checked";
  readonly warnings: readonly string[];
  readonly blockingIncompatibilities: readonly string[];
  readonly unsupportedFeatures: readonly string[];
  readonly optionalCapabilities: readonly string[];
  readonly reasons: readonly string[];
}

export interface GitHubActionsFeatureDetectionResult {
  readonly probedAt: string;
  readonly approvalsAvailable: boolean;
  readonly environmentsAvailable: boolean;
  readonly detections: readonly {
    readonly capabilityId: string;
    readonly endpoint: string;
    readonly available: boolean;
    readonly optional: boolean;
    readonly note: string;
  }[];
}

export interface GitHubActionsRuntimeDiagnosticsSnapshot {
  readonly adapterVersion: string;
  readonly sdkVersion: string;
  readonly apiVersion: string;
  readonly authenticationMode: string;
  readonly authMode: string;
  readonly configurationValidationStatus: "valid" | "invalid" | "not_checked";
  readonly apiStatus: "reachable" | "degraded" | "unavailable" | "not_tested";
  readonly authenticationStatus: "valid" | "missing" | "invalid" | "unknown";
  readonly rateLimitRemaining?: number;
  readonly rateLimitLimit?: number;
  readonly rateLimitReset?: number;
  readonly lastConnectionLatencyMs?: number;
  readonly connectedLogin?: string;
  readonly capabilityCount: number;
  readonly healthLevel: GitHubActionsOperationalHealthLevel;
  readonly healthReasons: readonly string[];
  readonly circuitBreakerState: string;
  readonly oauthEnabled: boolean;
  readonly unsupportedOperations: readonly string[];
}
