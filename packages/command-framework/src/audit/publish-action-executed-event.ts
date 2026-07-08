import type { ActionAuditEntry } from "../types/action-audit";
import {
  buildActionExecutedEventEnvelope,
  type ActionExecutedEventEnvelope,
} from "./action-executed-event";

export interface ActionExecutedEventPublishResult {
  readonly ok: boolean;
  readonly skipped?: boolean;
  readonly envelope?: ActionExecutedEventEnvelope;
}

export interface ActionExecutedEventPublisher {
  publish(envelope: ActionExecutedEventEnvelope): { readonly ok: boolean };
}

/**
 * Publishes capability.action.executed for successful audit entries only.
 * Does not persist events or create notifications.
 */
export function publishActionExecutedEvent(
  publisher: ActionExecutedEventPublisher,
  entry: ActionAuditEntry,
): ActionExecutedEventPublishResult {
  const envelope = buildActionExecutedEventEnvelope(entry);

  if (!envelope) {
    return { ok: true, skipped: true };
  }

  const result = publisher.publish(envelope);
  return {
    ok: result.ok,
    envelope,
  };
}
