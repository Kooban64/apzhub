import type { ConsolidatedOperationalDiagnostics } from "@apzhub/platform-security";
import {
  buildPlatformLifecycleSnapshot,
  createInitialRuntimeState,
} from "@apzhub/platform-lifecycle";

import {
  buildCapabilityHealthReports,
  listAffectedProducts,
} from "./capability-health-builder";
import { evaluateProductionVerification } from "./production-verification-service";
import {
  OPEN_TECHNICAL_DEBT_OPS_ITEMS,
  TECHNICAL_DEBT_REGISTER_REFERENCE,
} from "./technical-debt-ops";
import type {
  OperationsControlPlaneInput,
  OperationsControlPlaneSnapshot,
} from "./types";

const OPERATIONS_GUIDES = [
  "docs/governance/APZHUB-Platform-Operations-UX-Guide.md",
  "docs/developer/APZHUB-Platform-Operations-Console-Guide.md",
  "docs/developer/APZHUB-Operations-Dashboard-Guide.md",
  "docs/governance/APZHUB-Operational-Lifecycle-Guide.md",
  "docs/governance/APZHUB-Security-Operations-Guide.md",
  "docs/governance/APZHUB-Session-Policy-Guide.md",
] as const;

function documentationStatus(
  capabilities: ReturnType<typeof buildCapabilityHealthReports>,
): import("@apzhub/platform-security").HealthSignalStatus {
  const opsCapability = capabilities.find(
    (item) => item.capabilityId === "platform.operations",
  );
  return opsCapability?.health ?? "healthy";
}

export function buildOperationsControlPlaneSnapshot(
  input: OperationsControlPlaneInput,
): OperationsControlPlaneSnapshot {
  const capabilities = buildCapabilityHealthReports(
    input.consolidated,
    input.bootstrapReady,
    input.productStatuses ?? {},
  );

  const productionVerification = evaluateProductionVerification({
    consolidated: input.consolidated,
    bootstrapReady: input.bootstrapReady,
    capabilities,
  });

  const lifecycle = buildPlatformLifecycleSnapshot(
    {
      consolidated: input.consolidated,
      bootstrapReady: input.bootstrapReady,
      platformVersion: input.platformVersion,
      buildNumber: input.buildNumber,
      environment: input.environment,
      productStatuses: input.productStatuses,
    },
    input.lifecycleRuntime ?? createInitialRuntimeState(),
  );

  const degradedCapabilityCount = capabilities.filter(
    (item) => item.status === "degraded",
  ).length;
  const unhealthyCapabilityCount = capabilities.filter(
    (item) => item.status === "unhealthy",
  ).length;

  return {
    generatedAt: input.consolidated.generatedAt,
    platformVersion: input.platformVersion,
    buildNumber: input.buildNumber,
    environment: input.environment,
    overview: {
      platformHealth: input.consolidated.resilience.health.status,
      productionReadiness: productionVerification.verdict,
      readinessScore: productionVerification.score,
      degradedCapabilityCount,
      unhealthyCapabilityCount,
      affectedProducts: listAffectedProducts(capabilities),
      lifecycleState: lifecycle.currentState,
      maintenanceMode: lifecycle.maintenanceMode,
    },
    capabilities,
    dependencyHealth: input.consolidated.resilience.health,
    productionVerification,
    technicalDebt: {
      registerReference: TECHNICAL_DEBT_REGISTER_REFERENCE,
      openItems: OPEN_TECHNICAL_DEBT_OPS_ITEMS,
      openCount: OPEN_TECHNICAL_DEBT_OPS_ITEMS.length,
    },
    documentation: {
      status: documentationStatus(capabilities),
      operationsGuides: [...OPERATIONS_GUIDES],
    },
    lifecycle,
  };
}

export type { ConsolidatedOperationalDiagnostics };
