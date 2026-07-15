import type { BuildIntegrationLifecycleParticipationInput, IntegrationLifecycleParticipationSnapshot } from "./participant-types";
import {
  mapHealthStatusToParticipationReadiness,
  mapLifecycleStateToRecoveryStatus,
  mapLifecycleStateToShutdownStatus,
} from "./integration-transitions";

export function buildIntegrationLifecycleParticipation(
  input: BuildIntegrationLifecycleParticipationInput,
): IntegrationLifecycleParticipationSnapshot {
  return {
    capabilityId: input.capabilityId,
    name: input.name,
    owner: input.owner,
    version: input.version,
    integrationLifecycleState: input.lifecycleState,
    readiness: mapHealthStatusToParticipationReadiness(input.healthStatus),
    shutdownStatus: mapLifecycleStateToShutdownStatus(input.lifecycleState),
    recoveryStatus: mapLifecycleStateToRecoveryStatus(input.lifecycleState),
    versionCompatible: input.versionCompatible ?? true,
    warnings: input.warnings ?? [],
  };
}

/**
 * Maps integration lifecycle participation into platform-lifecycle capability shape.
 * Consumers pass the result to @apzhub/platform-lifecycle without SDK importing that package.
 */
export function toPlatformCapabilityParticipation(
  snapshot: IntegrationLifecycleParticipationSnapshot,
): {
  readonly capabilityId: string;
  readonly name: string;
  readonly owner: string;
  readonly version: string;
  readonly lifecycleState: "operational" | "degraded" | "maintenance" | "initializing";
  readonly dependencies: readonly string[];
  readonly readiness: "healthy" | "degraded" | "unhealthy" | "unknown";
  readonly shutdownStatus: "none" | "draining" | "complete";
  readonly recoveryStatus: "none" | "in-progress" | "complete";
  readonly sequenceOrder: number;
  readonly versionCompatible: boolean;
  readonly warnings: readonly string[];
} {
  const lifecycleState =
    snapshot.integrationLifecycleState === "ready"
      ? "operational"
      : snapshot.integrationLifecycleState === "degraded"
        ? "degraded"
        : snapshot.integrationLifecycleState === "disabled"
          ? "maintenance"
          : "initializing";

  return {
    capabilityId: snapshot.capabilityId,
    name: snapshot.name,
    owner: snapshot.owner,
    version: snapshot.version,
    lifecycleState,
    dependencies: [],
    readiness: snapshot.readiness,
    shutdownStatus: snapshot.shutdownStatus,
    recoveryStatus: snapshot.recoveryStatus,
    sequenceOrder: 500,
    versionCompatible: snapshot.versionCompatible,
    warnings: snapshot.warnings,
  };
}
