import type {
  IntegrationHealth,
  IntegrationHealthCheckStatus,
} from "../diagnostics/types";
import { CRITICAL_HEALTH_CHECK_NAMES, type AggregateHealthChecksInput } from "./types";

function isCriticalCheck(name: string): boolean {
  return (CRITICAL_HEALTH_CHECK_NAMES as readonly string[]).includes(name);
}

export function aggregateHealthChecks(
  input: AggregateHealthChecksInput,
): IntegrationHealth {
  if (input.disabled) {
    return {
      status: "disabled",
      integrationId: input.integrationId,
      capabilityId: input.capabilityId,
      tenantId: input.tenantId,
      checks: [
        {
          name: "integration",
          status: "warn",
          message: "Integration is disabled",
        },
      ],
      observedAt: input.observedAt,
      correlationId: input.correlationId,
    };
  }

  let hasCriticalFail = false;
  let hasDegradedSignal = false;

  for (const check of input.checks) {
    if (check.status === "fail" && isCriticalCheck(check.name)) {
      hasCriticalFail = true;
    }
    if (
      check.status === "warn" ||
      (check.status === "fail" && !isCriticalCheck(check.name))
    ) {
      hasDegradedSignal = true;
    }
  }

  let status: IntegrationHealth["status"] = "healthy";
  if (hasCriticalFail) {
    status = "unavailable";
  } else if (hasDegradedSignal) {
    status = "degraded";
  }

  return {
    status,
    integrationId: input.integrationId,
    capabilityId: input.capabilityId,
    tenantId: input.tenantId,
    checks: input.checks,
    observedAt: input.observedAt,
    correlationId: input.correlationId,
  };
}

export function mapConnectionLifecycleToHealthSignal(
  lifecycleState: string,
): IntegrationHealthCheckStatus {
  switch (lifecycleState) {
    case "connected":
      return "pass";
    case "degraded":
      return "warn";
    case "disabled":
      return "warn";
    case "authentication_failed":
    case "misconfigured":
      return "fail";
    default:
      return "warn";
  }
}
