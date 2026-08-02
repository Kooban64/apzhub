/**
 * Notification processors — subscribe to Evidence domain events.
 * Never manage leases/retries (platform owns those). Never call business services.
 */

import type {
  EventProcessor,
  ProcessingContext,
  ProcessingResult,
} from "@apzhub/platform-processing";
import type { QepEvidenceEventEnvelope } from "@apzhub/qep-evidence/application";
import { QEP_EVIDENCE_PLATFORM_EVENTS } from "@apzhub/qep-evidence/application";

import type { NotificationDeliveryEngine } from "../delivery/engine";

function extractEnvelope(
  context: ProcessingContext,
): QepEvidenceEventEnvelope | undefined {
  const candidate = context.payload.envelope;
  if (candidate && typeof candidate === "object") {
    return candidate as QepEvidenceEventEnvelope;
  }
  return undefined;
}

function createNotificationProcessor(options: {
  readonly processorId: string;
  readonly name: string;
  readonly eventTypes: readonly string[];
  readonly engine: NotificationDeliveryEngine;
}): EventProcessor {
  return {
    descriptor: {
      processorId: options.processorId,
      name: options.name,
      capabilities: options.eventTypes.map((eventType) => ({ eventType })),
      replayCompatible: true,
    },
    async execute(context: ProcessingContext): Promise<ProcessingResult> {
      const envelope = extractEnvelope(context);
      const payload =
        (envelope?.payload as Record<string, unknown> | undefined) ?? context.payload;
      const correlationId =
        context.correlationId ?? envelope?.correlationId ?? context.workItemId;

      const result = await options.engine.processFact({
        eventType: context.eventType,
        tenantId: context.tenantId,
        correlationId,
        ...(envelope?.envelopeId ? { sourceEventId: envelope.envelopeId } : {}),
        payload: {
          ...payload,
          evidenceId:
            (payload.evidenceId as string | undefined) ?? envelope?.payload?.evidenceId,
        },
        now: context.now,
      });

      if (result.retryableFailures > 0) {
        return {
          outcome: "retry",
          message: result.errors.join("; ") || "notification.retry",
          retryable: true,
        };
      }
      if (result.permanentFailures > 0 && result.delivered === 0) {
        return {
          outcome: "dead_letter",
          message: result.errors.join("; ") || "notification.dead_letter",
        };
      }
      return { outcome: "acknowledged" };
    },
  };
}

export function createNotificationEvidenceProcessors(
  engine: NotificationDeliveryEngine,
): readonly EventProcessor[] {
  return [
    createNotificationProcessor({
      processorId: "qep.notification.processor.evidence.created",
      name: "Notify Evidence Created",
      eventTypes: [QEP_EVIDENCE_PLATFORM_EVENTS.created],
      engine,
    }),
    createNotificationProcessor({
      processorId: "qep.notification.processor.evidence.updated",
      name: "Notify Evidence Updated",
      eventTypes: [QEP_EVIDENCE_PLATFORM_EVENTS.updated],
      engine,
    }),
    createNotificationProcessor({
      processorId: "qep.notification.processor.evidence.lifecycle",
      name: "Notify Evidence Lifecycle",
      eventTypes: [QEP_EVIDENCE_PLATFORM_EVENTS.lifecycleChanged],
      engine,
    }),
    createNotificationProcessor({
      processorId: "qep.notification.processor.evidence.integrity",
      name: "Notify Evidence Integrity",
      eventTypes: [
        QEP_EVIDENCE_PLATFORM_EVENTS.integrityEstablished,
        QEP_EVIDENCE_PLATFORM_EVENTS.integrityVerified,
      ],
      engine,
    }),
    createNotificationProcessor({
      processorId: "qep.notification.processor.evidence.archive",
      name: "Notify Evidence Archive",
      eventTypes: [QEP_EVIDENCE_PLATFORM_EVENTS.archived],
      engine,
    }),
    createNotificationProcessor({
      processorId: "qep.notification.processor.evidence.supersession",
      name: "Notify Evidence Supersession",
      eventTypes: [QEP_EVIDENCE_PLATFORM_EVENTS.superseded],
      engine,
    }),
    createNotificationProcessor({
      processorId: "qep.notification.processor.evidence.delete",
      name: "Notify Evidence Delete",
      eventTypes: [QEP_EVIDENCE_PLATFORM_EVENTS.deleted],
      engine,
    }),
  ];
}
