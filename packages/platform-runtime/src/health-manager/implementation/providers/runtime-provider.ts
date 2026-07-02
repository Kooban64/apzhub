import { isValidSemver } from "../../../version-manager/semver";
import type {
  HealthProvider,
  HealthProviderContext,
  HealthProviderResult,
} from "../../interfaces/types";

export const RUNTIME_HEALTH_PROVIDER_ID = "runtime" as const;

export function createRuntimeHealthProvider(): HealthProvider {
  return {
    id: RUNTIME_HEALTH_PROVIDER_ID,
    name: "Runtime Health Provider",
    check(context: HealthProviderContext): HealthProviderResult {
      const timestamp = new Date().toISOString();
      const { configuration, registry, capabilities } = context;
      const issues: string[] = [];

      if (!configuration.workspaceRoot) {
        issues.push("workspaceRoot is empty");
      }

      if (
        !configuration.platformVersion ||
        !isValidSemver(configuration.platformVersion)
      ) {
        issues.push("platformVersion is missing or invalid");
      }

      if (capabilities.length === 0) {
        issues.push("no capabilities loaded");
      }

      if (registry.count() === 0 && capabilities.length > 0) {
        issues.push("registry is empty while capabilities are present");
      }

      if (registry.count() !== capabilities.length && capabilities.length > 0) {
        issues.push("registry count does not match discovered capabilities");
      }

      if (issues.length > 0) {
        return {
          providerId: RUNTIME_HEALTH_PROVIDER_ID,
          providerName: "Runtime Health Provider",
          status: "unhealthy",
          severity: "critical",
          timestamp,
          summary: `Runtime integrity check failed: ${issues.join("; ")}`,
          metadata: {
            issues,
            capabilityCount: capabilities.length,
            registryCount: registry.count(),
          },
        };
      }

      return {
        providerId: RUNTIME_HEALTH_PROVIDER_ID,
        providerName: "Runtime Health Provider",
        status: "healthy",
        severity: "info",
        timestamp,
        summary: "Runtime integrity checks passed",
        metadata: {
          capabilityCount: capabilities.length,
          registryCount: registry.count(),
          runtimeMode: configuration.runtimeMode,
          failFast: configuration.failFast,
        },
      };
    },
  };
}
