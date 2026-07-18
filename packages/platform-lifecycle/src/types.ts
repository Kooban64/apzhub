import type {
  ConsolidatedOperationalDiagnostics,
  HealthSignalStatus,
} from "@apzhub/platform-security";

/** Canonical platform lifecycle states (PRH-009). */
export type PlatformLifecycleState =
  | "initializing"
  | "bootstrapping"
  | "configuration-ready"
  | "identity-ready"
  | "authorization-ready"
  | "platform-ready"
  | "products-ready"
  | "operational"
  | "maintenance"
  | "degraded"
  | "recovering"
  | "stopping"
  | "stopped";

export type LifecycleShutdownStatus = "none" | "draining" | "complete";
export type LifecycleRecoveryStatus = "none" | "in-progress" | "complete";

export interface CapabilityLifecycleParticipation {
  readonly capabilityId: string;
  readonly name: string;
  readonly owner: string;
  readonly version: string;
  readonly lifecycleState: PlatformLifecycleState;
  readonly dependencies: readonly string[];
  readonly readiness: HealthSignalStatus;
  readonly shutdownStatus: LifecycleShutdownStatus;
  readonly recoveryStatus: LifecycleRecoveryStatus;
  readonly sequenceOrder: number;
  readonly versionCompatible: boolean;
  readonly warnings: readonly string[];
}

export interface ProductLifecycleParticipation {
  readonly productId: string;
  readonly name: string;
  readonly version: string;
  readonly lifecycleState: PlatformLifecycleState;
  readonly dependencies: readonly string[];
  readonly readiness: HealthSignalStatus;
  readonly shutdownStatus: LifecycleShutdownStatus;
  readonly recoveryStatus: LifecycleRecoveryStatus;
  readonly versionCompatible: boolean;
  readonly warnings: readonly string[];
}

export interface LifecycleTransitionRecord {
  readonly from: PlatformLifecycleState | null;
  readonly to: PlatformLifecycleState;
  readonly timestamp: string;
  readonly reason?: string;
  readonly source?: string;
}

export interface VersionCompatibilityReport {
  readonly platformVersion: string;
  readonly compatible: boolean;
  readonly checks: readonly {
    readonly id: string;
    readonly version: string;
    readonly constraint?: string;
    readonly compatible: boolean;
    readonly message: string;
  }[];
}

export interface PlatformLifecycleSnapshot {
  readonly generatedAt: string;
  readonly platformVersion: string;
  readonly buildNumber: string;
  readonly environment: string;
  readonly currentState: PlatformLifecycleState;
  readonly previousState: PlatformLifecycleState | null;
  readonly maintenanceMode: boolean;
  readonly shutdownStatus: LifecycleShutdownStatus;
  readonly recoveryStatus: LifecycleRecoveryStatus;
  readonly allowedTransitions: readonly PlatformLifecycleState[];
  readonly startupSequence: readonly string[];
  readonly capabilities: readonly CapabilityLifecycleParticipation[];
  readonly products: readonly ProductLifecycleParticipation[];
  readonly versionCompatibility: VersionCompatibilityReport;
  readonly readinessGates: readonly {
    readonly gate: PlatformLifecycleState;
    readonly satisfied: boolean;
    readonly message: string;
  }[];
  readonly warnings: readonly string[];
  readonly recommendations: readonly string[];
}

export interface PlatformLifecycleInput {
  readonly consolidated: ConsolidatedOperationalDiagnostics;
  readonly bootstrapReady: boolean;
  readonly platformVersion: string;
  readonly buildNumber: string;
  readonly environment: string;
  readonly productStatuses?: Readonly<Record<string, HealthSignalStatus>>;
}

export type LifecycleOperatorAction =
  | "enter-maintenance"
  | "exit-maintenance"
  | "begin-shutdown"
  | "complete-shutdown"
  | "begin-recovery";

export interface LifecycleActionResult {
  readonly success: boolean;
  readonly action: LifecycleOperatorAction;
  readonly previousState: PlatformLifecycleState;
  readonly currentState: PlatformLifecycleState;
  readonly message: string;
  readonly timestamp: string;
}
