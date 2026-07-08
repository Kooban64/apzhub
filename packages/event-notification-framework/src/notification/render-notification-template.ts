import type { EventEnvelope } from "../event/event-envelope";

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
 * Renders a notification template using simple `{{placeholder}}` substitution.
 * Supports `event.id`, `event.category`, `event.timestamp`, and `payload.xxx` only.
 */
export function renderNotificationTemplate(
  template: string,
  envelope: EventEnvelope,
): string {
  return template.replace(PLACEHOLDER_PATTERN, (_match, rawKey: string) =>
    resolvePlaceholder(rawKey, envelope),
  );
}

export class NotificationTemplateRenderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotificationTemplateRenderError";
  }
}

/** Validates template shape before rendering — rejects empty templates. */
export function assertRenderableTemplate(template: string, field: string): void {
  if (!template.trim()) {
    throw new NotificationTemplateRenderError(`${field} must be non-empty`);
  }
}
