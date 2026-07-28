import { TraceInvariantViolation } from "../../shared/errors";
import { TRACE_ORIGINS } from "./constants";

export type TraceOrigin = (typeof TRACE_ORIGINS)[number];

export function createTraceOrigin(value: string): TraceOrigin {
  const normalized = value.trim() as TraceOrigin;
  if (!(TRACE_ORIGINS as readonly string[]).includes(normalized)) {
    throw new TraceInvariantViolation(
      `Trace origin must be one of: ${TRACE_ORIGINS.join(", ")}`,
    );
  }
  return normalized;
}
