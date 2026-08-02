/**
 * Factory for Evidence EventProcessors — business logic only inside execute.
 */

import type {
  EventProcessor,
  ProcessingContext,
  ProcessingResult,
} from "@apzhub/platform-processing";

import type { QepEvidencePlatformEventId } from "../events/catalogue";
import { validateQepEvidenceEventEnvelope } from "../events/envelope";
import { mapProcessingContextToEvidence } from "./context-mapping";
import {
  classifyEvidenceProcessorFailure,
  mapEvidenceOutcomeToProcessingResult,
} from "./result-mapping";
import type {
  EvidenceBusinessActionPort,
  EvidenceProcessorMetadata,
  EvidenceProcessorRegistration,
} from "./types";

export type CreateEvidenceProcessorOptions = {
  readonly metadata: Omit<
    EvidenceProcessorMetadata,
    "ownership" | "introducedIn" | "health"
  > & {
    readonly health?: EvidenceProcessorMetadata["health"];
  };
  readonly action: string;
  readonly business: EvidenceBusinessActionPort;
  /** Optional extra validation after catalogue mapping. */
  readonly validateBusiness?: (input: {
    readonly eventId: QepEvidencePlatformEventId;
    readonly evidenceId: string;
    readonly payload: Readonly<Record<string, unknown>>;
  }) => { readonly ok: true } | { readonly ok: false; readonly error: string };
};

export function createEvidenceEventProcessor(
  options: CreateEvidenceProcessorOptions,
): EvidenceProcessorRegistration {
  const metadata: EvidenceProcessorMetadata = {
    ...options.metadata,
    ownership: "qep-evidence",
    introducedIn: "APZQEP-120-S10",
    health: options.metadata.health ?? "healthy",
  };

  const processor: EventProcessor = {
    descriptor: {
      processorId: metadata.processorId,
      name: metadata.name,
      capabilities: metadata.eventTypes.map((eventType) => ({
        eventType,
        description: metadata.description,
      })),
      replayCompatible: metadata.replayCompatible,
    },
    async execute(context: ProcessingContext): Promise<ProcessingResult> {
      const mapped = mapProcessingContextToEvidence(context);
      if (!mapped.ok) {
        return mapEvidenceOutcomeToProcessingResult({
          kind: "terminal",
          message: mapped.error,
          poison: mapped.permanent,
        });
      }

      const { business } = mapped;

      if (business.envelope) {
        const envelopeValidation = validateQepEvidenceEventEnvelope(business.envelope);
        if (!envelopeValidation.ok) {
          return mapEvidenceOutcomeToProcessingResult({
            kind: "terminal",
            message: envelopeValidation.error,
            poison: true,
          });
        }
      }

      if (options.validateBusiness) {
        const extra = options.validateBusiness({
          eventId: business.eventId,
          evidenceId: business.evidenceId,
          payload: business.payload,
        });
        if (!extra.ok) {
          const cls = classifyEvidenceProcessorFailure(extra.error);
          return mapEvidenceOutcomeToProcessingResult(
            cls.permanent
              ? {
                  kind: "terminal",
                  message: extra.error,
                  poison: cls.poison,
                }
              : { kind: "retry", message: extra.error },
          );
        }
      }

      try {
        await options.business.apply({
          processorId: metadata.processorId,
          eventId: business.eventId,
          evidenceId: business.evidenceId,
          tenantId: business.tenantId,
          action: options.action,
          payload: business.payload,
          ...(business.correlationId ? { correlationId: business.correlationId } : {}),
          idempotencyKey: business.idempotencyKey,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "BUSINESS_ACTION_FAILED";
        const cls = classifyEvidenceProcessorFailure(message);
        return mapEvidenceOutcomeToProcessingResult(
          cls.permanent
            ? { kind: "terminal", message, poison: cls.poison }
            : { kind: "retry", message },
        );
      }

      return mapEvidenceOutcomeToProcessingResult({ kind: "success" });
    },
  };

  return { metadata, processor };
}
