import { planeEnvSchema } from "./schema";
import { validatePlaneIntegrationConfig } from "./plane-integration-validation";

/** Supported Plane CE version range — probe in OSS-101-04; not checked via HTTP in OSS-101-02. */
export const PLANE_SUPPORTED_VERSION_RANGE = {
  min: "0.23.0",
  max: "0.24.x",
} as const;

export type PlaneHealthStatus =
  | "disabled"
  | "misconfigured"
  | "configured"
  | "not_probed";

export type PlaneVersionCompatibilityStatus = "not_checked" | "compatible" | "incompatible";

export interface PlaneConfigurationDiagnostics {
  readonly integrationEnabled: boolean;
  readonly connectionConfigured: boolean;
  readonly apiTokenPresent: boolean;
  readonly workspaceConfigured: boolean;
  readonly healthStatus: PlaneHealthStatus;
  readonly versionCompatibility: {
    readonly status: PlaneVersionCompatibilityStatus;
    readonly supportedRange: typeof PLANE_SUPPORTED_VERSION_RANGE;
    readonly note: string;
  };
  readonly issues: readonly string[];
}

/**
 * Configuration-only Plane diagnostics. Does not call Plane HTTP APIs (OSS-101-02).
 * Live health probe deferred to PlaneAdapter (OSS-101-04).
 */
export function getPlaneConfigurationDiagnostics(
  env: NodeJS.ProcessEnv = process.env,
): PlaneConfigurationDiagnostics {
  const parsed = planeEnvSchema.safeParse(env);
  const planeEnv = parsed.success
    ? parsed.data
    : {
        PLANE_INTEGRATION_ENABLED: false,
        PLANE_BASE_URL: undefined,
        PLANE_API_BASE_URL: undefined,
        PLANE_API_TOKEN: undefined,
        PLANE_WORKSPACE_ID: undefined,
        PLANE_WEBHOOK_SECRET: undefined,
      };

  const validationIssues = validatePlaneIntegrationConfig(planeEnv);
  const failures = validationIssues.filter((issue) => issue.severity === "fail");

  const connectionConfigured = Boolean(planeEnv.PLANE_BASE_URL && planeEnv.PLANE_API_BASE_URL);
  const apiTokenPresent = Boolean(planeEnv.PLANE_API_TOKEN);
  const workspaceConfigured = Boolean(planeEnv.PLANE_WORKSPACE_ID);

  let healthStatus: PlaneHealthStatus = "not_probed";
  if (!planeEnv.PLANE_INTEGRATION_ENABLED) {
    healthStatus = "disabled";
  } else if (failures.length > 0) {
    healthStatus = "misconfigured";
  } else if (connectionConfigured && apiTokenPresent) {
    healthStatus = "configured";
  } else {
    healthStatus = "misconfigured";
  }

  return {
    integrationEnabled: planeEnv.PLANE_INTEGRATION_ENABLED,
    connectionConfigured,
    apiTokenPresent,
    workspaceConfigured,
    healthStatus,
    versionCompatibility: {
      status: "not_checked",
      supportedRange: PLANE_SUPPORTED_VERSION_RANGE,
      note: "Engine version probe deferred to PlaneAdapter health check (OSS-101-04)",
    },
    issues: failures.map((issue) => `${issue.key}: ${issue.message}`),
  };
}
