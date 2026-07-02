import type { CapabilityRegistry } from "../capability-registry/registry";
import type { Capability } from "../capability/types";
import type { CapabilityLifecycleState } from "../capability/types";
import type { ConfigurationDiagnostics } from "../configuration-manager/interfaces/types";
import type { RuntimeConfiguration } from "../configuration-manager/interfaces/types";
import type { HealthDiagnostics } from "../health-manager/interfaces/types";
import type { CapabilityLifecycleManager } from "../lifecycle-manager/manager";
import type { OrchestratorError } from "./errors";

export type RuntimePlatformStatus =
  "idle" | "initialising" | "ready" | "degraded" | "failed" | "shutting-down";

/** Ordered startup steps coordinated by the Runtime Orchestrator. */
export type OrchestratorStepId =
  | "configuration"
  | "discovery"
  | "manifest-engine"
  | "dependency-graph"
  | "capability-registry"
  | "lifecycle-manager"
  | "health-manager"
  | "platform-ready";

export const STARTUP_STEP_ORDER: readonly OrchestratorStepId[] = [
  "configuration",
  "discovery",
  "manifest-engine",
  "dependency-graph",
  "capability-registry",
  "lifecycle-manager",
  "health-manager",
  "platform-ready",
] as const;

export interface OrchestratorStepResult {
  readonly step: OrchestratorStepId;
  readonly success: boolean;
  readonly durationMs: number;
  readonly message?: string;
  readonly errors?: readonly OrchestratorError[];
}

export interface RuntimeConfigurationSummary {
  readonly validationStatus: ConfigurationDiagnostics["validationStatus"];
  readonly platformVersion: string;
  readonly runtimeMode: string;
  readonly failFast: boolean;
  readonly workspaceRoot: string;
}

export interface RuntimeDiscoverySummary {
  readonly capabilityCount: number;
  readonly roots: readonly string[];
  readonly scannedRoots: readonly string[];
}

export interface RuntimeManifestSummary {
  readonly validatedCount: number;
  readonly rejectedCount: number;
}

export interface RuntimeDependencySummary {
  readonly resolvedCount: number;
  readonly dependencyOrder: readonly string[];
}

export interface RuntimeLifecycleSummary {
  readonly capabilityCount: number;
  readonly stateSummary: Readonly<Partial<Record<CapabilityLifecycleState, number>>>;
}

export interface RuntimeHealthSummary {
  readonly status: HealthDiagnostics["status"];
  readonly summary: string;
  readonly providerCount: number;
  readonly failedProviders: readonly string[];
}

export interface RuntimeDiagnostics {
  readonly status: RuntimePlatformStatus;
  readonly steps: readonly OrchestratorStepResult[];
  readonly platformReady: boolean;
  readonly capabilityCount: number;
  readonly registryCount: number;
  readonly lastBootstrap: string | undefined;
  readonly placeholders: readonly string[];
  readonly fatalErrors: readonly OrchestratorError[];
  readonly startupDurationMs: number;
  readonly configuration: RuntimeConfigurationSummary;
  readonly discovery: RuntimeDiscoverySummary;
  readonly manifest: RuntimeManifestSummary;
  readonly dependencies: RuntimeDependencySummary;
  readonly lifecycle: RuntimeLifecycleSummary;
  readonly health: RuntimeHealthSummary;
  readonly warnings: readonly OrchestratorError[];
}

export interface BootstrapOptions {
  readonly workspaceRoot?: string;
  readonly platformVersion?: string;
  readonly failFast?: boolean;
  readonly discovery?: RuntimeConfiguration["discovery"];
  readonly onPlatformReady?: () => void;
}

export interface BootstrapResult {
  readonly success: boolean;
  readonly status: RuntimePlatformStatus;
  readonly diagnostics: RuntimeDiagnostics;
}

export interface OrchestratorRuntimeContext {
  configuration: RuntimeConfiguration;
  registry: CapabilityRegistry;
  lifecycle: CapabilityLifecycleManager;
  capabilities: readonly Capability[];
  dependencyOrder: readonly string[];
  steps: OrchestratorStepResult[];
  fatalErrors: OrchestratorError[];
  platformReady: boolean;
  placeholders: string[];
  lastBootstrap: string | undefined;
  scannedDiscoveryRoots: readonly string[];
  manifestRejectedCount: number;
  warnings: OrchestratorError[];
}

export interface ShutdownResult {
  readonly success: boolean;
  readonly status: RuntimePlatformStatus;
  readonly message: string;
}

export interface RestartResult extends BootstrapResult {
  readonly shutdownMessage: string;
}
