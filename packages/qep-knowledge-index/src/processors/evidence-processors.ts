/**
 * Knowledge Index processors — product bundle for Evidence events.
 * Apply projections; never manage leases/retries (platform owns those).
 */

import type {
  EventProcessor,
  ProcessingContext,
  ProcessingResult,
} from "@apzhub/platform-processing";
import type { QepEvidenceEventEnvelope } from "@apzhub/qep-evidence/application";
import { QEP_EVIDENCE_PLATFORM_EVENTS } from "@apzhub/qep-evidence/application";

import type { ProjectionEngine } from "../projection/engine";

function extractEnvelope(
  context: ProcessingContext,
): QepEvidenceEventEnvelope | undefined {
  const candidate = context.payload.envelope;
  if (candidate && typeof candidate === "object") {
    return candidate as QepEvidenceEventEnvelope;
  }
  return undefined;
}

function createProjectionProcessor(options: {
  readonly processorId: string;
  readonly name: string;
  readonly eventTypes: readonly string[];
  readonly engine: ProjectionEngine;
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
      const result = await options.engine.applyEvent({
        eventType: context.eventType,
        tenantId: context.tenantId,
        payload: envelope?.payload ?? context.payload,
        ...(envelope ? { envelope } : {}),
        ...(context.correlationId ? { correlationId: context.correlationId } : {}),
        now: context.now,
      });

      if (!result.ok) {
        return result.retryable
          ? { outcome: "retry", message: result.error, retryable: true }
          : {
              outcome: "terminal_failure",
              message: result.error,
              permanent: true,
            };
      }
      return { outcome: "acknowledged" };
    },
  };
}

export function createKnowledgeIndexEvidenceProcessors(
  engine: ProjectionEngine,
): readonly EventProcessor[] {
  return [
    createProjectionProcessor({
      processorId: "qep.knowledge.processor.evidence.created",
      name: "QKI Evidence Created",
      eventTypes: [QEP_EVIDENCE_PLATFORM_EVENTS.created],
      engine,
    }),
    createProjectionProcessor({
      processorId: "qep.knowledge.processor.evidence.updated",
      name: "QKI Evidence Updated",
      eventTypes: [QEP_EVIDENCE_PLATFORM_EVENTS.updated],
      engine,
    }),
    createProjectionProcessor({
      processorId: "qep.knowledge.processor.evidence.lifecycle",
      name: "QKI Evidence Lifecycle",
      eventTypes: [QEP_EVIDENCE_PLATFORM_EVENTS.lifecycleChanged],
      engine,
    }),
    createProjectionProcessor({
      processorId: "qep.knowledge.processor.evidence.integrity",
      name: "QKI Evidence Integrity",
      eventTypes: [
        QEP_EVIDENCE_PLATFORM_EVENTS.integrityEstablished,
        QEP_EVIDENCE_PLATFORM_EVENTS.integrityVerified,
      ],
      engine,
    }),
    createProjectionProcessor({
      processorId: "qep.knowledge.processor.evidence.archive",
      name: "QKI Evidence Archive",
      eventTypes: [QEP_EVIDENCE_PLATFORM_EVENTS.archived],
      engine,
    }),
    createProjectionProcessor({
      processorId: "qep.knowledge.processor.evidence.supersession",
      name: "QKI Evidence Supersession",
      eventTypes: [QEP_EVIDENCE_PLATFORM_EVENTS.superseded],
      engine,
    }),
    createProjectionProcessor({
      processorId: "qep.knowledge.processor.evidence.delete",
      name: "QKI Evidence Delete",
      eventTypes: [QEP_EVIDENCE_PLATFORM_EVENTS.deleted],
      engine,
    }),
  ];
}
