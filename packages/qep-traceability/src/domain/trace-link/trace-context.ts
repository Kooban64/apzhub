import { TraceInvariantViolation } from "../../shared/errors";

/**
 * Explicit Baseline / Content Version viewing context for a Trace Link.
 * Distinct from endpoint pins — describes the analytical/binding context.
 */
export type TraceContext = {
  readonly baselineId?: string;
  readonly contentVersionId?: string;
  readonly immutable: boolean;
};

export function createTraceContext(input?: {
  readonly baselineId?: string;
  readonly contentVersionId?: string;
  readonly immutable?: boolean;
}): TraceContext {
  const baselineId = input?.baselineId?.trim() || undefined;
  const contentVersionId = input?.contentVersionId?.trim() || undefined;
  if (baselineId && !/^rbl_[A-Za-z0-9_-]+$/.test(baselineId)) {
    throw new TraceInvariantViolation("Trace context baselineId must start with rbl_");
  }
  if (contentVersionId && !/^rcv_[A-Za-z0-9_-]+$/.test(contentVersionId)) {
    throw new TraceInvariantViolation("Trace context contentVersionId must start with rcv_");
  }
  const immutable = input?.immutable === true || Boolean(baselineId);
  return { baselineId, contentVersionId, immutable };
}
