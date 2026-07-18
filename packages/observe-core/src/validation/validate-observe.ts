/**
 * Observability metadata validators (APZOBSERVE-001).
 */

import {
  isObserveAlertSeverity,
  isObserveAlertStateKind,
  isObserveHealthStatus,
  isObserveMetadataStatus,
  isObserveMetricKind,
  isObserveProviderKind,
  isPlatformObserveIdShape,
  type AlertDefinition,
  type HealthCheck,
  type MetricDefinition,
  type ServiceHealth,
} from "@apzhub/observe-contracts";

import { ObserveDomainError } from "../ports/repository-ports";

function requireNonEmpty(value: string | undefined, field: string): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) {
    throw new ObserveDomainError("validation_error", `${field} is required`, { field });
  }
  return trimmed;
}

export function validateHealthCheck(input: HealthCheck): HealthCheck {
  if (!isPlatformObserveIdShape(input.id)) {
    throw new ObserveDomainError("validation_error", "id is invalid", {
      field: "id",
    });
  }
  requireNonEmpty(input.tenantId, "tenantId");
  requireNonEmpty(input.serviceKey, "serviceKey");
  requireNonEmpty(input.name, "name");
  if (!isObserveHealthStatus(input.status)) {
    throw new ObserveDomainError("validation_error", "status is invalid", {
      field: "status",
    });
  }
  if (!isObserveProviderKind(input.providerKind)) {
    throw new ObserveDomainError("validation_error", "providerKind is invalid", {
      field: "providerKind",
    });
  }
  return input;
}

export function validateServiceHealth(input: ServiceHealth): ServiceHealth {
  requireNonEmpty(input.tenantId, "tenantId");
  requireNonEmpty(input.serviceKey, "serviceKey");
  requireNonEmpty(input.displayName, "displayName");
  if (!isObserveHealthStatus(input.overallStatus)) {
    throw new ObserveDomainError("validation_error", "overallStatus is invalid", {
      field: "overallStatus",
    });
  }
  return input;
}

export function validateMetricDefinition(input: MetricDefinition): MetricDefinition {
  requireNonEmpty(input.tenantId, "tenantId");
  requireNonEmpty(input.key, "key");
  requireNonEmpty(input.name, "name");
  if (!isObserveMetricKind(input.kind)) {
    throw new ObserveDomainError("validation_error", "kind is invalid", {
      field: "kind",
    });
  }
  if (!isObserveMetadataStatus(input.status)) {
    throw new ObserveDomainError("validation_error", "status is invalid", {
      field: "status",
    });
  }
  return input;
}

export function validateAlertDefinition(input: AlertDefinition): AlertDefinition {
  requireNonEmpty(input.tenantId, "tenantId");
  requireNonEmpty(input.key, "key");
  requireNonEmpty(input.name, "name");
  if (!isObserveAlertSeverity(input.severity)) {
    throw new ObserveDomainError("validation_error", "severity is invalid", {
      field: "severity",
    });
  }
  if (!isObserveMetadataStatus(input.status)) {
    throw new ObserveDomainError("validation_error", "status is invalid", {
      field: "status",
    });
  }
  return input;
}

export function assertAlertStateKind(value: string): void {
  if (!isObserveAlertStateKind(value)) {
    throw new ObserveDomainError("validation_error", "alert state is invalid", {
      field: "state",
      value,
    });
  }
}

/** Reject credential-like fields if ever supplied via metadata payloads. */
export function assertNoCredentialPayload(
  metadata: Readonly<Record<string, unknown>> | undefined,
): void {
  if (!metadata) return;
  const forbidden = [
    "password",
    "passwordHash",
    "apiKey",
    "secret",
    "token",
    "bearerToken",
  ];
  for (const key of Object.keys(metadata)) {
    if (forbidden.some((f) => key.toLowerCase().includes(f.toLowerCase()))) {
      throw new ObserveDomainError(
        "credentials_forbidden",
        `Observability metadata must not include credential field: ${key}`,
        { key },
      );
    }
  }
}
