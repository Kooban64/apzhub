import { TraceInvariantViolation } from "../../shared/errors";

declare const traceIdBrand: unique symbol;

/** Trace Link identity — `trl_*` (ARCH-007 §4.3). */
export type TraceId = string & {
  readonly [traceIdBrand]: "TraceId";
};

export function createTraceId(value: string): TraceId {
  const normalized = value.trim();
  if (!/^trl_[A-Za-z0-9_-]+$/.test(normalized)) {
    throw new TraceInvariantViolation("Trace id must start with trl_");
  }
  return normalized as TraceId;
}
