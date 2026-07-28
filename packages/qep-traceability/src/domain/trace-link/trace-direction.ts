import { TraceInvariantViolation } from "../../shared/errors";
import { TRACE_DIRECTIONS } from "./constants";

export type TraceDirection = (typeof TRACE_DIRECTIONS)[number];

export function createTraceDirection(value: string): TraceDirection {
  const normalized = value.trim() as TraceDirection;
  if (!(TRACE_DIRECTIONS as readonly string[]).includes(normalized)) {
    throw new TraceInvariantViolation(
      `Trace direction must be one of: ${TRACE_DIRECTIONS.join(", ")}`,
    );
  }
  return normalized;
}
