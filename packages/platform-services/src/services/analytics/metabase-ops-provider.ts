import type {
  AnalyticsCapability,
  AnalyticsHealth,
  AnalyticsRequestContext,
} from "@apzhub/analytics-contracts";
import {
  asAnalyticsCapabilityId,
  ANALYTICS_CONTRACTS_VERSION,
} from "@apzhub/analytics-contracts";
import type { MetabaseAdapter } from "@apzhub/integration-metabase";
import { METABASE_ADAPTER_VERSION } from "@apzhub/integration-metabase";
import type { IntegrationRequestContext } from "@apzhub/integration-sdk";

import type { AnalyticsOpsProvider } from "./analytics-types";

function toIntegrationContext(ctx: AnalyticsRequestContext): IntegrationRequestContext {
  return {
    tenantId: ctx.tenantId,
    correlationId: ctx.correlationId ?? "analytics-ops",
  };
}

/**
 * Metabase-backed Analytics ops provider.
 * Never exposes Metabase DTOs — maps to analytics-contracts shapes only.
 */
export function createMetabaseOpsProvider(
  adapter: MetabaseAdapter,
): AnalyticsOpsProvider {
  return {
    providerId: "metabase",

    async getHealth(ctx) {
      const ictx = toIntegrationContext(ctx);
      const health = await adapter.health(ictx);
      const extension = adapter.diagnosticsExtension;
      const status: AnalyticsHealth["status"] =
        health.status === "healthy"
          ? "healthy"
          : health.status === "degraded"
            ? "degraded"
            : health.status === "unavailable"
              ? "unavailable"
              : "unknown";

      const result: AnalyticsHealth = {
        status,
        checkedAt: health.observedAt,
        providerStatuses: [
          {
            providerId: "metabase",
            status,
            message: `auth=${extension.authenticationStatus}; api=${extension.apiStatus}`,
          },
        ],
        reasons: extension.operationsCapability.healthReasons,
      };
      return result;
    },

    async getReadiness(ctx) {
      const ictx = toIntegrationContext(ctx);
      // Ensure connection state is current when possible.
      await adapter.testConnection(ictx).catch(() => undefined);
      const readiness = adapter.diagnosticsExtension.readiness;
      const mapped =
        readiness === "ready" ||
        readiness === "ready_with_limitations" ||
        readiness === "not_ready"
          ? readiness
          : "not_ready";
      return {
        readiness: mapped,
        reasons: [
          ...adapter.diagnosticsExtension.operationsCapability.healthReasons,
          `adapterVersion=${METABASE_ADAPTER_VERSION}`,
          `contractsVersion=${ANALYTICS_CONTRACTS_VERSION}`,
        ],
      };
    },

    async listProviderCapabilities(ctx) {
      const ictx = toIntegrationContext(ctx);
      let embeddingEnabled: boolean | undefined;
      try {
        const caps = await adapter.client.detectCapabilities(ictx);
        embeddingEnabled = caps.embeddingEnabled;
      } catch {
        embeddingEnabled = adapter.diagnosticsExtension.embeddingEnabled;
      }

      const registration = adapter.listCapabilityRegistration();
      const capabilities: AnalyticsCapability[] = registration.serviceIds.map(
        (serviceId) => {
          const implemented = registration.capabilityIds.includes(serviceId);
          let support: AnalyticsCapability["support"] = implemented
            ? "supported"
            : "planned";
          if (serviceId === "dashboardEmbed") {
            support =
              embeddingEnabled === true
                ? "partial"
                : embeddingEnabled === false
                  ? "planned"
                  : "partial";
          }
          return {
            id: asAnalyticsCapabilityId(`cap_${serviceId}`),
            key: serviceId,
            name: serviceId,
            support,
            notes: [`provider=metabase`, `adapter=${METABASE_ADAPTER_VERSION}`],
          };
        },
      );
      return capabilities;
    },
  };
}

/** Deterministic mock ops provider for unit tests (no Metabase). */
export function createMockAnalyticsOpsProvider(
  overrides: Partial<AnalyticsOpsProvider> = {},
): AnalyticsOpsProvider {
  return {
    providerId: "mock",
    async getHealth() {
      return {
        status: "healthy",
        checkedAt: new Date().toISOString(),
        providerStatuses: [{ providerId: "mock", status: "healthy" }],
      };
    },
    async getReadiness() {
      return { readiness: "ready_with_limitations", reasons: ["mock_provider"] };
    },
    async listProviderCapabilities() {
      return [
        {
          id: asAnalyticsCapabilityId("cap_health"),
          key: "health",
          name: "Health",
          support: "supported",
        },
        {
          id: asAnalyticsCapabilityId("cap_dashboardEmbed"),
          key: "dashboardEmbed",
          name: "Dashboard Embedding",
          support: "planned",
        },
      ];
    },
    ...overrides,
  };
}
