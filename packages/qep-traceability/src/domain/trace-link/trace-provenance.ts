import { TraceInvariantViolation } from "../../shared/errors";

/**
 * Evidence of origin for a Trace Link (ARCH-007).
 * Required — actor and correlationId always present.
 */
export type TraceProvenance = {
  readonly actorId: string;
  readonly correlationId: string;
  readonly sourceSystem?: string;
  readonly importBatchId?: string;
  readonly rationaleRef?: string;
};

export function createTraceProvenance(input: {
  readonly actorId: string;
  readonly correlationId: string;
  readonly sourceSystem?: string;
  readonly importBatchId?: string;
  readonly rationaleRef?: string;
}): TraceProvenance {
  const actorId = input.actorId.trim();
  const correlationId = input.correlationId.trim();
  if (!actorId || !correlationId) {
    throw new TraceInvariantViolation(
      "Trace provenance requires actorId and correlationId",
    );
  }
  return {
    actorId,
    correlationId,
    sourceSystem: input.sourceSystem?.trim() || undefined,
    importBatchId: input.importBatchId?.trim() || undefined,
    rationaleRef: input.rationaleRef?.trim() || undefined,
  };
}
