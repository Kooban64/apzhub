import type { KimaiAdapter } from "@apzhub/integration-kimai";
import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import type {
  ServiceRequestContext,
  TimeCompatibilitySnapshot,
  TimeConnectionTestResult,
  TimeDiagnosticsSnapshot,
  TimeFoundationCapabilities,
  TimeHealthSnapshot,
  TimeReadinessSnapshot,
} from "@apzhub/platform-service-contracts";
import { KIMAI_ADAPTER_VERSION } from "@apzhub/integration-kimai";

import type { TimeOpsProvider } from "./time-types";

function toIntegrationContext(ctx: ServiceRequestContext): IntegrationRequestContext {
  return {
    tenantId: ctx.tenantId,
    correlationId: ctx.correlationId,
  };
}

export function createKimaiOpsProvider(adapter: KimaiAdapter): TimeOpsProvider {
  return {
    async getFoundationCapabilities(_ctx) {
      const caps: TimeFoundationCapabilities = {
        adapterId: "kimai-adapter",
        adapterVersion: KIMAI_ADAPTER_VERSION,
        domainCrudAvailable: true,
        operations: [
          "health",
          "diagnostics",
          "compatibility",
          "readiness",
          "connection_test",
          "version",
          "timesheets",
          "activities",
          "customers",
          "projects",
          "tags",
        ],
      };
      return caps;
    },

    async testConnection(ctx) {
      const result = await adapter.testConnection(toIntegrationContext(ctx));
      const report = adapter.buildOperationalReport();
      const out: TimeConnectionTestResult = {
        ok: result.ok,
        message: result.message,
        engineVersion: report.compatibility.detectedKimaiVersion,
      };
      return out;
    },

    async getHealth(ctx) {
      const health = await adapter.health(toIntegrationContext(ctx));
      const snapshot: TimeHealthSnapshot = {
        status:
          health.status === "healthy"
            ? "healthy"
            : health.status === "degraded"
              ? "degraded"
              : "unavailable",
        checks: health.checks.map((check) => ({
          name: check.name,
          status: check.status,
          message: check.message,
        })),
        observedAt: health.observedAt,
      };
      return snapshot;
    },

    async getDiagnostics(ctx) {
      const diagnostics = await adapter.diagnostics(toIntegrationContext(ctx));
      const snapshot: TimeDiagnosticsSnapshot = {
        engineVersion: diagnostics.engineVersion,
        healthStatus: diagnostics.healthStatus ?? "unknown",
        warnings: diagnostics.warnings,
        recommendations: diagnostics.recommendations,
        foundationOnly: false,
      };
      return snapshot;
    },

    async getCompatibility(_ctx) {
      const report = adapter.buildOperationalReport();
      const snapshot: TimeCompatibilitySnapshot = {
        compatibilityStatus: report.compatibility.compatibilityStatus,
        detectedVersion: report.compatibility.detectedKimaiVersion,
        edition: "community",
      };
      return snapshot;
    },

    async getReadiness(_ctx) {
      const report = adapter.buildOperationalReport();
      const snapshot: TimeReadinessSnapshot = {
        ready: report.readiness.ready,
        classification: report.readiness.classification,
        blockingFailures: report.readiness.blockingFailures,
        warnings: report.readiness.warnings,
      };
      return snapshot;
    },
  };
}
