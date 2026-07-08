import type { ActionAuditEntry, ActionAuditHook } from "@apzhub/command-framework";
import {
  buildActionExecutedEventEnvelope,
  type ActionExecutedEventEnvelope,
} from "@apzhub/command-framework";

import type { EventBus, EventEnvelope } from "../event/event-envelope";

export interface PublishActionExecutedEventToBusOptions {
  readonly envelopeId?: string;
  readonly correlationId?: string;
}

function toEventEnvelope(envelope: ActionExecutedEventEnvelope): EventEnvelope {
  return Object.freeze({
    ...envelope,
    payload: Object.freeze({ ...envelope.payload }),
  });
}

/** Publishes capability.action.executed to the in-process Event Bus — no persistence. */
export function publishActionExecutedEventToBus(
  eventBus: EventBus,
  entry: ActionAuditEntry,
  options: PublishActionExecutedEventToBusOptions = {},
) {
  const envelope = buildActionExecutedEventEnvelope(entry, options);

  if (!envelope) {
    return { ok: true, skipped: true as const };
  }

  const result = eventBus.publish(toEventEnvelope(envelope));
  return {
    ok: result.ok,
    skipped: false as const,
    envelope,
  };
}

/** Builds platform EventEnvelope for capability.action.executed — test and adapter helper. */
export function buildPlatformActionExecutedEventEnvelope(
  entry: ActionAuditEntry,
  options: PublishActionExecutedEventToBusOptions = {},
): EventEnvelope | undefined {
  const envelope = buildActionExecutedEventEnvelope(entry, options);
  return envelope ? toEventEnvelope(envelope) : undefined;
}

export interface CreateActionAuditEventBusHookOptions {
  readonly eventBus: EventBus;
  readonly onPublished?: (
    entry: ActionAuditEntry,
    envelope: ActionExecutedEventEnvelope,
  ) => void;
  readonly onSkipped?: (entry: ActionAuditEntry) => void;
  readonly onFailed?: (entry: ActionAuditEntry) => void;
}

/**
 * Action Framework audit hook adapter — publishes successful executions to Event Bus.
 * Does not invoke notification mappers or Notification Service.
 */
export function createActionAuditEventBusHook(
  options: CreateActionAuditEventBusHookOptions,
): ActionAuditHook {
  return {
    record(entry) {
      const result = publishActionExecutedEventToBus(options.eventBus, entry);

      if (result.skipped) {
        options.onSkipped?.(entry);
        return;
      }

      if (!result.ok || !result.envelope) {
        options.onFailed?.(entry);
        return;
      }

      options.onPublished?.(entry, result.envelope);
    },
  };
}
