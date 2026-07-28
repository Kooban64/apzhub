import { TraceInvariantViolation } from "../../shared/errors";
import { TRACE_TYPES } from "./constants";

export type TraceType = (typeof TRACE_TYPES)[number];

export function createTraceType(value: string): TraceType {
  const normalized = value.trim() as TraceType;
  if (!(TRACE_TYPES as readonly string[]).includes(normalized)) {
    throw new TraceInvariantViolation(
      `Trace type must be one of: ${TRACE_TYPES.join(", ")}`,
    );
  }
  return normalized;
}
