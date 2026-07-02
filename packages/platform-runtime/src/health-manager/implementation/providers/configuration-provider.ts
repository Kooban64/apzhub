import { Configuration } from "../../../configuration-manager";
import type {
  HealthProvider,
  HealthProviderContext,
  HealthProviderResult,
} from "../../interfaces/types";

export const CONFIGURATION_HEALTH_PROVIDER_ID = "configuration" as const;

export function createConfigurationHealthProvider(): HealthProvider {
  return {
    id: CONFIGURATION_HEALTH_PROVIDER_ID,
    name: "Configuration Health Provider",
    check(_context: HealthProviderContext): HealthProviderResult {
      const timestamp = new Date().toISOString();
      const diagnostics = Configuration.getDiagnostics();

      if (diagnostics.validationStatus === "not-loaded") {
        return {
          providerId: CONFIGURATION_HEALTH_PROVIDER_ID,
          providerName: "Configuration Health Provider",
          status: "unhealthy",
          severity: "critical",
          timestamp,
          summary: "Runtime configuration is not loaded",
          metadata: { validationStatus: diagnostics.validationStatus },
        };
      }

      if (diagnostics.validationStatus === "invalid") {
        return {
          providerId: CONFIGURATION_HEALTH_PROVIDER_ID,
          providerName: "Configuration Health Provider",
          status: "unhealthy",
          severity: "critical",
          timestamp,
          summary: `Configuration validation failed with ${diagnostics.invalidValues.length} invalid value(s)`,
          metadata: {
            validationStatus: diagnostics.validationStatus,
            missingValues: diagnostics.missingValues,
            invalidValues: diagnostics.invalidValues.map((error) => error.code),
          },
        };
      }

      const configuration = Configuration.getConfiguration();

      return {
        providerId: CONFIGURATION_HEALTH_PROVIDER_ID,
        providerName: "Configuration Health Provider",
        status: "healthy",
        severity: "info",
        timestamp,
        summary: "Runtime configuration is loaded and valid",
        metadata: {
          validationStatus: diagnostics.validationStatus,
          platformVersion: configuration?.platformVersion,
          runtimeMode: configuration?.runtimeMode,
        },
      };
    },
  };
}
