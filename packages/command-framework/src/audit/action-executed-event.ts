import { createRandomUuid } from "./create-random-uuid";

import type { ActionAuditEntry } from "../types/action-audit";

/** Canonical platform event id for successful action execution (Document 029 / EN-014). */
export const CAPABILITY_ACTION_EXECUTED_EVENT_ID =
  "capability.action.executed" as const;

export const CAPABILITY_ACTION_EXECUTED_EVENT_VERSION = "1.0.0" as const;

export const CAPABILITY_ACTION_EXECUTED_PUBLISHER = "command-framework" as const;

export const CAPABILITY_ACTION_EXECUTED_CATEGORY = "capability" as const;

/** Payload published with capability.action.executed. */
export interface ActionExecutedEventPayload {
  readonly actionId: string;
  readonly actor: string;
  readonly resultCode: string;
  readonly ok: boolean;
  readonly durationMs: number;
  readonly auditReference: string;
  readonly userId?: string;
}

/** Platform event envelope shape produced from Action audit entries. */
export interface ActionExecutedEventEnvelope {
  readonly envelopeId: string;
  readonly eventId: typeof CAPABILITY_ACTION_EXECUTED_EVENT_ID;
  readonly eventVersion: typeof CAPABILITY_ACTION_EXECUTED_EVENT_VERSION;
  readonly category: typeof CAPABILITY_ACTION_EXECUTED_CATEGORY;
  readonly correlationId: string;
  readonly causationId?: string;
  readonly timestamp: string;
  readonly publisher: typeof CAPABILITY_ACTION_EXECUTED_PUBLISHER;
  readonly actorId?: string;
  readonly sourceService: typeof CAPABILITY_ACTION_EXECUTED_PUBLISHER;
  readonly payload: ActionExecutedEventPayload;
}

export interface BuildActionExecutedEventEnvelopeOptions {
  readonly envelopeId?: string;
  readonly correlationId?: string;
}

/**
 * Builds capability.action.executed envelope from a successful audit entry.
 * Returns undefined when the action did not succeed — failed attempts are not published.
 */
export function buildActionExecutedEventEnvelope(
  entry: ActionAuditEntry,
  options: BuildActionExecutedEventEnvelopeOptions = {},
): ActionExecutedEventEnvelope | undefined {
  if (!entry.ok) {
    return undefined;
  }

  const envelopeId = options.envelopeId ?? createRandomUuid();
  const correlationId = options.correlationId ?? createRandomUuid();

  return Object.freeze({
    envelopeId,
    eventId: CAPABILITY_ACTION_EXECUTED_EVENT_ID,
    eventVersion: CAPABILITY_ACTION_EXECUTED_EVENT_VERSION,
    category: CAPABILITY_ACTION_EXECUTED_CATEGORY,
    correlationId,
    timestamp: entry.timestamp,
    publisher: CAPABILITY_ACTION_EXECUTED_PUBLISHER,
    actorId: entry.userId ?? entry.actor,
    sourceService: CAPABILITY_ACTION_EXECUTED_PUBLISHER,
    payload: Object.freeze({
      actionId: entry.actionId,
      actor: entry.actor,
      resultCode: entry.code,
      ok: entry.ok,
      durationMs: entry.durationMs,
      auditReference: entry.auditReference,
      userId: entry.userId,
    }),
  });
}
