import { TraceInvariantViolation } from "../../shared/errors";
import { TRACE_STRENGTHS } from "./constants";

export type TraceStrength = (typeof TRACE_STRENGTHS)[number];

export function createTraceStrength(value: string): TraceStrength {
  const normalized = value.trim() as TraceStrength;
  if (!(TRACE_STRENGTHS as readonly string[]).includes(normalized)) {
    throw new TraceInvariantViolation(
      `Trace strength must be one of: ${TRACE_STRENGTHS.join(", ")}`,
    );
  }
  return normalized;
}
