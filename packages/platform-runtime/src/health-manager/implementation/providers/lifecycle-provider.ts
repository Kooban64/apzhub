import type {
  HealthProvider,
  HealthProviderContext,
  HealthProviderResult,
} from "../../interfaces/types";

export const LIFECYCLE_HEALTH_PROVIDER_ID = "lifecycle-manager" as const;

export function createLifecycleHealthProvider(): HealthProvider {
  return {
    id: LIFECYCLE_HEALTH_PROVIDER_ID,
    name: "Lifecycle Manager Health Provider",
    check(context: HealthProviderContext): HealthProviderResult {
      const timestamp = new Date().toISOString();
      const capabilities = context.registry.findAll();
      const failed: string[] = [];
      const notInitialised: string[] = [];

      for (const capability of capabilities) {
        const state = context.lifecycle.getState(capability.id);

        if (state === "failed") {
          failed.push(capability.id);
        } else if (
          state !== "initialised" &&
          state !== "healthy" &&
          state !== "degraded"
        ) {
          notInitialised.push(capability.id);
        }
      }

      if (failed.length > 0) {
        return {
          providerId: LIFECYCLE_HEALTH_PROVIDER_ID,
          providerName: "Lifecycle Manager Health Provider",
          status: "unhealthy",
          severity: "critical",
          timestamp,
          summary: `${failed.length} capability lifecycle record(s) in failed state`,
          metadata: { failedCapabilities: failed },
        };
      }

      if (notInitialised.length > 0) {
        return {
          providerId: LIFECYCLE_HEALTH_PROVIDER_ID,
          providerName: "Lifecycle Manager Health Provider",
          status: "degraded",
          severity: "warning",
          timestamp,
          summary: `${notInitialised.length} capability(ies) not yet initialised`,
          metadata: { pendingCapabilities: notInitialised },
        };
      }

      return {
        providerId: LIFECYCLE_HEALTH_PROVIDER_ID,
        providerName: "Lifecycle Manager Health Provider",
        status: "healthy",
        severity: "info",
        timestamp,
        summary: `${capabilities.length} capability lifecycle record(s) initialised`,
        metadata: { capabilityCount: capabilities.length },
      };
    },
  };
}
