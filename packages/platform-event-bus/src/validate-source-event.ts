import {
  isDeliveryMechanism,
  SOURCE_EVENT_ENVELOPE_SCHEMA_VERSION,
  type IntegrationSourceEvent,
} from "@apzhub/integration-sdk/events";

export type SourceEventValidationIssue = {
  readonly field: string;
  readonly message: string;
};

export type SourceEventValidationResult =
  | { readonly ok: true; readonly event: IntegrationSourceEvent }
  | { readonly ok: false; readonly issues: readonly SourceEventValidationIssue[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireString(
  record: Record<string, unknown>,
  field: string,
  issues: SourceEventValidationIssue[],
): string | undefined {
  const value = record[field];
  if (typeof value !== "string" || value.trim().length === 0) {
    issues.push({ field, message: `${field} must be a non-empty string` });
    return undefined;
  }
  return value;
}

/**
 * Validate SDK IntegrationSourceEvent envelope shape (OSS-100-08 contract).
 * Does not mutate Integration SDK types — structural validation only.
 */
export function validateIntegrationSourceEvent(
  value: unknown,
): SourceEventValidationResult {
  const issues: SourceEventValidationIssue[] = [];
  if (!isRecord(value)) {
    return {
      ok: false,
      issues: [{ field: "$", message: "payload must be an object" }],
    };
  }

  requireString(value, "eventId", issues);
  requireString(value, "sourceEventId", issues);
  requireString(value, "eventType", issues);
  requireString(value, "action", issues);
  requireString(value, "resourceType", issues);
  requireString(value, "providerId", issues);
  requireString(value, "integrationId", issues);
  requireString(value, "correlationId", issues);
  requireString(value, "receivedTimestamp", issues);
  const envelopeSchemaVersion = requireString(value, "envelopeSchemaVersion", issues);
  requireString(value, "payloadSchemaVersion", issues);
  const deliveryMechanism = requireString(value, "deliveryMechanism", issues);

  if (deliveryMechanism !== undefined && !isDeliveryMechanism(deliveryMechanism)) {
    issues.push({
      field: "deliveryMechanism",
      message: `unsupported deliveryMechanism: ${deliveryMechanism}`,
    });
  }

  if (
    envelopeSchemaVersion !== undefined &&
    envelopeSchemaVersion !== SOURCE_EVENT_ENVELOPE_SCHEMA_VERSION
  ) {
    issues.push({
      field: "envelopeSchemaVersion",
      message: `expected ${SOURCE_EVENT_ENVELOPE_SCHEMA_VERSION}, got ${envelopeSchemaVersion}`,
    });
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    event: value as unknown as IntegrationSourceEvent,
  };
}
