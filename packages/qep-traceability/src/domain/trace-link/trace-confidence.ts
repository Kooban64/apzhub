import { TraceInvariantViolation } from "../../shared/errors";
import { TRACE_CONFIDENCES } from "./constants";

export type TraceConfidence = (typeof TRACE_CONFIDENCES)[number];

export function createTraceConfidence(value: string): TraceConfidence {
  const normalized = value.trim() as TraceConfidence;
  if (!(TRACE_CONFIDENCES as readonly string[]).includes(normalized)) {
    throw new TraceInvariantViolation(
      `Trace confidence must be one of: ${TRACE_CONFIDENCES.join(", ")}`,
    );
  }
  return normalized;
}
