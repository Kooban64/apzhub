/**
 * n8n-backed Workflow ops provider (APZHUB-PLATFORM-WORKFLOW-004).
 * Maps Integration SDK / N8nAdapter outputs to workflow-contracts only.
 * Provider execute remains unsupported (CERTIFIED_FOUNDATION read-only adapter).
 */

import type { N8nAdapter } from "@apzhub/integration-n8n";
import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import type {
  WorkflowCapability,
  WorkflowHealth,
  WorkflowPlatformServiceContext,
  WorkflowProvider,
} from "@apzhub/workflow-contracts";
import {
  asWorkflowCapabilityId,
  asWorkflowProviderId,
  WORKFLOW_CONTRACTS_VERSION,
} from "@apzhub/workflow-contracts";

import type { WorkflowOpsProvider } from "./workflow-runtime-types";

function toIntegrationContext(
  ctx: WorkflowPlatformServiceContext,
): IntegrationRequestContext {
  return {
    tenantId: ctx.tenantId,
    correlationId: ctx.correlationId,
  };
}

function mapHealthStatus(status: string): WorkflowHealth["status"] {
  if (status === "healthy") return "healthy";
  if (status === "degraded") return "degraded";
  if (status === "unhealthy" || status === "unavailable") return "unhealthy";
  return "unknown";
}

/** Production ops — health/capabilities from n8n; execute not supported. */
export function createN8nWorkflowOpsProvider(adapter: N8nAdapter): WorkflowOpsProvider {
  return {
    providerId: "n8n",
    providerExecuteSupported: false,

    async getHealth(ctx) {
      const ictx = toIntegrationContext(ctx);
      const health = await adapter.health(ictx);
      const status = mapHealthStatus(health.status);
      const reasons =
        adapter.diagnosticsExtension.operationsCapability.healthReasons ?? [];
      return {
        componentKey: "workflow.provider.n8n",
        status,
        reasons: [...reasons],
        checkedAt: health.observedAt ?? new Date().toISOString(),
        providerId: "n8n",
      };
    },

    async getReadiness(ctx) {
      const ictx = toIntegrationContext(ctx);
      const test = await adapter.testConnection(ictx).catch(() => ({
        ok: false,
        message: "connection test failed",
      }));
      const classified = adapter.operations.classifyHealth();
      const readiness =
        !test.ok || classified.level === "unhealthy"
          ? "not_ready"
          : "ready_with_limitations";
      return {
        readiness,
        reasons: [
          "n8n integration is CERTIFIED_FOUNDATION (read-only metadata)",
          "provider execute/schedule/HITL not supported by adapter",
          `connectionOk=${String(test.ok)}`,
          `healthLevel=${classified.level}`,
          `contractsVersion=${WORKFLOW_CONTRACTS_VERSION}`,
        ],
      };
    },

    async listCapabilities(_ctx) {
      const snapshot = adapter.core.getCapabilities();
      const capabilities: WorkflowCapability[] = snapshot.services.map(
        (service, index) => ({
          id: asWorkflowCapabilityId(`wcap_n8n_${service.serviceId}_${index}`),
          key: `workflow.provider.${service.serviceId}`,
          support:
            service.support === "supported"
              ? "supported"
              : service.support === "partial"
                ? "partial"
                : "not_supported",
          description: service.notes?.join("; "),
          providerId: "n8n",
        }),
      );
      capabilities.push({
        id: asWorkflowCapabilityId("wcap_n8n_execute"),
        key: "workflow.provider.execute",
        support: "not_supported",
        description: "Execute remains Owner-gated beyond CERTIFIED_FOUNDATION",
        providerId: "n8n",
      });
      return capabilities;
    },

    async listProviders(_ctx) {
      const provider: WorkflowProvider = {
        id: asWorkflowProviderId("wprov_n8n"),
        key: "n8n",
        displayName: "n8n",
        integrationId: "integration.n8n",
        capabilities: [asWorkflowCapabilityId("wcap_n8n_execute")],
        status: "registered",
      };
      return [provider];
    },

    async tryStartExecution() {
      return {
        supported: false as const,
        reason: "n8n adapter does not support execute (CERTIFIED_FOUNDATION read-only)",
      };
    },
  };
}

/** Mock ops for unit / provider-integration tests. */
export function createMockWorkflowOpsProvider(input?: {
  readonly providerExecuteSupported?: boolean;
  readonly healthStatus?: WorkflowHealth["status"];
}): WorkflowOpsProvider {
  const providerExecuteSupported = input?.providerExecuteSupported ?? false;
  const healthStatus = input?.healthStatus ?? "healthy";

  return {
    providerId: "workflow-mock",
    providerExecuteSupported,

    async getHealth() {
      return {
        componentKey: "workflow.provider.mock",
        status: healthStatus,
        reasons: [],
        checkedAt: new Date().toISOString(),
        providerId: "workflow-mock",
      };
    },

    async getReadiness() {
      return {
        readiness: providerExecuteSupported ? "ready" : "ready_with_limitations",
        reasons: providerExecuteSupported
          ? ["mock provider execute enabled"]
          : ["mock provider execute disabled"],
      };
    },

    async listCapabilities() {
      return [
        {
          id: asWorkflowCapabilityId("wcap_mock_definition"),
          key: "workflow.provider.definition.sync",
          support: "supported" as const,
          providerId: "workflow-mock",
        },
        {
          id: asWorkflowCapabilityId("wcap_mock_execute"),
          key: "workflow.provider.execute",
          support: providerExecuteSupported
            ? ("supported" as const)
            : ("not_supported" as const),
          providerId: "workflow-mock",
        },
      ];
    },

    async listProviders() {
      return [
        {
          id: asWorkflowProviderId("wprov_mock"),
          key: "workflow-mock",
          displayName: "Workflow Mock Provider",
          integrationId: "integration.workflow.mock",
          capabilities: [asWorkflowCapabilityId("wcap_mock_execute")],
          status: "registered" as const,
        },
      ];
    },

    async tryStartExecution(_ctx, input) {
      if (!providerExecuteSupported) {
        return {
          supported: false as const,
          reason: "mock provider execute disabled",
        };
      }
      return {
        supported: true as const,
        providerRef: `mock_run_${input.workflowId}`,
        status: "running" as const,
      };
    },
  };
}
