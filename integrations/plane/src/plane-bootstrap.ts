import type { IntegrationCapabilityId } from "@apzhub/integration-sdk/adapter";
import type { AdapterBootstrapConfiguration } from "@apzhub/integration-sdk/adapter";
import type { PlaneConfiguration, PlaneConfigurationInput } from "./plane-config";
import { normalizePlaneConfiguration } from "./plane-config";
import { PLANE_INTEGRATION_ID } from "./plane-error-mapper";

/** Capabilities registered with the SDK CapabilityRegistration service. */
export const PLANE_SDK_CAPABILITIES = [
  "authentication",
  "health",
  "diagnostics",
  "projects",
  "webhooks",
  "polling",
] as const satisfies readonly IntegrationCapabilityId[];

/**
 * Plane service capabilities declared in integration.yaml — extensible without SDK enum changes.
 * Future SDK capability IDs can absorb these when formalised.
 */
export const PLANE_EXTENDED_CAPABILITIES = [
  "users",
  "workspaces",
  "version",
  "project_states",
  "labels",
  "cycles",
  "modules",
  "members",
  "tasks",
  "issues",
  "comments",
  "activity",
  "watchers",
  "analytics",
  "events",
  "webhooks",
  "synchronisation",
] as const;

export type PlaneExtendedCapabilityId = (typeof PLANE_EXTENDED_CAPABILITIES)[number];

export interface PlaneBootstrapConfiguration extends AdapterBootstrapConfiguration {
  readonly plane: PlaneConfiguration;
}

export interface CreatePlaneBootstrapInput {
  readonly plane: PlaneConfigurationInput;
  readonly tenantId: string;
  readonly connectionId?: string;
  readonly engineVersionMin?: string;
  readonly engineVersionMax?: string;
}

export function createPlaneBootstrapConfiguration(
  input: CreatePlaneBootstrapInput,
): PlaneBootstrapConfiguration {
  const plane = normalizePlaneConfiguration(input.plane);

  return {
    plane,
    manifest: {
      integrationId: PLANE_INTEGRATION_ID,
      adapterId: "plane-adapter",
      name: "Plane Engine Integration",
      version: "0.6.0",
      capabilityId: "integration.plane",
      declaredCapabilities: [...PLANE_SDK_CAPABILITIES],
      owner: "APZHUB",
      description: "Plane CE adapter for APZHUB Projects",
    },
    connection: {
      connectionId: input.connectionId ?? "plane-default-connection",
      tenantId: input.tenantId,
      baseUrl: plane.baseUrl,
      authenticationMode: "api_key_header",
      credentialRef: plane.apiTokenRef,
      headerName: "X-Api-Key",
      metadata: {
        workspaceSlug: plane.workspaceSlug,
        engineVersionMin: input.engineVersionMin ?? "0.23.0",
        engineVersionMax: input.engineVersionMax ?? "0.24.x",
        apiBaseUrl: plane.apiBaseUrl,
        extendedCapabilities: PLANE_EXTENDED_CAPABILITIES.join(","),
      },
    },
  };
}

export function getPlaneExtendedCapabilities(
  configuration: PlaneBootstrapConfiguration,
): readonly PlaneExtendedCapabilityId[] {
  const raw = configuration.connection?.metadata?.extendedCapabilities;
  if (!raw) {
    return PLANE_EXTENDED_CAPABILITIES;
  }

  return raw.split(",").filter(Boolean) as PlaneExtendedCapabilityId[];
}
