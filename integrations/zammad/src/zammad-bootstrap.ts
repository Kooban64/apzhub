import type { IntegrationCapabilityId } from "@apzhub/integration-sdk/adapter";
import type { AdapterBootstrapConfiguration } from "@apzhub/integration-sdk/adapter";
import type { ZammadConfiguration, ZammadConfigurationInput } from "./zammad-config";
import { normalizeZammadConfiguration } from "./zammad-config";
import { ZAMMAD_INTEGRATION_ID } from "./zammad-error-mapper";

/** Capabilities registered with the SDK CapabilityRegistration service. */
export const ZAMMAD_SDK_CAPABILITIES = [
  "authentication",
  "health",
  "diagnostics",
  "tickets",
  "search",
  "analytics",
  "webhooks",
  "polling",
] as const satisfies readonly IntegrationCapabilityId[];

/**
 * Placeholder Support capabilities declared for future milestones.
 * Metadata only — no service implementations in OSS-102-02.
 */
export const ZAMMAD_EXTENDED_CAPABILITIES = [
  "support",
  "tickets",
  "users",
  "organizations",
  "groups",
  "articles",
  "attachments",
  "history",
  "search",
  "analytics",
  "events",
  "synchronisation",
  "webhooks",
] as const;

export type ZammadExtendedCapabilityId = (typeof ZAMMAD_EXTENDED_CAPABILITIES)[number];

export interface ZammadBootstrapConfiguration extends AdapterBootstrapConfiguration {
  readonly zammad: ZammadConfiguration;
}

export interface CreateZammadBootstrapInput {
  readonly zammad: ZammadConfigurationInput;
  readonly tenantId: string;
  readonly connectionId?: string;
  readonly engineVersionMin?: string;
  readonly engineVersionMax?: string;
  readonly edition?: "community" | "enterprise" | "unknown";
}

export function createZammadBootstrapConfiguration(
  input: CreateZammadBootstrapInput,
): ZammadBootstrapConfiguration {
  const zammad = normalizeZammadConfiguration(input.zammad);

  return {
    zammad,
    manifest: {
      integrationId: ZAMMAD_INTEGRATION_ID,
      adapterId: "zammad-adapter",
      name: "Zammad Engine Integration",
      version: "0.6.0",
      capabilityId: "integration.zammad",
      declaredCapabilities: [...ZAMMAD_SDK_CAPABILITIES],
      owner: "APZHUB",
      description:
        "Zammad CE adapter with Support core, operations certification, sync, events, and webhooks for APZHUB",
    },
    connection: {
      connectionId: input.connectionId ?? "zammad-default-connection",
      tenantId: input.tenantId,
      baseUrl: zammad.baseUrl,
      authenticationMode: "api_token",
      credentialRef: zammad.apiTokenRef,
      metadata: {
        engineVersionMin: input.engineVersionMin ?? "6.3.0",
        engineVersionMax: input.engineVersionMax ?? "6.5.x",
        apiBaseUrl: zammad.apiBaseUrl,
        edition: input.edition ?? "community",
        extendedCapabilities: ZAMMAD_EXTENDED_CAPABILITIES.join(","),
        oauthEnabled: String(zammad.oauth.enabled),
      },
    },
  };
}

export function getZammadExtendedCapabilities(
  configuration: ZammadBootstrapConfiguration,
): readonly ZammadExtendedCapabilityId[] {
  const raw = configuration.connection?.metadata?.extendedCapabilities;
  if (!raw) {
    return ZAMMAD_EXTENDED_CAPABILITIES;
  }

  return raw.split(",").filter(Boolean) as ZammadExtendedCapabilityId[];
}
