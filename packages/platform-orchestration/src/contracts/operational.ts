/**
 * Enterprise Operational Platform contracts (QO-016).
 * Primary output: Operational Readiness Package.
 *
 * Operational readiness is descriptive, never prescriptive.
 * Operational APIs expose the platform — they never define it.
 * References only — never duplicates platform state.
 */

/** Provider-neutral operational contract kinds. */
export const OPERATIONAL_CONTRACT_KINDS = [
  "health",
  "readiness",
  "liveness",
  "startup",
  "shutdown",
  "degraded_operation",
  "maintenance_state",
] as const;

export type OperationalContractKind = (typeof OPERATIONAL_CONTRACT_KINDS)[number];

export const OPERATIONAL_CONTRACT_STATES = [
  "healthy",
  "ready",
  "live",
  "starting",
  "stopping",
  "stopped",
  "degraded",
  "maintenance",
  "unknown",
] as const;

export type OperationalContractState = (typeof OPERATIONAL_CONTRACT_STATES)[number];

export const OPERATIONAL_READINESS_STATUSES = [
  "ready",
  "degraded",
  "not_ready",
  "maintenance",
  "superseded",
] as const;

export type OperationalReadinessStatus =
  (typeof OPERATIONAL_READINESS_STATUSES)[number];

/**
 * Descriptive operational contract snapshot.
 * Describes state only — never performs actions.
 */
export interface OperationalContract {
  readonly contractId: string;
  readonly kind: OperationalContractKind;
  readonly state: OperationalContractState;
  readonly checkedAt: string;
  readonly detail: string;
  readonly sourceRefs: readonly string[];
  readonly descriptive: true;
  readonly prescriptive: false;
  readonly metadata: Readonly<Record<string, string>>;
}

export interface OperationalEndpointRef {
  readonly endpointId: string;
  /** Logical endpoint name — not a live HTTP route registration. */
  readonly name: string;
  readonly pathHint: string;
  readonly methodHint: "GET";
  readonly purpose: string;
  readonly metadata: Readonly<Record<string, string>>;
}

export interface VersionMetadata {
  readonly version: string;
  readonly programme: string;
  readonly slice: string;
  readonly legacySlice: string;
  readonly buildRef?: string;
  readonly checkedAt: string;
}

export interface DeploymentMetadataRef {
  readonly deploymentRef?: string;
  readonly environmentRef?: string;
  readonly runtimeRef?: string;
  readonly featureFlagRefs: readonly string[];
  readonly configurationRefs: readonly string[];
  readonly descriptive: true;
  readonly mutatesNothing: true;
}

export interface OperationalMetadata {
  readonly version: VersionMetadata;
  readonly buildRef?: string;
  readonly deployment: DeploymentMetadataRef;
  readonly runtimeRef?: string;
  readonly environmentRef?: string;
  readonly featureFlagRefs: readonly string[];
  readonly configurationRefs: readonly string[];
  readonly operationalCapabilityRefs: readonly string[];
  readonly descriptive: true;
}

export interface OperationalDiagnosticsSnapshot {
  readonly healthStatistics: Readonly<Record<string, number>>;
  readonly readinessStatistics: Readonly<Record<string, number>>;
  readonly livenessStatistics: Readonly<Record<string, number>>;
  readonly versionStatistics: Readonly<Record<string, string>>;
  readonly endpointCount: number;
  readonly eventPublishCount: number;
  readonly health: "healthy" | "degraded" | "unhealthy";
  readonly ready: boolean;
  readonly checkedAt: string;
}

export interface OperationalAuditEntry {
  readonly entryId: string;
  readonly timestamp: string;
  readonly action: string;
  readonly actorId?: string;
  readonly detail: string;
}

/**
 * Authoritative SoR for operational readiness only.
 * Descriptive snapshot — never performs deployments or config mutation.
 */
export interface OperationalReadinessPackage {
  readonly operationalReadinessPackageId: string;
  readonly healthContract: OperationalContract;
  readonly readinessContract: OperationalContract;
  readonly livenessContract: OperationalContract;
  readonly startupContract: OperationalContract;
  readonly shutdownContract: OperationalContract;
  readonly degradedOperationContract: OperationalContract;
  readonly maintenanceStateContract: OperationalContract;
  readonly diagnostics: OperationalDiagnosticsSnapshot;
  readonly operationalMetadata: OperationalMetadata;
  readonly operationalEndpoints: readonly OperationalEndpointRef[];
  readonly executiveExperiencePackageRef?: string;
  readonly evidenceIntegrationPackageRef?: string;
  readonly decisionPackageRef?: string;
  readonly auditRefs: readonly string[];
  readonly readinessStatus: OperationalReadinessStatus;
  readonly createdAt: string;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly actorId?: string;
  readonly supersedesPackageId?: string;
  readonly auditHistory: readonly OperationalAuditEntry[];
  readonly metadata: Readonly<Record<string, string>>;
  /** Explicit architectural guards. */
  readonly descriptive: true;
  readonly prescriptive: false;
  readonly performsDeployments: false;
  readonly mutatesConfiguration: false;
}

export interface CreateOperationalReadinessPackageInput {
  readonly executiveExperiencePackageRef?: string;
  readonly evidenceIntegrationPackageRef?: string;
  readonly decisionPackageRef?: string;
  readonly healthState?: OperationalContractState;
  readonly readinessState?: OperationalContractState;
  readonly livenessState?: OperationalContractState;
  readonly startupState?: OperationalContractState;
  readonly shutdownState?: OperationalContractState;
  readonly degradedState?: OperationalContractState;
  readonly maintenanceState?: OperationalContractState;
  readonly buildRef?: string;
  readonly deploymentRef?: string;
  readonly environmentRef?: string;
  readonly runtimeRef?: string;
  readonly featureFlagRefs?: readonly string[];
  readonly configurationRefs?: readonly string[];
  readonly operationalCapabilityRefs?: readonly string[];
  readonly auditRefs?: readonly string[];
  readonly supersedesPackageId?: string;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly actorId?: string;
  readonly metadata?: Readonly<Record<string, string>>;
  readonly auditContext?: Readonly<Record<string, string>>;
}

export interface OperationalPlatformDiagnostics {
  readonly packageCount: number;
  readonly healthStatistics: Readonly<Record<string, number>>;
  readonly readinessStatistics: Readonly<Record<string, number>>;
  readonly livenessStatistics: Readonly<Record<string, number>>;
  readonly versionStatistics: Readonly<Record<string, string>>;
  readonly endpointStatistics: Readonly<Record<string, number>>;
  readonly eventPublishCount: number;
  readonly health: "healthy" | "degraded" | "unhealthy";
  readonly ready: boolean;
  readonly checkedAt: string;
}
