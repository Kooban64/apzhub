/**
 * APZQEP-120-S10 — Evidence business processor metadata.
 * Extensible product registration model (Evidence today; Search/Notify later).
 */

import type { EventProcessor } from "@apzhub/platform-processing";

import type { QepEvidencePlatformEventId } from "../events/catalogue";

export const EVIDENCE_PROCESSOR_BUNDLE_ID = "qep-evidence" as const;

export type ProcessorHealth = "healthy" | "degraded" | "unavailable";

export type EvidenceProcessorMetadata = {
  readonly processorId: string;
  readonly name: string;
  readonly version: string;
  readonly ownership: typeof EVIDENCE_PROCESSOR_BUNDLE_ID;
  readonly introducedIn: "APZQEP-120-S10";
  readonly eventTypes: readonly QepEvidencePlatformEventId[];
  readonly health: ProcessorHealth;
  readonly replayCompatible: boolean;
  readonly description: string;
};

export type EvidenceProcessorRegistration = {
  readonly metadata: EvidenceProcessorMetadata;
  readonly processor: EventProcessor;
};

/**
 * Product processor bundle — Evidence today; same shape for future S11–S13 bundles.
 * The platform registry never learns product identity.
 */
export type ProductProcessorBundle = {
  readonly bundleId: string;
  readonly product: string;
  readonly version: string;
  readonly registrations: readonly EvidenceProcessorRegistration[];
};

/** Injectable business side-effect port — processors decide WHAT; sink records action. */
export type EvidenceBusinessActionPort = {
  apply(input: {
    readonly processorId: string;
    readonly eventId: QepEvidencePlatformEventId;
    readonly evidenceId: string;
    readonly tenantId: string;
    readonly action: string;
    readonly payload: Readonly<Record<string, unknown>>;
    readonly correlationId?: string;
    readonly idempotencyKey: string;
  }): Promise<void> | void;
};

export type EvidenceBusinessActionRecord = {
  readonly processorId: string;
  readonly eventId: string;
  readonly evidenceId: string;
  readonly tenantId: string;
  readonly action: string;
  readonly idempotencyKey: string;
  readonly at: string;
};

export function createInMemoryEvidenceBusinessActionPort(
  now: () => string = () => new Date().toISOString(),
): EvidenceBusinessActionPort & {
  readonly applied: EvidenceBusinessActionRecord[];
  reset(): void;
} {
  const applied: EvidenceBusinessActionRecord[] = [];
  const seen = new Set<string>();
  return {
    applied,
    reset() {
      applied.length = 0;
      seen.clear();
    },
    async apply(input) {
      const key = `${input.processorId}:${input.idempotencyKey}`;
      if (seen.has(key)) return;
      seen.add(key);
      applied.push({
        processorId: input.processorId,
        eventId: input.eventId,
        evidenceId: input.evidenceId,
        tenantId: input.tenantId,
        action: input.action,
        idempotencyKey: input.idempotencyKey,
        at: now(),
      });
    },
  };
}
