import type { EventCategory } from "../types/event-category";
import type { EventRegistry } from "./event-descriptor";
import type { EventBusPublishErrorCode, EventEnvelope } from "./event-envelope";

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const SEMVER_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

export type EventEnvelopeValidationIssueCode =
  | "MISSING_FIELD"
  | "INVALID_UUID"
  | "INVALID_SEMVER"
  | "EVENT_NOT_REGISTERED"
  | "VERSION_MISMATCH"
  | "CATEGORY_MISMATCH"
  | "PUBLISHER_UNAUTHORIZED"
  | "INVALID_TIMESTAMP"
  | "INVALID_PAYLOAD";

export interface EventEnvelopeValidationIssue {
  readonly code: EventEnvelopeValidationIssueCode;
  readonly field?: string;
  readonly message: string;
}

export interface EventEnvelopeValidationResult {
  readonly ok: boolean;
  readonly errorCode?: EventBusPublishErrorCode;
  readonly issue?: EventEnvelopeValidationIssue;
}

function invalid(
  errorCode: EventBusPublishErrorCode,
  issue: EventEnvelopeValidationIssue,
): EventEnvelopeValidationResult {
  return { ok: false, errorCode, issue };
}

function isIso8601Timestamp(value: string): boolean {
  const parsed = Date.parse(value);
  return !Number.isNaN(parsed);
}

function isAuthorizedPublisher(
  envelopePublisher: string,
  registeredPublisher: string,
  sourceCapability: string | undefined,
): boolean {
  return (
    envelopePublisher === registeredPublisher ||
    (sourceCapability !== undefined && envelopePublisher === sourceCapability)
  );
}

/** Validates envelope shape and registration metadata before dispatch. */
export function validateEventEnvelope(
  envelope: EventEnvelope,
  registry: EventRegistry,
): EventEnvelopeValidationResult {
  if (!envelope.envelopeId?.trim()) {
    return invalid("INVALID_ENVELOPE", {
      code: "MISSING_FIELD",
      field: "envelopeId",
      message: "Envelope id is required",
    });
  }

  if (!UUID_V4_PATTERN.test(envelope.envelopeId)) {
    return invalid("INVALID_ENVELOPE", {
      code: "INVALID_UUID",
      field: "envelopeId",
      message: "Envelope id must be a UUID v4",
    });
  }

  if (!envelope.eventId?.trim()) {
    return invalid("INVALID_ENVELOPE", {
      code: "MISSING_FIELD",
      field: "eventId",
      message: "Event id is required",
    });
  }

  if (!registry.has(envelope.eventId)) {
    return invalid("EVENT_NOT_REGISTERED", {
      code: "EVENT_NOT_REGISTERED",
      field: "eventId",
      message: `Event "${envelope.eventId}" is not registered`,
    });
  }

  if (!envelope.eventVersion?.trim()) {
    return invalid("INVALID_ENVELOPE", {
      code: "MISSING_FIELD",
      field: "eventVersion",
      message: "Event version is required",
    });
  }

  if (!SEMVER_PATTERN.test(envelope.eventVersion)) {
    return invalid("INVALID_ENVELOPE", {
      code: "INVALID_SEMVER",
      field: "eventVersion",
      message: "Event version must be semver",
    });
  }

  const descriptor = registry.get(envelope.eventId);
  if (!descriptor) {
    return invalid("EVENT_NOT_REGISTERED", {
      code: "EVENT_NOT_REGISTERED",
      field: "eventId",
      message: `Event "${envelope.eventId}" is not registered`,
    });
  }

  if (envelope.eventVersion !== descriptor.version) {
    return invalid("INVALID_ENVELOPE", {
      code: "VERSION_MISMATCH",
      field: "eventVersion",
      message: `Event version "${envelope.eventVersion}" does not match registration "${descriptor.version}"`,
    });
  }

  if (!envelope.category) {
    return invalid("INVALID_ENVELOPE", {
      code: "MISSING_FIELD",
      field: "category",
      message: "Event category is required",
    });
  }

  if (envelope.category !== descriptor.category) {
    return invalid("INVALID_ENVELOPE", {
      code: "CATEGORY_MISMATCH",
      field: "category",
      message: `Category "${envelope.category as EventCategory}" does not match registration "${descriptor.category}"`,
    });
  }

  if (!envelope.correlationId?.trim()) {
    return invalid("INVALID_ENVELOPE", {
      code: "MISSING_FIELD",
      field: "correlationId",
      message: "Correlation id is required",
    });
  }

  if (envelope.causationId !== undefined && envelope.causationId !== "") {
    if (!UUID_V4_PATTERN.test(envelope.causationId)) {
      return invalid("INVALID_ENVELOPE", {
        code: "INVALID_UUID",
        field: "causationId",
        message: "Causation id must be a UUID v4 when provided",
      });
    }
  }

  if (!envelope.timestamp?.trim()) {
    return invalid("INVALID_ENVELOPE", {
      code: "MISSING_FIELD",
      field: "timestamp",
      message: "Timestamp is required",
    });
  }

  if (!isIso8601Timestamp(envelope.timestamp)) {
    return invalid("INVALID_ENVELOPE", {
      code: "INVALID_TIMESTAMP",
      field: "timestamp",
      message: "Timestamp must be ISO-8601",
    });
  }

  if (!envelope.publisher?.trim()) {
    return invalid("INVALID_ENVELOPE", {
      code: "MISSING_FIELD",
      field: "publisher",
      message: "Publisher is required",
    });
  }

  if (
    !isAuthorizedPublisher(
      envelope.publisher,
      descriptor.publisher,
      descriptor.sourceCapability,
    )
  ) {
    return invalid("INVALID_ENVELOPE", {
      code: "PUBLISHER_UNAUTHORIZED",
      field: "publisher",
      message: `Publisher "${envelope.publisher}" is not authorized for event "${envelope.eventId}"`,
    });
  }

  if (
    envelope.payload === null ||
    envelope.payload === undefined ||
    typeof envelope.payload !== "object" ||
    Array.isArray(envelope.payload)
  ) {
    return invalid("INVALID_ENVELOPE", {
      code: "INVALID_PAYLOAD",
      field: "payload",
      message: "Payload must be a plain object",
    });
  }

  return { ok: true };
}
