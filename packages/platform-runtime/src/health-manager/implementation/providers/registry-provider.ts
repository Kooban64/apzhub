import type {
  HealthProvider,
  HealthProviderContext,
  HealthProviderResult,
} from "../../interfaces/types";

export const REGISTRY_HEALTH_PROVIDER_ID = "capability-registry" as const;

export function createRegistryHealthProvider(): HealthProvider {
  return {
    id: REGISTRY_HEALTH_PROVIDER_ID,
    name: "Capability Registry Health Provider",
    check(context: HealthProviderContext): HealthProviderResult {
      const timestamp = new Date().toISOString();
      const { registry, configuration } = context;
      const snapshot = registry.snapshot();

      if (snapshot.capabilityCount === 0) {
        return {
          providerId: REGISTRY_HEALTH_PROVIDER_ID,
          providerName: "Capability Registry Health Provider",
          status: "unhealthy",
          severity: "critical",
          timestamp,
          summary: "Capability registry contains no registered capabilities",
          metadata: { capabilityCount: 0 },
        };
      }

      if (snapshot.platformVersion !== configuration.platformVersion) {
        return {
          providerId: REGISTRY_HEALTH_PROVIDER_ID,
          providerName: "Capability Registry Health Provider",
          status: "degraded",
          severity: "warning",
          timestamp,
          summary: "Registry platform version differs from runtime configuration",
          metadata: {
            registryPlatformVersion: snapshot.platformVersion,
            configurationPlatformVersion: configuration.platformVersion,
          },
        };
      }

      const unhealthyCount = snapshot.healthSummary.unhealthy ?? 0;
      if (unhealthyCount > 0) {
        return {
          providerId: REGISTRY_HEALTH_PROVIDER_ID,
          providerName: "Capability Registry Health Provider",
          status: "degraded",
          severity: "warning",
          timestamp,
          summary: `${unhealthyCount} capability(ies) reported unhealthy in registry`,
          metadata: { healthSummary: snapshot.healthSummary },
        };
      }

      return {
        providerId: REGISTRY_HEALTH_PROVIDER_ID,
        providerName: "Capability Registry Health Provider",
        status: "healthy",
        severity: "info",
        timestamp,
        summary: `${snapshot.capabilityCount} capability(ies) registered`,
        metadata: {
          capabilityCount: snapshot.capabilityCount,
          lifecycleSummary: snapshot.lifecycleSummary,
          healthSummary: snapshot.healthSummary,
        },
      };
    },
  };
}
