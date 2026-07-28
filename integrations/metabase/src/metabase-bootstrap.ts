import type { IntegrationCapabilityId } from "@apzhub/integration-sdk/adapter";
import type { AdapterBootstrapConfiguration } from "@apzhub/integration-sdk/adapter";

import type {
  MetabaseConfiguration,
  MetabaseConfigurationInput,
} from "./metabase-config";
import { normalizeMetabaseConfiguration } from "./metabase-config";
import {
  METABASE_ADAPTER_ID,
  METABASE_ADAPTER_VERSION,
  METABASE_INTEGRATION_ID,
} from "./version";

export const METABASE_SDK_CAPABILITIES = [
  "authentication",
  "health",
  "diagnostics",
  "analytics",
] as const satisfies readonly IntegrationCapabilityId[];

export const METABASE_EXTENDED_CAPABILITIES = [
  "version",
  "compatibility",
  "readiness",
  "featureDetection",
  "capabilityDetection",
  "collectionsMetadata",
  "dashboardEmbedPlanned",
] as const;

export type MetabaseExtendedCapabilityId =
  (typeof METABASE_EXTENDED_CAPABILITIES)[number];

export interface MetabaseBootstrapConfiguration extends AdapterBootstrapConfiguration {
  readonly metabase: MetabaseConfiguration;
}

export interface CreateMetabaseBootstrapInput {
  readonly metabase: MetabaseConfigurationInput;
  readonly tenantId: string;
  readonly connectionId?: string;
}

export function createMetabaseBootstrapConfiguration(
  input: CreateMetabaseBootstrapInput,
): MetabaseBootstrapConfiguration {
  const metabase = normalizeMetabaseConfiguration(input.metabase);

  const authenticationMode = metabase.authMode === "session" ? "basic" : "api_token";

  const credentialRef =
    metabase.authMode === "session"
      ? (metabase.passwordRef ?? "")
      : (metabase.apiKeyRef ?? "");

  return {
    metabase,
    manifest: {
      integrationId: METABASE_INTEGRATION_ID,
      adapterId: METABASE_ADAPTER_ID,
      name: "Metabase Analytics Integration",
      version: METABASE_ADAPTER_VERSION,
      capabilityId: "integration.metabase",
      declaredCapabilities: [...METABASE_SDK_CAPABILITIES],
      owner: "APZHUB",
      description:
        "Metabase CE Integration Foundation — health, auth, diagnostics, version/capability detection (APZHUB-INTEGRATION-METABASE-001)",
    },
    connection: {
      connectionId: input.connectionId ?? "metabase-default-connection",
      tenantId: input.tenantId,
      baseUrl: metabase.baseUrl,
      authenticationMode,
      credentialRef,
      usernameRef: metabase.authMode === "session" ? metabase.usernameRef : undefined,
      metadata: {
        apiBaseUrl: metabase.apiBaseUrl,
        authMode: metabase.authMode,
        extendedCapabilities: METABASE_EXTENDED_CAPABILITIES.join(","),
      },
    },
  };
}

export function getMetabaseExtendedCapabilities(
  _configuration: MetabaseBootstrapConfiguration,
): readonly MetabaseExtendedCapabilityId[] {
  return METABASE_EXTENDED_CAPABILITIES;
}
