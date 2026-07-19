import type { IntegrationCapabilityId } from "@apzhub/integration-sdk/adapter";
import type { AdapterBootstrapConfiguration } from "@apzhub/integration-sdk/adapter";

import type { KimaiConfiguration, KimaiConfigurationInput } from "./kimai-config";
import { normalizeKimaiConfiguration } from "./kimai-config";
import {
  KIMAI_ADAPTER_ID,
  KIMAI_ADAPTER_VERSION,
  KIMAI_INTEGRATION_ID,
} from "./version";

export const KIMAI_SDK_CAPABILITIES = [
  "authentication",
  "health",
  "diagnostics",
  "time_tracking",
] as const satisfies readonly IntegrationCapabilityId[];

export const KIMAI_EXTENDED_CAPABILITIES = [
  "version",
  "compatibility",
  "readiness",
  "feature_detection",
  "capability_certification",
  "metrics",
  "logging",
  "error_translation",
] as const;

export type KimaiExtendedCapabilityId = (typeof KIMAI_EXTENDED_CAPABILITIES)[number];

export interface KimaiBootstrapConfiguration extends AdapterBootstrapConfiguration {
  readonly kimai: KimaiConfiguration;
}

export interface CreateKimaiBootstrapInput {
  readonly kimai: KimaiConfigurationInput;
  readonly tenantId: string;
  readonly connectionId?: string;
}

export function createKimaiBootstrapConfiguration(
  input: CreateKimaiBootstrapInput,
): KimaiBootstrapConfiguration {
  const kimai = normalizeKimaiConfiguration(input.kimai);

  const authenticationMode =
    kimai.authMode === "legacy_headers" ? "api_key_header" : "bearer";

  const credentialRef =
    kimai.authMode === "legacy_headers"
      ? (kimai.apiPasswordRef ?? "")
      : (kimai.apiTokenRef ?? "");

  return {
    kimai,
    manifest: {
      integrationId: KIMAI_INTEGRATION_ID,
      adapterId: KIMAI_ADAPTER_ID,
      name: "Kimai Time Tracking Integration Foundation",
      version: KIMAI_ADAPTER_VERSION,
      capabilityId: "integration.kimai",
      declaredCapabilities: [...KIMAI_SDK_CAPABILITIES],
      owner: "APZHUB",
      description:
        "Kimai CE Integration Foundation — health, auth, version, diagnostics, certification (APZHUB-INTEGRATION-KIMAI-001). Does not implement APZ Time.",
    },
    connection: {
      connectionId: input.connectionId ?? "kimai-default-connection",
      tenantId: input.tenantId,
      baseUrl: kimai.baseUrl,
      authenticationMode,
      credentialRef,
      usernameRef: kimai.authMode === "legacy_headers" ? kimai.apiUserRef : undefined,
      headerName: kimai.authMode === "legacy_headers" ? "X-AUTH-TOKEN" : undefined,
      metadata: {
        apiBaseUrl: kimai.apiBaseUrl,
        authMode: kimai.authMode,
        versionMin: kimai.versionMin,
        versionMax: kimai.versionMax,
        extendedCapabilities: KIMAI_EXTENDED_CAPABILITIES.join(","),
        foundationOnly: "true",
      },
    },
  };
}

export function getKimaiExtendedCapabilities(
  _configuration: KimaiBootstrapConfiguration,
): readonly KimaiExtendedCapabilityId[] {
  return KIMAI_EXTENDED_CAPABILITIES;
}
