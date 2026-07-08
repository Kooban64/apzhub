import type { EventEnvelope } from "@apzhub/event-notification-framework";

const PLACEHOLDER_PATTERN = /\{\{([^}]+)\}\}/g;

function stringifyPayloadValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return JSON.stringify(value);
}

function resolvePlaceholder(key: string, envelope: EventEnvelope): string {
  const trimmed = key.trim();

  if (trimmed === "event.id") {
    return envelope.eventId;
  }

  if (trimmed === "event.category") {
    return envelope.category;
  }

  if (trimmed === "event.timestamp") {
    return envelope.timestamp;
  }

  if (trimmed === "actor.id") {
    return envelope.actorId ?? "";
  }

  if (trimmed.startsWith("payload.")) {
    const payloadKey = trimmed.slice("payload.".length);
    if (!payloadKey) {
      return "";
    }

    return stringifyPayloadValue(envelope.payload[payloadKey]);
  }

  return "";
}

/**
 * Renders an activity template using simple `{{placeholder}}` substitution.
 *
 * Supported placeholders:
 * - `{{event.id}}`
 * - `{{event.category}}`
 * - `{{event.timestamp}}`
 * - `{{actor.id}}`
 * - `{{payload.xxx}}`
 */
export function renderActivityTemplate(
  template: string,
  envelope: EventEnvelope,
): string {
  return template.replace(PLACEHOLDER_PATTERN, (_match, rawKey: string) =>
    resolvePlaceholder(rawKey, envelope),
  );
}

export class ActivityTemplateRenderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ActivityTemplateRenderError";
  }
}

/** Validates template shape before rendering — rejects empty templates. */
export function assertRenderableActivityTemplate(
  template: string,
  field: string,
): void {
  if (!template.trim()) {
    throw new ActivityTemplateRenderError(`${field} must be non-empty`);
  }
}

export function isActivityTemplateRenderError(
  error: unknown,
): error is ActivityTemplateRenderError {
  return error instanceof ActivityTemplateRenderError;
}

/** Documented placeholder keys supported by {@link renderActivityTemplate}. */
export const ACTIVITY_TEMPLATE_PLACEHOLDERS = Object.freeze([
  "event.id",
  "event.category",
  "event.timestamp",
  "actor.id",
  "payload.xxx",
]);
