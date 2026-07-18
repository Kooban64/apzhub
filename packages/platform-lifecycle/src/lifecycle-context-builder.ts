import type {
  ConsolidatedOperationalDiagnostics,
  HealthSignalStatus,
} from "@apzhub/platform-security";

import type { PlatformLifecycleState } from "./types";

export interface LifecycleEvaluationContext {
  readonly bootstrapReady: boolean;
  readonly configurationValid: boolean;
  readonly identityReady: boolean;
  readonly authorizationReady: boolean;
  readonly platformCoreReady: boolean;
  readonly productsReady: boolean;
  readonly operationalReady: boolean;
  readonly platformDegraded: boolean;
  readonly databaseHealthy: boolean;
  readonly redisHealthy: boolean;
  readonly healthStatus: ConsolidatedOperationalDiagnostics["resilience"]["health"]["status"];
  readonly satisfiedGates: readonly PlatformLifecycleState[];
}

function databaseHealthy(consolidated: ConsolidatedOperationalDiagnostics): boolean {
  return consolidated.resilience.health.dependencies.some(
    (dep) => dep.name === "database" && dep.status === "healthy",
  );
}

function redisHealthy(consolidated: ConsolidatedOperationalDiagnostics): boolean {
  return consolidated.resilience.health.dependencies.some(
    (dep) => dep.name === "redis" && dep.status === "healthy",
  );
}

export function buildLifecycleEvaluationContext(input: {
  readonly consolidated: ConsolidatedOperationalDiagnostics;
  readonly bootstrapReady: boolean;
  readonly productStatuses?: Readonly<Record<string, HealthSignalStatus>>;
}): LifecycleEvaluationContext {
  const { consolidated, bootstrapReady, productStatuses = {} } = input;

  const configurationValid = consolidated.security.environment.valid;
  const identityReady = Boolean(consolidated.identity);
  const authorizationReady = Boolean(consolidated.authorization);
  const dbHealthy = databaseHealthy(consolidated);
  const redisOk = redisHealthy(consolidated);

  const platformCoreReady =
    bootstrapReady &&
    configurationValid &&
    identityReady &&
    authorizationReady &&
    dbHealthy &&
    redisOk &&
    consolidated.resilience.readiness.status === "healthy" &&
    consolidated.security.session.sessionDiagnostics.healthy &&
    consolidated.security.apiGuard.permissionEnforcement;

  const lawReady =
    productStatuses["law-platform"] === "healthy" ||
    (productStatuses["law-platform"] === undefined &&
      Boolean(consolidated.lawPlatform));
  const trustReady =
    productStatuses["trust-accounting"] === "healthy" ||
    (productStatuses["trust-accounting"] === undefined &&
      Boolean(consolidated.trustAccounting));

  const productsReady = platformCoreReady && lawReady && trustReady;

  const platformDegraded =
    consolidated.resilience.health.status === "degraded" ||
    consolidated.resilience.readiness.status === "degraded";

  const operationalReady =
    productsReady &&
    !platformDegraded &&
    consolidated.resilience.health.status === "healthy";

  const satisfiedGates: PlatformLifecycleState[] = ["initializing"];

  if (bootstrapReady || consolidated.runtime) {
    satisfiedGates.push("bootstrapping");
  }
  if (satisfiedGates.includes("bootstrapping") && configurationValid) {
    satisfiedGates.push("configuration-ready");
  }
  if (satisfiedGates.includes("configuration-ready") && identityReady && dbHealthy) {
    satisfiedGates.push("identity-ready");
  }
  if (satisfiedGates.includes("identity-ready") && authorizationReady) {
    satisfiedGates.push("authorization-ready");
  }
  if (satisfiedGates.includes("authorization-ready") && platformCoreReady) {
    satisfiedGates.push("platform-ready");
  }
  if (satisfiedGates.includes("platform-ready") && productsReady) {
    satisfiedGates.push("products-ready");
  }
  if (satisfiedGates.includes("products-ready") && operationalReady) {
    satisfiedGates.push("operational");
  }

  return {
    bootstrapReady,
    configurationValid,
    identityReady,
    authorizationReady,
    platformCoreReady,
    productsReady,
    operationalReady,
    platformDegraded,
    databaseHealthy: dbHealthy,
    redisHealthy: redisOk,
    healthStatus: consolidated.resilience.health.status,
    satisfiedGates,
  };
}

export function buildReadinessGates(
  context: LifecycleEvaluationContext,
): readonly { gate: PlatformLifecycleState; satisfied: boolean; message: string }[] {
  return [
    {
      gate: "bootstrapping",
      satisfied: context.bootstrapReady,
      message: context.bootstrapReady
        ? "Platform bootstrap completed."
        : "Platform bootstrap has not completed.",
    },
    {
      gate: "configuration-ready",
      satisfied: context.configurationValid,
      message: context.configurationValid
        ? "Environment configuration is valid."
        : "Environment configuration validation failed.",
    },
    {
      gate: "identity-ready",
      satisfied: context.identityReady && context.databaseHealthy,
      message:
        context.identityReady && context.databaseHealthy
          ? "Identity services are ready."
          : "Identity or persistence prerequisites are not satisfied.",
    },
    {
      gate: "authorization-ready",
      satisfied: context.authorizationReady,
      message: context.authorizationReady
        ? "Authorization services are ready."
        : "Authorization services are not ready.",
    },
    {
      gate: "platform-ready",
      satisfied: context.platformCoreReady,
      message: context.platformCoreReady
        ? "Platform core capabilities are ready."
        : "Platform core capabilities require attention.",
    },
    {
      gate: "products-ready",
      satisfied: context.productsReady,
      message: context.productsReady
        ? "Registered products are ready."
        : "One or more products are not ready.",
    },
    {
      gate: "operational",
      satisfied: context.operationalReady,
      message: context.operationalReady
        ? "Platform is operational."
        : "Platform is not fully operational.",
    },
  ];
}
