import { TraceInvariantViolation } from "../../shared/errors";
import { TRACE_RATIONALE_MAX_LENGTH } from "./constants";

export type TraceRationale = string & { readonly __brand: "TraceRationale" };

export function createTraceRationale(value: string): TraceRationale {
  const normalized = value.trim();
  if (!normalized) {
    throw new TraceInvariantViolation("Trace rationale must not be empty when provided");
  }
  if (normalized.length > TRACE_RATIONALE_MAX_LENGTH) {
    throw new TraceInvariantViolation(
      `Trace rationale must not exceed ${TRACE_RATIONALE_MAX_LENGTH} characters`,
    );
  }
  return normalized as TraceRationale;
}
