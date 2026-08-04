/**
 * Event envelope / fact validation (QO-010).
 * Transport-only — no business interpretation.
 */

import { OrchestrationError } from "../contracts/errors";
import type { PublishEventInput } from "../contracts/event-backbone";
import type { EventTypeRegistry } from "./registry";

/** Command-style verbs — never valid as event facts. */
const COMMAND_PREFIX =
  /^(run|execute|approve|deploy|invoke|start|stop|trigger|create|delete|update|patch)[-_.]/i;

/** Accepted fact suffixes (past tense or completed-state adjectives used by platform events). */
const PAST_TENSE_TOKEN =
  /(created|completed|started|stopped|paused|resumed|received|ignored|routed|rejected|produced|submitted|registered|versioned|transitioned|failed|cancelled|superseded|deferred|emitted|published|recorded|ready)$/i;

export type ValidationRejectReason =
  "command_style" | "unregistered" | "envelope" | "schema";

export interface ValidationResult {
  readonly ok: true;
  readonly eventType: string;
  readonly eventVersion: string;
}

export interface ValidationFailure {
  readonly ok: false;
  readonly reason: ValidationRejectReason;
  readonly message: string;
}

export function isCommandStyleEventType(eventType: string): boolean {
  const t = eventType.trim();
  if (!t) return true;
  if (COMMAND_PREFIX.test(t)) return true;
  // Allow registered dotted past-tense names; reject bare imperative tokens
  const last = t.split(".").pop() ?? t;
  if (/^(run|execute|approve|deploy|invoke)-/i.test(last)) return true;
  return false;
}

export function looksPastTense(eventType: string): boolean {
  const last = (eventType.trim().split(".").pop() ?? "").replace(/-/g, "_");
  return PAST_TENSE_TOKEN.test(last);
}

export function validatePublishInput(
  input: PublishEventInput,
  registry: EventTypeRegistry,
): ValidationResult | ValidationFailure {
  const eventType = input.eventType?.trim() ?? "";
  const correlationId = input.correlationId?.trim() ?? "";
  const tenantId = input.tenantId?.trim() ?? "";
  const producer = input.producer?.trim() ?? "";
  const subjectRef = input.subjectRef?.trim() ?? "";

  if (!eventType || !correlationId || !tenantId || !producer || !subjectRef) {
    return {
      ok: false,
      reason: "envelope",
      message:
        "eventType, correlationId, tenantId, producer, and subjectRef are required",
    };
  }

  if (isCommandStyleEventType(eventType)) {
    return {
      ok: false,
      reason: "command_style",
      message: `Command-style event types are forbidden: ${eventType}`,
    };
  }

  if (!looksPastTense(eventType)) {
    return {
      ok: false,
      reason: "command_style",
      message: `Event type must be past-tense fact form: ${eventType}`,
    };
  }

  const version = (input.eventVersion ?? "").trim();
  if (!registry.has(eventType, version || undefined)) {
    return {
      ok: false,
      reason: "unregistered",
      message: version
        ? `Event type not registered: ${eventType}@${version}`
        : `Event type not registered: ${eventType}`,
    };
  }

  const def = registry.get(eventType, version || undefined);
  // Lightweight schema checks — payload must be a plain object when present
  if (input.payload !== undefined) {
    if (
      input.payload === null ||
      typeof input.payload !== "object" ||
      Array.isArray(input.payload)
    ) {
      return {
        ok: false,
        reason: "schema",
        message: "payload must be a plain object when provided",
      };
    }
  }

  return {
    ok: true,
    eventType: def.eventType,
    eventVersion: def.version,
  };
}

export function assertValidPublish(
  input: PublishEventInput,
  registry: EventTypeRegistry,
): ValidationResult {
  const result = validatePublishInput(input, registry);
  if (!result.ok) {
    throw new OrchestrationError("validation", "INVALID_EVENT", result.message, {
      reason: result.reason,
      eventType: input.eventType,
    });
  }
  return result;
}
