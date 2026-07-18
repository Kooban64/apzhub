import type {
  ConsolidatedOperationalDiagnostics,
  HealthSignalStatus,
} from "@apzhub/platform-security";

import { PLATFORM_CAPABILITY_DEFINITIONS } from "./capability-definitions";
import type { CapabilityHealthReport } from "./types";

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : undefined;
}

function pickHealth(...statuses: readonly HealthSignalStatus[]): HealthSignalStatus {
  if (statuses.includes("unhealthy")) {
    return "unhealthy";
  }
  if (statuses.includes("degraded")) {
    return "degraded";
  }
  if (statuses.every((status) => status === "unknown")) {
    return "unknown";
  }
  return "healthy";
}

function configurationStateFromEnvironment(
  consolidated: ConsolidatedOperationalDiagnostics,
): CapabilityHealthReport["configurationState"] {
  const valid = consolidated.security.environment.valid;
  const failCount = consolidated.security.environment.checks.filter(
    (check) => check.status === "fail",
  ).length;
  const warnCount = consolidated.security.environment.checks.filter(
    (check) => check.status === "warn",
  ).length;

  if (failCount > 0 || !valid) {
    return "invalid";
  }
  if (warnCount > 0) {
    return "degraded";
  }
  return "valid";
}

function evaluateCapability(
  definition: (typeof PLATFORM_CAPABILITY_DEFINITIONS)[number],
  consolidated: ConsolidatedOperationalDiagnostics,
  bootstrapReady: boolean,
  productStatuses: Readonly<Record<string, HealthSignalStatus>>,
): CapabilityHealthReport {
  const timestamp = consolidated.generatedAt;
  const dependencyHealth = consolidated.resilience.health.dependencies;
  const databaseHealthy =
    dependencyHealth.find((dep) => dep.name === "database")?.status === "healthy";
  const redisHealthy =
    dependencyHealth.find((dep) => dep.name === "redis")?.status === "healthy";

  let health: HealthSignalStatus = "healthy";
  let readiness: HealthSignalStatus = "healthy";
  let configurationState: CapabilityHealthReport["configurationState"] = "unknown";
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let diagnostics: Record<string, unknown> = {};

  switch (definition.capabilityId) {
    case "platform.runtime": {
      const runtime = asRecord(consolidated.runtime);
      const platformReady = runtime?.platformReady === true;
      health = platformReady ? "healthy" : bootstrapReady ? "degraded" : "unhealthy";
      readiness = bootstrapReady ? "healthy" : "unhealthy";
      diagnostics = runtime ?? {};
      if (!platformReady) {
        warnings.push("Runtime registry is not fully ready.");
        recommendations.push("Review platform bootstrap logs and manifest discovery.");
      }
      break;
    }
    case "platform.bootstrap": {
      const bootstrap = asRecord(asRecord(consolidated.runtime)?.bootstrap);
      health = bootstrapReady ? "healthy" : "unhealthy";
      readiness = health;
      diagnostics = bootstrap ?? {};
      if (!bootstrapReady) {
        recommendations.push(
          "Run ensurePlatformRuntimeReady and verify workspace root.",
        );
      }
      break;
    }
    case "platform.identity": {
      diagnostics = consolidated.identity ?? {};
      health = consolidated.identity ? "healthy" : "degraded";
      readiness = databaseHealthy ? health : "degraded";
      if (!databaseHealthy) {
        warnings.push("Identity Postgres diagnostics unavailable.");
      }
      break;
    }
    case "platform.authorization": {
      diagnostics = consolidated.authorization ?? {};
      health = consolidated.authorization ? "healthy" : "degraded";
      readiness = health;
      break;
    }
    case "platform.personalisation": {
      diagnostics = consolidated.personalisation ?? {};
      health = consolidated.personalisation ? "healthy" : "degraded";
      readiness = health;
      break;
    }
    case "platform.governance": {
      diagnostics = consolidated.governance ?? {};
      health = consolidated.governance ? "healthy" : "degraded";
      readiness = health;
      break;
    }
    case "platform.provisioning": {
      diagnostics = consolidated.governance ?? consolidated.identity ?? {};
      health = consolidated.governance ? "healthy" : "degraded";
      readiness = databaseHealthy ? health : "unknown";
      configurationState = consolidated.governance ? "valid" : "unknown";
      recommendations.push(
        "Use @apzhub/platform-provisioning flows for tenant/product enablement.",
      );
      break;
    }
    case "platform.security": {
      diagnostics = consolidated.security as unknown as Record<string, unknown>;
      health = consolidated.resilience.health.status;
      readiness = consolidated.resilience.readiness.status;
      if (!consolidated.security.environment.valid) {
        warnings.push("Environment validation reported issues.");
      }
      break;
    }
    case "platform.configuration": {
      configurationState = configurationStateFromEnvironment(consolidated);
      diagnostics = consolidated.security.environment as unknown as Record<
        string,
        unknown
      >;
      health =
        configurationState === "invalid"
          ? "unhealthy"
          : configurationState === "degraded"
            ? "degraded"
            : "healthy";
      readiness = health;
      break;
    }
    case "platform.traffic-governance": {
      diagnostics = consolidated.security.trafficGovernance as unknown as Record<
        string,
        unknown
      >;
      health = consolidated.security.trafficGovernance.status.enabled
        ? "healthy"
        : "degraded";
      readiness = health;
      recommendations.push(...consolidated.security.trafficGovernance.recommendations);
      break;
    }
    case "platform.session-security": {
      diagnostics = consolidated.security.session as unknown as Record<string, unknown>;
      health = consolidated.security.session.sessionDiagnostics.healthy
        ? "healthy"
        : "degraded";
      readiness = health;
      recommendations.push(
        ...consolidated.security.session.sessionDiagnostics.recommendations,
      );
      if (consolidated.security.session.devRegistrationAllowed) {
        warnings.push("Development registration is enabled.");
      }
      break;
    }
    case "platform.tenant-isolation": {
      diagnostics = {
        apiGuard: consolidated.security.apiGuard,
        persistence: consolidated.persistence,
      };
      health = consolidated.security.apiGuard.permissionEnforcement
        ? "healthy"
        : "degraded";
      readiness = databaseHealthy ? health : "degraded";
      if (!consolidated.security.apiGuard.permissionEnforcement) {
        warnings.push("API permission enforcement posture requires review.");
      }
      break;
    }
    case "platform.persistence": {
      diagnostics = consolidated.persistence ?? {};
      health = databaseHealthy ? "healthy" : "unhealthy";
      readiness = health;
      if (!databaseHealthy) {
        recommendations.push(
          "Restore PostgreSQL connectivity before serving write traffic.",
        );
      }
      break;
    }
    case "product.law-platform": {
      diagnostics = consolidated.lawPlatform ?? {};
      health =
        productStatuses["law-platform"] ??
        (consolidated.lawPlatform ? "healthy" : "degraded");
      readiness = pickHealth(health, databaseHealthy ? "healthy" : "unhealthy");
      break;
    }
    case "product.trust-accounting": {
      diagnostics = consolidated.trustAccounting ?? {};
      health =
        productStatuses["trust-accounting"] ??
        (consolidated.trustAccounting ? "healthy" : "degraded");
      readiness = pickHealth(health, databaseHealthy ? "healthy" : "unhealthy");
      break;
    }
    case "platform.workbench": {
      diagnostics = consolidated.workbench ?? {};
      health = consolidated.workbench ? "healthy" : "degraded";
      readiness = health;
      break;
    }
    case "platform.api-framework": {
      diagnostics = consolidated.api ?? {};
      health = consolidated.security.apiGuard.sessionRequired ? "healthy" : "degraded";
      readiness = pickHealth(health, redisHealthy ? "healthy" : "degraded");
      break;
    }
    case "platform.operations": {
      diagnostics = consolidated.operations ?? {};
      health = "healthy";
      readiness = bootstrapReady ? "healthy" : "degraded";
      break;
    }
    default:
      health = "unknown";
      readiness = "unknown";
  }

  const status = pickHealth(health, readiness);

  const resolvedConfigurationState =
    definition.capabilityId === "platform.configuration"
      ? configurationState
      : definition.capabilityId === "platform.security" ||
          definition.capabilityId === "platform.session-security"
        ? configurationStateFromEnvironment(consolidated)
        : "unknown";

  return {
    capabilityId: definition.capabilityId,
    name: definition.name,
    owner: definition.owner,
    version: definition.version,
    maturityLevel: definition.maturityLevel,
    status,
    health,
    readiness,
    configurationState: resolvedConfigurationState,
    warnings,
    recommendations,
    dependencies: [...definition.dependencies],
    lastValidation: timestamp,
    diagnostics,
  };
}

export function buildCapabilityHealthReports(
  consolidated: ConsolidatedOperationalDiagnostics,
  bootstrapReady: boolean,
  productStatuses: Readonly<Record<string, HealthSignalStatus>> = {},
): readonly CapabilityHealthReport[] {
  return PLATFORM_CAPABILITY_DEFINITIONS.map((definition) =>
    evaluateCapability(definition, consolidated, bootstrapReady, productStatuses),
  );
}

export function listAffectedProducts(
  capabilities: readonly CapabilityHealthReport[],
): readonly string[] {
  const affected = new Set<string>();

  for (const capability of capabilities) {
    if (capability.status === "healthy") {
      continue;
    }

    if (capability.capabilityId.startsWith("product.")) {
      affected.add(capability.name);
    }

    if (
      capability.capabilityId === "platform.persistence" ||
      capability.capabilityId === "platform.security"
    ) {
      affected.add("All products");
    }
  }

  return [...affected];
}
