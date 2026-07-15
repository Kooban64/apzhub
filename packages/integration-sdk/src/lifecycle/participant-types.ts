import type { IntegrationLifecycleState } from "./types";

export interface IntegrationLifecycleContext {
  readonly integrationId: string;
  readonly capabilityId?: string;
  readonly tenantId?: string;
  readonly correlationId: string;
  readonly reason?: string;
}

export interface IntegrationLifecycleResult {
  readonly ok: boolean;
  readonly previousState: IntegrationLifecycleState;
  readonly currentState: IntegrationLifecycleState;
  readonly message: string;
  readonly warnings?: readonly string[];
}

export interface IntegrationLifecycleParticipant {
  readonly integrationId: string;
  readonly lifecycleState: IntegrationLifecycleState;
  onEnable(context: IntegrationLifecycleContext): Promise<IntegrationLifecycleResult>;
  onDisable(context: IntegrationLifecycleContext): Promise<IntegrationLifecycleResult>;
  onShutdown(context: IntegrationLifecycleContext): Promise<IntegrationLifecycleResult>;
}

/** Shape aligned with @apzhub/platform-lifecycle participation records — no package import. */
export interface IntegrationLifecycleParticipationSnapshot {
  readonly capabilityId: string;
  readonly name: string;
  readonly owner: string;
  readonly version: string;
  readonly integrationLifecycleState: IntegrationLifecycleState;
  readonly readiness: "healthy" | "degraded" | "unhealthy" | "unknown";
  readonly shutdownStatus: "none" | "draining" | "complete";
  readonly recoveryStatus: "none" | "in-progress" | "complete";
  readonly versionCompatible: boolean;
  readonly warnings: readonly string[];
}

export interface BuildIntegrationLifecycleParticipationInput {
  readonly capabilityId: string;
  readonly name: string;
  readonly owner: string;
  readonly version: string;
  readonly lifecycleState: IntegrationLifecycleState;
  readonly healthStatus?: "healthy" | "degraded" | "unavailable" | "disabled";
  readonly versionCompatible?: boolean;
  readonly warnings?: readonly string[];
}
